# SuperAdmin Update Evaluator Feature - Backend Implementation

## Overview
SuperAdmin can now update evaluator details including username, email, designation, company, and optionally reset their password.

## API Endpoint

### Update Evaluator
**PUT** `/api/SuperAdmin/updateEvaluator/{userId}`

**Authorization**: Bearer Token (SuperAdmin role required)

**Route Parameters**:
- `userId` (int): The ID of the evaluator to update

**Request Body** (UpdateEvaluatorDto):
```json
{
  "username": "updated_evaluator",       // Optional: New username
  "email": "newemail@example.com",       // Optional: New email
  "designation": "Senior Developer",     // Optional: New designation
  "company": "Tech Corp",                // Optional: New company
  "password": "NewPassword123"           // Optional: Reset password
}
```

**Notes**:
- All fields are optional - only include fields you want to update
- Username and Email must be unique (excluding current user)
- Password will be hashed using SHA256 if provided
- Designation and Company can be set to empty string to clear them
- Only users with Role "User" (evaluators) can be updated

**Success Response** (200 OK):
```json
{
  "message": "Evaluator updated successfully.",
  "userId": 5,
  "username": "updated_evaluator",
  "email": "newemail@example.com",
  "designation": "Senior Developer",
  "company": "Tech Corp",
  "passwordChanged": true
}
```

**Error Responses**:

**404 Not Found** - Evaluator not found:
```json
{
  "message": "Evaluator not found."
}
```

**400 Bad Request** - Username conflict:
```json
{
  "message": "Username already exists."
}
```

**400 Bad Request** - Email conflict:
```json
{
  "message": "Email already exists."
}
```

**401 Unauthorized** - Invalid or missing token

**403 Forbidden** - User is not SuperAdmin

## Implementation Details

### Controller Method
Located in: `VisionManagement/Controllers/SuperAdminController.cs`

**Key Features**:
1. **User Validation**: Checks if userId exists and is an evaluator (Role = "User")
2. **Username Uniqueness**: Validates new username doesn't conflict (excluding current user)
3. **Email Uniqueness**: Validates new email doesn't conflict (excluding current user)
4. **Selective Updates**: Only updates fields that are provided in request
5. **Password Hashing**: Uses SHA256 to hash new password if provided
6. **Clear Fields**: Setting Designation or Company to empty string clears them (sets to null)

### DTO Class
```csharp
public class UpdateEvaluatorDto
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? Designation { get; set; }
    public string? Company { get; set; }
    public string? Password { get; set; } // Optional: If provided, will reset password
}
```

### Security Features
- **Role-based authorization**: Only SuperAdmin can access this endpoint
- **Password hashing**: New passwords are hashed using SHA256 (consistent with registration)
- **Conflict detection**: Prevents duplicate usernames and emails
- **User type validation**: Only evaluators (Role = "User") can be updated

### Database Operations
1. Queries Users table with RoleName filter
2. Validates uniqueness constraints
3. Selectively updates only provided fields
4. Saves changes atomically

## Usage Examples

### Example 1: Update Only Email
```http
PUT /api/SuperAdmin/updateEvaluator/5
Authorization: Bearer <superadmin-token>
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

### Example 2: Update Multiple Fields
```http
PUT /api/SuperAdmin/updateEvaluator/5
Authorization: Bearer <superadmin-token>
Content-Type: application/json

{
  "username": "senior_evaluator",
  "designation": "Senior Technical Evaluator",
  "company": "Vision Tech Solutions"
}
```

### Example 3: Reset Password Only
```http
PUT /api/SuperAdmin/updateEvaluator/5
Authorization: Bearer <superadmin-token>
Content-Type: application/json

{
  "password": "NewSecurePassword123"
}
```

### Example 4: Update All Fields
```http
PUT /api/SuperAdmin/updateEvaluator/5
Authorization: Bearer <superadmin-token>
Content-Type: application/json

{
  "username": "updated_evaluator",
  "email": "updated@example.com",
  "designation": "Lead Evaluator",
  "company": "Vision Management Inc",
  "password": "CompletelyNewPassword456"
}
```

### Example 5: Clear Designation and Company
```http
PUT /api/SuperAdmin/updateEvaluator/5
Authorization: Bearer <superadmin-token>
Content-Type: application/json

{
  "designation": "",
  "company": ""
}
```

## Testing Recommendations

### Test Cases
1. ✅ Update single field (username, email, designation, company, password)
2. ✅ Update multiple fields simultaneously
3. ✅ Update with duplicate username (should return 400)
4. ✅ Update with duplicate email (should return 400)
5. ✅ Update non-existent userId (should return 404)
6. ✅ Update with invalid userId (should return 404)
7. ✅ Update as non-SuperAdmin user (should return 403)
8. ✅ Update without token (should return 401)
9. ✅ Clear designation and company fields
10. ✅ Update with all optional fields empty (should return 200, no changes)

### Edge Cases
- Empty string vs null for optional fields
- Very long usernames/emails (database constraints)
- Special characters in username
- Password reset functionality
- Concurrent updates from multiple SuperAdmins

## Integration with Frontend

**Next Steps**:
1. Add `updateEvaluatorInternal(userId, data)` function to `src/utils/api.js`
2. Create EditEvaluatorForm component (similar to CreateEvaluatorForm)
3. Add "Edit" button in EvaluatorsList table rows
4. Handle success/error states in UI
5. Refresh evaluators list after successful update

**Frontend API Function Template**:
```javascript
export const updateEvaluatorInternal = async (userId, evaluatorData) => {
  const response = await api.put(`/SuperAdmin/updateEvaluator/${userId}`, evaluatorData);
  return response.data;
};
```

## Related Files
- `VisionManagement/Controllers/SuperAdminController.cs` - Controller implementation
- `VisionManagement/Models/User.cs` - User model with Designation and Company fields
- `SUPERADMIN_CREATE_EVALUATOR.md` - Related create evaluator documentation

## Status
✅ **Backend Implementation Complete**
- Endpoint added and tested
- No compilation errors
- DTO class created
- Security and validation implemented

⏳ **Frontend Implementation Pending**
- API function needs to be added
- Edit form component needs to be created
- UI integration in EvaluatorsList pending

## Date
January 2025
