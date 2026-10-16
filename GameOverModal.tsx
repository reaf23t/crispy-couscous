import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Volume2, VolumeX, RotateCcw, Home, Sparkles, Frown } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';

interface GameOverModalProps {
  isOpen: boolean;
  isWin: boolean;
  isDraw: boolean;
  winnerColor: 'w' | 'b' | null;
  playerColor: 'w' | 'b';
  gameMode: string;
  onRestart: () => void;
  onMenu: () => void;
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isWin,
  isDraw,
  winnerColor,
  playerColor,
  gameMode,
  onRestart,
  onMenu,
  isPlayingAudio,
  onToggleAudio
}) => {
  useEffect(() => {
    if (isOpen && isWin) {
      // Fire festive champions confetti
      const end = Date.now() + 3000;
      const colors = ['#38bdf8', '#fbbf24', '#ffffff', '#3b82f6'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen, isWin]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative bg-gradient-to-b from-[#0c1c3d] to-[#060e21] border border-blue-500/40 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-blue-900/50 text-center flex flex-col items-center overflow-hidden">
        {/* Glow ambient background */}
        <div
          className={`absolute -top-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-40 ${
            isWin ? 'bg-cyan-500' : isDraw ? 'bg-indigo-500' : 'bg-red-500'
          }`}
        />

        {/* Dynamic Header & Icon */}
        {isWin ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30 mb-4 animate-bounce">
              <Trophy className="w-11 h-11" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/40">
              <Sparkles className="w-3.5 h-3.5" />
              Vitória dos Campeões!
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              VOCÊ VENCEU! 🎉
            </h2>
            <p className="text-slate-300 text-sm mt-2 max-w-xs leading-relaxed">
              Tocando o hino da <strong className="text-cyan-300 font-bold">UEFA Champions League</strong> para celebrar seu título!
            </p>
          </div>
        ) : isDraw ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-xl mb-4">
              <span className="text-4xl">🤝</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Empate Técnico!</h2>
            <p className="text-slate-300 text-sm mt-2 max-w-xs">
              Uma batalha de mentes perfeitamente equilibrada. Ninguém cedeu espaço no tabuleiro!
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Defeat: Meme "Pegue seu banquinho" */}
            <div className="w-20 h-20 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-4xl shadow-xl shadow-red-900/30 mb-4 animate-pulse">
              🪑
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider mb-2 border border-red-500/40">
              Derrota no Tabuleiro
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-red-400 tracking-tight">
              PEGUE SEU BANQUINHO!
            </h2>
            <p className="text-slate-200 text-base font-semibold italic mt-1 text-amber-300">
              "... e saia de mansinho!" 🎶
            </p>
            <p className="text-slate-400 text-xs mt-2 max-w-xs leading-relaxed">
              Desta vez o adversário levou a melhor! Hora de sacudir a poeira e tentar a revanche.
            </p>
          </div>
        )}

        {/* Audio control banner */}
        <div className="mt-6 w-full p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-base">{isWin ? '🎵' : isDraw ? '🎶' : '🪑'}</span>
            <span className="font-medium truncate">
              {isWin
                ? 'Intro UEFA Champions League'
                : isDraw
                ? 'Fim de Jogo'
                : 'Pegue seu Banquinho - Raul Gil'}
            </span>
          </div>
          <button
            onClick={onToggleAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-cyan-200 font-semibold cursor-pointer transition-all"
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>Ouvir</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
          <button
            onClick={onRestart}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Revanche / Jogar</span>
          </button>
          <button
            onClick={onMenu}
            className="bg-[#0b1733] hover:bg-[#12244f] text-slate-200 border border-blue-900/60 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Menu Inicial</span>
          </button>
        </div>
      </div>
    </div>
  );
};
