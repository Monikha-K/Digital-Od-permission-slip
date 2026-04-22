import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { odAPI } from '../services/apiService';
import '../styles/FacultyDashboard.css';

const ROLE_KEY = {
  Mentor: 'mentor', ClassAdvisor: 'classAdvisor',
  InnovationHead: 'innovationHead', HOD: 'hod', CFI: 'cfi'
};
const FLOW = ['mentor', 'classAdvisor', 'innovationHead', 'hod', 'cfi'];

function getApproval(req, role) {
  return req.approvals?.find(a => a.role === role) || { status: 'Pending' };
}

const ROLE_ICONS = {
  Mentor: '🎓', ClassAdvisor: '📋', InnovationHead: '💡', HOD: '🏛️', CFI: '🔬'
};

function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    odAPI.getFacultyRequests()
      .then(({ data }) => setRequests(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const key      = ROLE_KEY[user?.role];
  const myIndex  = FLOW.indexOf(key);

  const total    = requests.length;
  const approved = requests.filter(r => getApproval(r, key).status === 'Approved').length;
  const rejected = requests.filter(r => getApproval(r, key).status === 'Rejected' || r.finalStatus === 'Rejected').length;
  const pending  = requests.filter(r => getApproval(r, key).status === 'Pending' && r.finalStatus !== 'Rejected').length;

  const actionNeeded = requests.filter(r => {
    for (let i = 0; i < myIndex; i++) {
      if (getApproval(r, FLOW[i]).status !== 'Approved') return false;
    }
    return getApproval(r, key).status === 'Pending' && r.finalStatus !== 'Rejected';
  }).length;

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // 5 most recent requests
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const stats = [
    { label: 'Total Assigned',  value: total,        color: '#6366f1', bg: '#eef2ff', icon: '📁' },
    { label: 'Action Needed',   value: actionNeeded, color: '#f59e0b', bg: '#fffbeb', icon: '⚡' },
    { label: 'Approved',        value: approved,     color: '#10b981', bg: '#ecfdf5', icon: '✅' },
    { label: 'Rejected',        value: rejected,     color: '#ef4444', bg: '#fef2f2', icon: '❌' },
  ];

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content fac-dashboard">

        {/* ── Hero Header ── */}
        <div className="fac-hero">
          <div className="fac-hero-left">
            <span className="fac-role-icon">{ROLE_ICONS[user?.role] || '👤'}</span>
            <div>
              <p className="fac-greeting">Good day,</p>
              <h1 className="fac-name">{user?.name}</h1>
              <div className="fac-meta">
                <span className="fac-badge">{user?.role}</span>
                <span className="fac-dept">📍 {user?.department}</span>
              </div>
            </div>
          </div>
          <div className="fac-hero-right">
            <p className="fac-date">{today}</p>
            {actionNeeded > 0 && (
              <button className="fac-action-btn" onClick={() => navigate('/faculty/od-requests')}>
                ⚡ {actionNeeded} Request{actionNeeded > 1 ? 's' : ''} Need Action
              </button>
            )}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="fac-stats-grid">
          {loading
            ? stats.map(s => <div key={s.label} className="fac-stat-card skeleton" />)
            : stats.map(s => (
              <div key={s.label} className="fac-stat-card" style={{ '--card-color': s.color, '--card-bg': s.bg }}>
                <div className="fac-stat-icon">{s.icon}</div>
                <div className="fac-stat-body">
                  <span className="fac-stat-value">{s.value}</span>
                  <span className="fac-stat-label">{s.label}</span>
                </div>
                <div className="fac-stat-bar">
                  <div className="fac-stat-bar-fill" style={{ height: total ? `${(s.value / total) * 100}%` : '0%' }} />
                </div>
              </div>
            ))
          }
        </div>

        {/* ── Bottom Row ── */}
        <div className="fac-bottom-row">

          {/* Approval Rate Card */}
          <div className="fac-card fac-rate-card">
            <h3 className="fac-card-title">Approval Rate</h3>
            <div className="fac-ring-wrap">
              <svg className="fac-ring" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="#10b981" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - approvalRate / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="fac-ring-label">
                <span className="fac-ring-pct">{approvalRate}%</span>
                <span className="fac-ring-sub">Approved</span>
              </div>
            </div>
            <div className="fac-rate-legend">
              {[
                { label: 'Approved', value: approved, color: '#10b981' },
                { label: 'Pending',  value: pending,  color: '#f59e0b' },
                { label: 'Rejected', value: rejected, color: '#ef4444' },
              ].map(l => (
                <div key={l.label} className="fac-legend-row">
                  <span className="fac-legend-dot" style={{ background: l.color }} />
                  <span className="fac-legend-label">{l.label}</span>
                  <span className="fac-legend-val">{l.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Requests */}
          <div className="fac-card fac-recent-card">
            <div className="fac-card-header-row">
              <h3 className="fac-card-title">Recent Requests</h3>
              <button className="fac-view-all" onClick={() => navigate('/faculty/od-requests')}>View All →</button>
            </div>
            {loading ? (
              <p className="fac-loading">Loading...</p>
            ) : recentRequests.length === 0 ? (
              <p className="fac-empty">No requests assigned yet.</p>
            ) : (
              <div className="fac-recent-list">
                {recentRequests.map(req => {
                  const myStatus = getApproval(req, key).status;
                  return (
                    <div key={req.id} className="fac-recent-item">
                      <div className="fac-recent-avatar">
                        {req.student?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="fac-recent-info">
                        <span className="fac-recent-name">{req.student?.name}</span>
                        <span className="fac-recent-event">{req.eventName}</span>
                      </div>
                      <span className={`fac-recent-badge ${myStatus.toLowerCase()}`}>{myStatus}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="fac-card fac-quick-card">
            <h3 className="fac-card-title">Quick Actions</h3>
            <div className="fac-quick-list">
              <button className="fac-quick-btn" onClick={() => navigate('/faculty/od-requests')}>
                <span className="fac-quick-icon">📋</span>
                <div>
                  <p className="fac-quick-label">OD Requests</p>
                  <p className="fac-quick-sub">Review & approve requests</p>
                </div>
              </button>
              <button className="fac-quick-btn" onClick={() => navigate('/faculty/profile')}>
                <span className="fac-quick-icon">👤</span>
                <div>
                  <p className="fac-quick-label">My Profile</p>
                  <p className="fac-quick-sub">View & edit your profile</p>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
