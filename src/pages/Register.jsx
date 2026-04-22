import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';

const DEPARTMENTS = ['CSE', 'AIDS', 'ECE', 'EEE', 'MECH', 'CYBER', 'CSBS', 'AIML', 'IT'];

function Register() {
  const [userType, setUserType] = useState('Student');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', year: '',
    rollNumber: '', staffId: '', isClassAdvisor: false, advisorYear: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) data.append(key, formData[key]);
    });
    data.append('role', userType);
    if (profilePhoto) data.append('profilePhoto', profilePhoto);

    try {
      await register(data);
      navigate(userType === 'Student' ? '/student/dashboard' : '/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-card-header">
          <p className="college-name">Sri Eshwar College of Engineering</p>
          <h1>Digital OD Permission System</h1>
          <p className="subtitle">Create your account to get started</p>
        </div>

        <div className="user-type-selector">
          <button
            type="button"
            className={userType === 'Student' ? 'active' : ''}
            onClick={() => setUserType('Student')}
          >
            Student
          </button>
          <button
            type="button"
            className={userType === 'Faculty' ? 'active' : ''}
            onClick={() => setUserType('Faculty')}
          >
            Faculty
          </button>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Official Email</label>
            <input
              type="email"
              placeholder="Enter your college email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {userType === 'Student' ? (
            <div className="form-row">
              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. 22CS001"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Staff ID</label>
                <input
                  type="text"
                  placeholder="Enter your staff ID"
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  required
                />
              </div>
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={formData.isClassAdvisor}
                  onChange={(e) => setFormData({ ...formData, isClassAdvisor: e.target.checked })}
                />
                <span>I am a Class Advisor</span>
              </label>
              {formData.isClassAdvisor && (
                <div className="form-group">
                  <label>Advisor for Year</label>
                  <select
                    value={formData.advisorYear}
                    onChange={(e) => setFormData({ ...formData, advisorYear: e.target.value })}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label>Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files[0])}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
