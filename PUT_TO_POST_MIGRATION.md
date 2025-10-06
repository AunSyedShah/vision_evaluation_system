# Frontend PUT to POST Request Migration

**Date**: October 6, 2025  
**File Modified**: `src/utils/api.js`  
**Reason**: Firewall restrictions on backend deployment server blocking PUT requests

---

## Issue Description

The backend deployment server has firewall restrictions that block HTTP PUT requests. The DevOps team has requested that all PUT requests be changed to POST requests on the frontend while maintaining the same functionality.

---

## Changes Made

All 4 PUT requests in the frontend have been changed to POST requests:

### 1. **Update Project** (Line ~250)
**Function**: `updateProject(id, formData)`

**Before**:
```javascript
const response = await api.put(`/Projects/${id}`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

**After**:
```javascript
const response = await api.post(`/Projects/${id}`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

**Endpoint**: `POST /Projects/{id}`  
**Purpose**: Update existing project details including file uploads  
**Used By**: Admin/SuperAdmin project editing

---

### 2. **Update Evaluator** (Line ~323)
**Function**: `updateEvaluator(userId, evaluatorData)`

**Before**:
```javascript
const response = await api.put(`/SuperAdmin/updateEvaluator/${userId}`, requestData);
```

**After**:
```javascript
const response = await api.post(`/SuperAdmin/updateEvaluator/${userId}`, requestData);
```

**Endpoint**: `POST /SuperAdmin/updateEvaluator/{userId}`  
**Purpose**: Update evaluator profile (username, email, designation, company, password)  
**Used By**: SuperAdmin evaluator management

---

### 3. **Update Project Assignment** (Line ~343)
**Function**: `updateProjectAssignment(assignmentData)`

**Before**:
```javascript
const response = await api.put('/SuperAdmin/updateAssignment', assignmentData);
```

**After**:
```javascript
const response = await api.post('/SuperAdmin/updateAssignment', assignmentData);
```

**Endpoint**: `POST /SuperAdmin/updateAssignment`  
**Purpose**: Replace existing evaluator assignments for a project  
**Used By**: SuperAdmin assignment management  
**Payload**: `{ projectId: number, userIds: [1, 2, 3] }`

---

### 4. **Update Evaluation** (Line ~470)
**Function**: `updateEvaluation(projectId, evaluationData)`

**Before**:
```javascript
const response = await api.put(`/Evaluations/${projectId}`, backendData);
```

**After**:
```javascript
const response = await api.post(`/Evaluations/${projectId}`, backendData);
```

**Endpoint**: `POST /Evaluations/{projectId}`  
**Purpose**: Update existing evaluation scores and comments  
**Used By**: Evaluators editing their evaluations  
**Payload**: All 7 criterion scores + strengths/weaknesses/recommendation

---

## Verification

✅ **Frontend Changes Complete**:
- [x] All 4 PUT requests changed to POST
- [x] No remaining PUT requests in codebase
- [x] No compilation errors
- [x] Same endpoints maintained
- [x] Same request payloads
- [x] Same headers
- [x] Same functionality

---

## Backend Requirements

⚠️ **Backend Changes Required**: The backend API must be updated to accept POST requests on the same endpoints that previously accepted PUT requests.

### Backend Endpoints to Update

1. **ProjectsController.cs**:
   ```csharp
   // OLD: [HttpPut("{id}")]
   // NEW: [HttpPost("{id}")]
   public async Task<IActionResult> UpdateProject(int id, [FromForm] ProjectUpdateDto projectDto)
   ```

2. **SuperAdminController.cs**:
   ```csharp
   // OLD: [HttpPut("updateEvaluator/{userId}")]
   // NEW: [HttpPost("updateEvaluator/{userId}")]
   public async Task<IActionResult> UpdateEvaluator(int userId, [FromBody] UpdateEvaluatorDto dto)
   
   // OLD: [HttpPut("updateAssignment")]
   // NEW: [HttpPost("updateAssignment")]
   public async Task<IActionResult> UpdateProjectAssignment([FromBody] UpdateAssignmentDto dto)
   ```

3. **EvaluationsController.cs**:
   ```csharp
   // OLD: [HttpPut("{projectId}")]
   // NEW: [HttpPost("{projectId}")]
   public async Task<IActionResult> UpdateEvaluation(int projectId, [FromBody] UpdateEvaluationDto dto)
   ```

---

## Testing Checklist

### Frontend Testing
- [ ] Admin can update project details
- [ ] Admin can upload new project files (pitch deck, business plan)
- [ ] SuperAdmin can update evaluator profiles
- [ ] SuperAdmin can change evaluator passwords
- [ ] SuperAdmin can update project assignments
- [ ] SuperAdmin can add/remove evaluators from projects
- [ ] Evaluators can edit their existing evaluations
- [ ] All scores update correctly
- [ ] All comments save correctly

### Backend Testing
- [ ] POST endpoints accept requests (not 405 Method Not Allowed)
- [ ] Authentication still works
- [ ] Authorization still works (role checks)
- [ ] Data validation still works
- [ ] Database updates complete successfully
- [ ] File uploads work correctly
- [ ] Response format unchanged
- [ ] Error handling unchanged

### Integration Testing
- [ ] No CORS errors
- [ ] No firewall blocks
- [ ] Successful responses from server
- [ ] Data persists in database
- [ ] UI updates correctly after save
- [ ] Toast notifications show success
- [ ] No console errors

---

## Impact Analysis

### ✅ No Breaking Changes on Frontend
- Same function signatures
- Same parameters
- Same return values
- Same error handling
- Components don't need updates

### ⚠️ Backend Must Be Updated
- Backend API must accept POST on these endpoints
- Both PUT and POST could be supported temporarily for backwards compatibility
- Once frontend is deployed, PUT endpoints can be removed

---

## Deployment Strategy

### Option 1: Simultaneous Deployment (Recommended)
1. Update backend to accept POST requests
2. Deploy backend first
3. Deploy frontend immediately after
4. Test all update functionality
5. Remove PUT endpoints from backend

### Option 2: Backwards Compatible Deployment
1. Update backend to accept BOTH PUT and POST
2. Deploy backend
3. Test with old frontend (PUT still works)
4. Deploy new frontend (uses POST)
5. Test with new frontend
6. After confirmed working, remove PUT endpoints from backend

### Option 3: Feature Flag
1. Add feature flag for PUT vs POST
2. Deploy backend with both methods enabled
3. Deploy frontend with POST
4. Monitor for issues
5. Remove PUT endpoints when stable

---

## Rollback Plan

If issues occur after deployment:

1. **Frontend Only Issue**:
   - Revert frontend deployment
   - Backend continues to work with PUT requests

2. **Backend Issue**:
   - Revert backend to accept PUT requests
   - Revert frontend to use PUT requests

3. **Database Issue**:
   - No database schema changes required
   - Rollback not needed at DB level

---

## HTTP Method Semantics

### PUT vs POST for Updates

**HTTP Standards**:
- **PUT**: Should be idempotent (same request multiple times = same result)
- **POST**: Not required to be idempotent (may create duplicates)

**Our Implementation**:
- Our update operations ARE idempotent (updating same data multiple times = same result)
- Using POST instead of PUT doesn't change our business logic
- No risk of duplicate records (we update by ID)

**Conclusion**: ✅ Safe to use POST for updates in this case

---

## Alternative Solutions (Not Chosen)

### 1. Use PATCH Instead of PUT
- More semantically correct for partial updates
- May also be blocked by firewall

### 2. Use Query Parameters Instead of Body
- Could use GET with query params
- Not RESTful for updates
- Security concerns (credentials in URL)

### 3. Configure Firewall to Allow PUT
- Requires DevOps coordination
- May take time to get approval
- Our chosen solution is faster

### 4. Use Different Port
- May not bypass firewall rules
- Requires infrastructure changes

---

## Related Files

**Frontend**:
- `src/utils/api.js` (updated)
- No other frontend files need changes

**Backend** (requires updates):
- `VisionManagement/Controllers/ProjectsController.cs`
- `VisionManagement/Controllers/SuperAdminController.cs`
- `VisionManagement/Controllers/EvaluationsController.cs`

**Documentation**:
- `FRONTEND_BACKEND_ALIGNMENT.md` (may need update)
- `swagger.json` (may need update)
- `swagger_api.json` (may need update)

---

## Summary

✅ **Frontend Updated**: All PUT → POST conversions complete  
⚠️ **Backend Required**: Must update controllers to accept POST  
📝 **Documentation**: This file created for reference  
🧪 **Testing**: Follow checklist above  
🚀 **Deployment**: Use simultaneous or backwards compatible approach  

**No functionality changes** - only HTTP method changed to bypass firewall restrictions.

---

**Updated by**: GitHub Copilot  
**Date**: October 6, 2025  
**Version**: 1.0
