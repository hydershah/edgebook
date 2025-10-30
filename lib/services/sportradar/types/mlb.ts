/**
 * MLB-specific type definitions for Sportradar API
 */

import { Team, Venue, GameStatus, Player } from './common';

export interface MLBSchedule {
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
  games: MLBGame[];
}

export interface MLBGame {
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
  home_team?: number;
  away_team?: number;
  double_header?: boolean;
  day_night?: 'D' | 'N';
  reference?: string;
  sr_id?: string;
}

export interface MLBGameSummary {
  id: string;
  status: GameStatus['status'];
  scheduled: string;
  duration?: string;
  attendance?: number;
  clock?: string;
  inning?: number;
  inning_half?: 'T' | 'B';
  home: MLBTeamStats;
  away: MLBTeamStats;
  venue?: Venue;
  probable_pitchers?: {
    home?: MLBPitcher;
    away?: MLBPitcher;
  };
}

export interface MLBTeamStats {
  id: string;
  name: string;
  alias: string;
  market: string;
  runs: number;
  hits: number;
  errors: number;
  scoring?: Array<{
    sequence: number;
    runs: number;
    inning: number;
    half: 'T' | 'B';
  }>;
  statistics?: {
    hitting: {
      runs: number;
      hits: number;
      doubles: number;
      triples: number;
      home_runs: number;
      rbi: number;
      walks: number;
      strikeouts: number;
      stolen_bases: number;
      caught_stealing: number;
      left_on_base: number;
      batting_avg: number;
      obp: number;
      slg: number;
      ops: number;
    };
    pitching: {
      innings_pitched: number;
      hits: number;
      runs: number;
      earned_runs: number;
      walks: number;
      strikeouts: number;
      home_runs: number;
      era: number;
      pitch_count: number;
      strikes: number;
      balls: number;
    };
  };
}

export interface MLBPitcher extends Player {
  preferred_name?: string;
  statistics?: {
    wins: number;
    losses: number;
    era: number;
    innings_pitched: number;
    strikeouts: number;
    walks: number;
    home_runs: number;
  };
}

export interface MLBStandings {
  season: {
    id: string;
    year: number;
    type: 'REG' | 'PST' | 'PRE';
  };
  league: {
    id: string;
    name: string;
    alias: string;
    divisions: Array<{
      id: string;
      name: string;
      alias: string;
      teams: MLBTeamRecord[];
    }>;
  };
}

export interface MLBTeamRecord {
  id: string;
  name: string;
  market: string;
  alias: string;
  wins: number;
  losses: number;
  win_pct: number;
  games_back: number;
  runs_for: number;
  runs_against: number;
  streak: {
    kind: 'win' | 'loss';
    length: number;
  };
  records?: {
    home?: { wins: number; losses: number };
    away?: { wins: number; losses: number };
    division?: { wins: number; losses: number };
    last_10?: { wins: number; losses: number };
  };
}

export interface MLBDailySchedule {
  league: {
    id: string;
    name: string;
    alias: string;
  };
  date: string;
  games: MLBGame[];
}
