import React, { useState } from 'react';
import { Bot, Globe, Users, ChevronRight, Copy, Check, Sparkles, Download } from 'lucide-react';
import { GameMode, PieceColor } from '../../types/chess';
import { BOT_PROFILES } from '../../utils/aiEngine';

interface WelcomeModalProps {
  isOpen: boolean;
  onStartBotGame: (botLevel: number, playerColor: PieceColor) => void;
  onStartLocalGame: () => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: (roomCode: string) => void;
  currentRoomCode: string | null;
  onOpenDownload: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onStartBotGame,
  onStartLocalGame,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  currentRoomCode,
  onOpenDownload
}) => {
  const [selectedTab, setSelectedTab] = useState<'menu' | 'bot' | 'online'>('menu');
  const [chosenLevel, setChosenLevel] = useState<number>(1);
  const [chosenColor, setChosenColor] = useState<PieceColor>('w');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (currentRoomCode) {
      navigator.clipboard.writeText(currentRoomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative bg-gradient-to-b from-[#091738] via-[#07132e] to-[#04091a] border border-blue-600/40 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl shadow-blue-950/80 flex flex-col gap-6 overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 text-white shadow-xl shadow-blue-600/30 mb-1 border border-cyan-300/30">
            <span className="text-3xl font-serif">♔</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Xadrez 3D Master
          </h1>
          <p className="text-blue-200/80 text-xs md:text-sm max-w-md mx-auto">
            Arena de xadrez em tons de azul escuro. Enfrente inteligências artificiais com personalidades próprias ou desafie seus amigos!
          </p>
        </div>

        {/* TAB 1: MAIN MENU SELECTION */}
        {selectedTab === 'menu' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10">
            {/* Mode 1: vs Bot */}
            <button
              onClick={() => setSelectedTab('bot')}
              className="group bg-[#0c1f47]/80 hover:bg-[#122e6b] border border-blue-800/60 hover:border-cyan-400 p-4 rounded-2xl text-left transition-all flex flex-col justify-between shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-cyan-300 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform border border-blue-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                  <span>Jogar vs Bot / IA</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-[11px] text-blue-200/70 mt-1 leading-relaxed">
                  5 bots únicos: do Pipoca ao Grão-Mestre Zenith.
                </p>
              </div>
            </button>

            {/* Mode 2: Online */}
            <button
              onClick={() => setSelectedTab('online')}
              className="group bg-[#0c1f47]/80 hover:bg-[#122e6b] border border-blue-800/60 hover:border-cyan-400 p-4 rounded-2xl text-left transition-all flex flex-col justify-between shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform border border-indigo-500/30">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                  <span>Amigo de Longe</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-[11px] text-blue-200/70 mt-1 leading-relaxed">
                  Crie ou entre numa sala com código compartilhado.
                </p>
              </div>
            </button>

            {/* Mode 3: Local 2P */}
            <button
              onClick={onStartLocalGame}
              className="group bg-[#0c1f47]/80 hover:bg-[#122e6b] border border-blue-800/60 hover:border-cyan-400 p-4 rounded-2xl text-left transition-all flex flex-col justify-between shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform border border-emerald-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                  <span>2 Jogadores Local</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-[11px] text-blue-200/70 mt-1 leading-relaxed">
                  Jogue cara a cara na mesma tela com rotação de visão.
                </p>
              </div>
            </button>
          </div>

          {/* Download standalone file button */}
          <div className="pt-2 border-t border-blue-900/40 flex items-center justify-between text-xs">
            <span className="text-blue-300/80 text-[11px]">
              Deseja jogar offline ou ter o código do site?
            </span>
            <button
              onClick={onOpenDownload}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span>Baixar Arquivo do Site (.html / .zip)</span>
            </button>
          </div>
        </>
        )}

        {/* TAB 2: BOT LEVEL SELECTION */}
        {selectedTab === 'bot' && (
          <div className="flex flex-col gap-4 relative z-10 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-blue-900/50 pb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Escolha o Nível e a Cor do seu Jogo:</span>
              </h3>
              <button
                onClick={() => setSelectedTab('menu')}
                className="text-xs text-cyan-300 hover:text-white underline cursor-pointer"
              >
                Voltar
              </button>
            </div>

            {/* Bot List Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {Object.values(BOT_PROFILES).map((bot) => {
                const isSelected = chosenLevel === bot.id;
                return (
                  <button
                    key={bot.id}
                    onClick={() => setChosenLevel(bot.id)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/40 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-102 ring-1 ring-cyan-400'
                        : 'bg-[#091738]/80 hover:bg-[#0f2452] border-blue-900/60'
                    }`}
                  >
                    <div className="text-2xl">{bot.avatar}</div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      Nível {bot.id}
                    </span>
                    <span className="text-xs font-bold text-slate-100 truncate w-full">
                      {bot.name}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{bot.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected bot preview phrase */}
            <div className="bg-[#061026] border border-blue-900/60 p-3 rounded-2xl text-xs flex items-center gap-3">
              <span className="text-xl">{BOT_PROFILES[chosenLevel].avatar}</span>
              <p className="text-blue-200/90 italic">
                "{BOT_PROFILES[chosenLevel].intro}"
              </p>
            </div>

            {/* Color Chooser */}
            <div className="flex items-center justify-between bg-[#081533] p-3 rounded-2xl border border-blue-900/50">
              <span className="text-xs font-semibold text-slate-200">Jogar com as peças:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setChosenColor('w')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    chosenColor === 'w'
                      ? 'bg-white text-slate-900 shadow-md ring-2 ring-cyan-400'
                      : 'bg-blue-950/60 text-slate-400 border border-blue-900'
                  }`}
                >
                  <span className="text-sm">♔</span> Brancas (Primeiro)
                </button>
                <button
                  type="button"
                  onClick={() => setChosenColor('b')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    chosenColor === 'b'
                      ? 'bg-slate-900 text-cyan-300 border border-cyan-400 shadow-md ring-2 ring-cyan-400'
                      : 'bg-blue-950/60 text-slate-400 border border-blue-900'
                  }`}
                >
                  <span className="text-sm">♚</span> Pretas
                </button>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => onStartBotGame(chosenLevel, chosenColor)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Começar Duelo vs {BOT_PROFILES[chosenLevel].name}</span>
            </button>
          </div>
        )}

        {/* TAB 3: ONLINE MULTIPLAYER */}
        {selectedTab === 'online' && (
          <div className="flex flex-col gap-4 relative z-10 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-blue-900/50 pb-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Sala Online com Amigo:</span>
              </h3>
              <button
                onClick={() => setSelectedTab('menu')}
                className="text-xs text-cyan-300 hover:text-white underline cursor-pointer"
              >
                Voltar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Create Room */}
              <div className="bg-[#081533]/90 border border-blue-800/60 p-4 rounded-2xl flex flex-col justify-between gap-3 text-center">
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Criar Nova Sala</h4>
                  <p className="text-[11px] text-blue-200/70 mt-1">
                    Gera um código instantâneo para você compartilhar com seu amigo.
                  </p>
                </div>

                {currentRoomCode ? (
                  <div className="bg-[#040c1e] p-3 rounded-xl border border-cyan-500/40 flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-cyan-300 tracking-wider">
                      {currentRoomCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onCreateOnlineRoom}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    Gerar Código & Criar Sala
                  </button>
                )}
              </div>

              {/* Option B: Join Room */}
              <div className="bg-[#081533]/90 border border-blue-800/60 p-4 rounded-2xl flex flex-col justify-between gap-3 text-center">
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Entrar com Código</h4>
                  <p className="text-[11px] text-blue-200/70 mt-1">
                    Cole o código que seu amigo lhe enviou para se conectar.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ex: CHESS-9821"
                    className="flex-1 bg-[#040c1e] border border-blue-800 px-3 py-2 rounded-xl text-xs font-mono text-center tracking-widest text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 uppercase"
                  />
                  <button
                    onClick={() => {
                      if (joinCodeInput.trim()) {
                        onJoinOnlineRoom(joinCodeInput.trim());
                      }
                    }}
                    disabled={!joinCodeInput.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
