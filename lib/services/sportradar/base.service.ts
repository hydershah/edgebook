/**
 * Base Sportradar Service
 * Handles authentication and HTTP requests to Sportradar API
 */

export interface SportradarConfig {
  apiKey: string;
  baseUrls: {
    nba: string;
    mlb: string;
    nhl: string;
    nfl: string;
    soccer: string;
    ncaafb: string;
    ncaamb: string;
  };
}

export class SportradarBaseService {
  protected apiKey: string;
  protected baseUrls: SportradarConfig['baseUrls'];

  constructor() {
    // Lazy-load API key to avoid build-time errors
    // The key will be validated when the first request is made
    const apiKey = process.env.SPORTRADAR_API_KEY || '';

    this.apiKey = apiKey;
    this.baseUrls = {
      nba: 'https://api.sportradar.com/nba/trial/v8/en',
      mlb: 'https://api.sportradar.com/mlb/trial/v8/en',
      nhl: 'https://api.sportradar.com/nhl/trial/v7/en',
      nfl: 'https://api.sportradar.com/nfl/official/trial/v7/en',
      soccer: 'https://api.sportradar.com/soccer-t3/global/trial/v4/en',
      ncaafb: 'https://api.sportradar.com/ncaafb/trial/v7/en',
      ncaamb: 'https://api.sportradar.com/ncaamb/trial/v8/en',
    };
  }

  /**
   * Validates that the API key is configured
   */
  protected validateApiKey(): void {
    if (!this.apiKey) {
      throw new Error('SPORTRADAR_API_KEY is not configured');
    }
  }

  /**
   * Makes an authenticated request to Sportradar API
   */
  protected async request<T>(
    sport: keyof SportradarConfig['baseUrls'],
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Validate API key before making requests
    this.validateApiKey();

    const baseUrl = this.baseUrls[sport];
    const url = `${baseUrl}${endpoint}?api_key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new SportradarError(
          `Sportradar API error: ${response.status} ${response.statusText}`,
          response.status,
          errorText
        );
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof SportradarError) {
        throw error;
      }
      throw new SportradarError(
        `Failed to fetch from Sportradar: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  /**
   * Formats a date to YYYY-MM-DD format for API requests
   */
  protected formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Formats a date to YYYY/MM/DD format (used by some endpoints)
   */
  protected formatDateSlash(date: Date): string {
    const [year, month, day] = this.formatDate(date).split('-');
    return `${year}/${month}/${day}`;
  }
}

/**
 * Custom error class for Sportradar API errors
 */
export class SportradarError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: string
  ) {
    super(message);
    this.name = 'SportradarError';
  }
}
