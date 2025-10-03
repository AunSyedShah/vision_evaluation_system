# API Reference - Vision Management System
**Generated from:** swagger_api.json  
**Date:** October 3, 2025

---

## 🔐 Authentication

All endpoints (except authentication endpoints) require JWT Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📑 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Evaluations Endpoints](#evaluations-endpoints)
3. [Projects Endpoints](#projects-endpoints)
4. [SuperAdmin Endpoints](#superadmin-endpoints)
5. [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)

---

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /api/Authentication/register`  
**Access:** Public  
**Description:** Register a new evaluator (role="User")

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:** 200 OK
- Sends OTP to email
- User needs to verify OTP before login

---

### 2. Verify OTP
**Endpoint:** `POST /api/Authentication/verify-otp`  
**Access:** Public  
**Description:** Verify email with OTP code

**Request Body:**
```json
{
  "email": "string",
  "otp": "string"
}
```

**Response:** 200 OK
- Sets `IsOtpVerified = true`
- User can now login

---

### 3. Login
**Endpoint:** `POST /api/Authentication/login`  
**Access:** Public  
**Description:** Login with username/password, returns JWT token

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:** 200 OK
```json
{
  "token": "jwt_token_here",
  "user": {
    "userId": 1,
    "username": "string",
    "email": "string",
    "role": "SuperAdmin | FSO | User"
  }
}
```

**Demo Credentials:**
- **SuperAdmin:** SuperAdmin / SuperAdmin@123
- **FSO (Admin):** FSO / FSO@123

---

## Evaluations Endpoints

### 1. Get Assigned Projects
**Endpoint:** `GET /api/Evaluations/assigned`  
**Access:** Evaluator (role="User")  
**Description:** Get list of projects assigned to current evaluator

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "startupName": "TechStartup",
    "startupDescription": "AI-powered solution",
    "founderName": "John Doe",
    // ... other project fields
  }
]
```

**Frontend Usage:**
```javascript
import { getAssignedProjects } from '../../utils/api';
const projects = await getAssignedProjects();
```

---

### 2. Submit Evaluation
**Endpoint:** `POST /api/Evaluations/{projectId}`  
**Access:** Evaluator (role="User")  
**Description:** Submit evaluation for assigned project

**URL Parameters:**
- `projectId` (integer) - ID of project to evaluate

**Request Body:**
```json
{
  "problemSignificance": 8,      // 1-10
  "innovationTechnical": 9,       // 1-10
  "marketScalability": 7,         // 1-10
  "tractionImpact": 6,            // 1-10
  "businessModel": 8,             // 1-10
  "teamExecution": 7,             // 1-10
  "ethicsEquity": 9,              // 1-10
  "strengths": "Strong technical team...",
  "weaknesses": "Market validation needed...",
  "recommendation": "Recommend for funding..."
}
```

**Response:** 200 OK

**Frontend Usage:**
```javascript
import { submitEvaluation } from '../../utils/api';
await submitEvaluation(projectId, {
  problemSignificance: 8,
  innovationTechnical: 9,
  // ... other fields
});
```

**Notes:**
- All 7 scores are required (1-10 scale)
- Evaluator can only submit once per project
- Backend prevents duplicate submissions

---

### 3. Get My Evaluations
**Endpoint:** `GET /api/Evaluations/my`  
**Access:** Evaluator (role="User")  
**Description:** Get all evaluations submitted by current evaluator

**Response:** 200 OK
```json
[
  {
    "evaluationId": 1,
    "projectId": 5,
    "userId": 3,
    "problemSignificance": 8,
    "innovationTechnical": 9,
    "marketScalability": 7,
    "tractionImpact": 6,
    "businessModel": 8,
    "teamExecution": 7,
    "ethicsEquity": 9,
    "strengths": "Strong technical team...",
    "weaknesses": "Market validation needed...",
    "recommendation": "Recommend for funding...",
    "evaluatedAt": "2025-10-03T10:30:00Z"
  }
]
```

**Frontend Usage:**
```javascript
import { getMyEvaluations } from '../../utils/api';
const myEvaluations = await getMyEvaluations();
```

---

### 4. Get Project Evaluations
**Endpoint:** `GET /api/Evaluations/project/{projectId}`  
**Access:** SuperAdmin, FSO (Admin)  
**Description:** Get all evaluations for a specific project

**URL Parameters:**
- `projectId` (integer) - ID of project

**Response:** 200 OK
```json
[
  {
    "evaluationId": 1,
    "projectId": 5,
    "userId": 3,
    "problemSignificance": 8,
    // ... all evaluation fields
    "evaluatedAt": "2025-10-03T10:30:00Z"
  }
]
```

**Frontend Usage:**
```javascript
import { getEvaluationsByProject } from '../../utils/api';
const evaluations = await getEvaluationsByProject(projectId);
```

---

## Projects Endpoints

### 1. Get All Projects
**Endpoint:** `GET /api/Projects`  
**Access:** SuperAdmin, FSO (Admin)  
**Description:** Get list of all projects

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "username": "user123",
    "startupName": "TechStartup",
    "founderName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "websiteLink": "https://techstartup.com",
    "mobileAppLink": "https://app.techstartup.com",
    "startupDescription": "AI-powered solution...",
    "startupStatus": "Active",
    "spotlightReason": "Innovative approach...",
    "startupLogo": "path/to/logo.png",
    "founderPhoto": "path/to/photo.jpg",
    "defaultVideo": "path/to/video.mp4",
    "pitchVideo": "path/to/pitch.mp4",
    "image1": "path/to/image1.jpg",
    "image2": "path/to/image2.jpg",
    "image3": "path/to/image3.jpg",
    "createdAt": "2025-10-01T10:00:00Z"
  }
]
```

**Frontend Usage:**
```javascript
import { getAllProjects } from '../../utils/api';
const projects = await getAllProjects();
```

---

### 2. Get Project by ID
**Endpoint:** `GET /api/Projects/{id}`  
**Access:** SuperAdmin, FSO (Admin)  
**Description:** Get single project details

**URL Parameters:**
- `id` (integer) - Project ID

**Response:** 200 OK (same as single project object above)

**Frontend Usage:**
```javascript
import { getProjectById } from '../../utils/api';
const project = await getProjectById(projectId);
```

---

### 3. Create Project
**Endpoint:** `POST /api/Projects/create`  
**Access:** SuperAdmin, FSO (Admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Create new project with file uploads

**Form Fields:**
- `Username` (string)
- `StartupName` (string) - Required
- `FounderName` (string) - Required
- `Email` (string) - Required
- `Phone` (string)
- `WebsiteLink` (string)
- `MobileAppLink` (string)
- `StartupDescription` (string)
- `StartupStatus` (string)
- `SpotlightReason` (string)
- `StartupLogo` (file) - binary
- `FounderPhoto` (file) - binary
- `DefaultVideo` (file) - binary
- `PitchVideo` (file) - binary
- `Image1` (file) - binary
- `Image2` (file) - binary
- `Image3` (file) - binary

**Response:** 200 OK

**Frontend Usage:**
```javascript
import { createProject } from '../../utils/api';
const formData = new FormData();
formData.append('StartupName', 'TechStartup');
formData.append('FounderName', 'John Doe');
formData.append('Email', 'john@example.com');
formData.append('StartupLogo', logoFile);
// ... append other fields
const newProject = await createProject(formData);
```

---

### 4. Update Project
**Endpoint:** `PUT /api/Projects/{id}`  
**Access:** SuperAdmin, FSO (Admin)  
**Content-Type:** `multipart/form-data`  
**Description:** Update existing project

**URL Parameters:**
- `id` (integer) - Project ID

**Form Fields:** Same as Create Project

**Response:** 200 OK

**Frontend Usage:**
```javascript
import { updateProject } from '../../utils/api';
const formData = new FormData();
formData.append('StartupName', 'Updated Name');
// ... append other fields
await updateProject(projectId, formData);
```

---

### 5. Delete Project
**Endpoint:** `DELETE /api/Projects/{id}`  
**Access:** SuperAdmin, FSO (Admin)  
**Description:** Delete project

**URL Parameters:**
- `id` (integer) - Project ID

**Response:** 200 OK

**Frontend Usage:**
```javascript
import { deleteProject } from '../../utils/api';
await deleteProject(projectId);
```

---

### 6. Get Project File
**Endpoint:** `GET /api/Projects/files/{folder}/{fileName}`  
**Access:** Authenticated users  
**Description:** Download/view uploaded project files

**URL Parameters:**
- `folder` (string) - File category (e.g., "logos", "videos")
- `fileName` (string) - File name

**Response:** 200 OK (file content)

**Frontend Usage:**
```html
<img src="http://localhost:5063/api/Projects/files/logos/startup_logo.png" />
<video src="http://localhost:5063/api/Projects/files/videos/pitch.mp4" />
```

---

## SuperAdmin Endpoints

### 1. Get All Users
**Endpoint:** `GET /api/SuperAdmin/getAllUsers`  
**Access:** SuperAdmin  
**Description:** Get all users with role="User" (evaluators)

**Response:** 200 OK
```json
[
  {
    "userId": 3,
    "username": "evaluator1",
    "email": "eval1@example.com",
    "role": "User",
    "isOtpVerified": true
  }
]
```

**Frontend Usage:**
```javascript
import { getAllEvaluators } from '../../utils/api';
const evaluators = await getAllEvaluators();
```

---

### 2. Assign Project to Evaluators
**Endpoint:** `POST /api/SuperAdmin/assignProject`  
**Access:** SuperAdmin  
**Description:** Assign project to multiple evaluators (max 2 per project)

**Request Body:**
```json
{
  "projectId": 5,
  "userIds": [3, 7, 12]
}
```

**Response:** 200 OK

**Frontend Usage:**
```javascript
import { assignProjectToEvaluators } from '../../utils/api';
await assignProjectToEvaluators({
  ProjectId: projectId,
  UserIds: [userId1, userId2]
});
```

**Business Rules:**
- Maximum 2 evaluators per project
- Backend validates assignment limits
- Creates `ProjectAssignment` records

---

## Data Transfer Objects (DTOs)

### RegisterDto
```typescript
{
  username: string;
  email: string;
  password: string;
}
```

### VerifyOtpDto
```typescript
{
  email: string;
  otp: string;
}
```

### LoginDto
```typescript
{
  username: string;
  password: string;
}
```

### AssignProjectDto
```typescript
{
  projectId: number;
  userIds: number[];
}
```

### EvaluationDto
```typescript
{
  problemSignificance: number;    // 1-10
  innovationTechnical: number;     // 1-10
  marketScalability: number;       // 1-10
  tractionImpact: number;          // 1-10
  businessModel: number;           // 1-10
  teamExecution: number;           // 1-10
  ethicsEquity: number;            // 1-10
  strengths: string | null;
  weaknesses: string | null;
  recommendation: string | null;
}
```

---

## 🎯 Frontend-Backend Field Mapping

### Backend → Frontend (Response)
```typescript
// Projects
StartupName → startupName
FounderName → founderName
StartupDescription → startupDescription
WebsiteLink → websiteLink
MobileAppLink → mobileAppLink
StartupStatus → startupStatus
SpotlightReason → spotlightReason
StartupLogo → startupLogo
FounderPhoto → founderPhoto
DefaultVideo → defaultVideo
PitchVideo → pitchVideo
Image1 → image1
Image2 → image2
Image3 → image3

// Users/Evaluators
UserId → userId
Username → username
Email → email
Role → role
IsOtpVerified → isOtpVerified

// Evaluations
EvaluationId → evaluationId
ProjectId → projectId
UserId → userId
ProblemSignificance → problemSignificance
InnovationTechnical → innovationTechnical
MarketScalability → marketScalability
TractionImpact → tractionImpact
BusinessModel → businessModel
TeamExecution → teamExecution
EthicsEquity → ethicsEquity
Strengths → strengths
Weaknesses → weaknesses
Recommendation → recommendation
EvaluatedAt → evaluatedAt
```

### Frontend → Backend (Request)
```typescript
// FormData for Projects (multipart)
startupName → StartupName
founderName → FounderName
email → Email
phone → Phone
websiteLink → WebsiteLink
mobileAppLink → MobileAppLink
startupDescription → StartupDescription
startupStatus → StartupStatus
spotlightReason → SpotlightReason
startupLogo (file) → StartupLogo
founderPhoto (file) → FounderPhoto
defaultVideo (file) → DefaultVideo
pitchVideo (file) → PitchVideo
image1 (file) → Image1
image2 (file) → Image2
image3 (file) → Image3

// JSON for Assignment
projectId → ProjectId
userIds → UserIds

// JSON for Evaluation (camelCase matches DTO)
problemSignificance → problemSignificance
innovationTechnical → innovationTechnical
marketScalability → marketScalability
tractionImpact → tractionImpact
businessModel → businessModel
teamExecution → teamExecution
ethicsEquity → ethicsEquity
strengths → strengths
weaknesses → weaknesses
recommendation → recommendation
```

---

## 🔧 Error Handling

All endpoints return standard HTTP status codes:
- **200 OK** - Success
- **400 Bad Request** - Invalid input
- **401 Unauthorized** - Missing/invalid token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

**Frontend Error Handling Pattern:**
```javascript
try {
  const data = await apiFunction();
  // Success
} catch (error) {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || 'Operation failed';
    console.error(message);
  } else {
    // Network error
    console.error('Network error');
  }
}
```

---

## 📝 Notes

1. **Authentication Flow:**
   - Register → Receive OTP → Verify OTP → Login → Get JWT
   - JWT expires after 3 hours
   - Role mapping: SuperAdmin→superadmin, FSO→admin, User→evaluator

2. **File Uploads:**
   - Only Projects endpoints accept files
   - Use `multipart/form-data`
   - Files stored in `VisionManagement/Uploads/` folder
   - Access via `/api/Projects/files/{folder}/{fileName}`

3. **Evaluation Scoring:**
   - 7 metrics, each scored 1-10
   - Average calculation: `(sum of 7 scores / 7 / 10) * 100` = percentage
   - Example: Scores [8,9,7,6,8,7,9] → Avg 7.71 → 77.1%

4. **Project Assignment:**
   - Max 2 evaluators per project
   - Backend enforces limit
   - Creates `ProjectAssignment` table records
   - Evaluators see only assigned projects via `/api/Evaluations/assigned`

5. **Security:**
   - All endpoints require JWT except authentication
   - Role-based access control (RBAC)
   - SuperAdmin: Full access
   - FSO (Admin): Projects + Evaluations (view only)
   - User (Evaluator): Assigned projects + Submit evaluations

---

## 🚀 Quick Reference

### SuperAdmin Workflow
```javascript
// 1. View all projects
const projects = await getAllProjects();

// 2. View all evaluators
const evaluators = await getAllEvaluators();

// 3. Assign project to evaluators
await assignProjectToEvaluators({
  ProjectId: 5,
  UserIds: [3, 7]
});

// 4. View all results
const evaluations = await getEvaluationsByProject(5);
```

### Evaluator Workflow
```javascript
// 1. View assigned projects
const assignedProjects = await getAssignedProjects();

// 2. Submit evaluation
await submitEvaluation(projectId, {
  problemSignificance: 8,
  innovationTechnical: 9,
  marketScalability: 7,
  tractionImpact: 6,
  businessModel: 8,
  teamExecution: 7,
  ethicsEquity: 9,
  strengths: "...",
  weaknesses: "...",
  recommendation: "..."
});

// 3. View my evaluations
const myEvaluations = await getMyEvaluations();
```

---

**Last Updated:** October 3, 2025  
**API Version:** v1  
**Base URL:** http://localhost:5063/api
