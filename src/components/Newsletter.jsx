function Newsletter() {
  return (
    <section className="newsletter">
      <div className="newsletter-content">
        <h2>Keep in the Loop 🧁</h2>

        <p>
          Sign up for our newsletter to hear about new treats, special offers,
          and upcoming availability.
        </p>

        <form className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email address"
            aria-label="Email address"
          />

          <button type="submit">Sign Up</button>
        </form>

        <small>
          By signing up, you agree to receive emails from Crumb & Co.
        </small>
      </div>
    </section>
  );
}

export default Newsletter;
