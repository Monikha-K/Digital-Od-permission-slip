import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { odAPI, adminAPI } from '../services/apiService';
import '../styles/ApplyOD.css';

function ApplyOD() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [days, setDays] = useState('');
  const [formData, setFormData] = useState({
    eventName: '', collegeName: '',
    department: user?.department || '',
    year: user?.year || '',
    fromDate: '', toDate: '', mentor: '', classAdvisor: '', description: ''
  });

  // Tomorrow's date as min value for date inputs
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleDaysChange = (e) => {
    const val = e.target.value;
    // Only allow positive integers
    if (val === '' || (Number(val) > 0 && Number.isInteger(Number(val)))) {
      setDays(val);
      setFormData(prev => ({ ...prev, fromDate: '', toDate: '' }));
    }
  };

  const handleFromDate = (e) => {
    const val = e.target.value;
    if (!val || !days || Number(days) < 1) {
      setFormData(prev => ({ ...prev, fromDate: val, toDate: '' }));
      return;
    }
    const from = new Date(val);
    const to = new Date(from);
    to.setDate(from.getDate() + Number(days) - 1);
    const toStr = to.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, fromDate: val, toDate: toStr }));
  };
  const [files, setFiles] = useState({});
  const [mentors, setMentors] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.department) {
      fetchMentors();
      if (user?.year) fetchAdvisors();
    }
  }, [user]);

  const fetchMentors = async () => {
    try {
      const { data } = await adminAPI.getMentors(user.department);
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchAdvisors = async () => {
    try {
      const { data } = await adminAPI.getAdvisors(user.department, user.year);
      setAdvisors(data);
    } catch (error) {
      console.error('Error fetching advisors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(formData.fromDate) <= today) {
      return setError('OD date must be a future date');
    }
    if (Number(days) > 1 && new Date(formData.toDate) <= today) {
      return setError('To date must be a future date');
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    Object.keys(files).forEach(key => {
      if (files[key]) data.append(key, files[key]);
    });
    data.append('days', days);

    try {
      await odAPI.create(data);
      setSuccess('OD request submitted successfully!');
      setTimeout(() => navigate('/student/od-history'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <h1>Apply for OD</h1>

        {user?.isBlocked && (
          <div className="error-message" style={{ fontSize: '15px', marginBottom: '24px' }}>
            🚫 You are blocked from applying for OD. Please contact your Class Advisor or Admin.
          </div>
        )}

        {!user?.isBlocked && (
          <>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="od-form">
          <div className="form-row">
            <div className="form-group">
              <label>Event Name</label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>College Name</label>
              <input
                type="text"
                value={formData.collegeName}
                onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Number of Days</label>
              <input
                type="number"
                min="1"
                placeholder="Enter number of days"
                value={days}
                onChange={handleDaysChange}
                required
              />
            </div>
          </div>

          {days !== '' && Number(days) >= 1 && (
            <div className="form-row">
              <div className="form-group">
                <label>{Number(days) === 1 ? 'OD Date' : 'From Date'}</label>
                <input
                  type="date"
                  value={formData.fromDate}
                  min={minDate}
                  onChange={handleFromDate}
                  required
                />
              </div>
              {Number(days) > 1 && (
                <div className="form-group">
                  <label>To Date <span className="date-hint">(auto-calculated)</span></label>
                  <input
                    type="date"
                    value={formData.toDate}
                    readOnly
                    style={{ background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Select Mentor</label>
              <select
                value={formData.mentor}
                onChange={(e) => setFormData({...formData, mentor: e.target.value})}
                required
              >
                <option value="">Select Mentor</option>
                {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Select Class Advisor</label>
              <select
                value={formData.classAdvisor}
                onChange={(e) => setFormData({...formData, classAdvisor: e.target.value})}
                required
              >
                <option value="">Select Advisor</option>
                {advisors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Event Registration Form</label>
            <input
              type="file"
              onChange={(e) => setFiles({...files, registrationForm: e.target.files[0]})}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <div className="form-group">
            <label>Payment Proof</label>
            <input
              type="file"
              onChange={(e) => setFiles({...files, paymentProof: e.target.files[0]})}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <div className="form-group">
            <label>Event Poster / Brochure</label>
            <input
              type="file"
              onChange={(e) => setFiles({...files, eventPoster: e.target.files[0]})}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="4"
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit OD Request'}
          </button>
        </form>
        </>
        )}
      </div>
    </div>
  );
}

export default ApplyOD;
