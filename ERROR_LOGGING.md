# Centralized Error Logging System

A comprehensive error logging system for your Supabase Next.js application that captures, stores, and manages errors across client and server environments.

## Features

- **Centralized Error Capture**: Automatically captures errors from React components, API routes, and global handlers
- **Supabase Integration**: Stores errors in a dedicated database table with proper RLS policies
- **Error Classification**: Categorizes errors by type and severity
- **Contextual Information**: Captures user context, request details, and environment information
- **Error Dashboard**: Built-in dashboard for viewing and managing errors
- **Batch Processing**: Efficient error logging with batching and retry mechanisms
- **Development Support**: Enhanced error details in development mode

## Quick Start

### 1. Run Database Migration

```bash
npx supabase migration up
```

### 2. Error Logging is Already Integrated

The error logging system is automatically integrated into your app layout and will start capturing errors immediately.

### 3. View Error Dashboard

Navigate to `/error-logs` to view the error dashboard.

## Usage Examples

### Client-Side Error Logging

```typescript
import { useErrorLogger } from "@/lib/error_logging";

function MyComponent() {
  const { logError, logClientError } = useErrorLogger();

  const handleAsyncOperation = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      await logClientError(error, {
        user_id: "user123",
        metadata: { operation: "async_operation" },
      });
    }
  };

  return <button onClick={handleAsyncOperation}>Do Something</button>;
}
```

### Server-Side Error Logging

```typescript
import { withApiErrorHandler } from "@/lib/error_logging";

async function apiHandler(request: NextRequest) {
  // Your API logic here
  throw new Error("Something went wrong");
}

export const GET = withApiErrorHandler(apiHandler);
```

### Manual Error Logging

```typescript
import { getGlobalErrorLogger } from "@/lib/error_logging";

const logger = getGlobalErrorLogger();

try {
  // Some operation
} catch (error) {
  await logger.logError(error, {
    user_id: "user123",
    session_id: "session456",
    metadata: { operation: "manual_logging" },
  });
}
```

### Using Error Boundaries

```typescript
import { ErrorBoundary, withErrorBoundary } from "@/lib/error_logging";

// Wrap a component
const SafeComponent = withErrorBoundary(MyComponent);

// Or use as a component
<ErrorBoundary showErrorDetails={process.env.NODE_ENV === "development"}>
  <MyComponent />
</ErrorBoundary>;
```

## Error Types and Categories

### Severity Levels

- `low`: Minor issues, warnings
- `medium`: Moderate issues that don't break functionality
- `high`: Significant issues that affect functionality
- `critical`: Severe issues that break core functionality

### Error Categories

- `client_error`: Errors occurring in the browser
- `server_error`: Errors occurring on the server
- `database_error`: Database-related errors
- `authentication_error`: Authentication/authorization errors
- `validation_error`: Data validation errors
- `network_error`: Network connectivity issues
- `unknown_error`: Unclassified errors

## Database Schema

The error logging system uses the `error_logs` table with the following structure:

```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY,
  severity VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255),
  request_id VARCHAR(255),
  url TEXT,
  method VARCHAR(10),
  user_agent TEXT,
  ip_address INET,
  timestamp TIMESTAMPTZ NOT NULL,
  environment VARCHAR(50) NOT NULL,
  version VARCHAR(50),
  message TEXT NOT NULL,
  stack TEXT,
  code VARCHAR(50),
  name VARCHAR(100),
  cause JSONB,
  metadata JSONB,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

## Configuration

### Environment Variables

```env
NODE_ENV=production
APP_VERSION=1.0.0
```

### Logger Configuration

```typescript
import { createErrorLogger } from "@/lib/error_logging";

const logger = createErrorLogger({
  enableClientLogging: true,
  enableServerLogging: true,
  enableConsoleLogging: true,
  enableDatabaseLogging: true,
  batchSize: 10,
  flushInterval: 5000,
  maxRetries: 3,
  environment: "production",
  version: "1.0.0",
});
```

## Error Dashboard

The error dashboard provides:

- **Error List**: View all logged errors with filtering options
- **Error Details**: Full error information including stack traces
- **Resolution Management**: Mark errors as resolved
- **Filtering**: Filter by severity, category, resolution status
- **Real-time Updates**: Refresh to see latest errors

## Global Error Handlers

The system automatically captures:

- **Unhandled JavaScript Errors**: Global `error` events
- **Unhandled Promise Rejections**: Global `unhandledrejection` events
- **Resource Loading Errors**: Failed image, script, or other resource loads
- **React Component Errors**: Via error boundaries

## Best Practices

### 1. Use Appropriate Error Categories

```typescript
// Good: Specific error handling
try {
  await validateUserInput(data);
} catch (error) {
  await logError(error, { category: "validation_error" });
}

// Avoid: Generic error handling
try {
  await someOperation();
} catch (error) {
  await logError(error); // Category will be auto-detected
}
```

### 2. Include Relevant Context

```typescript
await logError(error, {
  user_id: user.id,
  session_id: session.id,
  request_id: requestId,
  metadata: {
    operation: "user_registration",
    step: "email_validation",
    input_data: sanitizedInput,
  },
});
```

### 3. Sanitize Sensitive Data

The system automatically sanitizes sensitive information, but be mindful of what you include in metadata:

```typescript
// Good: Safe metadata
await logError(error, {
  metadata: {
    operation: "login",
    user_agent: request.headers.get("user-agent"),
    ip_address: request.ip,
  },
});

// Avoid: Sensitive data
await logError(error, {
  metadata: {
    password: userPassword, // Don't include sensitive data
    token: authToken,
  },
});
```

### 4. Use Error Boundaries Strategically

```typescript
// Wrap critical sections
<ErrorBoundary>
  <PaymentForm />
</ErrorBoundary>

// Wrap entire page sections
<ErrorBoundary showErrorDetails={isDevelopment}>
  <DashboardContent />
</ErrorBoundary>
```

## Testing Error Logging

### Test Client Errors

```typescript
// Navigate to: /api/test-error?fail=true
// This will trigger a server error and log it
```

### Test Error Dashboard

1. Trigger some errors in your application
2. Navigate to `/error-logs`
3. View the logged errors
4. Mark errors as resolved

## Maintenance

### Cleanup Old Errors

The system includes a cleanup function for old resolved errors:

```sql
SELECT cleanup_old_error_logs(); -- Removes errors older than 90 days
```

### Error Statistics

View error statistics using the provided view:

```sql
SELECT * FROM error_logs_stats
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC, severity DESC;
```

## Troubleshooting

### Common Issues

1. **Errors not appearing in dashboard**: Check RLS policies and user permissions
2. **High error volume**: Adjust batch size and flush interval in configuration
3. **Performance impact**: Monitor database performance and consider archiving old errors

### Debug Mode

Enable debug logging by setting the environment:

```env
NODE_ENV=development
```

This will show detailed error information in the console and error boundaries.

## Security Considerations

- **RLS Policies**: Only authenticated users can view their own errors
- **Service Role**: Required for inserting and updating error logs
- **Data Sanitization**: Sensitive information is automatically filtered
- **IP Address Logging**: Consider privacy implications in your jurisdiction

## Monitoring and Alerts

Consider setting up monitoring for:

- High error rates
- Critical severity errors
- Unresolved errors over time
- Error patterns by category

The error logging system provides the foundation for comprehensive error monitoring and debugging in your Supabase Next.js application.
