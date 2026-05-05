# Complete Authentication System - Setup Checklist

## ✅ Installation Complete!

Your Next.js application now has a complete authentication system. Follow this checklist to get it up and running.

---

## 📋 Pre-Flight Checklist

### 1. **Environment Variables Setup**
- [ ] Open `.env.local`
- [ ] Add your Gmail email address to `EMAIL_USER`
- [ ] Add your Gmail App Password to `EMAIL_PASSWORD`
  - Generate at: https://myaccount.google.com/apppasswords
  - Requires 2FA enabled on Google Account
- [ ] Update `JWT_SECRET` (currently set to default, change for production)

### Current .env.local Status:
```env
✅ MONGODB_URI=configured
✅ DB_NAME=configured
✅ YOUTUBE_API_KEY=configured
⚠️  EMAIL_USER=needs your Gmail
⚠️  EMAIL_PASSWORD=needs your app password
⚠️  JWT_SECRET=needs to be changed from default
✅ JWT_EXPIRE=7d (already set)
```

---

## 📦 Packages Installation Status

- [x] **bcryptjs** `^3.0.3` - Password hashing
- [x] **jsonwebtoken** `^9.0.3` - JWT tokens
- [x] **nodemailer** `^8.0.7` - Email sending
- [x] All dependencies installed successfully

---

## 🗂️ File Structure Created

### Database Models
- [x] `lib/models/User.js` - User database operations
- [x] `lib/models/OTP.js` - OTP management

### Utilities
- [x] `lib/utils/passwordUtils.js` - Password hashing & comparison
- [x] `lib/utils/validators.js` - Email/password validation, OTP generation
- [x] `lib/utils/emailUtils.js` - Email sending via Nodemailer
- [x] `lib/utils/jwtUtils.js` - JWT token generation & verification

### Middleware
- [x] `lib/middleware/authMiddleware.js` - Authentication protection

### API Routes
- [x] `app/api/auth/signup/route.js`
- [x] `app/api/auth/verify-otp/route.js`
- [x] `app/api/auth/login/route.js`
- [x] `app/api/auth/login-otp/route.js`
- [x] `app/api/auth/verify-login-otp/route.js`
- [x] `app/api/auth/profile/route.js` (Protected example)

### Documentation
- [x] `AUTH_DOCUMENTATION.md` - Complete documentation
- [x] `QUICK_AUTH_REFERENCE.md` - Quick reference guide
- [x] `IMPLEMENTATION_SUMMARY.md` - Implementation overview
- [x] `AUTH_CHECKLIST.md` - This file

---

## 🚀 Getting Started

### Step 1: Configure Environment Variables
```bash
# Edit .env.local and add:
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
JWT_SECRET=your-new-secret-key-change-from-default
```

### Step 2: Start Development Server
```bash
npm run dev
```
Your app will run at `http://localhost:3000`

### Step 3: Test the Endpoints
Use Postman, Thunder Client, or curl to test:

**Test Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully. OTP sent to email.",
  "userId": "...",
  "email": "test@example.com"
}
```

### Step 4: Verify OTP
Check the email for OTP, then verify:
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Step 5: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**Response includes JWT token:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Step 6: Use Protected Routes
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔑 API Endpoints Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/signup` | POST | ❌ | Register new user |
| `/api/auth/verify-otp` | POST | ❌ | Verify signup OTP |
| `/api/auth/login` | POST | ❌ | Login with email+password |
| `/api/auth/login-otp` | POST | ❌ | Request login OTP |
| `/api/auth/verify-login-otp` | POST | ❌ | Verify login OTP |
| `/api/auth/profile` | GET | ✅ | Get user profile |

---

## 💾 Database Collections

MongoDB will automatically create:

### `users` Collection
Fields: `_id`, `email`, `mobile`, `password`, `isVerified`, `createdAt`, `updatedAt`

### `otps` Collection
Fields: `_id`, `email`, `otp`, `expiryTime`, `isVerified`, `createdAt`

---

## 🧪 Testing Scenarios

### ✅ Signup Flow
1. Register with valid email and strong password
2. Check email for OTP
3. Verify OTP to activate account
4. Account ready for login

### ✅ Login Flow - Password
1. Use email + password to login
2. Receive JWT token
3. Use token in Authorization header

### ✅ Login Flow - OTP
1. Request OTP with email
2. Check email for OTP
3. Verify OTP to get JWT token
4. Use token in Authorization header

### ✅ Protected Routes
1. Login to get token
2. Send request with `Authorization: Bearer <token>` header
3. Access protected resources

---

## ⚠️ Common Issues & Solutions

### Issue: "Failed to send OTP"
**Causes:**
- Gmail credentials incorrect
- Using regular Gmail password instead of App Password
- 2FA not enabled on Google Account

**Solution:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Generate 16-character password
4. Copy to `EMAIL_PASSWORD` in `.env.local`

### Issue: "Invalid email format"
**Solution:** Use a valid email address (e.g., user@example.com)

### Issue: "Password must be at least 8 characters..."
**Solution:** Use password with:
- Minimum 8 characters
- At least one UPPERCASE letter
- At least one lowercase letter
- At least one number

### Issue: "User already exists"
**Solution:** Use a different email address

### Issue: "Invalid or expired token"
**Causes:**
- Token missing "Bearer " prefix
- Token expired (default 7 days)
- Wrong JWT_SECRET

**Solution:**
- Use format: `Authorization: Bearer <token>`
- Login again to get new token
- Check JWT_SECRET in .env.local

### Issue: "OTP has expired"
**Solution:** OTP valid for 10 minutes. Request new one.

---

## 🔒 Security Reminders

- ⚠️ **IMPORTANT:** Change `JWT_SECRET` from default value for production
- 🔐 Never commit `.env.local` to Git (already in `.gitignore`)
- 🔐 Always use Gmail App Password, never regular password
- 🔐 Use HTTPS in production
- 🔐 Consider adding rate limiting for OTP requests
- 🔐 Consider adding CSRF protection
- 🔐 Consider adding account lockout after failed attempts

---

## 📚 Documentation

- **AUTH_DOCUMENTATION.md** - Detailed documentation of all endpoints and examples
- **QUICK_AUTH_REFERENCE.md** - Quick reference with API summary
- **IMPLEMENTATION_SUMMARY.md** - Overview of implementation
- **AUTH_CHECKLIST.md** - This checklist

---

## 🎯 Integration with Frontend

### Store JWT Token
```javascript
localStorage.setItem('authToken', response.data.token);
```

### Use Token in Requests
```javascript
const token = localStorage.getItem('authToken');
fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Add Logout
```javascript
function logout() {
  localStorage.removeItem('authToken');
  // Redirect to login page
}
```

---

## 📞 Quick Support

**If emails aren't sending:**
- Check EMAIL_USER and EMAIL_PASSWORD in .env.local
- Use Gmail App Password (not regular password)
- Enable 2FA on Google Account

**If authentication fails:**
- Verify email is verified (check OTP completion)
- Use correct password (case-sensitive)
- Check JWT token format in Authorization header

**If protected routes don't work:**
- Include `Authorization: Bearer <token>` header
- Token must be valid and not expired
- Test with getAuthUser() function in route

---

## ✨ Next Steps

1. [ ] Configure `.env.local` with Gmail credentials
2. [ ] Start dev server: `npm run dev`
3. [ ] Test all endpoints with Postman
4. [ ] Create frontend signup form
5. [ ] Create frontend login form
6. [ ] Store JWT in localStorage
7. [ ] Add token to API requests
8. [ ] Test protected routes
9. [ ] Deploy to production
10. [ ] Update JWT_SECRET before production

---

## 🎉 Success Checklist

- [ ] Environment variables configured
- [ ] Dev server running
- [ ] Signup endpoint tested
- [ ] OTP email received
- [ ] OTP verification successful
- [ ] Password login working
- [ ] JWT token received
- [ ] Protected route accessed with token
- [ ] OTP login flow working
- [ ] Profile endpoint returning user data

---

**Status:** ✅ READY TO USE
**Version:** 1.0.0
**Last Updated:** 2026-05-05

---

For detailed API documentation, see **AUTH_DOCUMENTATION.md**
