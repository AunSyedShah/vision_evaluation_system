# 🚀 Quick Reference Card

## Start Commands

```bash
# Backend
cd VisionManagement
dotnet run
# → https://localhost:7034

# Frontend
bun run dev
# → http://localhost:5173
```

## Login Credentials

```
SuperAdmin:
  superadmin@vision.com
  SuperAdmin@123

Admin (FSO):
  fso@vision.com
  FSO@123

Evaluators:
  Register at /register
```

## Role Mapping

| Backend | Frontend |
|---------|----------|
| SuperAdmin | superadmin |
| FSO | admin |
| User | evaluator |

## API Base URLs

```
Backend HTTP:  http://localhost:5063/api (default)
Backend HTTPS: https://localhost:7034/api (alternative)
Frontend:      http://localhost:5173

Default: HTTP port 5063 (configured in .env)
```

## Key Files

```
✅ Created:
  src/utils/api.js           - API service
  .env                       - Config
  INTEGRATION_GUIDE.md       - Full docs
  BACKEND_ANALYSIS.md        - Backend docs

✅ Modified:
  src/context/AuthContext.jsx  - Backend auth
  src/pages/Login.jsx          - Async login
  src/pages/Register.jsx       - OTP flow
```

## Token Storage

```javascript
localStorage.getItem('token')
localStorage.getItem('user')
```

## Common Issues

| Problem | Solution |
|---------|----------|
| "Network Error" | Start backend: `dotnet run` |
| "No OTP email" | Check spam folder |
| "401 Unauthorized" | Token expired - login again |
| "HTTPS warning" | `dotnet dev-certs https --trust` |

## Test Flow

1. ✅ Start backend + frontend
2. ✅ Login with superadmin@vision.com
3. ✅ Register new evaluator
4. ✅ Check email for OTP
5. ✅ Verify OTP
6. ✅ Login as evaluator

## What Works

✅ Backend authentication
✅ JWT tokens
✅ Email OTP
✅ Role mapping
✅ Auto-logout

## Still Using localStorage

⚠️ Projects CRUD
⚠️ Evaluations
⚠️ All Results

## Documentation

📘 INTEGRATION_GUIDE.md - How to use
📘 BACKEND_ANALYSIS.md - API docs
📘 ARCHITECTURE_DIAGRAM.md - Flow diagrams
📘 INTEGRATION_COMPLETE.md - Summary
