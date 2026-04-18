declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// Database Configuration
			POSTGRES_DB: string;
			POSTGRES_USER: string;
			POSTGRES_PASSWORD: string;
			POSTGRES_HOST?: string;
			POSTGRES_PORT?: string;
			POSTGRES_HOST_AUTH_METHOD: string;
			DATABASE_URL: string;
			DIRECT_URL?: string;

			// Redis Configuration
			REDIS_HOST?: string;
			REDIS_PORT?: string;
			REDIS_URL: string;

			// NextAuth Configuration
			NEXTAUTH_URL: string;
			AUTH_URL: string;
			NEXTAUTH_SECRET: string;

			// JWT Configuration
			JWT_SECRET: string;

			// Application Configuration
			NODE_ENV: 'development' | 'production' | 'test';
			APP_VERSION: string;
			PORT?: string;

			// Email Configuration (Optional)
			SMTP_HOST?: string;
			SMTP_PORT?: string;
			SMTP_USER?: string;
			SMTP_PASS?: string;

			// OAuth Providers (Optional)
			GOOGLE_CLIENT_ID?: string;
			GOOGLE_CLIENT_SECRET?: string;

			// File Upload Configuration
			MAX_FILE_SIZE: string;
			UPLOAD_DIR: string;

			// Rate Limiting
			RATE_LIMIT_WINDOW: string;
			RATE_LIMIT_MAX: string;

			// Logging Configuration
			LOG_LEVEL: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
			LOG_FILE: string;
			LOG_TO_FILE?: string;

			// Public Environment Variables (Client-side)
			NEXT_PUBLIC_BASE_URL?: string;
			NEXT_PUBLIC_API_URL?: string;
			NEXT_PUBLIC_SOCKET_URL?: string;
			NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?: string;
			NEXT_PUBLIC_APP_NAME?: string;
			NEXT_PUBLIC_APP_VERSION?: string;
			NEXT_PUBLIC_LOG_LEVEL?: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
		}
	}
}

export {};