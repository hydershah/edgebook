/**
 * NBA-specific type definitions for Sportradar API
 */

import { Team, Venue, GameStatus, Player, Record } from './common';

export interface NBASchedule {
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
  games: NBAGame[];
}

export interface NBAGame {
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
  track_on_court?: boolean;
  sr_id?: string;
  reference?: string;
  neutral_site?: boolean;
}

export interface NBAGameSummary {
  id: string;
  status: GameStatus['status'];
  scheduled: string;
  duration?: string;
  attendance?: number;
  lead_changes?: number;
  times_tied?: number;
  clock?: string;
  quarter?: number;
  home: NBATeamStats;
  away: NBATeamStats;
  venue?: Venue;
}

export interface NBATeamStats {
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
    field_goals_made: number;
    field_goals_att: number;
    field_goals_pct: number;
    three_points_made: number;
    three_points_att: number;
    three_points_pct: number;
    free_throws_made: number;
    free_throws_att: number;
    free_throws_pct: number;
    rebounds: number;
    offensive_rebounds: number;
    defensive_rebounds: number;
    assists: number;
    turnovers: number;
    steals: number;
    blocks: number;
    personal_fouls: number;
    points: number;
  };
  leaders?: {
    points?: NBAPlayerLeader[];
    rebounds?: NBAPlayerLeader[];
    assists?: NBAPlayerLeader[];
  };
}

export interface NBAPlayerLeader extends Player {
  statistics: {
    points?: number;
    rebounds?: number;
    assists?: number;
  };
}

export interface NBAStandings {
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
      teams: NBATeamRecord[];
    }>;
  }>;
}

export interface NBATeamRecord {
  id: string;
  name: string;
  market: string;
  alias: string;
  wins: number;
  losses: number;
  win_pct: number;
  games_back: number;
  points_for: number;
  points_against: number;
  streak: {
    kind: 'win' | 'loss';
    length: number;
  };
  records?: {
    home?: Record;
    away?: Record;
    conference?: Record;
    division?: Record;
  };
}

export interface NBADailySchedule {
  league: {
    id: string;
    name: string;
    alias: string;
  };
  date: string;
  games: NBAGame[];
}
