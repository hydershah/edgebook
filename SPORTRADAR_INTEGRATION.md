# Sportradar Integration Guide

This document explains how to use the Sportradar API integration in EdgeBook.

## Overview

The Sportradar integration provides real-time sports data for NBA, MLB, NHL, and NFL games, including:
- Game schedules (up to 7 days in advance)
- Live game scores and status
- Team information
- Game statistics
- Automatic game result syncing

## Setup

### 1. Environment Configuration

Add your Sportradar API key to your `.env` file:

```bash
SPORTRADAR_API_KEY="fIMxx4paoI2L7S4slB03U4uK2nlG8JreUbhgWU06"
CRON_SECRET="your-random-secret-for-cron-jobs"
```

### 2. Database Migration

Run the Prisma migration to add Sportradar fields to the Pick model:

```bash
npx prisma migrate dev --name add_sportradar_fields
```

Or apply migrations in production:

```bash
npx prisma migrate deploy
```

## API Endpoints

### Get Upcoming Games (All Leagues)

Returns upcoming games for the next 7 days across all leagues.

```
GET /api/sportradar/schedule
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "game-id",
      "league": "NBA",
      "homeTeam": "Los Angeles Lakers",
      "awayTeam": "Boston Celtics",
      "scheduled": "2024-01-15T19:30:00Z",
      "status": "scheduled",
      "homeScore": null,
      "awayScore": null,
      "venue": "Crypto.com Arena"
    }
  ],
  "count": 45
}
```

### Get Upcoming Games (Specific League)

Returns upcoming games for a specific league.

```
GET /api/sportradar/schedule/[league]
```

**Parameters:**
- `league`: NBA, MLB, NHL, or NFL

**Example:**
```
GET /api/sportradar/schedule/nba
```

### Get Today's Games

Returns all games scheduled for today across all leagues.

```
GET /api/sportradar/today
```

### Get Live Game Details

Returns detailed information about a specific game, including live scores.

```
GET /api/sportradar/games/[gameId]?league=NBA
```

**Query Parameters:**
- `league`: NBA, MLB, NHL, or NFL (required)

**Example:**
```
GET /api/sportradar/games/abc123def456?league=NBA
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "league": "NBA",
    "homeTeam": "Los Angeles Lakers",
    "awayTeam": "Boston Celtics",
    "scheduled": "2024-01-15T19:30:00Z",
    "status": "inprogress",
    "homeScore": 78,
    "awayScore": 82,
    "period": 3,
    "clock": "5:42",
    "stats": { ... }
  }
}
```

### Sync Game Results

Updates all active picks with the latest game results from Sportradar.

```
POST /api/sportradar/sync-results
Authorization: Bearer YOUR_CRON_SECRET
```

This endpoint should be called by a cron job every 5-10 minutes during game times.

## Pick Creation Workflow

### 1. Fetch Available Games

When a user creates a pick, fetch upcoming games for their selected league:

```typescript
const response = await fetch('/api/sportradar/schedule/nba');
const { data: games } = await response.json();
```

### 2. Display Games to User

Show the list of games in a dropdown or selection UI:

```tsx
<select onChange={handleGameSelect}>
  {games.map(game => (
    <option key={game.id} value={game.id}>
      {game.awayTeam} @ {game.homeTeam} - {formatDate(game.scheduled)}
    </option>
  ))}
</select>
```

### 3. Create Pick with Game Data

When the user selects a game and creates their pick, store the Sportradar data:

```typescript
await prisma.pick.create({
  data: {
    userId: user.id,
    sport: 'NBA',
    matchup: `${game.awayTeam} @ ${game.homeTeam}`,
    details: userPickDetails,
    gameDate: new Date(game.scheduled),

    // Sportradar fields
    sportradarGameId: game.id,
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    gameStatus: game.status,
    venue: game.venue,

    // Other pick fields...
    isPremium: true,
    price: 10.00,
  }
});
```

## Live Score Updates

### Frontend Polling

For live games, poll the game details endpoint every 10-30 seconds:

```typescript
useEffect(() => {
  if (pick.gameStatus === 'inprogress') {
    const interval = setInterval(async () => {
      const response = await fetch(
        `/api/sportradar/games/${pick.sportradarGameId}?league=${pick.sport}`
      );
      const { data } = await response.json();

      // Update UI with latest scores
      setLiveScore(data);
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }
}, [pick]);
```

### Display Live Scores

```tsx
{pick.gameStatus === 'inprogress' && (
  <div className="live-score">
    <span className="live-indicator">LIVE</span>
    <div>
      {pick.homeTeam}: {pick.homeScore}
    </div>
    <div>
      {pick.awayTeam}: {pick.awayScore}
    </div>
  </div>
)}
```

## Automated Result Syncing

### Setting Up a Cron Job

Use a service like Vercel Cron, Railway Cron, or a standalone cron service to periodically call the sync endpoint.

#### Vercel Cron (vercel.json)

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

#### Railway Cron

In Railway, add a cron service that runs:

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://yourdomain.com/api/sportradar/sync-results
```

Schedule: `*/5 * * * *` (every 5 minutes)

### Manual Sync

For testing, you can manually trigger a sync:

```bash
curl -X POST \
  -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/sportradar/sync-results
```

## Service Layer Usage

### Direct Service Usage

You can also use the Sportradar services directly in your server-side code:

```typescript
import { sportradarService } from '@/lib/services/sportradar';

// Get all upcoming games
const allGames = await sportradarService.getAllUpcomingGames();

// Get games for specific league
const nbaGames = await sportradarService.getUpcomingGames('NBA');

// Get live game details
const gameDetails = await sportradarService.getGameDetails('NBA', 'game-id');

// Get today's games
const todayGames = await sportradarService.getTodayGames();
```

### League-Specific Services

```typescript
import { nbaService, mlbService, nhlService, nflService } from '@/lib/services/sportradar';

// NBA
const nbaSchedule = await nbaService.getTodaySchedule();
const nbaGame = await nbaService.getGameSummary('game-id');

// MLB
const mlbSchedule = await mlbService.getUpcomingGames();

// NHL
const nhlStandings = await nhlService.getStandings(2024, 'REG');

// NFL
const nflWeek = await nflService.getCurrentWeekGames();
```

## Database Schema

### Pick Model Fields

The Pick model includes these Sportradar-related fields:

- `sportradarGameId`: Unique game ID from Sportradar
- `homeTeam`: Home team name
- `awayTeam`: Away team name
- `gameStatus`: Current game status (scheduled, inprogress, complete, closed, etc.)
- `homeScore`: Final home team score (null until game completes)
- `awayScore`: Final away team score (null until game completes)
- `venue`: Venue name

## Best Practices

1. **Cache API Responses**: Sportradar has rate limits. Cache schedule responses for at least 5-10 minutes.

2. **Error Handling**: Always wrap Sportradar API calls in try-catch blocks and handle errors gracefully.

3. **Polling Frequency**:
   - Schedule data: Cache for 10-15 minutes
   - Live games: Poll every 15-30 seconds
   - Completed games: Stop polling

4. **Status Transitions**:
   - `scheduled` → `inprogress` → `complete` → `closed`
   - Only update pick results when status is `complete` or `closed`

5. **Timezone Handling**: All dates from Sportradar are in UTC. Convert to user's timezone for display.

## Troubleshooting

### API Key Issues

If you get authentication errors:
1. Verify `SPORTRADAR_API_KEY` is set in `.env`
2. Check that the API key is valid
3. Ensure you're using the trial endpoints (included in base URLs)

### Rate Limiting

Sportradar trial accounts have rate limits. If you hit rate limits:
1. Implement response caching
2. Reduce polling frequency
3. Use database to store game data and only fetch updates

### Game Not Found

If a game isn't found:
1. Check that the `sportradarGameId` is correct
2. Verify the league parameter matches the sport
3. Ensure the game exists in Sportradar's system

## Support

For Sportradar API documentation, visit:
- NBA: https://developer.sportradar.com/basketball/reference/nba-overview
- MLB: https://developer.sportradar.com/baseball/reference/mlb-overview
- NHL: https://developer.sportradar.com/ice-hockey/reference/nhl-overview
- NFL: https://developer.sportradar.com/football/reference/nfl-overview
