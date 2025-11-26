# Session Management System

## Overview

The Code Review Assistant now includes a **per-device session management system** that ensures each device/browser gets its own isolated session. This allows multiple users on different devices to use the app simultaneously without their data interfering with each other.

## Architecture

### 1. Session Context (`src/context/SessionContext.tsx`)

The `SessionContext` provides session data to the entire application via React Context API.

**Key Features:**
- ✅ **Automatic Device ID Generation** - Creates a unique device identifier on first visit
- ✅ **Device Detection** - Automatically detects device type (Windows PC, MacBook, iOS, Android, etc.)
- ✅ **Local Storage Persistence** - Stores session data in browser's localStorage
- ✅ **24-Hour Session Expiry** - Sessions automatically expire after 24 hours
- ✅ **Activity Tracking** - Updates last activity timestamp on each interaction

**Session Data Structure:**
```typescript
interface SessionData {
  sessionId: string;        // Unique session identifier
  deviceId: string;         // Unique device/browser identifier
  deviceName: string;       // Human-readable device type
  createdAt: string;        // ISO timestamp of session creation
  lastActivity: string;     // ISO timestamp of last activity
}
```

### 2. Session Hook (`src/hooks/useSessionInfo.ts`)

Provides easy access to session data throughout components.

```typescript
const { 
  sessionId,      // Unique session ID
  deviceId,       // Device ID
  deviceName,     // Device name (e.g., "Windows PC", "iPhone")
  createdAt,      // Session creation time
  lastActivity,   // Last activity timestamp
  isLoading,      // Loading state
  updateActivity  // Function to update last activity
} = useSessionInfo();
```

### 3. Database Integration

**Report Model** (`src/models/Report.ts`) now includes session tracking fields:

```typescript
interface Report {
  // ... existing fields ...
  sessionId: string;      // Which session created this report
  deviceId: string;       // Which device created this report
  deviceName: string;     // Device name for reference
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Database Indexes** for efficient querying:
- `sessionId` - Find all reports from a session
- `deviceId` - Find all reports from a device
- `sessionId + createdAt` - Chronological reports per session
- `deviceId + createdAt` - Chronological reports per device

### 4. API Endpoints

All review endpoints now support session parameters:

**POST `/api/review`**
```json
{
  "code": "...",
  "language": "typescript",
  "fileName": "app.ts",
  "sessionId": "session_1732623456789_abc123",
  "deviceId": "device_1732621234567_xyz789",
  "deviceName": "Windows PC"
}
```

**GET `/api/reports`**
```
?sessionId=session_1732623456789_abc123&page=1&limit=10
```

## How It Works

### Session Flow

1. **Initial Load**
   - SessionProvider initializes on app mount
   - Checks localStorage for existing session
   - If session exists and not expired (< 24 hours), reuses it
   - If no session or expired, creates new session
   - Generates unique deviceId on first visit ever

2. **Code Review Submission**
   - User uploads code and clicks "Analyze Code"
   - Session data automatically attached to request
   - Review result saved with sessionId, deviceId, deviceName
   - Report linked to specific device/session

3. **Viewing Reports**
   - Dashboard automatically filters by current session/device
   - Reports list can be filtered by sessionId
   - Users on different devices see their own reports

### Storage

**Client-Side (localStorage):**
```json
{
  "device_id": "device_1732621234567_randomstring",
  "session_data": {
    "sessionId": "session_1732623456789_abc123",
    "deviceId": "device_1732621234567_randomstring",
    "deviceName": "Windows PC",
    "createdAt": "2025-11-26T10:30:00.000Z",
    "lastActivity": "2025-11-26T10:35:00.000Z"
  }
}
```

**Database (MongoDB):**
- Each report document includes sessionId, deviceId, deviceName
- Queries can filter by sessionId to get device-specific reports
- Indexes enable fast lookups

## Multi-Device Scenario

### Example: User with Multiple Devices

**Device 1 (Laptop - Windows PC)**
- Session ID: `session_1732623456789_abc123`
- Device ID: `device_1732621234567_xyz789`
- Reports: All laptop reviews saved with this sessionId/deviceId

**Device 2 (Mobile - iPhone)**
- Session ID: `session_1732625678901_def456`
- Device ID: `device_1732623456789_uvw012`
- Reports: All mobile reviews saved with this different sessionId/deviceId

**Device 3 (Laptop - different browser or cleared localStorage)**
- Session ID: `session_1732627890123_ghi789` (new session)
- Device ID: `device_1732625678901_rst345` (new device ID)
- Reports: New set of reviews with new sessionId/deviceId

### Isolation Benefits

✅ **No Data Mixing** - Each device maintains its own session
✅ **Independent History** - Device A's review history doesn't appear on Device B
✅ **Clear Separation** - Device info is always tracked with reports
✅ **Multi-User Support** - Multiple people can use same computer (different localStorage)
✅ **Privacy** - No cross-device data leakage

## UI Components

### SessionInfo Component (`src/components/dashboard/SessionInfo.tsx`)

Displays current session and device information on the dashboard.

**Displays:**
- Device Name
- Device ID
- Session ID
- Session Creation Time
- Last Activity Time

```tsx
import { SessionInfo } from '@/components/dashboard/SessionInfo';

export function Dashboard() {
  return (
    <div>
      <SessionInfo />
      {/* Other dashboard components */}
    </div>
  );
}
```

### Usage in Pages

**Home Page (`src/app/page.tsx`)**
```tsx
const { sessionId, deviceId, deviceName, updateActivity } = useSessionInfo();

const handleAnalyze = async () => {
  updateActivity(); // Update last activity
  await submitReview({
    code: file.content,
    language: selectedLanguage,
    fileName: file.name,
    sessionId,
    deviceId,
    deviceName,
  });
};
```

## API Integration

### For Frontend Developers

Always include session data when making review requests:

```typescript
// Good - includes session data
const response = await fetch('/api/review', {
  method: 'POST',
  body: JSON.stringify({
    code,
    language,
    fileName,
    sessionId,      // Include
    deviceId,       // Include
    deviceName,     // Include
  })
});

// Bad - missing session data
const response = await fetch('/api/review', {
  method: 'POST',
  body: JSON.stringify({
    code,
    language,
    fileName
    // sessionId, deviceId, deviceName missing
  })
});
```

### For Backend Developers

Session data is always attached to reports in the database:

```typescript
// Query reports from specific session
const reports = await ReportModel.find({ sessionId });

// Query reports from specific device
const deviceReports = await ReportModel.find({ deviceId });

// Chronological reports from session
const sessionTimeline = await ReportModel
  .find({ sessionId })
  .sort({ createdAt: -1 });

// Ensure reports belong to expected device
const authorizedReports = await ReportModel.find({
  sessionId: req.body.sessionId,
  deviceId: req.body.deviceId,
});
```

## Session Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ First Visit                                                 │
├─────────────────────────────────────────────────────────────┤
│ 1. App loads                                                │
│ 2. SessionProvider checks localStorage                      │
│ 3. No existing session found                                │
│ 4. Generate new deviceId (stored permanently)              │
│ 5. Generate new sessionId                                   │
│ 6. Store session data in localStorage                       │
│ 7. SessionData available via useSessionInfo()              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Same Browser, Next Day (< 24 hours)                         │
├─────────────────────────────────────────────────────────────┤
│ 1. App loads                                                │
│ 2. SessionProvider checks localStorage                      │
│ 3. Session exists and not expired                           │
│ 4. Reuse sessionId (same device, same session)             │
│ 5. All new reports linked to same session                   │
│ 6. Reports appear in same history                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Same Browser, After 24 Hours                                │
├─────────────────────────────────────────────────────────────┤
│ 1. App loads                                                │
│ 2. SessionProvider checks localStorage                      │
│ 3. Session exists but expired (> 24 hours)                 │
│ 4. Generate new sessionId (old deviceId retained)          │
│ 5. Store new session data                                   │
│ 6. New reports use new sessionId                            │
│ 7. Old reports still visible (same deviceId)               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Different Browser/localStorage Cleared                      │
├─────────────────────────────────────────────────────────────┤
│ 1. App loads                                                │
│ 2. SessionProvider checks localStorage                      │
│ 3. No data found (cleared or new browser)                  │
│ 4. Generate new deviceId (different from before)          │
│ 5. Generate new sessionId                                   │
│ 6. Reports from different deviceId don't appear            │
│ 7. Fresh start with new device ID                          │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Session Expiry Time

Located in `src/context/SessionContext.tsx`:

```typescript
// Current: 24 hours
const twentyFourHours = 24 * 60 * 60 * 1000; // in milliseconds

// To change, modify:
if (now - createdTime > twentyFourHours) {
  // Session expired
}
```

### Device Detection

Device detection happens automatically based on user agent. Current detection:

```
Windows PC     → /windows/i in user agent
MacBook        → /mac/i in user agent
iPad           → /ipad/i in user agent
iPhone         → /iphone/i in user agent
Android Device → /android/i in user agent
Linux Device   → /linux/i in user agent
Mobile Device  → /mobile/i in user agent
```

To customize, edit `getDeviceName()` in `src/context/SessionContext.tsx`.

## Testing

### Test Multi-Device Scenario Locally

1. **Device 1 Simulation:**
   ```bash
   # Browser 1: http://localhost:3000
   # Upload and review a file
   # Note the Device ID in console
   ```

2. **Device 2 Simulation:**
   ```bash
   # Browser 2 or Incognito: http://localhost:3000
   # Upload and review a file
   # Note the different Device ID
   # Dashboard shows different reports
   ```

3. **Verify localStorage:**
   ```javascript
   // Browser DevTools Console
   console.log(localStorage.getItem('device_id'));
   console.log(JSON.parse(localStorage.getItem('session_data')));
   ```

## Troubleshooting

### Session Not Persisting

**Symptom:** Session ID changes on every page refresh

**Solution:** Check if localStorage is enabled:
```javascript
// Browser Console
localStorage.setItem('test', 'true');
console.log(localStorage.getItem('test')); // Should print 'true'
```

### Reports Not Filtering by Device

**Symptom:** Seeing reports from other devices

**Solution:** Verify reports have sessionId/deviceId saved:
```javascript
// Browser Console, after uploading a review
const reports = await fetch('/api/reports').then(r => r.json());
console.log(reports.reports[0].sessionId, reports.reports[0].deviceId);
```

### Device Name Showing as "Unknown"

**Symptom:** All devices show "Unknown Device"

**Solution:** Check user agent detection in `getDeviceName()` function

## Future Enhancements

- [ ] User authentication for cross-device report access
- [ ] Session PIN for device verification
- [ ] Manual device naming
- [ ] Session statistics dashboard
- [ ] Export reports from specific session
- [ ] Session sharing between devices
- [ ] Device revocation/removal
- [ ] Session activity logs

---

**Implementation Date:** November 26, 2025
**Status:** ✅ Complete and Deployed
