import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import "../App.css";

const HomePage = () => {
  return (
    <div className="home-container">
      <nav className="sidebar">
        <h2 className="sidebar-title">Dashboard</h2>
        <ul className="nav-list">
          <li><Link to="/home">🏠 Home</Link></li>
          <li><Link to="/home/imagesearch">📷 Image Search</Link></li>
          <li><Link to="/home/audiosearch">🎵 Audio Search </Link></li>
          <li><Link to="/home/recentsearches">📁 Recent Searches</Link></li>
          <li><Link to="/">🚪 Logout</Link></li>
        </ul>
      </nav>

      <main className="home-content">
        {/* This is where nested routes will render */}
        <Outlet />
      </main>
    </div>
  );
};

export default HomePage;
