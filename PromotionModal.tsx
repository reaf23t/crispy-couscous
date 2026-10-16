import React from 'react';

interface PromotionModalProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  color,
  onSelect
}) => {
  if (!isOpen) return null;

  const pieces: { type: 'q' | 'r' | 'b' | 'n'; label: string; symbol: string }[] = [
    { type: 'q', label: 'Dama', symbol: color === 'w' ? '♕' : '♛' },
    { type: 'r', label: 'Torre', symbol: color === 'w' ? '♖' : '♜' },
    { type: 'b', label: 'Bispo', symbol: color === 'w' ? '♗' : '♝' },
    { type: 'n', label: 'Cavalo', symbol: color === 'w' ? '♘' : '♞' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#09152e] border border-blue-500/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-1">Promoção de Peão</h3>
        <p className="text-slate-300 text-xs mb-5">
          Escolha em qual peça deseja transformar seu peão promovido:
        </p>

        <div className="grid grid-cols-4 gap-3">
          {pieces.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className="bg-blue-950/60 hover:bg-blue-600/30 border border-blue-800/60 hover:border-cyan-400 p-3 rounded-2xl flex flex-col items-center gap-1 cursor-pointer transition-all hover:scale-105 group"
            >
              <span className="text-3xl text-cyan-300 group-hover:scale-110 transition-transform">
                {p.symbol}
              </span>
              <span className="text-[11px] font-semibold text-slate-200">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
