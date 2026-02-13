import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getFacultyODRequests, updateODApproval } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import '../styles/FacultyDashboard.css';

const FacultyDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [remark, setRemark] = useState('');
  const [toast, setToast] = useState(null);
  const [allRequests, setAllRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getFacultyODRequests();
        setAllRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };
    fetchRequests();
  }, []);

  const getFilteredRequests = () => {
    return allRequests;
  };

  const canApprove = (request) => {
    const { approvals } = request;
    
    if (request.selectedMentorId?._id === user._id) {
      return approvals.mentor.status === 'Pending';
    }
    
    if (request.selectedAdvisorId?._id === user._id) {
      return approvals.mentor.status === 'Approved' && approvals.advisor.status === 'Pending';
    }
    
    if (user.facultyRole === 'Innovation Head' && request.innovationHeadId?._id === user._id) {
      return approvals.advisor.status === 'Approved' && approvals.innovationHead.status === 'Pending';
    }
    
    if (user.facultyRole === 'HOD' && request.hodId?._id === user._id) {
      return approvals.innovationHead.status === 'Approved' && approvals.hod.status === 'Pending';
    }
    
    if (user.facultyRole === 'CFI') {
      return approvals.hod.status === 'Approved' && approvals.cfi.status === 'Pending';
    }
    
    return false;
  };

  const filteredRequests = getFilteredRequests();
  const pendingRequests = filteredRequests.filter(r => canApprove(r));
  
  const approvedRequests = filteredRequests.filter(r => {
    if (r.selectedMentorId?._id === user._id) return r.approvals.mentor.status === 'Approved';
    if (r.selectedAdvisorId?._id === user._id) return r.approvals.advisor.status === 'Approved';
    if (user.facultyRole === 'Innovation Head' && r.innovationHeadId?._id === user._id) return r.approvals.innovationHead.status === 'Approved';
    if (user.facultyRole === 'HOD' && r.hodId?._id === user._id) return r.approvals.hod.status === 'Approved';
    if (user.facultyRole === 'CFI') return r.approvals.cfi.status === 'Approved';
    return false;
  });
  
  const rejectedRequests = filteredRequests.filter(r => {
    if (r.selectedMentorId?._id === user._id) return r.approvals.mentor.status === 'Rejected';
    if (r.selectedAdvisorId?._id === user._id) return r.approvals.advisor.status === 'Rejected';
    if (user.facultyRole === 'Innovation Head' && r.innovationHeadId?._id === user._id) return r.approvals.innovationHead.status === 'Rejected';
    if (user.facultyRole === 'HOD' && r.hodId?._id === user._id) return r.approvals.hod.status === 'Rejected';
    if (user.facultyRole === 'CFI') return r.approvals.cfi.status === 'Rejected';
    return false;
  });

  const displayRequests = filter === 'pending' ? pendingRequests : filter === 'approved' ? approvedRequests : rejectedRequests;

  const handleAction = (request, action) => {
    setSelectedRequest({ ...request, action });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    let roleKey = null;
    
    if (selectedRequest.selectedMentorId?._id === user._id) {
      roleKey = 'mentor';
    } else if (selectedRequest.selectedAdvisorId?._id === user._id) {
      roleKey = 'advisor';
    } else if (user.facultyRole === 'Innovation Head') {
      roleKey = 'innovationHead';
    } else if (user.facultyRole === 'HOD') {
      roleKey = 'hod';
    } else if (user.facultyRole === 'CFI') {
      roleKey = 'cfi';
    }

    if (!roleKey) return;

    try {
      await updateODApproval(selectedRequest._id, {
        role: roleKey,
        status: selectedRequest.action,
        remark
      });

      const updatedRequests = await getFacultyODRequests();
      setAllRequests(updatedRequests);
      setToast({ message: `Request ${selectedRequest.action.toLowerCase()} successfully!`, type: 'success' });
      setShowModal(false);
      setRemark('');
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Failed to update request', type: 'error' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarLinks = [
    { path: '/faculty/dashboard', label: 'Dashboard' }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} onLogout={handleLogout} />
      <div className="dashboard-content">
        <h1>Faculty Dashboard</h1>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Department:</strong> {user?.department}</p>
        {user?.isClassAdvisor && <p><strong>Class Advisor:</strong> Year {user?.advisorYear}</p>}
        
        <div className="filter-tabs">
          <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
            Pending ({pendingRequests.length})
          </button>
          <button className={filter === 'approved' ? 'active' : ''} onClick={() => setFilter('approved')}>
            Approved ({approvedRequests.length})
          </button>
          <button className={filter === 'rejected' ? 'active' : ''} onClick={() => setFilter('rejected')}>
            Rejected ({rejectedRequests.length})
          </button>
        </div>

        {displayRequests.length === 0 ? (
          <div className="no-data">No {filter} requests</div>
        ) : (
          <div className="requests-grid">
            {displayRequests.map(request => (
              <div key={request._id} className="request-card">
                <h3>{request.eventName}</h3>
                <p><strong>Student:</strong> {request.studentName}</p>
                <p><strong>Department:</strong> {request.department}</p>
                <p><strong>Year:</strong> {request.year}</p>
                <p><strong>College:</strong> {request.collegeName}</p>
                <p><strong>Dates:</strong> {request.fromDate} to {request.toDate}</p>
                <p><strong>Selected Mentor:</strong> {request.selectedMentorId?.name || 'N/A'}</p>
                <p><strong>Selected Advisor:</strong> {request.selectedAdvisorId?.name || 'N/A'}</p>
                <p><strong>Description:</strong> {request.description}</p>
                <div className="documents">
                  <strong>Documents:</strong>
                  <ul>
                    {request.documents.registrationForm && <li>Registration Form</li>}
                    {request.documents.paymentProof && <li>Payment Proof</li>}
                    {request.documents.poster && <li>Event Poster</li>}
                  </ul>
                </div>
                {filter === 'pending' && (
                  <div className="action-buttons">
                    <button className="btn-approve" onClick={() => handleAction(request, 'Approved')}>
                      Approve
                    </button>
                    <button className="btn-reject" onClick={() => handleAction(request, 'Rejected')}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${selectedRequest?.action} Request`}>
        <div className="approval-form">
          <p>Are you sure you want to {selectedRequest?.action.toLowerCase()} this request?</p>
          <div className="form-group">
            <label>Remark (Optional)</label>
            <textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows="3"></textarea>
          </div>
          <button className="btn-primary" onClick={handleSubmit}>Confirm</button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default FacultyDashboard;
