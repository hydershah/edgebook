/**
 * College Football (CFB) Service
 * Provides access to NCAA Football game data, schedules, and statistics
 * Using Sportradar NCAA Football API
 */

import { SportradarBaseService } from './base.service';

interface CFBGame {
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

interface CFBWeek {
  number: number;
  title: string;
  games: CFBGame[];
}

interface CFBSchedule {
  id: string;
  year: number;
  weeks: CFBWeek[];
}

interface CFBGameSummary {
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
  quarter?: number;
  clock?: string;
}

export class CFBService extends SportradarBaseService {
  /**
   * Gets full season schedule
   * @param year - Season year (e.g., 2024)
   */
  async getSeasonSchedule(year: number): Promise<CFBSchedule> {
    return this.request<CFBSchedule>('ncaafb', `/games/${year}/FBS/schedule.json`);
  }

  /**
   * Gets schedule for a specific week
   * @param year - Season year
   * @param week - Week number
   */
  async getWeekSchedule(year: number, week: number): Promise<CFBWeek> {
    const schedule = await this.getSeasonSchedule(year);
    return schedule.weeks.find(w => w.number === week) || { number: week, title: '', games: [] };
  }

  /**
   * Gets detailed game summary including statistics
   */
  async getGameSummary(gameId: string): Promise<CFBGameSummary> {
    return this.request<CFBGameSummary>('ncaafb', `/games/${gameId}/summary.json`);
  }

  /**
   * Gets upcoming games (next 2 weeks)
   */
  async getUpcomingGames(): Promise<Array<{ games: CFBGame[] }>> {
    const currentYear = new Date().getFullYear();
    const allGames: Array<{ games: CFBGame[] }> = [];

    try {
      const schedule = await this.getSeasonSchedule(currentYear);
      const now = new Date();
      const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      // Get games from next 2 weeks
      for (const week of schedule.weeks) {
        const upcomingGames: CFBGame[] = [];
        for (const game of week.games) {
          const gameDate = new Date(game.scheduled);
          if (gameDate >= now && gameDate <= twoWeeksFromNow) {
            upcomingGames.push(game);
          }
        }
        if (upcomingGames.length > 0) {
          allGames.push({ games: upcomingGames });
        }
      }

      return allGames;
    } catch (error) {
      console.error('Error fetching upcoming NCAA Football games:', error);
      return [];
    }
  }

  /**
   * Gets today's NCAA Football games
   */
  async getTodaySchedule(): Promise<{ games: CFBGame[] }> {
    const currentYear = new Date().getFullYear();

    try {
      const schedule = await this.getSeasonSchedule(currentYear);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayGames: CFBGame[] = [];

      for (const week of schedule.weeks) {
        for (const game of week.games) {
          const gameDate = new Date(game.scheduled);
          if (gameDate >= today && gameDate < tomorrow) {
            todayGames.push(game);
          }
        }
      }

      return { games: todayGames };
    } catch (error) {
      console.error('Error fetching today\'s NCAA Football games:', error);
      return { games: [] };
    }
  }
}

// Export singleton instance
export const cfbService = new CFBService();
