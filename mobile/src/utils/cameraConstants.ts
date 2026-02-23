/**
 * Camera configuration constants
 */

export const CAMERA_CONSTANTS = {
  // Image quality settings
  PHOTO_QUALITY: 0.85,
  WEB_JPEG_QUALITY: 0.85,

  // Zoom settings
  MOBILE_ZOOM_STEP: 0.1,
  MOBILE_ZOOM_MIN: 0,
  MOBILE_ZOOM_MAX: 1,
  
  WEB_ZOOM_STEP: 0.5,
  WEB_ZOOM_MIN: 1,
  WEB_ZOOM_MAX: 3,

  // Timing
  VIDEO_ELEMENT_READY_DELAY: 150, // ms to wait for video element
  CAMERA_SWITCH_DELAY: 200, // ms between camera switches
  
  // UI
  SHUTTER_SIZE: 70,
  ZOOM_BUTTON_SIZE: 44,
} as const;
