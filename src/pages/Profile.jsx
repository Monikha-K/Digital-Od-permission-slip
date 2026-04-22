import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/apiService';
import '../styles/Profile.css';

function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', profilePhoto: null });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await authAPI.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setForm({ name: profile.name, email: profile.email, password: '', confirmPassword: '', profilePhoto: null });
    setPhotoPreview(null);
    setError('');
    setSuccess('');
    setEditing(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, profilePhoto: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password && form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    setSaving(true);
    const data = new FormData();
    if (form.name  !== profile.name)  data.append('name',  form.name);
    if (form.email !== profile.email) data.append('email', form.email);
    if (form.password) data.append('password', form.password);
    if (form.profilePhoto) data.append('profilePhoto', form.profilePhoto);

    try {
      const { data: updated } = await authAPI.updateProfile(data);
      setProfile(updated);
      updateUser({ name: updated.name, email: updated.email, profilePhoto: updated.profilePhoto });
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const avatarSrc = photoPreview
    || (profile?.profilePhoto ? `http://localhost:5000/${profile.profilePhoto.replace(/\\/g, '/')}` : null);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <h1>Profile</h1>

        {error   && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {avatarSrc
                ? <img src={avatarSrc} alt="Profile" />
                : <div className="avatar-placeholder">{profile?.name?.charAt(0)}</div>
              }
            </div>
            <div className="profile-info">
              <h2>{profile?.name}</h2>
              <p className="role-badge">{profile?.role}</p>
            </div>
            {!editing && (
              <button className="edit-btn" onClick={startEdit}>Edit Profile</button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label>Profile Photo</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>New Password <span className="optional">(leave blank to keep current)</span></label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="New password"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="edit-actions">
                <button type="submit" className="submit-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-item">
                <label>Email</label>
                <p>{profile?.email}</p>
              </div>
              <div className="detail-item">
                <label>Department</label>
                <p>{profile?.department}</p>
              </div>
              {profile?.rollNumber && (
                <div className="detail-item">
                  <label>Roll Number</label>
                  <p>{profile.rollNumber}</p>
                </div>
              )}
              {profile?.staffId && (
                <div className="detail-item">
                  <label>Staff ID</label>
                  <p>{profile.staffId}</p>
                </div>
              )}
              {profile?.year && (
                <div className="detail-item">
                  <label>Year</label>
                  <p>{profile.year}</p>
                </div>
              )}
              {profile?.role === 'Student' && (
                <div className="detail-item">
                  <label>Approved OD Count</label>
                  <p>
                    <span className="od-count">{profile.approvedODCount}</span>
                    <span className="od-limit"> / 10</span>
                    <span className="od-note"> (fully approved by all)</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
