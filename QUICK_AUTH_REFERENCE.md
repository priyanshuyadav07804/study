# Authentication System - Quick Reference

## 🚀 API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---|
| POST | `/api/auth/signup` | Register new user | ❌ |
| POST | `/api/auth/verify-otp` | Verify OTP & activate account | ❌ |
| POST | `/api/auth/login` | Email + Password login | ❌ |
| POST | `/api/auth/login-otp` | Request OTP for login | ❌ |
| POST | `/api/auth/verify-login-otp` | Verify login OTP & get token | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |

---

## 🔐 Authentication Flow

### Signup Flow
```
1. POST /api/auth/signup 
   ↓ (OTP sent to email)
2. POST /api/auth/verify-otp 
   ↓ (Account activated)
3. Account ready for login
```

### Login Flow - Password
```
1. POST /api/auth/login 
   ↓ (Credentials verified)
2. JWT token returned
   ↓
3. Use token for protected routes
```

### Login Flow - OTP
```
1. POST /api/auth/login-otp 
   ↓ (OTP sent to email)
2. POST /api/auth/verify-login-otp 
   ↓ (OTP verified)
3. JWT token returned
   ↓
4. Use token for protected routes
```

---

## 📋 Required .env Variables

```env
# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# MongoDB (already configured)
MONGODB_URI=your-mongodb-uri
DB_NAME=Website
```

---

## 🛠️ Core Files Created

**Models:**
- `lib/models/User.js` - User database operations
- `lib/models/OTP.js` - OTP database operations

**Utilities:**
- `lib/utils/passwordUtils.js` - Hash & compare passwords
- `lib/utils/validators.js` - Validate email, password, generate OTP
- `lib/utils/emailUtils.js` - Send OTP emails
- `lib/utils/jwtUtils.js` - Generate & verify JWT tokens

**Middleware:**
- `lib/middleware/authMiddleware.js` - Protect routes with JWT

**API Routes:**
- `app/api/auth/signup/route.js`
- `app/api/auth/verify-otp/route.js`
- `app/api/auth/login/route.js`
- `app/api/auth/login-otp/route.js`
- `app/api/auth/verify-login-otp/route.js`
- `app/api/auth/profile/route.js` (protected example)

---

## 💡 Using Auth in Your Routes

```javascript
import { getAuthUser } from "@/lib/middleware/authMiddleware.js";

export async function GET(request) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  // user.userId and user.email are available
}
```

---

## 📦 Installed Packages

- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `nodemailer` - Email sending

---

## ✅ Implementation Checklist

- [x] User model with MongoDB
- [x] OTP model with expiry
- [x] Password hashing with bcrypt
- [x] Email sending with Nodemailer
- [x] JWT token generation
- [x] Signup with OTP verification
- [x] Email + Password login
- [x] OTP-based login
- [x] Protected routes middleware
- [x] User profile endpoint
- [x] Environment variables configuration

---

## 🔄 Next Steps

1. Update `.env.local` with your Gmail App Password
2. Start development server: `npm run dev`
3. Test endpoints using Postman or curl
4. Integrate frontend forms with the API
5. Store JWT tokens in localStorage/cookies
6. Use JWT tokens for authenticated requests

---

## 🐛 Common Issues & Solutions

**Email not sending?**
- Use Gmail App Password, not regular password
- Enable Less Secure App Access (or use App Password)
- Check EMAIL_USER and EMAIL_PASSWORD in .env.local

**Token invalid?**
- Ensure Bearer prefix: `Authorization: Bearer <token>`
- Check if token has expired (default 7 days)
- Regenerate by logging in again

**OTP expired?**
- OTP is valid for 10 minutes
- Request a new OTP if expired

---

For detailed documentation, see **AUTH_DOCUMENTATION.md**
