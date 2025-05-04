// HomePage.js
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import "../App.css";

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <div className="home-container">
      <nav className="sidebar">
        <h2 className="sidebar-title">Dashboard</h2>
        <ul className="nav-list">
          <li><Link to="/home">🏠 Home</Link></li>
          <li><Link to="/home/imagesearch">📷 Image Search</Link></li>
          <li><Link to="/home/audiosearch">🎵 Audio Search </Link></li>
          <li><Link to="/home/recentsearches">📁 Recent Searches</Link></li>
          <li><button onClick={handleLogout} className="logout-button">🚪 Logout</button></li>
        </ul>
      </nav>

      <main className="home-content">
        <Outlet />
      </main>
    </div>
  );
};

export default HomePage;