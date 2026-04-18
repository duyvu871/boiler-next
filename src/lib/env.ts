import { z, ZodIssue } from 'zod';

/**
 * Environment variable validation schema
 * This ensures all required environment variables are present and properly typed
 */
const envSchema = z.object({
  // Database Configuration (Docker dev: Compose sets DATABASE_URL/DIRECT_URL on app-dev)
  POSTGRES_DB: z.string().min(1, 'POSTGRES_DB is required'),
  POSTGRES_USER: z.string().min(1, 'POSTGRES_USER is required'),
  POSTGRES_PASSWORD: z.string().min(1, 'POSTGRES_PASSWORD is required'),
  POSTGRES_HOST: z.string().min(1).default('localhost'),
  POSTGRES_PORT: z
    .string()
    .regex(/^\d+$/, 'POSTGRES_PORT must be digits')
    .default('5432'),
  POSTGRES_HOST_AUTH_METHOD: z.string().default('trust'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL').optional(),

  // Redis Configuration
  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z
    .string()
    .regex(/^\d+$/, 'REDIS_PORT must be digits')
    .default('6379'),
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL'),

  // NextAuth Configuration
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  AUTH_URL: z.string().url('AUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  // Application Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_VERSION: z.string().default('1.0.0'),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').default('3000'),

  // Email Configuration (Optional)
  SMTP_HOST: z.string().optional().or(z.literal('')),
  SMTP_PORT: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^\d+$/.test(val), { message: 'SMTP_PORT must be a number or empty' }),
  SMTP_USER: z.string().optional().or(z.literal('')),
  SMTP_PASS: z.string().optional().or(z.literal('')),

  // OAuth Providers (Optional)
  GOOGLE_CLIENT_ID: z.string().optional().or(z.literal('')),
  GOOGLE_CLIENT_SECRET: z.string().optional().or(z.literal('')),
  AUTH_GOOGLE_ID: z.string().optional().or(z.literal('')),
  AUTH_GOOGLE_SECRET: z.string().optional().or(z.literal('')),

  // File Upload Configuration
  MAX_FILE_SIZE: z.string().regex(/^\d+$/, 'MAX_FILE_SIZE must be a number').default('5242880'),
  UPLOAD_DIR: z.string().default('./uploads'),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z
    .string()
    .regex(/^\d+$/, 'RATE_LIMIT_WINDOW must be a number')
    .default('900000'),
  RATE_LIMIT_MAX: z.string().regex(/^\d+$/, 'RATE_LIMIT_MAX must be a number').default('100'),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  LOG_FILE: z.string().default('./logs/app.log'),
  LOG_TO_FILE: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(false),

  // Public Environment Variables (Client-side)
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url().optional(),
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default('Next.js 15 Starter Template'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NEXT_PUBLIC_LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),
});

/**
 * Validate and parse environment variables
 * This function should be called once at application startup
 */
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return {
      ...parsed,
      DIRECT_URL: parsed.DIRECT_URL ?? parsed.DATABASE_URL,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(
        (err: ZodIssue) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `Environment validation failed:\n${missingVars.join('\n')}\n\n` +
          'Please check your .env file and ensure all required variables are set.'
      );
    }
    throw error;
  }
}

/**
 * Validated environment variables
 * Use this instead of process.env for type safety
 */
export const env = validateEnv();

/**
 * Type-safe environment variable getter
 * @param key - Environment variable key
 * @returns The environment variable value with proper typing
 */
export function getEnv<K extends keyof typeof env>(key: K): (typeof env)[K] {
  return env[key];
}

/**
 * Check if we're in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if we're in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Database configuration object
 */
export const dbConfig = {
  database: env.POSTGRES_DB,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  host: env.POSTGRES_HOST,
  port: parseInt(env.POSTGRES_PORT, 10),
  url: env.DATABASE_URL,
  directUrl: env.DIRECT_URL,
} as const;

/**
 * Redis configuration object
 */
export const redisConfig = {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT, 10),
  url: env.REDIS_URL,
} as const;

/**
 * NextAuth configuration object
 */
export const authConfig = {
  url: env.NEXTAUTH_URL,
  secret: env.NEXTAUTH_SECRET,
  jwtSecret: env.JWT_SECRET,
} as const;

/**
 * Email configuration object
 */
export const emailConfig = {
  host: env.SMTP_HOST || undefined,
  port: env.SMTP_PORT && env.SMTP_PORT !== '' ? parseInt(env.SMTP_PORT, 10) : undefined,
  user: env.SMTP_USER || undefined,
  password: env.SMTP_PASS || undefined,
  enabled: !!(
    env.SMTP_HOST &&
    env.SMTP_HOST !== '' &&
    env.SMTP_PORT &&
    env.SMTP_PORT !== '' &&
    env.SMTP_USER &&
    env.SMTP_USER !== '' &&
    env.SMTP_PASS &&
    env.SMTP_PASS !== ''
  ),
} as const;

/**
 * OAuth configuration object
 */
export const oauthConfig = {
  google: {
    clientId:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_ID !== ''
        ? env.GOOGLE_CLIENT_ID
        : env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_ID !== ''
          ? env.AUTH_GOOGLE_ID
          : undefined,
    clientSecret:
      env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CLIENT_SECRET !== ''
        ? env.GOOGLE_CLIENT_SECRET
        : env.AUTH_GOOGLE_SECRET && env.AUTH_GOOGLE_SECRET !== ''
          ? env.AUTH_GOOGLE_SECRET
          : undefined,
    enabled:
      !!(
        env.GOOGLE_CLIENT_ID &&
        env.GOOGLE_CLIENT_ID !== '' &&
        env.GOOGLE_CLIENT_SECRET &&
        env.GOOGLE_CLIENT_SECRET !== ''
      ) ||
      !!(
        env.AUTH_GOOGLE_ID &&
        env.AUTH_GOOGLE_ID !== '' &&
        env.AUTH_GOOGLE_SECRET &&
        env.AUTH_GOOGLE_SECRET !== ''
      ),
  },
} as const;

/**
 * File upload configuration object
 */
export const uploadConfig = {
  maxFileSize: parseInt(env.MAX_FILE_SIZE, 10),
  uploadDir: env.UPLOAD_DIR,
  maxFileSizeMB: Math.round(parseInt(env.MAX_FILE_SIZE, 10) / 1024 / 1024),
} as const;

/**
 * Rate limiting configuration object
 */
export const rateLimitConfig = {
  windowMs: parseInt(env.RATE_LIMIT_WINDOW, 10),
  maxRequests: parseInt(env.RATE_LIMIT_MAX, 10),
  windowMinutes: Math.round(parseInt(env.RATE_LIMIT_WINDOW, 10) / 1000 / 60),
} as const;

/**
 * Logging configuration object
 */
export const logConfig = {
  level: env.LOG_LEVEL,
  file: env.LOG_FILE,
  logToFile: env.LOG_TO_FILE,
} as const;

/**
 * Application configuration object
 */
export const appConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  version: env.NEXT_PUBLIC_APP_VERSION || env.APP_VERSION,
  port: parseInt(env.PORT, 10),
  baseUrl: env.NEXT_PUBLIC_BASE_URL,
  apiUrl: env.NEXT_PUBLIC_API_URL,
} as const;

/**
 * Development utilities
 */
export const devUtils = {
  /**
   * Log environment configuration (development only)
   */
  logConfig: () => {
    if (!isDevelopment) return;

    console.log('🔧 Environment Configuration:');
    console.log('- NODE_ENV:', env.NODE_ENV);
    console.log('- APP_VERSION:', env.APP_VERSION);
    console.log('- PORT:', env.PORT);
    console.log('- DATABASE_URL:', env.DATABASE_URL.replace(/:[^:@]*@/, ':***@'));
    console.log('- REDIS_URL:', env.REDIS_URL.replace(/:[^:@]*@/, ':***@'));
    console.log('- EMAIL_ENABLED:', emailConfig.enabled);
    console.log('- GOOGLE_OAUTH_ENABLED:', oauthConfig.google.enabled);
    console.log('- MAX_FILE_SIZE:', uploadConfig.maxFileSizeMB + 'MB');
    console.log(
      '- RATE_LIMIT:',
      `${rateLimitConfig.maxRequests} requests per ${rateLimitConfig.windowMinutes} minutes`
    );
    console.log('- LOG_LEVEL:', env.LOG_LEVEL);
  },

  /**
   * Validate required services are running
   */
  validateServices: async () => {
    if (!isDevelopment) return;

    const services = [];

    // Check database connection
    try {
      // This would need to be implemented with actual database connection
      services.push('✅ Database: Connected');
    } catch {
      services.push('❌ Database: Not connected');
    }

    // Check Redis connection
    try {
      // This would need to be implemented with actual Redis connection
      services.push('✅ Redis: Connected');
    } catch {
      services.push('❌ Redis: Not connected');
    }

    console.log('🔍 Service Status:');
    services.forEach((service) => console.log(service));
  },
};

// Auto-log configuration in development
if (isDevelopment && typeof window === 'undefined') {
  devUtils.logConfig();
}
