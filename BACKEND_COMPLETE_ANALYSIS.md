# VisionManagement Backend - Complete Analysis

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: ASP.NET Core 8.0 Web API
- **ORM**: Entity Framework Core 8.0.13
- **Database**: SQL Server (VisionDB)
- **Authentication**: JWT Bearer Tokens (3-hour expiry)
- **Email Service**: SMTP (Gmail - academicsfc3@gmail.com)
- **API Documentation**: Swagger/OpenAPI
- **File Storage**: Local file system (Uploads folder)

### Server Configuration
- **HTTP**: http://localhost:5063 (Default)
- **HTTPS**: https://localhost:7034
- **CORS**: AllowAll policy enabled
- **Static Files**: Served from `/Uploads` directory

---

## 📊 Database Models

### 1. User Model
```csharp
public class User {
    int UserId (PK)
    string Username (Unique)
    string Email (Unique)
    string PasswordHash (SHA256)
    string? OtpCode
    DateTime? OtpExpiration
    bool IsOtpVerified
    int RoleId (FK)
    
    Role Role (Navigation)
}
```

### 2. Role Model
- **RoleId 1**: User (Evaluator)
- **RoleId 2**: SuperAdmin (TND)
- **RoleId 3**: FSO (CAH)

### 3. Project Model
```csharp
public class Project {
    int Id (PK)
    DateTime Timestamp
    string? Username
    string? StartupName
    string? FounderName
    string? Email
    string? Phone
    string? WebsiteLink
    string? MobileAppLink
    string? StartupDescription
    string? StartupStatus
    string? StartupLogo (File path)
    string? ProjectDemoVideoLink
    string? FounderPhoto (File path)
    string? SpotlightReason
    string? DefaultVideo (File path)
    string? PitchVideo (File path)
    string? Image1 (File path)
    string? Image2 (File path)
    string? Image3 (File path)
}
```

### 4. Evaluation Model
```csharp
public class Evaluation {
    int EvaluationId (PK)
    int ProjectId (FK)
    int UserId (FK) // Evaluator
    
    // Scores (1-10)
    int ProblemSignificance
    int InnovationTechnical
    int MarketScalability
    int TractionImpact
    int BusinessModel
    int TeamExecution
    int EthicsEquity
    
    // Comments
    string? Strengths
    string? Weaknesses
    string? Recommendation
    
    DateTime EvaluatedAt
    
    Project Project (Navigation)
    User User (Navigation)
}
```

### 5. ProjectAssignment Model
```csharp
public class ProjectAssignment {
    int AssignmentId (PK)
    int ProjectId (FK)
    int UserId (FK)
    DateTime AssignedAt
    
    Project Project (Navigation)
    User User (Navigation)
}
```

---

## 🔐 Authentication Flow

### Registration (POST /api/Authentication/register)
**Input**: `{ Username, Email, Password }`
**Process**:
1. Check if username/email already exists
2. Hash password with SHA256
3. Generate 6-digit OTP
4. Set OTP expiration (10 minutes)
5. Create user with RoleId = 1 (User/Evaluator)
6. Send OTP via email
7. Set IsOtpVerified = false

**Output**: Success message

### OTP Verification (POST /api/Authentication/verify-otp)
**Input**: `{ Email, Otp }`
**Process**:
1. Find user by email
2. Check if already verified
3. Validate OTP matches and not expired
4. Set IsOtpVerified = true
5. Clear OTP fields

**Output**: Success message

### Login (POST /api/Authentication/login)
**Input**: `{ Username, Password }`
**Process**:
1. Find user by username (includes Role)
2. Verify password hash matches
3. Check IsOtpVerified = true
4. Generate JWT token with claims:
   - NameIdentifier: UserId
   - Name: Username
   - Email: Email
   - Role: RoleName (SuperAdmin/FSO/User)
5. Token expires in 3 hours

**Output**: `{ token, username, role }`

---

## 🎯 API Endpoints

### AuthenticationController (No Auth Required)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/Authentication/register` | `{ Username, Email, Password }` | Success message |
| POST | `/api/Authentication/verify-otp` | `{ Email, Otp }` | Success message |
| POST | `/api/Authentication/login` | `{ Username, Password }` | `{ token, username, role }` |

---

### ProjectsController (FSO, SuperAdmin)
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/api/Projects` | FSO, SuperAdmin | - | Array of projects |
| GET | `/api/Projects/{id}` | FSO, SuperAdmin | - | Single project |
| POST | `/api/Projects/create` | FSO, SuperAdmin | FormData (multipart) | Created project |
| PUT | `/api/Projects/{id}` | FSO, SuperAdmin | FormData (multipart) | Updated project |
| DELETE | `/api/Projects/{id}` | FSO, SuperAdmin | - | Success message |

**FormData Fields for Create/Update**:
- Username, StartupName, FounderName, Email, Phone
- WebsiteLink, MobileAppLink
- StartupDescription, StartupStatus, SpotlightReason
- Files: StartupLogo, FounderPhoto, DefaultVideo, PitchVideo
- Files: Image1, Image2, Image3

**File Storage**:
- Logos: `/Uploads/logos/`
- Founders: `/Uploads/founders/`
- Videos: `/Uploads/videos/`
- Images: `/Uploads/images/`

---

### EvaluationsController

#### Evaluator Endpoints (User Role)
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/api/Evaluations/assigned` | User | - | Assigned projects |
| POST | `/api/Evaluations/{projectId}` | User | EvaluationDto | Created evaluation |
| GET | `/api/Evaluations/my` | User | - | My evaluations |

**EvaluationDto**:
```json
{
  "problemSignificance": 1-10,
  "innovationTechnical": 1-10,
  "marketScalability": 1-10,
  "tractionImpact": 1-10,
  "businessModel": 1-10,
  "teamExecution": 1-10,
  "ethicsEquity": 1-10,
  "strengths": "string",
  "weaknesses": "string",
  "recommendation": "string"
}
```

**Validation**:
- User must be assigned to project
- User can only evaluate once per project
- All scores must be 1-10

#### Admin Endpoints (SuperAdmin, FSO)
| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/api/Evaluations/project/{projectId}` | SuperAdmin, FSO | All evaluations for project |

---

### SuperAdminController (SuperAdmin Only)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/SuperAdmin/getAllUsers` | - | All users with "User" role |
| POST | `/api/SuperAdmin/assignProject` | `{ ProjectId, UserIds: [int] }` | Assignment confirmation |

**Assignment Process**:
1. Validates project exists
2. Validates all UserIds have "User" role
3. Creates ProjectAssignment records
4. Returns assigned usernames

---

## 👥 Role-Based Access Control (RBAC)

### SuperAdmin (Backend: SuperAdmin | Frontend: superadmin)
**Can Access**:
- All Projects endpoints (CRUD)
- All Evaluations (read)
- User management (getAllUsers)
- Project assignments (assignProject)

**Seeded Credentials**:
- Username: `SuperAdmin`
- Email: `superadmin@vision.com`
- Password: `SuperAdmin@123`
- RoleId: 2
- IsOtpVerified: true (seeded users bypass OTP)

### FSO/Admin (Backend: FSO | Frontend: admin)
**Can Access**:
- All Projects endpoints (CRUD)
- All Evaluations (read)

**Seeded Credentials**:
- Username: `FSO`
- Email: `fso@vision.com`
- Password: `FSO@123`
- RoleId: 3
- IsOtpVerified: true (seeded users bypass OTP)

### User/Evaluator (Backend: User | Frontend: evaluator)
**Can Access**:
- Get assigned projects
- Submit evaluation (once per project)
- View own evaluations

**Registration**:
- Must register via `/api/Authentication/register`
- Must verify OTP via email
- RoleId automatically set to 1

---

## 🔑 JWT Token Structure

### Claims
```json
{
  "nameid": "userId",
  "unique_name": "username",
  "email": "user@email.com",
  "role": "SuperAdmin|FSO|User",
  "exp": "timestamp (3 hours)",
  "iss": "VisionAPI",
  "aud": "VisionUsers"
}
```

### Configuration (appsettings.json)
```json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyWithAtLeast32Characters",
    "Issuer": "VisionAPI",
    "Audience": "VisionUsers"
  },
  "ConnectionStrings": {
    "Aptech": "Server=...;Database=VisionDB;..."
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "Port": 587,
    "SenderEmail": "academicsfc3@gmail.com",
    "SenderPassword": "..."
  }
}
```

---

## 📧 Email Service (MailService)

### SMTP Configuration
- **Server**: smtp.gmail.com
- **Port**: 587
- **SSL**: Enabled
- **Sender**: academicsfc3@gmail.com
- **Usage**: OTP verification emails

### Email Template
**Subject**: "Your OTP Code"
**Body**: 
```
Your OTP code is: {otpCode}
This code will expire in 10 minutes.
```

---

## 🗂️ Database Seeding

### Default Data (DbSeeder.cs)
1. **SuperAdmin User**
   - Username: SuperAdmin
   - Email: superadmin@vision.com
   - Password: SuperAdmin@123 (hashed)
   - RoleId: 2
   - IsOtpVerified: true

2. **FSO User**
   - Username: FSO
   - Email: fso@vision.com
   - Password: FSO@123 (hashed)
   - RoleId: 3
   - IsOtpVerified: true

**Note**: Seeded users have OTP verification bypassed for testing purposes.

---

## 🔒 Security Features

### Password Hashing
- **Algorithm**: SHA256
- **Format**: Lowercase hex string
- **Implementation**: System.Security.Cryptography.SHA256

### OTP Security
- **Length**: 6 digits (100000-999999)
- **Expiration**: 10 minutes
- **Storage**: Plain text in database (cleared after verification)
- **Validation**: Exact match + expiration check

### Authorization Attributes
```csharp
[Authorize(Roles = "SuperAdmin")]        // SuperAdmin only
[Authorize(Roles = "FSO,SuperAdmin")]    // FSO or SuperAdmin
[Authorize(Roles = "User")]              // Evaluators only
```

---

## 📁 File Upload Handling

### File Storage Structure
```
VisionManagement/
  Uploads/
    logos/        (StartupLogo files)
    founders/     (FounderPhoto files)
    videos/       (DefaultVideo, PitchVideo files)
    images/       (Image1, Image2, Image3 files)
```

### File Operations
1. **Upload**: Save with unique filename (Guid)
2. **Update**: Delete old file, save new one
3. **Delete**: Remove physical file from disk
4. **Access**: Via `/Uploads/{folder}/{filename}` URL

### Supported File Types
- Images: Common formats (jpg, png, gif, etc.)
- Videos: Common formats (mp4, avi, etc.)

---

## 🚀 Startup Configuration (Program.cs)

### Services
- JWT Bearer Authentication
- Entity Framework Core (SQL Server)
- Swagger/OpenAPI
- CORS (AllowAll)
- JwtService (Scoped)
- MailService (Scoped)
- DbSeeder (Scoped)

### Middleware Pipeline
1. Swagger (Development only)
2. HTTPS Redirection
3. CORS
4. Authentication
5. Database Seeding (on startup)
6. Authorization
7. Static Files (/Uploads)
8. Controllers

---

## 🔄 Frontend-Backend Integration Map

### Role Mapping
| Frontend | Backend | RoleId |
|----------|---------|--------|
| superadmin | SuperAdmin | 2 |
| admin | FSO | 3 |
| evaluator | User | 1 |

### API Call Requirements
1. **Registration**: `{ Username, Email, Password }` (capital letters)
2. **OTP Verification**: `{ Email, Otp }` (capital letters)
3. **Login**: `{ Username, Password }` (capital letters, username not email)
4. **Authorization Header**: `Bearer {token}`

### Expected Responses
- **Success**: Status 200, JSON data
- **Bad Request**: Status 400, error message string
- **Unauthorized**: Status 401, "Invalid username or password"
- **Forbidden**: Status 403, "Not assigned to project"
- **Not Found**: Status 404, "{Entity} not found"

---

## 📋 Workflow Summary

### New Evaluator Registration Flow
1. User fills registration form (username, email, password)
2. Frontend sends POST `/api/Authentication/register`
3. Backend creates user, generates OTP, sends email
4. User receives OTP email (expires in 10 min)
5. User enters OTP code
6. Frontend sends POST `/api/Authentication/verify-otp`
7. Backend marks IsOtpVerified = true
8. User can now login

### Login Flow
1. User enters username + password
2. Frontend sends POST `/api/Authentication/login`
3. Backend validates credentials + OTP verification
4. Backend generates JWT token (3 hours)
5. Frontend stores token in localStorage
6. Frontend redirects based on role mapping

### Project Assignment Flow (SuperAdmin)
1. SuperAdmin views all projects
2. SuperAdmin views all evaluators (User role)
3. SuperAdmin selects project + evaluators
4. Frontend sends POST `/api/SuperAdmin/assignProject`
5. Backend creates ProjectAssignment records
6. Evaluators can now see project in "assigned" list

### Evaluation Submission Flow (Evaluator)
1. Evaluator views assigned projects (GET `/api/Evaluations/assigned`)
2. Evaluator clicks project to evaluate
3. Evaluator fills evaluation form (7 scores + 3 comments)
4. Frontend sends POST `/api/Evaluations/{projectId}`
5. Backend validates assignment + no duplicate
6. Backend saves evaluation
7. Evaluator can view in "my evaluations"

### View All Results Flow (SuperAdmin/FSO)
1. Admin views all projects
2. Admin clicks project to see evaluations
3. Frontend sends GET `/api/Evaluations/project/{projectId}`
4. Backend returns all evaluations with user details
5. Frontend displays aggregate scores + individual reviews

---

## 🐛 Common Issues & Solutions

### Issue: 400 Bad Request on Login
**Cause**: Sending `{ email, password }` instead of `{ Username, Password }`
**Solution**: Use username field, capitalize field names

### Issue: 400 Bad Request on OTP Verification
**Cause**: Sending `{ email, otpCode }` instead of `{ Email, Otp }`
**Solution**: Capitalize field names (Email, Otp)

### Issue: 401 Unauthorized after login
**Cause**: User not OTP verified (IsOtpVerified = false)
**Solution**: Complete OTP verification before login

### Issue: 403 Forbidden on evaluation
**Cause**: User not assigned to project
**Solution**: SuperAdmin must assign project first

### Issue: CORS Error
**Cause**: Frontend origin not in CORS policy
**Solution**: Backend has AllowAll, check if backend is running

### Issue: File upload fails
**Cause**: Uploads folder doesn't exist
**Solution**: Folder auto-created on startup

---

## 📌 Testing Credentials

### SuperAdmin (Full Access)
- **Username**: `SuperAdmin`
- **Password**: `SuperAdmin@123`
- **Email**: superadmin@vision.com
- **Access**: All projects, all evaluations, user management

### FSO/Admin (Project Manager)
- **Username**: `FSO`
- **Password**: `FSO@123`
- **Email**: fso@vision.com
- **Access**: All projects, all evaluations

### Evaluator (Must Register)
- **Process**: Register → Verify OTP → Login
- **Access**: Assigned projects only, own evaluations

---

## 🎯 Next Steps for Frontend Integration

### Priority 1: Complete Authentication ✅
- [x] Login with username (not email)
- [x] Register with Username, Email, Password
- [x] OTP verification with Email, Otp
- [x] Store JWT token
- [x] Role mapping

### Priority 2: Projects CRUD 🟡
- [ ] Fetch all projects (SuperAdmin, Admin)
- [ ] Create project with file uploads (FormData)
- [ ] Update project with file replacement
- [ ] Delete project
- [ ] View project details

### Priority 3: Evaluations 🟡
- [ ] Fetch assigned projects (Evaluator)
- [ ] Submit evaluation form (7 scores + 3 comments)
- [ ] View my evaluations (Evaluator)
- [ ] View project evaluations (SuperAdmin, Admin)

### Priority 4: SuperAdmin Features 🟡
- [ ] Fetch all evaluators (getAllUsers)
- [ ] Assign projects to evaluators
- [ ] View all results with filtering

---

## 📚 Additional Resources

- **Swagger UI**: http://localhost:5063/swagger
- **Database**: VisionDB (SQL Server)
- **Email**: academicsfc3@gmail.com (for OTP testing)
- **File Access**: http://localhost:5063/Uploads/{folder}/{filename}

---

**Last Updated**: After fixing login/OTP field name casing issues
**Backend Version**: ASP.NET Core 8.0
**Database Schema**: Includes Evaluation + ProjectAssignment models
