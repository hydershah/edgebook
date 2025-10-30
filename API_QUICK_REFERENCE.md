# Sportradar API Quick Reference

## 🎯 All Available Endpoints

### Get Today's Games (All Leagues)
```bash
GET /api/sportradar/today
```
Returns all games scheduled for today across NBA, MLB, NHL, NFL.

**Example:**
```bash
curl http://localhost:3000/api/sportradar/today
```

---

### Get Upcoming Games (All Leagues)
```bash
GET /api/sportradar/schedule
```
Returns next 7 days of games across all leagues.

**Example:**
```bash
curl http://localhost:3000/api/sportradar/schedule
```

---

### Get Upcoming Games (Specific League)
```bash
GET /api/sportradar/schedule/{league}
```

**Leagues:** `nba`, `mlb`, `nhl`, `nfl`

**Examples:**
```bash
curl http://localhost:3000/api/sportradar/schedule/nba
curl http://localhost:3000/api/sportradar/schedule/nfl
```

---

### Search Games by Team
```bash
GET /api/sportradar/search?q={query}&league={league}
```

**Parameters:**
- `q` (required): Search query (team name)
- `league` (optional): Filter by league (NBA, MLB, NHL, NFL)

**Examples:**
```bash
# Search all leagues
curl "http://localhost:3000/api/sportradar/search?q=lakers"

# Search specific league
curl "http://localhost:3000/api/sportradar/search?q=lakers&league=NBA"
```

---

### Get Live Game Details
```bash
GET /api/sportradar/games/{gameId}?league={league}
```

**Parameters:**
- `gameId` (required): Game ID from schedule
- `league` (required): NBA, MLB, NHL, or NFL

**Example:**
```bash
curl "http://localhost:3000/api/sportradar/games/d72f66ed-f06b-43f0-a32b-fa67f6745e6f?league=NBA"
```

---

### Sync Game Results (Cron Job)
```bash
POST /api/sportradar/sync-results
Authorization: Bearer {CRON_SECRET}
```

Updates all active picks with latest game data and determines results for completed games.

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/sportradar/sync-results
```

---

## 🎮 Usage in Frontend

### Fetch Games When Sport Selected
```typescript
async function fetchGames(sport: string) {
  const res = await fetch(`/api/sportradar/schedule/${sport.toLowerCase()}`);
  const { data: games } = await res.json();
  return games;
}
```

### Search for Teams
```typescript
async function searchGames(query: string, league?: string) {
  const url = league
    ? `/api/sportradar/search?q=${query}&league=${league}`
    : `/api/sportradar/search?q=${query}`;

  const res = await fetch(url);
  const { data: games } = await res.json();
  return games;
}
```

### Poll Live Scores
```typescript
useEffect(() => {
  if (pick.gameStatus === 'inprogress') {
    const interval = setInterval(async () => {
      const res = await fetch(
        `/api/sportradar/games/${pick.sportradarGameId}?league=${pick.sport}`
      );
      const { data } = await res.json();

      setLiveScore({
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        period: data.period,
        clock: data.clock,
      });
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }
}, [pick]);
```

---

## 📊 Response Formats

### Game Object
```typescript
{
  id: string;              // Game ID
  league: string;          // NBA, MLB, NHL, NFL
  homeTeam: string;        // "Los Angeles Lakers"
  awayTeam: string;        // "Boston Celtics"
  scheduled: string;       // ISO datetime
  status: string;          // scheduled, inprogress, complete, closed
  homeScore?: number;      // null until game starts
  awayScore?: number;      // null until game starts
  venue?: string;          // "Crypto.com Arena"
}
```

### Live Game Details
```typescript
{
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  scheduled: string;
  status: string;
  homeScore: number;
  awayScore: number;
  period?: number;         // Quarter/Period/Inning
  clock?: string;          // Time remaining
  stats?: {               // Full game statistics
    home: TeamStats;
    away: TeamStats;
  };
}
```

---

## 🏀 Sport-Specific Notes

### NBA
- Typical spread: -3 to -15
- Typical total: 200-250 points
- Supports: Winner, Spread, Total

### NFL
- Typical spread: -3 to -14
- Typical total: 35-65 points
- Supports: Winner, Spread, Total

### MLB
- **No spread betting**
- Typical total: 6-12 runs
- Supports: Winner, Total only

### NHL
- **No spread betting**
- Typical total: 5-7 goals
- Supports: Winner, Total only

### Soccer
- **No spread betting**
- Typical total: 1.5-4.5 goals
- Supports: Winner, Total only

---

## 🔐 Rate Limiting

- Schedule data: Cache for 10-15 minutes
- Live games: Poll every 15-30 seconds
- Completed games: Stop polling

Trial API has rate limits - implement caching in production!

---

## ⚡ Quick Start

1. **Get today's games:**
   ```typescript
   const res = await fetch('/api/sportradar/today');
   const { data } = await res.json();
   ```

2. **User searches for team:**
   ```typescript
   const res = await fetch(`/api/sportradar/search?q=${query}`);
   const { data } = await res.json();
   ```

3. **User selects game and creates pick:**
   ```typescript
   await fetch('/api/picks', {
     method: 'POST',
     body: JSON.stringify({
       ...pickData,
       sportradarGameId: selectedGame.id,
       homeTeam: selectedGame.homeTeam,
       awayTeam: selectedGame.awayTeam,
       // ... prediction fields
     }),
   });
   ```

4. **Poll for live scores:**
   ```typescript
   setInterval(() => {
     fetch(`/api/sportradar/games/${gameId}?league=${league}`)
       .then(res => res.json())
       .then(data => updateScores(data));
   }, 15000);
   ```

5. **Cron job auto-determines results:**
   ```bash
   # Runs every 5 minutes
   POST /api/sportradar/sync-results
   ```

---

## 🎯 Full Integration Example

```typescript
// 1. User selects NBA
const sport = 'NBA';

// 2. Fetch upcoming NBA games
const games = await fetch('/api/sportradar/schedule/nba')
  .then(r => r.json())
  .then(d => d.data);

// 3. User searches "lakers"
const searchResults = await fetch('/api/sportradar/search?q=lakers&league=NBA')
  .then(r => r.json())
  .then(d => d.data);

// 4. User selects game and prediction type
const selectedGame = searchResults[0];
const predictionType = 'WINNER';
const predictedWinner = 'Los Angeles Lakers';

// 5. Create pick
await fetch('/api/picks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sport: 'NBA',
    matchup: `${selectedGame.awayTeam} @ ${selectedGame.homeTeam}`,
    gameDate: selectedGame.scheduled,
    sportradarGameId: selectedGame.id,
    homeTeam: selectedGame.homeTeam,
    awayTeam: selectedGame.awayTeam,
    gameStatus: selectedGame.status,
    venue: selectedGame.venue,
    predictionType,
    predictedWinner,
    // ... other fields
  }),
});

// 6. Poll live scores on pick detail page
useEffect(() => {
  if (pick.gameStatus === 'inprogress') {
    const interval = setInterval(async () => {
      const data = await fetch(
        `/api/sportradar/games/${pick.sportradarGameId}?league=NBA`
      ).then(r => r.json());

      setLiveScore(data.data);
    }, 15000);

    return () => clearInterval(interval);
  }
}, [pick]);

// 7. Cron automatically determines result when game completes
// No action needed - results appear automatically!
```

---

## 📞 Need Help?

- Full guide: [PICK_CREATION_FLOW.md](./PICK_CREATION_FLOW.md)
- Setup: [SPORTRADAR_SETUP.md](./SPORTRADAR_SETUP.md)
- Integration: [SPORTRADAR_INTEGRATION.md](./SPORTRADAR_INTEGRATION.md)
- Implementation: [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)
