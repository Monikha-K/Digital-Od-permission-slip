import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { advisorAPI } from '../services/apiService';
import '../styles/ProofSubmissions.css';

const docUrl = (p) => p ? `http://localhost:5000/${p.replace(/\\/g, '/')}` : null;

function ProofSubmissions() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [warnMsg, setWarnMsg]   = useState({});
  const [busy, setBusy]         = useState({});
  const [feedback, setFeedback] = useState('');

  const today = new Date(); today.setHours(0, 0, 0, 0);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try {
      const { data } = await advisorAPI.getProofSubmissions();
      setRequests(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const proofStatus = (req) => {
    if (req.documents?.geoTagPhotoPath) return 'submitted';
    const end = new Date(req.toDate); end.setHours(0,0,0,0);
    if (end >= today) {
      const days = Math.ceil((end - today) / 86400000);
      return `timeleft:${days}`;
    }
    // Check if overdue > 30 days
    const daysPast = Math.ceil((today - end) / 86400000);
    return daysPast > 30 ? 'overdue' : 'notsubmitted';
  };

  const handleWarn = async (req) => {
    const msg = warnMsg[req.id] || '';
    if (!msg.trim()) return setFeedback('Please enter a warning message.');
    setBusy(b => ({ ...b, [req.id]: 'warn' }));
    try {
      await advisorAPI.warnStudent(req.id, msg);
      setFeedback(`⚠️ Warning sent to ${req.student?.name}`);
      setWarnMsg(m => ({ ...m, [req.id]: '' }));
      fetch();
    } catch (e) {
      setFeedback(e.response?.data?.message || 'Failed to send warning');
    } finally {
      setBusy(b => ({ ...b, [req.id]: null }));
    }
  };

  const handleReport = async (req) => {
    if (!window.confirm(`Report ${req.student?.name} to admin? This will allow admin to block the student.`)) return;
    setBusy(b => ({ ...b, [req.id]: 'report' }));
    try {
      await advisorAPI.reportStudent(req.id, `Reported for non-compliance on OD: ${req.eventName}`);
      setFeedback(`🚨 Report submitted to admin for ${req.student?.name}`);
      fetch();
    } catch (e) {
      setFeedback(e.response?.data?.message || 'Failed to submit report');
    } finally {
      setBusy(b => ({ ...b, [req.id]: null }));
    }
  };

  const statusInfo = (s) => {
    if (s === 'submitted')   return { label: '✅ Proof Submitted',  cls: 'ps-submitted' };
    if (s === 'overdue')     return { label: '🚨 Overdue (>30 days)', cls: 'ps-overdue' };
    if (s === 'notsubmitted')return { label: '❌ Not Submitted',    cls: 'ps-notsubmitted' };
    if (s?.startsWith('timeleft:')) {
      const d = s.split(':')[1];
      return { label: `⏳ ${d} day${d>1?'s':''} left`, cls: 'ps-timeleft' };
    }
    return { label: '—', cls: '' };
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content ps-page">
        <div className="ps-header">
          <div>
            <h1 className="ps-title">Proof Submissions</h1>
            <p className="ps-sub">Monitor proof submissions for approved ODs where you are the Class Advisor</p>
          </div>
        </div>

        {feedback && (
          <div className="ps-feedback" onClick={() => setFeedback('')}>{feedback} <span>✕</span></div>
        )}

        {loading ? <p className="ps-loading">Loading...</p>
        : requests.length === 0 ? (
          <div className="ps-empty">
            <span>📭</span><p>No approved OD requests assigned to you as Class Advisor.</p>
          </div>
        ) : (
          <div className="ps-list">
            {requests.map(req => {
              const st = proofStatus(req);
              const { label, cls } = statusInfo(st);
              const warnings = req.student?.warningCount || 0;
              const canReport = warnings >= 3;
              const submitted = st === 'submitted';
              const canWarn   = !submitted && st !== 'timeleft:' && !st.startsWith('timeleft:');

              return (
                <div key={req.id} className={`ps-card ${cls}`}>
                  <div className="ps-card-top">
                    <div className="ps-student-info">
                      <div className="ps-avatar">{req.student?.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="ps-student-name">{req.student?.name}</p>
                        <p className="ps-student-meta">{req.student?.rollNumber} · Year {req.student?.year}</p>
                      </div>
                    </div>
                    <div className="ps-event-info">
                      <p className="ps-event-name">{req.eventName}</p>
                      <p className="ps-event-dates">
                        {new Date(req.fromDate).toLocaleDateString()} – {new Date(req.toDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ps-status-col">
                      <span className={`ps-status-badge ${cls}`}>{label}</span>
                      {warnings > 0 && (
                        <span className="ps-warn-count">⚠️ {warnings}/3 warnings</span>
                      )}
                    </div>
                  </div>

                  {/* Submitted docs */}
                  {submitted && (
                    <div className="ps-docs">
                      <p className="ps-docs-title">Submitted Documents</p>
                      <div className="ps-docs-row">
                        {docUrl(req.documents?.geoTagPhotoPath) && (
                          <a href={docUrl(req.documents.geoTagPhotoPath)} target="_blank" rel="noopener noreferrer" className="ps-doc-link">
                            📸 Geo-tagged Photo
                          </a>
                        )}
                        {docUrl(req.documents?.certificatePath) && (
                          <a href={docUrl(req.documents.certificatePath)} target="_blank" rel="noopener noreferrer" className="ps-doc-link">
                            🏆 Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Warn / Report actions */}
                  {!submitted && (
                    <div className="ps-actions">
                      <div className="ps-warn-row">
                        <input
                          className="ps-warn-input"
                          placeholder="Warning message to student..."
                          value={warnMsg[req.id] || ''}
                          onChange={e => setWarnMsg(m => ({ ...m, [req.id]: e.target.value }))}
                        />
                        <button
                          className="ps-warn-btn"
                          onClick={() => handleWarn(req)}
                          disabled={!!busy[req.id] || warnings >= 3}
                          title={warnings >= 3 ? 'Max warnings reached' : ''}
                        >
                          {busy[req.id] === 'warn' ? '...' : '⚠️ Warn'}
                        </button>
                        <button
                          className="ps-report-btn"
                          onClick={() => handleReport(req)}
                          disabled={!canReport || !!busy[req.id]}
                          title={!canReport ? `Need ${3 - warnings} more warning(s) to enable report` : 'Report to admin'}
                        >
                          {busy[req.id] === 'report' ? '...' : '🚨 Report'}
                        </button>
                      </div>
                      {!canReport && warnings > 0 && (
                        <p className="ps-report-hint">Report enabled after {3 - warnings} more warning{3-warnings>1?'s':''}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProofSubmissions;
