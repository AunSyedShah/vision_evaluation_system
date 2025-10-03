# Backend Integration Guide

## 🎉 Integration Complete!

The React frontend has been successfully integrated with the ASP.NET Core backend. This guide explains what was changed and how to use the system.

---

## ✅ What's Been Implemented

### 1. **API Service Layer** (`src/utils/api.js`)
- ✅ Axios instance with JWT token interceptors
- ✅ Automatic token injection in request headers
- ✅ Automatic logout on 401 (unauthorized) responses
- ✅ Role mapping: Backend ↔ Frontend
  - `SuperAdmin` ↔ `superadmin`
  - `FSO` ↔ `admin`
  - `User` ↔ `evaluator`
- ✅ API endpoints for authentication, projects, and super admin operations

### 2. **AuthContext** (`src/context/AuthContext.jsx`)
- ✅ Backend login with JWT token storage
- ✅ Backend registration with OTP email
- ✅ OTP verification function
- ✅ Token-based authentication
- ✅ Automatic role mapping

### 3. **Register Page** (`src/pages/Register.jsx`)
- ✅ Two-step registration flow:
  1. **Step 1:** Username, email, password form
  2. **Step 2:** OTP verification with email code
- ✅ OTP resend functionality
- ✅ 6-digit OTP input field
- ✅ Email confirmation message

### 4. **Login Page** (`src/pages/Login.jsx`)
- ✅ Backend authentication
- ✅ JWT token storage
- ✅ Role-based routing
- ✅ Updated demo credentials
- ✅ Loading states

### 5. **Environment Configuration**
- ✅ `.env` file with backend API URL
- ✅ `.env.example` for documentation
- ✅ Vite environment variable support

---

## 🔄 Role Mapping

| Frontend Role | Backend Role | Description |
|--------------|--------------|-------------|
| `superadmin` | `SuperAdmin` | System administrator with full access |
| `admin` | `FSO` | Faculty Service Officer (manages projects) |
| `evaluator` | `User` | Evaluator (reviews assigned projects) |

**The system automatically maps roles** when logging in or registering!

---

## 📧 Authentication Flow

### **Registration (Evaluator Only)**
1. User fills registration form (username, email, password)
2. Backend creates user account with `User` role
3. Backend generates 6-digit OTP and sends email
4. Frontend shows OTP input form
5. User enters OTP from email
6. Backend verifies OTP (valid for 10 minutes)
7. User can now login

### **Login (All Roles)**
1. User enters email and password
2. Backend validates credentials
3. Backend checks if OTP is verified (for evaluators)
4. Backend returns JWT token + user details
5. Frontend stores token in localStorage
6. Frontend maps backend role to frontend role
7. User redirected to appropriate dashboard

---

## 🔐 Demo Credentials

### From Backend Seeder:
```
Super Admin:
  Email: superadmin@vision.com
  Password: SuperAdmin@123
  Role: SuperAdmin → superadmin

Admin (FSO):
  Email: fso@vision.com
  Password: FSO@123
  Role: FSO → admin
```

### Evaluators:
- Register through `/register` page
- Must verify email with OTP before login

---

## 🚀 Running the Application

### 1. **Start the Backend**
```bash
cd VisionManagement
dotnet run
```
Backend will run at:
- HTTPS: `https://localhost:7034`
- HTTP: `http://localhost:5034`
- Swagger: `https://localhost:7034/swagger`

### 2. **Start the Frontend**
```bash
# In project root
bun run dev
```
Frontend will run at: `http://localhost:5173`

### 3. **Test the Flow**

#### Option A: Use Existing Admin Accounts
1. Go to `http://localhost:5173/login`
2. Use SuperAdmin or FSO credentials
3. Login successful → Redirect to dashboard

#### Option B: Register New Evaluator
1. Go to `http://localhost:5173/register`
2. Fill registration form
3. Check email for 6-digit OTP
4. Enter OTP on verification page
5. Go to login and sign in

---

## 🔧 Configuration

### Backend URLs
The backend runs on both HTTP and HTTPS (from launchSettings.json):
```
HTTP:  http://localhost:5063/api  (default)
HTTPS: https://localhost:7034/api (alternative - requires SSL cert)
```

Edit `.env` file to change backend URL:
```env
# Use HTTP (default - recommended for development)
VITE_API_URL=http://localhost:5063/api

# OR use HTTPS (production-like environment)
VITE_API_URL=https://localhost:7034/api
```

### CORS Configuration
Backend allows all origins by default. For production, update `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Specific origin
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

---

## 📡 API Endpoints Used

### Authentication
- `POST /api/Authentication/register` - Register new evaluator
- `POST /api/Authentication/verify-otp` - Verify OTP code
- `POST /api/Authentication/login` - Login and get JWT token

### Projects (SuperAdmin, FSO)
- `GET /api/Projects` - Get all projects
- `GET /api/Projects/{id}` - Get project by ID
- `POST /api/Projects/create` - Create project with files
- `PUT /api/Projects/{id}` - Update project
- `DELETE /api/Projects/{id}` - Delete project

### Super Admin
- `GET /api/SuperAdmin/getAllUsers` - Get all evaluators
- `POST /api/SuperAdmin/assignProject` - Assign project to evaluators

---

## 🔒 JWT Token Flow

### Token Storage
```javascript
// After successful login
localStorage.setItem('token', jwtToken);
localStorage.setItem('user', JSON.stringify(userObject));
```

### Automatic Token Injection
Axios interceptor automatically adds token to all requests:
```javascript
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Expiration
- Token valid for: **3 hours**
- On 401 response: Automatic logout and redirect to login

---

## ⚠️ Known Limitations

### 1. **Evaluation APIs Not Implemented**
The backend does NOT have evaluation submission/retrieval endpoints yet. The frontend still uses localStorage for:
- Submitting evaluations
- Viewing evaluation results
- "All Results" page

**To Implement:**
- Add `Evaluation` model in backend
- Create `EvaluationsController` with CRUD endpoints
- Update frontend to use API instead of localStorage

### 2. **CSV Upload Not Functional**
Backend has CSV upload endpoint but no implementation. Frontend upload will fail.

### 3. **File Serving**
Uploaded files (logos, videos) are saved to `/Uploads` folder but no download endpoint exists yet.

---

## 🐛 Troubleshooting

### Issue: "Network Error" on Login/Register
**Solution:** 
1. Make sure backend is running (`dotnet run`)
2. Check backend URL in `.env` file
3. Verify CORS is enabled in backend

### Issue: "OTP Email Not Received"
**Solution:**
1. Check `appsettings.json` SMTP configuration
2. Verify Gmail app password is correct
3. Check spam folder
4. Check backend console for email errors

### Issue: "401 Unauthorized" on API Calls
**Solution:**
1. Check if token exists: `localStorage.getItem('token')`
2. Verify token hasn't expired (3 hours)
3. Try logging in again
4. Check backend JWT configuration

### Issue: "Role Mismatch" After Login
**Solution:**
- Roles are automatically mapped by `api.js`
- Check browser console for role mapping logs
- Verify backend returns correct role in login response

### Issue: HTTPS Certificate Warning
**Solution:**
```bash
# Trust the dev certificate
dotnet dev-certs https --trust
```

---

## 📊 localStorage vs Backend

### Current State:
| Feature | Data Source |
|---------|------------|
| Authentication | ✅ Backend API |
| User Registration | ✅ Backend API |
| OTP Verification | ✅ Backend API |
| Projects (CRUD) | ⚠️ Backend API available, frontend not updated |
| Evaluations | ❌ localStorage (backend not implemented) |
| Project Assignments | ⚠️ Backend API available, frontend not updated |

### Future Updates:
1. Replace all localStorage project operations with API calls
2. Implement evaluation submission in backend
3. Update "All Results" page to fetch from backend
4. Add real-time updates with SignalR

---

## 🎨 Frontend Changes Summary

### Files Modified:
1. `src/context/AuthContext.jsx` - Backend integration
2. `src/pages/Login.jsx` - Async login with backend
3. `src/pages/Register.jsx` - OTP verification flow

### Files Created:
1. `src/utils/api.js` - Axios service layer
2. `.env` - Environment configuration
3. `.env.example` - Configuration template

### Dependencies Added:
- `axios@1.12.2` - HTTP client

---

## 🔄 Next Steps

### Phase 1: Complete Authentication ✅
- [x] Backend authentication
- [x] OTP verification
- [x] Role mapping
- [x] Token management

### Phase 2: Project Management (TODO)
- [ ] Update SuperAdmin/ProjectForm to use API
- [ ] Update ProjectList components to fetch from API
- [ ] Implement file upload with multipart/form-data
- [ ] Add CSV bulk upload functionality

### Phase 3: Evaluation System (TODO)
- [ ] Implement backend Evaluation model
- [ ] Create EvaluationsController
- [ ] Update evaluator submission to use API
- [ ] Update "All Results" to fetch from backend

### Phase 4: Production Ready (TODO)
- [ ] Add error boundaries
- [ ] Implement proper error handling
- [ ] Add loading spinners
- [ ] Add toast notifications
- [ ] Optimize API calls
- [ ] Add caching strategy

---

## 📞 Support

### Backend Logs
Check console output from `dotnet run` for API errors.

### Frontend Logs
Open browser DevTools Console (F12) for errors and API responses.

### Database
Use SQL Server Management Studio to view database:
```
Server: FACULTY-PC-1212
Database: VisionDB
```

---

## 🎯 Quick Test Checklist

- [ ] Backend running on `https://localhost:7034`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Can login with `superadmin@vision.com`
- [ ] Can login with `fso@vision.com`
- [ ] Can register new evaluator
- [ ] OTP email received
- [ ] OTP verification works
- [ ] New evaluator can login
- [ ] Proper dashboard shown based on role
- [ ] JWT token stored in localStorage
- [ ] Token auto-injected in API calls

---

**Status:** ✅ Authentication Complete | ⚠️ Projects & Evaluations Pending
**Last Updated:** October 3, 2025
