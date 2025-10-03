# 🐛 Bug Fix: Project ID Undefined Issue

## Issue
When navigating to evaluator project details, the URL showed:
```
http://localhost:5173/evaluator/projects/undefined
```

## Root Cause
The backend `Project` model uses `Id` as the primary key field, but the frontend was looking for `ProjectId` or `projectId`.

```csharp
// Backend Model (Project.cs)
public class Project
{
    public int Id { get; set; }  // ← Primary key is 'Id', not 'ProjectId'
    public string? StartupName { get; set; }
    // ... other fields
}
```

## Solution
Updated `ProjectList.jsx` to check for `Id` first:

```javascript
// BEFORE (incorrect)
const projectId = project.ProjectId || project.projectId;

// AFTER (correct)
const projectId = project.Id || project.id || project.ProjectId || project.projectId;
```

## Files Fixed
1. ✅ `src/pages/Evaluator/ProjectList.jsx`
   - Updated projectId extraction to check `Id` first
   - Added debug logging to identify missing IDs
   
2. ✅ `src/pages/Evaluator/MyEvaluations.jsx`
   - Updated to get StartupName from nested `Project` object
   - Backend returns evaluations with `.Include(e => e.Project)`

## Backend Field Name Reference

### Project Model
| Backend Field | Frontend Fallback |
|--------------|-------------------|
| `Id` | `id`, `ProjectId`, `projectId` |
| `StartupName` | `startupName` |
| `StartupDescription` | `startupDescription` |

### Evaluation Model
| Backend Field | Frontend Fallback |
|--------------|-------------------|
| `EvaluationId` | `evaluationId` |
| `ProjectId` | `projectId` |
| `Project` (navigation) | `project` |

## Debug Logging Added
Added console logs to identify data structure issues:
```javascript
console.log('📊 Raw API Response:', data);
console.log('📋 Projects Array:', projectsArray);
console.log('🔍 First Project Structure:', projectsArray[0]);

if (!projectId) {
  console.error('⚠️ Project missing ID:', project);
}
```

## Testing
To verify the fix:
1. Login as evaluator
2. Navigate to `/evaluator/projects`
3. Check console for debug logs showing project structure
4. Click on a project card
5. URL should now be `/evaluator/projects/1` (or actual ID)
6. Project detail page should load correctly

## Prevention
Always check backend model field names before assuming:
- Check the C# model definition
- Log API responses during development
- Use flexible fallback patterns: `field.Id || field.id || field.ProjectId`

## Status
✅ **FIXED** - Project IDs now correctly extracted from backend response

---

## Additional Fix: Project Detail Access

### Issue #2
After fixing the ID issue, navigating to `/evaluator/projects/3` showed:
```
Project not found
Back to Projects
```

### Root Cause
The `getProjectById(id)` API call uses `/Projects/{id}` endpoint which requires `FSO,SuperAdmin` roles:
```csharp
[HttpGet("{id}")]
[Authorize(Roles = "FSO,SuperAdmin")]  // ← Evaluators can't access this!
public async Task<IActionResult> GetProject(int id)
```

Evaluators (User role) don't have permission to access this endpoint.

### Solution
Changed `ProjectDetail.jsx` to use `getAssignedProjects()` instead:
```javascript
// BEFORE (incorrect - 403 Forbidden for evaluators)
const projectData = await getProjectById(id);

// AFTER (correct - uses assigned projects list)
const assignedData = await getAssignedProjects();
const assignedArray = assignedData.$values || assignedData;
const projectData = assignedArray.find(
  p => (p.Id || p.id || p.ProjectId || p.projectId) === parseInt(id)
);
```

### Benefits
- ✅ No 403 Forbidden errors
- ✅ Automatically enforces access control (only assigned projects)
- ✅ Single API call for evaluators
- ✅ Better security (evaluators can't access unassigned projects)

### Updated Error Message
```jsx
<div className="text-center py-12 bg-white rounded-xl shadow-md p-12">
  <div className="text-6xl mb-4">🔒</div>
  <h2>Project Not Accessible</h2>
  <p>This project is not assigned to you or does not exist.</p>
  <Link to="/evaluator/projects">← Back to My Projects</Link>
</div>
```

## Status
✅ **FULLY FIXED** - Evaluators can now access assigned project details correctly
