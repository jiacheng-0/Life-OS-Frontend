# Deduplication Fix for Goals & Constraints

## Problem
The application was adding duplicate goals and constraints because:
1. No deduplication logic existed when extracting goals from chat messages
2. Frontend state was being updated without checking for existing values
3. Database had no constraints preventing duplicate entries in JSONB arrays

## Solution Implemented

### 1. Backend Deduplication (`/app/api/chat/route.ts`)
- Added case-insensitive deduplication logic before saving to database
- New goals/constraints are compared against existing ones (normalized)
- Only unique items are appended to the database
- Database updates are skipped if no new items are found

### 2. Frontend Deduplication (`/app/page.tsx`)
- Added the same deduplication logic in the React state management
- Prevents duplicate display even if they somehow make it through the backend
- Uses case-insensitive comparison with trimmed strings

### 3. Cleanup Endpoint (`/app/api/memory/cleanup/route.ts`)
- New API endpoint to clean up existing duplicates in the database
- Safely deduplicates goals, constraints, and routines
- Returns statistics on how many duplicates were removed

## How to Clean Up Existing Duplicates

### Option 1: Browser Console (Easiest)
1. Start your development server: `npm run dev`
2. Login to your app
3. Open browser console (F12 or Cmd+Option+I)
4. Run this command:
```javascript
fetch('/api/memory/cleanup', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

### Option 2: Using cURL
```bash
# Make sure you're logged in first in your browser to get the session cookie
curl -X POST http://localhost:3000/api/memory/cleanup \
  -H "Cookie: your-session-cookie-here"
```

### Option 3: Add a UI Button (Optional)
You can add a cleanup button to your UI by adding this to any component:

```tsx
const handleCleanup = async () => {
  const response = await fetch('/api/memory/cleanup', { method: 'POST' })
  const data = await response.json()
  console.log('Cleaned up:', data)
  // Refresh the profile
  loadUserProfile()
}

<Button onClick={handleCleanup}>Clean Up Duplicates</Button>
```

## Testing the Fix

1. **Test New Entries**: Try adding the same goal multiple times through chat
   - Say: "I want to exercise more"
   - Wait for response
   - Say again: "I want to exercise more"
   - You should NOT see duplicates

2. **Verify Database**: Check your Supabase dashboard
   - Go to Table Editor → user_profiles
   - Check the goals and constraints JSONB columns
   - Should not have duplicate values

3. **Test Case Insensitivity**: Try variations
   - "Sleep earlier"
   - "sleep earlier"
   - "SLEEP EARLIER"
   - All should be treated as the same goal

## Code Changes Summary

### Backend Changes
- **File**: `/app/api/chat/route.ts`
- **Lines**: 76-102
- **Change**: Added deduplication before database updates

### Frontend Changes
- **File**: `/app/page.tsx`
- **Lines**: 124-143
- **Change**: Added deduplication in state updates

### New Files
- **File**: `/app/api/memory/cleanup/route.ts`
- **Purpose**: API endpoint to clean up existing duplicates
- **File**: `/scripts/cleanup-duplicates.js`
- **Purpose**: Helper script for running cleanup

## Future Improvements

1. **Database Constraints**: Consider adding a PostgreSQL function to enforce uniqueness at the database level
2. **Fuzzy Matching**: Could implement similarity matching (e.g., "exercise more" vs "work out more")
3. **UI for Management**: Add UI buttons to manually remove specific goals
4. **Merge Similar Goals**: AI-powered goal consolidation

## Questions?

If you encounter any issues:
1. Check the browser console for errors
2. Check your server logs
3. Verify your Supabase connection
4. Make sure you're logged in before calling cleanup endpoint

