import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMyODRequests, uploadProof } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import '../styles/ODHistory.css';

const StudentODHistory = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [toast, setToast] = useState(null);
  const [requests, setRequests] = useState([]);
  const [uploadFiles, setUploadFiles] = useState({
    geoTagPhoto: null,
    certificate: null
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getMyODRequests();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };
    fetchRequests();
  }, []);

  const approvedCount = requests.filter(r => r.finalStatus === 'Approved').length;
  const remainingODs = 10 - approvedCount;

  const handleUploadClick = (request) => {
    setSelectedRequest(request);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    setUploadFiles({ ...uploadFiles, [e.target.name]: e.target.files[0]?.name || null });
  };

  const handleUploadSubmit = async () => {
    try {
      await uploadProof(selectedRequest._id, {
        geoTagPhoto: uploadFiles.geoTagPhoto,
        certificate: uploadFiles.certificate
      });
      
      const updatedRequests = await getMyODRequests();
      setRequests(updatedRequests);
      setToast({ message: 'Proof uploaded successfully!', type: 'success' });
      setShowUploadModal(false);
      setUploadFiles({ geoTagPhoto: null, certificate: null });
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Failed to upload proof', type: 'error' });
    }
  };

  const getCurrentStage = (request) => {
    const { approvals } = request;
    if (approvals.cfi.status === 'Approved') return 'Completed';
    if (approvals.advisor.status === 'Approved') return 'Pending CFI Approval';
    if (approvals.mentor.status === 'Approved') return 'Pending Class Advisor Approval';
    return 'Pending Mentor Approval';
  };

  const isODDatePassed = (toDate) => {
    const today = new Date();
    const odEndDate = new Date(toDate);
    return today > odEndDate;
  };

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
        <h1>OD History</h1>
        
        <div className="od-stats">
          <p><strong>Approved ODs:</strong> {approvedCount} / 10</p>
          {approvedCount >= 8 && approvedCount < 10 && (
            <p className="warning-text">⚠️ Only {remainingODs} OD{remainingODs > 1 ? 's' : ''} remaining!</p>
          )}
          {approvedCount >= 10 && (
            <p className="error-text">❌ Maximum OD limit reached!</p>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="no-data">No OD requests found</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>OD Dates</th>
                  <th>Mentor</th>
                  <th>Advisor</th>
                  <th>Final Status</th>
                  <th>Current Stage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request._id}>
                    <td>{request.eventName}</td>
                    <td>{request.fromDate} to {request.toDate}</td>
                    <td>{request.selectedMentorId?.name || 'N/A'}</td>
                    <td>{request.selectedAdvisorId?.name || 'N/A'}</td>
                    <td>
                      <span className={`status status-${request.finalStatus.toLowerCase()}`}>
                        {request.finalStatus}
                      </span>
                    </td>
                    <td>{getCurrentStage(request)}</td>
                    <td>
                      {request.finalStatus === 'Approved' && !request.proofUploaded && isODDatePassed(request.toDate) && (
                        <button className="btn-primary" onClick={() => handleUploadClick(request)}>
                          Upload Proof
                        </button>
                      )}
                      {request.finalStatus === 'Approved' && !request.proofUploaded && !isODDatePassed(request.toDate) && (
                        <span className="info-text">Available after {request.toDate}</span>
                      )}
                      {request.proofUploaded && (
                        <span className="proof-uploaded">✓ Proof Uploaded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Proof">
        <div className="upload-form">
          <div className="form-group">
            <label>Geo-tagged Photo</label>
            <input type="file" name="geoTagPhoto" onChange={handleFileChange} accept="image/*" required />
          </div>
          <div className="form-group">
            <label>Participation/Winning Certificate</label>
            <input type="file" name="certificate" onChange={handleFileChange} accept=".pdf,image/*" required />
          </div>
          <button className="btn-primary" onClick={handleUploadSubmit}>Submit Proof</button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default StudentODHistory;