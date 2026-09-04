function Categories() {
  const categories = [
    "Brownies",
    "Cookies",
    "Cakes",
    "Cupcakes",
    "Treat Boxes",
    "Custom Orders",
  ];

  return (
    <section className="categories">
      <h2>Shop Our Treats</h2>

      <div className="category-grid">
        {categories.map((category) => (
          <button className="category-card" key={category}>
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}

export default Categories;
