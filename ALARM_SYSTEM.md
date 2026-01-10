# 🚨 Medication Alarm System

The MedGuide app now features a **full alarm system** instead of basic notifications. This ensures users never miss their medication with critical alerts, persistent sounds, and mandatory interaction.

## Key Features

### ✅ Alarm-Like Behavior

- **Critical Priority**: Maximum importance notifications that bypass Do Not Disturb
- **Full-Screen Alerts**: Prominent red alarm screen when alarm fires
- **Persistent Sound**: Continuous alarm sound until dismissed
- **Enhanced Vibration**: Longer vibration pattern (6 pulses instead of 3)
- **Sticky Notifications**: Cannot be swiped away accidentally

### ✅ Snooze Functionality

- **Multiple Snooze Options**: 5, 10, or 15 minutes
- **Snooze Tracking**: Backend tracks how many times each alarm was snoozed
- **Quick Actions**: Snooze directly from notification (5 or 10 min)

### ✅ User Interaction Required

- **Mandatory Dismissal**: User must actively dismiss or snooze
- **Full-Screen UI**: Bright red screen with large buttons
- **Pulsing Animation**: Eye-catching medication icon animation
- **Clear Actions**: "I Took It" button or snooze options

## Technical Implementation

### Mobile App Changes

#### 1. Notification Service (`mobile/src/services/notificationService.ts`)

- **Critical Alerts**: iOS critical notifications that override silent mode
- **MAX Priority**: Android MAX importance channel
- **Alarm Category**: Custom notification category with dismiss/snooze actions
- **Enhanced Settings**:
  ```typescript
  - lockscreenVisibility: PUBLIC
  - bypassDnd: true
  - sticky: true
  - autoDismiss: false
  ```

#### 2. Alarm Screen (`mobile/src/screens/AlarmScreen.tsx`)

- Full-screen modal with red background
- Pulsing animation for medication icon
- Continuous vibration pattern
- Large, clear action buttons
- Snooze options: 5, 10, 15 minutes

#### 3. Main App Integration (`mobile/src/components/DarkMainApp.tsx`)

- Notification listeners for foreground alarms
- Response listeners for user actions
- Automatic alarm screen display
- Snooze and dismiss handling

### Backend Changes

#### 1. Database Schema (`backend/migrations/002_create_alarms_table.sql`)

```sql
- snooze_count INTEGER DEFAULT 0
- last_snoozed TIMESTAMP WITH TIME ZONE
```

#### 2. API Endpoints (`backend/src/routes/alarms.ts`)

- **POST /api/alarms/:id/snooze**: Record snooze event and increment counter
- Updated alarm creation to initialize snooze_count to 0
- Updated alarm update to support snooze tracking fields

### Database Migration

If you already have the alarms table, run this SQL to add snooze tracking:

```sql
ALTER TABLE alarms
  ADD COLUMN IF NOT EXISTS snooze_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_snoozed TIMESTAMP WITH TIME ZONE;
```

## How It Works

### 1. Alarm Triggers

When an alarm time arrives:

1. Notification fires with MAX priority
2. If app is in foreground: Full-screen alarm appears immediately
3. If app is in background: Sticky notification appears with actions
4. Continuous vibration starts
5. Sound plays persistently

### 2. User Actions

#### Option A: Dismiss (I Took It)

1. User taps "I Took It" button
2. Alarm screen closes
3. Vibration stops
4. Notification dismissed
5. Backend records successful dismissal

#### Option B: Snooze

1. User taps snooze button (5, 10, or 15 min)
2. Current alarm dismissed
3. New alarm scheduled for X minutes later
4. Backend increments snooze_count
5. Updates last_snoozed timestamp
6. Alarm screen closes

### 3. Notification Actions

Users can also snooze from the notification tray:

- **SNOOZE_5**: Snooze for 5 minutes
- **SNOOZE_10**: Snooze for 10 minutes
- **DISMISS**: Equivalent to "I Took It"

## Permissions Required

### iOS

- `allowAlert: true`
- `allowBadge: true`
- `allowSound: true`
- `allowCriticalAlerts: true` ⚠️ Requires special entitlement

### Android

- Notification permissions (requested automatically)
- Alarms & reminders permission (Android 13+)
- Can bypass Do Not Disturb

## Testing the Alarm System

### Quick Test

1. Open the app
2. Go to Schedule tab
3. Add a new alarm for 1-2 minutes from now
4. Select daily and enable it
5. Wait for alarm to trigger
6. Test both dismiss and snooze functions

### Background Test

1. Set an alarm
2. Close or background the app
3. Wait for notification
4. Test snooze actions from notification tray

### Foreground Test

1. Set an alarm
2. Keep app in foreground
3. Wait for full-screen alarm
4. Test vibration and sound
5. Test dismiss and snooze buttons

## Differences from Notification System

| Feature          | Old (Notifications)   | New (Alarms)               |
| ---------------- | --------------------- | -------------------------- |
| **Priority**     | HIGH                  | MAX (Critical)             |
| **Dismissible**  | Yes (swipe away)      | No (must interact)         |
| **Full Screen**  | No                    | Yes                        |
| **Vibration**    | 3 pulses              | 6 pulses (continuous)      |
| **Snooze**       | No                    | Yes (5, 10, 15 min)        |
| **Tracking**     | No                    | Yes (snooze count)         |
| **DND Override** | No                    | Yes                        |
| **UI**           | Standard notification | Custom red alarm screen    |
| **Sound**        | Brief                 | Persistent                 |
| **Actions**      | None                  | Dismiss + 3 snooze options |

## Future Enhancements

Possible improvements:

- [ ] Custom alarm sounds
- [ ] Escalating alarm volume
- [ ] Shake to snooze feature
- [ ] Medication taken confirmation with photo
- [ ] Alarm history and statistics
- [ ] Smart snooze limits (max 3 snoozes)
- [ ] Missed alarm notifications
- [ ] Integration with health tracking

## Troubleshooting

### Alarm doesn't fire

1. Check notification permissions are granted
2. Verify alarm is enabled in the list
3. Check phone isn't in battery saver mode
4. Ensure app has background permissions

### No sound/vibration

1. Check device volume settings
2. Verify notification channel settings
3. Check Do Not Disturb settings
4. Ensure "Critical Alerts" enabled (iOS)

### Full screen doesn't appear

1. Normal when app is backgrounded
2. Works only when app is in foreground
3. Check for notification permission
4. Try keeping app in foreground

### Snooze not working

1. Check notification actions are enabled
2. Verify backend API is running
3. Check database has snooze columns
4. Review browser console for errors

## API Reference

### POST /api/alarms/:id/snooze

Records a snooze event for an alarm.

**Parameters:**

- `id`: Alarm ID (path parameter)

**Response:**

```json
{
  "id": 1,
  "medication_name": "Aspirin",
  "snooze_count": 3,
  "last_snoozed": "2026-01-10T08:45:00.000Z",
  ...
}
```

## Configuration

### Snooze Duration Options

Edit in `AlarmScreen.tsx`:

```typescript
// Current: 5, 10, 15 minutes
// Can customize to any values
<TouchableOpacity onPress={() => onSnooze(5)}>
<TouchableOpacity onPress={() => onSnooze(10)}>
<TouchableOpacity onPress={() => onSnooze(15)}>
```

### Vibration Pattern

Edit in `notificationService.ts`:

```typescript
vibrationPattern: [0, 250, 250, 250, 250, 250];
// Format: [delay, vibrate, pause, vibrate, ...]
```

### Alarm Colors

Edit in `AlarmScreen.tsx` styles:

```typescript
backgroundColor: "#d32f2f"; // Red for urgent
```

---

**Built with ❤️ for better medication adherence**
