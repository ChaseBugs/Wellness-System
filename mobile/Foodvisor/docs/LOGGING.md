# Logging System Guide

The Smart Home Backend uses an enhanced Winston logger with emoji support for better visual identification of log types and contexts.

## Features

- 🎨 **Emoji-based logging** for quick visual identification
- 📊 **Structured logging** with context and metadata
- 🔍 **Multiple log levels** (error, warn, info, debug)
- 📁 **File logging** for production (JSON format)
- 🖥️ **Console logging** with emojis for development
- 🏷️ **Context-based logging** (Database, API, Auth, Device, User, Server)

## Usage Examples

### Basic Logging

```typescript
import logger from '../utils/logger';

// Generic logging with emojis for all levels
logger.errorWithEmoji('❌', 'Something went wrong', 'CONTEXT', { userId: 123 });
logger.warnWithEmoji('⚠️', 'Warning message', 'CONTEXT');
logger.infoWithEmoji('ℹ️', 'Information', 'CONTEXT');
logger.successWithEmoji('✅', 'Operation successful', 'CONTEXT', { operation: 'create' });
logger.debugWithEmoji('🔍', 'Debug info', 'CONTEXT');
logger.verboseWithEmoji('📝', 'Verbose information', 'CONTEXT');
logger.httpWithEmoji('🌐', 'HTTP request', 'CONTEXT');

// Direct level methods (without emoji parameter)
logger.error('Error message', { error: 'details' });
logger.warn('Warning message');
logger.info('Info message');
logger.success('Success message'); // Custom success level
logger.debug('Debug message');
logger.verbose('Verbose message');
logger.http('HTTP message');
```

### Database Logging

```typescript
logger.db.connect('Database connected', { host: 'localhost', port: 3306 }); // Uses success level
logger.db.query('SELECT * FROM users', { duration: '5ms' }); // Uses debug level
logger.db.error('Query failed', { error: 'Connection timeout' }); // Uses error level
logger.db.transaction('Transaction started', { transactionId: 'tx-123' }); // Uses info level
logger.db.success('Database operation completed', { operation: 'migration' }); // Uses success level
```

### API Logging

```typescript
logger.api.request('GET', '/api/v1/devices', { userId: 123 }); // Uses info level
logger.api.response('GET', '/api/v1/devices', 200, { duration: '45ms' }); // Uses success level for 2xx
logger.api.response('GET', '/api/v1/devices', 404, { duration: '10ms' }); // Uses error level for 4xx/5xx
logger.api.error('POST', '/api/v1/users', 'Validation failed', { errors: [...] }); // Uses error level
logger.api.success('POST', '/api/v1/users', 'User created successfully', { userId: 123 }); // Uses success level
```

### Authentication Logging

```typescript
logger.auth.login('user@example.com', true, { userId: 123 });
logger.auth.signup('user@example.com', true, { userId: 123 });
logger.auth.token('generated', { userId: 123 });
logger.auth.unauthorized('Invalid token', { path: '/api/v1/devices' });
```

### Device Logging

```typescript
logger.device.create(1, 'Living Room Sensor', 123, { type: 'sensor' });
logger.device.update(1, 'Living Room Sensor', 123, { updatedFields: ['name'] });
logger.device.delete(1, 123);
logger.device.status(1, 'online', { userId: 123 });
logger.device.connection(1, true, { ipAddress: '192.168.1.100' });
```

### User Logging

```typescript
logger.user.create(123, 'user@example.com', { firstName: 'John' });
logger.user.update(123, 'user@example.com', { updatedFields: ['phone'] });
logger.user.profile(123, 'updated', { field: 'firstName' });
```

### Server Logging

```typescript
logger.server.start(3000, 'development'); // Uses success level
logger.server.shutdown('SIGTERM received'); // Uses warn level
logger.server.health('ok', { uptime: '2h 30m' }); // Uses success level if 'ok', warn otherwise
logger.server.success('Server operation completed', { operation: 'restart' }); // Uses success level
```

## Available Emojis

The logger includes predefined emojis for common scenarios:

- ❌ Error
- ⚠️ Warning
- ℹ️ Info
- 🔍 Debug
- ✅ Success
- 🗄️ Database
- 🌐 API
- 🔐 Auth
- 📱 Device
- 👤 User
- 🚀 Server
- 📥 Request
- 📤 Response
- ✔️ Validation
- 🛡️ Security
- 🔌 Connection/Disconnection
- 🎬 Startup
- 🛑 Shutdown
- 💚 Health
- 📚 Swagger

## Log Levels

The logger supports multiple log levels with custom priorities:

- **error** (0): Critical errors that need immediate attention ❌
- **warn** (1): Warnings about potential issues ⚠️
- **info** (2): General informational messages ℹ️
- **success** (3): Success messages for completed operations ✅
- **http** (4): HTTP-related messages 🌐
- **verbose** (5): Verbose informational messages 📝
- **debug** (6): Detailed debugging information (only in development) 🔍
- **silly** (7): Very detailed debugging information 🎭

### Using Different Log Levels

```typescript
import logger from '../utils/logger';

// Error level
logger.error('Something went wrong', { error: 'Connection failed' });
logger.errorWithEmoji('❌', 'Critical error occurred', 'ERROR', { code: 'ERR_001' });

// Warn level
logger.warn('Potential issue detected', { userId: 123 });
logger.warnWithEmoji('⚠️', 'Rate limit approaching', 'API', { limit: 100 });

// Info level
logger.info('Processing request', { requestId: 'req-123' });
logger.infoWithEmoji('ℹ️', 'User action performed', 'USER', { action: 'login' });

// Success level (custom)
logger.success('Operation completed successfully', { operation: 'create' });
logger.successWithEmoji('✅', 'Device registered', 'DEVICE', { deviceId: 1 });

// Debug level
logger.debug('Debug information', { step: 'validation' });
logger.debugWithEmoji('🔍', 'Query executed', 'DATABASE', { query: 'SELECT * FROM users' });

// Verbose level
logger.verbose('Detailed information', { details: '...' });
logger.verboseWithEmoji('📝', 'Detailed log entry', 'SYSTEM');

// HTTP level
logger.http('HTTP request', { method: 'GET', path: '/api/v1/users' });
logger.httpWithEmoji('🌐', 'HTTP response', 'API', { statusCode: 200 });
```

## Log Output

### Development Mode
Console output includes emojis and color coding:
```
✅ 14:30:15 success [DATABASE] Database connected successfully {"host":"localhost","port":3306}
✅ 14:30:20 success [AUTH] Login successful: user@example.com {"email":"user@example.com","success":true}
📥 14:30:25 info [API] GET /api/v1/devices {"userId":123}
📤 14:30:25 success [API] GET /api/v1/devices - 200 {"duration":"45ms"}
```

### Production Mode
Logs are written to files organized by date folders with server start time prefix:
- `logs/YYYY-MM-DD/HH-MM-SS-error.log` - Only error level logs
- `logs/YYYY-MM-DD/HH-MM-SS-warn.log` - Only warn level logs
- `logs/YYYY-MM-DD/HH-MM-SS-success.log` - Only success level logs
- `logs/YYYY-MM-DD/HH-MM-SS-combined.log` - All logs (all levels)

**Log Structure:**
- Logs are organized by date folders (e.g., `logs/2024-01-15/`)
- Each log file name starts with the server start time (HH-MM-SS format, e.g., `14-30-25-warn.log`)
- Each log entry starts with a datetime stamp (YYYY-MM-DD HH:mm:ss.SSS format)
- Format: `TIMESTAMP [LEVEL] [CONTEXT] MESSAGE {metadata}`

**Example log structure:**
```
logs/
└── 2024-01-15/
    ├── 14-30-25-error.log
    ├── 14-30-25-warn.log
    ├── 14-30-25-success.log
    └── 14-30-25-combined.log
```

**Example log entry:**
```
2024-01-15 14:30:25.123 [ERROR] [DATABASE] Database connection failed {"host":"localhost","port":5432}
```

## Best Practices

1. **Use appropriate log levels**: Don't log everything as error
2. **Include context**: Always provide relevant metadata
3. **Don't log sensitive data**: Never log passwords, tokens, or PII
4. **Use structured logging**: Include objects/metadata for better searchability
5. **Log important events**: User actions, device connections, errors
6. **Use context tags**: Help filter logs by component (DATABASE, API, AUTH, etc.)

## Request Logging

All API requests and responses are automatically logged via the `requestLogger` middleware. This includes:
- Request method and path
- Response status code
- Request duration
- User ID (if authenticated)
- IP address

## Error Logging

Errors are automatically logged with:
- Error message and code
- Stack trace (in development)
- Request path and method
- Status code

