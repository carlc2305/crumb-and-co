import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } =
    useCart();

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <h1>Your Cart</h1>
          <p>Your cart is currently empty.</p>

          <Link to="/shop" className="cart-shop-button">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-content">
        <section className="cart-items">
          {cart.map((item) => (
            <article className="cart-item" key={item.id}>
              <div className="cart-item-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <span>Product Image</span>
                )}
              </div>

              <div className="cart-item-info">
                <p className="product-category">{item.category}</p>

                <h2>{item.name}</h2>

                <p>£{item.price.toFixed(2)} each</p>

                <div className="cart-quantity">
                  <label htmlFor={`quantity-${item.id}`}>Quantity</label>

                  <input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.id, Number(event.target.value))
                    }
                  />
                </div>

                <button
                  className="remove-item"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>

              <div className="cart-item-total">
                £{(item.price * item.quantity).toFixed(2)}
              </div>
            </article>
          ))}
        </section>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>£{cartTotal.toFixed(2)}</span>
          </div>

          <div className="cart-summary-row">
            <span>Delivery</span>
            <span>To be confirmed</span>
          </div>

          <div className="cart-summary-total">
            <span>Total</span>
            <span>£{cartTotal.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="checkout-button">
            Proceed to Checkout
          </Link>

          <button className="clear-cart" onClick={clearCart}>
            Clear Cart
          </button>

          <Link to="/shop" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default Cart;
