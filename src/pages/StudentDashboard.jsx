import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { odAPI, advisorAPI } from '../services/apiService';
import '../styles/StudentDashboard.css';

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [proofPending, setProofPending] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [odRes, warnRes] = await Promise.all([
        odAPI.getMyRequests(),
        advisorAPI.getMyWarnings()
      ]);
      const data = odRes.data;
      const approved = data.filter(r => r.finalStatus === 'Approved').length;
      const pending  = data.filter(r => r.finalStatus === 'Pending').length;
      const rejected = data.filter(r => r.finalStatus === 'Rejected').length;
      setStats({ total: data.length, approved, pending, rejected });
      setRecentRequests(data.slice(0, 5));
      const today = new Date(); today.setHours(0,0,0,0);
      setProofPending(data.filter(r => r.finalStatus === 'Approved' && new Date(r.toDate) < today && !r.documents?.geoTagPhotoPath));
      setWarnings(warnRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const remaining = 10 - stats.approved;
  const usedPct   = Math.min((stats.approved / 10) * 100, 100);

  const alertType = remaining <= 0 ? 'danger' : remaining <= 2 ? 'warning' : 'info';
  const alertMsg  = remaining <= 0
    ? '🚫 You have reached the maximum OD limit of 10.'
    : remaining <= 2
    ? `⚠️ Only ${remaining} OD${remaining > 1 ? 's' : ''} remaining out of your 10 OD limit!`
    : `ℹ️ You have used ${stats.approved} out of 10 ODs. ${remaining} remaining.`;

  const statCards = [
    { label: 'Total',    value: stats.total,    color: '#6366f1', bg: '#eef2ff', icon: '📁' },
    { label: 'Approved', value: stats.approved, color: '#10b981', bg: '#ecfdf5', icon: '✅' },
    { label: 'Pending',  value: stats.pending,  color: '#f59e0b', bg: '#fffbeb', icon: '⏳' },
    { label: 'Rejected', value: stats.rejected, color: '#ef4444', bg: '#fef2f2', icon: '❌' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar proofCount={proofPending.length} />
      <div className="main-content std-dashboard">

        {/* Hero */}
        <div className="std-hero">
          <div className="std-hero-left">
            <span className="std-hero-icon">🎓</span>
            <div>
              <p className="std-greeting">Welcome back,</p>
              <h1 className="std-name">{user?.name}</h1>
              <div className="std-meta">
                <span className="std-meta-item">🎫 {user?.rollNumber}</span>
                <span className="std-meta-item">📍 {user?.department}</span>
                <span className="std-meta-item">📅 Year {user?.year}</span>
              </div>
            </div>
          </div>
          <div className="std-od-meter">
            <div className="std-od-ring-wrap">
              <svg viewBox="0 0 80 80" className="std-od-ring">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="white" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - usedPct / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="std-od-ring-label">
                <span className="std-od-used">{stats.approved}</span>
                <span className="std-od-total">/10</span>
              </div>
            </div>
            <p className="std-od-caption">ODs Used</p>
          </div>
        </div>

        {/* Blocked alert */}
        {user?.isBlocked && (
          <div className="std-alert std-alert-danger" style={{ fontSize: '15px', fontWeight: 700 }}>
            🚫 Your account has been blocked by the admin. You cannot apply for OD. Please contact your Class Advisor or Admin.
          </div>
        )}

        {/* OD Limit Alert */}
        <div className={`std-alert std-alert-${alertType}`}>{alertMsg}</div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="std-warnings">
            <div className="std-warn-header">
              <span>⚠️</span>
              <strong>{warnings.filter(w => w.type === 'warn').length} Warning{warnings.filter(w=>w.type==='warn').length!==1?'s':''} from your Class Advisor</strong>
            </div>
            {warnings.map(w => (
              <div key={w.id} className={`std-warn-item ${w.type === 'report' ? 'std-warn-report' : ''}`}>
                <div className="std-warn-icon">{w.type === 'report' ? '🚨' : '⚠️'}</div>
                <div className="std-warn-body">
                  <p className="std-warn-msg">{w.message}</p>
                  <p className="std-warn-meta">From: {w.advisor?.name} · {new Date(w.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`std-warn-badge ${w.type}`}>{w.type === 'report' ? 'Reported' : 'Warning'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Proof upload notifications */}
        {proofPending.length > 0 && (
          <div className="std-proof-alerts">
            <div className="std-proof-notif-header">
              <span>🔔</span>
              <strong>{proofPending.length} OD proof{proofPending.length > 1 ? 's' : ''} pending upload!</strong>
            </div>
            {proofPending.map(req => (
              <div key={req.id} className="std-proof-item">
                <div className="std-proof-icon">📎</div>
                <div className="std-proof-text">
                  <strong>{req.eventName}</strong>
                  <span>OD ended on {new Date(req.toDate).toLocaleDateString()} — proof upload is now available</span>
                </div>
                <Link to="/student/upload-proof" className="std-proof-btn">Upload Now</Link>
              </div>
            ))}
          </div>
        )}

        {/* Stat Cards */}
        <div className="std-stats-grid">
          {statCards.map(c => (
            <div key={c.label} className="std-stat-card" style={{'--c': c.color, '--bg': c.bg}}>
              <div className="std-stat-icon">{c.icon}</div>
              <div className="std-stat-body">
                <span className="std-stat-val">{c.value}</span>
                <span className="std-stat-lbl">{c.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="std-bottom-row">
          {/* Quick Actions */}
          <div className="std-card">
            <h3 className="std-card-title">Quick Actions</h3>
            <div className="std-actions-list">
              <button className="std-action-btn" onClick={() => navigate('/student/apply-od')}>
                <span className="std-action-icon">✍️</span>
                <div>
                  <p className="std-action-label">Apply for OD</p>
                  <p className="std-action-sub">Submit a new OD request</p>
                </div>
                <span className="std-action-arrow">→</span>
              </button>
              <button className="std-action-btn" onClick={() => navigate('/student/od-history')}>
                <span className="std-action-icon">📜</span>
                <div>
                  <p className="std-action-label">OD History</p>
                  <p className="std-action-sub">Track your requests</p>
                </div>
                <span className="std-action-arrow">→</span>
              </button>
              <button className="std-action-btn" onClick={() => navigate('/student/profile')}>
                <span className="std-action-icon">👤</span>
                <div>
                  <p className="std-action-label">My Profile</p>
                  <p className="std-action-sub">View & edit profile</p>
                </div>
                <span className="std-action-arrow">→</span>
              </button>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="std-card std-recent-card">
            <div className="std-card-header-row">
              <h3 className="std-card-title">Recent Requests</h3>
              <Link to="/student/od-history" className="std-view-all">View All →</Link>
            </div>
            {loading ? <p className="std-loading">Loading...</p>
            : recentRequests.length === 0 ? (
              <div className="std-empty">
                <p>No OD requests yet.</p>
                <Link to="/student/apply-od" className="std-apply-link">Apply for your first OD →</Link>
              </div>
            ) : (
              <div className="std-recent-table-wrap">
                <table className="std-recent-table">
                  <thead>
                    <tr><th>Event</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {recentRequests.map(req => (
                      <tr key={req.id}>
                        <td>{req.eventName}</td>
                        <td>{new Date(req.fromDate).toLocaleDateString()}</td>
                        <td><span className={`status-badge ${req.finalStatus.toLowerCase()}`}>{req.finalStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
