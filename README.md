# Digital OD Permission Management System

A complete frontend-only web application for managing On-Duty (OD) permissions in educational institutions.

## Features

- **Role-Based Access Control**: Student, Faculty, and Admin roles
- **Sequential Approval Workflow**: Mentor → Class Advisor → Innovation Head → HOD → CFI
- **Document Management**: Upload and view registration forms, payment proofs, event posters, and certificates
- **LocalStorage Database**: All data persisted in browser's LocalStorage
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React 18
- React Router v6
- Vite
- Pure CSS (No frameworks)
- LocalStorage for data persistence

## Installation

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

## Build for Production

```bash
npm run build
```

## Default Login Credentials

### Student
- Username: `student1`
- Password: `123456`

### Faculty (Mentor)
- Username: `mentor1`
- Password: `123456`

### Faculty (Class Advisor)
- Username: `advisor1`
- Password: `123456`

### Faculty (Innovation Head)
- Username: `innovation1`
- Password: `123456`

### Faculty (HOD)
- Username: `hod1`
- Password: `123456`

### Faculty (CFI)
- Username: `cfi1`
- Password: `123456`

### Admin
- Username: `admin1`
- Password: `123456`

## Project Structure

```
src/
├── components/       # Reusable components
├── pages/           # Page components
├── styles/          # CSS files
├── context/         # React Context for state management
├── utils/           # Utility functions
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## User Roles

### Student
- Apply for OD
- View OD history
- Upload proof documents after approval

### Faculty
- View pending OD requests (based on role and department)
- Approve/Reject requests with remarks
- Sequential approval flow

### Admin
- Manage users (view/delete)
- View all OD records
- Filter by department
- Delete OD records

## Approval Flow

1. Student submits OD request
2. Mentor reviews → Approve/Reject
3. Class Advisor reviews → Approve/Reject
4. Innovation Head reviews → Approve/Reject
5. HOD reviews → Approve/Reject
6. CFI reviews → Approve/Reject
7. Final status updated

If any faculty rejects, the final status becomes "Rejected".

## Data Structure

All data is stored in LocalStorage:
- `users`: Array of user objects
- `odRequests`: Array of OD request objects
- `loggedUser`: Currently logged-in user

## License

MIT
