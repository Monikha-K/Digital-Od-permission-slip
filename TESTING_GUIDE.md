# Installation & Testing Guide

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Installation Steps

### Step 1: Navigate to Project Directory
```bash
cd od-permission-system
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- react (^18.2.0)
- react-dom (^18.2.0)
- react-router-dom (^6.20.0)
- vite (^5.0.8)
- @vitejs/plugin-react (^4.2.1)

### Step 3: Start Development Server
```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Testing the Application

### Test 1: Student Registration & Login

1. Open `http://localhost:5173`
2. Click "Register here"
3. Select "Student" role
4. Fill in:
   - Name: Test Student
   - Roll Number: CS2024001
   - Department: Computer Science
   - Email: teststudent@college.edu
   - Username: teststudent
   - Password: 123456
5. Click "Register"
6. Login with the new credentials
7. ✅ Should redirect to Student Dashboard

### Test 2: Apply for OD

1. Login as student (student1 / 123456)
2. Click "Apply OD" from dashboard
3. Fill the form:
   - Event Name: Tech Conference 2024
   - College Name: MIT
   - OD From Date: Select a future date
   - OD To Date: Select a future date
   - Upload files (any files for testing)
   - Description: Attending tech conference
4. Click "Submit OD Request"
5. ✅ Should show success toast
6. ✅ Should redirect to OD History
7. ✅ Should see the new request with "Pending" status

### Test 3: Faculty Approval Workflow

#### Step 1: Mentor Approval
1. Logout from student account
2. Login as Mentor (mentor1 / 123456)
3. ✅ Should see the pending request
4. Click "Approve"
5. Add remark (optional): "Approved by mentor"
6. Click "Confirm"
7. ✅ Should show success toast
8. ✅ Request should move to "Approved" tab

#### Step 2: Class Advisor Approval
1. Logout and login as Class Advisor (advisor1 / 123456)
2. ✅ Should see the request in "Pending" tab
3. Click "Approve" and confirm
4. ✅ Request approved

#### Step 3: Innovation Head Approval
1. Logout and login as Innovation Head (innovation1 / 123456)
2. ✅ Should see the request in "Pending" tab
3. Click "Approve" and confirm
4. ✅ Request approved

#### Step 4: HOD Approval
1. Logout and login as HOD (hod1 / 123456)
2. ✅ Should see the request in "Pending" tab
3. Click "Approve" and confirm
4. ✅ Request approved

#### Step 5: CFI Approval (Final)
1. Logout and login as CFI (cfi1 / 123456)
2. ✅ Should see the request in "Pending" tab
3. Click "Approve" and confirm
4. ✅ Request approved
5. ✅ Final status should be "Approved"

### Test 4: Upload Proof (Student)

1. Logout and login as student (student1 / 123456)
2. Go to "OD History"
3. ✅ Should see "Upload Proof" button for approved request
4. Click "Upload Proof"
5. Upload:
   - Geo-tagged Photo
   - Certificate
6. Click "Submit Proof"
7. ✅ Should show "✓ Proof Uploaded"

### Test 5: Rejection Flow

1. Login as student and apply for another OD
2. Login as Mentor (mentor1 / 123456)
3. Click "Reject" on the new request
4. Add remark: "Event not relevant"
5. Click "Confirm"
6. ✅ Request should be rejected
7. Login as student
8. ✅ Should see "Rejected" status in OD History

### Test 6: Admin - User Management

1. Login as Admin (admin1 / 123456)
2. ✅ Should see "Manage Users" tab active
3. ✅ Should see all registered users
4. Test search:
   - Type "student" in search box
   - ✅ Should filter users
5. Click "Delete" on a test user
6. ✅ Should show confirmation modal
7. Click "Confirm"
8. ✅ User should be deleted
9. ✅ Should show success toast

### Test 7: Admin - OD Records

1. Still logged in as Admin
2. Click "OD Records" tab
3. ✅ Should see all OD requests
4. Test department filter:
   - Click "Computer Science"
   - ✅ Should show only CS department requests
5. Test search:
   - Type event name
   - ✅ Should filter results
6. Click "Delete" on a request
7. ✅ Should show confirmation modal
8. Confirm deletion
9. ✅ Request should be deleted

### Test 8: Registration Validation

1. Logout and go to Register page
2. Test email validation:
   - Enter email: test@gmail.com
   - ✅ Should show error: "Email must end with @college.edu"
3. Test password validation:
   - Enter password: 12345 (5 characters)
   - ✅ Should show error: "Password must be at least 6 characters"
4. Test duplicate username:
   - Use existing username
   - ✅ Should show error: "Username already exists"

### Test 9: Protected Routes

1. Logout from all accounts
2. Try to access: `http://localhost:5173/student/dashboard`
3. ✅ Should redirect to login page
4. Try to access: `http://localhost:5173/faculty/dashboard`
5. ✅ Should redirect to login page
6. Try to access: `http://localhost:5173/admin/dashboard`
7. ✅ Should redirect to login page

### Test 10: Responsive Design

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)
4. ✅ Layout should adapt properly
5. ✅ All elements should be accessible
6. ✅ No horizontal scrolling

## Verification Checklist

### Authentication
- ✅ Login works
- ✅ Registration works
- ✅ Email validation works
- ✅ Password validation works
- ✅ Duplicate username prevention works
- ✅ Logout clears session
- ✅ Protected routes work

### Student Module
- ✅ Dashboard displays correctly
- ✅ Apply OD form works
- ✅ OD History shows requests
- ✅ Upload proof works
- ✅ Status badges display correctly

### Faculty Module
- ✅ Dashboard shows correct requests
- ✅ Pending/Approved/Rejected tabs work
- ✅ Approve functionality works
- ✅ Reject functionality works
- ✅ Sequential approval enforced
- ✅ Department filtering works

### Admin Module
- ✅ User management works
- ✅ OD records display
- ✅ Search functionality works
- ✅ Department filter works
- ✅ Delete operations work
- ✅ Confirmation modals work

### UI/UX
- ✅ Toast notifications appear
- ✅ Modals open and close
- ✅ Buttons respond to clicks
- ✅ Forms validate input
- ✅ Navigation works
- ✅ Responsive design works

### Data Persistence
- ✅ Data saves to LocalStorage
- ✅ Data persists after refresh
- ✅ Logout doesn't clear data
- ✅ Multiple users can be created

## Troubleshooting

### Issue: npm install fails
**Solution**: 
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### Issue: Port 5173 already in use
**Solution**:
- Kill the process using port 5173
- Or change port in `vite.config.js`

### Issue: Page not loading
**Solution**:
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

### Issue: LocalStorage data lost
**Solution**:
- Don't clear browser data
- Use same browser for testing
- Data is browser-specific

### Issue: Login not working
**Solution**:
- Check username and password
- Ensure account is registered
- Try default credentials

## Performance Testing

1. Open browser DevTools
2. Go to Performance tab
3. Record page load
4. ✅ Should load in < 2 seconds
5. Check Network tab
6. ✅ No external API calls
7. ✅ All resources load from local

## Browser Testing

Test on multiple browsers:
- ✅ Chrome
- ✅ Firefox
- ✅ Edge
- ✅ Safari

## Build for Production

```bash
npm run build
```

This creates optimized production build in `dist/` folder.

To preview production build:
```bash
npm run preview
```

## Success Criteria

All tests should pass with ✅ marks. If any test fails, review the code and fix the issue.

## Support

For issues:
1. Check console for errors
2. Verify LocalStorage data
3. Review USER_GUIDE.md
4. Check PROJECT_SUMMARY.md

## Next Steps

After successful testing:
1. Customize styling as needed
2. Add more departments
3. Add more faculty roles
4. Enhance validation
5. Add more features

## Conclusion

If all tests pass, the application is working correctly and ready for use!
