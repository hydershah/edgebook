/**
 * Test script showing how game data will be formatted for Pick model
 * Run with: node test-pick-format.js
 */

require('dotenv').config();

const API_KEY = process.env.SPORTRADAR_API_KEY;

async function fetchNBAGames() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}/${month}/${day}`;

  const url = `https://api.sportradar.com/nba/trial/v8/en/games/${dateStr}/schedule.json?api_key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}

async function fetchNFLGames() {
  const currentYear = new Date().getFullYear();
  const url = `https://api.sportradar.com/nfl/official/trial/v7/en/games/${currentYear}/REG/schedule.json?api_key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}

function formatGameForPick(game, sport) {
  // Format team names
  const homeTeam = game.home?.market
    ? `${game.home.market} ${game.home.name}`
    : game.home?.name || 'Unknown';

  const awayTeam = game.away?.market
    ? `${game.away.market} ${game.away.name}`
    : game.away?.name || 'Unknown';

  // Format matchup string
  const matchup = `${awayTeam} @ ${homeTeam}`;

  // Get scores (will be null for scheduled games)
  const homeScore = game.home_points || null;
  const awayScore = game.away_points || null;

  // Format venue
  const venue = game.venue?.name || null;

  // Return data formatted for Pick model
  return {
    // Fields for Pick model
    sport,
    matchup,
    gameDate: new Date(game.scheduled),

    // Sportradar fields
    sportradarGameId: game.id,
    homeTeam,
    awayTeam,
    gameStatus: game.status,
    homeScore,
    awayScore,
    venue,

    // Additional metadata
    scheduled: game.scheduled,
    broadcasts: game.broadcasts || [],
  };
}

async function main() {
  console.log('\n🎯 PICK MODEL FORMAT TEST\n');
  console.log('This shows exactly how game data will be stored in your Pick model.\n');

  // Test NBA
  console.log('🏀 NBA GAMES\n');
  try {
    const nbaData = await fetchNBAGames();

    if (nbaData.games && nbaData.games.length > 0) {
      console.log(`Found ${nbaData.games.length} NBA games:\n`);

      nbaData.games.slice(0, 3).forEach((game, index) => {
        const pickData = formatGameForPick(game, 'NBA');

        console.log(`${index + 1}. ${pickData.matchup}`);
        console.log('─'.repeat(60));
        console.log(JSON.stringify({
          // This is what goes into the Pick table
          sport: pickData.sport,
          matchup: pickData.matchup,
          gameDate: pickData.gameDate.toISOString(),
          sportradarGameId: pickData.sportradarGameId,
          homeTeam: pickData.homeTeam,
          awayTeam: pickData.awayTeam,
          gameStatus: pickData.gameStatus,
          homeScore: pickData.homeScore,
          awayScore: pickData.awayScore,
          venue: pickData.venue,
        }, null, 2));
        console.log('\n');
      });
    } else {
      console.log('No NBA games today\n');
    }
  } catch (error) {
    console.error('❌ NBA API error:', error.message);
  }

  // Test NFL
  console.log('\n🏈 NFL GAMES\n');
  try {
    const nflData = await fetchNFLGames();

    if (nflData.weeks && nflData.weeks.length > 0) {
      // Get first week with games
      const weekWithGames = nflData.weeks.find(w => w.games && w.games.length > 0);

      if (weekWithGames) {
        console.log(`Found ${weekWithGames.games.length} NFL games in Week ${weekWithGames.sequence}:\n`);

        weekWithGames.games.slice(0, 3).forEach((game, index) => {
          const pickData = formatGameForPick(game, 'NFL');

          console.log(`${index + 1}. ${pickData.matchup}`);
          console.log('─'.repeat(60));
          console.log(JSON.stringify({
            sport: pickData.sport,
            matchup: pickData.matchup,
            gameDate: pickData.gameDate.toISOString(),
            sportradarGameId: pickData.sportradarGameId,
            homeTeam: pickData.homeTeam,
            awayTeam: pickData.awayTeam,
            gameStatus: pickData.gameStatus,
            homeScore: pickData.homeScore,
            awayScore: pickData.awayScore,
            venue: pickData.venue,
          }, null, 2));
          console.log('\n');
        });
      }
    }
  } catch (error) {
    console.error('❌ NFL API error:', error.message);
  }

  console.log('\n✅ This is the exact format that will be stored in your Pick table!');
  console.log('\nNext steps:');
  console.log('1. Run: npx prisma migrate dev --name add_sportradar_fields');
  console.log('2. Update your pick creation form to fetch games from /api/sportradar/schedule/[league]');
  console.log('3. When user selects a game, store these Sportradar fields in the Pick');
  console.log('4. Set up cron job to call /api/sportradar/sync-results every 5 minutes');
  console.log('5. Display live scores by polling /api/sportradar/games/[gameId]?league=NBA\n');
}

main().catch(console.error);
