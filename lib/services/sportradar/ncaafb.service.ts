/**
 * NCAA Football Service
 * Provides access to NCAA Football game data, schedules, and statistics
 */

import { SportradarBaseService } from './base.service';
import type {
  NCAAFBSchedule,
  NCAAFBGameSummary,
  NCAAFBStandings,
} from './types/ncaafb';

export class NCAAFBService extends SportradarBaseService {
  /**
   * Gets the current season schedule
   */
  async getCurrentSeasonSchedule(): Promise<NCAAFBSchedule> {
    return this.request<NCAAFBSchedule>('ncaafb', `/games/current_season/schedule.json`);
  }

  /**
   * Gets full season schedule for a specific year
   * @param year - Season year (e.g., 2024)
   * @param seasonType - Season type: 'REG' (regular), 'PST' (postseason/playoffs), 'PRE' (preseason)
   */
  async getSeasonSchedule(
    year: number,
    seasonType: 'REG' | 'PST' | 'PRE' = 'REG'
  ): Promise<NCAAFBSchedule> {
    return this.request<NCAAFBSchedule>('ncaafb', `/games/${year}/${seasonType}/schedule.json`);
  }

  /**
   * Gets detailed game summary including statistics
   */
  async getGameSummary(gameId: string): Promise<NCAAFBGameSummary> {
    return this.request<NCAAFBGameSummary>('ncaafb', `/games/${gameId}/summary.json`);
  }

  /**
   * Gets current season standings
   */
  async getStandings(year: number, seasonType: 'REG' | 'PST' = 'REG'): Promise<NCAAFBStandings> {
    return this.request<NCAAFBStandings>('ncaafb', `/seasons/${year}/${seasonType}/standings.json`);
  }

  /**
   * Gets upcoming games from current season
   * Filters games that are scheduled in the future
   */
  async getUpcomingGames(): Promise<NCAAFBSchedule> {
    const schedule = await this.getCurrentSeasonSchedule();
    const now = new Date();

    // Filter for games scheduled in the future (next 7 days)
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingGames = schedule.games.filter(game => {
      const gameDate = new Date(game.scheduled);
      return gameDate >= now && gameDate <= sevenDaysFromNow;
    });

    return {
      ...schedule,
      games: upcomingGames,
    };
  }

  /**
   * Gets recent games from current season
   * Filters games that were completed in the last 7 days
   */
  async getRecentGames(): Promise<NCAAFBSchedule> {
    const schedule = await this.getCurrentSeasonSchedule();
    const now = new Date();

    // Filter for games from the last 7 days
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentGames = schedule.games.filter(game => {
      const gameDate = new Date(game.scheduled);
      return gameDate >= sevenDaysAgo && gameDate <= now &&
             (game.status === 'complete' || game.status === 'closed');
    });

    return {
      ...schedule,
      games: recentGames,
    };
  }

  /**
   * Gets games scheduled for today
   */
  async getTodayGames(): Promise<NCAAFBSchedule> {
    const schedule = await this.getCurrentSeasonSchedule();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayGames = schedule.games.filter(game => {
      const gameDate = new Date(game.scheduled);
      return gameDate >= today && gameDate < tomorrow;
    });

    return {
      ...schedule,
      games: todayGames,
    };
  }
}

// Export a singleton instance
export const ncaafbService = new NCAAFBService();
