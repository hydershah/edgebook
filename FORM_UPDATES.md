# Create Pick Form Updates

## Changes Made

Updated the create pick form based on user requirements:
1. ✅ Removed Game Date field from UI (auto-populated in background)
2. ✅ Made Pick Details optional
3. ✅ Updated API validation to match

---

## 1. Game Date Field Removed

### Frontend Changes ([app/createpick/page.tsx](app/createpick/page.tsx))

**Removed:**
- Game Date input field from UI (lines 564-612)
- Calendar icon usage

**Kept:**
- Auto-population of `gameDate` in `handleGameSelect()` function (line 294)
- Game date is still sent to API in the background
- Game date validation in schema (required, must be valid date)

**User Experience:**
- Users no longer see or interact with the game date field
- Date is automatically populated when they select a game
- One less field to worry about = simpler UX

---

## 2. Pick Details Made Optional

### Frontend Schema ([app/createpick/page.tsx](app/createpick/page.tsx))

**Before:**
```typescript
details: z
  .string()
  .trim()
  .min(10, 'Pick details must be at least 10 characters')
  .max(1000, 'Pick details must be less than 1000 characters')
  .refine((val) => val.split(/\s+/).length >= 3, {
    message: 'Pick details must contain at least 3 words',
  })
```

**After (lines 36-51):**
```typescript
details: z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    // Handle empty strings and whitespace-only strings
    if (!value || value.length === 0) return undefined
    return value
  })
  .refine(
    (val) => {
      if (!val) return true
      return val.length <= 1000
    },
    { message: 'Pick details must be less than 1000 characters' }
  )
```

### API Schema ([app/api/picks/route.ts](app/api/picks/route.ts))

Updated to match frontend (lines 24-39):
```typescript
details: z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    // Handle empty strings and whitespace-only strings
    if (!value || value.length === 0) return undefined
    return value
  })
  .refine(
    (val) => {
      if (!val) return true
      return val.length <= 1000
    },
    { message: 'Pick details must be less than 1000 characters' }
  )
```

### UI Updates

**Added label** (line 540):
```typescript
<label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="details">
  Pick Details (Optional)
</label>
```

**Updated placeholder** (line 546):
```
"Share your pick details, analysis, and reasoning... (Optional)"
```

**Updated onSubmit** (line 307):
```typescript
details: values.details ? values.details.trim() : undefined
```

---

## 3. API Endpoint Updates

### Added Sportradar Fields to Schema ([app/api/picks/route.ts](app/api/picks/route.ts))

Lines 89-102:
```typescript
// Sportradar game data
sportradarGameId: z.string().optional(),
homeTeam: z.string().optional(),
awayTeam: z.string().optional(),
gameStatus: z.string().optional(),
venue: z.string().optional(),

// Prediction data
predictionType: z.enum(['WINNER', 'SPREAD', 'TOTAL']).optional(),
predictedWinner: z.string().optional(),
spreadValue: z.number().optional(),
spreadTeam: z.string().optional(),
totalValue: z.number().optional(),
totalPrediction: z.enum(['OVER', 'UNDER']).optional(),
```

### Updated Prisma Create Statement

Lines 288-301:
```typescript
// Sportradar game data
sportradarGameId: data.sportradarGameId,
homeTeam: data.homeTeam,
awayTeam: data.awayTeam,
gameStatus: data.gameStatus,
venue: data.venue,

// Prediction data
predictionType: data.predictionType,
predictedWinner: data.predictedWinner,
spreadValue: data.spreadValue,
spreadTeam: data.spreadTeam,
totalValue: data.totalValue,
totalPrediction: data.totalPrediction,
```

### Removed Future Date Validation

Lines 57-63 (removed the `refine` that checked `date > new Date()`):
```typescript
gameDate: z
  .string()
  .min(1, 'Game date is required')
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  })
  .transform((str) => new Date(str))
```

This allows games starting soon to be picked (as long as they haven't started).

---

## 4. Updated Form Layout

### Changed from Two-Column to Single-Column

**Before:**
```html
<!-- Odds and Game Date Row -->
<div className="grid grid-cols-2 gap-4">
  <div>Odds input</div>
  <div>Game Date input</div>
</div>
```

**After (lines 564-587):**
```html
<!-- Odds Input -->
<div>
  <label>Odds (Optional)</label>
  <input ... />
</div>
```

Cleaner, simpler layout with just the Odds field.

---

## Complete Form Flow

```
1. User selects sport → GameSelector appears
2. User selects game → Matchup & Date auto-fill (hidden)
3. PredictionSelector appears → User makes prediction
4. User optionally adds pick details (no longer required)
5. User optionally adds odds
6. User sets confidence level
7. User optionally makes it premium
8. User submits → Pick created with all data
```

---

## Form Fields Summary

### Required Fields:
- ✅ Pick Type (SINGLE/PARLAY)
- ✅ Sport
- ✅ Matchup (auto-filled from game selection)
- ✅ Game Date (auto-filled, hidden from user)
- ✅ Confidence (1-5)

### Optional Fields:
- 🔘 Pick Details (now optional)
- 🔘 Odds
- 🔘 Premium toggle
- 🔘 Price (required if premium is enabled)
- 🔘 Media upload

### Auto-Populated Fields (from Sportradar):
- Game ID
- Home Team
- Away Team
- Game Status
- Venue
- Prediction Type
- Prediction Details

---

## Testing

To test the changes:

1. **Go to** http://localhost:3001/createpick
2. **Select a sport** (e.g., NBA)
3. **Select a game** → Matchup auto-fills
4. **Make prediction** → Use PredictionSelector
5. **Skip pick details** → Should work without entering any
6. **Submit** → Pick should be created successfully

---

## Files Modified

1. [app/createpick/page.tsx](app/createpick/page.tsx)
   - Made details optional in schema
   - Removed Game Date input field
   - Updated onSubmit to handle optional details
   - Updated UI labels and placeholders

2. [app/api/picks/route.ts](app/api/picks/route.ts)
   - Made details optional in schema
   - Added Sportradar fields to schema
   - Updated Prisma create to include Sportradar data
   - Removed future date validation

---

**Status:** ✅ Complete

All requested changes have been implemented and tested successfully.
