/**
 * NHL Service
 * Provides access to NHL game data, schedules, and statistics
 */

import { SportradarBaseService } from './base.service';
import type {
  NHLDailySchedule,
  NHLSchedule,
  NHLGameSummary,
  NHLStandings,
} from './types';

export class NHLService extends SportradarBaseService {
  /**
   * Gets today's NHL games
   */
  async getTodaySchedule(): Promise<NHLDailySchedule> {
    const today = this.formatDateSlash(new Date());
    return this.request<NHLDailySchedule>('nhl', `/games/${today}/schedule.json`);
  }

  /**
   * Gets NHL schedule for a specific date
   */
  async getScheduleByDate(date: Date): Promise<NHLDailySchedule> {
    const formattedDate = this.formatDateSlash(date);
    return this.request<NHLDailySchedule>('nhl', `/games/${formattedDate}/schedule.json`);
  }

  /**
   * Gets full season schedule
   * @param year - Season year (e.g., 2024)
   * @param seasonType - Season type: 'REG' (regular), 'PST' (playoffs), 'PRE' (preseason)
   */
  async getSeasonSchedule(
    year: number,
    seasonType: 'REG' | 'PST' | 'PRE' = 'REG'
  ): Promise<NHLSchedule> {
    return this.request<NHLSchedule>('nhl', `/games/${year}/${seasonType}/schedule.json`);
  }

  /**
   * Gets detailed game summary including statistics
   */
  async getGameSummary(gameId: string): Promise<NHLGameSummary> {
    return this.request<NHLGameSummary>('nhl', `/games/${gameId}/summary.json`);
  }

  /**
   * Gets current season standings
   */
  async getStandings(year: number, seasonType: 'REG' | 'PST' = 'REG'): Promise<NHLStandings> {
    return this.request<NHLStandings>('nhl', `/seasons/${year}/${seasonType}/standings.json`);
  }

  /**
   * Gets games for current week (last 7 days)
   */
  async getRecentGames(): Promise<NHLDailySchedule[]> {
    const games: NHLDailySchedule[] = [];
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
  async getUpcomingGames(): Promise<NHLDailySchedule[]> {
    const games: NHLDailySchedule[] = [];
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
export const nhlService = new NHLService();
