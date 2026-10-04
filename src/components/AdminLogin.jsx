import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setError("");

    try {
      const response = await fetch("http://localhost:4242/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Incorrect username or password.");
        return;
      }

      sessionStorage.setItem("crumbCoAdminToken", data.token);

      navigate("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
      setError("Unable to connect to the server. Please try again.");
    }
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
