import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

function Sidebar({ proofCount = 0 }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { path: '/student/dashboard',    label: 'Dashboard' },
    { path: '/student/apply-od',     label: 'Apply OD' },
    { path: '/student/od-history',   label: 'OD History' },
    { path: '/student/upload-proof', label: 'Upload Proof', badge: proofCount },
    { path: '/student/profile',      label: 'Profile' }
  ];

  const facultyLinks = [
    { path: '/faculty/dashboard',         label: 'Dashboard' },
    { path: '/faculty/od-requests',       label: 'OD Requests' },
    ...(user?.role === 'ClassAdvisor' ? [{ path: '/faculty/proof-submissions', label: 'Proof Submissions' }] : []),
    { path: '/faculty/profile',           label: 'Profile' }
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/profile',   label: 'Profile' }
  ];

  const links = user?.role === 'Student' ? studentLinks
              : user?.role === 'Admin'   ? adminLinks
              : facultyLinks;

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || '?';
  const profilePhotoUrl = user?.profilePhoto
    ? `http://localhost:5000/${user.profilePhoto.replace(/\\/g, '/')}`
    : null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <p className="sidebar-college">Sri Eshwar College of Engineering</p>
        <h2>Digital OD System</h2>
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">
            {profilePhotoUrl
              ? <img src={profilePhotoUrl} alt={user?.name} />
              : avatarLetter
            }
          </div>
          <p>{user?.name}</p>
          <span className="role-badge">{user?.role}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={location.pathname === link.path ? 'active' : ''}
          >
            {link.label}
            {link.badge > 0 && <span className="sidebar-badge">{link.badge}</span>}
          </Link>
        ))}
      </nav>

      <button onClick={handleLogout} className="logout-btn">
        Sign Out
      </button>
    </div>
  );
}

export default Sidebar;
