# Authentication System Documentation

## Overview
A complete authentication system with signup, email verification via OTP, password-based login, and OTP-based login.

---

## Setup Instructions

### 1. Environment Variables
Update your `.env.local` file with:

```env
# Gmail Configuration (for OTP emails)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

**Note:** For Gmail, use an App Password (not your regular Gmail password):
1. Enable 2-factor authentication on your Google Account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the generated password in `EMAIL_PASSWORD`

### 2. Database Collections
The system automatically creates the following MongoDB collections:
- `users` - Stores user account information
- `otps` - Stores OTP records for verification

---

## API Endpoints

### 1. **Signup (Register)**
**Endpoint:** `POST /api/auth/signup`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "mobile": "1234567890" // optional
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Response (201):**
```json
{
  "message": "User registered successfully. OTP sent to email.",
  "userId": "64f8d9c1e2b3a4c5d6e7f8g9",
  "email": "user@example.com"
}
```

**Response (400/409):**
```json
{
  "message": "User already exists with this email"
}
```

---

### 2. **Verify OTP (Complete Signup)**
**Endpoint:** `POST /api/auth/verify-otp`

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully. Account is now active."
}
```

**Response (400):**
```json
{
  "message": "OTP has expired"
}
```

---

### 3. **Login with Email & Password**
**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8d9c1e2b3a4c5d6e7f8g9",
    "email": "user@example.com",
    "isVerified": true
  }
}
```

---

### 4. **Request Login OTP**
**Endpoint:** `POST /api/auth/login-otp`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Login OTP sent to email successfully",
  "email": "user@example.com"
}
```

---

### 5. **Verify Login OTP**
**Endpoint:** `POST /api/auth/verify-login-otp`

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Login successful via OTP",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8d9c1e2b3a4c5d6e7f8g9",
    "email": "user@example.com",
    "isVerified": true
  }
}
```

---

### 6. **Get User Profile (Protected)**
**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "message": "Profile fetched successfully",
  "user": {
    "id": "64f8d9c1e2b3a4c5d6e7f8g9",
    "email": "user@example.com",
    "mobile": "1234567890",
    "isVerified": true
  }
}
```

---

## Using Authentication in Protected Routes

### Example: Protected API Route

```javascript
// app/api/protected/route.js
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/middleware/authMiddleware.js";
import User from "@/lib/models/User.js";

export async function GET(request) {
  try {
    // Extract authenticated user from JWT token
    const user = getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use user.userId or user.email to access protected resources
    const userDetails = await User.findById(user.userId);
    
    return NextResponse.json(
      { message: "Access granted", user: userDetails },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Frontend Integration Examples

### 1. Signup Form
```javascript
async function handleSignup(email, password) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (response.ok) {
    // Show OTP verification form
    console.log('OTP sent to:', data.email);
  }
}
```

### 2. Verify OTP
```javascript
async function handleVerifyOTP(email, otp) {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  
  const data = await response.json();
  if (response.ok) {
    // Signup complete, redirect to login
    console.log(data.message);
  }
}
```

### 3. Login with Email & Password
```javascript
async function handleLogin(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (response.ok) {
    // Store JWT token
    localStorage.setItem('authToken', data.token);
    // Redirect to dashboard
  }
}
```

### 4. Login with OTP
```javascript
// Step 1: Request OTP
async function requestLoginOTP(email) {
  const response = await fetch('/api/auth/login-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
}

// Step 2: Verify OTP
async function verifyLoginOTP(email, otp) {
  const response = await fetch('/api/auth/verify-login-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('authToken', data.token);
  }
}
```

### 5. API Request with Authentication
```javascript
async function getProfile() {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('/api/auth/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

---

## File Structure

```
lib/
├── models/
│   ├── User.js          # User database model
│   └── OTP.js           # OTP database model
├── utils/
│   ├── passwordUtils.js # Password hashing & comparison
│   ├── validators.js    # Email/password validation, OTP generation
│   ├── emailUtils.js    # Email sending via Nodemailer
│   └── jwtUtils.js      # JWT token generation & verification
└── middleware/
    └── authMiddleware.js # Authentication middleware

app/api/auth/
├── signup/
│   └── route.js         # User registration
├── verify-otp/
│   └── route.js         # OTP verification for signup
├── login/
│   └── route.js         # Email + password login
├── login-otp/
│   └── route.js         # Request login OTP
├── verify-login-otp/
│   └── route.js         # Verify login OTP
└── profile/
    └── route.js         # Get user profile (protected)
```

---

## Security Features

✅ **Password Hashing**: Using bcryptjs with salt rounds = 10
✅ **OTP Expiry**: OTP expires after 10 minutes
✅ **JWT Tokens**: Secure tokens with configurable expiry
✅ **Email Verification**: Required before account activation
✅ **Password Validation**: Enforces strong password requirements
✅ **SQL/NoSQL Injection Protection**: Using parameterized queries

---

## Troubleshooting

### Issue: "Failed to send OTP email"
**Solution**: Check your Gmail credentials and ensure:
- You've generated an App Password (not regular password)
- 2-Factor Authentication is enabled on your Google Account
- `EMAIL_USER` and `EMAIL_PASSWORD` are correctly set in `.env.local`

### Issue: "Invalid or expired token"
**Solution**: 
- Ensure token is sent in Authorization header with "Bearer " prefix
- Check if token has expired (default: 7 days)
- Regenerate token by logging in again

### Issue: "Email/Password mismatch"
**Solution**:
- Verify your email is verified first (check OTP verification status)
- Ensure you're using the correct password
- Try password reset with OTP login method

---

## Future Enhancements

- [ ] Add refresh token mechanism
- [ ] Implement password reset via OTP
- [ ] Add two-factor authentication (2FA)
- [ ] Social login integration (Google, GitHub)
- [ ] Rate limiting for OTP requests
- [ ] Email verification resend functionality
- [ ] Account lockout after multiple failed attempts
