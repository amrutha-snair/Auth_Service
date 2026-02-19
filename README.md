# 🔐 Auth-service

A secure full-stack authentication service built using **Node.js, Express, MongoDB, and Vanilla JavaScript**.  
This project implements a production-style authentication system including JWT access tokens, refresh tokens, email verification, password reset, and token rotation.

It is a Single Page Authentication UI built with pure HTML, CSS, and JavaScript (no frameworks like React).

---

## 🚀 Features

- User Signup with Email Verification (Dev Mode)
- Secure Login using JWT Access Tokens
- HTTP-Only Refresh Token Cookies
- Refresh Token Rotation (Session Security)
- Forgot Password & Reset Password Flow
- Protected Dashboard Session
- Token Expiry Display
- Toast Notification System
- Responsive Minimal UI (Vanilla CSS)

---

## 🧠 Tech Stack

### Frontend
- HTML5
- CSS3 (Custom UI + Responsive Design)
- Vanilla JavaScript (No React, No Frameworks)
- Fetch API

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens (JWT)
- bcrypt (Password Hashing)
- crypto (Secure Token Generation)
- Cookie-based Authentication

---

## 📂 Project Structure

Auth-service/
│
├── frontend/
│ ├── index.html # UI Pages (Login, Signup, Dashboard, Reset)
│ ├── styles.css # Complete UI Styling
│ └── app.js # Frontend Authentication Logic
│
├── backend/
│ ├── controllers/
│ │ └── auth_controller.js # Core Auth Logic
│ ├── models/
│ │ └── User.js # User Schema
│ ├── routes/
│ │ └── auth_routes.js
│ └── server.js
│
└── README.md


---

## 🔐 Authentication Architecture

This project follows a modern dual-token authentication strategy:

- **Access Token (JWT)** → Short-lived (e.g., 15 minutes)
- **Refresh Token** → Long-lived (stored in HTTP-only cookies)

Access tokens are stored in memory (not localStorage) to reduce XSS risks, while refresh tokens are securely stored in cookies and rotated for enhanced security.

---

## 🔄 Complete Authentication Flow

### 1. Signup
- User registers with name, email, and password
- Password is hashed using bcrypt
- Email verification token is generated using crypto
- In development mode, token is returned in API response

### 2. Email Verification
- User verifies account using verification token
- Login is blocked until email is verified

### 3. Login
- Credentials are validated against database
- Access Token is returned (JWT)
- Refresh Token is stored in HTTP-only cookie
- User enters authenticated dashboard

### 4. Token Refresh
- When access token expires, `/refresh` endpoint issues a new one
- Refresh token is rotated and re-stored in cookie
- Prevents replay attacks and session hijacking

### 5. Logout
- Refresh token is removed from database
- Cookie is cleared
- Session is fully terminated

### 6. Password Reset
- Secure reset token generated (1-hour expiry)
- New password is hashed before saving
- All existing sessions are invalidated after reset

---

## 🛡️ Security Features

- bcrypt Password Hashing with Salt Rounds
- HTTP-Only Cookies (Prevents XSS Token Theft)
- SameSite=Strict Cookie Policy (CSRF Protection)
- Refresh Token Rotation
- Database Stored Refresh Tokens (Revocable Sessions)
- Email Verification Enforcement
- Password Reset Token Expiry
- Session Invalidation on Password Reset
- User Enumeration Prevention (secure reset responses)

---

## 📡 API Endpoints

Base Route: `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /signup | Register a new user |
| GET | /verify-email | Verify email token |
| POST | /login | User login |
| POST | /refresh | Refresh access token |
| POST | /logout | Logout user |
| POST | /request-password-reset | Request reset token |
| POST | /reset-password | Reset user password |

---

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

PORT=5000
MONGO_URI=your_mongodb_uri

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

NODE_ENV=development


---

## 🖥️ Running the Project Locally

### 1. Clone the Repository
git clone https://github.com/your-username/Auth-service.git
cd Auth-service


### 2. Install Backend Dependencies
cd backend
npm install


### 3. Setup Environment Variables
Create a `.env` file and add your MongoDB URI and JWT secrets.


### 4. Start the Backend Server
npm run dev


### 5. Run the Frontend
Open `index.html` in your browser  
(or use Live Server / any local server)

---

## 🎨 UI Pages Included

- Login Page
- Signup Page
- Email Verification Page (Dev Mode)
- Forgot Password Page
- Reset Password Page
- Authenticated Dashboard

---

## 🧪 Development Notes

- Email sending is mocked (verification token returned in response)
- Password reset token is exposed only in development mode
- Access token is stored in memory instead of localStorage for better security
- Refresh token is stored in HTTP-only cookies

---

## 📊 Token Lifecycle Overview

Login → Access Token (Short-lived)
+ Refresh Token (HTTP-only cookie)

Access Token Expires
↓
/refresh API
↓
New Access Token + Rotated Refresh Token


---

## 📈 Future Improvements

- Email Service Integration (Nodemailer / SendGrid)
- Rate Limiting & Brute Force Protection
- OAuth (Google / GitHub Login)
- Redis for Session Storage
- CSRF Token Protection
- Refresh Token Hashing in Database

---

## 👨‍💻 Author

Built as a secure authentication service to demonstrate real-world backend authentication architecture, token management, and session security using a minimal Vanilla JS frontend and Node.js backend.
