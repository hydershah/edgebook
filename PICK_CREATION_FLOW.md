# Complete Pick Creation & Result Determination Flow

## Overview

This document explains the complete flow for creating picks with game data, automatic result determination, and live score tracking.

---

## Supported Sports & Prediction Types

### Sport-Specific Betting Options

| Sport | Winner | Spread | Total | Notes |
|-------|--------|--------|-------|-------|
| 🏈 NFL | ✅ | ✅ | ✅ | Point spread, total points |
| 🏀 NBA | ✅ | ✅ | ✅ | Point spread, total points |
| ⚾ MLB | ✅ | ❌ | ✅ | Moneyline + total runs (no spread) |
| 🏒 NHL | ✅ | ❌ | ✅ | Moneyline + total goals (no spread) |
| ⚽ Soccer | ✅ | ❌ | ✅ | Match result + total goals (no spread) |
| 🏈 CFB | ✅ | ✅ | ✅ | Point spread, total points |
| 🏀 CBB | ✅ | ✅ | ✅ | Point spread, total points |

---

## Pick Creation Flow

### Step 1: User Selects Sport

User chooses from: **NFL, NBA, MLB, NHL, Soccer, CFB, CBB**

```typescript
const [selectedSport, setSelectedSport] = useState<Sport | null>(null);

<select onChange={(e) => setSelectedSport(e.target.value as Sport)}>
  <option value="">Select Sport</option>
  <option value="NFL">🏈 NFL</option>
  <option value="NBA">🏀 NBA</option>
  <option value="MLB">⚾ MLB</option>
  <option value="NHL">🏒 NHL</option>
  <option value="SOCCER">⚽ Soccer</option>
  <option value="COLLEGE_FOOTBALL">🏈 College Football</option>
  <option value="COLLEGE_BASKETBALL">🏀 College Basketball</option>
</select>
```

### Step 2: Fetch & Display Games

Once sport is selected, fetch upcoming games:

```typescript
useEffect(() => {
  if (selectedSport) {
    fetchGames(selectedSport);
  }
}, [selectedSport]);

async function fetchGames(sport: Sport) {
  const response = await fetch(`/api/sportradar/schedule/${sport.toLowerCase()}`);
  const { data: games } = await response.json();
  setAvailableGames(games);
}
```

**Display Games with Search:**

```tsx
<input
  type="text"
  placeholder="Search teams..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>

{filteredGames.map(game => (
  <div key={game.id} onClick={() => selectGame(game)}>
    <div>{game.awayTeam} @ {game.homeTeam}</div>
    <div>{formatDate(game.scheduled)}</div>
    <div>{game.venue}</div>
  </div>
))}
```

**Or use search API directly:**

```typescript
const response = await fetch(`/api/sportradar/search?q=${searchQuery}&league=${selectedSport}`);
const { data: games } = await response.json();
```

### Step 3: User Selects Prediction Type

Based on sport, show available prediction types:

```typescript
import { getAllowedPredictionTypes, getSportLabels } from '@/lib/services/sportradar/sport-betting-rules';

const allowedTypes = getAllowedPredictionTypes(selectedSport);
const labels = getSportLabels(selectedSport);

<select onChange={(e) => setPredictionType(e.target.value)}>
  {allowedTypes.includes('WINNER') && (
    <option value="WINNER">{labels.winner}</option>
  )}
  {allowedTypes.includes('SPREAD') && (
    <option value="SPREAD">{labels.spread}</option>
  )}
  {allowedTypes.includes('TOTAL') && (
    <option value="TOTAL">{labels.total}</option>
  )}
</select>
```

### Step 4: Collect Prediction Details

**For WINNER prediction:**

```tsx
{predictionType === 'WINNER' && (
  <div>
    <label>Which team will win?</label>
    <select onChange={(e) => setPredictedWinner(e.target.value)}>
      <option value={selectedGame.homeTeam}>{selectedGame.homeTeam}</option>
      <option value={selectedGame.awayTeam}>{selectedGame.awayTeam}</option>
    </select>
  </div>
)}
```

**For SPREAD prediction:**

```tsx
{predictionType === 'SPREAD' && (
  <div>
    <label>Select team and spread</label>
    <select onChange={(e) => setSpreadTeam(e.target.value)}>
      <option value={selectedGame.homeTeam}>{selectedGame.homeTeam}</option>
      <option value={selectedGame.awayTeam}>{selectedGame.awayTeam}</option>
    </select>
    <input
      type="number"
      step="0.5"
      placeholder="Spread (e.g., -5.5)"
      value={spreadValue}
      onChange={(e) => setSpreadValue(parseFloat(e.target.value))}
    />
    <small>Example: Lakers -5.5 means Lakers must win by more than 5.5 points</small>
  </div>
)}
```

**For TOTAL prediction:**

```tsx
{predictionType === 'TOTAL' && (
  <div>
    <label>Over/Under</label>
    <select onChange={(e) => setTotalPrediction(e.target.value)}>
      <option value="OVER">Over</option>
      <option value="UNDER">Under</option>
    </select>
    <input
      type="number"
      step="0.5"
      placeholder="Total (e.g., 215.5)"
      value={totalValue}
      onChange={(e) => setTotalValue(parseFloat(e.target.value))}
    />
    <small>Example: Over 215.5 means total combined score must be higher than 215.5</small>
  </div>
)}
```

### Step 5: Submit Pick

```typescript
async function createPick() {
  const pickData = {
    userId: user.id,
    sport: selectedSport,
    matchup: `${selectedGame.awayTeam} @ ${selectedGame.homeTeam}`,
    details: userAnalysis, // User's written analysis
    odds: userOdds, // Optional
    gameDate: new Date(selectedGame.scheduled),
    isPremium: isPremiumPick,
    price: isPremiumPick ? price : null,

    // Sportradar fields
    sportradarGameId: selectedGame.id,
    homeTeam: selectedGame.homeTeam,
    awayTeam: selectedGame.awayTeam,
    gameStatus: selectedGame.status,
    venue: selectedGame.venue,

    // Prediction fields
    predictionType: predictionType,
    predictedWinner: predictionType === 'WINNER' ? predictedWinner : null,
    spreadValue: predictionType === 'SPREAD' ? spreadValue : null,
    spreadTeam: predictionType === 'SPREAD' ? spreadTeam : null,
    totalValue: predictionType === 'TOTAL' ? totalValue : null,
    totalPrediction: predictionType === 'TOTAL' ? totalPrediction : null,
  };

  const response = await fetch('/api/picks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pickData),
  });

  if (response.ok) {
    // Pick created successfully
    router.push('/picks');
  }
}
```

---

## Automatic Result Determination

### How It Works

1. **Cron Job Runs** (every 5 minutes):
   - Calls `POST /api/sportradar/sync-results`
   - Fetches all active picks (scheduled, inprogress, or not yet determined)

2. **Update Game Data**:
   - Fetches latest game status and scores from Sportradar
   - Updates pick with current data

3. **Determine Result** (when game is complete):
   - Checks if game status is "complete" or "closed"
   - If yes, runs result determination logic based on prediction type

4. **Update Pick Status**:
   - Sets `status` to `WON`, `LOST`, or `PUSH`
   - Sets `resultDetermined` to `true`
   - Stores `resultNotes` with explanation

### Result Logic by Prediction Type

**WINNER**:
```
If predicted winner matches actual winner → WON
If predicted winner doesn't match → LOST
If game tied → PUSH
```

**SPREAD**:
```
Team Score + Spread > Opponent Score → WON
Example: Lakers -5.5
  Lakers 110, Celtics 100
  110 + (-5.5) = 104.5
  104.5 > 100 → WON
```

**TOTAL**:
```
OVER prediction: If total score > predicted total → WON
UNDER prediction: If total score < predicted total → WON
If exactly on total → PUSH
```

### Example Results

**WINNER Example**:
```json
{
  "status": "WON",
  "resultNotes": "Correctly predicted Los Angeles Lakers to win. Final: Charlotte Hornets 95 - Los Angeles Lakers 112",
  "resultDetermined": true
}
```

**SPREAD Example**:
```json
{
  "status": "LOST",
  "resultNotes": "Los Angeles Lakers did not cover the spread -7.5. Final: Charlotte Hornets 95 - Los Angeles Lakers 100",
  "resultDetermined": true
}
```

**TOTAL Example**:
```json
{
  "status": "WON",
  "resultNotes": "OVER 215.5 hit. Actual total: 220 (Charlotte Hornets 105 - Los Angeles Lakers 115)",
  "resultDetermined": true
}
```

---

## Live Score Display

### Pick Detail Page

Poll for live scores when game is in progress:

```typescript
useEffect(() => {
  if (pick.gameStatus === 'inprogress') {
    const fetchLiveScore = async () => {
      const res = await fetch(
        `/api/sportradar/games/${pick.sportradarGameId}?league=${pick.sport}`
      );
      const { data } = await res.json();

      setLiveScore({
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        period: data.period,
        clock: data.clock,
        status: data.status,
      });
    };

    // Initial fetch
    fetchLiveScore();

    // Poll every 15 seconds
    const interval = setInterval(fetchLiveScore, 15000);

    return () => clearInterval(interval);
  }
}, [pick]);
```

**Display:**

```tsx
{pick.gameStatus === 'scheduled' && (
  <div className="game-upcoming">
    <span>📅 Upcoming</span>
    <div>{formatDateTime(pick.gameDate)}</div>
  </div>
)}

{pick.gameStatus === 'inprogress' && liveScore && (
  <div className="game-live">
    <span className="live-badge">🔴 LIVE</span>
    <div className="scores">
      <div>{pick.homeTeam}: {liveScore.homeScore}</div>
      <div>{pick.awayTeam}: {liveScore.awayScore}</div>
    </div>
    <div className="game-time">
      Q{liveScore.period} - {liveScore.clock}
    </div>
  </div>
)}

{(pick.gameStatus === 'complete' || pick.gameStatus === 'closed') && (
  <div className="game-final">
    <span className="final-badge">FINAL</span>
    <div className="scores">
      <div>{pick.homeTeam}: {pick.homeScore}</div>
      <div>{pick.awayTeam}: {pick.awayScore}</div>
    </div>
    {pick.resultDetermined && (
      <div className={`result ${pick.status?.toLowerCase()}`}>
        {pick.status === 'WON' && '✅ WON'}
        {pick.status === 'LOST' && '❌ LOST'}
        {pick.status === 'PUSH' && '🔄 PUSH'}
        <p>{pick.resultNotes}</p>
      </div>
    )}
  </div>
)}
```

### Pick Feed (List View)

Show compact live scores in feed:

```tsx
<div className="pick-card">
  <div className="pick-header">
    <span className="sport-badge">{pick.sport}</span>
    {pick.gameStatus === 'inprogress' && <span className="live-badge">🔴 LIVE</span>}
  </div>

  <div className="matchup">
    <div className="teams">
      {pick.awayTeam} @ {pick.homeTeam}
    </div>

    {pick.gameStatus === 'inprogress' && pick.homeScore !== null && (
      <div className="live-scores">
        {pick.awayScore} - {pick.homeScore}
      </div>
    )}

    {pick.resultDetermined && (
      <div className={`result-badge ${pick.status?.toLowerCase()}`}>
        {pick.status}
      </div>
    )}
  </div>

  <div className="prediction">
    <strong>Prediction:</strong>
    {pick.predictionType === 'WINNER' && ` ${pick.predictedWinner} to win`}
    {pick.predictionType === 'SPREAD' && ` ${pick.spreadTeam} ${pick.spreadValue}`}
    {pick.predictionType === 'TOTAL' && ` ${pick.totalPrediction} ${pick.totalValue}`}
  </div>
</div>
```

---

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sportradar/schedule` | GET | All upcoming games (7 days) |
| `/api/sportradar/schedule/[league]` | GET | League-specific games |
| `/api/sportradar/today` | GET | Today's games |
| `/api/sportradar/search?q=lakers&league=NBA` | GET | Search games by team |
| `/api/sportradar/games/[id]?league=NBA` | GET | Live game details |
| `/api/sportradar/sync-results` | POST | Sync game results (cron) |

---

## Database Migration

Run this to add all new fields:

```bash
npx prisma migrate dev --name add_prediction_and_result_fields
```

This adds:
- `predictionType` enum (WINNER, SPREAD, TOTAL)
- Prediction fields (predictedWinner, spreadValue, spreadTeam, totalValue, totalPrediction)
- Result tracking (resultDetermined, resultNotes)
- Indexes for performance

---

## Testing the Flow

### 1. Create a Test Pick

```bash
# 1. Fetch today's games
curl http://localhost:3000/api/sportradar/today

# 2. Use a game ID to create a pick (in your UI or via API)

# 3. Manually trigger sync to test result determination
curl -X POST \
  -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/sportradar/sync-results
```

### 2. Test Each Prediction Type

**Winner Test:**
- Select a game
- Choose WINNER prediction type
- Select a team
- Wait for game to complete
- Check if result is correct

**Spread Test:**
- Select a game
- Choose SPREAD prediction type
- Enter spread (e.g., Lakers -5.5)
- Wait for game to complete
- Check if spread was covered

**Total Test:**
- Select a game
- Choose TOTAL prediction type
- Enter total (e.g., Over 215.5)
- Wait for game to complete
- Check if total hit

---

## Next Steps

1. ✅ Database schema updated with prediction fields
2. ✅ Result determination logic created
3. ✅ Sync endpoint auto-determines results
4. ✅ Search endpoint created
5. ⏳ Update pick creation form UI
6. ⏳ Add live score polling to pick pages
7. ⏳ Set up cron job for automatic syncing
8. ⏳ Test with real games

---

## Important Notes

- **Rate Limiting**: Cache API responses to avoid hitting rate limits
- **Polling Frequency**:
  - Live games: Every 15-30 seconds
  - Completed games: Stop polling
- **Sports Without Spread**: MLB, NHL, Soccer don't support spread betting
- **Result Determination**: Only happens when game status is "complete" or "closed"
- **Push Handling**: Rare with .5 spreads/totals, but handled correctly
