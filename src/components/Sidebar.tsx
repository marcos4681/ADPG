/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book } from '../types';
import { PROTESTANT_BOOKS } from '../constants';
import { ChevronRight, ChevronDown, ChevronLeft, BookOpen, LogOut, LogIn, Clock, Youtube, Facebook, Instagram, Radio, Bell, Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import Logo from './Logo';

interface SidebarProps {
  currentBook: Book;
  currentChapter: number;
  onSelect: (book: Book, chapter: number) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onStudiesToggle?: () => void;
  onGoHome?: () => void;
  onGoBible?: () => void;
  onOpenVideoModal?: () => void;
  isLive?: boolean;
  onTestamentClick?: (testament: 'Antigo' | 'Novo') => void;
}

export default function Sidebar({ currentBook, currentChapter, onSelect, isOpen, onClose, onOpenLogin, onStudiesToggle, onGoHome, onGoBible, onOpenVideoModal, isLive = false, onTestamentClick }: SidebarProps) {
  const { user, loginWithGoogle, logout } = useAuth();
  const [isPlayingRadio, setIsPlayingRadio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleRadio = () => {
    if (audioRef.current) {
      if (isPlayingRadio) {
        audioRef.current.pause();
        setIsPlayingRadio(false);
      } else {
        // Reset the source to ensure we're playing the live stream from now
        audioRef.current.load();
        audioRef.current.play().then(() => {
          setIsPlayingRadio(true);
        }).catch(err => {
          console.error("Error playing radio:", err);
          setIsPlayingRadio(false);
        });
      }
    }
  };

  const testaments = ['Antigo', 'Novo'] as const;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 bg-app-sidebar border-r border-app-border transform transition-all duration-300 ease-in-out lg:relative ${
        isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-none'
      }`}
    >
      <div className="h-full flex flex-col w-72">
        <div className="p-4 flex items-start justify-between relative">
          <div className="flex flex-col w-full pr-8">
            <img 
              src="/logo.png" 
              alt="Assembleia de Deus Jardim Melvi" 
              className="w-full max-h-28 object-contain mb-4 drop-shadow-md hover:drop-shadow-xl transition-all duration-300 hover:scale-[1.02]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                document.getElementById('text-logo')!.style.display = 'flex';
              }} 
            />
            <div id="text-logo" className="w-full flex-col items-center" style={{ display: 'none' }}>
              <Logo />
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 text-app-taupe hover:text-app-accent hover:bg-white/5 rounded-full transition-colors z-50"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Estudos e Recursos */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-app-taupe uppercase tracking-widest px-2">Recursos da Igreja</p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onStudiesToggle?.();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center justify-between p-3 bg-app-accent/10 hover:bg-app-accent/20 text-app-accent rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-app-accent text-white p-1.5 rounded-lg shadow-sm">
                    <BookOpen size={16} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight">Estudos Bíblicos</span>
                    <span className="text-[10px] opacity-70">Aprofunde-se na Palavra</span>
                  </div>
                </div>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  onGoHome?.();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center justify-between p-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500 text-white p-1.5 rounded-lg shadow-sm">
                    <Bell size={16} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight">Mural de Recados, Avisos e Eventos</span>
                    <span className="text-[10px] opacity-70">Acesse a Página Inicial</span>
                  </div>
                </div>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  onGoBible?.();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center justify-between p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 text-white p-1.5 rounded-lg shadow-sm">
                    <BookOpen size={16} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight">Ler a Bíblia</span>
                    <span className="text-[10px] opacity-70">Acesse os Capítulos</span>
                  </div>
                </div>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

            </div>
          </div>

          {/* Mídia & Ao Vivo */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-app-taupe uppercase tracking-widest px-2">TV & Rádio</p>
            
            {/* TV ADPG Group */}
            <div className="flex flex-col gap-1 bg-red-600/5 border border-red-600/20 rounded-xl p-1.5">
              <button
                onClick={onOpenVideoModal}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all group ${
                  isLive 
                    ? 'bg-red-600/20 text-red-600' 
                    : 'hover:bg-red-600/10 text-red-600'
                }`}
                id="sidebar-youtube-btn"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 text-white p-1.5 rounded-md shadow-sm">
                    <Youtube size={16} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight">TV ADPG</span>
                    <span className="text-[10px] opacity-70 border border-red-500/30 rounded px-1 w-fit mt-0.5">Assistir Vídeos</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Radio Group */}
            <div className="flex flex-col gap-1 bg-orange-500/5 border border-orange-500/20 rounded-xl p-1.5 mt-2">
              <audio ref={audioRef} src="https://stm4.audiplushd.com.br:7728/stream" preload="none" />
              <button
                onClick={toggleRadio}
                className="w-full flex items-center justify-between p-2.5 hover:bg-orange-500/10 text-orange-600 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`bg-orange-500 text-white p-1.5 rounded-md transition-all ${isPlayingRadio ? 'scale-110 shadow-lg shadow-orange-500/30' : ''}`}>
                    {isPlayingRadio ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-tight">Rádio Delta Fly</span>
                    <span className="text-[10px] opacity-70 border border-orange-500/30 rounded px-1 w-fit mt-0.5">{isPlayingRadio ? 'Tocando...' : 'Ouvir Agora'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                   <span className="text-[8px] bg-orange-600 text-white px-1 rounded uppercase animate-pulse">Ao Vivo</span>
                </div>
              </button>
              
              <a
                href="https://player.audiplushd.com.br/player-app-multi-plataforma/7728"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-2.5 hover:bg-black/5 dark:hover:bg-white/5 text-app-text/70 hover:text-app-text rounded-lg transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-app-taupe/20 text-app-taupe p-1.5 rounded-md group-hover:bg-app-taupe group-hover:text-white transition-colors">
                    <Clock size={14} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold leading-tight">APP da Rádio</span>
                    <span className="text-[8px] opacity-70">Multi-plataforma</span>
                  </div>
                </div>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform opacity-50 group-hover:opacity-100" />
              </a>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-app-taupe uppercase tracking-widest px-2">Redes Sociais</p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://facebook.com/tvadpg.tvadpg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 rounded-xl transition-all text-xs font-bold"
              >
                <Facebook size={14} />
                Facebook
              </a>
              <a
                href="https://instagram.com/tvadpg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 bg-pink-600/10 hover:bg-pink-600/20 text-pink-600 rounded-xl transition-all text-xs font-bold"
              >
                <Instagram size={14} />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-app-border bg-app-sidebar">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 rounded-full shadow-sm" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-app-accent flex items-center justify-center text-white font-serif italic text-sm shadow-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="max-w-[120px]">
                  <p className="text-xs font-bold text-app-accent truncate">{user.displayName || user.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-app-taupe tracking-tight">Membro ADPG</p>
                </div>
              </div>
              <button 
                onClick={() => logout()} 
                className="p-2 text-app-taupe hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="w-full flex items-center justify-center gap-2 py-3 bg-app-accent text-white rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-all"
              id="login-btn"
            >
              <LogIn size={16} />
              Entrar / Criar Conta
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
