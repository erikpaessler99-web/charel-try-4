// Game configuration and constants
export const CONFIG = {
  // Player settings
  PLAYER_MOVE_SPEED: 6,
  PLAYER_SLOWED_SPEED: 2, // Speed when near avatars
  PLAYER_EYE_HEIGHT: 1.65, // Realistic human eye height
  SLOW_RADIUS: 2.5, // Distance from avatar that slows player
  
  // Room settings
  ROOM_WIDTH: 60,
  ROOM_DEPTH: 70,
  ROOM_HEIGHT: 15,
  
  // Avatar settings
  AVATAR_COUNT: 600, // Packed club feel - 5x density
  AVATAR_BOUNCE_SPEED: 1.8,
  AVATAR_SWAY_SPEED: 1.2,
  AVATAR_BOUNCE_HEIGHT: 0.15, // More subtle, realistic bounce
  AVATAR_SWAY_DISTANCE: 0.4,
  AVATAR_SCALE: 1.0, // Human-sized avatars
  
  // Collectible settings
  ARTIFACT_COUNT: 6,
  ARTIFACT_COLLECT_RADIUS: 2.5,
  ARTIFACT_ROTATION_SPEED: 1.5,
  ARTIFACT_FLOAT_SPEED: 1.2,
  ARTIFACT_FLOAT_HEIGHT: 0.4,
  
  // Lighting settings
  LIGHT_FLASH_SPEED: 0.8,
  LIGHT_COLORS: [
    0xff00ff, // Magenta
    0x00ffff, // Cyan
    0xff0080, // Hot pink
    0x00ff00, // Green
    0xff8000, // Orange
    0x8000ff, // Purple
    0xff0000, // Red
    0x0080ff  // Blue
  ]
};
