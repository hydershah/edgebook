# Game Filtering Update

## Changes Made

Updated [components/GameSelector.tsx](components/GameSelector.tsx) to filter games based on pickability criteria.

## Filtering Rules

### ✅ Games That CAN Be Picked:
- Status: `scheduled` (not started yet)
- Time: Scheduled time is in the future
- This includes games starting in 1 hour, 30 minutes, or even 5 minutes - as long as they haven't started

### ❌ Games That CANNOT Be Picked:
1. **Ongoing Games**
   - Status: `inprogress`, `halftime`
   - These games have already started

2. **Completed Games**
   - Status: `complete`, `closed`
   - These games are finished

3. **Past Games**
   - Scheduled time has passed
   - Even if status shows "scheduled", if the time is in the past, it's filtered out

## Implementation Details

### New Function: `isGamePickable()`
```typescript
function isGamePickable(game: Game): boolean {
  const status = game.status.toLowerCase();

  // Exclude ongoing and completed games
  if (status === 'inprogress' || status === 'complete' || status === 'closed' || status === 'halftime') {
    return false;
  }

  // Exclude past games (scheduled time has passed)
  const scheduledTime = new Date(game.scheduled);
  const now = new Date();
  if (scheduledTime < now) {
    return false;
  }

  return true;
}
```

### Updated Filtering Logic
Games are now filtered in two stages:
1. **First**: Filter out non-pickable games (ongoing, completed, past)
2. **Second**: Apply user's search query (if any)

This ensures users only see games they can actually make picks for.

## User Experience Updates

### 1. Games Count Display
Shows both pickable games and filtered games:
```
3 pickable games available (2 games in progress or completed)
```

### 2. Empty State Messages
- If no games from API: "No upcoming games found for {sport}"
- If all games filtered: "All games have started or are completed"
- If search returns nothing: "No games found for '{query}'"

### 3. Visual Clarity
Only pickable games appear in the list - no confusion about which games can be selected.

## Example Scenarios

### Scenario 1: Game Starting in 30 Minutes
- Current time: 7:00 PM
- Game scheduled: 7:30 PM
- Status: `scheduled`
- **Result**: ✅ Can be picked

### Scenario 2: Game Currently in Progress
- Current time: 8:15 PM
- Game scheduled: 8:00 PM
- Status: `inprogress`
- **Result**: ❌ Cannot be picked (filtered out)

### Scenario 3: Game Just Ended
- Current time: 10:45 PM
- Game scheduled: 8:00 PM
- Status: `complete`
- **Result**: ❌ Cannot be picked (filtered out)

### Scenario 4: Game Yesterday
- Current time: Today 2:00 PM
- Game scheduled: Yesterday 8:00 PM
- Status: `complete`
- **Result**: ❌ Cannot be picked (filtered out)

## Testing

To test the filtering:

1. **Test with NBA games** (working API):
   ```bash
   # Visit http://localhost:3001/createpick
   # Select NBA
   # Should only see scheduled games that haven't started
   ```

2. **Check game statuses**:
   - Scheduled games should appear
   - Live games should NOT appear
   - Completed games should NOT appear

3. **Check time filtering**:
   - Games in the past should NOT appear
   - Games starting soon should appear

## Files Modified

- [components/GameSelector.tsx](components/GameSelector.tsx) - Added `isGamePickable()` function and updated filtering logic

---

**Status**: ✅ Complete

All three requirements implemented:
1. ✅ No past matches populated
2. ✅ Matches starting in 1 hour can be picked
3. ✅ Ongoing matches cannot be picked
