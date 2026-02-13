import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/Navbar.css'

function Navbar({ user, onLogout }) {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>OD Management System</h2>
      </div>
      
      <div className="nav-links">
        <Link 
          to="/dashboard" 
          className={location.pathname === '/dashboard' ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link 
          to="/apply-od" 
          className={location.pathname === '/apply-od' ? 'active' : ''}
        >
          Apply OD
        </Link>
        <Link 
          to="/od-history" 
          className={location.pathname === '/od-history' ? 'active' : ''}
        >
          OD History
        </Link>
      </div>
      
      <div className="nav-user">
        <span>Welcome, {user.name}</span>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  )
}

export default Navbar