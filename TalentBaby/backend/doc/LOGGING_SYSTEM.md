# Logging System Documentation

## Overview

The Talent Baby backend implements a comprehensive logging system with:
1. **File-based logging** using Winston
2. **User action logging** to both files and database
3. **Structured logging** with metadata

## File-Based Logging

### Log Files Location
All log files are stored in `backend/logs/` directory:
- `logs/error.log` - Error level logs only
- `logs/combined.log` - All logs
- `logs/info.log` - Info level and above
- `logs/debug.log` - Debug logs (development only)
- `logs/user-actions/user-actions.log` - All user actions
- `logs/user-actions/critical-actions.log` - Critical user actions (warn/error)

### Log Rotation
- Maximum file size: 5MB (10MB for user actions)
- Maximum files kept: 5 files (30-90 days for user actions)
- Automatic rotation when size limit is reached

### Log Levels
- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `debug` - Debug messages (development only)

## User Action Logging

### Database Table
User actions are stored in the `user_action_logs` table with:
- User ID (nullable for anonymous actions)
- Action type (e.g., 'user_login', 'create_baby', 'update_profile')
- Resource type and ID
- IP address and user agent
- Request details (method, path, status code)
- Metadata (JSON)
- Timestamp

### Logged Actions

#### Authentication
- `user_signup` - User registration
- `user_signup_failed` - Failed registration
- `user_login` - Successful login
- `user_login_failed` - Failed login attempt

#### Baby Management
- `create_baby` - Create baby profile
- `update_baby` - Update baby profile
- `delete_baby` - Delete baby profile

#### Daily Tracking
- `create_feeding` - Log feeding
- `create_sleep` - Log sleep session
- `create_diaper` - Log diaper change

#### And many more...

### Using User Action Logger Middleware

#### Basic Usage
```typescript
import { userActionLogger } from '../middleware/userActionLogger.middleware';

router.post(
  '/babies',
  authenticate,
  userActionLogger('create_baby', {
    resourceType: 'baby',
    getResourceId: (req) => req.body.id,
  }),
  babyController.createBaby.bind(babyController)
);
```

#### Advanced Usage
```typescript
router.put(
  '/babies/:id',
  authenticate,
  userActionLogger('update_baby', {
    resourceType: 'baby',
    getResourceId: (req) => parseInt(req.params.id),
    getMetadata: (req, res) => ({
      changes: req.body,
      responseTime: res.locals.duration,
    }),
    skipOnSuccess: false, // Log all actions
  }),
  babyController.updateBaby.bind(babyController)
);
```

### Manual Logging

You can also log actions manually in controllers:

```typescript
import { UserActionLogService } from '../services/userActionLog.service';

const userActionLogService = new UserActionLogService();

await userActionLogService.logAction(userId, 'custom_action', {
  actionDescription: 'Custom action performed',
  resourceType: 'resource',
  resourceId: 123,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  requestMethod: req.method,
  requestPath: req.path,
  statusCode: 200,
  metadata: { customData: 'value' },
});
```

## API Endpoints

### Get User Action Logs
```
GET /api/v1/user-action-logs
Query params: limit, offset
```

### Get Logs by Action Type
```
GET /api/v1/user-action-logs/type/:actionType
Query params: limit, offset
```

### Get Logs for Resource
```
GET /api/v1/user-action-logs/resource/:resourceType/:resourceId
```

### Get Logs by Date Range
```
GET /api/v1/user-action-logs/date-range
Query params: startDate, endDate, limit
```

### Get Statistics
```
GET /api/v1/user-action-logs/statistics
Query params: userId (optional), startDate (optional), endDate (optional)
```

### Cleanup Old Logs
```
POST /api/v1/user-action-logs/cleanup
Body: { daysToKeep: 90 }
```

## Log Format

### File Logs (JSON)
```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2024-01-13 01:42:21",
  "service": "talent-baby-api",
  "userId": 123,
  "action": "user_login",
  "details": {
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "statusCode": 200
  }
}
```

### Database Logs
- Structured data in `user_action_logs` table
- Queryable by user, action type, resource, date range
- Supports analytics and reporting

## Best Practices

1. **Always log user actions** for important operations
2. **Use appropriate action types** - be consistent
3. **Include relevant metadata** - but sanitize sensitive data
4. **Log failures** - especially authentication failures
5. **Regular cleanup** - use cleanup endpoint to remove old logs
6. **Monitor critical actions** - check critical-actions.log regularly

## Security Considerations

- Passwords and tokens are automatically redacted in logs
- IP addresses are logged for security monitoring
- Failed login attempts are logged for security analysis
- User action logs can be used for audit trails

## Performance

- Logging is asynchronous and non-blocking
- File writes are buffered
- Database logging uses connection pooling
- Failed logging doesn't break the request flow
