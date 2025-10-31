/**
 * Unified Sportradar Service
 * Provides a single interface to access all sports data
 */

import { nbaService } from './nba.service';
import { mlbService } from './mlb.service';
import { nhlService } from './nhl.service';
import { nflService } from './nfl.service';
import { ncaafbService } from './ncaafb.service';
import { ncaambService } from './ncaamb.service';

export type SportLeague = 'NBA' | 'MLB' | 'NHL' | 'NFL' | 'NCAAFB' | 'NCAAMB';

export interface UnifiedGame {
  id: string;
  league: SportLeague;
  homeTeam: string;
  awayTeam: string;
  scheduled: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
}

export interface UnifiedGameSummary extends UnifiedGame {
  stats?: unknown;
  period?: number;
  clock?: string;
}

export class SportradarService {
  private nba = nbaService;
  private mlb = mlbService;
  private nhl = nhlService;
  private nfl = nflService;
  private ncaafb = ncaafbService;
  private ncaamb = ncaambService;

  /**
   * Helper to format team name (handles both market+name and name-only formats)
   */
  private formatTeamName(team: { market?: string; name: string }): string {
    if (team.market) {
      return `${team.market} ${team.name}`;
    }
    return team.name;
  }

  /**
   * Gets upcoming games for all leagues (next 7 days)
   */
  async getAllUpcomingGames(): Promise<UnifiedGame[]> {
    const allGames: UnifiedGame[] = [];

    try {
      // Fetch from all leagues in parallel
      const [nbaGames, mlbGames, nhlGames, nflGames, ncaafbGames, ncaambGames] = await Promise.allSettled([
        this.nba.getUpcomingGames(),
        this.mlb.getUpcomingGames(),
        this.nhl.getUpcomingGames(),
        this.nfl.getUpcomingGames(),
        this.ncaafb.getUpcomingGames(),
        this.ncaamb.getUpcomingGames(),
      ]);

      // NBA games
      if (nbaGames.status === 'fulfilled') {
        for (const schedule of nbaGames.value) {
          for (const game of schedule.games) {
            allGames.push({
              id: game.id,
              league: 'NBA',
              homeTeam: this.formatTeamName(game.home),
              awayTeam: this.formatTeamName(game.away),
              scheduled: game.scheduled,
              status: game.status,
              homeScore: game.home_points,
              awayScore: game.away_points,
              venue: game.venue?.name,
            });
          }
        }
      }

      // MLB games
      if (mlbGames.status === 'fulfilled') {
        for (const schedule of mlbGames.value) {
          for (const game of schedule.games) {
            allGames.push({
              id: game.id,
              league: 'MLB',
              homeTeam: this.formatTeamName(game.home),
              awayTeam: this.formatTeamName(game.away),
              scheduled: game.scheduled,
              status: game.status,
              homeScore: game.home_team,
              awayScore: game.away_team,
              venue: game.venue?.name,
            });
          }
        }
      }

      // NHL games
      if (nhlGames.status === 'fulfilled') {
        for (const schedule of nhlGames.value) {
          for (const game of schedule.games) {
            allGames.push({
              id: game.id,
              league: 'NHL',
              homeTeam: this.formatTeamName(game.home),
              awayTeam: this.formatTeamName(game.away),
              scheduled: game.scheduled,
              status: game.status,
              homeScore: game.home_points,
              awayScore: game.away_points,
              venue: game.venue?.name,
            });
          }
        }
      }

      // NFL games
      if (nflGames.status === 'fulfilled') {
        for (const game of nflGames.value) {
          allGames.push({
            id: game.id,
            league: 'NFL',
            homeTeam: this.formatTeamName(game.home),
            awayTeam: this.formatTeamName(game.away),
            scheduled: game.scheduled,
            status: game.status,
            homeScore: game.home_points,
            awayScore: game.away_points,
            venue: game.venue?.name,
          });
        }
      }

      // NCAA Football games
      if (ncaafbGames.status === 'fulfilled') {
        for (const game of ncaafbGames.value.games) {
          allGames.push({
            id: game.id,
            league: 'NCAAFB',
            homeTeam: this.formatTeamName(game.home),
            awayTeam: this.formatTeamName(game.away),
            scheduled: game.scheduled,
            status: game.status,
            homeScore: game.home_points,
            awayScore: game.away_points,
            venue: game.venue?.name,
          });
        }
      }

      // NCAA Men's Basketball games
      if (ncaambGames.status === 'fulfilled') {
        for (const schedule of ncaambGames.value) {
          for (const game of schedule.games) {
            allGames.push({
              id: game.id,
              league: 'NCAAMB',
              homeTeam: this.formatTeamName(game.home),
              awayTeam: this.formatTeamName(game.away),
              scheduled: game.scheduled,
              status: game.status,
              homeScore: game.home_points,
              awayScore: game.away_points,
              venue: game.venue?.name,
            });
          }
        }
      }

      // Sort by scheduled time
      return allGames.sort((a, b) =>
        new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime()
      );
    } catch (error) {
      console.error('Error fetching all upcoming games:', error);
      return allGames;
    }
  }

  /**
   * Gets upcoming games for a specific league
   */
  async getUpcomingGames(league: SportLeague): Promise<UnifiedGame[]> {
    const games: UnifiedGame[] = [];

    try {
      switch (league) {
        case 'NBA': {
          const schedules = await this.nba.getUpcomingGames();
          for (const schedule of schedules) {
            for (const game of schedule.games) {
              games.push({
                id: game.id,
                league: 'NBA',
                homeTeam: this.formatTeamName(game.home),
                awayTeam: this.formatTeamName(game.away),
                scheduled: game.scheduled,
                status: game.status,
                homeScore: game.home_points,
                awayScore: game.away_points,
                venue: game.venue?.name,
              });
            }
          }
          break;
        }
        case 'MLB': {
          const schedules = await this.mlb.getUpcomingGames();
          for (const schedule of schedules) {
            for (const game of schedule.games) {
              games.push({
                id: game.id,
                league: 'MLB',
                homeTeam: this.formatTeamName(game.home),
                awayTeam: this.formatTeamName(game.away),
                scheduled: game.scheduled,
                status: game.status,
                homeScore: game.home_team,
                awayScore: game.away_team,
                venue: game.venue?.name,
              });
            }
          }
          break;
        }
        case 'NHL': {
          const schedules = await this.nhl.getUpcomingGames();
          for (const schedule of schedules) {
            for (const game of schedule.games) {
              games.push({
                id: game.id,
                league: 'NHL',
                homeTeam: this.formatTeamName(game.home),
                awayTeam: this.formatTeamName(game.away),
                scheduled: game.scheduled,
                status: game.status,
                homeScore: game.home_points,
                awayScore: game.away_points,
                venue: game.venue?.name,
              });
            }
          }
          break;
        }
        case 'NFL': {
          const nflGames = await this.nfl.getUpcomingGames();
          for (const game of nflGames) {
            games.push({
              id: game.id,
              league: 'NFL',
              homeTeam: this.formatTeamName(game.home),
              awayTeam: this.formatTeamName(game.away),
              scheduled: game.scheduled,
              status: game.status,
              homeScore: game.home_points,
              awayScore: game.away_points,
              venue: game.venue?.name,
            });
          }
          break;
        }
        case 'NCAAFB': {
          const ncaafbSchedule = await this.ncaafb.getUpcomingGames();
          for (const game of ncaafbSchedule.games) {
            games.push({
              id: game.id,
              league: 'NCAAFB',
              homeTeam: this.formatTeamName(game.home),
              awayTeam: this.formatTeamName(game.away),
              scheduled: game.scheduled,
              status: game.status,
              homeScore: game.home_points,
              awayScore: game.away_points,
              venue: game.venue?.name,
            });
          }
          break;
        }
        case 'NCAAMB': {
          const schedules = await this.ncaamb.getUpcomingGames();
          for (const schedule of schedules) {
            for (const game of schedule.games) {
              games.push({
                id: game.id,
                league: 'NCAAMB',
                homeTeam: this.formatTeamName(game.home),
                awayTeam: this.formatTeamName(game.away),
                scheduled: game.scheduled,
                status: game.status,
                homeScore: game.home_points,
                awayScore: game.away_points,
                venue: game.venue?.name,
              });
            }
          }
          break;
        }
      }

      return games.sort((a, b) =>
        new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime()
      );
    } catch (error) {
      console.error(`Error fetching upcoming games for ${league}:`, error);
      return [];
    }
  }

  /**
   * Gets live game details with current score
   */
  async getGameDetails(league: SportLeague, gameId: string): Promise<UnifiedGameSummary | null> {
    try {
      switch (league) {
        case 'NBA': {
          const summary = await this.nba.getGameSummary(gameId);
          return {
            id: summary.id,
            league: 'NBA',
            homeTeam: this.formatTeamName(summary.home),
            awayTeam: this.formatTeamName(summary.away),
            scheduled: summary.scheduled,
            status: summary.status,
            homeScore: summary.home.points,
            awayScore: summary.away.points,
            stats: { home: summary.home, away: summary.away },
            period: summary.quarter,
            clock: summary.clock,
          };
        }
        case 'MLB': {
          const summary = await this.mlb.getGameSummary(gameId);
          return {
            id: summary.id,
            league: 'MLB',
            homeTeam: this.formatTeamName(summary.home),
            awayTeam: this.formatTeamName(summary.away),
            scheduled: summary.scheduled,
            status: summary.status,
            homeScore: summary.home.runs,
            awayScore: summary.away.runs,
            stats: { home: summary.home, away: summary.away },
            period: summary.inning,
            clock: summary.inning_half,
          };
        }
        case 'NHL': {
          const summary = await this.nhl.getGameSummary(gameId);
          return {
            id: summary.id,
            league: 'NHL',
            homeTeam: this.formatTeamName(summary.home),
            awayTeam: this.formatTeamName(summary.away),
            scheduled: summary.scheduled,
            status: summary.status,
            homeScore: summary.home.points,
            awayScore: summary.away.points,
            stats: { home: summary.home, away: summary.away },
            period: summary.period,
            clock: summary.clock,
          };
        }
        case 'NFL': {
          const summary = await this.nfl.getGameSummary(gameId);
          return {
            id: summary.id,
            league: 'NFL',
            homeTeam: this.formatTeamName(summary.home),
            awayTeam: this.formatTeamName(summary.away),
            scheduled: summary.scheduled,
            status: summary.status,
            homeScore: summary.home.points,
            awayScore: summary.away.points,
            stats: { home: summary.home, away: summary.away },
            period: summary.quarter,
            clock: summary.clock,
          };
        }
        case 'NCAAFB': {
          const summary = await this.ncaafb.getGameSummary(gameId);
          return {
            id: summary.id,
            league: 'NCAAFB',
            homeTeam: this.formatTeamName(summary.home),
            awayTeam: this.formatTeamName(summary.away),
            scheduled: summary.scheduled,
            status: summary.status,
            homeScore: summary.home.points,
            awayScore: summary.away.points,
            stats: { home: summary.home, away: summary.away },
            period: summary.quarter,
            clock: summary.clock,
          };
        }
        case 'NCAAMB': {
          const summary = await this.ncaamb.getGameSummary(gameId);
          return {
            id: summary.id,
            league: 'NCAAMB',
            homeTeam: this.formatTeamName(summary.home),
            awayTeam: this.formatTeamName(summary.away),
            scheduled: summary.scheduled,
            status: summary.status,
            homeScore: summary.home.points,
            awayScore: summary.away.points,
            stats: { home: summary.home, away: summary.away },
            period: summary.half,
            clock: summary.clock,
          };
        }
      }
    } catch (error) {
      console.error(`Error fetching game details for ${league} game ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Gets today's games across all leagues
   */
  async getTodayGames(): Promise<UnifiedGame[]> {
    const allGames: UnifiedGame[] = [];

    try {
      const [nbaSchedule, mlbSchedule, nhlSchedule, ncaafbSchedule, ncaambSchedule] = await Promise.allSettled([
        this.nba.getTodaySchedule(),
        this.mlb.getTodaySchedule(),
        this.nhl.getTodaySchedule(),
        this.ncaafb.getTodayGames(),
        this.ncaamb.getTodaySchedule(),
      ]);

      // NBA games
      if (nbaSchedule.status === 'fulfilled' && nbaSchedule.value.games) {
        for (const game of nbaSchedule.value.games) {
          allGames.push({
            id: game.id,
            league: 'NBA',
            homeTeam: this.formatTeamName(game.home),
            awayTeam: this.formatTeamName(game.away),
            scheduled: game.scheduled,
            status: game.status,
            homeScore: game.home_points,
            awayScore: game.away_points,
            venue: game.venue?.name,
          });
        }
      }

      // MLB games
      if (mlbSchedule.status === 'fulfilled' && mlbSchedule.value.games) {
        for (const game of mlbSchedule.value.games) {
          allGames.push({
            id: game.id,
            league: 'MLB',
            homeTeam: this.formatTeamName(game.home),
            awayTeam: this.formatTeamName(game.away),
            scheduled: game.scheduled,
            status: game.status,
            homeScore: game.home_team,
            awayScore: game.away_team,
            venue: game.venue?.name,
          });
        }
      }

      // NHL games
      if (nhlSchedule.status === 'fulfilled' && nhlSchedule.value.games) {
        for (const game of nhlSchedule.value.games) {
          allGames.push({
            id: game.id,
            league: 'NHL',
            homeTeam: this.formatTeamName(game.home),
            awayTeam: this.formatTeamName(game.away),
            scheduled: game.scheduled,
            status: game.status,
            homeScore: game.home_points,
            awayScore: game.away_points,
            venue: game.venue?.name,
          });
        }
      }

      // Get NFL current week games and filter for today
      const nflGames = await this.nfl.getCurrentWeekGames();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      for (const game of nflGames) {
        const gameDate = new Date(game.scheduled);
        if (gameDate >= today && gameDate < tomorrow) {
          allGames.push({
            id: game.id,
            league: 'NFL',
            homeTeam: this.formatTeamName(game.home),
            awayTeam: this.formatTeamName(game.away),
            scheduled: game.scheduled,
            status: game.status,
            homeScore: game.home_points,
            awayScore: game.away_points,
            venue: game.venue?.name,
          });
        }
      }

      // NCAA Football games
      if (ncaafbSchedule.status === 'fulfilled' && ncaafbSchedule.value.games) {
        for (const game of ncaafbSchedule.value.games) {
          allGames.push({
            id: game.id,
            league: 'NCAAFB',
            homeTeam: this.formatTeamName(game.home),
            awayTeam: this.formatTeamName(game.away),
            scheduled: game.scheduled,
            status: game.status,
            homeScore: game.home_points,
            awayScore: game.away_points,
            venue: game.venue?.name,
          });
        }
      }

      // NCAA Men's Basketball games
      if (ncaambSchedule.status === 'fulfilled' && ncaambSchedule.value.games) {
        for (const game of ncaambSchedule.value.games) {
          allGames.push({
            id: game.id,
            league: 'NCAAMB',
            homeTeam: this.formatTeamName(game.home),
            awayTeam: this.formatTeamName(game.away),
            scheduled: game.scheduled,
            status: game.status,
            homeScore: game.home_points,
            awayScore: game.away_points,
            venue: game.venue?.name,
          });
        }
      }

      return allGames.sort((a, b) =>
        new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime()
      );
    } catch (error) {
      console.error('Error fetching today\'s games:', error);
      return allGames;
    }
  }
}

// Export a singleton instance
export const sportradarService = new SportradarService();
