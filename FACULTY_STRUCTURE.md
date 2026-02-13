# Updated System Structure

## Departments
- CSE
- AIDS
- ECE
- EEE
- MECH
- CYBER
- CSBS
- AIML
- IT

## Faculty Structure Per Department

Each department has:
- 1 HOD
- 1 Innovation Head
- 10 Mentors
- 16 Class Advisors (4 per year × 4 years)

Total faculty per department: 28
Total faculty across 9 departments: 252

## Login Credentials Format

### HOD
- Username: `hod_cse`, `hod_aids`, etc.
- Password: `123456`

### Innovation Head
- Username: `innovation_cse`, `innovation_aids`, etc.
- Password: `123456`

### Mentors
- Username: `mentor1_cse`, `mentor2_cse`, ..., `mentor10_cse`
- Password: `123456`

### Class Advisors
- Year 1: `advisor1_1_cse`, `advisor1_2_cse`, `advisor1_3_cse`, `advisor1_4_cse`
- Year 2: `advisor2_1_cse`, `advisor2_2_cse`, `advisor2_3_cse`, `advisor2_4_cse`
- Year 3: `advisor3_1_cse`, `advisor3_2_cse`, `advisor3_3_cse`, `advisor3_4_cse`
- Year 4: `advisor4_1_cse`, `advisor4_2_cse`, `advisor4_3_cse`, `advisor4_4_cse`
- Password: `123456`

### CFI
- Username: `cfi1`
- Password: `123456`

### Admin
- Username: `admin1`
- Password: `123456`

### Student
- Username: `student1`
- Password: `123456`

## Student Registration

Students must provide:
- Name
- Roll Number
- Department (dropdown with 9 departments)
- Year (1, 2, 3, or 4)
- Email (@college.edu)
- Username
- Password

## Apply OD Process

1. Student selects department and year during registration
2. When applying for OD:
   - Department and Year are auto-filled
   - Student selects 1 Mentor from 10 available in their department
   - Student selects 1 Class Advisor from 4 available for their year
   - Innovation Head and HOD are auto-assigned based on department

## Approval Flow

1. Selected Mentor (must approve first)
2. Selected Class Advisor (unlocked after mentor approves)
3. Department Innovation Head (unlocked after advisor approves)
4. Department HOD (unlocked after innovation head approves)
5. CFI (unlocked after HOD approves)

## Faculty Dashboard Filtering

### Mentor
- Sees only requests where `request.selectedMentorId === user.id`

### Class Advisor
- Sees only requests where `request.selectedAdvisorId === user.id`

### Innovation Head
- Sees only requests where `request.department === user.department`

### HOD
- Sees only requests where `request.department === user.department`

### CFI
- Sees all requests from all departments

## OD Request Data Structure

```javascript
{
  id: number,
  studentId: number,
  studentName: string,
  department: string,
  year: string,
  selectedMentorId: number,
  selectedAdvisorId: number,
  innovationHeadId: number,
  hodId: number,
  eventName: string,
  collegeName: string,
  fromDate: string,
  toDate: string,
  description: string,
  documents: {
    registrationForm: string,
    paymentProof: string,
    poster: string,
    geoTagPhoto: string,
    certificate: string
  },
  approvals: {
    mentor: { status: string, remark: string },
    advisor: { status: string, remark: string },
    innovationHead: { status: string, remark: string },
    hod: { status: string, remark: string },
    cfi: { status: string, remark: string }
  },
  finalStatus: string,
  proofUploaded: boolean,
  createdAt: string
}
```

## Key Features

1. **Department Isolation**: Faculty only see requests from their department (except CFI)
2. **Mentor/Advisor Selection**: Students choose their own mentor and advisor
3. **Sequential Approval**: Each level unlocks only after previous approval
4. **10 OD Limit**: Students can have maximum 10 approved ODs
5. **Date-based Proof Upload**: Upload proof button appears only after OD end date
6. **Warning Notifications**: Alerts when 8+ ODs are approved

## Testing

To test the system:

1. Register as student with CSE department, Year 3
2. Login and apply for OD
3. Select a mentor (e.g., CSE Mentor 1)
4. Select a class advisor (e.g., CSE Year 3 Advisor 1)
5. Submit request
6. Login as selected mentor: `mentor1_cse` / `123456`
7. Approve the request
8. Login as selected advisor: `advisor3_1_cse` / `123456`
9. Approve the request
10. Login as innovation head: `innovation_cse` / `123456`
11. Approve the request
12. Login as HOD: `hod_cse` / `123456`
13. Approve the request
14. Login as CFI: `cfi1` / `123456`
15. Approve the request (final approval)
16. Login as student to see approved status
