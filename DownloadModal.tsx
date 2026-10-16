import React from 'react';
import { Download, FileCode, Archive, X, CheckCircle, ExternalLink } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative bg-[#09152e] border border-blue-500/40 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl shadow-blue-950/80 text-left overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-blue-900/40 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 text-white shadow-lg shadow-blue-600/30">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Baixar Arquivos do Site</h3>
            <p className="text-xs text-blue-200/70">
              Escolha o formato que deseja baixar para usar no seu computador:
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 mb-6">
          {/* Option 1: Standalone HTML */}
          <div className="bg-[#060e21] border border-blue-900/60 hover:border-cyan-400 p-4 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/20 text-cyan-300 border border-blue-500/30 mt-0.5">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-100">
                    Arquivo HTML Standalone
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                    .HTML Único
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Arquivo único com tudo embutido (3D, regras de xadrez, IA dos bots e as músicas em áudio base64). Roda offline com duplo clique no navegador!
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              <a
                href="/xadrez-3d-master.html"
                download="xadrez-3d-master.html"
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <Download className="w-4 h-4" />
                <span>Baixar .html</span>
              </a>
              <a
                href="/xadrez-3d-master.html"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800 text-blue-200 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Abrir direto</span>
              </a>
            </div>
          </div>

          {/* Option 2: Full ZIP Project */}
          <div className="bg-[#060e21] border border-blue-900/60 hover:border-indigo-400 p-4 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 mt-0.5">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-100">
                    Projeto Completo (Código Fonte)
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-500/30">
                    .ZIP
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Contém todo o projeto em React + TypeScript + Vite + Tailwind CSS + os arquivos originais MP3 e scripts.
                </p>
              </div>
            </div>

            <a
              href="/xadrez-3d-projeto.zip"
              download="xadrez-3d-projeto.zip"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Baixar .zip</span>
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-blue-900/40 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" /> Arquivos prontos e validados
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-slate-200 border border-blue-900/60 font-semibold cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
