import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAvailability } from "../context/AvailabilityContext";
import { useOrders } from "../context/OrderContext";

function Checkout() {
  const { cart, cartTotal } = useCart();
  const { unavailableDates, minimumOrderDate } = useAvailability();
  const { createOrder } = useOrders();
  const navigate = useNavigate();

  const [fulfilment, setFulfilment] = useState("collection");
  const [collectionTime, setCollectionTime] = useState("");
  const [collectionDate, setCollectionDate] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const collectionTimes = [
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
  ];

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <h1>Your Cart Is Empty</h1>

          <p>Add some treats to your cart before checking out.</p>

          <Link to="/shop" className="checkout-shop-button">
            Browse Our Treats
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <form
          id="checkout-form"
          className="checkout-form"
          onSubmit={(event) => {
            event.preventDefault();

            if (!collectionDate) {
              alert("Please select a collection date.");
              return;
            }

            if (!collectionTime) {
              alert("Please select a collection time.");
              return;
            }

            const order = createOrder({
              customer: {
                firstName,
                lastName,
                email,
                phone,
              },
              fulfilment,
              collectionDate,
              collectionTime,
              items: cart,
              total: cartTotal,
              notes,
            });

            navigate("/order-review", {
              state: {
                orderId: order.id,
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
          <h1>Checkout</h1>

          <div className="checkout-section">
            <h2>Your Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first-name">First Name</label>

                <input
                  id="first-name"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last-name">Last Name</label>

                <input
                  id="last-name"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>

              <input
                id="phone"
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="checkout-section">
            <h2>How Would You Like Your Order?</h2>

            <div className="fulfilment-options">
              <label
                className={`fulfilment-option ${
                  fulfilment === "collection" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="fulfilment"
                  value="collection"
                  checked={fulfilment === "collection"}
                  onChange={() => setFulfilment("collection")}
                />

                <div>
                  <strong>Collection</strong>
                  <span>Collect your order from Crumb & Co.</span>
                </div>
              </label>

              <label
                className={`fulfilment-option ${
                  fulfilment === "delivery" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="fulfilment"
                  value="delivery"
                  disabled
                />

                <div>
                  <strong>Delivery — Coming Soon</strong>
                  <span>We're currently offering collection only.</span>
                </div>
              </label>
            </div>
          </div>

          {fulfilment === "collection" && (
            <div className="checkout-section">
              <h2>Collection Details</h2>

              <div className="form-group">
                <label htmlFor="collection-date">Collection Date</label>

                <input
                  id="collection-date"
                  type="date"
                  min={minimumOrderDate}
                  value={collectionDate}
                  required
                  onChange={(event) => {
                    const selectedDate = event.target.value;

                    if (unavailableDates.includes(selectedDate)) {
                      alert(
                        "Sorry, collection is not available on this date. Please choose another date.",
                      );

                      setCollectionDate("");
                      return;
                    }

                    setCollectionDate(selectedDate);
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="collection-time">Collection Time</label>

                <select
                  id="collection-time"
                  value={collectionTime}
                  required
                  onChange={(event) => setCollectionTime(event.target.value)}
                >
                  <option value="">Select a time</option>

                  {collectionTimes.map((time) => {
                    const [hours, minutes] = time.split(":");
                    const hour = Number(hours);

                    const displayTime =
                      hour === 0
                        ? `12:${minutes} AM`
                        : hour < 12
                          ? `${hour}:${minutes} AM`
                          : hour === 12
                            ? `12:${minutes} PM`
                            : `${hour - 12}:${minutes} PM`;

                    return (
                      <option key={time} value={time}>
                        {displayTime}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}

          {fulfilment === "delivery" && (
            <div className="checkout-section">
              <h2>Delivery Address</h2>

              <div className="form-group">
                <label htmlFor="address">Address</label>

                <input
                  id="address"
                  type="text"
                  placeholder="House number and street"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="town">Town / City</label>

                  <input id="town" type="text" placeholder="Town / City" />
                </div>

                <div className="form-group">
                  <label htmlFor="postcode">Postcode</label>

                  <input id="postcode" type="text" placeholder="Postcode" />
                </div>
              </div>
            </div>
          )}

          <div className="checkout-section">
            <h2>Order Notes</h2>

            <div className="form-group">
              <label htmlFor="notes">Anything we should know?</label>

              <textarea
                id="notes"
                rows="4"
                placeholder="Allergies, special requests, etc."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </div>
        </form>

        <aside className="checkout-summary">
          <h2>Your Order</h2>

          {cart.map((item) => (
            <div className="checkout-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>

                <span>Qty: {item.quantity}</span>
              </div>

              <span>£{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="checkout-total">
            <span>Total</span>
            <span>£{cartTotal.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            form="checkout-form"
            className="place-order-button"
          >
            Place Order
          </button>

          <p className="payment-note">
            Payment will be handled securely at the next stage.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
