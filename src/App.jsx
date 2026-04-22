import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ApplyOD from './pages/ApplyOD';
import ODHistory from './pages/ODHistory';
import UploadProof from './pages/UploadProof';
import UploadProofList from './pages/UploadProofList';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyODRequests from './pages/FacultyODRequests';
import ProofSubmissions from './pages/ProofSubmissions';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import './styles/index.css';
import './styles/Common.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '24px',
        fontWeight: '600'
      }}>
        Loading...
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  
  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '24px',
        fontWeight: '600'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'Student' && <Navigate to="/student/dashboard" replace />}
          {user?.role === 'Admin' && <Navigate to="/admin/dashboard" replace />}
          {['Mentor', 'ClassAdvisor', 'InnovationHead', 'HOD', 'CFI'].includes(user?.role) && <Navigate to="/faculty/dashboard" replace />}
        </ProtectedRoute>
      } />

      <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['Student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/apply-od" element={<ProtectedRoute allowedRoles={['Student']}><ApplyOD /></ProtectedRoute>} />
      <Route path="/student/od-history" element={<ProtectedRoute allowedRoles={['Student']}><ODHistory /></ProtectedRoute>} />
      <Route path="/student/upload-proof" element={<ProtectedRoute allowedRoles={['Student']}><UploadProofList /></ProtectedRoute>} />
      <Route path="/student/upload-proof/:id" element={<ProtectedRoute allowedRoles={['Student']}><UploadProof /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['Student']}><Profile /></ProtectedRoute>} />

      <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={['Mentor', 'ClassAdvisor', 'InnovationHead', 'HOD', 'CFI']}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/od-requests"       element={<ProtectedRoute allowedRoles={['Mentor', 'ClassAdvisor', 'InnovationHead', 'HOD', 'CFI']}><FacultyODRequests /></ProtectedRoute>} />
      <Route path="/faculty/proof-submissions" element={<ProtectedRoute allowedRoles={['ClassAdvisor']}><ProofSubmissions /></ProtectedRoute>} />
      <Route path="/faculty/profile"           element={<ProtectedRoute allowedRoles={['Mentor', 'ClassAdvisor', 'InnovationHead', 'HOD', 'CFI']}><Profile /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['Admin']}><Profile /></ProtectedRoute>} />
      
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
