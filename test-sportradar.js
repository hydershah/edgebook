/**
 * Test script for Sportradar API integration
 * Run with: node test-sportradar.js
 */

// Load environment variables
require('dotenv').config();

const API_KEY = process.env.SPORTRADAR_API_KEY;
const BASE_URLS = {
  nba: 'https://api.sportradar.com/nba/trial/v8/en',
  mlb: 'https://api.sportradar.com/mlb/trial/v8/en',
  nhl: 'https://api.sportradar.com/nhl/trial/v7/en',
  nfl: 'https://api.sportradar.com/nfl/official/trial/v7/en',
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

async function testAPI(sport, endpoint, description) {
  const url = `${BASE_URLS[sport]}${endpoint}?api_key=${API_KEY}`;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${description}`);
  console.log(`URL: ${url.replace(API_KEY, 'API_KEY')}`);
  console.log('='.repeat(60));

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error ${response.status}:`, errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Success!');
    return data;
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

function displayGames(games, sport) {
  if (!games || games.length === 0) {
    console.log('No games found');
    return;
  }

  console.log(`\n📅 Found ${games.length} games:\n`);

  games.slice(0, 5).forEach((game, index) => {
    const homeTeam = game.home?.market ? `${game.home.market} ${game.home.name}` : game.home?.name || 'Unknown';
    const awayTeam = game.away?.market ? `${game.away.market} ${game.away.name}` : game.away?.name || 'Unknown';
    const scheduled = new Date(game.scheduled).toLocaleString();
    const status = game.status || 'unknown';

    console.log(`${index + 1}. ${awayTeam} @ ${homeTeam}`);
    console.log(`   ID: ${game.id}`);
    console.log(`   Status: ${status}`);
    console.log(`   Time: ${scheduled}`);

    if (game.home_points !== undefined) {
      console.log(`   Score: ${awayTeam} ${game.away_points || 0} - ${homeTeam} ${game.home_points || 0}`);
    }

    if (game.venue) {
      console.log(`   Venue: ${game.venue.name}`);
    }

    console.log('');
  });

  if (games.length > 5) {
    console.log(`... and ${games.length - 5} more games\n`);
  }
}

async function main() {
  console.log('\n🏀🏈⚾🏒 SPORTRADAR API TEST\n');
  console.log('API Key:', API_KEY ? '✅ Found' : '❌ Missing');

  if (!API_KEY) {
    console.error('\n❌ SPORTRADAR_API_KEY not found in environment variables');
    process.exit(1);
  }

  const today = formatDate(new Date());

  // Test NBA
  console.log('\n\n🏀 TESTING NBA API');
  const nbaData = await testAPI('nba', `/games/${today}/schedule.json`, 'NBA Today\'s Schedule');
  if (nbaData) {
    displayGames(nbaData.games, 'NBA');
    console.log('\n📊 Sample Game Object:');
    console.log(JSON.stringify(nbaData.games?.[0], null, 2));
  }

  // Test MLB
  console.log('\n\n⚾ TESTING MLB API');
  const mlbData = await testAPI('mlb', `/games/${today}/schedule.json`, 'MLB Today\'s Schedule');
  if (mlbData) {
    displayGames(mlbData.games, 'MLB');
  }

  // Test NHL
  console.log('\n\n🏒 TESTING NHL API');
  const nhlData = await testAPI('nhl', `/games/${today}/schedule.json`, 'NHL Today\'s Schedule');
  if (nhlData) {
    displayGames(nhlData.games, 'NHL');
  }

  // Test NFL - try current season
  console.log('\n\n🏈 TESTING NFL API');
  const currentYear = new Date().getFullYear();
  const nflData = await testAPI('nfl', `/games/${currentYear}/REG/schedule.json`, 'NFL Current Season Schedule');
  if (nflData && nflData.weeks) {
    const currentWeek = nflData.weeks.find(w => w.games?.length > 0);
    if (currentWeek) {
      console.log(`\n📅 Found Week ${currentWeek.sequence} - ${currentWeek.title}:\n`);
      displayGames(currentWeek.games.slice(0, 5), 'NFL');
    }
  }

  console.log('\n✅ Testing complete!\n');
}

main().catch(console.error);
