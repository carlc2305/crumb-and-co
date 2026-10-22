import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

function OrderConfirmation() {
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    async function fetchOrder() {
      if (!sessionId) {
        setError("No Stripe payment session was found.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://crumb-and-co-backend.onrender.com/api/order-confirmation?session_id=${encodeURIComponent(
            sessionId,
          )}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load your order.");
        }

        setOrder(data.order);
      } catch (error) {
        console.error("Order confirmation error:", error);
        setError("Unable to load your order details.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [sessionId]);

  function formatDate(date) {
    if (!date) return "Not selected";

    const [year, month, day] = date.split("-");

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    ).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(time) {
    if (!time) return "Not selected";

    const [hours, minutes] = time.split(":");
    const hour = Number(hours);

    if (hour === 0) {
      return `12:${minutes} AM`;
    }

    if (hour < 12) {
      return `${hour}:${minutes} AM`;
    }

    if (hour === 12) {
      return `12:${minutes} PM`;
    }

    return `${hour - 12}:${minutes} PM`;
  }

  if (loading) {
    return (
      <main className="order-confirmation-page">
        <div className="order-confirmation-container">
          <h1>Loading your order...</h1>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-confirmation-page">
        <div className="order-confirmation-container">
          <h1>Order Confirmation</h1>

          <p className="confirmation-message">
            {error || "Unable to load your order."}
          </p>

          <div className="confirmation-actions">
            <Link to="/" className="confirmation-home-button">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="order-confirmation-page">
      <div className="order-confirmation-container">
        <div className="confirmation-icon">✓</div>

        <h1>Order Confirmed!</h1>

        <p className="confirmation-message">
          Thank you for your order, {order.first_name || "there"}!
        </p>

        <p className="confirmation-email">
          We'll send your order details to <strong>{order.email}</strong>.
        </p>

        <section className="confirmation-section">
          <h2>Collection Details</h2>

          <div className="confirmation-details">
            <div>
              <strong>Name</strong>
              <span>
                {order.first_name} {order.last_name}
              </span>
            </div>

            <div>
              <strong>Date</strong>
              <span>{formatDate(order.collection_date)}</span>
            </div>

            <div>
              <strong>Time</strong>
              <span>{formatTime(order.collection_time)}</span>
            </div>
          </div>
        </section>

        <section className="confirmation-section">
          <h2>Your Order</h2>

          {order.items.map((item) => (
            <div className="confirmation-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>Qty: {item.quantity}</span>
              </div>

              <span>
                £{(Number(item.price) * Number(item.quantity)).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="confirmation-total">
            <span>Total</span>
            <strong>£{Number(order.total).toFixed(2)}</strong>
          </div>
        </section>

        <div className="confirmation-actions">
          <Link to="/" className="confirmation-home-button">
            Back to Home
          </Link>

          <Link to="/shop" className="confirmation-shop-button">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default OrderConfirmation;
