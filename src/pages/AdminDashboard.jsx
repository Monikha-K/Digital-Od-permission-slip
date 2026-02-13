import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getAllUsers, getAllODRequests, deleteUser as deleteUserAPI, deleteODRequest as deleteODRequestAPI } from '../utils/api';
import { DEPARTMENTS } from '../utils/departments';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [view, setView] = useState('users');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [users, setUsers] = useState([]);
  const [odRequests, setOdRequests] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, odData] = await Promise.all([
        getAllUsers(),
        getAllODRequests()
      ]);
      setUsers(usersData);
      setOdRequests(odData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = odRequests.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || r.department === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteUser = (userId) => {
    setSelectedItem({ type: 'user', id: userId });
    setShowModal(true);
  };

  const handleDeleteOD = (odId) => {
    setSelectedItem({ type: 'od', id: odId });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (selectedItem.type === 'user') {
        await deleteUserAPI(selectedItem.id);
        setToast({ message: 'User deleted successfully', type: 'success' });
      } else {
        await deleteODRequestAPI(selectedItem.id);
        setToast({ message: 'OD request deleted successfully', type: 'success' });
      }
      await fetchData();
      setShowModal(false);
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Failed to delete', type: 'error' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarLinks = [
    { path: '/admin/dashboard', label: 'Dashboard' }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} onLogout={handleLogout} />
      <div className="dashboard-content">
        <h1>Admin Dashboard</h1>
        
        <div className="view-tabs">
          <button className={view === 'users' ? 'active' : ''} onClick={() => setView('users')}>
            Manage Users
          </button>
          <button className={view === 'od' ? 'active' : ''} onClick={() => setView('od')}>
            OD Records
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {view === 'users' ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.username}</td>
                    <td>{u.role}</td>
                    <td>{u.department || 'N/A'}</td>
                    <td>{u.email}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDeleteUser(u._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="filter-buttons">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
                All
              </button>
              {DEPARTMENTS.map(dept => (
                <button 
                  key={dept}
                  className={filter === dept ? 'active' : ''} 
                  onClick={() => setFilter(dept)}
                >
                  {dept}
                </button>
              ))}
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Event</th>
                    <th>Department</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(r => (
                    <tr key={r._id}>
                      <td>{r.studentName}</td>
                      <td>{r.eventName}</td>
                      <td>{r.department}</td>
                      <td>{r.fromDate} to {r.toDate}</td>
                      <td>
                        <span className={`status status-${r.finalStatus.toLowerCase()}`}>
                          {r.finalStatus}
                        </span>
                      </td>
                      <td>
                        <button className="btn-delete" onClick={() => handleDeleteOD(r._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm Delete">
        <p>Are you sure you want to delete this {selectedItem?.type}?</p>
        <button className="btn-primary" onClick={confirmDelete}>Confirm</button>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminDashboard;
