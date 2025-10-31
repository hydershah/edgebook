/**
 * NCAA Football (NCAAFB) type definitions for Sportradar API v7
 */

import { Team, Venue, GameStatus, Player, Record } from './common';

export interface NCAAFBSchedule {
  league: {
    id: string;
    name: string;
    alias: string;
  };
  season: {
    id: string;
    year: number;
    type: 'REG' | 'PST' | 'PRE';
  };
  games: NCAAFBGame[];
}

export interface NCAAFBGame {
  id: string;
  status: GameStatus['status'];
  scheduled: string;
  home: Team;
  away: Team;
  venue?: Venue;
  broadcast?: {
    network?: string;
    satellite?: string;
  };
  scoring?: {
    home_points: number;
    away_points: number;
    periods?: Array<{
      sequence: number;
      home_points: number;
      away_points: number;
      type: 'quarter' | 'half' | 'overtime';
    }>;
  };
  home_points?: number;
  away_points?: number;
  sr_id?: string;
  reference?: string;
  neutral_site?: boolean;
  conference_game?: boolean;
  title?: string;
}

export interface NCAAFBGameSummary {
  id: string;
  status: GameStatus['status'];
  scheduled: string;
  duration?: string;
  attendance?: number;
  clock?: string;
  quarter?: number;
  home: NCAAFBTeamStats;
  away: NCAAFBTeamStats;
  venue?: Venue;
  weather?: {
    condition?: string;
    temp?: number;
    wind?: {
      speed: number;
      direction: string;
    };
  };
}

export interface NCAAFBTeamStats {
  id: string;
  name: string;
  alias: string;
  market: string;
  points: number;
  scoring?: Array<{
    sequence: number;
    points: number;
    type: 'quarter' | 'half' | 'overtime';
  }>;
  statistics?: {
    // Rushing stats
    rushing_attempts: number;
    rushing_yards: number;
    rushing_touchdowns: number;
    rushing_avg_yards: number;
    // Passing stats
    passing_attempts: number;
    passing_completions: number;
    passing_yards: number;
    passing_touchdowns: number;
    passing_interceptions: number;
    passing_avg_yards: number;
    // Receiving stats
    receptions: number;
    receiving_yards: number;
    receiving_touchdowns: number;
    // Defense stats
    tackles: number;
    sacks: number;
    interceptions: number;
    fumbles_recovered: number;
    // Team stats
    first_downs: number;
    third_down_conversions: number;
    third_down_attempts: number;
    fourth_down_conversions: number;
    fourth_down_attempts: number;
    penalties: number;
    penalty_yards: number;
    turnovers: number;
    possession_time: string;
  };
  leaders?: {
    passing?: NCAAFBPlayerLeader[];
    rushing?: NCAAFBPlayerLeader[];
    receiving?: NCAAFBPlayerLeader[];
  };
}

export interface NCAAFBPlayerLeader extends Player {
  statistics: {
    passing_yards?: number;
    passing_touchdowns?: number;
    rushing_yards?: number;
    rushing_touchdowns?: number;
    receiving_yards?: number;
    receptions?: number;
  };
}

export interface NCAAFBStandings {
  season: {
    id: string;
    year: number;
    type: 'REG' | 'PST' | 'PRE';
  };
  conferences: Array<{
    id: string;
    name: string;
    alias: string;
    divisions?: Array<{
      id: string;
      name: string;
      alias: string;
      teams: NCAAFBTeamRecord[];
    }>;
  }>;
}

export interface NCAAFBTeamRecord {
  id: string;
  name: string;
  market: string;
  alias: string;
  wins: number;
  losses: number;
  win_pct: number;
  points_for: number;
  points_against: number;
  conf_wins?: number;
  conf_losses?: number;
  streak?: {
    kind: 'win' | 'loss';
    length: number;
  };
  records?: {
    home?: Record;
    away?: Record;
    conference?: Record;
  };
}

export interface NCAAFBDailySchedule {
  league: {
    id: string;
    name: string;
    alias: string;
  };
  date: string;
  games: NCAAFBGame[];
}
