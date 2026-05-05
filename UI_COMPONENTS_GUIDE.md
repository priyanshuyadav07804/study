# Authentication UI Components - Integration Guide

## Overview

A complete frontend authentication system with beautiful, responsive UI components using React, Next.js, and Tailwind CSS.

---

## 📄 Pages Created

### 1. **Signup Page**
**Route:** `/auth/signup`
**File:** `app/auth/signup/page.jsx`

**Features:**
- Email registration form
- Password strength validation (visual feedback)
- OTP verification step
- Success confirmation
- Link to login page

**States:**
- `register` - Initial signup form
- `otp` - OTP verification form
- `success` - Account created confirmation

---

### 2. **Login Page**
**Route:** `/auth/login`
**File:** `app/auth/login/page.jsx`

**Features:**
- Two login methods: Password & OTP
- Tab switching between methods
- Email + Password form
- OTP-based login flow
- Success message and redirect

**States:**
- `login` - Login form (with method tabs)
- `otp` - OTP verification form (for OTP login)
- `success` - Login successful confirmation

---

### 3. **User Profile Page**
**Route:** `/auth/profile`
**File:** `app/auth/profile/page.jsx`

**Features:**
- Display user profile information
- Email verification status badge
- Account creation date
- Edit profile button
- Member information

---

### 4. **Settings Page**
**Route:** `/auth/settings`
**File:** `app/auth/settings/page.jsx`

**Features:**
- Change password form
- Current password verification
- New password validation
- Security tips section
- Danger zone (delete account - placeholder)

---

## 🎯 Context & Hooks

### AuthContext
**File:** `app/context/AuthContext.jsx`

**Provides:**
```javascript
{
  user,           // Authenticated user object
  loading,        // Auth loading state
  token,          // JWT token
  isAuthenticated, // Boolean check
  logout          // Logout function
}
```

**Usage:**
```javascript
import { useAuth } from '@/app/context/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return <div>{user?.email}</div>;
}
```

---

## 🛡️ Components

### ProtectedRoute
**File:** `app/components/ProtectedRoute.jsx`

Wraps pages that require authentication. Redirects to login if not authenticated.

**Usage:**
```javascript
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}
```

### AuthenticatedHeader
**File:** `app/components/AuthenticatedHeader.jsx`

Shows user info and login/logout buttons based on auth state.

**Features:**
- Login/Signup buttons (when not authenticated)
- User dropdown menu (when authenticated)
- Profile link
- Settings link
- Logout button

---

## 🔄 Authentication Flow

### Signup Flow
```
User inputs email, password, mobile
           ↓
Validate form
           ↓
POST /api/auth/signup
           ↓
OTP sent to email
           ↓
User enters OTP
           ↓
POST /api/auth/verify-otp
           ↓
Account activated → Redirect to login
```

### Login Flow (Password)
```
User inputs email, password
           ↓
POST /api/auth/login
           ↓
JWT token received
           ↓
Store in localStorage
           ↓
Redirect to home
```

### Login Flow (OTP)
```
User inputs email
           ↓
POST /api/auth/login-otp
           ↓
OTP sent to email
           ↓
User enters OTP
           ↓
POST /api/auth/verify-login-otp
           ↓
JWT token received
           ↓
Store in localStorage → Redirect to home
```

---

## 📱 UI Features

### Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly buttons and inputs

### Visual Feedback
- Loading spinners during API calls
- Error messages in red banners
- Success messages in green banners
- Password strength indicators
- Form validation feedback

### Accessibility
- Proper label associations
- ARIA attributes
- Keyboard navigation support
- High contrast colors
- Focus indicators

### Security
- Password visibility toggle
- OTP input masking
- Secure token storage
- Protected routes
- XSS prevention

---

## 🎨 Styling

Uses Tailwind CSS for consistent styling:
- Color scheme: Blue/Indigo primary
- Spacing system: Consistent gaps and padding
- Typography: Clear hierarchy
- Shadows: Subtle depth
- Rounded corners: 8-10px border radius

---

## 🔗 Integration Example

### 1. Wrap app with AuthProvider
```javascript
// app/layout.jsx
import { AuthProvider } from '@/app/context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Use useAuth hook in components
```javascript
'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Welcome, {user?.email}!</div>;
}
```

### 3. Protect pages with ProtectedRoute
```javascript
'use client';

import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}
```

---

## 📊 Component Tree

```
RootLayout (AuthProvider)
├── Header (with auth UI)
└── Pages
    ├── / (Home)
    ├── /auth/signup (Public)
    ├── /auth/login (Public)
    ├── /auth/profile (Protected)
    └── /auth/settings (Protected)
```

---

## 🎯 Key Behaviors

### On Page Load
1. AuthProvider checks localStorage for token
2. If token exists, fetches user profile
3. Sets authentication state
4. Components update based on auth state

### On Signup
1. Validates email and password
2. Sends OTP to email
3. Switches to OTP verification form
4. On OTP verification, account is activated
5. Redirects to login page

### On Login
1. Validates credentials
2. API returns JWT token
3. Token stored in localStorage
4. User profile fetched and stored
5. Redirects to home page

### On Logout
1. Token removed from localStorage
2. User state cleared
3. Redirected to login or home page

---

## 🔐 Security Features

✅ **Password Hashing:** Bcrypt hashing on backend
✅ **Token Storage:** JWT in localStorage (consider httpOnly cookies for production)
✅ **Protected Routes:** Automatic redirection for unauthorized access
✅ **Input Validation:** Client-side and server-side validation
✅ **HTTPS:** Required for production
✅ **CORS:** Configured for your domain

---

## 🚀 Deployment Checklist

- [ ] Update EMAIL_USER and EMAIL_PASSWORD in production env
- [ ] Change JWT_SECRET to a strong random string
- [ ] Enable HTTPS on your domain
- [ ] Consider using httpOnly cookies for token storage
- [ ] Set up CORS for your domain
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up error logging and monitoring
- [ ] Test all authentication flows
- [ ] Consider adding 2FA

---

## 📝 Customization

### Change Colors
Update Tailwind classes in component files:
```jsx
className="bg-blue-600" // Change to bg-purple-600, etc
```

### Change OTP Expiry
In `lib/models/OTP.js`, line 13:
```javascript
const expiryTime = new Date(Date.now() + expiryMinutes * 60000); // Change 10 to desired minutes
```

### Change Password Requirements
In `lib/utils/validators.js`:
```javascript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // Modify regex
```

---

## 🐛 Common Issues

**OTP not received?**
- Check EMAIL_USER and EMAIL_PASSWORD
- Verify 2FA and App Password on Gmail
- Check spam folder

**Login failing?**
- Verify email is verified first
- Check password (case-sensitive)
- Ensure token is in localStorage

**Protected pages not loading?**
- Check AuthProvider is in root layout
- Verify token exists in localStorage
- Check user profile endpoint is working

---

## 📚 File Structure

```
app/
├── auth/
│   ├── signup/
│   │   └── page.jsx
│   ├── login/
│   │   └── page.jsx
│   ├── profile/
│   │   └── page.jsx
│   └── settings/
│       └── page.jsx
├── components/
│   ├── Header.jsx (updated with auth)
│   ├── AuthenticatedHeader.jsx
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx
└── layout.jsx (updated with AuthProvider)
```

---

**Status:** ✅ Ready to use
**Version:** 1.0.0
**Last Updated:** 2026-05-05
