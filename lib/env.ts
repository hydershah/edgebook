/**
 * Environment variable validation utilities
 * Ensures all required environment variables are properly configured
 */

export class EnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvError';
  }
}

/**
 * Validates required environment variables and throws if missing
 */
export function requireEnv(key: string, serviceName?: string): string {
  const value = process.env[key];
  if (!value) {
    const service = serviceName ? ` for ${serviceName}` : '';
    throw new EnvError(
      `Missing required environment variable: ${key}${service}. ` +
      `Please configure this in your .env file.`
    );
  }
  return value;
}

/**
 * Gets an optional environment variable with a default fallback
 */
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Checks if an environment variable is configured
 */
export function hasEnv(key: string): boolean {
  return !!process.env[key];
}

/**
 * Validates AWS S3 configuration
 */
export function validateS3Config(): {
  isConfigured: boolean;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucket?: string;
  error?: string;
} {
  try {
    const region = requireEnv('AWS_REGION', 'AWS S3');
    const accessKeyId = requireEnv('AWS_ACCESS_KEY_ID', 'AWS S3');
    const secretAccessKey = requireEnv('AWS_SECRET_ACCESS_KEY', 'AWS S3');
    const bucket = requireEnv('AWS_S3_BUCKET', 'AWS S3');

    return {
      isConfigured: true,
      region,
      accessKeyId,
      secretAccessKey,
      bucket,
    };
  } catch (error) {
    if (error instanceof EnvError) {
      return {
        isConfigured: false,
        error: error.message,
      };
    }
    throw error;
  }
}

/**
 * Validates Resend email configuration
 */
export function validateEmailConfig(): {
  isConfigured: boolean;
  apiKey?: string;
  baseUrl?: string;
  error?: string;
} {
  try {
    const apiKey = requireEnv('RESEND_API_KEY', 'Resend Email Service');
    const baseUrl = requireEnv('NEXTAUTH_URL', 'Email Links');

    return {
      isConfigured: true,
      apiKey,
      baseUrl,
    };
  } catch (error) {
    if (error instanceof EnvError) {
      return {
        isConfigured: false,
        error: error.message,
      };
    }
    throw error;
  }
}

/**
 * Validates Stripe configuration
 */
export function validateStripeConfig(): {
  isConfigured: boolean;
  secretKey?: string;
  error?: string;
} {
  try {
    const secretKey = requireEnv('STRIPE_SECRET_KEY', 'Stripe Payment Service');

    return {
      isConfigured: true,
      secretKey,
    };
  } catch (error) {
    if (error instanceof EnvError) {
      return {
        isConfigured: false,
        error: error.message,
      };
    }
    throw error;
  }
}

/**
 * Validates OpenAI configuration
 */
export function validateOpenAIConfig(): {
  isConfigured: boolean;
  apiKey?: string;
  error?: string;
} {
  try {
    const apiKey = requireEnv('OPENAI_API_KEY', 'OpenAI Service');

    return {
      isConfigured: true,
      apiKey,
    };
  } catch (error) {
    if (error instanceof EnvError) {
      return {
        isConfigured: false,
        error: error.message,
      };
    }
    throw error;
  }
}
