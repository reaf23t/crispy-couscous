import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MoveData {
  from: string;
  to: string;
  promotion?: string;
  san?: string;
  captured?: string;
  color?: string;
}

interface RoomChatMessage {
  id: string;
  sender: string;
  text: string;
  color?: string;
  avatar?: string;
  timestamp: number;
}

interface RoomState {
  code: string;
  fen: string;
  turn: 'w' | 'b';
  lastMove: { from: string; to: string } | null;
  history: MoveData[];
  whitePlayerId: string | null;
  blackPlayerId: string | null;
  whiteConnected: boolean;
  blackConnected: boolean;
  chat: RoomChatMessage[];
  isGameOver: boolean;
  winner: 'w' | 'b' | 'draw' | null;
  gameOverReason?: string;
  createdAt: number;
  updatedAt: number;
}

// In-memory rooms repository
const rooms = new Map<string, RoomState>();

// Active SSE connection clients per room code
const roomListeners = new Map<string, Set<Response>>();

function broadcastRoomUpdate(code: string) {
  const room = rooms.get(code);
  if (!room) return;

  const listeners = roomListeners.get(code);
  if (listeners && listeners.size > 0) {
    const payload = `data: ${JSON.stringify(room)}\n\n`;
    listeners.forEach((res) => {
      try {
        res.write(payload);
      } catch (err) {
        console.error('Error writing SSE payload:', err);
      }
    });
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Enable CORS so external or standalone requests can access room APIs
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Default starting FEN
  const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  // 1. Create a new room
  app.post('/api/rooms', (req: Request, res: Response) => {
    const { playerId } = req.body || {};
    const code = `CHESS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRoom: RoomState = {
      code,
      fen: STARTING_FEN,
      turn: 'w',
      lastMove: null,
      history: [],
      whitePlayerId: playerId || 'player-white',
      blackPlayerId: null,
      whiteConnected: true,
      blackConnected: false,
      chat: [
        {
          id: Date.now().toString(),
          sender: 'Sistema',
          text: `Sala ${code} criada! Aguardando o segundo jogador entrar...`,
          color: '#38bdf8',
          timestamp: Date.now()
        }
      ],
      isGameOver: false,
      winner: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    rooms.set(code, newRoom);
    res.json({ success: true, room: newRoom, assignedColor: 'w' });
  });

  // 2. Join an existing room
  app.post('/api/rooms/:code/join', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { playerId } = req.body || {};

    let room = rooms.get(code);
    if (!room) {
      // Auto-create room if entering directly via shared URL code
      room = {
        code,
        fen: STARTING_FEN,
        turn: 'w',
        lastMove: null,
        history: [],
        whitePlayerId: null,
        blackPlayerId: null,
        whiteConnected: false,
        blackConnected: false,
        chat: [],
        isGameOver: false,
        winner: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      rooms.set(code, room);
    }

    let assignedColor: 'w' | 'b' = 'b';
    if (!room.whitePlayerId) {
      room.whitePlayerId = playerId || 'player-white';
      room.whiteConnected = true;
      assignedColor = 'w';
    } else if (!room.blackPlayerId || room.blackPlayerId === playerId) {
      room.blackPlayerId = playerId || 'player-black';
      room.blackConnected = true;
      assignedColor = 'b';
    } else {
      // If both spots are occupied, assign spectator or reconnect
      assignedColor = 'b';
    }

    room.updatedAt = Date.now();
    room.chat.push({
      id: Date.now().toString(),
      sender: 'Sistema',
      text: `Jogador conectado como ${assignedColor === 'w' ? 'Brancas' : 'Pretas'}!`,
      color: '#34d399',
      timestamp: Date.now()
    });

    broadcastRoomUpdate(code);
    res.json({ success: true, room, assignedColor });
  });

  // 3. Get room state
  app.get('/api/rooms/:code', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Sala não encontrada' });
    }
    res.json({ success: true, room });
  });

  // 4. SSE (Server-Sent Events) Stream for real-time room updates
  app.get('/api/rooms/:code/events', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const room = rooms.get(code);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    });

    res.write('\n');

    if (!roomListeners.has(code)) {
      roomListeners.set(code, new Set());
    }
    roomListeners.get(code)!.add(res);

    // Send initial snapshot
    if (room) {
      res.write(`data: ${JSON.stringify(room)}\n\n`);
    }

    req.on('close', () => {
      const listeners = roomListeners.get(code);
      if (listeners) {
        listeners.delete(res);
        if (listeners.size === 0) {
          roomListeners.delete(code);
        }
      }
    });
  });

  // 5. Post move in room
  app.post('/api/rooms/:code/move', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Sala não encontrada' });
    }

    const { fen, move, turn, isGameOver, winner, gameOverReason } = req.body;
    if (!fen || !move) {
      return res.status(400).json({ success: false, error: 'Dados do lance incompletos' });
    }

    room.fen = fen;
    room.lastMove = { from: move.from, to: move.to };
    room.turn = turn || (room.turn === 'w' ? 'b' : 'w');
    room.history.push(move);
    room.updatedAt = Date.now();

    if (isGameOver) {
      room.isGameOver = true;
      room.winner = winner || null;
      room.gameOverReason = gameOverReason || 'Xeque-mate';
    }

    broadcastRoomUpdate(code);
    res.json({ success: true, room });
  });

  // 6. Post chat message in room
  app.post('/api/rooms/:code/chat', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Sala não encontrada' });
    }

    const { message } = req.body;
    if (!message || !message.text) {
      return res.status(400).json({ success: false, error: 'Mensagem vazia' });
    }

    const chatMsg: RoomChatMessage = {
      id: message.id || Date.now().toString(),
      sender: message.sender || 'Jogador',
      text: message.text,
      color: message.color || '#38bdf8',
      avatar: message.avatar,
      timestamp: Date.now()
    };

    room.chat.push(chatMsg);
    room.updatedAt = Date.now();

    broadcastRoomUpdate(code);
    res.json({ success: true, message: chatMsg });
  });

  // 7. Reset game in room
  app.post('/api/rooms/:code/reset', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Sala não encontrada' });
    }

    room.fen = STARTING_FEN;
    room.turn = 'w';
    room.lastMove = null;
    room.history = [];
    room.isGameOver = false;
    room.winner = null;
    room.updatedAt = Date.now();
    room.chat.push({
      id: Date.now().toString(),
      sender: 'Sistema',
      text: 'A partida online foi reiniciada! Vez das Brancas.',
      color: '#60a5fa',
      timestamp: Date.now()
    });

    broadcastRoomUpdate(code);
    res.json({ success: true, room });
  });

  // 8. Resign game in room
  app.post('/api/rooms/:code/resign', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const room = rooms.get(code);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Sala não encontrada' });
    }

    const { resigningPlayerColor } = req.body;
    const winnerColor = resigningPlayerColor === 'w' ? 'b' : 'w';

    room.isGameOver = true;
    room.winner = winnerColor;
    room.gameOverReason = 'Desistência';
    room.updatedAt = Date.now();
    room.chat.push({
      id: Date.now().toString(),
      sender: 'Sistema',
      text: `O jogador de ${resigningPlayerColor === 'w' ? 'Brancas' : 'Pretas'} abandonou a partida. Vitória das ${winnerColor === 'w' ? 'Brancas' : 'Pretas'}!`,
      color: '#ef4444',
      timestamp: Date.now()
    });

    broadcastRoomUpdate(code);
    res.json({ success: true, room });
  });

  // Vite Integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Full-stack Chess 3D server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
