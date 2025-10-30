# Integration Steps - Adding Game Selector & Prediction Types

## Step 1: Import the New Components

Add these imports to the top of `/app/createpick/page.tsx`:

```typescript
import GameSelector from '@/components/GameSelector'
import PredictionSelector from '@/components/PredictionSelector'
```

## Step 2: Add State for Game and Prediction Selection

Add these state variables after your existing useState declarations (around line 151):

```typescript
// Game selection state
const [selectedGame, setSelectedGame] = useState<{
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  scheduled: string;
  status: string;
  venue?: string;
} | null>(null);

// Prediction data state
const [predictionData, setPredictionData] = useState<{
  predictionType: 'WINNER' | 'SPREAD' | 'TOTAL';
  predictedWinner?: string;
  spreadValue?: number;
  spreadTeam?: string;
  totalValue?: number;
  totalPrediction?: 'OVER' | 'UNDER';
} | null>(null);
```

## Step 3: Add Game Selection Handler

Add this function to handle when user selects a game (around line 257):

```typescript
function handleGameSelect(game: any) {
  setSelectedGame(game);

  // Auto-populate matchup field
  const matchup = `${game.awayTeam} @ ${game.homeTeam}`;
  setValue('matchup', matchup);

  // Auto-populate game date
  const gameDate = new Date(game.scheduled).toISOString().split('T')[0];
  setValue('gameDate', gameDate);
}
```

## Step 4: Update the onSubmit Function

Modify your `onSubmit` function to include the Sportradar data (around line 258-318).

Replace the payload creation with:

```typescript
const payload = {
  pickType: values.pickType,
  sport: values.sport,
  matchup: values.matchup.trim(),
  details: values.details.trim(),
  odds: values.odds || undefined,
  gameDate: values.gameDate,
  confidence: values.confidence,
  isPremium: values.isPremium,
  price: values.isPremium && values.price ? Number.parseFloat(values.price) : undefined,
  mediaUrl: uploadedFileUrl || undefined,

  // Sportradar game data
  sportradarGameId: selectedGame?.id || undefined,
  homeTeam: selectedGame?.homeTeam || undefined,
  awayTeam: selectedGame?.awayTeam || undefined,
  gameStatus: selectedGame?.status || undefined,
  venue: selectedGame?.venue || undefined,

  // Prediction data
  predictionType: predictionData?.predictionType || undefined,
  predictedWinner: predictionData?.predictedWinner || undefined,
  spreadValue: predictionData?.spreadValue || undefined,
  spreadTeam: predictionData?.spreadTeam || undefined,
  totalValue: predictionData?.totalValue || undefined,
  totalPrediction: predictionData?.totalPrediction || undefined,
};
```

## Step 5: Add the Components to the Form

In your form, **after the Sport Selection Pills** (around line 432), add:

```typescript
{/* Game Selector - Shows after sport is selected */}
{sport && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Select Game
    </label>
    <GameSelector
      sport={sport}
      onGameSelect={handleGameSelect}
      selectedGameId={selectedGame?.id}
    />
  </div>
)}

{/* Prediction Type Selector - Shows after game is selected */}
{selectedGame && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Make Your Prediction
    </label>
    <PredictionSelector
      sport={sport as any}
      game={selectedGame}
      onPredictionChange={setPredictionData}
    />
  </div>
)}
```

## Step 6: Update the Matchup Input to Read-Only

Since the matchup is auto-populated from the selected game, make it read-only (around line 434):

```typescript
<div>
  <input
    id="matchup"
    type="text"
    placeholder="Select a game to auto-fill matchup"
    className={`w-full px-4 py-3 border-0 border-b-2 ${
      errors.matchup ? 'border-red-400' : 'border-gray-200'
    } focus:border-primary focus:ring-0 focus:outline-none text-lg placeholder-gray-400 transition-colors`}
    {...register('matchup')}
    readOnly
    disabled={isSubmitting || isAccountBlocked || !selectedGame}
  />
  {errors.matchup && (
    <p id="matchup-error" className="mt-2 text-xs text-red-600">
      {errors.matchup.message}
    </p>
  )}
</div>
```

## Step 7: Update Form Validation

Since games now come from the API, you can remove the gameDate future validation since Sportradar only returns upcoming games. Update the pickSchema (around line 59):

```typescript
gameDate: z
  .string()
  .min(1, 'Game date is required')
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  // Removed future date validation - API only returns upcoming games
```

## Complete Integration Flow

Here's how it will work:

```
1. User clicks NBA sport pill
   ↓
2. GameSelector appears, fetching NBA games
   ↓
3. User searches/browses games
   ↓
4. User clicks on "Lakers @ Warriors" game
   ↓
5. Matchup field auto-fills: "Los Angeles Lakers @ Golden State Warriors"
   Game date auto-fills: "2025-11-05"
   ↓
6. PredictionSelector appears with NBA options (Winner, Spread, Total)
   ↓
7. User selects "Spread" prediction type
   ↓
8. User selects "Lakers" and enters "-7.5"
   ↓
9. User adds analysis in details field
   ↓
10. User submits pick
    ↓
11. Pick saved with all Sportradar data and prediction details
    ↓
12. Cron job automatically updates game results
    ↓
13. When game completes, pick is marked WON/LOST/PUSH automatically
```

## Optional: Add Validation

Add validation to ensure game and prediction are selected before submission:

```typescript
// Before the try block in onSubmit
if (!selectedGame) {
  setFormError('Please select a game');
  return;
}

if (!predictionData) {
  setFormError('Please make a prediction');
  return;
}
```

## Testing

1. Run: `npm run dev`
2. Go to `/createpick`
3. Select NBA
4. Wait for games to load
5. Search for "lakers"
6. Click a game
7. See matchup auto-fill
8. Select prediction type
9. Enter prediction details
10. Submit and verify data is saved

---

That's it! The game selector and prediction type selector are now fully integrated!
