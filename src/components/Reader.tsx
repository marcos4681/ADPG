/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Verse, Book, Highlight } from '../types';
import { Loader2, Share2, Heart, MessageSquareText, ArrowUp, Highlighter, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

interface ReaderProps {
  verses: Verse[];
  highlights: Highlight[];
  isLoading: boolean;
  error: string | null;
  fontSize?: 'small' | 'medium' | 'large' | 'extra-large';
  lineSpacing?: 'tight' | 'relaxed' | 'loose';
  onExplain: (verse: Verse) => void;
  onToggleFavorite: (verse: Verse) => void;
  onToggleHighlight: (verseId: string, color: string | null) => void;
  isFavorite: (verse: Verse) => boolean;
  onRetry: () => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'yellow', bg: 'bg-yellow-200/50 dark:bg-yellow-500/20', border: 'border-yellow-400/50', btn: 'bg-yellow-300' },
  { name: 'green', bg: 'bg-emerald-200/50 dark:bg-emerald-500/20', border: 'border-emerald-400/50', btn: 'bg-emerald-300' },
  { name: 'blue', bg: 'bg-blue-200/50 dark:bg-blue-500/20', border: 'border-blue-400/50', btn: 'bg-blue-300' },
  { name: 'purple', bg: 'bg-purple-200/50 dark:bg-purple-500/20', border: 'border-purple-400/50', btn: 'bg-purple-300' },
  { name: 'orange', bg: 'bg-orange-200/50 dark:bg-orange-500/20', border: 'border-orange-400/50', btn: 'bg-orange-300' },
];

const FONT_SIZES = {
  'small': 'text-sm sm:text-base',
  'medium': 'text-base sm:text-lg',
  'large': 'text-lg sm:text-xl',
  'extra-large': 'text-xl sm:text-2xl font-serif'
};

const LINE_SPACINGS = {
  'tight': 'leading-[1.4]',
  'relaxed': 'leading-[1.8]',
  'loose': 'leading-[2.2]'
};

export default function Reader({ 
  verses, 
  highlights, 
  isLoading, 
  error, 
  fontSize = 'medium',
  lineSpacing = 'relaxed',
  onExplain, 
  onToggleFavorite, 
  onToggleHighlight, 
  isFavorite, 
  onRetry 
}: ReaderProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowBackToTop(container.scrollTop > 400);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to top on chapter change
  useEffect(() => {
    if (verses.length > 0 && !isLoading) {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [verses, isLoading]);

  const [lastCopiedId, setLastCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string, message: string } | null>(null);

  const showFeedback = (id: string, message: string) => {
    setFeedback({ id, message });
    setTimeout(() => {
      setFeedback(prev => prev?.id === id ? null : prev);
    }, 2000);
  };

  const handleToggleFavorite = (v: Verse) => {
    const isFav = isFavorite(v);
    onToggleFavorite(v);
    const verseId = `${v.book_id}-${v.chapter}-${v.verse}`;
    showFeedback(verseId, isFav ? 'Removido dos Favoritos' : 'Adicionado aos Favoritos');
  };

  const handleToggleHighlight = (verseId: string, color: string | null) => {
    onToggleHighlight(verseId, color);
    if (color) {
      showFeedback(verseId, 'Versículo Destacado');
    } else {
      showFeedback(verseId, 'Destaque Removido');
    }
  };

  const handleShareVerse = async (v: Verse, verseId: string) => {
    const text = `"${v.text}" - ${v.book_name} ${v.chapter}:${v.verse}`;
    const shareData = {
      title: 'ADPG - Bíblia Digital',
      text: text,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(text);
        setLastCopiedId(verseId);
        setTimeout(() => setLastCopiedId(null), 2000);
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getVerseHighlight = (v: Verse) => {
    return highlights.find(h => h.book_id === v.book_id && h.chapter === v.chapter && h.verse === v.verse);
  };
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-app-taupe">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-serif italic text-lg text-app-text">Inclinando os ouvidos para a Palavra...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center">
          <MessageSquareText size={32} className="text-red-500" />
        </div>
        <div className="max-w-xs space-y-2">
          <h3 className="font-serif text-xl text-app-text">Ops! Algo deu errado</h3>
          <p className="text-sm text-app-taupe leading-relaxed">
            {error}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-app-accent text-white rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-4 py-12 lg:px-24 bg-app-bg transition-colors duration-300 relative"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-6">
          {verses.map((v) => {
            const verseId = `${v.book_id}-${v.chapter}-${v.verse}`;
            const highlight = getVerseHighlight(v);
            const colorConfig = highlight ? HIGHLIGHT_COLORS.find(c => c.name === highlight.color) : null;

            return (
              <motion.div
                key={verseId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative bible-text p-3 rounded-xl transition-all duration-300 ${
                  isFavorite(v) 
                    ? 'border border-app-border bg-app-accent/5' 
                    : 'hover:bg-app-sidebar/40 border border-transparent'
                } ${colorConfig ? `${colorConfig.bg} ${colorConfig.border} border-solid` : ''}`}
                id={`verse-${v.chapter}-${v.verse}`}
              >
                <sup className="text-[10px] font-sans font-bold text-natural-copper mr-2 uppercase tracking-tighter select-none">
                  {v.verse}
                </sup>
                <span className={`text-app-text tracking-tight ${FONT_SIZES[fontSize]} ${LINE_SPACINGS[lineSpacing]}`}>
                  {v.text}
                </span>

                {/* Verse Actions */}
                <div className="absolute -top-4 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all z-10">
                  <div className="flex items-center gap-1 bg-app-bg border border-app-border p-1 rounded-full shadow-lg">
                    {/* Colors */}
                    <div className="flex gap-0.5 px-1 mr-1 border-r border-app-border">
                      {HIGHLIGHT_COLORS.map(c => (
                        <button
                          key={c.name}
                          onClick={() => handleToggleHighlight(verseId, c.name)}
                          className={`w-4 h-4 rounded-full ${c.btn} hover:scale-125 transition-transform border border-black/5`}
                          title={`Marcar com ${c.name}`}
                        />
                      ))}
                      {highlight && (
                        <button
                          onClick={() => handleToggleHighlight(verseId, null)}
                          className="p-0.5 text-app-taupe hover:text-red-500"
                          title="Remover marcação"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onExplain(v)}
                      className="p-1 px-2 text-app-taupe hover:text-app-accent flex items-center gap-1 transition-colors"
                      title="Explicação com IA"
                    >
                      <MessageSquareText size={14} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => handleToggleFavorite(v)}
                        className={`p-1 px-2 transition-colors ${
                          isFavorite(v) ? 'text-red-500' : 'text-app-taupe hover:text-red-500'
                        }`}
                        title="Favoritar"
                      >
                        <Heart size={14} fill={isFavorite(v) ? "currentColor" : "none"} />
                      </button>
                      <AnimatePresence>
                        {feedback?.id === verseId && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, x: '-50%' }}
                            animate={{ opacity: 1, y: -20, x: '-50%' }}
                            exit={{ opacity: 0, y: -10, x: '-50%' }}
                            className="absolute bottom-full left-1/2 mb-1 bg-app-accent text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50"
                          >
                            {feedback.message}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="relative">
                      <button
                        className={`p-1 px-2 transition-colors ${lastCopiedId === verseId ? 'text-app-accent' : 'text-app-taupe hover:text-app-accent'}`}
                        title="Compartilhar"
                        onClick={() => handleShareVerse(v, verseId)}
                        id={`share-btn-${verseId}`}
                      >
                        <Share2 size={14} />
                      </button>
                      <AnimatePresence>
                        {lastCopiedId === verseId && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, x: '-50%' }}
                            animate={{ opacity: 1, y: -20, x: '-50%' }}
                            exit={{ opacity: 0, y: -10, x: '-50%' }}
                            className="absolute bottom-full left-1/2 mb-1 bg-app-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-50"
                          >
                            Copiado!
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-16 pb-12 text-center border-t border-app-border">
          <p className="text-[10px] text-app-taupe font-sans font-bold tracking-[0.2em] uppercase">
            Almeida Revista e Corrigida • ADPG Bíblia Digital
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-24 p-3 bg-app-accent text-white rounded-full shadow-lg hover:opacity-90 transition-all z-40 flex items-center justify-center"
            title="Voltar ao início"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
