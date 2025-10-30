/**
 * Common types shared across all Sportradar sports APIs
 */

export interface Team {
  id: string;
  name: string;
  alias: string;
  market: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  zip?: string;
  address?: string;
  capacity?: number;
}

export interface Broadcast {
  network: string;
  satellite?: string;
}

export interface GameStatus {
  status: 'scheduled' | 'inprogress' | 'complete' | 'closed' | 'cancelled' | 'delayed' | 'postponed';
  scheduled?: string;
  attendance?: number;
  clock?: string;
  period?: number;
}

export interface Score {
  home: number;
  away: number;
}

export interface Record {
  wins: number;
  losses: number;
  win_pct?: number;
  points_for?: number;
  points_against?: number;
}

export interface Player {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  jersey_number?: string;
  position?: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}
