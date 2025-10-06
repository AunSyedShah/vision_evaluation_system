# 🔍 VisionManagement Backend Analysis

## 📋 Executive Summary

**Backend Framework**: ASP.NET Core (C#)  
**Database**: SQL Server (VisionDB)  
**Authentication**: JWT Bearer Token  
**ORM**: Entity Framework Core  
**API Documentation**: Swagger/OpenAPI  

---

## 🏗️ Architecture Overview

### Technology Stack

```
ASP.NET Core Web API
├── Entity Framework Core (ORM)
├── JWT Authentication & Authorization
├── SQL Server Database
├── Swagger/OpenAPI Documentation
├── SMTP Email Service (Gmail)
└── File Upload Management (Uploads folder)
```

---

## 📊 Database Schema

### Tables & Entities

#### 1. **Users** (User.cs)
```csharp
public class User {
    int UserId                   // Primary Key
    string Username              // Unique, MaxLength 50
    string PasswordHash          // SHA256 hashed, MaxLength 255
    string Email                 // Unique, MaxLength 100
    string? OtpCode              // 6-digit code for verification
    DateTime? OtpExpiration      // OTP expiry timestamp
    bool IsOtpVerified           // Email verification status
    int RoleId                   // Foreign Key to Roles
    
    // Navigation
    Role Role
}
```

**Features**:
- ✅ OTP-based email verification
- ✅ SHA256 password hashing
- ✅ Role-based access control
- ✅ Unique username and email constraints

---

#### 2. **Roles** (Role.cs)
```csharp
public class Role {
    int RoleId                   // Primary Key
    string RoleName              // Unique, MaxLength 50
    
    // Navigation
    List<User> Users
}
```

**Default Roles**:
- `SuperAdmin` (RoleId: 2) - Full system access
- `FSO` (RoleId: 3) - Field Sales Officer
- `User` (RoleId: 1) - Evaluator role

---

#### 3. **Projects** (Project.cs)
```csharp
public class Project {
    int Id                       // Primary Key
    DateTime Timestamp           // Creation timestamp
    
    // Startup Info
    string? StartupName          // MaxLength 200
    string? FounderName          // MaxLength 150
    string? Email                // MaxLength 100
    string? Phone                // MaxLength 20
    string? StartupDescription   // MaxLength 1000
    string? StartupStatus        // MaxLength 100
    
    // Links
    string? WebsiteLink          // MaxLength 250
    string? MobileAppLink        // MaxLength 250
    
    // Media Files (stored as relative paths)
    string? StartupLogo          // /Uploads/logos/filename
    string? FounderPhoto         // /Uploads/founders/filename
    string? DefaultVideo         // /Uploads/videos/filename
    string? PitchVideo           // /Uploads/videos/filename
    string? Image1               // /Uploads/images/filename
    string? Image2               // /Uploads/images/filename
    string? Image3               // /Uploads/images/filename
    
    // Other
    string? Username             // MaxLength 100
    string? SpotlightReason      // MaxLength 1000
}
```

**Features**:
- ✅ File upload support (7 file types)
- ✅ Organized folder structure
- ✅ Relative path storage
- ✅ Nullable fields for flexibility

---

#### 4. **ProjectAssignments** (ProjectAssignment.cs)
```csharp
public class ProjectAssignment {
    int AssignmentId             // Primary Key
    int ProjectId                // Foreign Key to Projects
    int UserId                   // Foreign Key to Users
    DateTime AssignedAt          // Assignment timestamp
    
    // Navigation
    Project Project
    User User
}
```

**Purpose**: Maps evaluators (Users) to projects (many-to-many relationship)

---

#### 5. **Evaluations** (Evaluation.cs)
```csharp
public class Evaluation {
    int EvaluationId             // Primary Key
    int ProjectId                // Foreign Key to Projects
    int UserId                   // Foreign Key to Users (Evaluator)
    
    // 7 Scoring Metrics (1-10 scale)
    [Range(1, 10)] int ProblemSignificance
    [Range(1, 10)] int InnovationTechnical
    [Range(1, 10)] int MarketScalability
    [Range(1, 10)] int TractionImpact
    [Range(1, 10)] int BusinessModel
    [Range(1, 10)] int TeamExecution
    [Range(1, 10)] int EthicsEquity
    
    // Comments
    string? Strengths
    string? Weaknesses
    string? Recommendation
    
    DateTime EvaluatedAt         // Submission timestamp
    
    // Navigation
    Project Project
    User User
}
```

**Features**:
- ✅ 7-metric evaluation system
- ✅ Data validation (Range attributes)
- ✅ Optional text feedback
- ✅ One evaluation per user per project

---

## 🔌 API Endpoints

### 1. Authentication Controller (`/api/Authentication`)

#### POST `/register`
**Description**: Register a new user (Evaluator role)  
**Auth**: None  
**Request**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```
**Response**: `200 OK`
```json
{
  "message": "User registered. OTP sent to your email."
}
```

**Process**:
1. Check if username/email already exists
2. Assign default "User" role
3. Generate 6-digit OTP (random)
4. Hash password using SHA256
5. Save user with `IsOtpVerified = false`
6. Send OTP email via MailService
7. OTP valid for 10 minutes

---

#### POST `/verify-otp`
**Description**: Verify email with OTP code  
**Auth**: None  
**Request**:
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```
**Response**: `200 OK`
```json
{
  "message": "OTP verified. You can now log in."
}
```

**Validation**:
- ✅ User exists
- ✅ Not already verified
- ✅ OTP matches
- ✅ OTP not expired

---

#### POST `/login`
**Description**: Login with username and password  
**Auth**: None  
**Request**:
```json
{
  "username": "john_doe",
  "password": "SecurePass@123"
}
```
**Response**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "john_doe",
  "role": "User"
}
```

**Validation**:
- ✅ Username exists
- ✅ Password matches (SHA256 comparison)
- ✅ Email verified (`IsOtpVerified = true`)

**JWT Token Claims**:
- `NameIdentifier`: UserId
- `Name`: Username
- `Email`: Email
- `Role`: RoleName
- **Expiry**: 3 hours

---

### 2. Projects Controller (`/api/Projects`)

#### GET `/`
**Description**: Get all projects  
**Auth**: `[Authorize(Roles = "FSO,SuperAdmin")]`  
**Response**: `200 OK` - Array of Project objects

---

#### GET `/{id}`
**Description**: Get project by ID  
**Auth**: `[Authorize(Roles = "FSO,SuperAdmin")]`  
**Response**: `200 OK` - Project object

---

#### POST `/create`
**Description**: Create a new project with file uploads  
**Auth**: `[Authorize(Roles = "FSO,SuperAdmin")]`  
**Content-Type**: `multipart/form-data`  

**Request Body** (FormData):
```javascript
{
  // Text fields
  username: "admin",
  startupName: "TechCorp",
  founderName: "Jane Doe",
  email: "jane@techcorp.com",
  phone: "+1234567890",
  websiteLink: "https://techcorp.com",
  mobileAppLink: "https://app.techcorp.com",
  startupDescription: "AI-powered solution...",
  startupStatus: "Active",
  spotlightReason: "Innovation leader",
  
  // File uploads
  startupLogo: File,
  founderPhoto: File,
  defaultVideo: File,
  pitchVideo: File,
  image1: File,
  image2: File,
  image3: File
}
```

**File Handling**:
- Uploads saved to `Uploads/{folder}/` directories
- Filename: `{GUID}_{originalName}`
- Stored path: `/Uploads/{folder}/{filename}`
- Folders: `logos`, `founders`, `videos`, `images`

---

#### PUT `/{id}`
**Description**: Update existing project  
**Auth**: `[Authorize(Roles = "FSO,SuperAdmin")]`  
**Content-Type**: `multipart/form-data`  

**Features**:
- ✅ Partial updates (only provided fields)
- ✅ File replacement (deletes old file if new uploaded)
- ✅ Keeps existing files if not replaced

---

#### DELETE `/{id}`
**Description**: Delete project and all associated files  
**Auth**: `[Authorize(Roles = "FSO,SuperAdmin")]`  
**Response**: `200 OK`

**Cleanup**:
- ✅ Deletes all 7 associated files from disk
- ✅ Removes database record

---

#### GET `/files/{folder}/{fileName}`
**Description**: Download/view uploaded file  
**Auth**: None  
**Response**: File content with appropriate MIME type

---

### 3. Evaluations Controller (`/api/Evaluations`)

#### GET `/assigned`
**Description**: Get projects assigned to current evaluator  
**Auth**: `[Authorize(Roles = "User")]`  
**Response**: `200 OK` - Array of assigned Project objects

**Logic**:
- Extracts `UserId` from JWT token
- Queries `ProjectAssignments` table
- Returns projects with active assignments

---

#### POST `/{projectId}`
**Description**: Submit evaluation for a project  
**Auth**: `[Authorize(Roles = "User")]`  
**Request**:
```json
{
  "problemSignificance": 8,
  "innovationTechnical": 9,
  "marketScalability": 7,
  "tractionImpact": 6,
  "businessModel": 8,
  "teamExecution": 9,
  "ethicsEquity": 8,
  "strengths": "Strong team and clear vision",
  "weaknesses": "Limited market validation",
  "recommendation": "Approve with conditions"
}
```

**Validation**:
- ✅ User is assigned to project
- ✅ User hasn't already evaluated
- ✅ Scores within range (1-10)

---

#### GET `/my`
**Description**: Get all evaluations submitted by current user  
**Auth**: `[Authorize(Roles = "User")]`  
**Response**: `200 OK` - Array of Evaluation objects with Project details

---

#### GET `/project/{projectId}`
**Description**: Get all evaluations for a specific project  
**Auth**: `[Authorize(Roles = "SuperAdmin,FSO")]`  
**Response**: `200 OK` - Array of Evaluation objects with User details

---

### 4. SuperAdmin Controller (`/api/SuperAdmin`)

#### GET `/getAllUsers`
**Description**: Get all users with "User" role (evaluators)  
**Auth**: `[Authorize(Roles = "SuperAdmin")]`  
**Response**: `200 OK`
```json
[
  {
    "userId": 5,
    "username": "alice",
    "email": "alice@example.com",
    "isOtpVerified": true,
    "roleId": 1,
    "roleName": "User"
  }
]
```

---

#### POST `/assignProject`
**Description**: Assign multiple evaluators to a project  
**Auth**: `[Authorize(Roles = "SuperAdmin")]`  
**Request**:
```json
{
  "projectId": 1,
  "userIds": [5, 7, 9]
}
```

**Logic**:
- ✅ Validates project exists
- ✅ Filters valid evaluators (role = "User")
- ✅ Creates ProjectAssignment records
- ✅ **Additive**: Doesn't remove existing assignments

---

#### PUT `/updateAssignment`
**Description**: Add new evaluators to a project (additive)  
**Auth**: `[Authorize(Roles = "SuperAdmin")]`  
**Request**:
```json
{
  "projectId": 1,
  "userIds": [5, 7, 9, 11]
}
```

**Logic**:
- ✅ Checks existing assignments
- ✅ Filters new users (not already assigned)
- ✅ Adds only new assignments
- ❌ **Does NOT replace** existing assignments
- ❌ **Does NOT remove** users

**⚠️ IMPORTANT: ADDITIVE BEHAVIOR**

Despite being a PUT endpoint, this is **additive only** - it adds new users without removing existing ones.

**To achieve replacement behavior (set exact list of evaluators)**:
1. Get current assigned users: `GET /SuperAdmin/getAssignedUsers/{projectId}`
2. Calculate users to remove: `currentUsers - newUsers`
3. Remove each user: `DELETE /SuperAdmin/unassignUser/{projectId}/{userId}` (call for each removed user)
4. Calculate users to add: `newUsers - currentUsers`
5. Add new users: `PUT /SuperAdmin/updateAssignment` with userIds array

**Frontend Implementation**: See `AssignEvaluatorsModal.jsx` for diff-based workaround that implements this pattern.

**Why not change to replacement?** Preserves existing functionality and prevents accidental bulk deletions. If you want replacement semantics, modify the backend to remove existing assignments first before adding new ones.

---

#### GET `/getAssignedUsers/{projectId}`
**Description**: Get list of evaluators assigned to a project  
**Auth**: `[Authorize(Roles = "SuperAdmin")]`  
**Response**: `200 OK`
```json
{
  "project": "TechStartup Inc",
  "assignedUsers": [
    {
      "userId": 5,
      "username": "alice",
      "email": "alice@example.com",
      "isOtpVerified": true,
      "assignedAt": "2025-10-04T10:30:00Z"
    }
  ]
}
```

---

#### DELETE `/unassignUser/{projectId}/{userId}`
**Description**: Remove a single evaluator from a project  
**Auth**: `[Authorize(Roles = "SuperAdmin")]`  
**Response**: `200 OK`
```json
{
  "message": "User 5 unassigned from project 1 successfully."
}
```

**Logic**:
- ✅ Finds ProjectAssignment record
- ✅ Deletes assignment
- ✅ Does NOT delete user or project

---

## 🔐 Security Implementation

### JWT Configuration

**Location**: `Program.cs`

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "https://localhost:7034",
            ValidAudience = "https://localhost:7034",
            IssuerSigningKey = new SymmetricSecurityKey(...)
        };
    });
```

**JWT Settings** (appsettings.json):
```json
{
  "Jwt": {
    "Key": "512-character hex key",
    "Issuer": "https://localhost:7034",
    "Audience": "https://localhost:7034"
  }
}
```

**Token Expiry**: 3 hours  
**Algorithm**: HMAC SHA256

---

### Password Security

**Hashing**: SHA256  
**Location**: `AuthenticationController.cs`

```csharp
private string HashPassword(string password) {
    using (var sha256 = SHA256.Create()) {
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
    }
}
```

**Note**: SHA256 is used (not bcrypt/Argon2). Consider upgrading for production.

---

### Role-Based Authorization

**Roles**:
1. **SuperAdmin** - Full system access
2. **FSO** (Field Sales Officer) - Project management
3. **User** (Evaluator) - Submit evaluations

**Authorization Attributes**:
```csharp
[Authorize(Roles = "SuperAdmin")]           // SuperAdmin only
[Authorize(Roles = "SuperAdmin,FSO")]       // SuperAdmin OR FSO
[Authorize(Roles = "User")]                 // Evaluators only
```

---

## 📧 Email Service

**Provider**: Gmail SMTP  
**Location**: `MailService.cs`

**Configuration** (appsettings.json):
```json
{
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "academicsfc3@gmail.com",
    "Password": "tiih puiq esmc jlps",  // App-specific password
    "EnableTls": true
  }
}
```

**Features**:
- ✅ OTP email delivery
- ✅ 6-digit random code
- ✅ 10-minute expiration
- ✅ Plain text emails

**Usage**:
```csharp
await _mailService.SendOtpEmail(user.Email, otpCode);
```

---

## 📁 File Management

### Upload Structure

```
VisionManagement/
└── Uploads/
    ├── logos/        # Startup logos
    ├── founders/     # Founder photos
    ├── videos/       # Demo and pitch videos
    └── images/       # Additional images (Image1, Image2, Image3)
```

### File Handling

**Upload Process**:
1. Check if file provided
2. Create folder if doesn't exist
3. Generate unique filename: `{GUID}_{originalName}`
4. Save to disk
5. Store relative path in database: `/Uploads/{folder}/{filename}`

**Download/Access**:
```csharp
app.UseStaticFiles(new StaticFileOptions {
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/Uploads"
});
```

**Access URL**: `http://localhost:7034/Uploads/{folder}/{filename}`

---

## 🌐 CORS Configuration

**Location**: `Program.cs`

```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

app.UseCors("AllowAll");
```

**Current**: Allows all origins (development only)  
**Production**: Should restrict to specific frontend URL

---

## 🗃️ Database Configuration

**Connection String** (appsettings.json):
```json
{
  "ConnectionStrings": {
    "Aptech": "Server=AUNSYEDSHAH\\SQLEXPRESS;Database=VisionDB;Trusted_Connection=True;TrustServerCertificate=true"
  }
}
```

**Database**: SQL Server Express  
**Database Name**: `VisionDB`  
**Authentication**: Windows Authentication

---

## 🌱 Database Seeding

**Location**: `DbSeeder.cs`

**Default Users**:
```csharp
Username: "SuperAdmin"
Email: "superadmin@vision.com"
Password: "SuperAdmin@123"
RoleId: 2

Username: "FSO"
Email: "fso@vision.com"
Password: "FSO@123"
RoleId: 3
```

**Seeding Trigger**: Automatic on application startup (`Program.cs`)

---

## 📊 JSON Serialization

**Configuration** (Program.cs):
```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.ReferenceHandler = 
            System.Text.Json.Serialization.ReferenceHandler.Preserve;
        options.JsonSerializerOptions.WriteIndented = true;
    });
```

**Important**: Uses `ReferenceHandler.Preserve`  
**Result**: JSON includes `$id` and `$values` properties  
**Example**:
```json
{
  "assignedUsers": {
    "$id": "1",
    "$values": [
      {
        "$id": "2",
        "userId": 5,
        "username": "alice"
      }
    ]
  }
}
```

**Frontend Impact**: Must handle `$values` arrays

---

## 🚀 Middleware Pipeline

**Order** (Program.cs):
```
1. UseHttpsRedirection()
2. UseCors("AllowAll")
3. UseAuthentication()
4. (Database Seeding)
5. UseAuthorization()
6. UseStaticFiles()
7. MapControllers()
```

---

## 🔍 Key Observations & Recommendations

### ✅ Strengths

1. **Clean Architecture**: Well-organized controllers and models
2. **JWT Authentication**: Properly implemented with claims
3. **Role-Based Access**: Clear authorization rules
4. **File Upload**: Robust file management system
5. **OTP Verification**: Email verification flow
6. **Swagger Documentation**: Auto-generated API docs
7. **Database Seeding**: Automated initial data setup

---

### ⚠️ Areas for Improvement

1. **Password Hashing**: Use bcrypt or Argon2 instead of SHA256
2. **PUT Endpoint Behavior**: `updateAssignment` is additive, not replacement
3. **CORS Policy**: Too permissive for production
4. **Email Credentials**: Hardcoded in config (use environment variables)
5. **File Validation**: No size or type validation on uploads
6. **Error Handling**: Could be more consistent
7. **Pagination**: No pagination on list endpoints
8. **Evaluation Editing**: No PUT endpoint for updating evaluations

---

### 🔧 Frontend Integration Notes

#### API Base URL
```javascript
const API_BASE_URL = "http://localhost:7034/api";
// or
const API_BASE_URL = "https://localhost:7034/api";
```

#### Handling $values Format
```javascript
// Backend returns:
{ "assignedUsers": { "$values": [...] } }

// Frontend must extract:
const users = response.assignedUsers.$values || response.assignedUsers || [];
```

#### JWT Token Usage
```javascript
// Store token from login response
localStorage.setItem('token', response.token);

// Include in all requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

#### File Upload
```javascript
const formData = new FormData();
formData.append('startupName', 'TechCorp');
formData.append('startupLogo', fileInput.files[0]);

await axios.post('/api/Projects/create', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

#### Assignment Strategy
```javascript
// To ADD evaluators: Use POST /assignProject or PUT /updateAssignment
// To REMOVE evaluator: Use DELETE /unassignUser/{projectId}/{userId}
// To REPLACE all: 
//   1. DELETE each existing assignment
//   2. POST new assignments
```

---

## 📋 Summary

### Database Entities
- ✅ **Users** (with OTP verification)
- ✅ **Roles** (SuperAdmin, FSO, User)
- ✅ **Projects** (with file uploads)
- ✅ **ProjectAssignments** (evaluator assignments)
- ✅ **Evaluations** (7-metric scoring)

### API Endpoints (13 total)
- **Authentication**: 3 endpoints (register, verify-otp, login)
- **Projects**: 5 endpoints (CRUD + file download)
- **Evaluations**: 4 endpoints (assigned, submit, my, project)
- **SuperAdmin**: 4 endpoints (users, assign, update, unassign)

### Security
- ✅ JWT Bearer authentication
- ✅ Role-based authorization
- ✅ Password hashing (SHA256)
- ✅ OTP email verification

### File Management
- ✅ 7 file types supported
- ✅ Organized folder structure
- ✅ Static file serving
- ✅ File deletion on project delete

---

**Backend Status**: ✅ Fully functional and ready for frontend integration

**Documentation Version**: 1.0  
**Last Updated**: October 4, 2025
