# Date-Based Logging System ✅

## Overview

The logging system has been updated to save all logs in date-based files and user action logs to the database.

## 📁 Log File Structure

### Date-Based Log Files
All log files are now organized by date with the format: `YYYY-MM-DD_<type>.log`

```
backend/logs/
├── 2024-01-13_error.log          # Error logs for Jan 13, 2024
├── 2024-01-13_warning.log        # Warning logs for Jan 13, 2024
├── 2024-01-13_info.log           # Info logs for Jan 13, 2024
├── 2024-01-13_combined.log       # All logs for Jan 13, 2024
├── 2024-01-13_debug.log          # Debug logs for Jan 13, 2024 (dev only)
└── user-actions/
    ├── 2024-01-13_user-actions.log        # User actions for Jan 13, 2024
    └── 2024-01-13_user-actions-error.log  # User action errors for Jan 13, 2024
```

### File Naming Pattern
- **Format**: `YYYY-MM-DD_<logtype>.log`
- **Examples**:
  - `2024-01-13_error.log`
  - `2024-01-13_warning.log`
  - `2024-01-13_info.log`
  - `2024-01-13_combined.log`
  - `2024-01-13_debug.log`
  - `2024-01-13_user-actions.log`
  - `2024-01-13_user-actions-error.log`

## 🗄️ Database Storage

### User Action Logs Table
All user actions are **saved to the database** in the `user_action_logs` table:

```sql
CREATE TABLE user_action_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    action_description TEXT,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path VARCHAR(255),
    status_code INTEGER,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Dual Storage
User actions are stored in **BOTH**:
1. **Database** (`user_action_logs` table) - Primary storage for querying and analytics
2. **File** (`YYYY-MM-DD_user-actions.log`) - Backup and file-based analysis

## 📊 Log Retention

### File Logs
- **Error/Warning/Info/Combined**: 30 days
- **Debug**: 7 days (development only)
- **User Actions**: 90 days
- **User Action Errors**: 90 days

### Database Logs
- **Default**: 90 days (configurable via cleanup API)
- **Cleanup**: Use `/api/v1/user-action-logs/cleanup` endpoint

## 🔄 Automatic File Rotation

The system uses `winston-daily-rotate-file` which:
- Automatically creates new files each day
- Rotates files by date (not just size)
- Keeps files organized by date
- Automatically cleans up old files based on retention policy

## 📝 Logging Flow

### Application Logs (Error, Warning, Info, Debug)
```
Application Event → Winston Logger → Date-based File (YYYY-MM-DD_<type>.log)
```

### User Action Logs
```
User Action → UserActionLogService → {
    → Database (user_action_logs table) ✅ PRIMARY STORAGE
    → File (YYYY-MM-DD_user-actions.log) ✅ BACKUP
}
```

## 🔍 Querying Logs

### File Logs
- Browse files in `backend/logs/` directory
- Files are organized by date
- Use grep or log analysis tools

### Database Logs
Use API endpoints:
- `GET /api/v1/user-action-logs` - Get user's logs
- `GET /api/v1/user-action-logs/type/:actionType` - By action type
- `GET /api/v1/user-action-logs/resource/:resourceType/:resourceId` - By resource
- `GET /api/v1/user-action-logs/date-range` - By date range
- `GET /api/v1/user-action-logs/statistics` - Statistics

## ✅ Implementation Status

- ✅ Date-based file naming (`YYYY-MM-DD_<type>.log`)
- ✅ Automatic daily file rotation
- ✅ User actions saved to database
- ✅ User actions also saved to files (backup)
- ✅ File retention policies configured
- ✅ Database cleanup functionality

## 📦 Dependencies

- `winston` - Logging framework
- `winston-daily-rotate-file` - Daily file rotation

## 🚀 Usage

The logging system works automatically:
1. **Application logs** → Automatically saved to date-based files
2. **User actions** → Automatically saved to database + date-based files
3. **File rotation** → Automatic daily rotation
4. **Cleanup** → Automatic based on retention policy

No additional configuration needed!
