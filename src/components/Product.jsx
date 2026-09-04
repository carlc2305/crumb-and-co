import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import products from "../data/products";
import { useState } from "react";

function Product() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);

  const product = products.find((product) => product.id === Number(id));

  if (!product) {
    return (
      <main className="product-page">
        <h1>Product not found</h1>
        <Link to="/shop">Back to Shop</Link>
      </main>
    );
  }

  return (
    <main className="product-page">
      <div className="product-detail">
        <div className="product-detail-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <span>Product Image</span>
          )}
        </div>

        <div className="product-detail-info">
          <p className="product-category">{product.category}</p>

          <h1>{product.name}</h1>

          <p className="product-detail-price">£{product.price.toFixed(2)}</p>

          <p className="product-detail-description">{product.description}</p>

          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity</label>

            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>

          <button
            className="product-add-button"
            onClick={() => addToCart(product, quantity)}
          >
            Add to Cart
          </button>

          <Link to="/shop" className="back-to-shop">
            ← Back to Shop
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Product;
