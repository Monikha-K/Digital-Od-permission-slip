# Digital OD Permission System - User Guide

## Getting Started

### Installation Steps

1. Navigate to the project directory:
```bash
cd od-permission-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## User Roles and Access

### 1. Student Module

#### Login
- Use credentials: `student1` / `123456`
- Or register a new student account

#### Dashboard Features
- View welcome message with student information
- Quick access to Apply OD and OD History

#### Apply for OD
1. Click "Apply OD" from dashboard
2. Fill in the form:
   - Event Name
   - College Name
   - Department (auto-filled)
   - OD From Date
   - OD To Date
   - Upload Event Registration Form
   - Upload Payment Proof
   - Upload Event Poster
   - Description
3. Click "Submit OD Request"
4. Request is sent to Mentor for approval

#### OD History
- View all submitted OD requests
- Check approval status and current stage
- Upload proof documents after final approval:
  - Geo-tagged Photo
  - Participation/Winning Certificate

### 2. Faculty Module

#### Login
Faculty roles available:
- Mentor: `mentor1` / `123456`
- Class Advisor: `advisor1` / `123456`
- Innovation Head: `innovation1` / `123456`
- HOD: `hod1` / `123456`
- CFI: `cfi1` / `123456`

#### Dashboard Features
- View pending requests (only those awaiting your approval)
- View approved requests
- View rejected requests

#### Approval Process
1. Select "Pending" tab
2. Review OD request details:
   - Student information
   - Event details
   - Uploaded documents
3. Click "Approve" or "Reject"
4. Add optional remark
5. Confirm action

#### Sequential Approval Flow
- Mentor must approve first
- Then Class Advisor can approve
- Then Innovation Head can approve
- Then HOD can approve
- Finally CFI can approve
- If any faculty rejects, the request is rejected

### 3. Admin Module

#### Login
- Use credentials: `admin1` / `123456`

#### Dashboard Features

##### Manage Users
- View all registered users
- Search users by name or username
- Delete users (except yourself)
- View user details:
  - Name
  - Username
  - Role
  - Department
  - Email

##### OD Records
- View all OD requests across departments
- Filter by department:
  - Computer Science
  - Electronics
  - Mechanical
  - Civil
- Search by student name or event name
- View approval status
- Delete OD records if needed

## Registration

### Student Registration
1. Click "Register here" on login page
2. Select "Student" role
3. Fill in:
   - Name
   - Roll Number
   - Department
   - Official Email (must end with @college.edu)
   - Username
   - Password (minimum 6 characters)
4. Click "Register"

### Faculty Registration
1. Click "Register here" on login page
2. Select "Faculty" role
3. Fill in:
   - Staff Name
   - Staff ID
   - Department
   - Faculty Role (Mentor/Class Advisor/Innovation Head/HOD/CFI)
   - Official Email (must end with @college.edu)
   - Username
   - Password (minimum 6 characters)
4. Click "Register"

### Admin Registration
1. Click "Register here" on login page
2. Select "Admin" role
3. Fill in:
   - Admin Name
   - Official Email (must end with @college.edu)
   - Username
   - Password (minimum 6 characters)
4. Click "Register"

## Data Persistence

All data is stored in your browser's LocalStorage:
- User accounts
- OD requests
- Approval status
- Uploaded document references

**Note**: Clearing browser data will reset the application.

## Status Indicators

- **Pending** (Orange): Awaiting approval
- **Approved** (Green): Request approved
- **Rejected** (Red): Request rejected

## Approval Stages

Students can track their request through these stages:
1. Pending Mentor Approval
2. Pending Class Advisor Approval
3. Pending Innovation Head Approval
4. Pending HOD Approval
5. Pending CFI Approval
6. Completed (All approved)

## Tips

1. **Email Validation**: All emails must end with `@college.edu`
2. **Password Security**: Minimum 6 characters required
3. **Unique Usernames**: Each username must be unique
4. **Document Upload**: Supported formats - PDF, JPG, PNG
5. **Sequential Approval**: Faculty can only approve requests at their stage
6. **Department Filtering**: Faculty only see requests from their department

## Troubleshooting

### Cannot Login
- Verify username and password
- Check if account is registered
- Try default credentials

### OD Request Not Showing
- Check if you're in the correct department
- Verify the request hasn't been deleted
- Refresh the page

### Cannot Approve Request
- Ensure previous stage is approved
- Check if you're the correct faculty role
- Verify department matches

### Data Lost
- LocalStorage may have been cleared
- Re-register and create new requests

## Support

For issues or questions, refer to the README.md file or check the project documentation.
