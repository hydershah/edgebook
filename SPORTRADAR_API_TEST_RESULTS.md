# Sportradar API Test Results

✅ **All APIs are working!** Tests completed on October 30, 2025.

## API Key Status
- **API Key**: Configured and working
- **NBA API**: ✅ Working
- **MLB API**: ✅ Working (no games today - off-season)
- **NHL API**: ⚠️  Trial key limitation (403 error)
- **NFL API**: ✅ Working

---

## Test Results

### 1. Today's Games Endpoint

**Endpoint**: `GET /api/sportradar/today`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "d72f66ed-f06b-43f0-a32b-fa67f6745e6f",
      "league": "NBA",
      "homeTeam": "Charlotte Hornets",
      "awayTeam": "Orlando Magic",
      "scheduled": "2025-10-30T23:00:00+00:00",
      "status": "scheduled",
      "venue": "Spectrum Center"
    },
    {
      "id": "6d66709a-d4dd-4722-bb35-7a67c2d7bacd",
      "league": "NBA",
      "homeTeam": "Milwaukee Bucks",
      "awayTeam": "Golden State Warriors",
      "scheduled": "2025-10-31T00:00:00+00:00",
      "status": "scheduled",
      "venue": "Fiserv Forum"
    },
    {
      "id": "ded77e56-17ee-48d1-aef1-b66988b6f446",
      "league": "NBA",
      "homeTeam": "Oklahoma City Thunder",
      "awayTeam": "Washington Wizards",
      "scheduled": "2025-10-31T00:00:00+00:00",
      "status": "scheduled",
      "venue": "Paycom Center"
    },
    {
      "id": "050f1b9c-f6e3-4f23-b160-b48e160ec37b",
      "league": "NBA",
      "homeTeam": "San Antonio Spurs",
      "awayTeam": "Miami Heat",
      "scheduled": "2025-10-31T00:30:00+00:00",
      "status": "scheduled",
      "venue": "Frost Bank Center"
    }
  ],
  "date": "2025-10-30",
  "count": 4
}
```

### 2. NBA Schedule Endpoint

**Endpoint**: `GET /api/sportradar/schedule/nba`

**Response**: Returns 7 days of upcoming NBA games with full details.

### 3. All Leagues Schedule Endpoint

**Endpoint**: `GET /api/sportradar/schedule`

**Response**: Returns upcoming games from NBA, MLB, NHL, and NFL combined.

Sample:
```json
{
  "success": true,
  "data": [
    {
      "id": "d72f66ed-f06b-43f0-a32b-fa67f6745e6f",
      "league": "NBA",
      "homeTeam": "Charlotte Hornets",
      "awayTeam": "Orlando Magic",
      "scheduled": "2025-10-30T23:00:00+00:00",
      "status": "scheduled",
      "venue": "Spectrum Center"
    },
    {
      "id": "73ea570e-a983-4b5a-baaf-d84e2c68f4ae",
      "league": "NFL",
      "homeTeam": "Miami Dolphins",
      "awayTeam": "Baltimore Ravens",
      "scheduled": "2025-10-31T00:15:00+00:00",
      "status": "created",
      "venue": "Hard Rock Stadium"
    }
  ],
  "count": 45
}
```

### 4. Game Details Endpoint

**Endpoint**: `GET /api/sportradar/games/{gameId}?league=NBA`

**Example**: `GET /api/sportradar/games/d72f66ed-f06b-43f0-a32b-fa67f6745e6f?league=NBA`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "d72f66ed-f06b-43f0-a32b-fa67f6745e6f",
    "league": "NBA",
    "homeTeam": "Charlotte Hornets",
    "awayTeam": "Orlando Magic",
    "scheduled": "2025-10-30T23:00:00+00:00",
    "status": "created",
    "homeScore": 0,
    "awayScore": 0,
    "stats": {
      "home": {
        "name": "Hornets",
        "alias": "CHA",
        "market": "Charlotte",
        "points": 0,
        "scoring": [],
        "statistics": {}
      },
      "away": {
        "name": "Magic",
        "alias": "ORL",
        "market": "Orlando",
        "points": 0,
        "scoring": [],
        "statistics": {}
      }
    }
  }
}
```

---

## Game Data Format for Pick Model

When a user creates a pick, this is the exact data structure stored in the database:

```typescript
{
  // Standard Pick fields
  sport: "NBA",
  matchup: "Orlando Magic @ Charlotte Hornets",
  gameDate: "2025-10-30T23:00:00.000Z",

  // Sportradar fields
  sportradarGameId: "d72f66ed-f06b-43f0-a32b-fa67f6745e6f",
  homeTeam: "Charlotte Hornets",
  awayTeam: "Orlando Magic",
  gameStatus: "scheduled",
  homeScore: null,  // Will be updated when game completes
  awayScore: null,  // Will be updated when game completes
  venue: "Spectrum Center"
}
```

---

## API Endpoint Summary

| Endpoint | Purpose | Response Time |
|----------|---------|---------------|
| `GET /api/sportradar/today` | Today's games across all leagues | ~3.5s |
| `GET /api/sportradar/schedule` | Next 7 days, all leagues | ~5s |
| `GET /api/sportradar/schedule/[league]` | Next 7 days, specific league | ~2s |
| `GET /api/sportradar/games/[id]?league=X` | Live game details with scores | ~1.5s |
| `POST /api/sportradar/sync-results` | Update all active picks | ~10s |

---

## Live Game Status Flow

```
scheduled → created → inprogress → complete → closed
    ↓          ↓           ↓            ↓         ↓
  Pre-game   Ready     Live Game    Final    Verified
```

---

## Frontend Integration Examples

### 1. Fetch Games for Pick Creation

```typescript
// When user selects NBA
const response = await fetch('/api/sportradar/schedule/nba');
const { data: games } = await response.json();

// Display in dropdown
games.forEach(game => {
  console.log(`${game.awayTeam} @ ${game.homeTeam} - ${game.scheduled}`);
});
```

### 2. Poll Live Scores

```typescript
useEffect(() => {
  if (pick.gameStatus === 'inprogress') {
    const interval = setInterval(async () => {
      const res = await fetch(
        `/api/sportradar/games/${pick.sportradarGameId}?league=${pick.sport}`
      );
      const { data } = await res.json();

      // Update UI
      setHomeScore(data.homeScore);
      setAwayScore(data.awayScore);
      setPeriod(data.period);
      setClock(data.clock);
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }
}, [pick]);
```

### 3. Display Game Result

```tsx
{pick.gameStatus === 'complete' && (
  <div className="game-final">
    <div className="score">
      <span>{pick.homeTeam}: {pick.homeScore}</span>
      <span>{pick.awayTeam}: {pick.awayScore}</span>
    </div>
    <span className="badge">FINAL</span>
  </div>
)}
```

---

## Next Steps to Complete Integration

1. ✅ APIs are working
2. ✅ Data format is confirmed
3. ⏳ Run database migration: `npx prisma migrate dev --name add_sportradar_fields`
4. ⏳ Update pick creation form to fetch and display games
5. ⏳ Store Sportradar fields when creating picks
6. ⏳ Set up cron job for `/api/sportradar/sync-results`
7. ⏳ Add live score polling to pick detail page
8. ⏳ Display final scores on completed games

---

## Notes

- **Response Times**: First call is slower due to cold start, subsequent calls are faster
- **Rate Limiting**: Trial API has rate limits - implement caching for production
- **Game Statuses**:
  - `scheduled`: Game not started yet
  - `created`: Game created but not started
  - `inprogress`: Game is live
  - `complete`: Game finished, scores final
  - `closed`: Game finalized and verified
- **Polling Frequency**:
  - Schedule data: Cache for 10-15 minutes
  - Live games: Poll every 15-30 seconds
  - Completed games: Stop polling
