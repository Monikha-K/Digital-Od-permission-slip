import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminAPI, odAPI } from '../services/apiService';
import '../styles/AdminDashboard.css';

const STATUS_FILTERS = ['all', 'Student', 'Mentor', 'ClassAdvisor', 'InnovationHead', 'HOD', 'CFI'];

function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [requests, setRequests] = useState([]);
  const [reports, setReports]   = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [view, setView]         = useState('overview');
  const [filter, setFilter]         = useState('all');
  const [deptFilter, setDeptFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sR, uR, rR, repR] = await Promise.all([
        adminAPI.getStats(), adminAPI.getUsers({}), odAPI.getAll({}), adminAPI.getReports()
      ]);
      setStats(sR.data);
      setUsers(uR.data);
      setRequests(rR.data);
      setReports(repR.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await adminAPI.deleteUser(id); fetchData(); }
    catch { alert('Failed to delete user'); }
  };

  const handleBlockUser = async (id, block) => {
    if (!window.confirm(`${block ? 'Block' : 'Unblock'} this student?`)) return;
    try { block ? await adminAPI.blockUser(id) : await adminAPI.unblockUser(id); fetchData(); }
    catch { alert('Failed'); }
  };

  const statCards = stats ? [
    { label: 'Total Students', value: stats.totalStudents,  icon: '🎓', color: '#6366f1', bg: '#eef2ff' },
    { label: 'Total Faculty',  value: stats.totalFaculty,   icon: '👨‍🏫', color: '#0ea5e9', bg: '#f0f9ff' },
    { label: 'Total Requests', value: stats.totalRequests,  icon: '📋', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Approved',       value: stats.approvedRequests, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
    { label: 'Pending',        value: stats.pendingRequests,  icon: '⏳', color: '#f97316', bg: '#fff7ed' },
    { label: 'Rejected',       value: stats.rejectedRequests, icon: '❌', color: '#ef4444', bg: '#fef2f2' },
  ] : [];

  const filteredUsers = users.filter(u => filter === 'all' || u.role === filter);

  const DEPARTMENTS = ['all', 'CSE', 'AIDS', 'ECE', 'EEE', 'MECH', 'CYBER', 'CSBS', 'AIML', 'IT'];

  const filteredRequests = requests.filter(req => {
    const deptOk   = deptFilter   === 'all' || req.department  === deptFilter;
    const statusOk = statusFilter === 'all' || req.finalStatus === statusFilter;
    return deptOk && statusOk;
  });

  const FLOW = ['mentor', 'classAdvisor', 'innovationHead', 'hod', 'cfi'];
  const FLOW_LABELS = { mentor: 'Mentor', classAdvisor: 'Class Advisor', innovationHead: 'Innovation Head', hod: 'HOD', cfi: 'CFI' };
  const getApproval = (req, role) => req.approvals?.find(a => a.role === role) || { status: 'Pending' };
  const docUrl = (p) => p ? `http://localhost:5000/${p.replace(/\\/g, '/')}` : null;

  const ROLE_COLORS = {
    Student: '#6366f1', Mentor: '#0ea5e9', ClassAdvisor: '#8b5cf6',
    InnovationHead: '#f59e0b', HOD: '#10b981', CFI: '#ef4444', Admin: '#64748b'
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content adm-dashboard">

        {/* Hero */}
        <div className="adm-hero">
          <div>
            <p className="adm-greeting">System Overview</p>
            <h1 className="adm-title">Admin Dashboard</h1>
            <p className="adm-sub">Sri Eshwar College of Engineering — Digital OD System</p>
          </div>
          <div className="adm-hero-badge">🛡️</div>
        </div>

        {/* Nav Tabs */}
        <div className="adm-tabs">
          {[['overview','📊 Overview'], ['users','👥 Manage Users'], ['requests','📋 All Requests'], ['reports','🚨 Reports']].map(([v, l]) => (
            <button key={v} className={`adm-tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {view === 'overview' && (
          <div className="adm-overview">
            {loading ? (
              <div className="adm-stats-grid">
                {[...Array(6)].map((_, i) => <div key={i} className="adm-stat-card skeleton" />)}
              </div>
            ) : (
              <>
                <div className="adm-stats-grid">
                  {statCards.map(c => (
                    <div key={c.label} className="adm-stat-card" style={{'--c': c.color, '--bg': c.bg}}>
                      <div className="adm-stat-icon">{c.icon}</div>
                      <div className="adm-stat-body">
                        <span className="adm-stat-val">{c.value}</span>
                        <span className="adm-stat-lbl">{c.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Department chart */}
                {stats?.requestsByDepartment?.length > 0 && (
                  <div className="adm-chart-card">
                    <h3 className="adm-card-title">📊 Requests by Department</h3>
                    <div className="adm-dept-chart">
                      {stats.requestsByDepartment.map(item => {
                        const pct = stats.totalRequests ? Math.round((item.count / stats.totalRequests) * 100) : 0;
                        return (
                          <div key={item.department} className="adm-dept-row">
                            <span className="adm-dept-name">{item.department}</span>
                            <div className="adm-dept-bar-bg">
                              <div className="adm-dept-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="adm-dept-count">{item.count}</span>
                            <span className="adm-dept-pct">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Request status breakdown */}
                <div className="adm-breakdown-card">
                  <h3 className="adm-card-title">📈 Request Status Breakdown</h3>
                  <div className="adm-breakdown-grid">
                    {[
                      { label: 'Approved', value: stats.approvedRequests, color: '#10b981' },
                      { label: 'Pending',  value: stats.pendingRequests,  color: '#f59e0b' },
                      { label: 'Rejected', value: stats.rejectedRequests, color: '#ef4444' },
                    ].map(b => {
                      const pct = stats.totalRequests ? Math.round((b.value / stats.totalRequests) * 100) : 0;
                      return (
                        <div key={b.label} className="adm-breakdown-item">
                          <div className="adm-breakdown-ring-wrap">
                            <svg viewBox="0 0 80 80" className="adm-breakdown-ring">
                              <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                              <circle cx="40" cy="40" r="32" fill="none" stroke={b.color} strokeWidth="8"
                                strokeDasharray={`${2 * Math.PI * 32}`}
                                strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
                                strokeLinecap="round" transform="rotate(-90 40 40)"
                                style={{ transition: 'stroke-dashoffset 1s ease' }}
                              />
                            </svg>
                            <span className="adm-breakdown-pct" style={{ color: b.color }}>{pct}%</span>
                          </div>
                          <p className="adm-breakdown-label">{b.label}</p>
                          <p className="adm-breakdown-val" style={{ color: b.color }}>{b.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {view === 'users' && (
          <div className="adm-section">
            <div className="adm-section-header">
              <h2 className="adm-section-title">Manage Users</h2>
              <span className="adm-count-badge">{filteredUsers.length} users</span>
            </div>
            <div className="adm-filter-row">
              {STATUS_FILTERS.map(f => (
                <button key={f} className={`adm-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id}>
                      <td className="adm-td-num">{i + 1}</td>
                      <td>
                        <div className="adm-user-cell">
                          <div className="adm-user-avatar" style={{ background: ROLE_COLORS[u.role] || '#64748b' }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="adm-td-muted">{u.email}</td>
                      <td>
                        <span className="adm-role-badge" style={{ background: `${ROLE_COLORS[u.role]}20`, color: ROLE_COLORS[u.role] || '#64748b' }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="adm-td-muted">{u.department || '—'}</td>
                      <td>
                        {u.role !== 'Admin' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="adm-delete-btn" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                            {u.role === 'Student' && (
                              u.isBlocked
                                ? <button className="adm-unblock-btn" onClick={() => handleBlockUser(u.id, false)}>Unblock</button>
                                : <button className="adm-block-btn"   onClick={() => handleBlockUser(u.id, true)}>Block</button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── REQUESTS ── */}
        {view === 'requests' && (
          <div className="adm-section">
            <div className="adm-section-header">
              <h2 className="adm-section-title">All OD Requests</h2>
              <span className="adm-count-badge">{filteredRequests.length} of {requests.length}</span>
            </div>

            <div className="adm-req-filters">
              <div className="adm-req-filter-group">
                <span className="adm-req-filter-label">Department</span>
                <div className="adm-filter-row">
                  {DEPARTMENTS.map(d => (
                    <button key={d} className={`adm-filter-btn ${deptFilter === d ? 'active' : ''}`} onClick={() => setDeptFilter(d)}>
                      {d === 'all' ? 'All Depts' : d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="adm-req-filter-group">
                <span className="adm-req-filter-label">Status</span>
                <div className="adm-filter-row">
                  {['all', 'Pending', 'Approved', 'Rejected'].map(s => (
                    <button key={s} className={`adm-filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                      {s === 'all' ? 'All Status' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>#</th><th>Student</th><th>Event</th><th>Department</th><th>Date</th><th>Status</th><th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req, i) => (
                    <tr key={req.id}>
                      <td className="adm-td-num">{i + 1}</td>
                      <td>
                        <div className="adm-user-cell">
                          <div className="adm-user-avatar" style={{ background: '#6366f1' }}>
                            {req.student?.name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{req.student?.name}</span>
                        </div>
                      </td>
                      <td>{req.eventName}</td>
                      <td className="adm-td-muted">{req.department}</td>
                      <td className="adm-td-muted">{new Date(req.fromDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${req.finalStatus.toLowerCase()}`}>{req.finalStatus}</span>
                      </td>
                      <td>
                        <button className="adm-view-btn" onClick={() => setSelectedRequest(req)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* ── REPORTS ── */}
        {view === 'reports' && (
          <div className="adm-section">
            <div className="adm-section-header">
              <h2 className="adm-section-title">Student Reports</h2>
              <span className="adm-count-badge">{reports.length} reports</span>
            </div>
            {reports.length === 0 ? (
              <div className="adm-empty">No reports submitted yet.</div>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr><th>#</th><th>Student</th><th>Reported By</th><th>Message</th><th>Date</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {reports.map((r, i) => (
                      <tr key={r.id}>
                        <td className="adm-td-num">{i + 1}</td>
                        <td>
                          <div className="adm-user-cell">
                            <div className="adm-user-avatar" style={{ background: '#ef4444' }}>
                              {r.student?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div>{r.student?.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>{r.student?.rollNumber} · {r.student?.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="adm-td-muted">{r.advisor?.name}</td>
                        <td style={{ maxWidth: '220px', fontSize: '13px' }}>{r.message}</td>
                        <td className="adm-td-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>
                          {r.student?.isBlocked
                            ? <span className="adm-role-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>Blocked</span>
                            : <span className="adm-role-badge" style={{ background: '#fef3c7', color: '#d97706' }}>Active</span>
                          }
                        </td>
                        <td>
                          {r.student?.isBlocked
                            ? <button className="adm-unblock-btn" onClick={() => handleBlockUser(r.student.id, false)}>Unblock</button>
                            : <button className="adm-block-btn"   onClick={() => handleBlockUser(r.student.id, true)}>Block</button>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* REQUEST DETAIL MODAL */}
        {selectedRequest && (
          <div className="adm-modal-overlay" onClick={() => setSelectedRequest(null)}>
            <div className="adm-modal" onClick={e => e.stopPropagation()}>
              <div className="adm-modal-header">
                <h2>OD Request Details</h2>
                <button className="adm-modal-close" onClick={() => setSelectedRequest(null)}>✕</button>
              </div>
              <div className="adm-modal-body">

                <div className="adm-modal-section">
                  <h4 className="adm-modal-section-title">Student Information</h4>
                  <div className="adm-modal-grid">
                    <div className="adm-modal-field"><span>Student</span><p>{selectedRequest.student?.name}</p></div>
                    <div className="adm-modal-field"><span>Roll Number</span><p>{selectedRequest.student?.rollNumber}</p></div>
                    <div className="adm-modal-field"><span>Department</span><p>{selectedRequest.department}</p></div>
                    <div className="adm-modal-field"><span>Year</span><p>{selectedRequest.year}</p></div>
                  </div>
                </div>

                <div className="adm-modal-section">
                  <h4 className="adm-modal-section-title">Event Information</h4>
                  <div className="adm-modal-grid">
                    <div className="adm-modal-field"><span>Event Name</span><p>{selectedRequest.eventName}</p></div>
                    <div className="adm-modal-field"><span>College</span><p>{selectedRequest.collegeName}</p></div>
                    <div className="adm-modal-field"><span>From Date</span><p>{new Date(selectedRequest.fromDate).toLocaleDateString()}</p></div>
                    <div className="adm-modal-field"><span>To Date</span><p>{new Date(selectedRequest.toDate).toLocaleDateString()}</p></div>
                    <div className="adm-modal-field adm-modal-full"><span>Description</span><p>{selectedRequest.description}</p></div>
                  </div>
                </div>

                <div className="adm-modal-section">
                  <h4 className="adm-modal-section-title">Submitted Documents</h4>
                  <div className="adm-modal-docs">
                    {docUrl(selectedRequest.documents?.registrationFormPath)
                      ? <a href={docUrl(selectedRequest.documents.registrationFormPath)} target="_blank" rel="noopener noreferrer" className="adm-doc-link">📄 Registration Form</a>
                      : <span className="adm-doc-missing">📄 Registration Form — Not uploaded</span>}
                    {docUrl(selectedRequest.documents?.paymentProofPath)
                      ? <a href={docUrl(selectedRequest.documents.paymentProofPath)} target="_blank" rel="noopener noreferrer" className="adm-doc-link">💳 Payment Proof</a>
                      : <span className="adm-doc-missing">💳 Payment Proof — Not uploaded</span>}
                    {docUrl(selectedRequest.documents?.posterPath)
                      ? <a href={docUrl(selectedRequest.documents.posterPath)} target="_blank" rel="noopener noreferrer" className="adm-doc-link">🖼️ Event Poster</a>
                      : <span className="adm-doc-missing">🖼️ Event Poster — Not uploaded</span>}
                  </div>
                </div>

                <div className="adm-modal-section">
                  <h4 className="adm-modal-section-title">
                    Proof Documents
                    {selectedRequest.documents?.geoTagPhotoPath
                      ? <span className="adm-proof-tag submitted">✅ Submitted</span>
                      : <span className="adm-proof-tag pending">⏳ Not Submitted</span>}
                  </h4>
                  <div className="adm-modal-docs">
                    {docUrl(selectedRequest.documents?.geoTagPhotoPath)
                      ? <a href={docUrl(selectedRequest.documents.geoTagPhotoPath)} target="_blank" rel="noopener noreferrer" className="adm-doc-link">📸 Geo-tagged Photo</a>
                      : <span className="adm-doc-missing">📸 Geo-tagged Photo — Not submitted</span>}
                    {docUrl(selectedRequest.documents?.certificatePath)
                      ? <a href={docUrl(selectedRequest.documents.certificatePath)} target="_blank" rel="noopener noreferrer" className="adm-doc-link">🏆 Certificate</a>
                      : <span className="adm-doc-missing">🏆 Certificate — Not submitted</span>}
                  </div>
                </div>

                <div className="adm-modal-section">
                  <h4 className="adm-modal-section-title">Approval Chain</h4>
                  <div className="adm-approval-chain">
                    {FLOW.map(role => {
                      const approval = getApproval(selectedRequest, role);
                      return (
                        <div key={role} className={`adm-approval-step adm-approval-${approval.status.toLowerCase()}`}>
                          <div className="adm-approval-dot" />
                          <div className="adm-approval-info">
                            <span className="adm-approval-role">{FLOW_LABELS[role]}</span>
                            <span className="adm-approval-status">{approval.status}</span>
                            {approval.remark && <span className="adm-approval-remark">"{approval.remark}"</span>}
                            {approval.actionDate && <span className="adm-approval-date">{new Date(approval.actionDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
