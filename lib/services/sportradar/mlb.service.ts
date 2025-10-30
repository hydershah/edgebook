/**
 * MLB Service
 * Provides access to MLB game data, schedules, and statistics
 */

import { SportradarBaseService } from './base.service';
import type {
  MLBDailySchedule,
  MLBSchedule,
  MLBGameSummary,
  MLBStandings,
} from './types';

export class MLBService extends SportradarBaseService {
  /**
   * Gets today's MLB games
   */
  async getTodaySchedule(): Promise<MLBDailySchedule> {
    const today = this.formatDateSlash(new Date());
    return this.request<MLBDailySchedule>('mlb', `/games/${today}/schedule.json`);
  }

  /**
   * Gets MLB schedule for a specific date
   */
  async getScheduleByDate(date: Date): Promise<MLBDailySchedule> {
    const formattedDate = this.formatDateSlash(date);
    return this.request<MLBDailySchedule>('mlb', `/games/${formattedDate}/schedule.json`);
  }

  /**
   * Gets full season schedule
   * @param year - Season year (e.g., 2024)
   * @param seasonType - Season type: 'REG' (regular), 'PST' (playoffs), 'PRE' (preseason/spring training)
   */
  async getSeasonSchedule(
    year: number,
    seasonType: 'REG' | 'PST' | 'PRE' = 'REG'
  ): Promise<MLBSchedule> {
    return this.request<MLBSchedule>('mlb', `/games/${year}/${seasonType}/schedule.json`);
  }

  /**
   * Gets detailed game summary including statistics
   */
  async getGameSummary(gameId: string): Promise<MLBGameSummary> {
    return this.request<MLBGameSummary>('mlb', `/games/${gameId}/summary.json`);
  }

  /**
   * Gets current season standings
   */
  async getStandings(year: number, seasonType: 'REG' | 'PST' = 'REG'): Promise<MLBStandings> {
    return this.request<MLBStandings>('mlb', `/seasons/${year}/${seasonType}/standings.json`);
  }

  /**
   * Gets games for current week (last 7 days)
   */
  async getRecentGames(): Promise<MLBDailySchedule[]> {
    const games: MLBDailySchedule[] = [];
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
  async getUpcomingGames(): Promise<MLBDailySchedule[]> {
    const games: MLBDailySchedule[] = [];
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
export const mlbService = new MLBService();
