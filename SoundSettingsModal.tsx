import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Square, X, Music, Check } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange
}) => {
  const [testingTrack, setTestingTrack] = useState<'victory' | 'defeat' | null>(null);

  if (!isOpen) return null;

  const handleTestVictory = async () => {
    if (testingTrack === 'victory') {
      soundManager.stopCelebrations();
      setTestingTrack(null);
    } else {
      setTestingTrack('victory');
      await soundManager.playVictorySound();
    }
  };

  const handleTestDefeat = async () => {
    if (testingTrack === 'defeat') {
      soundManager.stopCelebrations();
      setTestingTrack(null);
    } else {
      setTestingTrack('defeat');
      await soundManager.playDefeatSound();
    }
  };

  const handleClose = () => {
    soundManager.stopCelebrations();
    setTestingTrack(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#09152e] border border-blue-600/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-blue-900/40 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Configurações de Áudio & Músicas</h3>
            <p className="text-xs text-slate-400">Trilhas de vitória, derrota e efeitos sonoros</p>
          </div>
        </div>

        {/* Volume & Mute Controls */}
        <div className="bg-[#060e21] border border-blue-900/50 rounded-2xl p-4 mb-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Volume Principal</span>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMute}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isMuted
                  ? 'bg-red-950/40 border-red-500/40 text-red-300'
                  : 'bg-blue-900/30 border-blue-600/40 text-cyan-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? 'Mudo' : 'Ativo'}</span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="flex-1 accent-cyan-400 h-2 bg-blue-950 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Track Previews */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-300">Testar Músicas da Partida:</span>

          {/* Victory Track */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/40 border border-blue-900/60">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🏆</span>
              <div>
                <p className="text-xs font-bold text-slate-100">Música de Vitória</p>
                <p className="text-[11px] text-cyan-400 font-medium">Intro UEFA Champions League</p>
              </div>
            </div>
            <button
              onClick={handleTestVictory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold cursor-pointer transition-all"
            >
              {testingTrack === 'victory' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Parar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Ouvir</span>
                </>
              )}
            </button>
          </div>

          {/* Defeat Track */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/40 border border-blue-900/60">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🪑</span>
              <div>
                <p className="text-xs font-bold text-slate-100">Música de Derrota</p>
                <p className="text-[11px] text-red-400 font-medium">Pegue seu Banquinho - Raul Gil</p>
              </div>
            </div>
            <button
              onClick={handleTestDefeat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-semibold cursor-pointer transition-all"
            >
              {testingTrack === 'defeat' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Parar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Ouvir</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
