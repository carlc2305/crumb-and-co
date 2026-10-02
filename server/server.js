import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

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
    notes: row.notes,
  };
}

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Crumb & Co server is running!",
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
      total,
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
      items.length === 0 ||
      total === undefined
    ) {
      return res.status(400).json({
        error: "Missing required order information.",
      });
    }

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
        JSON.stringify(items),
        total,
        notes || null,
      ]
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
app.get("/api/orders", async (req, res) => {
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
app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        SELECT *
        FROM orders
        WHERE id = $1;
      `,
      [id]
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
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Completed",
      "Cancelled",
    ];

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
      [status, id]
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