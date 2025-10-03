# 🔧 API Error Debugging Guide

## 🎯 Enhanced Error Logging

The `src/utils/api.js` file now includes comprehensive error logging to help identify network issues quickly.

---

## 📊 Error Types You'll See in Console

### 1. **🌐 Network Error (CORS)**
```
🔴 API Error Details
📡 Network Error (No Response)
🌐 NETWORK ERROR DETECTED:
   Possible causes:
   1. ❌ CORS Error - Backend not allowing frontend origin
   2. ❌ Backend not running - Check if dotnet run is active
   3. ❌ Wrong URL - Check VITE_API_URL in .env
   4. ❌ SSL Certificate - Try HTTP instead of HTTPS
   5. ❌ Firewall blocking connection
```

**What it means:**
- Frontend can't connect to backend
- Most common: CORS policy or backend not running

**Solutions:**
```bash
# 1. Check backend is running
cd VisionManagement
dotnet run
# Should see: "Now listening on: https://localhost:7034"

# 2. Check CORS in Program.cs
# Should have: AllowAnyOrigin() or specific origin

# 3. Try HTTP instead of HTTPS
# Edit .env: VITE_API_URL=http://localhost:5063/api
```

---

### 2. **🔒 401 Unauthorized**
```
🔴 API Error Details
📡 Response Error: { status: 401 }
🔒 Authentication Error: Token expired or invalid
```

**What it means:**
- JWT token is invalid or expired
- User will be auto-logged out

**Solutions:**
- Token expires after 3 hours
- User needs to login again
- Check backend JWT configuration

---

### 3. **🚫 403 Forbidden**
```
🔴 API Error Details
📡 Response Error: { status: 403 }
🚫 Authorization Error: Access forbidden
```

**What it means:**
- User doesn't have required role
- Trying to access SuperAdmin endpoint as Evaluator

**Solutions:**
- Check user role in localStorage
- Verify backend [Authorize] attributes
- Check role mapping (SuperAdmin ↔ superadmin)

---

### 4. **🔍 404 Not Found**
```
🔴 API Error Details
📡 Response Error: { status: 404 }
🔍 Not Found: Resource does not exist
```

**What it means:**
- API endpoint doesn't exist
- Wrong URL or route

**Solutions:**
- Check API endpoint in backend controller
- Verify route in api.js matches backend
- Check for typos in URL

---

### 5. **💥 500 Internal Server Error**
```
🔴 API Error Details
📡 Response Error: { status: 500 }
💥 Server Error: Internal server error
```

**What it means:**
- Backend crashed or threw exception
- Database connection issue

**Solutions:**
- Check backend console for error details
- Check database is running (SQL Server)
- Check backend logs

---

### 6. **🔌 Connection Refused**
```
🔴 API Error Details
📡 Network Error (No Response)
🔌 CONNECTION REFUSED:
   Backend is not running or not accessible
```

**What it means:**
- Backend is not running
- Wrong port number

**Solutions:**
```bash
# Start backend
cd VisionManagement
dotnet run

# Check it's on correct port
# Should see: https://localhost:7034
```

---

### 7. **⏱️ Connection Timeout**
```
🔴 API Error Details
📡 Network Error (No Response)
⏱️ CONNECTION TIMEOUT:
   Backend took too long to respond
```

**What it means:**
- Backend is slow or stuck
- Database query taking too long

**Solutions:**
- Restart backend
- Check database performance
- Check backend console for hanging requests

---

### 8. **🔒 SSL Certificate Error**
```
🔴 API Error Details
📡 Network Error (No Response)
🔒 SSL CERTIFICATE ERROR:
```

**What it means:**
- HTTPS certificate not trusted

**Solutions:**
```bash
# Option 1: Trust certificate
dotnet dev-certs https --trust

# Option 2: Use HTTP instead
# Edit .env: VITE_API_URL=http://localhost:5063/api
```

---

## 🛠️ How to Debug

### **Step 1: Open Browser Console**
```
F12 (Windows/Linux)
Cmd+Option+I (Mac)
```

### **Step 2: Look for Error Groups**
```
🔴 API Error Details
  ├── 📡 Response Error (if backend responded)
  ├── 📡 Network Error (if no response)
  └── ❓ Unknown Error (other issues)
```

### **Step 3: Read the Details**
The console will show:
- ✅ Error type
- ✅ URL that failed
- ✅ HTTP method (GET, POST, etc.)
- ✅ Status code (if any)
- ✅ Error message
- ✅ Possible causes
- ✅ Suggested solutions

### **Step 4: Follow Solutions**
Each error type has specific solutions listed in console

---

## 📝 Request Logging (Development Mode)

In development, you'll also see outgoing requests:
```
🚀 API Request: POST https://localhost:7034/api/Authentication/login
🚀 API Request: GET https://localhost:7034/api/Evaluations/assigned
```

This helps track:
- ✅ What API calls are being made
- ✅ When they're being made
- ✅ What URL is being used

---

## 🔍 Common Issues & Quick Fixes

### **Issue: CORS Error**
```javascript
Console shows: "🌐 NETWORK ERROR DETECTED"
```

**Fix:**
1. Check backend `Program.cs`:
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
   
   // Later in the file:
   app.UseCors("AllowAll");
   ```

2. Make sure CORS is added BEFORE `app.UseAuthorization()`

3. Restart backend

### **Issue: Backend Not Running**
```javascript
Console shows: "🔌 CONNECTION REFUSED"
```

**Fix:**
```bash
cd VisionManagement
dotnet run

# Wait for:
# "Now listening on: https://localhost:7034"
# "Now listening on: http://localhost:5063"
```

### **Issue: Wrong URL**
```javascript
Console shows: "Check VITE_API_URL in .env"
```

**Fix:**
1. Check `.env` file:
   ```env
   VITE_API_URL=https://localhost:7034/api
   ```

2. Make sure it matches backend port (7034 or 5063)

3. Restart frontend:
   ```bash
   # Stop (Ctrl+C) and restart
   bun run dev
   ```

### **Issue: SSL Certificate**
```javascript
Console shows: "🔒 SSL CERTIFICATE ERROR"
```

**Fix Option 1 - Trust Certificate:**
```bash
dotnet dev-certs https --trust
```

**Fix Option 2 - Use HTTP:**
```env
# .env
VITE_API_URL=http://localhost:5063/api
```

---

## 🎯 Testing Your Setup

### **Test 1: Check Backend**
```bash
cd VisionManagement
dotnet run

# Should see:
# ✅ Now listening on: https://localhost:7034
# ✅ Now listening on: http://localhost:5063
```

### **Test 2: Check Swagger**
Open: `https://localhost:7034/swagger`

If you can see Swagger UI → Backend is working! ✅

### **Test 3: Check Frontend**
```bash
bun run dev

# Open: http://localhost:5173
# Open Console (F12)
# Try to login
```

### **Test 4: Check Console Output**
After attempting login, console should show:
```
🚀 API Request: POST https://localhost:7034/api/Authentication/login

If successful:
  ✅ No errors

If failed:
  🔴 API Error Details (with specific error type)
```

---

## 📊 Error Priority

1. 🔥 **CONNECTION REFUSED** → Backend not running
2. 🔥 **NETWORK ERROR** → CORS or wrong URL
3. 🟡 **401 Unauthorized** → Token expired (expected after 3 hours)
4. 🟡 **403 Forbidden** → Wrong role for endpoint
5. 🟡 **500 Server Error** → Backend bug
6. 🟢 **404 Not Found** → Typo in URL

---

## 🎨 Console Output Examples

### **Successful Request:**
```
🚀 API Request: POST https://localhost:7034/api/Authentication/login
(no error group)
```

### **CORS Error:**
```
🚀 API Request: POST https://localhost:7034/api/Authentication/login
🔴 API Error Details
  📡 Network Error (No Response)
  🌐 NETWORK ERROR DETECTED:
     Possible causes:
     1. ❌ CORS Error
     ...
```

### **Backend Down:**
```
🚀 API Request: GET https://localhost:7034/api/Projects
🔴 API Error Details
  📡 Network Error (No Response)
  🔌 CONNECTION REFUSED:
     Backend is not running
```

### **Token Expired:**
```
🚀 API Request: GET https://localhost:7034/api/Evaluations/my
🔴 API Error Details
  📡 Response Error: { status: 401 }
  🔒 Authentication Error: Token expired
  (User redirected to /login)
```

---

## 📚 Related Files

- **`src/utils/api.js`** - Error handling implementation
- **`.env`** - Backend URL configuration
- **`BACKEND_URLS.md`** - URL reference guide

---

**Status:** ✅ Enhanced error logging enabled
**Location:** Browser DevTools Console (F12)
**Mode:** Automatically active in development
