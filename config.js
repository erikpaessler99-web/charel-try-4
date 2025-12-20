// Game configuration and constants
export const CONFIG = {
  // Player settings
  PLAYER_MOVE_SPEED: 8,
  PLAYER_SLOWED_SPEED: 1.5, // Speed when near avatars
  PLAYER_EYE_HEIGHT: 1.7,
  SLOW_RADIUS: 3, // Distance from avatar that slows player
  
  // Room settings
  ROOM_WIDTH: 50,
  ROOM_DEPTH: 60,
  ROOM_HEIGHT: 12,
  
  // Avatar settings
  AVATAR_COUNT: 30,
  AVATAR_BOUNCE_SPEED: 1.5,
  AVATAR_SWAY_SPEED: 0.8,
  AVATAR_BOUNCE_HEIGHT: 0.8,
  AVATAR_SWAY_DISTANCE: 0.6,
  
  // Collectible settings
  ARTIFACT_COUNT: 5,
  ARTIFACT_COLLECT_RADIUS: 2,
  ARTIFACT_ROTATION_SPEED: 2,
  ARTIFACT_FLOAT_SPEED: 1,
  ARTIFACT_FLOAT_HEIGHT: 0.3,
  
  // Lighting settings
  LIGHT_FLASH_SPEED: 0.5,
  LIGHT_COLORS: [
    0xff00ff, // Magenta
    0x00ffff, // Cyan
    0xff0080, // Hot pink
    0x00ff00, // Green
    0xff8000, // Orange
    0x8000ff  // Purple
  ]
};
