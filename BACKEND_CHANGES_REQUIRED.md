# Quick Reference: Backend Changes Required

## ⚠️ URGENT: Backend Must Be Updated Before Deployment

Frontend has changed from PUT to POST requests. Backend controllers must be updated.

---

## Changes Required in Backend Controllers

### 1. ProjectsController.cs
```csharp
// CHANGE THIS:
[HttpPut("{id}")]
public async Task<IActionResult> UpdateProject(int id, [FromForm] ProjectUpdateDto projectDto)

// TO THIS:
[HttpPost("{id}")]
public async Task<IActionResult> UpdateProject(int id, [FromForm] ProjectUpdateDto projectDto)
```

---

### 2. SuperAdminController.cs (2 changes)

**Change 1 - Update Evaluator:**
```csharp
// CHANGE THIS:
[HttpPut("updateEvaluator/{userId}")]
public async Task<IActionResult> UpdateEvaluator(int userId, [FromBody] UpdateEvaluatorDto dto)

// TO THIS:
[HttpPost("updateEvaluator/{userId}")]
public async Task<IActionResult> UpdateEvaluator(int userId, [FromBody] UpdateEvaluatorDto dto)
```

**Change 2 - Update Assignment:**
```csharp
// CHANGE THIS:
[HttpPut("updateAssignment")]
public async Task<IActionResult> UpdateProjectAssignment([FromBody] UpdateAssignmentDto dto)

// TO THIS:
[HttpPost("updateAssignment")]
public async Task<IActionResult> UpdateProjectAssignment([FromBody] UpdateAssignmentDto dto)
```

---

### 3. EvaluationsController.cs
```csharp
// CHANGE THIS:
[HttpPut("{projectId}")]
public async Task<IActionResult> UpdateEvaluation(int projectId, [FromBody] UpdateEvaluationDto dto)

// TO THIS:
[HttpPost("{projectId}")]
public async Task<IActionResult> UpdateEvaluation(int projectId, [FromBody] UpdateEvaluationDto dto)
```

---

## Summary
- **4 attributes** need to be changed
- **3 controller files** need to be updated
- Only change `[HttpPut(...)]` to `[HttpPost(...)]`
- **No other code changes** required
- **No database changes** required

---

## Testing After Backend Update
1. ✅ Update project details works
2. ✅ Update evaluator profile works
3. ✅ Update project assignments works
4. ✅ Edit evaluation works
5. ✅ No firewall blocks POST requests

---

**See `PUT_TO_POST_MIGRATION.md` for full details**
