# ✅ Backend URL Configuration Complete

## 🎯 Summary

I've updated all configuration files to reflect both HTTP and HTTPS URLs from your backend's `launchSettings.json`.

---

## 📡 Backend URLs

From `VisionManagement/Properties/launchSettings.json`:

```json
"https" profile (default when running dotnet run):
  - HTTPS: https://localhost:7034
  - HTTP:  http://localhost:5063

"http" profile:
  - HTTP:  http://localhost:5063
```

---

## ✅ Files Updated

### 1. **`.env`** (Frontend Configuration)
```env
# HTTPS (recommended - default)
VITE_API_URL=https://localhost:7034/api

# HTTP (alternative if SSL certificate issues)
# VITE_API_URL=http://localhost:5063/api
```

### 2. **`.env.example`** (Template)
Added both URLs with instructions

### 3. **`src/utils/api.js`** (API Service)
Added comments showing both available URLs:
```javascript
// Backend URLs from launchSettings.json:
//   HTTPS: https://localhost:7034/api (default)
//   HTTP:  http://localhost:5063/api (alternative)
```

### 4. **`BACKEND_URLS.md`** (NEW)
Complete guide for:
- Available URLs
- How to switch between HTTP/HTTPS
- Troubleshooting SSL issues
- Launch profiles

### 5. **`QUICK_REFERENCE.md`** (Updated)
Added both URLs to quick reference

### 6. **`INTEGRATION_GUIDE.md`** (Updated)
Added URL options and instructions

---

## 🚀 How to Use

### **Option 1: HTTPS (Current Default)**
```bash
# Start backend (listens on both ports)
cd VisionManagement
dotnet run

# Frontend already configured for HTTPS
bun run dev
```

**Access:**
- Backend API: `https://localhost:7034/api`
- Backend Swagger: `https://localhost:7034/swagger`
- Frontend: `http://localhost:5173`

### **Option 2: HTTP (If SSL Issues)**
```bash
# 1. Update .env file
# Change: VITE_API_URL=https://localhost:7034/api
# To:     VITE_API_URL=http://localhost:5063/api

# 2. Start backend
cd VisionManagement
dotnet run

# 3. Start frontend
bun run dev
```

**Access:**
- Backend API: `http://localhost:5063/api`
- Backend Swagger: `http://localhost:5063/swagger`
- Frontend: `http://localhost:5173`

---

## 🔒 SSL Certificate (For HTTPS)

If you get SSL certificate errors:

```bash
# Trust the development certificate
dotnet dev-certs https --trust

# Then restart backend
cd VisionManagement
dotnet run
```

---

## 🎯 Quick Reference

| What | HTTPS | HTTP |
|------|-------|------|
| Backend API | `https://localhost:7034/api` | `http://localhost:5063/api` |
| Swagger | `https://localhost:7034/swagger` | `http://localhost:5063/swagger` |
| Frontend | `http://localhost:5173` | `http://localhost:5173` |

**Current Configuration:** HTTPS (`https://localhost:7034/api`)

---

## 📚 Documentation Files

- **`BACKEND_URLS.md`** - Complete URL configuration guide
- **`.env`** - Frontend configuration (HTTPS by default)
- **`.env.example`** - Configuration template with both options

---

**Status:** ✅ Configuration Complete
**Default:** HTTP on port 5063
**Alternative:** HTTPS on port 7034 (requires SSL cert)
**Frontend:** Ready to connect to backend
