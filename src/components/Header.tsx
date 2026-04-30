/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, Search, Heart, Share2, User, Sun, Moon, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Book } from '../types';

interface HeaderProps {
  currentBook: Book;
  currentChapter: number;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onMenuToggle: () => void;
  onSearchToggle: () => void;
  onFavoritesToggle: () => void;
  onSettingsToggle: () => void;
  onReadingModeToggle: () => void;
}

export default function Header({ 
  currentBook, 
  currentChapter, 
  isDarkMode, 
  onThemeToggle, 
  onMenuToggle, 
  onSearchToggle, 
  onFavoritesToggle,
  onSettingsToggle,
  onReadingModeToggle
}: HeaderProps) {
  
  const [isCopied, setIsCopied] = React.useState(false);

  const handleSharePassage = async () => {
    const text = `Lendo agora na Bíblia ADPG: ${currentBook.name} ${currentChapter}`;
    const shareData = {
      title: 'Bíblia ADPG',
      text: text,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  return (
    <header className="h-16 bg-app-bg border-b border-app-border flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-app-sidebar rounded-md transition-colors"
          id="menu-toggle"
        >
          <Menu size={20} className="text-app-accent" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="px-4 py-1.5 rounded-full bg-app-bg border border-app-border text-xs font-medium text-app-accent shadow-sm">
            {currentBook.name} {currentChapter}
          </div>
          <div className="px-4 py-1.5 rounded-full bg-app-bg border border-app-border text-xs font-medium text-app-accent shadow-sm hidden sm:block">
            {currentBook.testament} Testamento
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-6">
        <button
          onClick={onThemeToggle}
          className="p-2 text-app-taupe hover:text-app-accent transition-colors"
          title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          id="theme-toggle"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="h-4 w-px bg-app-border hidden sm:block" />
        <button
          onClick={onSearchToggle}
          className="p-1 text-app-taupe hover:text-app-accent transition-colors"
          title="Buscar"
          id="search-btn"
        >
          <Search size={22} />
        </button>
        <button
          onClick={onFavoritesToggle}
          className="p-1 text-app-taupe hover:text-red-500 transition-colors"
          title="Favoritos"
          id="fav-btn"
        >
          <Heart size={22} />
        </button>
        <div className="relative">
          <button
            onClick={handleSharePassage}
            className={`p-1 transition-colors ${isCopied ? 'text-app-accent' : 'text-app-taupe hover:text-app-accent'}`}
            title="Compartilhar Passagem"
            id="share-passage-btn"
          >
            <Share2 size={22} />
          </button>
          <AnimatePresence>
            {isCopied && (
              <motion.div
                initial={{ opacity: 0, y: 10, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 10, x: '-50%' }}
                className="absolute top-full left-1/2 mt-2 bg-app-accent text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-50"
              >
                Link Copiado!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={onReadingModeToggle}
          className="p-1 text-app-taupe hover:text-app-accent transition-colors"
          title="Modo Leitura"
          id="reading-mode-btn"
        >
          <Maximize size={22} />
        </button>
        <button
          onClick={onSettingsToggle}
          className="p-1 text-app-taupe hover:text-app-accent transition-colors"
          title="Configurações"
          id="profile-btn"
        >
          <User size={22} />
        </button>
      </div>
    </header>
  );
}
