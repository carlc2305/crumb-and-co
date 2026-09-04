import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <span>Product Image</span>
        )}
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>

        <h3>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        <p className="product-description">{product.description}</p>

        <div className="product-bottom">
          <span className="product-price">£{product.price.toFixed(2)}</span>

          <button className="add-to-cart">Add to Cart</button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
