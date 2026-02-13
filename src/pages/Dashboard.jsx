import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../styles/Dashboard.css'

function Dashboard({ user, onLogout }) {
  return (
    <div className="dashboard">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome, {user.name}!</h1>
          <p>Roll No: {user.rollNo}</p>
        </div>

        <div className="dashboard-cards">
          <Link to="/apply-od" className="dashboard-card">
            <div className="card-icon">📝</div>
            <h3>Apply OD</h3>
            <p>Submit a new OD application</p>
          </Link>

          <Link to="/od-history" className="dashboard-card">
            <div className="card-icon">📋</div>
            <h3>OD History</h3>
            <p>View your OD applications</p>
          </Link>

        </div>
      </div>
    </div>
  )
}

export default Dashboard