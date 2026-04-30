import React from 'react';
import { X, Type, Sun, Moon, Languages, Sparkles, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => void;
  onReadingModeToggle?: () => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onUpdateSettings, onReadingModeToggle }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-app-bg border border-app-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-app-border flex items-center justify-between shrink-0">
            <h2 className="text-xl font-bold text-app-text flex items-center gap-2">
              Configurações
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-app-sidebar rounded-full text-app-taupe transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-8 overflow-y-auto flex-1">
            {/* Bible Font Size */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-app-taupe mb-2">
                <Type size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Fonte do Texto Bíblico</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'small', label: 'P', size: 'text-sm' },
                  { id: 'medium', label: 'M', size: 'text-base' },
                  { id: 'large', label: 'G', size: 'text-lg' },
                  { id: 'extra-large', label: 'GG', size: 'text-xl' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onUpdateSettings({ fontSize: f.id as any })}
                    className={`h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                      settings.fontSize === f.id
                        ? 'border-app-accent bg-app-accent/10 text-app-accent font-bold'
                        : 'border-app-border text-app-taupe hover:border-app-accent/50'
                    }`}
                  >
                    <span className={f.size}>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Line Spacing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-app-taupe mb-2">
                <div className="flex flex-col gap-0.5">
                  <div className="w-4 h-0.5 bg-current" />
                  <div className="w-4 h-0.5 bg-current" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Espaçamento Entre Linhas</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'tight', label: 'compacto' },
                  { id: 'relaxed', label: 'padrão' },
                  { id: 'loose', label: 'amplo' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onUpdateSettings({ lineSpacing: s.id as any })}
                    className={`h-12 rounded-xl border-2 flex items-center justify-center transition-all px-2 ${
                      settings.lineSpacing === s.id
                        ? 'border-app-accent bg-app-accent/10 text-app-accent font-bold'
                        : 'border-app-border text-app-taupe hover:border-app-accent/50'
                    }`}
                  >
                    <span className="text-xs capitalize">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Chat Font Size */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-app-taupe mb-2">
                <Sparkles size={16} className="text-app-accent" />
                <span className="text-xs font-bold uppercase tracking-widest">Fonte do Assistente IA</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'small', label: 'Pequena', size: 'text-xs' },
                  { id: 'medium', label: 'Média', size: 'text-sm' },
                  { id: 'large', label: 'Grande', size: 'text-base' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onUpdateSettings({ chatFontSize: f.id as any })}
                    className={`h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                      settings.chatFontSize === f.id
                        ? 'border-app-accent bg-app-accent/10 text-app-accent font-bold'
                        : 'border-app-border text-app-taupe hover:border-app-accent/50'
                    }`}
                  >
                    <span className={f.size}>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-app-taupe mb-2">
                {settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                <span className="text-xs font-bold uppercase tracking-widest">Tema Visual</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onUpdateSettings({ theme: 'light' })}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    settings.theme === 'light'
                      ? 'border-app-accent bg-blue-50 text-app-accent font-bold'
                      : 'border-app-border text-app-taupe hover:border-app-accent/50'
                  }`}
                >
                  <Sun size={20} />
                  <span>Claro</span>
                </button>
                <button
                  onClick={() => onUpdateSettings({ theme: 'dark' })}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    settings.theme === 'dark'
                      ? 'border-app-accent bg-slate-900 text-white font-bold'
                      : 'border-app-border text-app-taupe hover:border-app-accent/50'
                  }`}
                >
                  <Moon size={20} />
                  <span>Escuro</span>
                </button>
              </div>
            </div>

            {/* Reading Mode */}
            {onReadingModeToggle && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-app-taupe mb-2">
                  <Maximize size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Modo de Leitura</span>
                </div>
                <button
                  onClick={() => {
                    onReadingModeToggle();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-app-border bg-app-accent/5 text-app-accent font-bold hover:bg-app-accent/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Maximize size={20} />
                    <span>Ativar Modo Imersivo</span>
                  </div>
                  <div className="text-[10px] uppercase font-bold px-2 py-1 bg-app-accent text-white rounded">Foco total</div>
                </button>
                <p className="text-[10px] text-app-taupe text-center">
                  O modo leitura remove distrações e foca apenas no texto bíblico.
                </p>
              </div>
            )}

            {/* Translation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-app-taupe mb-2">
                <Languages size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Versão da Bíblia</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'almeida', label: 'Almeida (Tradicional)' },
                  { id: 'rccv', label: 'Almeida Revista e Corrigida (ARC)' }
                ].map((tr) => (
                  <button
                    key={tr.id}
                    onClick={() => onUpdateSettings({ translation: tr.id as any })}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      settings.translation === tr.id
                        ? 'border-app-accent bg-app-accent/5 text-app-accent font-bold'
                        : 'border-app-border text-app-taupe hover:border-app-accent/50'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span>{tr.label}</span>
                    </div>
                    {settings.translation === tr.id && (
                      <div className="w-2 h-2 rounded-full bg-app-accent" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-app-taupe text-center mt-4">
                As versões podem variar em disponibilidade dependendo do livro e capítulo.
              </p>
            </div>
          </div>

          <div className="p-6 bg-app-sidebar/50 border-t border-app-border">
            <button
              onClick={onClose}
              className="w-full py-4 bg-app-accent text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all"
            >
              Pronto
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
