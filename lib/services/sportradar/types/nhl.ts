/**
 * NHL-specific type definitions for Sportradar API
 */

import { Team, Venue, GameStatus, Player } from './common';

export interface NHLSchedule {
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
  games: NHLGame[];
}

export interface NHLGame {
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
}

export interface NHLGameSummary {
  id: string;
  status: GameStatus['status'];
  scheduled: string;
  duration?: string;
  attendance?: number;
  clock?: string;
  period?: number;
  home: NHLTeamStats;
  away: NHLTeamStats;
  venue?: Venue;
}

export interface NHLTeamStats {
  id: string;
  name: string;
  alias: string;
  market: string;
  points: number;
  scoring?: Array<{
    sequence: number;
    points: number;
    type: 'period' | 'overtime' | 'shootout';
  }>;
  statistics?: {
    goals: number;
    assists: number;
    penalties: number;
    penalty_minutes: number;
    shots: number;
    blocked_att: number;
    missed_shots: number;
    hits: number;
    giveaways: number;
    takeaways: number;
    blocked_shots: number;
    faceoffs_won: number;
    faceoffs_lost: number;
    faceoff_win_pct: number;
    powerplays: number;
    powerplay_goals: number;
    powerplay_opportunities: number;
    powerplay_pct: number;
    shorthanded_goals: number;
    goaltending: {
      shots_against: number;
      goals_against: number;
      saves: number;
      save_pct: number;
    };
  };
  leaders?: {
    points?: NHLPlayerLeader[];
    goals?: NHLPlayerLeader[];
    assists?: NHLPlayerLeader[];
  };
}

export interface NHLPlayerLeader extends Player {
  statistics: {
    goals?: number;
    assists?: number;
    points?: number;
  };
}

export interface NHLStandings {
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
      teams: NHLTeamRecord[];
    }>;
  }>;
}

export interface NHLTeamRecord {
  id: string;
  name: string;
  market: string;
  alias: string;
  wins: number;
  losses: number;
  ot_losses: number;
  points: number;
  points_pct: number;
  games_played: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  streak: {
    kind: 'win' | 'loss' | 'ot';
    length: number;
  };
  records?: {
    home?: { wins: number; losses: number; ot_losses: number };
    away?: { wins: number; losses: number; ot_losses: number };
    conference?: { wins: number; losses: number; ot_losses: number };
    division?: { wins: number; losses: number; ot_losses: number };
  };
}

export interface NHLDailySchedule {
  league: {
    id: string;
    name: string;
    alias: string;
  };
  date: string;
  games: NHLGame[];
}
