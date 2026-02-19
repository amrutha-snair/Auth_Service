🔐 Auth-service

A secure full-stack authentication service built with Node.js, Express, MongoDB, and Vanilla JavaScript.
This project implements production-style authentication architecture including JWT access tokens, refresh tokens, email verification, password reset, and token rotation.

Auth-service is designed to demonstrate real-world backend security practices instead of basic login-only authentication.

🚀 Features

User Signup with Email Verification (Dev Mode)

Secure Login with JWT Access Tokens

HTTP-Only Refresh Token Cookies

Refresh Token Rotation (Advanced Session Security)

Forgot Password & Reset Password Flow

Token Expiry Tracking (Dashboard)

Protected Session Handling

Toast Notifications & Multi-Page UI

Secure Password Hashing using bcrypt

🧠 Tech Stack
Frontend

HTML

CSS

Vanilla JavaScript (Fetch API)

Backend

Node.js

Express.js

MongoDB (Mongoose)

JWT (jsonwebtoken)

bcrypt (Password Hashing)

crypto (Secure Token Generation)

Cookie-based Authentication

📂 Project Structure
Auth-service/
│
├── frontend/
│   ├── app.js              # Frontend authentication logic
│   ├── index.html          # UI pages (Login, Signup, Dashboard)
│   └── styles.css
│
├── backend/
│   ├── controllers/
│   │   └── auth_controller.js   # Core authentication logic
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth_routes.js
│   └── server.js
│
└── README.md

🔐 Authentication Architecture

This project uses a modern dual-token authentication system:

Access Token (JWT) → Short-lived (15 minutes)

Refresh Token → Long-lived (7 days, HTTP-only cookie)

Why this architecture?

Because storing long-lived tokens in the browser is risky.
So access tokens stay in memory, and refresh tokens stay in secure cookies.

Less exposure = better security.

🔄 Complete Authentication Flow
1️⃣ Signup

User registers with email, name, and password

Password is hashed using bcrypt

Email verification token is generated using crypto

In development, token is returned instead of sending an email

2️⃣ Email Verification

User verifies account using verification token

Account cannot log in until verified

3️⃣ Login

Credentials are validated

Access Token (JWT) is returned

Refresh Token is stored in HTTP-only cookie

Session becomes authenticated

4️⃣ Token Refresh (Session Continuity)

When access token expires, /refresh endpoint is called

Backend verifies refresh token from cookie

Issues new access token

Rotates refresh token for security

5️⃣ Logout

Refresh token is removed from database

Cookie is cleared

Session is fully terminated

6️⃣ Forgot & Reset Password

Secure reset token generated (1-hour expiry)

New password is hashed before storing

All existing sessions are invalidated after reset

🛡️ Security Features Implemented

bcrypt Password Hashing (with salt rounds)

HTTP-Only Cookies (Prevents XSS attacks)

SameSite=Strict Cookie Policy (CSRF protection)

Refresh Token Rotation

Database Stored Refresh Tokens (Revocable sessions)

Email Verification Enforcement

Password Reset Token Expiry

Session Invalidation on Password Reset

User Enumeration Prevention (secure reset responses)


⚙️ Environment Variables

Create a .env file in the backend folder:

PORT=5000
MONGO_URI=your_mongodb_uri

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

NODE_ENV=development

📡 API Endpoints

Base Route: /api/auth

Method	Endpoint	Description
POST	/signup	Register a new user
GET	/verify-email	Verify email token
POST	/login	User login
POST	/refresh	Refresh access token
POST	/logout	Logout user
POST	/request-password-reset	Request password reset
POST	/reset-password	Reset user password
🖥️ Running the Project Locally
1. Clone the Repository
git clone https://github.com/your-username/Auth-service.git
cd Auth-service

2. Install Backend Dependencies
cd backend
npm install

3. Setup Environment Variables

Create a .env file and add your MongoDB URI and JWT secrets.

4. Start the Backend Server
npm run dev


5. Run the Frontend

Open the frontend index.html in a browser
(or use Live Server / any local server)

🧪 Development Notes

Email sending is mocked (verification token returned in response)

Password reset token is exposed only in development

Access token is stored in memory (not localStorage) for better security

Refresh token is stored in HTTP-only cookie for protection against XSS

📊 Token Lifecycle Overview
User Login
   ↓
Access Token (Short-lived)
   +
Refresh Token (HTTP-only cookie)

Access Token Expires
   ↓
/refresh endpoint
   ↓
New Access Token + Rotated Refresh Token

📈 Future Enhancements (Production Ready)

Email Service Integration (Nodemailer / SendGrid)

Rate Limiting & Brute Force Protection

OAuth (Google / GitHub Login)

Redis for Session Management

Refresh Token Hashing in Database

CSRF Token Protection

👨‍💻 Purpose of the Project

Auth-service was built to demonstrate a production-style authentication system with secure session management, token rotation, and advanced backend security practices suitable for real-world applications and backend-focused roles.
