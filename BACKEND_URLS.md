# Backend URL Configuration

## 📡 Available Backend URLs

Based on `VisionManagement/Properties/launchSettings.json`:

### **Default Profile: "https"**
When you run `dotnet run`, the backend starts with:
```
HTTP:  http://localhost:5063 (primary)
HTTPS: https://localhost:7034 (requires SSL cert)
```

### **API Endpoints**
```
HTTP:  http://localhost:5063/api (default)
HTTPS: https://localhost:7034/api (alternative)
```

### **Swagger Documentation**
```
HTTP:  http://localhost:5063/swagger (recommended)
HTTPS: https://localhost:7034/swagger (requires cert)
```

---

## 🔧 Frontend Configuration

### **Option 1: HTTP (Default - Recommended)**
```env
# .env
VITE_API_URL=http://localhost:5063/api
```

**Pros:**
- ✅ No SSL certificate issues
- ✅ Works immediately without setup
- ✅ Best for local development
- ✅ Faster development cycle

**Cons:**
- ⚠️ Not secure (fine for localhost)

### **Option 2: HTTPS (Production-like)**
```env
# .env
VITE_API_URL=https://localhost:7034/api
```

**Pros:**
- ✅ Secure connection
- ✅ Production-like environment

**Cons:**
- ⚠️ Requires trusting dev certificate

**If certificate error:**
```bash
dotnet dev-certs https --trust
```

---

## 🚀 Starting the Backend

### **Method 1: Default (HTTPS + HTTP)**
```bash
cd VisionManagement
dotnet run
```
**Listens on:**
- `https://localhost:7034`
- `http://localhost:5063`

### **Method 2: HTTP Only**
```bash
cd VisionManagement
dotnet run --launch-profile http
```
**Listens on:**
- `http://localhost:5063`

### **Method 3: HTTPS Only**
```bash
cd VisionManagement
dotnet run --launch-profile https
```
**Listens on:**
- `https://localhost:7034`
- `http://localhost:5063` (redirects to HTTPS)

---

## 🐛 Troubleshooting

### **Issue: "Unable to connect to backend"**

**Solution 1: Check Backend is Running**
```bash
# Terminal 1 - Backend
cd VisionManagement
dotnet run

# Should show:
# Now listening on: https://localhost:7034
# Now listening on: http://localhost:5063
```

**Solution 2: Try HTTP Instead**
```env
# .env
VITE_API_URL=http://localhost:5063/api
```

### **Issue: "SSL Certificate Error"**

**Solution: Trust the Certificate**
```bash
# Windows/Mac
dotnet dev-certs https --trust

# Linux
dotnet dev-certs https --trust
# If that doesn't work, use HTTP instead
```

### **Issue: "CORS Error"**

**Check Backend CORS Configuration:**
The backend should already allow all origins, but verify in `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

---

## 🔄 Switching Between HTTP and HTTPS

### **Quick Switch:**
Edit `.env` file:
```env
# Use HTTPS
VITE_API_URL=https://localhost:7034/api

# OR use HTTP
VITE_API_URL=http://localhost:5063/api
```

Then restart frontend:
```bash
# Stop (Ctrl+C) and restart
bun run dev
```

---

## 📊 URL Summary

| Service | HTTPS | HTTP |
|---------|-------|------|
| Backend | `https://localhost:7034` | `http://localhost:5063` |
| API | `https://localhost:7034/api` | `http://localhost:5063/api` |
| Swagger | `https://localhost:7034/swagger` | `http://localhost:5063/swagger` |
| Frontend | `http://localhost:5173` | `http://localhost:5173` |

---

## ✅ Recommended Setup

### **For Development:**
```
Backend:  dotnet run (default profile)
          → https://localhost:7034
          → http://localhost:5063

Frontend: VITE_API_URL=https://localhost:7034/api
          bun run dev
          → http://localhost:5173
```

### **If SSL Issues:**
```
Backend:  dotnet run --launch-profile http
          → http://localhost:5063

Frontend: VITE_API_URL=http://localhost:5063/api
          bun run dev
          → http://localhost:5173
```

---

## 🎯 Current Configuration

Your `.env` file is now set to:
```env
VITE_API_URL=https://localhost:7034/api
```

**This will work when you run:** `dotnet run` (uses default "https" profile)

**To verify it's working:**
```bash
# Terminal 1: Start backend
cd VisionManagement
dotnet run

# Terminal 2: Start frontend
bun run dev

# Open browser: http://localhost:5173
# Try logging in with: superadmin@vision.com / SuperAdmin@123
```

---

**Status:** ✅ Configuration Updated
**Backend URLs:** HTTPS (7034) + HTTP (5063)
**Frontend Config:** Using HTTPS by default
