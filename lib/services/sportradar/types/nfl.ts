/**
 * NFL-specific type definitions for Sportradar API
 */

import { Team, Venue, GameStatus, Player } from './common';

export interface NFLSchedule {
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
  weeks: Array<{
    id: string;
    sequence: number;
    title: string;
    games: NFLGame[];
  }>;
}

export interface NFLGame {
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
  home_points?: number;
  away_points?: number;
  sr_id?: string;
  reference?: string;
  weather?: {
    condition?: string;
    temp?: number;
    humidity?: number;
    wind?: {
      speed?: number;
      direction?: string;
    };
  };
}

export interface NFLGameSummary {
  id: string;
  status: GameStatus['status'];
  scheduled: string;
  duration?: string;
  attendance?: number;
  clock?: string;
  quarter?: number;
  home: NFLTeamStats;
  away: NFLTeamStats;
  venue?: Venue;
  weather?: NFLGame['weather'];
}

export interface NFLTeamStats {
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
    rushing: {
      yards: number;
      attempts: number;
      avg_yards: number;
      touchdowns: number;
      longest: number;
    };
    receiving: {
      yards: number;
      receptions: number;
      avg_yards: number;
      touchdowns: number;
      longest: number;
      targets: number;
    };
    passing: {
      yards: number;
      completions: number;
      attempts: number;
      completion_pct: number;
      touchdowns: number;
      interceptions: number;
      sacks: number;
      rating: number;
    };
    defense: {
      tackles: number;
      assists: number;
      sacks: number;
      sack_yards: number;
      interceptions: number;
      forced_fumbles: number;
      fumble_recoveries: number;
    };
    first_downs: number;
    third_down_conversions: number;
    third_down_attempts: number;
    fourth_down_conversions: number;
    fourth_down_attempts: number;
    penalties: number;
    penalty_yards: number;
    turnovers: number;
    possession_time: string;
    total_yards: number;
  };
}

export interface NFLStandings {
  season: {
    id: string;
    year: number;
    type: 'REG' | 'PST' | 'PRE';
  };
  conferences: Array<{
    id: string;
    name: string;
    alias: string;
    divisions: Array<{
      id: string;
      name: string;
      alias: string;
      teams: NFLTeamRecord[];
    }>;
  }>;
}

export interface NFLTeamRecord {
  id: string;
  name: string;
  market: string;
  alias: string;
  wins: number;
  losses: number;
  ties: number;
  win_pct: number;
  points_for: number;
  points_against: number;
  point_diff: number;
  streak: {
    kind: 'win' | 'loss' | 'tie';
    length: number;
  };
  records?: {
    home?: { wins: number; losses: number; ties: number };
    away?: { wins: number; losses: number; ties: number };
    conference?: { wins: number; losses: number; ties: number };
    division?: { wins: number; losses: number; ties: number };
  };
}

export interface NFLWeekSchedule {
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
  week: {
    id: string;
    sequence: number;
    title: string;
  };
  games: NFLGame[];
}
