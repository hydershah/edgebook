/**
 * NCAA Men's Basketball Service
 * Provides access to NCAA Men's Basketball game data, schedules, and statistics
 */

import { SportradarBaseService } from './base.service';
import type {
  NCAAMBDailySchedule,
  NCAAMBSchedule,
  NCAAMBGameSummary,
  NCAAMBStandings,
} from './types/ncaamb';

export class NCAAMBService extends SportradarBaseService {
  /**
   * Gets today's NCAA Men's Basketball games
   */
  async getTodaySchedule(): Promise<NCAAMBDailySchedule> {
    const today = this.formatDateSlash(new Date());
    return this.request<NCAAMBDailySchedule>('ncaamb', `/games/${today}/schedule.json`);
  }

  /**
   * Gets NCAA Men's Basketball schedule for a specific date
   */
  async getScheduleByDate(date: Date): Promise<NCAAMBDailySchedule> {
    const formattedDate = this.formatDateSlash(date);
    return this.request<NCAAMBDailySchedule>('ncaamb', `/games/${formattedDate}/schedule.json`);
  }

  /**
   * Gets full season schedule
   * @param year - Season year (e.g., 2024)
   * @param seasonType - Season type: 'REG' (regular), 'PST' (postseason), 'CT' (conference tournament)
   */
  async getSeasonSchedule(
    year: number,
    seasonType: 'REG' | 'PST' | 'CT' = 'REG'
  ): Promise<NCAAMBSchedule> {
    return this.request<NCAAMBSchedule>('ncaamb', `/games/${year}/${seasonType}/schedule.json`);
  }

  /**
   * Gets detailed game summary including statistics
   */
  async getGameSummary(gameId: string): Promise<NCAAMBGameSummary> {
    return this.request<NCAAMBGameSummary>('ncaamb', `/games/${gameId}/summary.json`);
  }

  /**
   * Gets current season standings
   */
  async getStandings(year: number, seasonType: 'REG' | 'PST' = 'REG'): Promise<NCAAMBStandings> {
    return this.request<NCAAMBStandings>('ncaamb', `/seasons/${year}/${seasonType}/standings.json`);
  }

  /**
   * Gets games for current week (last 7 days)
   */
  async getRecentGames(): Promise<NCAAMBDailySchedule[]> {
    const games: NCAAMBDailySchedule[] = [];
    const today = new Date();

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      try {
        const schedule = await this.getScheduleByDate(date);
        if (schedule.games && schedule.games.length > 0) {
          games.push(schedule);
        }
      } catch (error) {
        // Skip dates with no games or errors
        console.error(`Error fetching schedule for ${date.toISOString()}:`, error);
      }
    }

    return games;
  }

  /**
   * Gets upcoming games (next 7 days)
   */
  async getUpcomingGames(): Promise<NCAAMBDailySchedule[]> {
    const games: NCAAMBDailySchedule[] = [];
    const today = new Date();

    // Get next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      try {
        const schedule = await this.getScheduleByDate(date);
        if (schedule.games && schedule.games.length > 0) {
          games.push(schedule);
        }
      } catch (error) {
        // Skip dates with no games or errors
        console.error(`Error fetching schedule for ${date.toISOString()}:`, error);
      }
    }

    return games;
  }
}

// Export a singleton instance
export const ncaambService = new NCAAMBService();
