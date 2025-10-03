# Authentication Flow Diagram

## 🔐 Complete Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND                              │
│                  (http://localhost:5173)                        │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ axios with JWT interceptors
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  src/utils/api.js                               │
│                                                                 │
│  • Base URL: https://localhost:7034/api                        │
│  • Request Interceptor: Add JWT token to headers               │
│  • Response Interceptor: Handle 401 errors                     │
│  • Role Mapping: Backend ↔ Frontend                            │
│                                                                 │
│    SuperAdmin ↔ superadmin                                     │
│    FSO       ↔ admin                                           │
│    User      ↔ evaluator                                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              ASP.NET CORE WEB API                               │
│            (https://localhost:7034)                             │
│                                                                 │
│  Controllers:                                                   │
│  • AuthenticationController                                     │
│    - POST /api/Authentication/register                          │
│    - POST /api/Authentication/verify-otp                        │
│    - POST /api/Authentication/login                             │
│                                                                 │
│  • ProjectsController [Authorize(Roles="FSO,SuperAdmin")]      │
│    - GET    /api/Projects                                       │
│    - GET    /api/Projects/{id}                                  │
│    - POST   /api/Projects/create                                │
│    - PUT    /api/Projects/{id}                                  │
│    - DELETE /api/Projects/{id}                                  │
│                                                                 │
│  • SuperAdminController [Authorize(Roles="SuperAdmin")]        │
│    - GET  /api/SuperAdmin/getAllUsers                           │
│    - POST /api/SuperAdmin/assignProject                         │
│                                                                 │
│  Services:                                                      │
│  • JwtService - Token generation (3 hour expiry)               │
│  • MailService - SMTP email sending                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Entity Framework Core
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SQL SERVER DATABASE                           │
│                    (VisionDB)                                   │
│                                                                 │
│  Tables:                                                        │
│  • Users                                                        │
│    - UserId, Username, Email, PasswordHash                      │
│    - OtpCode, OtpExpiration, IsOtpVerified                     │
│    - RoleId (FK)                                               │
│                                                                 │
│  • Roles                                                        │
│    - RoleId (PK)                                               │
│    - RoleName ('SuperAdmin', 'FSO', 'User')                    │
│                                                                 │
│  • Projects                                                     │
│    - Id, StartupName, FounderName, Email, etc.                 │
│                                                                 │
│  • ProjectAssignments                                          │
│    - AssignmentId, ProjectId (FK), UserId (FK)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📧 Registration Flow with OTP

```
┌──────────────┐
│   FRONTEND   │
│  Register    │
│    Page      │
└──────┬───────┘
       │
       │ 1. POST /api/Authentication/register
       │    { username, email, password }
       ▼
┌──────────────────────────────────┐
│  AuthenticationController        │
│                                  │
│  • Hash password (SHA256)        │
│  • Create user with role "User"  │
│  • Generate 6-digit OTP          │
│  • Set OTP expiration (10 min)   │
│  • Save to database              │
│  • Send OTP email via SMTP       │
│  • Return success message        │
└────────┬─────────────────────────┘
         │
         │ 2. Response: "Check your email"
         ▼
┌──────────────┐
│   FRONTEND   │
│  OTP Input   │
│     Form     │
└──────┬───────┘
       │
       │ 3. POST /api/Authentication/verify-otp
       │    { email, otpCode }
       ▼
┌──────────────────────────────────┐
│  AuthenticationController        │
│                                  │
│  • Find user by email            │
│  • Check OTP code match          │
│  • Check OTP not expired         │
│  • Set IsOtpVerified = true      │
│  • Return success message        │
└────────┬─────────────────────────┘
         │
         │ 4. Response: "Email verified!"
         ▼
┌──────────────┐
│   FRONTEND   │
│ Redirect to  │
│    Login     │
└──────────────┘
```

---

## 🔑 Login Flow with JWT

```
┌──────────────┐
│   FRONTEND   │
│  Login Page  │
└──────┬───────┘
       │
       │ 1. POST /api/Authentication/login
       │    { email, password }
       ▼
┌──────────────────────────────────────────┐
│  AuthenticationController                │
│                                          │
│  • Find user by email                    │
│  • Verify password hash                  │
│  • Check IsOtpVerified = true            │
│  • Generate JWT token                    │
│    - Claims: UserId, Username, Email     │
│    - Claims: Role                        │
│    - Expiry: 3 hours                     │
│  • Return token + user details           │
└────────┬─────────────────────────────────┘
         │
         │ 2. Response:
         │    {
         │      token: "eyJhbGciOi...",
         │      username: "SuperAdmin",
         │      email: "superadmin@vision.com",
         │      role: "SuperAdmin"
         │    }
         ▼
┌──────────────────────────────────────────┐
│  api.js (Frontend)                       │
│                                          │
│  • Map backend role to frontend role     │
│    SuperAdmin → superadmin               │
│  • Return mapped user object             │
└────────┬─────────────────────────────────┘
         │
         │ 3. Mapped User:
         │    {
         │      username: "SuperAdmin",
         │      email: "superadmin@vision.com",
         │      role: "superadmin" ← MAPPED
         │    }
         ▼
┌──────────────────────────────────────────┐
│  AuthContext                             │
│                                          │
│  • Store token in localStorage           │
│    localStorage.setItem('token', ...)    │
│  • Store user in localStorage            │
│    localStorage.setItem('user', ...)     │
│  • Set currentUser state                 │
└────────┬─────────────────────────────────┘
         │
         │ 4. Navigate based on role
         ▼
┌──────────────────────────────────────────┐
│  if (role === 'superadmin')              │
│    → /superadmin/dashboard               │
│  if (role === 'admin')                   │
│    → /admin/dashboard                    │
│  if (role === 'evaluator')               │
│    → /evaluator/dashboard                │
└──────────────────────────────────────────┘
```

---

## 🛡️ Protected API Request Flow

```
┌──────────────┐
│   FRONTEND   │
│ Make API Call│
└──────┬───────┘
       │
       │ Example: GET /api/Projects
       ▼
┌──────────────────────────────────────────┐
│  api.js - Request Interceptor           │
│                                          │
│  const token = localStorage.getItem()   │
│  config.headers.Authorization =         │
│    `Bearer ${token}`                     │
│                                          │
│  Request Headers:                        │
│    Authorization: Bearer eyJhbGciOi...   │
└────────┬─────────────────────────────────┘
         │
         │ GET /api/Projects
         │ Header: Authorization: Bearer eyJ...
         ▼
┌──────────────────────────────────────────┐
│  ASP.NET Core Middleware                 │
│                                          │
│  • JWT Authentication Middleware         │
│    - Validate token signature            │
│    - Check token expiration              │
│    - Extract claims (UserId, Role)       │
│  • Authorization Middleware              │
│    - Check [Authorize] attribute         │
│    - Verify user has required role       │
└────────┬─────────────────────────────────┘
         │
         ├─── ✅ Valid Token + Correct Role
         │
         ▼
┌──────────────────────────────────────────┐
│  ProjectsController                      │
│                                          │
│  [Authorize(Roles = "FSO,SuperAdmin")]   │
│  public async Task<IActionResult> Get()  │
│  {                                       │
│    var projects = await _context         │
│      .Projects.ToListAsync();            │
│    return Ok(projects);                  │
│  }                                       │
└────────┬─────────────────────────────────┘
         │
         │ 200 OK
         │ Body: [ { id: 1, ... }, ... ]
         ▼
┌──────────────┐
│   FRONTEND   │
│ Display Data │
└──────────────┘

         │
         └─── ❌ Invalid/Expired Token
              │
              ▼
         ┌─────────────────────────────┐
         │  401 Unauthorized Response  │
         └─────────────┬───────────────┘
                       │
                       ▼
         ┌─────────────────────────────────────┐
         │  api.js - Response Interceptor      │
         │                                     │
         │  if (status === 401) {              │
         │    localStorage.removeItem('token') │
         │    localStorage.removeItem('user')  │
         │    window.location.href = '/login'  │
         │  }                                  │
         └─────────────────────────────────────┘
```

---

## 📊 Role Authorization Matrix

| Endpoint | SuperAdmin | FSO (Admin) | User (Evaluator) |
|----------|-----------|------------|------------------|
| **Authentication** |
| POST /register | ❌ | ❌ | ✅ Anyone |
| POST /verify-otp | ❌ | ❌ | ✅ Anyone |
| POST /login | ✅ | ✅ | ✅ Anyone |
| **Projects** |
| GET /Projects | ✅ | ✅ | ❌ |
| POST /Projects/create | ✅ | ✅ | ❌ |
| PUT /Projects/{id} | ✅ | ✅ | ❌ |
| DELETE /Projects/{id} | ✅ | ✅ | ❌ |
| **Super Admin** |
| GET /SuperAdmin/getAllUsers | ✅ | ❌ | ❌ |
| POST /SuperAdmin/assignProject | ✅ | ❌ | ❌ |
| **Evaluations** |
| (Not implemented yet) | - | - | - |

---

## 🔄 Token Lifecycle

```
┌─────────────────────────────────────────────┐
│         User Logs In                        │
│  • JWT token generated (3 hour expiry)      │
│  • Token stored in localStorage             │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│    User Makes API Requests                  │
│  • Token auto-added to headers              │
│  • Backend validates token                  │
│  • Access granted if valid                  │
└────────┬────────────────────────────────────┘
         │
         ├───► Token Still Valid ─────┐
         │                            │
         │                            ▼
         │                    ┌──────────────┐
         │                    │ Continue     │
         │                    │ Using App    │
         │                    └──────────────┘
         │
         └───► Token Expired (3+ hours)
               │
               ▼
         ┌─────────────────────────────────┐
         │  Backend Returns 401            │
         │  • Frontend intercepts          │
         │  • Remove token from storage    │
         │  • Redirect to login            │
         └─────────────────────────────────┘
```

---

## 🗺️ Complete System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  REACT FRONTEND (Vite + React 19 + Tailwind CSS)            │ │
│  │                                                              │ │
│  │  Components:                                                 │ │
│  │  • Login.jsx       → Backend login with JWT                 │ │
│  │  • Register.jsx    → Backend registration + OTP             │ │
│  │  • AuthContext.jsx → Token management + role mapping        │ │
│  │                                                              │ │
│  │  Utils:                                                      │ │
│  │  • api.js          → Axios instance with interceptors       │ │
│  │  • localStorage.js → Backwards compatibility (seed data)    │ │
│  │                                                              │ │
│  │  Routes:                                                     │ │
│  │  • /login          → Public                                 │ │
│  │  • /register       → Public                                 │ │
│  │  • /superadmin/*   → Protected (role: superadmin)           │ │
│  │  • /admin/*        → Protected (role: admin)                │ │
│  │  • /evaluator/*    → Protected (role: evaluator)            │ │
│  └────────────────┬───────────────────────────────────────────────┘ │
│                   │                                                 │
│                   │ localStorage                                    │
│                   │ • token: JWT string                             │
│                   │ • user: { username, email, role }               │
└───────────────────┼─────────────────────────────────────────────────┘
                    │
                    │ HTTPS Requests
                    │ Authorization: Bearer <token>
                    ▼
┌────────────────────────────────────────────────────────────────────┐
│                    ASP.NET CORE BACKEND                             │
│                    (.NET 8.0 Web API)                               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  MIDDLEWARE PIPELINE                                         │ │
│  │  1. CORS (Allow frontend origin)                             │ │
│  │  2. JWT Authentication (Validate tokens)                     │ │
│  │  3. Authorization (Check roles)                              │ │
│  │  4. Static Files (Serve /Uploads)                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  CONTROLLERS                                                 │ │
│  │  • AuthenticationController (register, verify-otp, login)    │ │
│  │  • ProjectsController (CRUD + file upload)                   │ │
│  │  • SuperAdminController (user management, assignments)       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  SERVICES                                                    │ │
│  │  • JwtService (Token generation)                             │ │
│  │  • MailService (SMTP email sending)                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  DATA LAYER                                                  │ │
│  │  • VisionManagementContext (EF Core DbContext)               │ │
│  │  • Models: User, Role, Project, ProjectAssignment           │ │
│  │  • Migrations (Database schema)                              │ │
│  └────────────────┬─────────────────────────────────────────────┘ │
└───────────────────┼──────────────────────────────────────────────────┘
                    │
                    │ Entity Framework Core
                    ▼
┌────────────────────────────────────────────────────────────────────┐
│                      SQL SERVER                                     │
│                      Database: VisionDB                             │
│                                                                     │
│  Tables:                                                            │
│  • Users (UserId, Username, Email, PasswordHash, OtpCode, RoleId)  │
│  • Roles (RoleId, RoleName)                                        │
│  • Projects (Id, StartupName, FounderName, ...)                    │
│  • ProjectAssignments (AssignmentId, ProjectId, UserId)            │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📈 Data Flow Summary

### Authentication:
```
User Input → Frontend → API → Backend → Database → SMTP Email
   ↓
JWT Token ← Frontend ← API ← Backend ← Database
   ↓
localStorage (token + user)
   ↓
Subsequent Requests (token in header)
```

### Role Mapping:
```
Database Role: "SuperAdmin" → Backend API → api.js mapper → "superadmin" → Frontend
Database Role: "FSO"        → Backend API → api.js mapper → "admin"      → Frontend
Database Role: "User"       → Backend API → api.js mapper → "evaluator"  → Frontend
```

### Protected Routes:
```
User Request → Check localStorage token → Add to header → Backend validates
                                                             ↓
                                              ✅ Valid → Access granted
                                              ❌ Invalid/Expired → 401 → Logout → Login
```

---

**Status:** ✅ **AUTHENTICATION FULLY INTEGRATED**
**Date:** October 3, 2025
