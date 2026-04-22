import React, { useState, useEffect } from 'react';
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

function FacultyODRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  // ClassAdvisor only: 'all' | 'mentor' | 'advisor'
  const [roleTab, setRoleTab] = useState('mentor');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const isClassAdvisor = user?.role === 'ClassAdvisor';

  useEffect(() => {
    fetchRequests();
  }, [roleTab]);

  const fetchRequests = async () => {
    try {
      const as = isClassAdvisor ? roleTab : undefined;
      const { data } = await odAPI.getFacultyRequests(as);
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id, action) => {
    if (action === 'reject' && !reason.trim()) {
      return alert('Please provide a reason for rejection.');
    }
    setLoading(true);
    try {
      await odAPI.approveReject(id, { action, reason });
      setSelectedRequest(null);
      setReason('');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  // For ClassAdvisor, use the approval key matching the active role tab
  const key = isClassAdvisor
    ? (roleTab === 'mentor' ? 'mentor' : 'classAdvisor')
    : ROLE_KEY[user?.role];

  const isMyTurn = (req) => {
    if (!key) return false;
    const myApproval = getApproval(req, key);
    // Can act (approve or reject) if my slot is still Pending and request not already rejected
    return myApproval.status === 'Pending' && req.finalStatus !== 'Rejected';
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'pending')  return getApproval(req, key).status === 'Pending' && req.finalStatus !== 'Rejected';
    if (filter === 'approved') return getApproval(req, key).status === 'Approved';
    if (filter === 'rejected') return getApproval(req, key).status === 'Rejected' || req.finalStatus === 'Rejected';
    return true;
  });

  const docUrl = (path) => path ? `http://localhost:5000/${path.replace(/\\/g, '/')}` : null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <h1>OD Requests</h1>
        <p>{user?.role} &nbsp;|&nbsp; Department: {user?.department}</p>

        {/* ClassAdvisor role tabs */}
        {isClassAdvisor && (
          <div className="role-tabs">
            {[
              { val: 'mentor',  label: 'As Mentor' },
              { val: 'advisor', label: 'As Class Advisor' },
            ].map(t => (
              <button
                key={t.val}
                className={`role-tab-btn ${roleTab === t.val ? 'active' : ''}`}
                onClick={() => setRoleTab(t.val)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Status filter tabs */}
        <div className="filter-tabs">
          {['pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredRequests.length === 0 ? (
          <p className="no-data-text">No {filter} requests</p>
        ) : (
          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => (
                  <tr key={req.id}>
                    <td>{req.student?.name} ({req.student?.rollNumber})</td>
                    <td>{req.eventName}</td>
                    <td>{new Date(req.fromDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${req.finalStatus.toLowerCase()}`}>
                        {req.finalStatus}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => { setSelectedRequest(req); setReason(''); }} className="view-btn">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedRequest && (
          <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Request Details</h2>
              <div className="request-details">
                <p><strong>Student:</strong> {selectedRequest.student?.name}</p>
                <p><strong>Roll Number:</strong> {selectedRequest.student?.rollNumber}</p>
                <p><strong>Event:</strong> {selectedRequest.eventName}</p>
                <p><strong>College:</strong> {selectedRequest.collegeName}</p>
                <p><strong>Date:</strong> {new Date(selectedRequest.fromDate).toLocaleDateString()} – {new Date(selectedRequest.toDate).toLocaleDateString()}</p>
                <p><strong>Description:</strong> {selectedRequest.description}</p>

                <div className="documents-section">
                  <h3>Submitted Documents</h3>
                  {docUrl(selectedRequest.documents?.registrationFormPath) && (
                    <a href={docUrl(selectedRequest.documents.registrationFormPath)} target="_blank" rel="noopener noreferrer">View Registration Form</a>
                  )}
                  {docUrl(selectedRequest.documents?.paymentProofPath) && (
                    <a href={docUrl(selectedRequest.documents.paymentProofPath)} target="_blank" rel="noopener noreferrer">View Payment Proof</a>
                  )}
                  {docUrl(selectedRequest.documents?.posterPath) && (
                    <a href={docUrl(selectedRequest.documents.posterPath)} target="_blank" rel="noopener noreferrer">View Event Poster</a>
                  )}
                </div>

                {(selectedRequest.documents?.geoTagPhotoPath || selectedRequest.documents?.certificatePath) && (
                  <div className="proof-section">
                    <h3>Uploaded Proof</h3>
                    {docUrl(selectedRequest.documents?.geoTagPhotoPath) && (
                      <a href={docUrl(selectedRequest.documents.geoTagPhotoPath)} target="_blank" rel="noopener noreferrer">View Geo-tagged Photo</a>
                    )}
                    {docUrl(selectedRequest.documents?.certificatePath) && (
                      <a href={docUrl(selectedRequest.documents.certificatePath)} target="_blank" rel="noopener noreferrer">View Certificate</a>
                    )}
                  </div>
                )}

                <div className="approval-status">
                  <h3>Approval Chain</h3>
                  {FLOW.map(role => {
                    const approval = getApproval(selectedRequest, role);
                    return (
                      <p key={role}>
                        <strong>{role.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:</strong>
                        <span className={approval.status.toLowerCase()}> {approval.status}</span>
                        {approval.remark && <em> — {approval.remark}</em>}
                      </p>
                    );
                  })}
                </div>
              </div>

              {isMyTurn(selectedRequest) && (
                <>
                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label>Reason (for rejection)</label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} rows="3" />
                  </div>
                  <div className="modal-actions">
                    <button onClick={() => handleAction(selectedRequest.id, 'approve')} className="approve-btn" disabled={loading}>Approve</button>
                    <button onClick={() => handleAction(selectedRequest.id, 'reject')}  className="reject-btn"  disabled={loading}>Reject</button>
                    <button onClick={() => setSelectedRequest(null)} className="cancel-btn">Close</button>
                  </div>
                </>
              )}
              {!isMyTurn(selectedRequest) && (
                <div className="modal-actions">
                  <button onClick={() => setSelectedRequest(null)} className="cancel-btn">Close</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyODRequests;
