import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <i data-lucide="lotus" width="32" height="32"></i>
          <span className="logo-text">YogGuru</span>
        </Link>
        <Link to="/about">
          <button className="btn btn-secondary">About</button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
