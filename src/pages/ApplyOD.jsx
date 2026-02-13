import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { createODRequest, getMyODRequests, getHODByDepartment, getInnovationHeadByDepartment } from '../utils/api';
import { getMentorsByDepartment, getAdvisorsByDepartmentAndYear, getCFI } from '../utils/facultyData';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import '../styles/ApplyOD.css';

const ApplyOD = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [cfi, setCfi] = useState(null);
  const [hod, setHod] = useState(null);
  const [innovationHead, setInnovationHead] = useState(null);
  const [approvedODCount, setApprovedODCount] = useState(0);
  const [formData, setFormData] = useState({
    eventName: '',
    collegeName: '',
    fromDate: '',
    toDate: '',
    description: '',
    selectedMentorId: '',
    selectedAdvisorId: ''
  });
  const [files, setFiles] = useState({
    registrationForm: null,
    paymentProof: null,
    poster: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorsData, advisorsData, cfiData, hodData, innovationData, requests] = await Promise.all([
          getMentorsByDepartment(user.department),
          getAdvisorsByDepartmentAndYear(user.department, user.year),
          getCFI(),
          getHODByDepartment(user.department),
          getInnovationHeadByDepartment(user.department),
          getMyODRequests()
        ]);
        setMentors(mentorsData);
        setAdvisors(advisorsData);
        setCfi(cfiData);
        setHod(hodData);
        setInnovationHead(innovationData);
        setApprovedODCount(requests.filter(r => r.finalStatus === 'Approved').length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [user.department, user.year]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0]?.name || null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (approvedODCount >= 10) {
      setToast({ message: 'You have reached the maximum limit of 10 ODs!', type: 'error' });
      return;
    }

    if (!formData.selectedMentorId || !formData.selectedAdvisorId) {
      setToast({ message: 'Please select both Mentor and Class Advisor!', type: 'error' });
      return;
    }

    if (!cfi || !hod || !innovationHead) {
      setToast({ message: 'Required approvers not found. Please contact admin.', type: 'error' });
      return;
    }

    try {
      const odRequest = {
        studentName: user.name,
        department: user.department,
        year: user.year,
        selectedMentorId: formData.selectedMentorId,
        selectedAdvisorId: formData.selectedAdvisorId,
        innovationHeadId: innovationHead._id,
        hodId: hod._id,
        cfiId: cfi._id,
        eventName: formData.eventName,
        collegeName: formData.collegeName,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        description: formData.description,
        documents: files
      };

      await createODRequest(odRequest);
      setToast({ message: 'OD Request submitted successfully!', type: 'success' });
      setTimeout(() => navigate('/student/history'), 2000);
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Failed to submit OD request', type: 'error' });
    }
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

  const remainingODs = 10 - approvedODCount;
  const isFormDisabled = approvedODCount >= 10;
  const isSubmitDisabled = isFormDisabled || !formData.selectedMentorId || !formData.selectedAdvisorId;

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} onLogout={handleLogout} />
      <div className="dashboard-content">
        <h1>Apply for OD</h1>
        
        {approvedODCount >= 8 && approvedODCount < 10 && (
          <div className="warning-message">
            ⚠️ Warning: Only {remainingODs} OD{remainingODs > 1 ? 's' : ''} left!
          </div>
        )}
        
        {approvedODCount >= 10 && (
          <div className="error-message">
            ❌ You have reached the maximum limit of 10 ODs. Cannot apply for more.
          </div>
        )}

        <form className="od-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Name</label>
            <input type="text" name="eventName" onChange={handleChange} required disabled={isFormDisabled} />
          </div>
          <div className="form-group">
            <label>College Name</label>
            <input type="text" name="collegeName" onChange={handleChange} required disabled={isFormDisabled} />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input type="text" value={user?.department} disabled />
          </div>
          <div className="form-group">
            <label>Year</label>
            <input type="text" value={user?.year} disabled />
          </div>
          
          <div className="form-group">
            <label>Select Your Mentor *</label>
            <select name="selectedMentorId" onChange={handleChange} required disabled={isFormDisabled}>
              <option value="">-- Select Mentor --</option>
              {mentors.map(mentor => (
                <option key={mentor._id} value={mentor._id}>{mentor.name}</option>
              ))}
            </select>
            {mentors.length === 0 && (
              <small className="info-text">No mentors registered for {user?.department} department yet.</small>
            )}
          </div>
          
          <div className="form-group">
            <label>Select Your Class Advisor *</label>
            <select name="selectedAdvisorId" onChange={handleChange} required disabled={isFormDisabled}>
              <option value="">-- Select Class Advisor --</option>
              {advisors.map(advisor => (
                <option key={advisor._id} value={advisor._id}>{advisor.name}</option>
              ))}
            </select>
            {advisors.length === 0 && (
              <small className="info-text">No class advisors registered for Year {user?.year} in {user?.department} department yet.</small>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>OD From Date</label>
              <input type="date" name="fromDate" onChange={handleChange} required disabled={isFormDisabled} />
            </div>
            <div className="form-group">
              <label>OD To Date</label>
              <input type="date" name="toDate" onChange={handleChange} required disabled={isFormDisabled} />
            </div>
          </div>
          <div className="form-group">
            <label>Event Registration Form</label>
            <input type="file" name="registrationForm" onChange={handleFileChange} required disabled={isFormDisabled} />
          </div>
          <div className="form-group">
            <label>Payment Proof</label>
            <input type="file" name="paymentProof" onChange={handleFileChange} required disabled={isFormDisabled} />
          </div>
          <div className="form-group">
            <label>Event Poster</label>
            <input type="file" name="poster" onChange={handleFileChange} required disabled={isFormDisabled} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="4" onChange={handleChange} required disabled={isFormDisabled}></textarea>
          </div>
          <button type="submit" className="submit-btn" disabled={isSubmitDisabled}>
            Submit OD Request
          </button>
        </form>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ApplyOD;