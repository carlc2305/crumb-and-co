import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

function OrderConfirmation() {
  const { cart, cartTotal } = useCart();
  const location = useLocation();

  const { firstName, lastName, email, collectionDate, collectionTime } =
    location.state || {};

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

  return (
    <main className="order-confirmation-page">
      <div className="order-confirmation-container">
        <div className="confirmation-icon">✓</div>

        <h1>Order Confirmed!</h1>

        <p className="confirmation-message">
          Thank you for your order, {firstName || "there"}!
        </p>

        <p className="confirmation-email">
          We'll send your order details to{" "}
          <strong>{email || "your email address"}</strong>.
        </p>

        <section className="confirmation-section">
          <h2>Collection Details</h2>

          <div className="confirmation-details">
            <div>
              <strong>Name</strong>
              <span>
                {firstName} {lastName}
              </span>
            </div>

            <div>
              <strong>Date</strong>
              <span>{formatDate(collectionDate)}</span>
            </div>

            <div>
              <strong>Time</strong>
              <span>{formatTime(collectionTime)}</span>
            </div>
          </div>
        </section>

        <section className="confirmation-section">
          <h2>Your Order</h2>

          {cart.map((item) => (
            <div className="confirmation-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>Qty: {item.quantity}</span>
              </div>

              <span>£{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="confirmation-total">
            <span>Total</span>
            <strong>£{cartTotal.toFixed(2)}</strong>
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
