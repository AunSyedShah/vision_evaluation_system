# 🚀 Project Evaluation System

A comprehensive full-stack web application for managing startup project evaluations with role-based access control. Built with React 19 frontend and ASP.NET Core backend.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [User Roles & Permissions](#user-roles--permissions)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Project Evaluation System is designed to streamline the evaluation process for startup projects. It provides:

- **Multi-role authentication** (Super Admin, Admin, Evaluator)
- **Project management** with CRUD operations
- **Evaluator assignment** system
- **Structured evaluation forms** with 7 metric categories
- **Result aggregation** and consensus analysis
- **Export functionality** (Excel/CSV)
- **Real-time status tracking** and dashboards

### Key Capabilities

✅ **Super Admin**: Full system control, evaluator management, result analysis  
✅ **Admin**: Project management, view-only access to evaluations  
✅ **Evaluator**: Submit evaluations for assigned projects  
✅ **OTP Verification**: Email-based account verification  
✅ **Export Results**: Multiple export formats for data analysis  

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Latest React with modern hooks
- **Vite 7.1.14** (Rolldown) - Lightning-fast build tool
- **React Router DOM 7.9.3** - Client-side routing
- **Axios 1.12.2** - HTTP client for API calls
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **Formik 2.4.6** - Form state management
- **React Hot Toast 2.6.0** - Toast notifications
- **XLSX 0.18.5** - Excel file generation
- **File Saver 2.0.5** - File download utility
- **Bun** - Fast JavaScript runtime

### Backend
- **ASP.NET Core** - .NET web framework
- **Entity Framework Core** - ORM for database operations
- **JWT Authentication** - Token-based auth
- **Swagger/OpenAPI** - API documentation
- **SQL Server** - Relational database

### Development Tools
- **ESLint** - Code linting
- **Git** - Version control
- **VS Code** - Recommended IDE

---

## 🚀 Features

### 🔐 Authentication System
- **Login** for all roles (Super Admin, Admin, Evaluator)
- **Register** page with email verification
- **OTP Verification** - 6-digit code sent to email
- **JWT Token** authentication with refresh mechanism
- **Role-based access control** with protected routes
- **Session persistence** with automatic token refresh

### 👑 Super Admin Module
- **Full CRUD Operations** for projects
- **Project Management**
  - Create, edit, delete projects
  - Upload via manual form or CSV/Excel
  - Download sample CSV template
- **Evaluator Management**
  - Assign unlimited evaluators to projects
  - Update assignments (add/remove evaluators)
  - View all registered evaluators
  - Track evaluator activity
- **Results & Analytics**
  - View all evaluation results
  - Comprehensive results table with filters
  - Export data (Excel/CSV) in 3 formats:
    - All Results (detailed evaluations)
    - Project Summary (aggregated scores)
    - Consensus Report (average metrics)
  - Status tracking: Pending Review (X/Y), Evaluation Completed
  - Display ALL evaluators (submitted + pending)
- **Dashboard** with system-wide statistics

### 👔 Admin Module
- **Project Upload** (same functionality as Super Admin)
- **View-Only Access** to projects and details
- **Cannot** edit or delete projects
- **Dashboard** with project overview

### 📝 Evaluator Module
- **View Assigned Projects** only
- **Submit Evaluations** with 7 metrics:
  1. Problem/Need (0-10)
  2. Innovation (0-10)
  3. Market Potential (0-10)
  4. Traction (0-10)
  5. Business Model (0-10)
  6. Team (0-10)
  7. Ethics & Impact (0-10)
- **Edit Submitted Evaluations** before deadline
- **My Evaluations** - track submission status
- **Dashboard** showing assignment statistics

### � Evaluation Features
- **7-Metric Scoring System** (0-10 scale)
- **Automatic Average Calculation** (weighted scores)
- **Consensus Analysis** (when 2+ evaluators submit)
- **Status Indicators**:
  - ⏳ Pending Review (X/Y)
  - ✅ Evaluation Completed
  - 🔄 In Progress
- **Visual Feedback**:
  - Score color coding (red/yellow/green)
  - Progress bars
  - Status badges
- **Evaluator List Section**:
  - ✅ Green cards for submitted evaluations
  - ⏳ Orange cards for pending evaluations
  - Responsive grid layout (1/2/3 columns)

---

## � Getting Started

### Prerequisites

#### Frontend
- **Node.js** 18+ or **Bun** 1.0+
- **Git**

#### Backend
- **.NET SDK** 6.0 or higher
- **SQL Server** (or compatible database)
- **SMTP Server** (for email notifications)

---

### 📦 Frontend Setup

#### 1. Clone Repository
```bash
git clone https://github.com/AunSyedShah/vision_evaluation_system.git
cd vision_evaluation_system
```

#### 2. Install Dependencies
```bash
# Using Bun (recommended)
bun install

# OR using npm
npm install

# OR using yarn
yarn install
```

#### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000
# OR for production
# VITE_API_BASE_URL=https://api.yourdomain.com

# Optional: Enable debug mode
VITE_DEBUG=true
```

#### 4. Start Development Server
```bash
# Using Bun
bun dev

# OR using npm
npm run dev

# OR using yarn
yarn dev
```

The application will start at `http://localhost:5173`

#### 5. Build for Production
```bash
# Using Bun
bun build

# OR using npm
npm run build

# Preview production build
bun preview
```

---

### 🔧 Backend Setup

#### 1. Navigate to Backend Directory
```bash
cd backend
```

#### 2. Restore Dependencies
```bash
dotnet restore
```

#### 3. Configure Database Connection
Update `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=VisionEvaluationDB;Trusted_Connection=True;"
  },
  "Jwt": {
    "Key": "your-super-secret-key-min-32-characters",
    "Issuer": "VisionEvaluation",
    "Audience": "VisionEvaluationUsers",
    "ExpiryMinutes": 60
  },
  "Email": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "noreply@yourdomain.com",
    "SenderPassword": "your-app-password",
    "SenderName": "Vision Evaluation System"
  }
}
```

#### 4. Run Database Migrations
```bash
dotnet ef database update
```

#### 5. Seed Initial Data (Optional)
```bash
dotnet run --seed
```

#### 6. Start Backend Server
```bash
dotnet run

# OR for development with hot reload
dotnet watch run
```

The API will start at `http://localhost:5000`

#### 7. View API Documentation
Navigate to `http://localhost:5000/swagger` to view the interactive API documentation.

---

## 👥 Demo Credentials

### Super Admin
- **Email:** superadmin@system.com
- **Password:** SuperAdmin@123
- **Role:** SuperAdmin

### Admin
- **Email:** admin@system.com
- **Password:** Admin@123
- **Role:** Admin

### Evaluator
- Register a new account at `/register`
- Email verification required (check OTP in console/email)
- **Role:** Evaluator

---

## 📁 Architecture

### Frontend Project Structure

```
project_evaluation/
├── public/                      # Static assets
│   ├── vision_logo.png
│   └── vite.svg
├── src/
│   ├── components/              # Reusable components
│   │   ├── AssignEvaluatorsModal.jsx  # Evaluator assignment modal
│   │   ├── MainLayout.jsx       # Main layout wrapper
│   │   ├── Sidebar.jsx          # Role-based navigation sidebar
│   │   ├── Topbar.jsx           # Header with user info & logout
│   │   └── ProtectedRoute.jsx   # Route protection HOC
│   │
│   ├── context/                 # React Context
│   │   └── AuthContext.jsx      # Authentication & user state
│   │
│   ├── pages/                   # Page components
│   │   ├── Login.jsx            # Login with OTP support
│   │   ├── Register.jsx         # User registration
│   │   ├── Unauthorized.jsx     # 403 error page
│   │   │
│   │   ├── SuperAdmin/          # Super Admin pages
│   │   │   ├── Dashboard.jsx    # Statistics & overview
│   │   │   ├── ProjectList.jsx  # All projects table
│   │   │   ├── ProjectForm.jsx  # Create/edit project
│   │   │   ├── ProjectDetail.jsx # Project details & results
│   │   │   ├── AllResults.jsx   # Comprehensive results view
│   │   │   └── EvaluatorsList.jsx # Manage evaluators
│   │   │
│   │   ├── Admin/               # Admin pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProjectList.jsx
│   │   │   └── ProjectDetail.jsx
│   │   │
│   │   └── Evaluator/           # Evaluator pages
│   │       ├── Dashboard.jsx
│   │       ├── ProjectList.jsx  # Assigned projects only
│   │       ├── ProjectDetail.jsx # Submit evaluation
│   │       └── MyEvaluations.jsx # Evaluation history
│   │
│   ├── utils/                   # Utility functions
│   │   ├── api.js               # Axios API client
│   │   └── localStorage.js      # Browser storage helpers
│   │
│   ├── assets/                  # Images & icons
│   │   ├── react.svg
│   │   └── vision_logo.png
│   │
│   ├── App.jsx                  # Root component with routes
│   ├── App.css                  # Global styles
│   ├── main.jsx                 # React entry point
│   └── index.css                # Tailwind imports
│
├── swagger.json                 # Backend API specification
├── swagger_api.json             # API endpoints reference
├── package.json                 # Dependencies
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind settings
├── eslint.config.js             # ESLint rules
├── bun.lock                     # Bun lockfile
└── README.md                    # This file
```

### Backend Structure (ASP.NET Core)

```
Backend/
├── Controllers/
│   ├── AuthenticationController.cs   # Auth endpoints
│   ├── ProjectsController.cs         # Project CRUD
│   ├── EvaluationsController.cs      # Evaluation management
│   └── SuperAdminController.cs       # Admin operations
│
├── Models/
│   ├── User.cs                       # User entity
│   ├── Project.cs                    # Project entity
│   ├── Evaluation.cs                 # Evaluation entity
│   └── DTOs/                         # Data Transfer Objects
│
├── Services/
│   ├── AuthService.cs                # Authentication logic
│   ├── EmailService.cs               # Email/OTP handling
│   └── EvaluationService.cs          # Business logic
│
├── Data/
│   └── ApplicationDbContext.cs       # EF Core context
│
└── appsettings.json                  # Configuration
```

---

## 🔌 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.yourdomain.com/api
```

### Authentication Endpoints

#### POST `/Authentication/register`
Register a new evaluator account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "Evaluator"
}
```

**Response:** `200 OK`
```json
{
  "message": "Registration successful. Please verify your email with OTP.",
  "userId": 123
}
```

---

#### POST `/Authentication/verify-otp`
Verify email with 6-digit OTP code.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:** `200 OK`
```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

---

#### POST `/Authentication/login`
Login with credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 123,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Evaluator"
  }
}
```

---

### Project Endpoints

#### GET `/Projects`
Get all projects (role-based filtering).

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "$values": [
    {
      "id": 1,
      "startupName": "TechStartup Inc",
      "founderName": "Jane Smith",
      "description": "AI-powered solution...",
      "status": "Under Review",
      "assignedEvaluatorsCount": 3
    }
  ]
}
```

---

#### POST `/Projects`
Create a new project (SuperAdmin/Admin only).

**Request Body:**
```json
{
  "startupName": "TechStartup Inc",
  "founderName": "Jane Smith",
  "description": "Innovative AI solution",
  "industry": "Technology",
  "stage": "Seed",
  "fundingRequired": 500000
}
```

---

#### GET `/Projects/{id}`
Get project details by ID.

**Response:** Project object with evaluations.

---

#### PUT `/Projects/{id}`
Update project (SuperAdmin only).

---

#### DELETE `/Projects/{id}`
Delete project (SuperAdmin only).

---

### Evaluation Endpoints

#### GET `/Evaluations/project/{projectId}`
Get all evaluations for a project.

**Response:** Array of evaluation objects with scores.

---

#### POST `/Evaluations`
Submit an evaluation.

**Request Body:**
```json
{
  "projectId": 1,
  "userId": 123,
  "problemScore": 8.5,
  "innovationScore": 9.0,
  "marketScore": 7.5,
  "tractionScore": 6.0,
  "businessScore": 8.0,
  "teamScore": 9.5,
  "ethicsScore": 8.5,
  "comments": "Excellent innovation...",
  "strengths": "Strong team, clear vision",
  "improvements": "Need more market validation"
}
```

---

#### PUT `/Evaluations/{id}`
Update an existing evaluation.

---

### Super Admin Endpoints

#### POST `/SuperAdmin/assignProject`
Assign evaluators to a project.

**Request Body:**
```json
{
  "projectId": 1,
  "userIds": [5, 7, 9]
}
```

---

#### PUT `/SuperAdmin/updateAssignment`
Update evaluator assignments (replaces existing).

**Request Body:**
```json
{
  "projectId": 1,
  "userIds": [5, 7, 9, 11]
}
```

---

#### DELETE `/SuperAdmin/unassignUser/{projectId}/{userId}`
Remove a single evaluator from a project.

---

#### GET `/SuperAdmin/getAssignedUsers/{projectId}`
Get list of assigned evaluators.

**Response:**
```json
{
  "assignedUsers": {
    "$values": [
      {
        "userId": 5,
        "username": "alice",
        "email": "alice@example.com"
      }
    ]
  }
}
```

---

#### GET `/SuperAdmin/getAllUsers`
Get all registered users.

---

### Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "details": "Additional context",
  "statusCode": 400
}
```

**Common Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🔐 Authentication & Authorization

### JWT Token Flow

1. **Login** → Receive JWT token
2. **Store token** in localStorage
3. **Include token** in all API requests:
   ```javascript
   Authorization: Bearer {token}
   ```
4. **Token expiry** → Automatic logout/refresh

### Frontend Implementation

```javascript
// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('project_eval_current_user') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle 401 errors (except OTP verification)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isOtpError = error.response?.data?.error?.toLowerCase().includes('otp');
    if (error.response?.status === 401 && !isOtpError) {
      localStorage.removeItem('project_eval_current_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Protected Routes

```javascript
// src/components/ProtectedRoute.jsx
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

### Role-Based Routing

```javascript
// SuperAdmin routes
<Route path="/superadmin/*" element={
  <ProtectedRoute allowedRoles={['SuperAdmin']}>
    <MainLayout><Outlet /></MainLayout>
  </ProtectedRoute>
}>

// Admin routes
<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
    <MainLayout><Outlet /></MainLayout>
  </ProtectedRoute>
}>

// Evaluator routes
<Route path="/evaluator/*" element={
  <ProtectedRoute allowedRoles={['Evaluator']}>
    <MainLayout><Outlet /></MainLayout>
  </ProtectedRoute>
}>
```

---

## 👥 User Roles & Permissions

| Feature | Super Admin | Admin | Evaluator |
|---------|------------|-------|-----------|
| **Projects** |
| Create Project | ✅ | ✅ | ❌ |
| Edit Project | ✅ | ❌ | ❌ |
| Delete Project | ✅ | ❌ | ❌ |
| View All Projects | ✅ | ✅ | ❌ |
| View Assigned Projects | ✅ | ✅ | ✅ |
| **Evaluators** |
| Assign Evaluators | ✅ | ❌ | ❌ |
| Remove Evaluators | ✅ | ❌ | ❌ |
| View All Evaluators | ✅ | ❌ | ❌ |
| **Evaluations** |
| Submit Evaluation | ❌ | ❌ | ✅ |
| Edit Own Evaluation | ❌ | ❌ | ✅ |
| View All Results | ✅ | ✅ | ❌ |
| Export Results | ✅ | ❌ | ❌ |
| **System** |
| Dashboard Access | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ |

---

## 💻 Development Guide

### Frontend Development

#### Running Development Server

```bash
# Start with hot reload
bun dev

# The app will be available at http://localhost:5173
# Changes will automatically reload in the browser
```

#### Code Structure Guidelines

**Component Organization:**
```javascript
// ✅ Good: Functional components with hooks
import { useState, useEffect, useCallback } from 'react';

export default function MyComponent() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = useCallback(async () => {
    // Fetch data
  }, []);
  
  return <div>{/* JSX */}</div>;
}
```

**API Calls:**
```javascript
// Use centralized API utility
import { getProjects, createProject } from '../utils/api';

// All API functions return promises
const projects = await getProjects();
```

**State Management:**
```javascript
// Use Context for global state (auth, user)
const { user, login, logout } = useAuth();

// Use local state for component-specific data
const [projects, setProjects] = useState([]);
```

#### Styling Guidelines

```javascript
// ✅ Use Tailwind utility classes
<div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">

// ✅ Responsive design
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// ✅ Color scheme (Purple/Magenta theme)
Primary: #ab509d
Gradients: from-purple-50 to-blue-50
Text: text-gray-900, text-gray-600
```

#### Error Handling

```javascript
import toast from 'react-hot-toast';

try {
  const result = await apiCall();
  toast.success('Operation successful!');
} catch (error) {
  console.error('Error:', error);
  toast.error(error.response?.data?.error || 'Operation failed');
}
```

#### Console Logging (Debug Mode)

```javascript
// Use emoji prefixes for easy identification
console.log('📦 Data loaded:', data);
console.log('✅ Success:', result);
console.log('❌ Error:', error);
console.log('🔍 Debug:', debugInfo);
console.log('📊 Stats:', statistics);
```

---

### Backend Development

#### Running Backend

```bash
# Development with hot reload
dotnet watch run

# Production
dotnet run

# Run with specific environment
dotnet run --environment Production
```

#### Database Migrations

```bash
# Create a new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Rollback to previous migration
dotnet ef database update PreviousMigrationName

# Remove last migration
dotnet ef migrations remove
```

#### Adding New Endpoints

```csharp
[ApiController]
[Route("api/[controller]")]
public class MyController : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> GetAll()
    {
        // Implementation
        return Ok(data);
    }
    
    [HttpPost]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] MyDto dto)
    {
        // Implementation
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}
```

#### Email Service Configuration

```csharp
// For Gmail
"Email": {
  "SmtpServer": "smtp.gmail.com",
  "SmtpPort": 587,
  "SenderEmail": "your-email@gmail.com",
  "SenderPassword": "your-app-specific-password",
  "SenderName": "Vision Evaluation System"
}
```

**Note:** For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in configuration

---

## 🎨 UI/UX Features

### Design System

**Color Palette:**
- **Primary**: `#ab509d` (Purple/Magenta)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Danger**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)

**Typography:**
- **Headings**: font-bold, text-gray-900
- **Body**: text-gray-600
- **Labels**: text-sm, font-medium

### Responsive Design

**Breakpoints:**
- **Mobile**: < 640px (1 column, overlay sidebar)
- **Tablet**: 640px - 1023px (2 columns, overlay sidebar)
- **Desktop**: ≥ 1024px (3 columns, fixed sidebar)

**Key Features:**
- ✅ Fully responsive tables (horizontal scroll on mobile)
- ✅ Touch-optimized buttons (44px minimum)
- ✅ Slide-in sidebar with backdrop
- ✅ Collapsible forms on mobile
- ✅ Adaptive grid layouts (1/2/3 columns)
- ✅ Mobile-friendly modals

### Interactive Elements

**Toast Notifications:**
```javascript
import toast from 'react-hot-toast';

toast.success('✅ Operation successful!');
toast.error('❌ Operation failed!');
toast.loading('⏳ Processing...');
```

**Status Badges:**
- 🟢 **Evaluation Completed** (Teal)
- 🟡 **Pending Review (X/Y)** (Yellow/Orange)
- 🔵 **Under Review** (Blue)
- 🟣 **Approved** (Purple)

**Progress Indicators:**
- Evaluator count: `2/3 Evaluators`
- Score badges: Color-coded (red/yellow/green)
- Status icons: ✅ Submitted, ⏳ Pending

---

## 🚀 Deployment

### Frontend Deployment

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Variables:**
Add `VITE_API_BASE_URL` in Vercel dashboard.

---

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

**Build Settings:**
- Build command: `bun build`
- Publish directory: `dist`

---

#### Traditional Hosting

```bash
# Build for production
bun build

# Upload 'dist' folder to your server
# Configure web server (Nginx/Apache) to serve static files
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### Backend Deployment

#### IIS (Windows Server)

1. Publish application:
   ```bash
   dotnet publish -c Release -o ./publish
   ```

2. Install .NET Hosting Bundle on server

3. Create IIS site pointing to publish folder

4. Configure application pool (.NET CLR version: No Managed Code)

---

#### Linux (Ubuntu/Debian)

```bash
# Install .NET runtime
wget https://dot.net/v1/dotnet-install.sh
sudo bash dotnet-install.sh

# Create systemd service
sudo nano /etc/systemd/system/visionevaluation.service

# Service file content:
[Unit]
Description=Vision Evaluation API

[Service]
WorkingDirectory=/var/www/visionevaluation
ExecStart=/usr/bin/dotnet /var/www/visionevaluation/YourApp.dll
Restart=always
RestartSec=10
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target

# Start service
sudo systemctl start visionevaluation
sudo systemctl enable visionevaluation
```

---

#### Docker

**Dockerfile:**
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["YourApp.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "YourApp.dll"]
```

**Build and run:**
```bash
docker build -t vision-evaluation-api .
docker run -d -p 5000:80 --name vision-api vision-evaluation-api
```

---

## 🐛 Troubleshooting

### Common Frontend Issues

#### Issue: API calls failing with CORS error
**Solution:**
```javascript
// Backend: Add CORS policy in Startup.cs
services.AddCors(options => {
    options.AddPolicy("AllowAll", builder => {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

app.UseCors("AllowAll");
```

#### Issue: OTP verification not working
**Solution:**
1. Check console for OTP errors
2. Verify email service configuration
3. Check sessionStorage:
   ```javascript
   console.log(sessionStorage.getItem('showOtpForm'));
   console.log(sessionStorage.getItem('userEmail'));
   ```

#### Issue: Evaluator assignments not showing
**Solution:**
1. Check console logs for API responses
2. Verify `getAssignedUsers()` endpoint
3. Clear browser cache and localStorage

#### Issue: Export not working
**Solution:**
1. Install dependencies: `bun add xlsx file-saver`
2. Check browser console for errors
3. Verify data structure in console

---

### Common Backend Issues

#### Issue: Database connection failing
**Solution:**
1. Verify connection string in `appsettings.json`
2. Check SQL Server is running
3. Run migrations: `dotnet ef database update`

#### Issue: JWT token validation failing
**Solution:**
1. Verify JWT configuration in `appsettings.json`
2. Check token expiry time
3. Ensure key is at least 32 characters

#### Issue: Email not sending
**Solution:**
1. Check SMTP credentials
2. For Gmail, use app-specific password
3. Verify firewall allows SMTP port (587)
4. Check email service logs

---

### Debugging Tips

**Frontend:**
```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');

// Check API responses
api.interceptors.response.use(response => {
  console.log('📥 Response:', response);
  return response;
});
```

**Backend:**
```csharp
// Enable detailed errors
app.UseDeveloperExceptionPage();

// Log all requests
app.Use(async (context, next) => {
    Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path}");
    await next.Invoke();
});
```

---

## 📚 Additional Resources

### Documentation
- **React**: https://react.dev
- **Vite**: https://vite.dev
- **Tailwind CSS**: https://tailwindcss.com
- **ASP.NET Core**: https://docs.microsoft.com/aspnet/core
- **Swagger/OpenAPI**: View at `http://localhost:5000/swagger`

### Useful Commands

**Frontend:**
```bash
bun install          # Install dependencies
bun dev             # Start dev server
bun build           # Build for production
bun preview         # Preview production build
bun lint            # Run ESLint
```

**Backend:**
```bash
dotnet restore      # Restore packages
dotnet build        # Build project
dotnet run          # Run application
dotnet watch run    # Run with hot reload
dotnet test         # Run tests
dotnet ef           # Entity Framework commands
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational and evaluation purposes.

---

## 👨‍💻 Authors

- **Aun Syed Shah** - [@AunSyedShah](https://github.com/AunSyedShah)

---

## 🙏 Acknowledgments

- React Team for the amazing framework
- Tailwind Labs for the CSS framework
- Microsoft for ASP.NET Core
- All contributors and testers

## 📄 License

This project is for educational purposes.
