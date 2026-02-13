import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

// Auth APIs
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('user');
};

// User APIs
export const getAllUsers = async () => {
  const response = await axios.get(`${API_URL}/users`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getMentorsByDepartment = async (department) => {
  const response = await axios.get(`${API_URL}/users/mentors/${department}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getAdvisorsByDepartmentAndYear = async (department, year) => {
  const response = await axios.get(`${API_URL}/users/advisors/${department}/${year}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getCFI = async () => {
  const response = await axios.get(`${API_URL}/users/cfi`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getHODByDepartment = async (department) => {
  const response = await axios.get(`${API_URL}/users/hod/${department}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getInnovationHeadByDepartment = async (department) => {
  const response = await axios.get(`${API_URL}/users/innovation-head/${department}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}/users/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// OD Request APIs
export const createODRequest = async (odData) => {
  const response = await axios.post(`${API_URL}/od-requests`, odData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getMyODRequests = async () => {
  const response = await axios.get(`${API_URL}/od-requests/my-requests`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getFacultyODRequests = async () => {
  const response = await axios.get(`${API_URL}/od-requests/faculty-requests`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateODApproval = async (id, data) => {
  const response = await axios.put(`${API_URL}/od-requests/${id}/approve`, data, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const uploadProof = async (id, data) => {
  const response = await axios.put(`${API_URL}/od-requests/${id}/upload-proof`, data, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getAllODRequests = async () => {
  const response = await axios.get(`${API_URL}/od-requests/all`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const deleteODRequest = async (id) => {
  const response = await axios.delete(`${API_URL}/od-requests/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};
