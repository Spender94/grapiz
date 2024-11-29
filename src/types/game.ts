export type Player = 'blue' | 'red';
export type Position = { x: number; y: number };

export interface Move {
  pieceId: string;
  from: Position;
  to: Position;
}

export interface ChatMessage {
  id: string;
  player: Player;
  message: string;
  timestamp: number;
}

export interface Piece {
  id: string;
  player: Player;
  position: Position;
}

export interface GameState {
  pieces: Piece[];
  currentPlayer: Player;
  selectedPiece: Piece | null;
  validMoves: Position[];
  gameStatus: 'waiting' | 'playing' | 'finished' | 'draw';
  winner: Player | null;
  blueTime: number;
  redTime: number;
  messages: ChatMessage[];
  gameId?: string;
  playerColor?: Player;
}