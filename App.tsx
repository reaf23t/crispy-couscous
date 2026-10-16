import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Chess3DCanvas } from './components/Chess3DCanvas';
import { HUD } from './components/HUD';
import { CapturedTray } from './components/CapturedTray';
import { MoveHistoryDrawer } from './components/MoveHistoryDrawer';
import { ChatBox, ChatMessage } from './components/ChatBox';
import { WelcomeModal } from './components/Modals/WelcomeModal';
import { GameOverModal } from './components/Modals/GameOverModal';
import { PromotionModal } from './components/Modals/PromotionModal';
import { SoundSettingsModal } from './components/Modals/SoundSettingsModal';
import { DownloadModal } from './components/Modals/DownloadModal';
import { GameMode, PieceColor, CapturedPieces, MoveRecord } from './types/chess';
import { BOT_PROFILES, computeBestMove, generateBotReaction } from './utils/aiEngine';
import { soundManager } from './utils/soundEffects';

export default function App() {
  // Chess engine instance
  const [chess] = useState(() => new Chess());
  const [, setTick] = useState(0); // Force re-render on chess state change

  // Game configuration & modes
  const [gameMode, setGameMode] = useState<GameMode>('BOT');
  const [botLevel, setBotLevel] = useState<number>(1);
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');

  // UI state
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(true);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<'white' | 'black' | 'top' | 'free'>('white');

  // Audio settings
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isPlayingEndAudio, setIsPlayingEndAudio] = useState<boolean>(false);

  // Board interaction state
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Game tracking
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [captured, setCaptured] = useState<CapturedPieces>({ w: [], b: [] });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Online multiplayer state
  const [onlineRoomCode, setOnlineRoomCode] = useState<string | null>(null);
  const [isOpponentConnected, setIsOpponentConnected] = useState<boolean>(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persistent Player session ID for this browser tab
  const playerIdRef = useRef<string>(
    typeof window !== 'undefined'
      ? sessionStorage.getItem('chess_player_id') ||
        (() => {
          const id = 'user_' + Math.random().toString(36).substring(2, 9);
          sessionStorage.setItem('chess_player_id', id);
          return id;
        })()
      : 'player-1'
  );

  // Bot thinking ref
  const isBotThinkingRef = useRef<boolean>(false);

  // Recalculate captured pieces by counting missing pieces
  const updateCapturedPieces = useCallback(() => {
    const fullSet: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
    const currentCounts = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 } as Record<string, number>,
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 } as Record<string, number>
    };

    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          currentCounts[piece.color][piece.type]++;
        }
      }
    }

    const capturedW: string[] = [];
    const capturedB: string[] = [];

    for (const type of ['p', 'n', 'b', 'r', 'q']) {
      const lostW = fullSet[type] - currentCounts.w[type];
      for (let i = 0; i < lostW; i++) capturedW.push(type);

      const lostB = fullSet[type] - currentCounts.b[type];
      for (let i = 0; i < lostB; i++) capturedB.push(type);
    }

    setCaptured({ w: capturedW, b: capturedB });
  }, [chess]);

  // Handle Game Over triggers & victory / defeat audio
  const handleGameOver = useCallback((customWinner?: 'w' | 'b' | 'draw' | null) => {
    setIsGameOverOpen(true);
    setIsPlayingEndAudio(true);

    let winner = customWinner;
    if (!winner && chess.isCheckmate()) {
      winner = chess.turn() === 'w' ? 'b' : 'w';
    }

    if (winner && winner !== 'draw') {
      const iWon = winner === playerColor;
      if (iWon) {
        // I won -> Play UEFA Champions League anthem ("intro-uefa...")!
        soundManager.playVictorySound();
      } else {
        // I lost -> Play "Pegue seu banquinho e saia de mansinho..."!
        soundManager.playDefeatSound();
      }
    } else {
      soundManager.stopCelebrations();
    }
  }, [chess, playerColor]);

  // Execute a verified legal move
  const applyMove = useCallback(
    (from: Square, to: Square, promotionPiece?: 'q' | 'r' | 'b' | 'n'): boolean => {
      try {
        const move = chess.move({
          from,
          to,
          promotion: promotionPiece || 'q'
        });

        if (!move) return false;

        // Play sound effects
        if (move.captured) {
          soundManager.playCaptureSound();
        } else {
          soundManager.playMoveSound();
        }

        if (chess.inCheck()) {
          setTimeout(() => soundManager.playCheckSound(), 120);
        }

        // Update last move and board state
        setLastMove({ from: move.from, to: move.to });
        setTick((t) => t + 1);

        // Record history
        const newRecord: MoveRecord = {
          moveNumber: Math.ceil(chess.history().length / 2),
          color: move.color,
          san: move.san,
          from: move.from,
          to: move.to,
          captured: move.captured,
          piece: move.piece
        };
        setMoveHistory((prev) => [...prev, newRecord]);

        updateCapturedPieces();

        // Broadcast to server if playing online
        if (gameMode === 'ONLINE' && onlineRoomCode) {
          fetch(`/api/rooms/${onlineRoomCode}/move`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fen: chess.fen(),
              move: {
                from: move.from,
                to: move.to,
                san: move.san,
                captured: move.captured,
                color: move.color,
                promotion: promotionPiece || 'q'
              },
              turn: chess.turn(),
              isGameOver: chess.isGameOver(),
              winner: chess.isCheckmate() ? (chess.turn() === 'w' ? 'b' : 'w') : chess.isDraw() ? 'draw' : null
            })
          }).catch((err) => console.error('Error posting move to online room:', err));
        }

        // Also broadcast via BroadcastChannel for multi-tab testing
        if (gameMode === 'ONLINE' && onlineRoomCode && broadcastChannelRef.current) {
          broadcastChannelRef.current.postMessage({
            type: 'MOVE',
            roomCode: onlineRoomCode,
            from,
            to,
            promotion: promotionPiece || 'q',
            fen: chess.fen()
          });
        }

        // Check if game ended
        if (chess.isGameOver()) {
          handleGameOver();
        }

        return true;
      } catch (err) {
        console.warn('Move error:', err);
        return false;
      }
    },
    [chess, gameMode, onlineRoomCode, updateCapturedPieces, handleGameOver]
  );

  // Make Bot Move
  const triggerBotMove = useCallback(() => {
    if (chess.isGameOver() || isBotThinkingRef.current) return;
    const botColor: PieceColor = playerColor === 'w' ? 'b' : 'w';
    if (chess.turn() !== botColor) return;

    isBotThinkingRef.current = true;

    setTimeout(() => {
      const bestMove = computeBestMove(chess, botLevel, botColor);
      if (bestMove) {
        applyMove(bestMove.from as Square, bestMove.to as Square, bestMove.promotion as 'q');

        // Bot contextual reaction
        const bot = BOT_PROFILES[botLevel];
        const reaction = generateBotReaction(botLevel, bestMove, chess, playerColor);
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: bot.name,
            text: reaction,
            avatar: bot.avatar,
            isBot: true
          }
        ]);
      }
      isBotThinkingRef.current = false;
    }, 550);
  }, [chess, botLevel, playerColor, applyMove]);

  // Watch for bot turn in BOT mode
  useEffect(() => {
    if (gameMode === 'BOT' && !isWelcomeOpen && !isGameOverOpen) {
      const botColor: PieceColor = playerColor === 'w' ? 'b' : 'w';
      if (chess.turn() === botColor) {
        triggerBotMove();
      }
    }
  }, [chess, gameMode, playerColor, isWelcomeOpen, isGameOverOpen, triggerBotMove]);

  // Handle square clicks on 3D board
  const handleSquareClick = (square: Square) => {
    if (isGameOverOpen || isBotThinkingRef.current) return;

    // BOT mode: prevent clicking during bot's turn
    if (gameMode === 'BOT' && chess.turn() !== playerColor) return;

    // ONLINE mode: strictly enforce turn and player color!
    if (gameMode === 'ONLINE') {
      if (chess.turn() !== playerColor) {
        // It is not this player's turn!
        return;
      }
    }

    const piece = chess.get(square);

    // If a piece is already selected and clicked square is one of legal targets:
    if (selectedSquare) {
      const isTargetValid = possibleMoves.some((m) => m.to === square);

      if (isTargetValid) {
        // Check for pawn promotion (White moving to rank 8 or Black to rank 1)
        const selectedPiece = chess.get(selectedSquare);
        if (
          selectedPiece &&
          selectedPiece.type === 'p' &&
          ((selectedPiece.color === 'w' && square[1] === '8') ||
            (selectedPiece.color === 'b' && square[1] === '1'))
        ) {
          setPendingPromotion({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setPossibleMoves([]);
          return;
        }

        applyMove(selectedSquare, square);
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }
    }

    // Otherwise, select piece of the current turn
    if (piece && piece.color === chess.turn()) {
      if (gameMode === 'ONLINE' && piece.color !== playerColor) {
        // Cannot select opponent's pieces in online mode
        return;
      }
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setPossibleMoves(moves);
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  // Promotion choice execution
  const handleSelectPromotion = (promo: 'q' | 'r' | 'b' | 'n') => {
    if (pendingPromotion) {
      applyMove(pendingPromotion.from, pendingPromotion.to, promo);
      setPendingPromotion(null);
    }
  };

  // Player resigns (immediate defeat -> plays "Pegue seu banquinho"!)
  const handleResign = () => {
    if (chess.isGameOver()) return;

    if (gameMode === 'ONLINE' && onlineRoomCode) {
      fetch(`/api/rooms/${onlineRoomCode}/resign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resigningPlayerColor: playerColor })
      }).catch((e) => console.error(e));
    }

    setIsGameOverOpen(true);
    setIsPlayingEndAudio(true);
    soundManager.playDefeatSound();
  };

  // Reset Board / Rematch
  const handleResetGame = () => {
    chess.reset();
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setMoveHistory([]);
    setCaptured({ w: [], b: [] });
    setIsGameOverOpen(false);
    soundManager.stopCelebrations();
    setIsPlayingEndAudio(false);
    setTick((t) => t + 1);

    if (gameMode === 'ONLINE' && onlineRoomCode) {
      fetch(`/api/rooms/${onlineRoomCode}/reset`, { method: 'POST' }).catch((e) => console.error(e));
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'RESET', roomCode: onlineRoomCode });
      }
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'Sistema',
        text: 'A partida foi reiniciada! Boa sorte a ambos.',
        color: '#60a5fa'
      }
    ]);
  };

  // Start vs Bot mode
  const handleStartBotGame = (level: number, color: PieceColor) => {
    closeOnlineConnections();
    setGameMode('BOT');
    setBotLevel(level);
    setPlayerColor(color);
    setCameraPreset(color === 'w' ? 'white' : 'black');
    setOnlineRoomCode(null);
    setIsWelcomeOpen(false);
    handleResetGame();

    const bot = BOT_PROFILES[level];
    setChatMessages([
      {
        id: '1',
        sender: bot.name,
        text: bot.intro,
        avatar: bot.avatar,
        isBot: true
      }
    ]);
  };

  // Start 2P Local mode
  const handleStartLocalGame = () => {
    closeOnlineConnections();
    setGameMode('LOCAL');
    setPlayerColor('w');
    setCameraPreset('white');
    setOnlineRoomCode(null);
    setIsWelcomeOpen(false);
    handleResetGame();

    setChatMessages([
      {
        id: '1',
        sender: 'Sistema',
        text: 'Modo 2 Jogadores Local iniciado. Ambos os jogadores compartilham a mesma tela!',
        color: '#34d399'
      }
    ]);
  };

  // Close previous SSE / Polling / Broadcast
  const closeOnlineConnections = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.close();
      broadcastChannelRef.current = null;
    }
  };

  // Connect to Online Room via SSE + Fallback Polling
  const connectToOnlineRoom = useCallback((code: string, myAssignedColor: PieceColor) => {
    closeOnlineConnections();

    // 1. Setup Server-Sent Events (SSE) for instantaneous pushes
    const es = new EventSource(`/api/rooms/${code}/events`);
    eventSourceRef.current = es;

    const handleRoomState = (data: any) => {
      if (!data) return;

      // Update opponent status
      const hasBoth = Boolean(data.whitePlayerId && data.blackPlayerId);
      setIsOpponentConnected(hasBoth);

      // If FEN is newer or different from local chess FEN
      if (data.fen && data.fen !== chess.fen()) {
        try {
          chess.load(data.fen);
          setLastMove(data.lastMove || null);
          updateCapturedPieces();
          setTick((t) => t + 1);

          // Play move sound
          if (data.lastMove) {
            soundManager.playMoveSound();
          }

          if (data.isGameOver) {
            handleGameOver(data.winner);
          }
        } catch (e) {
          console.error('Error loading remote FEN:', e);
        }
      }

      // Sync chat messages
      if (Array.isArray(data.chat) && data.chat.length > 0) {
        setChatMessages(data.chat);
      }
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleRoomState(data);
      } catch (err) {
        console.error('Error parsing SSE event data:', err);
      }
    };

    es.onerror = () => {
      // If SSE errors or drops, fallback to HTTP polling
    };

    // 2. Setup periodic polling every 1.5s as a secondary reliable sync
    const pollInterval = setInterval(() => {
      fetch(`/api/rooms/${code}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.success && json.room) {
            handleRoomState(json.room);
          }
        })
        .catch(() => {});
    }, 1500);
    pollingIntervalRef.current = pollInterval;

    // 3. Setup BroadcastChannel for multi-tab fallback
    try {
      const bc = new BroadcastChannel(`chess-room-${code}`);
      bc.onmessage = (event) => {
        const d = event.data;
        if (d && d.roomCode === code) {
          if (d.type === 'MOVE') {
            try {
              chess.move({ from: d.from, to: d.to, promotion: d.promotion || 'q' });
              setLastMove({ from: d.from, to: d.to });
              updateCapturedPieces();
              setTick((t) => t + 1);
              soundManager.playMoveSound();
            } catch (e) {}
          } else if (d.type === 'RESET') {
            chess.reset();
            setSelectedSquare(null);
            setPossibleMoves([]);
            setLastMove(null);
            setCaptured({ w: [], b: [] });
            setTick((t) => t + 1);
          }
        }
      };
      broadcastChannelRef.current = bc;
    } catch (e) {}
  }, [chess, updateCapturedPieces, handleGameOver]);

  // Online Multiplayer: Create Room
  const handleCreateOnlineRoom = async () => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: playerIdRef.current })
      });
      const data = await res.json();
      if (data.success && data.room) {
        const code = data.room.code;
        setOnlineRoomCode(code);
        setGameMode('ONLINE');
        setPlayerColor('w');
        setCameraPreset('white');
        setIsWelcomeOpen(false);
        setIsOpponentConnected(false);
        handleResetGame();

        // Update URL query string with room code so user can copy and share
        const newUrl = `${window.location.pathname}?room=${code}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);

        connectToOnlineRoom(code, 'w');

        setChatMessages([
          {
            id: '1',
            sender: 'Sistema',
            text: `Sala ${code} criada! Você é as Brancas. Compartilhe o link com seu amigo para ele entrar como Pretas!`,
            color: '#38bdf8'
          }
        ]);
      }
    } catch (err) {
      console.error('Error creating online room:', err);
    }
  };

  // Online Multiplayer: Join Room
  const handleJoinOnlineRoom = async (codeToJoin: string) => {
    const code = codeToJoin.trim().toUpperCase();
    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: playerIdRef.current })
      });
      const data = await res.json();
      if (data.success && data.room) {
        const assignedColor: PieceColor = data.assignedColor || 'b';
        setOnlineRoomCode(code);
        setGameMode('ONLINE');
        setPlayerColor(assignedColor);
        setCameraPreset(assignedColor === 'w' ? 'white' : 'black');
        setIsWelcomeOpen(false);
        setIsOpponentConnected(true);

        // Load existing FEN
        if (data.room.fen) {
          chess.load(data.room.fen);
          setLastMove(data.room.lastMove || null);
          updateCapturedPieces();
          setTick((t) => t + 1);
        }

        // Update URL query string
        const newUrl = `${window.location.pathname}?room=${code}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);

        connectToOnlineRoom(code, assignedColor);

        setChatMessages([
          {
            id: '1',
            sender: 'Sistema',
            text: `Conectado à sala ${code}! Você joga com as ${assignedColor === 'w' ? 'Brancas' : 'Pretas'}.`,
            color: '#34d399'
          }
        ]);
      } else {
        alert(data.error || 'Não foi possível entrar na sala');
      }
    } catch (err) {
      console.error('Error joining room:', err);
      alert('Erro de conexão ao entrar na sala. Verifique o código e tente novamente.');
    }
  };

  // Check URL query param on mount for instant shared room entry (?room=CHESS-XXXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      handleJoinOnlineRoom(roomParam);
    }

    return () => {
      closeOnlineConnections();
    };
  }, []);

  // Send Chat message
  const handleSendChat = (text: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: gameMode === 'ONLINE' ? `Jogador (${playerColor === 'w' ? 'Brancas' : 'Pretas'})` : 'Você',
      text,
      color: playerColor === 'w' ? '#38bdf8' : '#a78bfa'
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Send to server in online mode
    if (gameMode === 'ONLINE' && onlineRoomCode) {
      fetch(`/api/rooms/${onlineRoomCode}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMsg })
      }).catch((e) => console.error(e));

      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'CHAT',
          roomCode: onlineRoomCode,
          message: newMsg
        });
      }
    }

    // Bot reply simulation
    if (gameMode === 'BOT') {
      setTimeout(() => {
        const bot = BOT_PROFILES[botLevel];
        const replies = [
          'Concentrado no jogo! Cada lance conta.',
          'Interessante estratégia... Estou calculando meus caminhos.',
          'Muito bom! Vamos ver como a posição evolui.',
          'Um grande duelo nesta arena azul!'
        ];
        const botReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: bot.name,
          text: replies[Math.floor(Math.random() * replies.length)],
          avatar: bot.avatar,
          isBot: true
        };
        setChatMessages((prev) => [...prev, botReply]);
      }, 1000);
    }
  };

  // Sound settings
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundManager.setVolume(newVol);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundManager.setMuted(nextMute);
  };

  const handleToggleEndAudio = () => {
    if (isPlayingEndAudio) {
      soundManager.stopCelebrations();
      setIsPlayingEndAudio(false);
    } else {
      if (isGameOverOpen) {
        const winner = chess.turn() === 'w' ? 'b' : 'w';
        const playerWon = winner === playerColor;
        if (playerWon) {
          soundManager.playVictorySound();
        } else {
          soundManager.playDefeatSound();
        }
        setIsPlayingEndAudio(true);
      }
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030712] text-slate-100">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Chess3DCanvas
          chess={chess}
          playerColor={playerColor}
          onSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
          possibleMoves={possibleMoves}
          lastMove={lastMove}
          cameraPreset={cameraPreset}
        />
      </div>

      {/* Floating HUD Header */}
      <HUD
        gameMode={gameMode}
        botLevel={botLevel}
        currentTurn={chess.turn()}
        playerColor={playerColor}
        inCheck={chess.inCheck()}
        onOpenMenu={() => setIsWelcomeOpen(true)}
        onResetGame={handleResetGame}
        onResign={handleResign}
        onOpenAudioSettings={() => setIsSoundModalOpen(true)}
        cameraPreset={cameraPreset}
        onSetCameraPreset={setCameraPreset}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onlineRoomCode={onlineRoomCode}
        onOpenDownload={() => setIsDownloadModalOpen(true)}
        isOpponentConnected={isOpponentConnected}
      />

      {/* Captured Pieces Tray (Top Left) */}
      <div className="fixed top-20 left-4 z-20 pointer-events-auto">
        <CapturedTray captured={captured} playerColor={playerColor} />
      </div>

      {/* Move History Drawer (Top Right) */}
      <MoveHistoryDrawer
        history={moveHistory}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
      />

      {/* Chat Box (Bottom Left) */}
      <ChatBox
        messages={chatMessages}
        onSendMessage={handleSendChat}
        botProfile={gameMode === 'BOT' ? BOT_PROFILES[botLevel] : null}
        gameMode={gameMode}
      />

      {/* 3D Navigation Controls hint (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-10 hidden md:flex items-center gap-2 bg-[#081329]/80 border border-blue-900/50 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs text-blue-200/70 shadow-lg pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        <span>Arraste para girar a câmera • Scroll para zoom</span>
      </div>

      {/* Welcome & Game Mode Chooser Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onStartBotGame={handleStartBotGame}
        onStartLocalGame={handleStartLocalGame}
        onCreateOnlineRoom={handleCreateOnlineRoom}
        onJoinOnlineRoom={handleJoinOnlineRoom}
        currentRoomCode={onlineRoomCode}
        onOpenDownload={() => setIsDownloadModalOpen(true)}
      />

      {/* Pawn Promotion Modal */}
      <PromotionModal
        isOpen={pendingPromotion !== null}
        color={chess.turn()}
        onSelect={handleSelectPromotion}
      />

      {/* Game Over Modal (Victory / Defeat Tracks) */}
      <GameOverModal
        isOpen={isGameOverOpen}
        isWin={
          chess.isCheckmate() &&
          ((chess.turn() === 'w' && playerColor === 'b') ||
            (chess.turn() === 'b' && playerColor === 'w'))
        }
        isDraw={chess.isDraw()}
        winnerColor={chess.isCheckmate() ? (chess.turn() === 'w' ? 'b' : 'w') : null}
        playerColor={playerColor}
        gameMode={gameMode}
        onRestart={handleResetGame}
        onMenu={() => {
          setIsGameOverOpen(false);
          setIsWelcomeOpen(true);
          soundManager.stopCelebrations();
        }}
        isPlayingAudio={isPlayingEndAudio}
        onToggleAudio={handleToggleEndAudio}
      />

      {/* Sound Settings & Audio Previews Modal */}
      <SoundSettingsModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        volume={volume}
        onVolumeChange={handleVolumeChange}
      />

      {/* Download Site Files Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
