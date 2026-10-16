import { Chess, Move, Square } from 'chess.js';
import { BotProfile } from '../types/chess';

export const BOT_PROFILES: Record<number, BotProfile> = {
  1: {
    id: 1,
    name: 'Pipoca',
    title: 'Iniciante Divertido',
    avatar: '🍿',
    avatarBg: 'from-amber-500 to-orange-600',
    depth: 1,
    description: 'Adora movimentar os peões e faz jogadas bem imprevisíveis e amigáveis.',
    intro: 'Oi! Eu sou o Pipoca! Vamos jogar uma partidinha bem tranquila e divertida? 😊',
    winQuote: 'Ebaaa! O Pipoca conseguiu vencer desta vez! Quer outra partida?',
    loseQuote: 'Poxa, você jogou super bem! Vou treinar mais para te vencer depois!'
  },
  2: {
    id: 2,
    name: 'Sr. Faísca',
    title: 'Intermediário Oportunista',
    avatar: '⚡',
    avatarBg: 'from-blue-600 to-cyan-500',
    depth: 2,
    description: 'Focado em capturar peças desprotegidas e atacar o centro do tabuleiro.',
    intro: 'Cuidado com a alta voltagem! Não vou deixar passar nenhum erro seu!',
    winQuote: 'Xeque-mate eletrizante! Ninguém escapa da minha correnteza!',
    loseQuote: 'Circuito em curto! Você cortou meus fusíveis com essa jogada!'
  },
  3: {
    id: 3,
    name: 'Mestra Sophia',
    title: 'Estrategista Avançada',
    avatar: '🔮',
    avatarBg: 'from-indigo-600 to-purple-600',
    depth: 2,
    description: 'Equilibra ataque e defesa, valorizando a estrutura de peões e segurança do Rei.',
    intro: 'Olá, nobre adversário. O xadrez é a arte da paciência e da harmonia.',
    winQuote: 'A estratégia prevaleceu. Foi uma partida muito rica em ideias.',
    loseQuote: 'Impressionante visão tática! Você conduziu as peças com maestria.'
  },
  4: {
    id: 4,
    name: 'Tytan 9000',
    title: 'Computador Expert',
    avatar: '🤖',
    avatarBg: 'from-slate-700 to-blue-900',
    depth: 3,
    description: 'Processa múltiplos lances futuros com poda alfa-beta e precisão cirúrgica.',
    intro: 'Protocolo de duelo iniciado. Analisando 10.000 nós por segundo. Boa sorte, humano.',
    winQuote: 'Cálculos confirmados: 100% de precisão no mate. O silício prevalece.',
    loseQuote: 'Erro fatal: 0x8849. Jogador humano superou parâmetros calculados!'
  },
  5: {
    id: 5,
    name: 'Grandmaster Zenith',
    title: 'Lendário Grão-Mestre',
    avatar: '👑',
    avatarBg: 'from-amber-600 to-yellow-500',
    depth: 3,
    description: 'Cálculo profundo, domínio das aberturas e finais impecáveis dignos de campeão.',
    intro: 'Bem-vindo ao ápice do tabuleiro. Mostre-me sua melhor versão no xadrez.',
    winQuote: 'A coroa permanece no trono. Um jogo magnífico, digno dos grandes palcos.',
    loseQuote: 'Extraordinário! Hoje você jogou como um verdadeiro Campeão do Mundo!'
  }
};

// Piece base values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Positional piece-square tables for intelligent evaluation
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

function getSquareIndex(square: Square, color: 'w' | 'b'): number {
  const file = square.charCodeAt(0) - 97; // 0-7
  const rank = parseInt(square[1], 10) - 1; // 0-7
  // Flip rank for black
  const row = color === 'w' ? 7 - rank : rank;
  return row * 8 + file;
}

function evaluateBoard(chess: Chess, botColor: 'w' | 'b'): number {
  if (chess.isCheckmate()) {
    return chess.turn() === botColor ? -99999 : 99999;
  }
  if (chess.isDraw()) {
    return 0;
  }

  let totalScore = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = PIECE_VALUES[piece.type] || 0;
      const fileChar = String.fromCharCode(97 + c);
      const rankNum = 8 - r;
      const sq = (fileChar + rankNum) as Square;
      const sqIdx = getSquareIndex(sq, piece.color);

      let posVal = 0;
      switch (piece.type) {
        case 'p': posVal = PAWN_TABLE[sqIdx] || 0; break;
        case 'n': posVal = KNIGHT_TABLE[sqIdx] || 0; break;
        case 'b': posVal = BISHOP_TABLE[sqIdx] || 0; break;
        case 'r': posVal = ROOK_TABLE[sqIdx] || 0; break;
        case 'q': posVal = QUEEN_TABLE[sqIdx] || 0; break;
        case 'k': posVal = KING_TABLE[sqIdx] || 0; break;
      }

      const pieceTotal = baseVal + posVal;
      if (piece.color === botColor) {
        totalScore += pieceTotal;
      } else {
        totalScore -= pieceTotal;
      }
    }
  }

  return totalScore;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  botColor: 'w' | 'b'
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess, botColor);
  }

  const moves = chess.moves({ verbose: true });
  // Prioritize captures and checks for faster alpha-beta cutoffs
  moves.sort((a, b) => {
    const aScore = (a.captured ? 10 : 0) + (a.san.includes('+') ? 5 : 0);
    const bScore = (b.captured ? 10 : 0) + (b.san.includes('+') ? 5 : 0);
    return bScore - aScore;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, false, botColor);
      chess.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, true, botColor);
      chess.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function computeBestMove(chess: Chess, botLevel: number, botColor: 'w' | 'b'): Move | null {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  // Level 1: Pipoca (casual fun, 80% random, 20% captures)
  if (botLevel === 1) {
    const captures = legalMoves.filter(m => !!m.captured);
    if (captures.length > 0 && Math.random() < 0.25) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Level 2: Sr. Faísca (greedy capture + 1-ply search with slight randomness)
  if (botLevel === 2) {
    let bestScore = -Infinity;
    let candidates: Move[] = [];
    for (const move of legalMoves) {
      chess.move(move);
      const score = evaluateBoard(chess, botColor) + (Math.random() * 20 - 10);
      chess.undo();
      if (score > bestScore) {
        bestScore = score;
        candidates = [move];
      } else if (Math.abs(score - bestScore) < 5) {
        candidates.push(move);
      }
    }
    return candidates[Math.floor(Math.random() * candidates.length)] || legalMoves[0];
  }

  // Level 3 to 5: Minimax with alpha-beta pruning
  const depth = botLevel === 3 ? 2 : botLevel === 4 ? 3 : 3; // depth 3 is snappy in browser while very strong
  let bestScore = -Infinity;
  let bestMoves: Move[] = [];

  for (const move of legalMoves) {
    chess.move(move);
    let score = minimax(chess, depth - 1, -Infinity, Infinity, false, botColor);
    // Add tiny noise for level 3 to introduce variety
    if (botLevel === 3) {
      score += (Math.random() * 8 - 4);
    }
    chess.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] || legalMoves[0];
}

export function generateBotReaction(
  botId: number,
  move: Move,
  chess: Chess,
  humanPlayerColor: 'w' | 'b'
): string {
  const bot = BOT_PROFILES[botId] || BOT_PROFILES[1];
  const isBotMove = move.color !== humanPlayerColor;

  if (chess.isCheckmate()) {
    return isBotMove ? bot.winQuote : bot.loseQuote;
  }

  if (chess.isCheck()) {
    if (isBotMove) {
      const checkPhrases = [
        `Xeque no seu Rei! Atenção!`,
        `Cuidado com a sua defesa!`,
        `Meu lance colocou você em xeque! Como vai responder?`,
        `Xeque! Sentiu a pressão no tabuleiro?`
      ];
      return checkPhrases[Math.floor(Math.random() * checkPhrases.length)];
    } else {
      const checkedPhrases = [
        `Bom xeque! Deixe-me recolher meu Rei.`,
        `Opa, bela investida contra meu Rei!`,
        `Você armou um ataque perigoso!`
      ];
      return checkedPhrases[Math.floor(Math.random() * checkedPhrases.length)];
    }
  }

  if (move.captured) {
    const pieceNames: Record<string, string> = {
      p: 'peão',
      n: 'cavalo',
      b: 'bispo',
      r: 'torre',
      q: 'dama'
    };
    const capturedName = pieceNames[move.captured] || 'peça';
    if (isBotMove) {
      const botCapturePhrases = [
        `Capturei seu ${capturedName}!`,
        `Mais uma peça para minha conta: seu ${capturedName}!`,
        `Vantagem material! Seu ${capturedName} foi para o cemitério.`
      ];
      return botCapturePhrases[Math.floor(Math.random() * botCapturePhrases.length)];
    } else {
      const humanCapturePhrases = [
        `Ah, não! Meu ${capturedName}! Vou recuperar isso.`,
        `Belo golpe levando meu ${capturedName}!`,
        `Você levou meu ${capturedName}, mas o jogo ainda não acabou!`
      ];
      return humanCapturePhrases[Math.floor(Math.random() * humanCapturePhrases.length)];
    }
  }

  const genericRemarks = [
    `Interessante posição... calculando desdobramentos.`,
    `Gosto de como o tabuleiro está se desenvolvendo.`,
    `A partida está acirrada! Vamos ver os próximos passos.`,
    `Minha vez de orquestrar as peças!`,
    `Excelente partida até aqui!`
  ];
  return genericRemarks[Math.floor(Math.random() * genericRemarks.length)];
}
