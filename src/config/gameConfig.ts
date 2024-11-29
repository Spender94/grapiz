export const GAME_MODES = {
  LOCAL: 'local',
  ONLINE: 'online'
} as const;

export type GameMode = typeof GAME_MODES[keyof typeof GAME_MODES];

export const DEFAULT_GAME_MODE = GAME_MODES.LOCAL;