# ✅ Port Configuration Updated to 5063

## 🔄 Configuration Change

**Previous Default:** HTTPS port 7034
**New Default:** HTTP port 5063

---

## 📝 What Changed

### **Primary Port: 5063 (HTTP)**
- ✅ No SSL certificate required
- ✅ Works immediately
- ✅ Best for development
- ✅ Recommended default

### **Alternative Port: 7034 (HTTPS)**
- Available if you need HTTPS
- Requires SSL certificate trust
- Use for production-like testing

---

## ✅ Files Updated

### 1. **`.env`** (Frontend Configuration)
```env
# HTTP (default - most stable for development)
VITE_API_URL=http://localhost:5063/api

# HTTPS (alternative - requires SSL certificate)
# VITE_API_URL=https://localhost:7034/api
```

### 2. **`.env.example`** (Template)
```env
# HTTP (default - recommended for development)
VITE_API_URL=http://localhost:5063/api

# HTTPS (alternative - requires SSL certificate)
# VITE_API_URL=https://localhost:7034/api
```

### 3. **`src/utils/api.js`** (API Service)
```javascript
// Backend URLs from launchSettings.json:
//   HTTP:  http://localhost:5063/api (default)
//   HTTPS: https://localhost:7034/api (alternative)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5063/api',
  // ...
});
```

### 4. **Documentation Files Updated:**
- ✅ `QUICK_REFERENCE.md`
- ✅ `BACKEND_URLS.md`
- ✅ `URL_CONFIG_COMPLETE.md`
- ✅ `INTEGRATION_GUIDE.md`

---

## 🚀 How to Use

### **Default Setup (HTTP - Recommended)**
```bash
# Terminal 1: Start backend
cd VisionManagement
dotnet run
# Listens on: http://localhost:5063 ✅
# Also on: https://localhost:7034

# Terminal 2: Start frontend
bun run dev
# Uses: http://localhost:5063/api ✅
```

**Access:**
- 🌐 Backend API: `http://localhost:5063/api`
- 📚 Swagger: `http://localhost:5063/swagger`
- 💻 Frontend: `http://localhost:5173`

### **Alternative Setup (HTTPS)**
```bash
# 1. Trust SSL certificate
dotnet dev-certs https --trust

# 2. Update .env
VITE_API_URL=https://localhost:7034/api

# 3. Restart frontend
bun run dev
```

---

## 📊 Port Summary

| Port | Protocol | Purpose | Default |
|------|----------|---------|---------|
| 5063 | HTTP | Backend API | ✅ Yes |
| 7034 | HTTPS | Backend API (SSL) | No |
| 5173 | HTTP | Frontend | ✅ Yes |

---

## 🎯 Why HTTP as Default?

### **Advantages:**
- ✅ No SSL certificate setup
- ✅ No "trust certificate" prompts
- ✅ Works immediately on any machine
- ✅ Faster development (no HTTPS overhead)
- ✅ Same security on localhost
- ✅ Simpler debugging

### **When to Use HTTPS (7034):**
- Testing SSL-specific features
- Production-like environment testing
- External API integrations requiring HTTPS
- Testing mixed content policies

---

## 🧪 Test Your Setup

### **Step 1: Start Backend**
```bash
cd VisionManagement
dotnet run

# Should see:
# Now listening on: https://localhost:7034
# Now listening on: http://localhost:5063
```

### **Step 2: Test HTTP Endpoint**
Open browser: `http://localhost:5063/swagger`

Should see Swagger UI ✅

### **Step 3: Start Frontend**
```bash
bun run dev

# Should see:
# Local: http://localhost:5173
```

### **Step 4: Test Login**
1. Open `http://localhost:5173`
2. Open DevTools Console (F12)
3. Try login with: `superadmin@vision.com` / `SuperAdmin@123`
4. Check console:
   ```
   🚀 API Request: POST http://localhost:5063/api/Authentication/login
   ```

If successful → Configuration is correct! ✅

---

## 🔄 Switching Ports

### **Switch to HTTPS (7034):**
```env
# Edit .env
VITE_API_URL=https://localhost:7034/api
```

Restart frontend:
```bash
# Stop (Ctrl+C) and restart
bun run dev
```

### **Switch back to HTTP (5063):**
```env
# Edit .env
VITE_API_URL=http://localhost:5063/api
```

Restart frontend.

---

## 📱 Mobile/Network Testing

If testing from another device on your network:

```bash
# Find your local IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Example: 192.168.1.100
```

Update `.env`:
```env
VITE_API_URL=http://192.168.1.100:5063/api
```

And backend `Program.cs`:
```csharp
.UseUrls("http://0.0.0.0:5063", "https://0.0.0.0:7034")
```

---

## ⚠️ Common Issues

### **Issue: Still trying to connect to 7034**
**Solution:** 
```bash
# Clear browser cache
# Stop frontend (Ctrl+C)
# Restart frontend
bun run dev
```

### **Issue: Backend not accessible**
**Solution:**
```bash
# Check backend is running
cd VisionManagement
dotnet run

# Look for: "Now listening on: http://localhost:5063"
```

### **Issue: CORS error on HTTP**
**Solution:**
Backend `Program.cs` should allow HTTP origins:
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

## 📚 Quick Reference

### **Current Configuration:**
```
Default Port: 5063 (HTTP)
Default URL: http://localhost:5063/api
Protocol: HTTP
SSL: Not required
```

### **Backend Commands:**
```bash
# Start backend (both ports)
dotnet run

# Start backend (HTTP only)
dotnet run --launch-profile http

# Start backend (HTTPS focus)
dotnet run --launch-profile https
```

### **Frontend Commands:**
```bash
# Start frontend (uses .env configuration)
bun run dev

# Check what URL is being used
# Open Console: see "🚀 API Request: ..." messages
```

---

## ✅ Summary

| Item | Status |
|------|--------|
| Default Port | 5063 (HTTP) ✅ |
| Configuration Files | Updated ✅ |
| Documentation | Updated ✅ |
| No SSL Required | ✅ |
| Ready to Use | ✅ |

---

**Your frontend is now configured to use HTTP port 5063 by default!**

This provides the smoothest development experience without SSL certificate issues.

**Status:** ✅ Configuration Complete
**Default Port:** 5063 (HTTP)
**Ready:** Yes - Start backend and frontend!
