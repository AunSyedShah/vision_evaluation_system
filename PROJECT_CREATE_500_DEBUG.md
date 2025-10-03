# Project Create 500 Error - Debugging Guide
**Date:** October 3, 2025  
**Issue:** POST request to `/api/Projects/create` returns 500 Internal Server Error  
**Status:** 🔍 DEBUGGING

---

## 🔍 Problem

When submitting the **Add New Project** form:
```
🚀 API Request: POST http://localhost:5063/api/Projects/create
❌ Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Error: Failed to save project. Please try again.
```

---

## ✅ Changes Made to Frontend

### 1. Updated FormData Construction

**Before:**
```javascript
formData.append('Username', values.username);
formData.append('StartupName', values.startupName);
// ... always appending, even empty strings
```

**After:**
```javascript
// Required fields (always send)
formData.append('StartupName', values.startupName || '');
formData.append('FounderName', values.founderName || '');
formData.append('Email', values.email || '');
formData.append('StartupDescription', values.startupDescription || '');

// Optional fields (only if not empty)
if (values.username) formData.append('Username', values.username);
if (values.phone) formData.append('Phone', values.phone);
// ...
```

### 2. Added Debug Logging

```javascript
// Log what's being sent
console.log('FormData being sent:');
for (let pair of formData.entries()) {
  console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
}
```

### 3. Enhanced Error Handling

```javascript
catch (err) {
  console.error('Failed to save project:', err);
  console.error('Error response:', err.response?.data);
  console.error('Error status:', err.response?.status);
  
  // Display detailed error message
  let errorMessage = 'Failed to save project. Please try again.';
  if (err.response?.data?.message) {
    errorMessage = err.response.data.message;
  } else if (err.response?.data?.errors) {
    // Handle validation errors from ASP.NET
    const validationErrors = Object.entries(err.response.data.errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('; ');
    errorMessage = `Validation errors: ${validationErrors}`;
  } else if (err.response?.data) {
    errorMessage = JSON.stringify(err.response.data);
  }
  
  setError(errorMessage);
}
```

---

## 🧪 Testing Steps

### Step 1: Check Browser Console

1. Open **DevTools** (F12)
2. Go to **Console** tab
3. Try to submit the form
4. Look for:
   ```
   FormData being sent:
   StartupName: TestStartup
   FounderName: John Doe
   Email: test@example.com
   ...
   
   Failed to save project: Error: Request failed...
   Error response: { ... backend error details ... }
   Error status: 500
   ```

### Step 2: Check Network Tab

1. Open **DevTools** → **Network** tab
2. Submit the form
3. Find the **POST /api/Projects/create** request
4. Click on it
5. Check:
   - **Headers** tab → Request Headers (Authorization, Content-Type)
   - **Payload** tab → Form Data being sent
   - **Response** tab → Backend error message

### Step 3: Check Backend Console

1. Look at the terminal where `dotnet run` is running
2. Check for error messages like:
   ```
   fail: Microsoft.AspNetCore.Diagnostics.DeveloperExceptionPageMiddleware[1]
         An unhandled exception has occurred while executing the request.
   System.InvalidOperationException: ...
   ```

---

## 🔬 Common Causes of 500 Error

### 1. Database Connection Issue
```
❌ Unable to connect to SQL Server
❌ VisionDB database doesn't exist
```

**Check:**
```bash
cd VisionManagement
dotnet ef database update
```

### 2. File Upload Directory Missing
```
❌ Directory "Uploads/logos" doesn't exist
❌ Permission denied writing to Uploads folder
```

**Fix:**
```bash
cd VisionManagement
mkdir -p Uploads/logos
mkdir -p Uploads/founders
mkdir -p Uploads/videos
mkdir -p Uploads/images
```

### 3. Required Field Validation
```
❌ ModelState.IsValid = false
❌ StartupName is required
```

**Check Backend:**
```csharp
if (!ModelState.IsValid)
    return BadRequest(ModelState);
```

### 4. Authorization Issue
```
❌ JWT token expired
❌ User doesn't have SuperAdmin role
```

**Check:**
- Token in localStorage still valid?
- User role is "SuperAdmin" or "FSO"?

### 5. File Size Limit
```
❌ Request body too large
❌ File exceeds maximum size
```

**Check appsettings.json:**
```json
{
  "Kestrel": {
    "Limits": {
      "MaxRequestBodySize": 52428800  // 50MB
    }
  }
}
```

---

## 🛠️ Backend Validation

### ProjectUploadModel (all nullable)
```csharp
public class ProjectUploadModel
{
    public string? Username { get; set; }
    public string? StartupName { get; set; }
    public string? FounderName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? WebsiteLink { get; set; }
    public string? MobileAppLink { get; set; }
    public string? StartupDescription { get; set; }
    public string? StartupStatus { get; set; }
    public string? SpotlightReason { get; set; }
    
    public IFormFile? StartupLogo { get; set; }
    public IFormFile? FounderPhoto { get; set; }
    public IFormFile? DefaultVideo { get; set; }
    public IFormFile? PitchVideo { get; set; }
    public IFormFile? Image1 { get; set; }
    public IFormFile? Image2 { get; set; }
    public IFormFile? Image3 { get; set; }
}
```

**All fields are nullable** - so empty values should be accepted.

### Project Model (MaxLength Constraints)
```csharp
[MaxLength(100)] public string? Username { get; set; }
[MaxLength(200)] public string? StartupName { get; set; }
[MaxLength(150)] public string? FounderName { get; set; }
[MaxLength(100)] public string? Email { get; set; }
[MaxLength(20)]  public string? Phone { get; set; }
[MaxLength(250)] public string? WebsiteLink { get; set; }
[MaxLength(250)] public string? MobileAppLink { get; set; }
[MaxLength(1000)] public string? StartupDescription { get; set; }
[MaxLength(100)] public string? StartupStatus { get; set; }
```

**Check:** Are any input values exceeding these limits?

---

## 🔍 Debugging Checklist

### Frontend
- [ ] Open browser console and check logs
- [ ] Verify FormData contains expected values
- [ ] Check Network tab for request payload
- [ ] Verify Authorization header is present
- [ ] Check if Content-Type is multipart/form-data

### Backend
- [ ] Check backend console for error stack trace
- [ ] Verify database is running and accessible
- [ ] Check if Uploads folders exist
- [ ] Verify JWT token is valid
- [ ] Check if user has SuperAdmin/FSO role
- [ ] Add breakpoint in CreateProject method

### Quick Backend Debug
Add this to the top of `CreateProject` method:

```csharp
[HttpPost("create")]
[Authorize(Roles = "FSO,SuperAdmin")]
public async Task<IActionResult> CreateProject([FromForm] ProjectUploadModel model)
{
    // ⚠️ DEBUGGING
    Console.WriteLine("=== CREATE PROJECT DEBUG ===");
    Console.WriteLine($"StartupName: {model.StartupName}");
    Console.WriteLine($"FounderName: {model.FounderName}");
    Console.WriteLine($"Email: {model.Email}");
    Console.WriteLine($"ModelState.IsValid: {ModelState.IsValid}");
    if (!ModelState.IsValid)
    {
        foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
        {
            Console.WriteLine($"Validation Error: {error.ErrorMessage}");
        }
    }
    Console.WriteLine("============================");
    
    if (!ModelState.IsValid)
        return BadRequest(ModelState);
    
    // ... rest of code
}
```

---

## 📊 Expected vs Actual

### Expected Request
```
POST /api/Projects/create
Content-Type: multipart/form-data; boundary=----...
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

FormData:
  StartupName: "TestStartup"
  FounderName: "John Doe"
  Email: "test@example.com"
  StartupDescription: "Test description"
  Username: "testuser"
  Phone: "+1234567890"
  StartupLogo: [File object]
```

### Expected Response (Success)
```json
{
  "message": "✅ Project created successfully",
  "project": {
    "$id": "1",
    "Id": 1,
    "Username": "testuser",
    "StartupName": "TestStartup",
    "FounderName": "John Doe",
    "Email": "test@example.com",
    "Timestamp": "2025-10-03T10:00:00Z",
    ...
  }
}
```

### Actual Response (Error)
```
Status: 500 Internal Server Error
Body: (need to check backend console)
```

---

## 🚀 Next Steps

1. **Try to submit the form again** and check:
   - Browser console for FormData log
   - Network tab for request details
   - Backend console for error message

2. **Share the error details:**
   - What does the browser console show?
   - What does the Network tab Response show?
   - What does the backend console error say?

3. **Test with minimal data:**
   ```
   Startup Name: Test
   Founder Name: Test User
   Email: test@test.com
   Description: Test description
   (no files)
   ```

4. **Verify backend is running:**
   ```bash
   curl http://localhost:5063/api/Projects
   ```

---

## 💡 Quick Fixes to Try

### Fix 1: Restart Backend
```bash
cd VisionManagement
dotnet clean
dotnet build
dotnet run
```

### Fix 2: Check Database
```bash
cd VisionManagement
dotnet ef database update
```

### Fix 3: Create Upload Folders
```bash
cd VisionManagement
mkdir -p Uploads/logos Uploads/founders Uploads/videos Uploads/images
```

### Fix 4: Clear Browser Storage & Re-login
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then login again
```

### Fix 5: Test API with Postman/curl
```bash
curl -X POST http://localhost:5063/api/Projects/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "StartupName=TestStartup" \
  -F "FounderName=John Doe" \
  -F "Email=test@example.com" \
  -F "StartupDescription=Test description"
```

---

## ✅ Resolution

Once you provide the error details from:
1. Browser console
2. Network tab response
3. Backend console logs

I can identify the exact cause and provide a specific fix.

**Status:** 🔄 Waiting for error details from user
