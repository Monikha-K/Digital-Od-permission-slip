import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { odAPI } from '../services/apiService';
import '../styles/ODHistory.css';

// Flow order: Mentor → Class Advisor → Innovation Head → HOD → CFI
const FLOW = [
  { key: 'mentor',         label: 'Mentor' },
  { key: 'classAdvisor',   label: 'Class Advisor' },
  { key: 'innovationHead', label: 'Innovation Head' },
  { key: 'hod',            label: 'HOD' },
  { key: 'cfi',            label: 'CFI' },
];

// approvals is an array from Sequelize — find by role key
function getApproval(approvals, key) {
  return Array.isArray(approvals)
    ? approvals.find(a => a.role === key)
    : approvals?.[key];
}

function ApprovalTracker({ approvals, finalStatus }) {
  const rejectedStep = FLOW.find(s => getApproval(approvals, s.key)?.status === 'Rejected');

  return (
    <div className="approval-tracker">
      {FLOW.map((step, idx) => {
        const approval = getApproval(approvals, step.key);
        const status = approval?.status || 'Pending';
        const isAfterRejection = rejectedStep && FLOW.indexOf(step) > FLOW.indexOf(rejectedStep);

        let stepClass = 'step-pending';
        let stepLabel = 'Waiting';
        if (isAfterRejection) {
          stepClass = 'step-skipped';
          stepLabel = 'Not Required';
        } else if (status === 'Approved') {
          stepClass = 'step-approved';
          stepLabel = 'Approved';
        } else if (status === 'Rejected') {
          stepClass = 'step-rejected';
          stepLabel = 'Rejected';
        }

        return (
          <div key={step.key} className="tracker-step">
            {idx > 0 && <div className={`tracker-line ${stepClass}`} />}
            <div className={`tracker-node ${stepClass}`}>
              <div className="node-circle">{idx + 1}</div>
              <div className="node-info">
                <span className="node-role">{step.label}</span>
                <span className={`node-status ${stepClass}`}>{stepLabel}</span>
                {status === 'Rejected' && approval?.remark && (
                  <span className="node-reason">Reason: {approval.remark}</span>
                )}
                {status === 'Approved' && approval?.actionDate && (
                  <span className="node-date">{new Date(approval.actionDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ODHistory() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await odAPI.getMyRequests();
      setRequests(data);
      // Auto-expand any rejected request so student sees the reason immediately
      const firstRejected = data.find(r => r.finalStatus === 'Rejected');
      if (firstRejected && !expandedId) setExpandedId(firstRejected.id);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const canUploadProof = (req) =>
    req.finalStatus === 'Approved' &&
    new Date() > new Date(req.toDate) &&
    !req.documents?.geoTagPhotoPath;

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  // Get current stage label for a request
  const getCurrentStage = (req) => {
    if (req.finalStatus === 'Approved') return 'Fully Approved';
    if (req.finalStatus === 'Rejected') {
      const who = FLOW.find(s => getApproval(req.approvals, s.key)?.status === 'Rejected');
      return `Rejected by ${who?.label || 'Unknown'}`;
    }
    const next = FLOW.find(s => getApproval(req.approvals, s.key)?.status !== 'Approved');
    return next ? `Pending: ${next.label}` : 'In Progress';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <h1>OD History</h1>

        {loading ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <div className="no-data">
            <p>No OD requests found</p>
            <Link to="/student/apply-od" className="submit-btn">Apply for OD</Link>
          </div>
        ) : (
          <div className="od-requests-list">
            {requests.map(req => (
              <div key={req.id} className={`od-card ${req.finalStatus.toLowerCase()}`}>
                <div className="od-card-header" onClick={() => toggleExpand(req.id)}>
                  <div className="od-card-main">
                    <div className="od-card-title">
                      <strong>{req.eventName}</strong>
                      <span className="od-college">{req.collegeName}</span>
                    </div>
                    <div className="od-card-meta">
                      <span>{new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="od-card-right">
                    <span className={`status-badge ${req.finalStatus.toLowerCase()}`}>
                      {req.finalStatus}
                    </span>
                    <span className="current-stage">{getCurrentStage(req)}</span>
                    <span className="expand-toggle">{expandedId === req.id ? 'Hide' : 'Track'}</span>
                  </div>
                </div>

                {expandedId === req.id && (
                  <div className="od-card-body">
                    <div className="od-details-row">
                      <span><strong>Mentor:</strong> {req.mentor?.name}</span>
                      <span><strong>Class Advisor:</strong> {req.classAdvisor?.name}</span>
                    </div>
                    <div className="od-details-row">
                      <span><strong>Description:</strong> {req.description}</span>
                    </div>

                    <h4 className="tracker-title">Approval Progress</h4>
                    <ApprovalTracker approvals={req.approvals} finalStatus={req.finalStatus} />

                    {req.finalStatus === 'Rejected' && (() => {
                      const who = FLOW.find(s => getApproval(req.approvals, s.key)?.status === 'Rejected');
                      const reason = who && getApproval(req.approvals, who.key)?.remark;
                      return reason ? (
                        <div className="rejection-banner">
                          Rejected by {who.label}: "{reason}"
                        </div>
                      ) : null;
                    })()}

                    <div className="od-card-actions">
                      {canUploadProof(req) && (
                        <Link to={`/student/upload-proof/${req.id}`} className="upload-btn">
                          Upload Proof
                        </Link>
                      )}
                      {req.documents?.geoTagPhotoPath && (
                        <span className="proof-uploaded">Proof Uploaded</span>
                      )}
                      {req.finalStatus === 'Approved' && !canUploadProof(req) && !req.documents?.geoTagPhotoPath && (
                        <span className="proof-note">
                          Proof upload available after {new Date(req.toDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ODHistory;
