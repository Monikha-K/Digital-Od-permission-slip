// Initialize mock data
export const initializeData = () => {
  if (!localStorage.getItem('users')) {
    const mockUsers = [
      {
        id: 1,
        username: 'student1',
        password: '123456',
        role: 'student',
        name: 'John Doe',
        rollNumber: 'CS2021001',
        department: 'CSE',
        year: '3',
        email: 'john.doe@college.edu'
      },
      {
        id: 1000,
        username: 'cfi1',
        password: '123456',
        role: 'faculty',
        facultyRole: 'CFI',
        name: 'Dr. CFI',
        email: 'cfi@college.edu'
      },
      {
        id: 1001,
        username: 'admin1',
        password: '123456',
        role: 'admin',
        name: 'Admin User',
        email: 'admin@college.edu'
      }
    ];
    localStorage.setItem('users', JSON.stringify(mockUsers));
  }

  if (!localStorage.getItem('odRequests')) {
    localStorage.setItem('odRequests', JSON.stringify([]));
  }
};

export const getUsers = () => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const addUser = (user) => {
  const users = getUsers();
  const newUser = { ...user, id: Date.now() };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

export const deleteUser = (userId) => {
  const users = getUsers().filter(u => u.id !== userId);
  localStorage.setItem('users', JSON.stringify(users));
};

export const getODRequests = () => {
  return JSON.parse(localStorage.getItem('odRequests') || '[]');
};

export const addODRequest = (request) => {
  const requests = getODRequests();
  const newRequest = {
    ...request,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    approvals: {
      mentor: { status: 'Pending', remark: '' },
      advisor: { status: 'Pending', remark: '' },
      cfi: { status: 'Pending', remark: '' }
    },
    finalStatus: 'Pending'
  };
  requests.push(newRequest);
  localStorage.setItem('odRequests', JSON.stringify(requests));
  return newRequest;
};

export const updateODRequest = (requestId, updates) => {
  const requests = getODRequests();
  const index = requests.findIndex(r => r.id === requestId);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    localStorage.setItem('odRequests', JSON.stringify(requests));
  }
};

export const deleteODRequest = (requestId) => {
  const requests = getODRequests().filter(r => r.id !== requestId);
  localStorage.setItem('odRequests', JSON.stringify(requests));
};
