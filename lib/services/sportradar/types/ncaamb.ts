/**
 * NCAA Men's Basketball (NCAAMB) type definitions for Sportradar API v8
 */

import { Team, Venue, GameStatus, Player, Record } from './common';

export interface NCAAMBSchedule {
  league: {
    id: string;
    name: string;
    alias: string;
  };
  season: {
    id: string;
    year: number;
    type: 'REG' | 'PST' | 'CT'; // CT = Conference Tournament
  };
  games: NCAAMBGame[];
}

export interface NCAAMBGame {
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
  conference_game?: boolean;
  tournament?: string;
  tournament_round?: string;
}

export interface NCAAMBGameSummary {
  id: string;
  status: GameStatus['status'];
  scheduled: string;
  duration?: string;
  attendance?: number;
  lead_changes?: number;
  times_tied?: number;
  clock?: string;
  half?: number;
  home: NCAAMBTeamStats;
  away: NCAAMBTeamStats;
  venue?: Venue;
}

export interface NCAAMBTeamStats {
  id: string;
  name: string;
  alias: string;
  market: string;
  points: number;
  scoring?: Array<{
    sequence: number;
    points: number;
    type: 'half' | 'overtime';
  }>;
  statistics?: {
    field_goals_made: number;
    field_goals_att: number;
    field_goals_pct: number;
    three_points_made: number;
    three_points_att: number;
    three_points_pct: number;
    two_points_made: number;
    two_points_att: number;
    two_points_pct: number;
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
    tech_fouls: number;
    points: number;
    fast_break_pts: number;
    second_chance_pts: number;
    points_in_paint: number;
  };
  leaders?: {
    points?: NCAAMBPlayerLeader[];
    rebounds?: NCAAMBPlayerLeader[];
    assists?: NCAAMBPlayerLeader[];
  };
}

export interface NCAAMBPlayerLeader extends Player {
  statistics: {
    points?: number;
    rebounds?: number;
    assists?: number;
    field_goals_made?: number;
    field_goals_att?: number;
  };
}

export interface NCAAMBStandings {
  season: {
    id: string;
    year: number;
    type: 'REG' | 'PST' | 'CT';
  };
  conferences: Array<{
    id: string;
    name: string;
    alias: string;
    divisions?: Array<{
      id: string;
      name: string;
      alias: string;
      teams: NCAAMBTeamRecord[];
    }>;
  }>;
}

export interface NCAAMBTeamRecord {
  id: string;
  name: string;
  market: string;
  alias: string;
  wins: number;
  losses: number;
  win_pct: number;
  games_back?: number;
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

export interface NCAAMBDailySchedule {
  league: {
    id: string;
    name: string;
    alias: string;
  };
  date: string;
  games: NCAAMBGame[];
}
