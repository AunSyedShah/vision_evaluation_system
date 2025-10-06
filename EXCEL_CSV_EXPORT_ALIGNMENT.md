# Excel/CSV Export Alignment with Weighted Scoring

**Date**: October 6, 2025  
**File**: `src/pages/SuperAdmin/AllResults.jsx`  
**Purpose**: Align Excel/CSV export headers with weighted scoring terminology

---

## Changes Made

### 1. **All Results Export** (Individual Evaluations)
**Function**: `prepareAllResultsData()`

✅ **Already Updated** (Line 293):
```javascript
'Weighted Score': avgScore,  // Uses calculateWeightedScore(evaluation)
```

**Export Columns**:
- Project Name
- Founder Name
- Status
- Evaluator
- Problem Significance (raw score)
- Innovation Technical (raw score)
- Market Scalability (raw score)
- Traction Impact (raw score)
- Business Model (raw score)
- Team Execution (raw score)
- Ethics Equity (raw score)
- **Weighted Score** ← Uses weighted formula
- Rating (Excellent/Good/Fair/Needs Improvement)
- Comments
- Evaluated At

**Calculation**: Each row shows ONE evaluator's weighted score for a project.

---

### 2. **Project Summary Export** (Aggregated by Project)
**Function**: `prepareProjectSummaryData()`

✅ **Updated** (Line 326):
```javascript
// OLD: 'Average Score': avgScore,
// NEW:
'Weighted Score': avgScore,  // Uses getProjectAverageScore(evaluations)
```

**Export Columns**:
- Project Name
- Founder Name
- Status
- Assigned Evaluators (count)
- Submitted Evaluations (count)
- **Weighted Score** ← Average of all evaluators' weighted scores
- Rating
- Avg Problem Significance (average of raw scores)
- Avg Innovation Technical (average of raw scores)
- Avg Market Scalability (average of raw scores)
- Avg Traction Impact (average of raw scores)
- Avg Business Model (average of raw scores)
- Avg Team Execution (average of raw scores)
- Avg Ethics Equity (average of raw scores)

**Calculation**: One row per project. "Weighted Score" = average of all evaluators' weighted scores.

---

### 3. **Consensus Data Export** (Multi-Evaluator Projects)
**Function**: `prepareConsensusData()`

✅ **Updated** (Line 357):
```javascript
// OLD: 'Consensus Avg Score': avgScore,
// NEW:
'Consensus Weighted Score': avgScore,  // Uses getProjectAverageScore(evaluations)
```

**Export Columns**:
- Project Name
- Founder Name
- Status
- Number of Evaluators
- **Consensus Weighted Score** ← Average of weighted scores (requires 2+ evaluators)
- Rating
- Consensus Problem Significance (average of raw scores)
- Consensus Innovation Technical (average of raw scores)
- Consensus Market Scalability (average of raw scores)
- Consensus Traction Impact (average of raw scores)
- Consensus Business Model (average of raw scores)
- Consensus Team Execution (average of raw scores)
- Consensus Ethics Equity (average of raw scores)

**Calculation**: Only includes projects with 2+ evaluations. Shows consensus across evaluators.

---

## Weighted Score Calculation Logic

### Individual Evaluator Weighted Score
```javascript
const calculateWeightedScore = (evaluation) => {
  const weightedScore = (
    (problemScore * 0.20) +      // 20%
    (innovationScore * 0.20) +   // 20%
    (marketScore * 0.20) +       // 20%
    (tractionScore * 0.15) +     // 15%
    (businessScore * 0.10) +     // 10%
    (teamScore * 0.10) +         // 10%
    (ethicsScore * 0.05)         // 5%
  );
  return (weightedScore / 10) * 100; // Convert to percentage
};
```

### Multi-Evaluator Average
```javascript
const getProjectAverageScore = (evaluations) => {
  if (evaluations.length === 0) return 0;
  const sum = evaluations.reduce((total, e) => total + calculateWeightedScore(e), 0);
  return sum / evaluations.length;  // Average of weighted scores
};
```

---

## Export Examples

### Example 1: All Results Export (3 Evaluators on Same Project)

| Project Name | Evaluator | Problem | Innovation | Market | Traction | Business | Team | Ethics | **Weighted Score** | Rating |
|--------------|-----------|---------|------------|--------|----------|----------|------|---------|--------------------|--------|
| SmartAI | John Doe | 10 | 10 | 10 | 5 | 5 | 3 | 3 | **77.0** | Good |
| SmartAI | Jane Smith | 9 | 9 | 9 | 6 | 6 | 4 | 4 | **73.0** | Good |
| SmartAI | Bob Wilson | 10 | 9 | 10 | 7 | 6 | 5 | 4 | **80.0** | Excellent |

### Example 2: Project Summary Export (Aggregated)

| Project Name | Assigned Evaluators | Submitted | **Weighted Score** | Avg Problem | Avg Innovation | ... | Rating |
|--------------|---------------------|-----------|--------------------| ------------|----------------|-----|--------|
| SmartAI | 3 | 3 | **76.7** | 9.7 | 9.3 | ... | Good |
| EcoTech | 3 | 2 | **68.5** | 8.5 | 8.0 | ... | Fair |

**Note**: "Weighted Score" = (77.0 + 73.0 + 80.0) / 3 = 76.7

### Example 3: Consensus Export (Multi-Evaluator Only)

| Project Name | Number of Evaluators | **Consensus Weighted Score** | Consensus Problem | ... | Rating |
|--------------|----------------------|------------------------------|-------------------|-----|--------|
| SmartAI | 3 | **76.7** | 9.7 | ... | Good |

**Note**: Only shows projects with 2+ evaluators. Same calculation as Project Summary.

---

## Export Buttons Available

1. **Export All Results** (Excel/CSV)
   - Individual evaluation records
   - One row per evaluator per project
   - Shows each evaluator's weighted score

2. **Export Project Summary** (Excel/CSV)
   - One row per project
   - Shows aggregated weighted scores
   - Includes projects with 0+ evaluations

3. **Export Consensus Data** (Excel/CSV)
   - One row per project
   - Only projects with 2+ evaluations
   - Shows multi-evaluator consensus scores

---

## Verification Checklist

✅ **Export Headers Updated**:
- "Average Score" → "Weighted Score" (Project Summary)
- "Consensus Avg Score" → "Consensus Weighted Score" (Consensus)
- "Weighted Score" already correct (All Results)

✅ **Calculation Functions**:
- `calculateWeightedScore()` uses weighted formula
- `getProjectAverageScore()` averages weighted scores correctly
- All export functions use these calculation functions

✅ **Multi-Evaluator Logic**:
- Each evaluator's score calculated with weights first
- Then averaged across evaluators
- Consensus export filters for 2+ evaluations

✅ **Display Alignment**:
- UI shows "Weighted Score" labels
- Exports show "Weighted Score" headers
- Backend returns `OverallWeightedScore`
- All terminology consistent

---

## Technical Details

**Libraries Used**:
- `xlsx` (SheetJS) for Excel/CSV generation
- `file-saver` for browser download

**File Format Support**:
- `.xlsx` (Excel 2007+)
- `.csv` (UTF-8 encoded)

**Export File Naming**:
- `all_results_YYYY-MM-DD.xlsx`
- `project_summary_YYYY-MM-DD.csv`
- `consensus_data_YYYY-MM-DD.xlsx`

---

## Summary

✅ All Excel/CSV exports now use **"Weighted Score"** terminology  
✅ Calculations use the official weighted formula (20%, 20%, 20%, 15%, 10%, 10%, 5%)  
✅ Multi-evaluator averaging works correctly (weighted score per evaluator → average)  
✅ Export headers aligned with UI labels and backend API  
✅ No breaking changes - export functions and buttons work as before  

**Result**: Excel/CSV exports are fully aligned with the weighted scoring system implementation! 🎯
