import products from "../data/products";
import ProductCard from "./ProductCard";

function Shop() {
  return (
    <main className="shop">
      <section className="shop-header">
        <h1>Shop Our Treats</h1>

        <p>Browse our homemade treats, baked fresh with love.</p>
      </section>

      <section className="products">
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Shop;
