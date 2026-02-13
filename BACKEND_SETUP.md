# Frontend Setup with Backend Connection

## Install Dependencies

```bash
cd od-permission-system
npm install axios
```

## Start Backend Server

1. Open a terminal
2. Navigate to backend:
```bash
cd backend
npm install
```

3. Seed initial data:
```bash
node src/seed.js
```

4. Start backend:
```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

## Start Frontend

1. Open another terminal
2. Navigate to frontend:
```bash
cd od-permission-system
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Verify MongoDB Connection

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. You should see database: `od_permission_db`
4. Collections:
   - `users` - Contains admin1, cfi1, student1
   - `odrequests` - Will contain OD requests

## Test the Application

1. Register as Faculty:
   - Name: Test Faculty
   - Staff ID: FAC001
   - Department: CSE
   - Class Advisor: Yes
   - Year: 3
   - Email: faculty@college.edu
   - Username: faculty1
   - Password: 123456

2. Login as Student (student1 / 123456)
3. Apply for OD - You should see faculty1 in dropdowns
4. Check MongoDB Compass - Data should appear in collections

## Troubleshooting

### Backend not starting:
- Make sure MongoDB is running
- Check if port 5000 is available

### Frontend not connecting:
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Make sure axios is installed

### Data not appearing in MongoDB:
- Check backend console for errors
- Verify MongoDB connection string in .env
- Make sure you ran the seed script

## API Endpoints

All data now goes to MongoDB through these endpoints:
- POST /api/auth/register - Register user
- POST /api/auth/login - Login
- GET /api/users/mentors/:department - Get mentors
- GET /api/users/advisors/:department/:year - Get advisors
- POST /api/od-requests - Create OD request
- GET /api/od-requests/my-requests - Get student's requests
- GET /api/od-requests/faculty-requests - Get faculty's requests
