import { redirect } from 'next/navigation';
import {
  handleError,
  actionError,
  apiError,
  type ApiResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from './response';
import { logError, logServerAction, logApiRequest } from './log';
import { NextResponse } from 'next/server';

// Type for Server Actions
type ServerAction<T extends unknown[], R> = (...args: T) => Promise<R>;
type ServerActionWithErrorHandling<T extends unknown[], R> = (
  ...args: T
) => Promise<ApiResponse<R>>;

// Type for API Route handlers
type ApiHandler<T = unknown> = (
  request: Request,
  context?: Record<string, unknown>
) => Promise<NextResponse>;

// Server Action Error Handling HOC
export function withServerActionErrorHandling<T extends unknown[], R>(
  action: ServerAction<T, R>,
  options?: {
    redirectOnError?: string;
    logErrors?: boolean;
  }
): ServerActionWithErrorHandling<T, R> {
  return async (...args: T): Promise<ApiResponse<R>> => {
    const startTime = Date.now();
    let success = false;

    try {
      const result = await action(...args);
      success = true;

      // Log successful execution
      const duration = Date.now() - startTime;
      logServerAction(action.name || 'anonymous', true, duration, undefined, {
        argsCount: args.length,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const errorInfo = handleError(error);
      const duration = Date.now() - startTime;

      // Log error with Winston
      if (options?.logErrors !== false) {
        logError(error instanceof Error ? error : new Error(String(error)), {
          action: action.name || 'anonymous',
          code: errorInfo.code,
          details: errorInfo.details,
          args: process.env.NODE_ENV === 'development' ? args : '[HIDDEN]',
          duration: `${duration}ms`,
        });
      }

      // Log server action execution
      logServerAction(action.name || 'anonymous', false, duration, undefined, {
        errorCode: errorInfo.code,
        argsCount: args.length,
      });

      // Handle authentication errors with redirect
      if (errorInfo.code === ERROR_CODES.UNAUTHORIZED && options?.redirectOnError) {
        redirect(options.redirectOnError);
      }

      return actionError(errorInfo.code, errorInfo.message, errorInfo.details);
    }
  };
}

// API Route Error Handling HOC
export function withApiErrorHandling(
  handler: ApiHandler,
  options?: {
    logErrors?: boolean;
    enableCors?: boolean;
  }
): ApiHandler {
  return async (request: Request, context?: Record<string, unknown>): Promise<NextResponse> => {
    const startTime = Date.now();
    let statusCode = 200;

    try {
      const response = await handler(request, context);
      statusCode = response.status;

      // Log successful API request
      const duration = Date.now() - startTime;
      logApiRequest(
        request.method,
        request.url,
        statusCode,
        duration,
        undefined, // userId would need to be extracted from request
        {
          userAgent: request.headers.get('user-agent'),
        }
      );

      // Add CORS headers if enabled
      if (options?.enableCors) {
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }

      return response;
    } catch (error) {
      const errorInfo = handleError(error);
      statusCode = errorInfo.statusCode;
      const duration = Date.now() - startTime;

      // Log error with Winston
      if (options?.logErrors !== false) {
        logError(error instanceof Error ? error : new Error(String(error)), {
          method: request.method,
          url: request.url,
          userAgent: request.headers.get('user-agent'),
          code: errorInfo.code,
          details: errorInfo.details,
          duration: `${duration}ms`,
        });
      }

      // Log API request with error
      logApiRequest(
        request.method,
        request.url,
        statusCode,
        duration,
        undefined, // userId would need to be extracted from request
        {
          userAgent: request.headers.get('user-agent'),
          errorCode: errorInfo.code,
        }
      );

      const response = apiError(
        errorInfo.code,
        errorInfo.message,
        errorInfo.statusCode,
        errorInfo.details
      );

      // Add CORS headers if enabled
      if (options?.enableCors) {
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }

      return response;
    }
  };
}

// Specialized HOCs for different scenarios

// Auth-required Server Action
export function withAuthServerAction<T extends unknown[], R>(
  action: ServerAction<T, R>,
  options?: {
    redirectTo?: string;
    requiredRoles?: string[];
  }
) {
  return withServerActionErrorHandling(action, {
    redirectOnError: options?.redirectTo || '/auth/login',
    logErrors: true,
  });
}

// Rate-limited API Route
export function withRateLimitedApi(
  handler: ApiHandler,
  options?: {
    maxRequests?: number;
    windowMs?: number;
  }
) {
  // This would integrate with your rate limiting logic
  return withApiErrorHandling(handler, {
    logErrors: true,
    enableCors: false,
  });
}

// Validation-enabled Server Action
export function withValidatedServerAction<T extends unknown[], R>(
  action: ServerAction<T, R>,
  validator?: (args: T) => void | Promise<void>
) {
  return withServerActionErrorHandling(async (...args: T): Promise<R> => {
    if (validator) {
      await validator(args);
    }
    return action(...args);
  });
}

// CORS-enabled API Route
export function withCorsApi(handler: ApiHandler) {
  return withApiErrorHandling(handler, {
    enableCors: true,
    logErrors: true,
  });
}

// Development-only enhanced logging
export function withDevLogging<T extends unknown[], R>(
  action: ServerAction<T, R>
): ServerAction<T, R> {
  if (process.env.NODE_ENV !== 'development') {
    return action;
  }

  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    console.log(`🚀 Starting action: ${action.name}`, {
      args: args.length > 0 ? args : 'no args',
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await action(...args);
      const duration = Date.now() - startTime;

      console.log(`✅ Action completed: ${action.name}`, {
        duration: `${duration}ms`,
        resultType: typeof result,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      console.error(`❌ Action failed: ${action.name}`, {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };
}
