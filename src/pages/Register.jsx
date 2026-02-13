import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerAPI } from '../utils/api';
import { DEPARTMENTS, YEARS } from '../utils/departments';
import '../styles/Register.css';

const Register = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    return email.endsWith('@college.edu');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Email must end with @college.edu');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const userData = { 
        ...formData, 
        role,
        isClassAdvisor: formData.isClassAdvisor === 'true'
      };
      await registerAPI(userData);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>Register</h1>
        <div className="role-selector">
          <button 
            className={role === 'student' ? 'active' : ''} 
            onClick={() => setRole('student')}
          >
            Student
          </button>
          <button 
            className={role === 'faculty' ? 'active' : ''} 
            onClick={() => setRole('faculty')}
          >
            Faculty
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {role === 'student' && (
            <>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Roll Number</label>
                <input type="text" name="rollNumber" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select name="department" onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <select name="year" onChange={handleChange} required>
                  <option value="">Select Year</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {role === 'faculty' && (
            <>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Staff ID</label>
                <input type="text" name="staffId" onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select name="department" onChange={handleChange} required>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Are you a Class Advisor?</label>
                <select name="isClassAdvisor" onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              {formData.isClassAdvisor === 'true' && (
                <div className="form-group">
                  <label>Class Advisor for Year</label>
                  <select name="advisorYear" onChange={handleChange} required>
                    <option value="">Select Year</option>
                    {YEARS.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label>Official Email</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" onChange={handleChange} required />
          </div>

          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="register-btn">Register</button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
