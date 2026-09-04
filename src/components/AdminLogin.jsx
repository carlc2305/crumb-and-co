import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    if (username === "admin" && password === "crumbco") {
      sessionStorage.setItem("crumbCoAdmin", "true");
      navigate("/admin");
      return;
    }

    setError("Incorrect username or password.");
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-container">
        <h1>Admin Login</h1>

        <p>Sign in to manage Crumb & Co.</p>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-username">Username</label>

            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>

            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <p className="admin-login-error">{error}</p>}

          <button type="submit" className="admin-login-button">
            Login
          </button>
        </form>
      </div>
    </main>
  );
}

export default AdminLogin;
