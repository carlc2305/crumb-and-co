import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Payment() {
  const { cart, cartTotal } = useCart();

  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, email, phone, collectionDate, collectionTime } =
    location.state || {};

  if (cart.length === 0) {
    return (
      <main className="payment-page">
        <div className="payment-container">
          <h1>Your Cart Is Empty</h1>

          <p>Add some treats before continuing to payment.</p>

          <Link to="/shop" className="checkout-shop-button">
            Browse Our Treats
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="payment-page">
      <div className="payment-container">
        <h1>Payment</h1>

        <p>Complete your payment securely to place your order.</p>

        <section className="payment-section">
          <h2>Order Total</h2>

          <div className="payment-total">
            <span>Total</span>
            <strong>£{cartTotal.toFixed(2)}</strong>
          </div>
        </section>

        <section className="payment-section">
          <h2>Payment Method</h2>

          <div className="payment-placeholder">
            <span>💳</span>

            <div>
              <strong>Secure Card Payment</strong>
              <p>Card payment will be securely handled by Stripe.</p>
            </div>
          </div>
        </section>

        <div className="payment-actions">
          <Link to="/order-review" className="back-to-review">
            ← Back to Review
          </Link>

          <button
            className="pay-button"
            onClick={() => {
              navigate("/order-confirmation", {
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
            Pay £{cartTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </main>
  );
}

export default Payment;
