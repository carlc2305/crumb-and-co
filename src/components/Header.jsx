import { Link } from "react-router-dom";
import logo from "../assets/images/logo.jpg";

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" aria-label="Open menu">
          ☰
        </button>
      </div>

      <a href="/" className="logo-link">
        <img src={logo} alt="Crumb & Co" className="logo" />
      </a>

      <div className="header-right">
        <Link to="/cart" className="header-icon" aria-label="Shopping cart">
          🛒
        </Link>

        <button className="header-icon" aria-label="Account">
          👤
        </button>
      </div>
    </header>
  );
}

export default Header;
