/**
 * College Basketball (CBB) Service
 * Provides access to NCAA Men's Basketball game data, schedules, and statistics
 * Using Sportradar NCAA Basketball API
 */

import { SportradarBaseService } from './base.service';

interface CBBGame {
  id: string;
  home: {
    market?: string;
    name: string;
    alias?: string;
  };
  away: {
    market?: string;
    name: string;
    alias?: string;
  };
  scheduled: string;
  status: string;
  home_points?: number;
  away_points?: number;
  venue?: {
    name: string;
    city?: string;
    state?: string;
  };
}

interface CBBDailySchedule {
  date: string;
  games: CBBGame[];
}

interface CBBGameSummary {
  id: string;
  status: string;
  scheduled: string;
  home: {
    name: string;
    market: string;
    alias: string;
    points: number;
  };
  away: {
    name: string;
    market: string;
    alias: string;
    points: number;
  };
  half?: number;
  clock?: string;
}

export class CBBService extends SportradarBaseService {
  /**
   * Gets today's NCAA Basketball games
   */
  async getTodaySchedule(): Promise<CBBDailySchedule> {
    const today = this.formatDateSlash(new Date());
    return this.request<CBBDailySchedule>('ncaamb', `/games/${today}/schedule.json`);
  }

  /**
   * Gets NCAA Basketball schedule for a specific date
   */
  async getScheduleByDate(date: Date): Promise<CBBDailySchedule> {
    const formattedDate = this.formatDateSlash(date);
    return this.request<CBBDailySchedule>('ncaamb', `/games/${formattedDate}/schedule.json`);
  }

  /**
   * Gets detailed game summary including statistics
   */
  async getGameSummary(gameId: string): Promise<CBBGameSummary> {
    return this.request<CBBGameSummary>('ncaamb', `/games/${gameId}/summary.json`);
  }

  /**
   * Gets upcoming games (next 7 days)
   */
  async getUpcomingGames(): Promise<CBBDailySchedule[]> {
    const games: CBBDailySchedule[] = [];
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

// Export singleton instance
export const cbbService = new CBBService();
