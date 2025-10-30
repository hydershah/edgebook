/**
 * NFL Service
 * Provides access to NFL game data, schedules, and statistics
 */

import { SportradarBaseService } from './base.service';
import type {
  NFLSchedule,
  NFLWeekSchedule,
  NFLGameSummary,
  NFLStandings,
  NFLGame,
} from './types';

export class NFLService extends SportradarBaseService {
  /**
   * Gets full season schedule
   * @param year - Season year (e.g., 2024)
   * @param seasonType - Season type: 'REG' (regular), 'PST' (playoffs), 'PRE' (preseason)
   */
  async getSeasonSchedule(
    year: number,
    seasonType: 'REG' | 'PST' | 'PRE' = 'REG'
  ): Promise<NFLSchedule> {
    return this.request<NFLSchedule>('nfl', `/games/${year}/${seasonType}/schedule.json`);
  }

  /**
   * Gets schedule for a specific week
   * @param year - Season year (e.g., 2024)
   * @param seasonType - Season type
   * @param week - Week number (1-18 for regular season)
   */
  async getWeekSchedule(
    year: number,
    seasonType: 'REG' | 'PST' | 'PRE',
    week: number
  ): Promise<NFLWeekSchedule> {
    return this.request<NFLWeekSchedule>(
      'nfl',
      `/games/${year}/${seasonType}/${week}/schedule.json`
    );
  }

  /**
   * Gets detailed game summary including statistics
   */
  async getGameSummary(gameId: string): Promise<NFLGameSummary> {
    return this.request<NFLGameSummary>('nfl', `/games/${gameId}/summary.json`);
  }

  /**
   * Gets current season standings
   */
  async getStandings(year: number, seasonType: 'REG' | 'PST' = 'REG'): Promise<NFLStandings> {
    return this.request<NFLStandings>('nfl', `/seasons/${year}/${seasonType}/standings.json`);
  }

  /**
   * Gets current week's games
   */
  async getCurrentWeekGames(): Promise<NFLGame[]> {
    const currentYear = new Date().getFullYear();

    try {
      // Get full season schedule
      const schedule = await this.getSeasonSchedule(currentYear, 'REG');

      // Find current week based on today's date
      const now = new Date();
      const currentWeek = schedule.weeks.find((week) => {
        const weekGames = week.games.filter(game => new Date(game.scheduled) > now);
        return weekGames.length > 0;
      });

      return currentWeek?.games || [];
    } catch (error) {
      console.error('Error fetching current week games:', error);
      return [];
    }
  }

  /**
   * Gets upcoming games (next 2 weeks)
   */
  async getUpcomingGames(): Promise<NFLGame[]> {
    const currentYear = new Date().getFullYear();
    const allGames: NFLGame[] = [];

    try {
      const schedule = await this.getSeasonSchedule(currentYear, 'REG');
      const now = new Date();
      const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      // Get games from next 2 weeks
      for (const week of schedule.weeks) {
        for (const game of week.games) {
          const gameDate = new Date(game.scheduled);
          if (gameDate >= now && gameDate <= twoWeeksFromNow) {
            allGames.push(game);
          }
        }
      }

      return allGames.sort((a, b) =>
        new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime()
      );
    } catch (error) {
      console.error('Error fetching upcoming games:', error);
      return [];
    }
  }

  /**
   * Gets recent games (last 2 weeks)
   */
  async getRecentGames(): Promise<NFLGame[]> {
    const currentYear = new Date().getFullYear();
    const allGames: NFLGame[] = [];

    try {
      const schedule = await this.getSeasonSchedule(currentYear, 'REG');
      const now = new Date();
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Get games from last 2 weeks
      for (const week of schedule.weeks) {
        for (const game of week.games) {
          const gameDate = new Date(game.scheduled);
          if (gameDate >= twoWeeksAgo && gameDate <= now) {
            allGames.push(game);
          }
        }
      }

      return allGames.sort((a, b) =>
        new Date(b.scheduled).getTime() - new Date(a.scheduled).getTime()
      );
    } catch (error) {
      console.error('Error fetching recent games:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const nflService = new NFLService();
