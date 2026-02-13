import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarLinks = [
    { path: '/student/dashboard', label: 'Dashboard' },
    { path: '/student/apply', label: 'Apply OD' },
    { path: '/student/history', label: 'OD History' }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} onLogout={handleLogout} />
      <div className="dashboard-content">
        <h1>Welcome, {user?.name}</h1>
        <div className="dashboard-cards">
          <div className="card" onClick={() => navigate('/student/apply')}>
            <h3>Apply for OD</h3>
            <p>Submit a new OD request</p>
          </div>
          <div className="card" onClick={() => navigate('/student/history')}>
            <h3>OD History</h3>
            <p>View your OD applications</p>
          </div>
        </div>
        <div className="info-section">
          <h2>Student Information</h2>
          <p><strong>Roll Number:</strong> {user?.rollNumber}</p>
          <p><strong>Department:</strong> {user?.department}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
