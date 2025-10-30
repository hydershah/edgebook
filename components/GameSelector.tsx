'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface Game {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  scheduled: string;
  status: string;
  venue?: string;
}

interface GameSelectorProps {
  sport: string;
  onGameSelect: (game: Game) => void;
  selectedGameId?: string;
}

export default function GameSelector({ sport, onGameSelect, selectedGameId }: GameSelectorProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);

  // Fetch games when sport changes
  useEffect(() => {
    if (sport) {
      fetchGames(sport);
    } else {
      setGames([]);
      setFilteredGames([]);
    }
  }, [sport]);

  // Check if a game is pickable (not started, not completed)
  function isGamePickable(game: Game): boolean {
    const status = game.status.toLowerCase();

    // Exclude ongoing and completed games
    if (status === 'inprogress' || status === 'complete' || status === 'closed' || status === 'halftime') {
      return false;
    }

    // Exclude past games (scheduled time has passed)
    const scheduledTime = new Date(game.scheduled);
    const now = new Date();
    if (scheduledTime < now) {
      return false;
    }

    return true;
  }

  // Filter games when search query changes
  useEffect(() => {
    // First filter out non-pickable games
    const pickableGames = games.filter(isGamePickable);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = pickableGames.filter(
        (game) =>
          game.homeTeam.toLowerCase().includes(query) ||
          game.awayTeam.toLowerCase().includes(query) ||
          game.venue?.toLowerCase().includes(query)
      );
      setFilteredGames(filtered);
    } else {
      setFilteredGames(pickableGames);
    }
  }, [searchQuery, games]);

  async function fetchGames(selectedSport: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sportradar/schedule/${selectedSport.toLowerCase()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }

      const data = await response.json();

      if (data.success) {
        setGames(data.data || []);
        setFilteredGames(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to load games');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
      setGames([]);
      setFilteredGames([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
    } else if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <span className="text-xs text-gray-500">Scheduled</span>;
      case 'inprogress':
        return (
          <span className="flex items-center gap-1 text-xs text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            LIVE
          </span>
        );
      case 'complete':
      case 'closed':
        return <span className="text-xs text-gray-400">Final</span>;
      default:
        return <span className="text-xs text-gray-500">{status}</span>;
    }
  }

  if (!sport) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Select a sport to view available games</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading games...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => fetchGames(sport)}
          className="mt-2 text-sm text-red-700 underline hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (filteredGames.length === 0 && games.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No upcoming games found for {sport}</p>
        <p className="text-xs mt-2">Only scheduled games that haven&apos;t started are available for picks</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Games Count */}
      <div className="text-sm text-gray-600">
        {filteredGames.length} pickable game{filteredGames.length !== 1 ? 's' : ''} available
        {games.length > filteredGames.length && (
          <span className="text-xs text-gray-500 ml-2">
            ({games.length - filteredGames.length} game{(games.length - filteredGames.length) !== 1 ? 's' : ''} in progress or completed)
          </span>
        )}
      </div>

      {/* Games List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredGames.map((game) => (
          <button
            key={game.id}
            onClick={() => onGameSelect(game)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              selectedGameId === game.id
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Teams */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {game.awayTeam}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <span>@</span>
                  <span className="font-medium text-gray-700">{game.homeTeam}</span>
                </div>

                {/* Date & Venue */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{formatDate(game.scheduled)}</span>
                  </div>
                  {game.venue && (
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="h-3 w-3" />
                      <span className="truncate">{game.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {getStatusBadge(game.status)}
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedGameId === game.id && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <span className="text-xs text-green-700 font-medium">
                  ✓ Selected
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* No Results */}
      {filteredGames.length === 0 && games.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? (
            <>
              <p>No games found for &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm text-green-600 underline hover:text-green-700"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <p>All games have started or are completed</p>
              <p className="text-xs mt-2">Only scheduled games that haven&apos;t started can be picked</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
