# UI Testing & Demo Guide

## 🚀 Quick Start

### 1. Start the Development Server
```bash
npm run dev
```
App runs on `http://localhost:3000`

### 2. Navigate to Auth Pages

**Signup:** `http://localhost:3000/auth/signup`
**Login:** `http://localhost:3000/auth/login`
**Profile:** `http://localhost:3000/auth/profile`
**Settings:** `http://localhost:3000/auth/settings`

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Signup Flow

**Step 1: Visit Signup Page**
- Navigate to `/auth/signup`
- You should see the signup form

**Step 2: Fill Signup Form**
```
Email: testuser@example.com
Password: TestPass123
Confirm Password: TestPass123
Mobile: (optional) +1234567890
```

**Step 3: Submit Form**
- Click "Create Account"
- You should see: "OTP sent to your email"
- Form switches to OTP input

**Step 4: Enter OTP**
- Check your Gmail inbox for OTP email
- Copy the 6-digit OTP
- Enter it in the OTP field
- Click "Verify OTP"

**Step 5: Success**
- See success message: "Account Created!"
- Click "Go to Login"
- Redirected to login page

**Expected Result:** ✅ Account created and verified

---

### Scenario 2: Login with Email & Password

**Step 1: Visit Login Page**
- Navigate to `/auth/login`
- "Password" tab should be selected by default

**Step 2: Fill Login Form**
```
Email: testuser@example.com
Password: TestPass123
```

**Step 3: Submit**
- Click "Login"
- Should see: "Login successful!"
- Redirected to home page

**Step 4: Verify Authentication**
- Look at Header - should show user icon instead of Login/Signup
- Click user icon to see dropdown with:
  - Email address
  - My Profile link
  - Settings link
  - Logout button

**Expected Result:** ✅ Successfully logged in

---

### Scenario 3: Login with OTP

**Step 1: Visit Login Page**
- Navigate to `/auth/login`
- Click "OTP" tab

**Step 2: Enter Email**
```
Email: testuser@example.com
```

**Step 3: Request OTP**
- Click "Send OTP"
- Should see: "OTP sent to your email"
- Form switches to OTP input

**Step 4: Enter OTP**
- Check Gmail for OTP email
- Copy the 6-digit OTP
- Enter in OTP field
- Click "Verify OTP"

**Step 5: Success**
- Should see: "Login successful!"
- Redirected to home page

**Expected Result:** ✅ Logged in via OTP

---

### Scenario 4: View User Profile

**Prerequisites:** Must be logged in

**Step 1: Access Profile**
- Option 1: Click user icon in header → "My Profile"
- Option 2: Navigate to `/auth/profile`

**Step 2: View Profile Information**
- Should see:
  - User avatar (first letter of email)
  - Email address
  - Verification status badge
  - Mobile number (if provided)
  - Account status
  - Member since date

**Step 3: Edit Profile**
- Click "Edit Profile" button
- Goes to settings page

**Expected Result:** ✅ Profile displayed correctly

---

### Scenario 5: Change Password

**Prerequisites:** Must be logged in

**Step 1: Visit Settings**
- From profile: Click "Edit Profile"
- Or navigate to `/auth/settings`

**Step 2: Fill Password Form**
```
Current Password: TestPass123
New Password: NewPass456
Confirm New Password: NewPass456
```

**Step 3: Check "Show passwords"**
- Toggle to verify passwords are entered correctly

**Step 4: Submit**
- Click "Update Password"
- Should see: "Password changed successfully!"

**Step 5: Logout and Login with New Password**
- Logout from header
- Try logging in with new password
- Should work successfully

**Expected Result:** ✅ Password changed

---

### Scenario 6: Protected Routes

**Step 1: Without Authentication**
- Logout from app (if logged in)
- Try to access `/auth/profile`
- Should redirect to `/auth/login`

**Step 2: After Authentication**
- Login successfully
- Navigate to `/auth/profile`
- Should display profile without redirect

**Expected Result:** ✅ Route protection working

---

### Scenario 7: Header UI Changes

**Without Authentication:**
- Header shows "Login" link (gray)
- Header shows "Sign Up" button (red)

**With Authentication:**
- Header shows user icon (blue)
- Clicking user icon shows dropdown menu
- Dropdown shows email and options

**After Logout:**
- Dropdown disappears
- User icon becomes Login/Signup buttons again

**Expected Result:** ✅ Header updates correctly

---

## ✅ Validation Testing

### Email Validation

**Invalid Emails (Should show error):**
```
test@        ❌
test.com     ❌
@example.com ❌
test @example.com ❌
```

**Valid Emails (Should work):**
```
test@example.com      ✅
user.name@example.co  ✅
test123@test.org      ✅
```

---

### Password Validation

**Invalid Passwords (Should show error):**
```
test            ❌ (too short)
testpass        ❌ (no uppercase, no number)
Testpass        ❌ (no number)
Test1234        ❌ (no special char)
```

**Valid Passwords (Should work):**
```
TestPass1       ✅
MyPass123       ✅
Admin@123       ✅
Secure.Pwd2     ✅
```

---

### OTP Validation

**Invalid OTP (Should show error):**
```
12345     ❌ (5 digits)
1234567   ❌ (7 digits)
ABCDEF    ❌ (not numbers)
```

**Valid OTP (Should work):**
```
123456    ✅
999999    ✅
000000    ✅
```

---

## 🎯 Visual Testing Checklist

### Signup Page
- [ ] Form displays correctly
- [ ] Email input works
- [ ] Password visibility toggle works
- [ ] Form validation shows errors
- [ ] OTP step appears after signup
- [ ] Success screen displays
- [ ] Links to login work

### Login Page
- [ ] Password tab works
- [ ] OTP tab works
- [ ] Tab switching is smooth
- [ ] Form validation works
- [ ] Success screen displays
- [ ] Redirects to home after login

### Profile Page
- [ ] Displays user info correctly
- [ ] Shows verification status
- [ ] Edit Profile button works
- [ ] Back link works
- [ ] Responsive on mobile

### Settings Page
- [ ] Password form displays
- [ ] Show/hide password toggle works
- [ ] Validation shows errors
- [ ] Success message appears on update
- [ ] Back link works
- [ ] Security tips visible

### Header
- [ ] Login/Signup buttons visible when logged out
- [ ] User icon visible when logged in
- [ ] Dropdown opens on click
- [ ] All dropdown links work
- [ ] Logout works correctly
- [ ] Responsive on mobile

---

## 🔍 Network Testing

### Signup Network Calls
```
1. POST /api/auth/signup
   Request: { email, password, mobile }
   Response: { message, userId, email }

2. POST /api/auth/verify-otp
   Request: { email, otp }
   Response: { message }
```

### Login Network Calls
```
1. POST /api/auth/login
   Request: { email, password }
   Response: { message, token, user }

2. POST /api/auth/login-otp
   Request: { email }
   Response: { message, email }

3. POST /api/auth/verify-login-otp
   Request: { email, otp }
   Response: { message, token, user }
```

### Protected Route Calls
```
1. GET /api/auth/profile
   Headers: { Authorization: Bearer <token> }
   Response: { message, user }
```

---

## 🐛 Debugging Tips

### Check Browser Console
- Look for JS errors
- Check API response status
- Verify network calls are made

### Check Network Tab
- Verify requests go to correct endpoints
- Check response status codes
- Verify headers include Authorization token

### Check LocalStorage
```javascript
// In browser console
localStorage.getItem('authToken') // Should show JWT token when logged in
localStorage.clear() // Clear all localStorage
```

### Check Auth Context State
```javascript
// In React DevTools
- User component
- AuthContext Provider
- Check context values
```

---

## 📝 Test Cases Summary

| Test Case | Steps | Expected | Status |
|-----------|-------|----------|--------|
| Signup | Form → OTP → Verify | Account created | ⬜ |
| Login Password | Email+Pass → Submit | Logged in, token stored | ⬜ |
| Login OTP | Email → OTP → Verify | Logged in, token stored | ⬜ |
| View Profile | Navigate to profile | User info displayed | ⬜ |
| Change Password | Old+New Pass → Submit | Password updated | ⬜ |
| Protected Route | Access /auth/profile | Logged in: show profile, Logged out: redirect | ⬜ |
| Logout | Click logout | Logged out, redirected | ⬜ |
| Validation | Invalid input | Error messages shown | ⬜ |
| Responsive | Mobile device | UI adapts correctly | ⬜ |
| Headers | View header | Shows correct buttons/menu | ⬜ |

---

## 🎬 Demo Script

**For stakeholders:** Follow this script for a smooth demo

1. **Start:** "Let me show you the new authentication system"
2. **Signup:** Walk through signup flow with new email
3. **OTP:** Show email receiving OTP
4. **Login:** Login with password
5. **Profile:** Show user profile with info
6. **Settings:** Show password change capability
7. **Header:** Highlight auth UI in header
8. **Logout:** Show logout and redirect
9. **Protected:** Try accessing protected page while logged out
10. **Finish:** "The system is fully functional and production-ready"

---

## 📞 Troubleshooting

**Signup page not showing?**
- Check if route `/auth/signup` exists
- Verify page.jsx is in correct directory
- Check browser console for errors

**OTP not sending?**
- Verify .env.local has EMAIL_USER and EMAIL_PASSWORD
- Check Gmail app password (not regular password)
- Check spam folder

**Can't login after signup?**
- Verify OTP was verified (check `isVerified` field in MongoDB)
- Try resetting with new account
- Check browser localStorage for token

**Protected routes redirecting?**
- Verify AuthProvider wraps app in layout.jsx
- Check token exists in localStorage
- Try logging in again

---

**Last Updated:** 2026-05-05
**Status:** Ready for Testing ✅
