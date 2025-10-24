import { createErrorContext } from "./utils";

// Server-side error handler for API routes
export function createServerErrorHandler() {
  return async (
    error: Error | unknown,
    context?: {
      request?: Request;
      url?: string;
      method?: string;
      user_id?: string;
      session_id?: string;
    }
  ) => {
    const { getServerErrorLogger } = await import("./logger");
    const logger = await getServerErrorLogger();

    const errorContext = createErrorContext({
      url: context?.url || context?.request?.url,
      method: context?.method || context?.request?.method,
      user_id: context?.user_id,
      session_id: context?.session_id,
      metadata: {
        serverError: true,
        userAgent: context?.request?.headers.get("user-agent"),
        referer: context?.request?.headers.get("referer"),
      },
    });

    await logger.logServerError(error, errorContext);
  };
}

// Next.js API route error handler wrapper
export function withApiErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => R | Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      const serverErrorHandler = await createServerErrorHandler();

      // Extract request context from Next.js API route
      const request = args[0] as Request;
      const context = {
        request,
        url: request.url,
        method: request.method,
      };

      await serverErrorHandler(error, context);
      throw error;
    }
  };
}

