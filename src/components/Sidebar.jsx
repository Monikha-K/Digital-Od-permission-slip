import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = ({ links, onLogout }) => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-links">
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button className="logout-btn" onClick={onLogout}>Logout</button>
    </div>
  );
};

export default Sidebar;
