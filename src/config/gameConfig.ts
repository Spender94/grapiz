export const GAME_MODES = {
  ONLINE: 'online',
  LOCAL: 'local'
} as const;

export type GameMode = typeof GAME_MODES[keyof typeof GAME_MODES];

export const DEFAULT_GAME_MODE = GAME_MODES.ONLINE;