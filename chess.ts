export type GameMode = 'BOT' | 'LOCAL' | 'ONLINE';

export type PieceColor = 'w' | 'b';

export interface BotProfile {
  id: number;
  name: string;
  title: string;
  avatar: string;
  avatarBg: string;
  depth: number;
  description: string;
  intro: string;
  winQuote: string;
  loseQuote: string;
}

export interface MoveRecord {
  moveNumber: number;
  color: PieceColor;
  san: string;
  from: string;
  to: string;
  captured?: string;
  piece: string;
}

export interface CapturedPieces {
  w: string[]; // Pieces white has lost (black captured)
  b: string[]; // Pieces black has lost (white captured)
}

export interface OnlineRoomData {
  roomCode: string;
  fen: string;
  turn: PieceColor;
  lastMove: { from: string; to: string } | null;
  history: string[];
  whitePlayer: string;
  blackPlayer: string;
  lastUpdated: number;
  gameOver: boolean;
  winner: PieceColor | 'draw' | null;
}
