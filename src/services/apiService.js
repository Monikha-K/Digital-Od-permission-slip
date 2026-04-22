import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (formData) => api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (formData) => api.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const odAPI = {
  create: (formData) => api.post('/od', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyRequests: () => api.get('/od/my-requests'),
  getPending: () => api.get('/od/pending'),
  getFacultyRequests: (as) => api.get('/od/faculty-requests', { params: as ? { as } : {} }),
  approveReject: (id, data) => api.put(`/od/${id}/action`, data),
  uploadProof: (id, formData) => api.put(`/od/${id}/proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => api.get('/od/all', { params })
};

export const advisorAPI = {
  getProofSubmissions: () => api.get('/advisor/proof-submissions'),
  warnStudent:   (odRequestId, message) => api.post(`/advisor/warn/${odRequestId}`,   { message }),
  reportStudent: (odRequestId, message) => api.post(`/advisor/report/${odRequestId}`, { message }),
  getMyWarnings: () => api.get('/advisor/my-warnings')
};

export const adminAPI = {
  getUsers:   (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  blockUser:  (id) => api.put(`/admin/users/${id}/block`),
  unblockUser:(id) => api.put(`/admin/users/${id}/unblock`),
  getReports: () => api.get('/admin/reports'),
  getStats:   () => api.get('/admin/stats'),
  getMentors: (department) => api.get(`/admin/mentors/${department}`),
  getAdvisors:(department, year) => api.get(`/admin/advisors/${department}/${year}`)
};

export default api;
