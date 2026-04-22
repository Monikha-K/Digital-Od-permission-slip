import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { odAPI } from '../services/apiService';
import '../styles/UploadProofList.css';

function UploadProofList() {
  const [approvedODs, setApprovedODs] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [files, setFiles]             = useState({});
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => { fetchODs(); }, []);

  const fetchODs = async () => {
    try {
      const { data } = await odAPI.getMyRequests();
      setApprovedODs(data.filter(r => r.finalStatus === 'Approved'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isUploadable = (req) =>
    new Date(req.toDate) < today && !req.documents?.geoTagPhotoPath;

  const isUploaded = (req) => !!req.documents?.geoTagPhotoPath;

  const handleFileChange = (id, field, file) => {
    setFiles(prev => ({ ...prev, [id]: { ...prev[id], [field]: file } }));
  };

  const handleUpload = async (e, req) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const reqFiles = files[req.id] || {};
    if (!reqFiles.geoTaggedPhoto) return setError('Geo-tagged photo is required.');
    if (!reqFiles.certificate)    return setError('Participation certificate is required.');

    setUploadingId(req.id);
    const formData = new FormData();
    formData.append('geoTaggedPhoto', reqFiles.geoTaggedPhoto);
    formData.append('certificate',    reqFiles.certificate);

    try {
      await odAPI.uploadProof(req.id, formData);
      setSuccess(`Proof uploaded successfully for "${req.eventName}"!`);
      setFiles(prev => { const n = {...prev}; delete n[req.id]; return n; });
      fetchODs();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  const proofPendingCount = approvedODs.filter(isUploadable).length;

  const daysUntilUpload = (req) => {
    const end = new Date(req.toDate);
    end.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar proofCount={proofPendingCount} />
      <div className="main-content upl-page">

        {/* Header */}
        <div className="upl-header">
          <div>
            <h1 className="upl-title">Upload Proof</h1>
            <p className="upl-sub">Submit geo-tagged photo & certificate for your approved ODs</p>
          </div>
          {proofPendingCount > 0 && (
            <div className="upl-pending-badge">
              🔔 {proofPendingCount} proof{proofPendingCount > 1 ? 's' : ''} pending
            </div>
          )}
        </div>

        {error   && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {loading ? (
          <div className="upl-loading">Loading your approved ODs...</div>
        ) : approvedODs.length === 0 ? (
          <div className="upl-empty">
            <span className="upl-empty-icon">📭</span>
            <p>No approved OD requests yet.</p>
          </div>
        ) : (
          <div className="upl-list">
            {approvedODs.map(req => {
              const uploadable = isUploadable(req);
              const uploaded   = isUploaded(req);
              const days       = daysUntilUpload(req);
              const reqFiles   = files[req.id] || {};

              return (
                <div key={req.id} className={`upl-card ${uploaded ? 'uploaded' : uploadable ? 'ready' : 'locked'}`}>

                  {/* Card Header */}
                  <div className="upl-card-top">
                    <div className="upl-card-info">
                      <div className="upl-event-name">{req.eventName}</div>
                      <div className="upl-event-meta">
                        <span>🏫 {req.collegeName}</span>
                        <span>📅 {new Date(req.fromDate).toLocaleDateString()} – {new Date(req.toDate).toLocaleDateString()}</span>
                        <span>🏷️ {req.department}</span>
                      </div>
                    </div>
                    <div className="upl-card-status">
                      {uploaded ? (
                        <span className="upl-status-badge uploaded">✅ Proof Uploaded</span>
                      ) : uploadable ? (
                        <span className="upl-status-badge ready">📤 Upload Ready</span>
                      ) : (
                        <span className="upl-status-badge locked">
                          🔒 Available in {days} day{days !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Uploaded proof links */}
                  {uploaded && (
                    <div className="upl-done-section">
                      <div className="upl-done-row">
                        {req.documents?.geoTagPhotoPath && (
                          <a href={`http://localhost:5000/${req.documents.geoTagPhotoPath.replace(/\\/g, '/')}`}
                            target="_blank" rel="noopener noreferrer" className="upl-doc-link">
                            📸 View Geo-tagged Photo
                          </a>
                        )}
                        {req.documents?.certificatePath && (
                          <a href={`http://localhost:5000/${req.documents.certificatePath.replace(/\\/g, '/')}`}
                            target="_blank" rel="noopener noreferrer" className="upl-doc-link">
                            🏆 View Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upload form — only when uploadable and not yet uploaded */}
                  {uploadable && (
                    <form className="upl-form" onSubmit={(e) => handleUpload(e, req)}>
                      <div className="upl-form-row">
                        <div className="upl-field">
                          <label className="upl-label">
                            📸 Geo-tagged Photo
                            <span className="upl-required">*</span>
                          </label>
                          <p className="upl-hint">A photo taken at the event venue with location tag enabled</p>
                          <input
                            type="file"
                            accept="image/*"
                            className="upl-file-input"
                            onChange={e => handleFileChange(req.id, 'geoTaggedPhoto', e.target.files[0])}
                          />
                          {reqFiles.geoTaggedPhoto && (
                            <span className="upl-file-chosen">✓ {reqFiles.geoTaggedPhoto.name}</span>
                          )}
                        </div>
                        <div className="upl-field">
                          <label className="upl-label">
                            🏆 Participation / Winning Certificate
                            <span className="upl-required">*</span>
                          </label>
                          <p className="upl-hint">Certificate of participation or achievement from the event</p>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="upl-file-input"
                            onChange={e => handleFileChange(req.id, 'certificate', e.target.files[0])}
                          />
                          {reqFiles.certificate && (
                            <span className="upl-file-chosen">✓ {reqFiles.certificate.name}</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="upl-submit-btn"
                        disabled={uploadingId === req.id}
                      >
                        {uploadingId === req.id ? '⏳ Uploading...' : '📤 Submit Proof'}
                      </button>
                    </form>
                  )}

                  {/* Locked state info */}
                  {!uploadable && !uploaded && (
                    <div className="upl-locked-info">
                      <span>🔒</span>
                      <p>Upload will be enabled after your OD ends on <strong>{new Date(req.toDate).toLocaleDateString()}</strong></p>
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

export default UploadProofList;
