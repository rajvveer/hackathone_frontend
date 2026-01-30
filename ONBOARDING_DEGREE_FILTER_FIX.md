# Onboarding Degree Filter Fix

## Problem
In the onboarding flow, when users selected their current education level, the "intended degree" options showed all degrees including ones they've already completed or are currently pursuing.

**Examples of the issue:**
- User selects "Bachelor's Degree" (completed) → Still shows Bachelor's as an option to pursue
- User selects "Master's Degree" (completed) → Shows Bachelor's and Master's as options
- User in high school → Shows all degrees (correct, but inconsistent logic)

## Solution
Implemented intelligent degree filtering based on current education level:

### 1. Education Level Hierarchy
Created a mapping system to track education progression:
```javascript
const EDUCATION_LEVEL_MAP = {
    'High School': 0,           // Can pursue: Bachelor's, Master's, MBA, PhD
    "Bachelor's Degree": 1,     // Can pursue: Master's, MBA, PhD
    "Master's Degree": 2,       // Can pursue: PhD only
    'Working Professional': 1,  // Can pursue: Master's, MBA, PhD
};
```

### 2. Degree Requirements
Added minimum level requirements to each degree:
```javascript
const ALL_DEGREE_OPTIONS = [
    { value: 'bachelors', minLevel: 0 },  // Requires High School
    { value: 'masters', minLevel: 1 },    // Requires Bachelor's
    { value: 'mba', minLevel: 1 },        // Requires Bachelor's
    { value: 'phd', minLevel: 2 },        // Requires Master's
];
```

### 3. Dynamic Filtering
The `EducationStep` component now:
- Filters degree options based on current education level
- Only shows degrees that are higher than the user's current level
- Resets the intended degree selection when education level changes
- Shows appropriate message if no higher degrees are available

## User Experience Improvements

### High School Student
✅ Can see: Bachelor's, Master's, MBA, PhD
- All options available for fresh start

### Bachelor's Degree Holder
✅ Can see: Master's, MBA, PhD
❌ Cannot see: Bachelor's (already completed)

### Master's Degree Holder
✅ Can see: PhD
❌ Cannot see: Bachelor's, Master's, MBA (already at or above this level)

### Working Professional
✅ Can see: Master's, MBA, PhD
❌ Cannot see: Bachelor's (assumed completed to be working)

## Technical Implementation

### Key Changes
1. **Renamed constant**: `DEGREE_OPTIONS` → `ALL_DEGREE_OPTIONS`
2. **Added filtering function**: `getAvailableDegrees()`
3. **Reset logic**: Clears intended degree when education level changes
4. **Conditional rendering**: Only shows available degrees

### Code Flow
```
User selects education level
    ↓
System maps to numeric level (0, 1, or 2)
    ↓
Filter degrees where minLevel >= currentLevel
    ↓
Display only eligible degrees
```

## Files Modified
- `client/src/pages/Onboarding.jsx`
  - Added `EDUCATION_LEVEL_MAP` constant
  - Renamed and enhanced `ALL_DEGREE_OPTIONS`
  - Updated `EducationStep` component with filtering logic

## Testing Scenarios
1. ✅ High school → Shows all 4 degrees
2. ✅ Bachelor's → Shows 3 degrees (no Bachelor's)
3. ✅ Master's → Shows 1 degree (PhD only)
4. ✅ Working Professional → Shows 3 degrees (no Bachelor's)
5. ✅ Changing education level resets intended degree selection
