# VisionManagement Backend Analysis

## 📋 Overview

**VisionManagement** is an **ASP.NET Core 8.0 Web API** backend that serves as the server-side component for the Project Evaluation System. It provides RESTful APIs for authentication, project management, and user assignments.

## 🏗️ Architecture

### Technology Stack
- **Framework:** ASP.NET Core 8.0 (Web API)
- **Database:** SQL Server (Entity Framework Core 8.0)
- **Authentication:** JWT (JSON Web Tokens)
- **ORM:** Entity Framework Core
- **Email Service:** SMTP (Gmail)
- **API Documentation:** Swagger/OpenAPI

## 📦 NuGet Packages

```xml
- Microsoft.EntityFrameworkCore (8.0.13)
- Microsoft.EntityFrameworkCore.SqlServer (8.0.13)
- Microsoft.AspNetCore.Authentication.JwtBearer (8.0.13)
- CsvHelper (33.1.0)
- ExcelDataReader (3.8.0)
- Swashbuckle.AspNetCore (6.6.2) - Swagger
```

## 🗂️ Project Structure

```
VisionManagement/
├── Controllers/
│   ├── AuthenticationController.cs    # Login, Register, OTP
│   ├── ProjectsController.cs          # CRUD for Projects
│   └── SuperAdminController.cs        # Admin operations
├── Models/
│   ├── User.cs                        # User entity
│   ├── Project.cs                     # Project entity
│   ├── Role.cs                        # Role entity
│   ├── ProjectAssignment.cs           # User-Project mapping
│   ├── ProjectCsvModel.cs             # CSV import model
│   └── VisionManagementContext.cs     # DbContext
├── Services/
│   ├── JwtService.cs                  # Token generation
│   └── MailService.cs                 # Email sending
├── DbSeeder/
│   └── DbSeeder.cs                    # Database seeding
├── Migrations/                        # EF migrations
├── Program.cs                         # App configuration
└── appsettings.json                   # Configuration
```

## 🔐 Authentication System

### JWT Configuration
```json
{
  "Jwt": {
    "Key": "[512-bit secret key]",
    "Issuer": "https://localhost:7034",
    "Audience": "https://localhost:7034"
  }
}
```

### Authentication Flow
1. **Register** → `/api/Authentication/register`
   - Creates user with default "User" role
   - Generates 6-digit OTP
   - Sends OTP via email
   - User status: `IsOtpVerified = false`

2. **Verify OTP** → `/api/Authentication/verify-otp`
   - Validates OTP code
   - Checks expiration (10 minutes)
   - Sets `IsOtpVerified = true`

3. **Login** → `/api/Authentication/login`
   - Validates credentials
   - Requires OTP verification
   - Returns JWT token with user details

### Password Security
- **Hashing Algorithm:** SHA256
- **Salt:** Not implemented (consider adding for production)
- **Password Policy:** No validation (should add minimum requirements)

## 👥 User Model

```csharp
public class User
{
    public int UserId { get; set; }
    public string Username { get; set; }
    public string PasswordHash { get; set; }
    public string Email { get; set; }
    public string? OtpCode { get; set; }
    public DateTime? OtpExpiration { get; set; }
    public bool IsOtpVerified { get; set; }
    public int RoleId { get; set; }
    public virtual Role Role { get; set; }
}
```

### Seeded Users
```csharp
1. SuperAdmin
   - Username: SuperAdmin
   - Email: superadmin@vision.com
   - Password: SuperAdmin@123
   - Role: SuperAdmin (RoleId: 2)

2. FSO (Faculty Service Officer)
   - Username: FSO
   - Email: fso@vision.com
   - Password: FSO@123
   - Role: FSO (RoleId: 3)
```

## 📁 Project Model

```csharp
public class Project
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; }
    
    // Basic Info
    public string? Username { get; set; }
    public string? StartupName { get; set; }
    public string? FounderName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    
    // Links
    public string? WebsiteLink { get; set; }
    public string? MobileAppLink { get; set; }
    
    // Details
    public string? StartupDescription { get; set; }
    public string? StartupStatus { get; set; }
    public string? SpotlightReason { get; set; }
    
    // Media Files (stored as file paths)
    public string? StartupLogo { get; set; }
    public string? FounderPhoto { get; set; }
    public string? ProjectDemoVideoLink { get; set; }
    public string? DefaultVideo { get; set; }
    public string? PitchVideo { get; set; }
    public string? Image1 { get; set; }
    public string? Image2 { get; set; }
    public string? Image3 { get; set; }
}
```

### File Upload Structure
```
VisionManagement/
└── Uploads/
    ├── logos/        # Startup logos
    ├── founders/     # Founder photos
    ├── videos/       # Demo and pitch videos
    └── images/       # Project images
```

## 🎯 API Endpoints

### Authentication Controller (`/api/Authentication`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user (evaluator) | ❌ |
| POST | `/verify-otp` | Verify email with OTP | ❌ |
| POST | `/login` | Login and get JWT token | ❌ |

**Register Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "User"
}
```

### Projects Controller (`/api/Projects`)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Get all projects | FSO, SuperAdmin |
| GET | `/{id}` | Get project by ID | FSO, SuperAdmin |
| POST | `/create` | Create new project | FSO, SuperAdmin |
| PUT | `/{id}` | Update project | FSO, SuperAdmin |
| DELETE | `/{id}` | Delete project | FSO, SuperAdmin |
| POST | `/bulk-upload` | Upload CSV/Excel | FSO, SuperAdmin |

**Create Project (Multipart Form Data):**
```
POST /api/Projects/create
Content-Type: multipart/form-data

Fields:
- Username
- StartupName
- FounderName
- Email
- Phone
- WebsiteLink
- MobileAppLink
- StartupDescription
- StartupStatus
- SpotlightReason

Files:
- StartupLogo (image)
- FounderPhoto (image)
- DefaultVideo (video)
- PitchVideo (video)
- Image1, Image2, Image3 (images)
```

### SuperAdmin Controller (`/api/SuperAdmin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/getAllUsers` | Get all evaluators (role: User) | SuperAdmin |
| POST | `/assignProject` | Assign project to evaluators | SuperAdmin |

**Assign Project Request:**
```json
{
  "projectId": 1,
  "userIds": [5, 6, 7]  // Evaluator IDs
}
```

## 🔗 Project Assignment System

### ProjectAssignment Model
```csharp
public class ProjectAssignment
{
    public int AssignmentId { get; set; }
    public int ProjectId { get; set; }
    public Project Project { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public DateTime AssignedAt { get; set; }
}
```

### Assignment Flow
1. SuperAdmin selects a project
2. SuperAdmin selects multiple evaluators (User role)
3. System creates `ProjectAssignment` records
4. Evaluators can view assigned projects
5. Evaluators submit evaluations (not implemented in backend yet)

## 📧 Email Service

### SMTP Configuration
```json
{
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "academicsfc3@gmail.com",
    "Password": "[app password]",
    "EnableTls": true
  }
}
```

### Email Templates
- **OTP Email:** Sent during registration with 6-digit code
- **Expiration:** 10 minutes

## 🛡️ Security Features

### 1. CORS Policy
```csharp
AllowAnyOrigin()
AllowAnyHeader()
AllowAnyMethod()
```
⚠️ **Production Warning:** Should restrict to specific frontend origin

### 2. JWT Authentication
- Token expiration: 3 hours
- Claims included:
  - UserId (NameIdentifier)
  - Username (Name)
  - Email
  - Role

### 3. Role-Based Authorization
```csharp
[Authorize(Roles = "FSO,SuperAdmin")]  // Multiple roles
[Authorize(Roles = "SuperAdmin")]      // Single role
```

## 🗄️ Database Schema

### Tables
1. **Users**
   - UserId (PK)
   - Username (unique)
   - Email (unique)
   - PasswordHash
   - OtpCode
   - OtpExpiration
   - IsOtpVerified
   - RoleId (FK)

2. **Roles**
   - RoleId (PK)
   - RoleName (e.g., "User", "SuperAdmin", "FSO")

3. **Projects**
   - Id (PK)
   - [All project fields]
   - Timestamp

4. **ProjectAssignments**
   - AssignmentId (PK)
   - ProjectId (FK)
   - UserId (FK)
   - AssignedAt

### Connection String
```
Server=FACULTY-PC-1212;
Database=VisionDB;
Trusted_Connection=True;
TrustServerCertificate=true
```

## 🔄 Missing Features (Not in Backend)

Compared to the React frontend, these features are **NOT** implemented in the backend:

### ❌ Evaluation System
- No Evaluation model
- No submission endpoint
- No score tracking
- No comments/feedback storage

### ❌ Admin Role
- Backend has "FSO" but frontend has "Admin"
- Role mismatch needs alignment

### ❌ CSV Parsing
- Endpoint exists but implementation incomplete
- No actual CSV processing logic

### ❌ File Download
- No endpoint to retrieve uploaded files
- No sample CSV download

## 🔧 Configuration

### appsettings.json
```json
{
  "ConnectionStrings": {
    "Aptech": "[SQL Server connection]"
  },
  "Jwt": {
    "Key": "[512-bit key]",
    "Issuer": "https://localhost:7034",
    "Audience": "https://localhost:7034"
  },
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "academicsfc3@gmail.com",
    "Password": "[app password]"
  }
}
```

## 🚀 Running the Backend

### Prerequisites
- .NET 8.0 SDK
- SQL Server
- Visual Studio / VS Code

### Steps
```bash
# Navigate to backend folder
cd VisionManagement

# Restore packages
dotnet restore

# Update database
dotnet ef database update

# Run the application
dotnet run
```

### URLs
- **API:** https://localhost:7034
- **Swagger:** https://localhost:7034/swagger
- **HTTP:** http://localhost:5034

## 🔀 Frontend-Backend Integration Gaps

### 1. User Roles Mismatch
| Frontend | Backend |
|----------|---------|
| superadmin | SuperAdmin ✅ |
| admin | FSO (not Admin) ❌ |
| evaluator | User ✅ |

### 2. Missing Backend APIs
- ❌ Evaluation submission
- ❌ Get evaluations by project
- ❌ Get evaluations by evaluator
- ❌ Update evaluation
- ❌ Get evaluation statistics

### 3. Data Structure Differences
- Frontend uses localStorage objects
- Backend uses SQL Server tables
- Need data transformation layer

### 4. Authentication Differences
- Backend requires OTP verification
- Frontend has no OTP flow
- Need to align registration process

## 📝 Recommendations

### Immediate Actions
1. **Add Evaluation Model and APIs**
   ```csharp
   public class Evaluation
   {
       public int Id { get; set; }
       public int ProjectId { get; set; }
       public int EvaluatorId { get; set; }
       public int Score { get; set; }
       public string Comments { get; set; }
       public string Strengths { get; set; }
       public string AreasForImprovement { get; set; }
       public DateTime SubmittedAt { get; set; }
   }
   ```

2. **Align Role Names**
   - Change "FSO" to "Admin" in backend
   - OR update frontend to use "FSO"

3. **Implement CSV Upload Logic**
   - Parse CSV files
   - Validate data
   - Bulk insert projects

4. **Add File Serving**
   - Endpoint to download uploaded files
   - Proper MIME type handling

### Security Improvements
1. Add password salt to hashing
2. Implement password complexity requirements
3. Add rate limiting for login attempts
4. Restrict CORS to specific origins
5. Add refresh tokens
6. Implement HTTPS redirect

### Production Readiness
1. Add logging (Serilog)
2. Implement exception handling middleware
3. Add input validation
4. Add API versioning
5. Set up health checks
6. Configure production connection strings

## 🎯 Summary

**VisionManagement** is a partially complete backend that provides:
- ✅ JWT authentication with OTP
- ✅ User management
- ✅ Project CRUD operations
- ✅ Project-Evaluator assignment
- ✅ File upload handling

**Missing for full integration:**
- ❌ Evaluation submission and retrieval
- ❌ Role name alignment
- ❌ CSV upload implementation
- ❌ Complete API coverage for frontend features

**Next Steps:**
1. Implement Evaluation APIs
2. Align frontend-backend data models
3. Update React app to use real APIs
4. Replace localStorage with HTTP calls
5. Add OTP flow to frontend registration

---

**Status:** ⚠️ Partially Complete - Needs Evaluation APIs
**Documentation Date:** October 3, 2025
