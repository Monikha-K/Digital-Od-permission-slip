# Quick Start Guide

## Installation

1. Open terminal in the project directory
2. Run: `npm install`
3. Run: `npm run dev`
4. Open browser to `http://localhost:5173`

## Test the Application

### Test Student Flow
1. Login with: `student1` / `123456`
2. Click "Apply OD"
3. Fill the form and submit
4. Go to "OD History" to see your request

### Test Faculty Approval Flow
1. Logout from student account
2. Login as Mentor: `mentor1` / `123456`
3. See the pending request
4. Click "Approve" and confirm
5. Logout and login as Class Advisor: `advisor1` / `123456`
6. Approve the request
7. Continue with other faculty roles in sequence

### Test Admin Panel
1. Login as Admin: `admin1` / `123456`
2. View all users
3. View all OD records
4. Filter by department
5. Search functionality

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Student | student1 | 123456 |
| Mentor | mentor1 | 123456 |
| Class Advisor | advisor1 | 123456 |
| Innovation Head | innovation1 | 123456 |
| HOD | hod1 | 123456 |
| CFI | cfi1 | 123456 |
| Admin | admin1 | 123456 |

## Features Checklist

- ✅ Role-based authentication
- ✅ Student OD application
- ✅ Sequential approval workflow
- ✅ Document upload simulation
- ✅ OD history tracking
- ✅ Faculty dashboard with filters
- ✅ Admin user management
- ✅ Admin OD records management
- ✅ Department filtering
- ✅ Search functionality
- ✅ Toast notifications
- ✅ Modal confirmations
- ✅ Responsive design
- ✅ Pure CSS styling
- ✅ LocalStorage persistence

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Modal.jsx
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── Sidebar.jsx
│   ├── Table.jsx
│   └── Toast.jsx
├── context/            # React Context
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── AdminDashboard.jsx
│   ├── ApplyOD.jsx
│   ├── FacultyDashboard.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── StudentODHistory.jsx
├── styles/             # CSS files
│   └── [All CSS files]
├── utils/              # Utility functions
│   └── storage.js
├── App.jsx             # Main app
└── main.jsx            # Entry point
```

## Technologies Used

- React 18
- React Router v6
- Vite
- Pure CSS (No frameworks)
- LocalStorage API

## Notes

- All data is stored in browser LocalStorage
- No backend or API calls
- File uploads are simulated (only filenames stored)
- Email validation requires @college.edu domain
- Sequential approval workflow enforced
- Department-based filtering for faculty
