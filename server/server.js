import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import Stripe from "stripe";
import products from "./products.js";

const app = express();
const PORT = process.env.PORT || 4242;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      console.error(
        "Stripe webhook signature verification failed:",
        error.message,
      );

      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;

          const orderId = session.metadata?.orderId;

          if (!orderId) {
            console.error("Stripe session is missing orderId metadata.");
            break;
          }

          if (session.payment_status !== "paid") {
            console.log(
              `Stripe checkout completed for order ${orderId}, but payment status is ${session.payment_status}.`,
            );
            break;
          }

          console.log(`Stripe payment completed for order ${orderId}`);

          await pool.query(
            `
      UPDATE orders
      SET payment_status = 'Paid'
      WHERE id = $1;
    `,
            [orderId],
          );

          break;
        }

        default:
          console.log(`Unhandled Stripe event: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook processing error:", error);

      res.status(500).json({
        error: "Webhook processing failed.",
      });
    }
  },
);

app.use(express.json());

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required.",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired authentication token.",
    });
  }
}

function formatOrder(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    customer: {
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
    },
    fulfilment: row.fulfilment,
    collectionDate: row.collection_date,
    collectionTime: row.collection_time,
    items: row.items,
    total: Number(row.total),
    status: row.status,
    paymentStatus: row.payment_status,
    notes: row.notes,
  };
}

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Crumb & Co server is running!",
  });
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      error: "Incorrect username or password.",
    });
  }

  const token = jwt.sign(
    {
      role: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
    },
  );

  res.json({
    message: "Login successful.",
    token,
  });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully!",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      message: "Database connection failed.",
    });
  }
});

// CREATE STRIPE CHECKOUT SESSION
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: "Order ID is required.",
      });
    }

    const result = await pool.query(
      `
        SELECT *
        FROM orders
        WHERE id = $1;
      `,
      [orderId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found.",
      });
    }

    app.get("/api/order-confirmation", async (req, res) => {
      try {
        const { session_id } = req.query;

        if (!session_id) {
          return res.status(400).json({
            error: "Stripe session ID is required.",
          });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        const orderId = session.metadata?.orderId;

        if (!orderId) {
          return res.status(400).json({
            error: "Order ID not found in Stripe session.",
          });
        }

        const result = await pool.query(
          `
        SELECT *
        FROM orders
        WHERE id = $1;
      `,
          [orderId],
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            error: "Order not found.",
          });
        }

        const order = result.rows[0];

        res.json({
          order,
          paymentStatus: order.payment_status,
        });
      } catch (error) {
        console.error("Order confirmation error:", error);

        res.status(500).json({
          error: "Unable to retrieve order confirmation.",
        });
      }
    });

    const order = result.rows[0];

    if (order.status === "Cancelled") {
      return res.status(400).json({
        error: "This order has been cancelled.",
      });
    }

    const items = Array.isArray(order.items) ? order.items : [];

    if (items.length === 0) {
      return res.status(400).json({
        error: "Order contains no items.",
      });
    }

    const lineItems = items.map((item) => {
      const product = products.find(
        (product) => product.id === Number(item.id),
      );

      if (!product) {
        throw new Error(`Product ${item.id} not found.`);
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(`Invalid quantity for product ${item.id}.`);
      }

      return {
        price_data: {
          currency: "gbp",
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: lineItems,

      customer_email: order.email,

      metadata: {
        orderId: order.id,
      },

      payment_intent_data: {
        metadata: {
          orderId: order.id,
        },
      },

      success_url:
        `${process.env.FRONTEND_URL}/order-confirmation` +
        `?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.FRONTEND_URL}/payment?orderId=${encodeURIComponent(
        order.id,
      )}`,
    });

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Create Stripe Checkout Session error:", error);

    res.status(500).json({
      error: "Unable to create Stripe Checkout Session.",
    });
  }
});

// CREATE ORDER
// POST /api/orders
app.post("/api/orders", async (req, res) => {
  try {
    const {
      customer,
      fulfilment,
      collectionDate,
      collectionTime,
      items,
      notes,
    } = req.body;

    if (
      !customer ||
      !customer.firstName ||
      !customer.lastName ||
      !customer.email ||
      !customer.phone ||
      !fulfilment ||
      !collectionDate ||
      !collectionTime ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: "Missing required order information.",
      });
    }

    const validatedItems = items.map((item) => {
      const product = products.find(
        (product) => product.id === Number(item.id),
      );

      if (!product) {
        throw new Error(`Product ${item.id} not found.`);
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(`Invalid quantity for product ${item.id}.`);
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity,
      };
    });

    const calculatedTotal = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const orderId = `CC-${Date.now()}`;

    const result = await pool.query(
      `
        INSERT INTO orders (
          id,
          first_name,
          last_name,
          email,
          phone,
          fulfilment,
          collection_date,
          collection_time,
          items,
          total,
          status,
          notes
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          'Pending',
          $11
        )
        RETURNING *;
      `,
      [
        orderId,
        customer.firstName,
        customer.lastName,
        customer.email,
        customer.phone,
        fulfilment,
        collectionDate,
        collectionTime,
        JSON.stringify(validatedItems),
        calculatedTotal,
        notes || null,
      ],
    );

    res.status(201).json(formatOrder(result.rows[0]));
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      error: "Failed to create order.",
    });
  }
});

// GET ALL ORDERS
// GET /api/orders
app.get("/api/orders", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM orders
      ORDER BY created_at DESC;
    `);

    const orders = result.rows.map(formatOrder);

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      error: "Failed to retrieve orders.",
    });
  }
});

// GET ONE ORDER
// GET /api/orders/:id
app.get("/api/orders/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        SELECT *
        FROM orders
        WHERE id = $1;
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found.",
      });
    }

    res.json(formatOrder(result.rows[0]));
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      error: "Failed to retrieve order.",
    });
  }
});

// UPDATE ORDER STATUS
// PATCH /api/orders/:id/status
app.patch("/api/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Completed", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid order status.",
      });
    }

    const result = await pool.query(
      `
        UPDATE orders
        SET status = $1
        WHERE id = $2
        RETURNING *;
      `,
      [status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found.",
      });
    }

    res.json(formatOrder(result.rows[0]));
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      error: "Failed to update order status.",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
