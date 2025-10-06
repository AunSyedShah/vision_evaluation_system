# SuperAdmin: Create Evaluator Feature

**Date**: October 5, 2025  
**Feature**: SuperAdmin can create evaluators internally without OTP verification

---

## Overview

This feature allows SuperAdmin to add evaluators (users) directly through an internal form, bypassing the OTP verification process. This is useful for quickly onboarding evaluators without requiring them to go through email verification.

---

## Backend Implementation

### 1. Database Changes ✅

**New Fields Added to `Users` Table**:
- `Designation` (nvarchar(100), nullable) - Evaluator's job title/designation
- `Company` (nvarchar(100), nullable) - Evaluator's company/organization

**Migration Created**:
- File: `Migrations/20251004191643_AddDesignationAndCompanyToUser.cs`
- Status: ✅ Applied to database

**SQL Executed**:
```sql
ALTER TABLE [Users] ADD [Company] nvarchar(100) NULL;
ALTER TABLE [Users] ADD [Designation] nvarchar(100) NULL;
```

---

### 2. Model Updates ✅

**File**: `VisionManagement/Models/User.cs`

```csharp
public partial class User
{
    public int UserId { get; set; }
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Email { get; set; } = null!;
    
    // NEW FIELDS
    public string? Designation { get; set; }  // Evaluator's designation/title
    public string? Company { get; set; }      // Evaluator's company/organization
    
    public string? OtpCode { get; set; }
    public DateTime? OtpExpiration { get; set; }
    public bool IsOtpVerified { get; set; } = false;
    public int RoleId { get; set; }
    public virtual Role Role { get; set; } = null!;
}
```

---

### 3. New API Endpoint ✅

**Endpoint**: `POST /api/SuperAdmin/createEvaluator`  
**Authorization**: SuperAdmin only  
**Content-Type**: application/json

**Request Body**:
```json
{
  "username": "john_evaluator",
  "email": "john@example.com",
  "designation": "Senior Evaluator",
  "company": "Tech Ventures Inc",
  "password": "SecurePass123"  // Optional, defaults to "Evaluator@123"
}
```

**Response (Success - 200 OK)**:
```json
{
  "message": "Evaluator created successfully.",
  "userId": 15,
  "username": "john_evaluator",
  "email": "john@example.com",
  "designation": "Senior Evaluator",
  "company": "Tech Ventures Inc",
  "defaultPassword": "SecurePass123"
}
```

**Response (Error - 400 Bad Request)**:
```json
{
  "message": "Username already exists."
}
// OR
{
  "message": "Email already exists."
}
```

**Response (Error - 404 Not Found)**:
```json
{
  "message": "User role not found in database."
}
```

---

### 4. Endpoint Logic

**Features**:
1. ✅ **Username Validation**: Checks if username already exists
2. ✅ **Email Validation**: Checks if email already exists
3. ✅ **Role Assignment**: Automatically assigns "User" role (evaluator)
4. ✅ **Password Handling**:
   - Uses provided password if supplied
   - Defaults to "Evaluator@123" if not provided
   - Hashes password using SHA256 (same as registration)
5. ✅ **Auto-Verification**: Sets `IsOtpVerified = true` (no OTP needed)
6. ✅ **Returns Password**: Returns the password so SuperAdmin can share it with evaluator
7. ✅ **Designation & Company**: Optional fields for evaluator profile

**Code Location**: `VisionManagement/Controllers/SuperAdminController.cs`

```csharp
[HttpPost("createEvaluator")]
public async Task<IActionResult> CreateEvaluator([FromBody] CreateEvaluatorDto dto)
{
    // Validation checks
    // Password hashing
    // Create user with IsOtpVerified = true
    // Return created user with password
}
```

---

### 5. DTO Definition

**File**: `VisionManagement/Controllers/SuperAdminController.cs`

```csharp
public class CreateEvaluatorDto
{
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Designation { get; set; }
    public string? Company { get; set; }
    public string? Password { get; set; } // Optional: defaults to "Evaluator@123"
}
```

---

### 6. Updated getAllUsers Endpoint ✅

**Enhanced to include new fields**:

```csharp
var query = _context.Users
    .Include(u => u.Role)
    .Where(u => u.Role.RoleName == "User")
    .Select(u => new
    {
        u.UserId,
        u.Username,
        u.Email,
        u.Designation,      // NEW
        u.Company,          // NEW
        u.IsOtpVerified,
        u.RoleId,
        RoleName = u.Role.RoleName
    });
```

**Now returns**:
```json
[
  {
    "userId": 5,
    "username": "alice_evaluator",
    "email": "alice@example.com",
    "designation": "Senior Evaluator",
    "company": "Tech Ventures Inc",
    "isOtpVerified": true,
    "roleId": 1,
    "roleName": "User"
  }
]
```

---

## Testing the Backend

### Test 1: Create Evaluator with All Fields

```bash
curl -X POST http://localhost:5063/api/SuperAdmin/createEvaluator \
  -H "Authorization: Bearer {superadmin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_evaluator",
    "email": "john@techventures.com",
    "designation": "Senior Project Evaluator",
    "company": "Tech Ventures Inc",
    "password": "John@2025"
  }'
```

**Expected Response**:
```json
{
  "message": "Evaluator created successfully.",
  "userId": 15,
  "username": "john_evaluator",
  "email": "john@techventures.com",
  "designation": "Senior Project Evaluator",
  "company": "Tech Ventures Inc",
  "defaultPassword": "John@2025"
}
```

---

### Test 2: Create Evaluator with Default Password

```bash
curl -X POST http://localhost:5063/api/SuperAdmin/createEvaluator \
  -H "Authorization: Bearer {superadmin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_evaluator",
    "email": "jane@example.com",
    "designation": "Junior Evaluator",
    "company": "Innovation Labs"
  }'
```

**Expected Response**:
```json
{
  "message": "Evaluator created successfully.",
  "userId": 16,
  "username": "jane_evaluator",
  "email": "jane@example.com",
  "designation": "Junior Evaluator",
  "company": "Innovation Labs",
  "defaultPassword": "Evaluator@123"
}
```

---

### Test 3: Duplicate Username

```bash
curl -X POST http://localhost:5063/api/SuperAdmin/createEvaluator \
  -H "Authorization: Bearer {superadmin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_evaluator",
    "email": "different@example.com"
  }'
```

**Expected Response** (400 Bad Request):
```json
{
  "message": "Username already exists."
}
```

---

### Test 4: Duplicate Email

```bash
curl -X POST http://localhost:5063/api/SuperAdmin/createEvaluator \
  -H "Authorization: Bearer {superadmin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "different_user",
    "email": "john@techventures.com"
  }'
```

**Expected Response** (400 Bad Request):
```json
{
  "message": "Email already exists."
}
```

---

### Test 5: Verify New Evaluator Can Login

```bash
# Login with created evaluator credentials
curl -X POST http://localhost:5063/api/Authentication/login \
  -H "Content-Type: application/json" \
  -d '{
    "Username": "john_evaluator",
    "Password": "John@2025"
  }'
```

**Expected Response**:
```json
{
  "userId": 15,
  "username": "john_evaluator",
  "email": "john@techventures.com",
  "role": "User",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note**: No OTP verification needed - evaluator can login immediately!

---

### Test 6: Verify getAllUsers Returns New Fields

```bash
curl -X GET http://localhost:5063/api/SuperAdmin/getAllUsers \
  -H "Authorization: Bearer {superadmin_token}"
```

**Expected Response**:
```json
[
  {
    "userId": 15,
    "username": "john_evaluator",
    "email": "john@techventures.com",
    "designation": "Senior Project Evaluator",
    "company": "Tech Ventures Inc",
    "otpCode": null,
    "otpExpiration": null,
    "isOtpVerified": true,
    "roleId": 1,
    "roleName": "User"
  }
]
```

---

## Comparison: Self-Registration vs SuperAdmin Creation

| Feature | Self-Registration | SuperAdmin Creation |
|---------|------------------|---------------------|
| **Endpoint** | POST /Authentication/register | POST /SuperAdmin/createEvaluator |
| **OTP Required** | ✅ Yes (email verification) | ❌ No (auto-verified) |
| **Password** | User chooses | SuperAdmin sets (or default) |
| **Immediate Login** | ❌ No (must verify OTP first) | ✅ Yes (already verified) |
| **Designation** | ❌ Not collected | ✅ Can be set |
| **Company** | ❌ Not collected | ✅ Can be set |
| **Use Case** | Public evaluators | Internal/invited evaluators |
| **Authorization** | Public | SuperAdmin only |

---

## Frontend Implementation (Next Steps)

### 1. Create Form Component

**File**: `src/pages/SuperAdmin/CreateEvaluatorForm.jsx`

**Form Fields**:
- Username (required)
- Email (required)
- Designation (optional)
- Company (optional)
- Password (optional - show default)

**Example UI**:
```
┌─────────────────────────────────────────┐
│  Create Evaluator                       │
├─────────────────────────────────────────┤
│  Username: [___________________]        │
│  Email:    [___________________]        │
│  Designation: [___________________]     │
│  Company:  [___________________]        │
│  Password: [___________________]        │
│            (Leave empty for default)    │
│                                         │
│  [Cancel]  [Create Evaluator]          │
└─────────────────────────────────────────┘
```

---

### 2. API Function

**File**: `src/utils/api.js`

```javascript
/**
 * Create evaluator internally (SuperAdmin only, no OTP)
 * @param {object} evaluatorData - Evaluator details
 * @returns {Promise} Created evaluator with password
 */
export const createEvaluatorInternal = async (evaluatorData) => {
  const response = await api.post('/SuperAdmin/createEvaluator', {
    Username: evaluatorData.username,
    Email: evaluatorData.email,
    Designation: evaluatorData.designation || null,
    Company: evaluatorData.company || null,
    Password: evaluatorData.password || null
  });
  return response.data;
};
```

---

### 3. Usage Example

```javascript
import { createEvaluatorInternal } from '../utils/api';

const CreateEvaluatorForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    designation: '',
    company: '',
    password: ''
  });
  const [createdUser, setCreatedUser] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createEvaluatorInternal(formData);
      setCreatedUser(result);
      
      // Show success message with password
      alert(`Evaluator created successfully!\n\nUsername: ${result.username}\nPassword: ${result.defaultPassword}\n\nPlease share these credentials with the evaluator.`);
      
    } catch (error) {
      console.error('Error creating evaluator:', error);
      alert(error.response?.data?.message || 'Failed to create evaluator');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

---

### 4. Update Evaluators List

**File**: `src/pages/SuperAdmin/EvaluatorsList.jsx`

**Add columns for new fields**:
```javascript
<table>
  <thead>
    <tr>
      <th>Username</th>
      <th>Email</th>
      <th>Designation</th>     {/* NEW */}
      <th>Company</th>          {/* NEW */}
      <th>Verified</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {evaluators.map(evaluator => (
      <tr key={evaluator.userId}>
        <td>{evaluator.username}</td>
        <td>{evaluator.email}</td>
        <td>{evaluator.designation || '-'}</td>
        <td>{evaluator.company || '-'}</td>
        <td>{evaluator.isOtpVerified ? '✓' : '✗'}</td>
        <td>{/* Actions */}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## Security Considerations

### ✅ Secure Features

1. **Authorization**: Only SuperAdmin can create evaluators
2. **Password Hashing**: Uses SHA256 (same as registration)
3. **Duplicate Prevention**: Checks username and email uniqueness
4. **Auto-Verification**: Evaluators are pre-verified (trusted by SuperAdmin)

### 🔒 Best Practices

1. **Password Sharing**: SuperAdmin should share password securely (not via email)
2. **Force Password Change**: Consider requiring evaluator to change password on first login
3. **Strong Default**: Default password "Evaluator@123" should be changed by user
4. **Audit Log**: Consider logging who created which evaluators (future enhancement)

---

## Future Enhancements

1. **Bulk Import**: Upload CSV to create multiple evaluators
2. **Email Notification**: Automatically email credentials to new evaluator
3. **Force Password Change**: Require password change on first login
4. **Edit Evaluator**: Allow updating designation and company
5. **Deactivate Evaluator**: Soft delete instead of hard delete
6. **Audit Trail**: Track who created/modified evaluators

---

## Summary

✅ **Implemented**:
- Database migration with Designation and Company fields
- POST /api/SuperAdmin/createEvaluator endpoint
- Validation for duplicate username/email
- Password hashing and auto-verification
- Updated getAllUsers to return new fields

📝 **Next Steps**:
- Create frontend form for evaluator creation
- Update evaluators list to show new fields
- Add API function in src/utils/api.js
- Test end-to-end flow

🎯 **Benefits**:
- Quick onboarding of trusted evaluators
- No OTP verification delays
- Structured evaluator profiles (designation, company)
- SuperAdmin has full control

---

**Status**: ✅ **Backend Complete - Ready for Frontend Integration**

**Build Status**: ✅ Compiled successfully with 24 warnings (non-critical)

**Database Status**: ✅ Migration applied successfully
