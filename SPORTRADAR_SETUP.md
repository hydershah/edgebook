# Sportradar Integration - Setup Complete

## What Has Been Built

I've successfully integrated Sportradar API into your EdgeBook platform. Here's what was created:

### 1. Service Layer (`/lib/services/sportradar/`)

**Base Service** (`base.service.ts`)
- HTTP client with API key authentication
- Error handling with custom SportradarError class
- Date formatting utilities
- Configured base URLs for NBA, MLB, NHL, NFL

**Type Definitions** (`/types/`)
- Common types shared across all sports
- Sport-specific types for NBA, MLB, NHL, NFL
- Full TypeScript support for API responses

**Sport-Specific Services**
- `nba.service.ts` - NBA games, schedules, standings
- `mlb.service.ts` - MLB games, schedules, standings
- `nhl.service.ts` - NHL games, schedules, standings
- `nfl.service.ts` - NFL games, schedules (week-based)

**Unified Service** (`sportradar.service.ts`)
- Single interface for all sports
- `getAllUpcomingGames()` - Next 7 days, all leagues
- `getUpcomingGames(league)` - Next 7 days, specific league
- `getGameDetails(league, gameId)` - Live game details with scores
- `getTodayGames()` - Today's games across all leagues

### 2. API Endpoints (`/app/api/sportradar/`)

- `GET /api/sportradar/schedule` - All upcoming games (7 days)
- `GET /api/sportradar/schedule/[league]` - Upcoming games for NBA/MLB/NHL/NFL
- `GET /api/sportradar/today` - Today's games
- `GET /api/sportradar/games/[gameId]?league=NBA` - Live game details
- `POST /api/sportradar/sync-results` - Sync game results (for cron jobs)

### 3. Database Schema Updates

Updated `Pick` model with Sportradar fields:
- `sportradarGameId` - Link to Sportradar game
- `homeTeam` - Home team name
- `awayTeam` - Away team name
- `gameStatus` - Game status (scheduled, inprogress, complete, etc.)
- `homeScore` - Final home score
- `awayScore` - Final away score
- `venue` - Venue name

Added indexes for performance:
- `sportradarGameId`
- `gameStatus`
- `sport, gameDate`

### 4. Environment Configuration

Added to `.env.example`:
```bash
SPORTRADAR_API_KEY="your-api-key"
CRON_SECRET="your-cron-secret"
```

### 5. Documentation

- `SPORTRADAR_INTEGRATION.md` - Complete integration guide
- `SPORTRADAR_SETUP.md` - This file

## Next Steps

### 1. Add Your API Key to .env

Create or update your `.env` file:

```bash
# Copy the API key you provided
SPORTRADAR_API_KEY="fIMxx4paoI2L7S4slB03U4uK2nlG8JreUbhgWU06"

# Generate a random secret for cron jobs
CRON_SECRET="$(openssl rand -base64 32)"
```

### 2. Run Database Migration

Apply the schema changes to your database:

```bash
# Development
npx prisma migrate dev --name add_sportradar_fields

# Production (Railway)
DATABASE_URL="postgresql://postgres:nLwmRyQbfAlGuqbHCJXZiMYcWRsxoMQv@shortline.proxy.rlwy.net:35590/railway" npx prisma migrate deploy
```

### 3. Test the API Endpoints

Start your dev server and test the endpoints:

```bash
npm run dev

# In another terminal, test the endpoints:
curl http://localhost:3000/api/sportradar/schedule
curl http://localhost:3000/api/sportradar/schedule/nba
curl http://localhost:3000/api/sportradar/today
```

### 4. Update Pick Creation UI

Modify your pick creation form to:

1. **Fetch upcoming games** when user selects a league:
```typescript
const response = await fetch(\`/api/sportradar/schedule/\${selectedLeague.toLowerCase()}\`);
const { data: games } = await response.json();
```

2. **Display games in a dropdown**:
```tsx
<select name="game" onChange={handleGameSelect}>
  {games.map(game => (
    <option key={game.id} value={game.id}>
      {game.awayTeam} @ {game.homeTeam} - {formatDate(game.scheduled)}
    </option>
  ))}
</select>
```

3. **Save Sportradar data when creating pick**:
```typescript
await prisma.pick.create({
  data: {
    // ... existing fields
    sportradarGameId: selectedGame.id,
    homeTeam: selectedGame.homeTeam,
    awayTeam: selectedGame.awayTeam,
    gameStatus: selectedGame.status,
    venue: selectedGame.venue,
  }
});
```

### 5. Display Live Scores

Add live score display to your pick detail page:

```tsx
// Fetch live scores every 15 seconds for active games
useEffect(() => {
  if (pick.gameStatus === 'inprogress') {
    const fetchLiveScore = async () => {
      const res = await fetch(
        \`/api/sportradar/games/\${pick.sportradarGameId}?league=\${pick.sport}\`
      );
      const { data } = await res.json();
      setLiveScore(data);
    };

    fetchLiveScore();
    const interval = setInterval(fetchLiveScore, 15000);
    return () => clearInterval(interval);
  }
}, [pick]);

// Display
{pick.gameStatus === 'inprogress' && (
  <div className="live-score">
    <span className="live-badge">LIVE</span>
    <div>{pick.homeTeam}: {liveScore?.homeScore}</div>
    <div>{pick.awayTeam}: {liveScore?.awayScore}</div>
    <div>Q{liveScore?.period} - {liveScore?.clock}</div>
  </div>
)}
```

### 6. Set Up Automated Result Syncing

#### Option A: Railway Cron (Recommended)

In Railway, create a new cron service:

**Schedule**: `*/5 * * * *` (every 5 minutes)

**Command**:
```bash
curl -X POST \
  -H "Authorization: Bearer \${CRON_SECRET}" \
  https://your-domain.com/api/sportradar/sync-results
```

#### Option B: Vercel Cron

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/sportradar/sync-results",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 7. Update Pick Display to Show Game Results

When displaying picks, show the game results:

```tsx
{pick.gameStatus === 'complete' && (
  <div className="game-result">
    <div className="final-score">
      <div>{pick.homeTeam}: {pick.homeScore}</div>
      <div>{pick.awayTeam}: {pick.awayScore}</div>
    </div>
    <span className="badge">FINAL</span>
  </div>
)}
```

## Pick Creation Flow Example

Here's the complete flow:

1. **User clicks "Create Pick"**
2. **User selects league** (NBA, MLB, NHL, NFL)
3. **Frontend fetches upcoming games** from `/api/sportradar/schedule/nba`
4. **User selects a game** from the dropdown
5. **User enters their pick details** (prediction, odds, analysis, etc.)
6. **Frontend submits pick** with Sportradar game data:
   ```typescript
   {
     sport: 'NBA',
     matchup: 'Boston Celtics @ Los Angeles Lakers',
     details: userPrediction,
     sportradarGameId: selectedGame.id,
     homeTeam: selectedGame.homeTeam,
     awayTeam: selectedGame.awayTeam,
     gameStatus: 'scheduled',
     gameDate: new Date(selectedGame.scheduled),
     // ... other pick fields
   }
   ```
7. **Cron job runs every 5 minutes** and updates game status/scores
8. **Users see live scores** on the pick detail page
9. **When game completes**, final scores are stored and displayed

## Questions I Have for You

Please answer these so I can complete the implementation:

1. **Pick Result Logic**: How do you determine if a pick was WON/LOST/PUSH?
   - Does the user predict a winner? (e.g., "Lakers will win")
   - Does the user predict a spread? (e.g., "Lakers -5.5")
   - Does the user predict a total? (e.g., "Over 215.5 points")
   - Something else?

2. **When to Update Pick Status**: Should I automatically update `status` from PENDING to WON/LOST when the game completes?
   - Or should this be a manual admin action?
   - Or should the creator confirm the result?

3. **Live Score Display**: Where should live scores be shown?
   - Pick detail page?
   - Pick feed/list?
   - Both?

Once you answer these questions, I can:
- Add automatic pick result determination logic
- Update the sync endpoint to automatically mark picks as WON/LOST
- Create UI components for live score display

## Testing Checklist

- [ ] Add API key to `.env`
- [ ] Run database migration
- [ ] Test schedule endpoints
- [ ] Test today's games endpoint
- [ ] Test game details endpoint
- [ ] Update pick creation form
- [ ] Test creating pick with Sportradar data
- [ ] Set up cron job for result syncing
- [ ] Test live score polling
- [ ] Display game results on completed picks

## Resources

- Full integration guide: [SPORTRADAR_INTEGRATION.md](./SPORTRADAR_INTEGRATION.md)
- Sportradar API docs: https://developer.sportradar.com/
- Your API key: `fIMxx4paoI2L7S4slB03U4uK2nlG8JreUbhgWU06`
