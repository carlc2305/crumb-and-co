import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function OrderReview() {
  const { cart, cartTotal } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, email, phone, collectionDate, collectionTime } =
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
    <main className="order-review-page">
      <div className="order-review-container">
        <h1>Review Your Order</h1>

        <p>Please check your details before continuing to payment.</p>

        <section className="review-section">
          <h2>Your Details</h2>

          <div className="review-details">
            <div>
              <strong>Name</strong>
              <span>
                {firstName} {lastName}
              </span>
            </div>

            <div>
              <strong>Email</strong>
              <span>{email}</span>
            </div>

            <div>
              <strong>Phone</strong>
              <span>{phone}</span>
            </div>
          </div>
        </section>

        <section className="review-section">
          <h2>Collection Details</h2>

          <div className="review-details">
            <div>
              <strong>Collection Date</strong>
              <span>{formatDate(collectionDate)}</span>
            </div>

            <div>
              <strong>Collection Time</strong>
              <span>{formatTime(collectionTime)}</span>
            </div>
          </div>
        </section>

        <section className="review-section">
          <h2>Your Items</h2>

          {cart.map((item) => (
            <div className="review-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>Qty: {item.quantity}</span>
              </div>

              <span>£{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </section>

        <div className="review-total">
          <span>Total</span>
          <strong>£{cartTotal.toFixed(2)}</strong>
        </div>

        <div className="review-actions">
          <Link to="/checkout" className="back-to-checkout">
            ← Back to Checkout
          </Link>

          <button
            className="continue-payment-button"
            onClick={() => {
              navigate("/payment", {
                state: {
                  firstName,
                  lastName,
                  email,
                  phone,
                  collectionDate,
                  collectionTime,
                },
              });
            }}
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </main>
  );
}

export default OrderReview;
