import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { odAPI } from '../services/apiService';
import '../styles/ApplyOD.css';

function UploadProof() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    if (files.geoTaggedPhoto) formData.append('geoTaggedPhoto', files.geoTaggedPhoto);
    if (files.certificate) formData.append('certificate', files.certificate);

    try {
      await odAPI.uploadProof(id, formData);
      setSuccess('Proof uploaded successfully!');
      setTimeout(() => navigate('/student/od-history'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <h1>Upload Proof Documents</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="od-form">
          <div className="form-group">
            <label>Geo-tagged Photo</label>
            <input
              type="file"
              onChange={(e) => setFiles({...files, geoTaggedPhoto: e.target.files[0]})}
              accept="image/*"
              required
            />
          </div>

          <div className="form-group">
            <label>Participation / Winning Certificate</label>
            <input
              type="file"
              onChange={(e) => setFiles({...files, certificate: e.target.files[0]})}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Proof'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadProof;
