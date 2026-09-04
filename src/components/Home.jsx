import Categories from "./Catergories.jsx";
import Newsletter from "./Newsletter.jsx";
import Footer from "./Footer.jsx";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Freshly Baked, Homemade Goodness</h1>

          <p>
            Delicious homemade treats, baked with love and made for every
            occasion.
          </p>

          <Link to="/shop" className="primary-button">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="promotions">
        <h2>What's Baking?</h2>

        <div className="promotion-grid">
          <div className="promotion-card">
            <div className="image-placeholder">Product Image</div>
            <h3>Featured Box</h3>
            <p>Discover one of our favourite treat boxes.</p>
            <button>View Box</button>
          </div>

          <div className="promotion-card">
            <div className="image-placeholder">Product Image</div>
            <h3>Something Sweet</h3>
            <p>Freshly baked goodies made to order.</p>
            <button>View Products</button>
          </div>

          <div className="promotion-card">
            <div className="image-placeholder">Product Image</div>
            <h3>Customer Favourite</h3>
            <p>One of the treats our customers love.</p>
            <button>View Box</button>
          </div>

          <div className="promotion-card">
            <div className="image-placeholder">Product Image</div>
            <h3>Coming Soon</h3>
            <p>Keep an eye out for our latest creations.</p>
            <button>Find Out More</button>
          </div>
        </div>
      </section>

      <Categories />

      <Newsletter />

      <Footer />
    </main>
  );
}

export default Home;
