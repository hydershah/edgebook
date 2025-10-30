/**
 * NBA Service
 * Provides access to NBA game data, schedules, and statistics
 */

import { SportradarBaseService } from './base.service';
import type {
  NBADailySchedule,
  NBASchedule,
  NBAGameSummary,
  NBAStandings,
} from './types';

export class NBAService extends SportradarBaseService {
  /**
   * Gets today's NBA games
   */
  async getTodaySchedule(): Promise<NBADailySchedule> {
    const today = this.formatDateSlash(new Date());
    return this.request<NBADailySchedule>('nba', `/games/${today}/schedule.json`);
  }

  /**
   * Gets NBA schedule for a specific date
   */
  async getScheduleByDate(date: Date): Promise<NBADailySchedule> {
    const formattedDate = this.formatDateSlash(date);
    return this.request<NBADailySchedule>('nba', `/games/${formattedDate}/schedule.json`);
  }

  /**
   * Gets full season schedule
   * @param year - Season year (e.g., 2024)
   * @param seasonType - Season type: 'REG' (regular), 'PST' (playoffs), 'PRE' (preseason)
   */
  async getSeasonSchedule(
    year: number,
    seasonType: 'REG' | 'PST' | 'PRE' = 'REG'
  ): Promise<NBASchedule> {
    return this.request<NBASchedule>('nba', `/games/${year}/${seasonType}/schedule.json`);
  }

  /**
   * Gets detailed game summary including statistics
   */
  async getGameSummary(gameId: string): Promise<NBAGameSummary> {
    return this.request<NBAGameSummary>('nba', `/games/${gameId}/summary.json`);
  }

  /**
   * Gets current season standings
   */
  async getStandings(year: number, seasonType: 'REG' | 'PST' = 'REG'): Promise<NBAStandings> {
    return this.request<NBAStandings>('nba', `/seasons/${year}/${seasonType}/standings.json`);
  }

  /**
   * Gets games for current week (last 7 days)
   */
  async getRecentGames(): Promise<NBADailySchedule[]> {
    const games: NBADailySchedule[] = [];
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
  async getUpcomingGames(): Promise<NBADailySchedule[]> {
    const games: NBADailySchedule[] = [];
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
export const nbaService = new NBAService();
