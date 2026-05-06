/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Verse, Book, Highlight } from '../types';
import { Loader2, Share2, Heart, MessageSquareText, ArrowUp, Highlighter, Trash2, ChevronLeft, ChevronRight, Link2, X, ZoomIn, ZoomOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { fetchCrossReferences } from '../services/bibleService';

interface ReaderProps {
  verses: Verse[];
  highlights: Highlight[];
  currentBook: Book;
  currentChapter: number;
  chapterTitle?: string;
  isLoading: boolean;
  error: string | null;
  fontSize?: 'small' | 'medium' | 'large' | 'extra-large';
  lineSpacing?: 'tight' | 'relaxed' | 'loose';
  fontFamily?: 'sans' | 'serif' | 'mono';
  textColor?: 'default' | 'blue' | 'rose' | 'emerald' | 'amber' | 'purple';
  translation?: string;
  onUpdateFontSize: (size: 'small' | 'medium' | 'large' | 'extra-large') => void;
  onExplain: (verse: Verse) => void;
  onToggleFavorite: (verse: Verse) => void;
  onToggleHighlight: (verseId: string, color: string | null) => void;
  isFavorite: (verse: Verse) => boolean;
  onRetry: () => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
  onOpenQuickSelector?: () => void;
  onTestamentSelect?: (testament: 'Antigo' | 'Novo') => void;
  onWordSelect?: (word: string, context?: string) => void;
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

const FONT_FAMILIES = {
  'sans': 'font-sans',
  'serif': 'font-serif',
  'mono': 'font-mono'
};

const TEXT_COLORS = {
  'default': 'text-app-text',
  'blue': 'text-blue-600 dark:text-blue-400',
  'rose': 'text-rose-600 dark:text-rose-400',
  'emerald': 'text-emerald-600 dark:text-emerald-400',
  'amber': 'text-amber-600 dark:text-amber-400',
  'purple': 'text-purple-600 dark:text-purple-400'
};

export default function Reader({ 
  verses, 
  highlights, 
  currentBook,
  currentChapter,
  chapterTitle,
  isLoading, 
  error, 
  fontSize = 'medium',
  lineSpacing = 'relaxed',
  fontFamily = 'serif',
  textColor = 'default',
  translation = 'almeida',
  onUpdateFontSize,
  onExplain, 
  onToggleFavorite, 
  onToggleHighlight, 
  isFavorite, 
  onRetry,
  onNextChapter,
  onPrevChapter,
  onOpenQuickSelector,
  onTestamentSelect,
  onWordSelect
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

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection) return;
    
    // Some delay to allow selection to settle, especially on touch devices
    setTimeout(() => {
      const text = window.getSelection()?.toString().trim();
      if (text && text.split(/\\s+/).length <= 3 && text.length > 2) {
        let contextStr = undefined;
        try {
          const anchorNode = window.getSelection()?.anchorNode;
          const verseEl = anchorNode?.parentElement?.closest('.bible-text');
          if (verseEl) {
             contextStr = verseEl.querySelector('span')?.textContent || undefined;
          }
        } catch (e) {
          // Ignore DOM traversal errors
        }
        if (onWordSelect) {
          onWordSelect(text, contextStr);
          // Clear selection after triggering dictionary
          window.getSelection()?.removeAllRanges();
        }
      }
    }, 100);
  };

  // Smooth scroll to top on chapter change
  useEffect(() => {
    if (verses.length > 0 && !isLoading) {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [verses, isLoading]);

  const [lastCopiedId, setLastCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string, message: string } | null>(null);
  const [crossRefs, setCrossRefs] = useState<{ reference: string; snippet: string }[] | null>(null);
  const [isCrossRefLoading, setIsCrossRefLoading] = useState(false);
  const [activeVerseForRefs, setActiveVerseForRefs] = useState<Verse | null>(null);
  const [selectedVerses, setSelectedVerses] = useState<Set<string>>(new Set());

  const toggleVerseSelection = (verseId: string) => {
    setSelectedVerses(prev => {
      const next = new Set(prev);
      if (next.has(verseId)) {
        next.delete(verseId);
      } else {
        next.add(verseId);
      }
      return next;
    });
  };

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

  const handleShowCrossRefs = async (v: Verse) => {
    setActiveVerseForRefs(v);
    setIsCrossRefLoading(true);
    setCrossRefs(null);
    try {
      const refs = await fetchCrossReferences(v);
      setCrossRefs(refs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCrossRefLoading(false);
    }
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getVerseHighlight = (v: Verse) => {
    return highlights.find(h => h.book_id === v.book_id && h.chapter === v.chapter && h.verse === v.verse);
  };

  const FONT_SIZE_ORDER: ('small' | 'medium' | 'large' | 'extra-large')[] = ['small', 'medium', 'large', 'extra-large'];

  const handleZoomIn = () => {
    const currentIndex = FONT_SIZE_ORDER.indexOf(fontSize);
    if (currentIndex < FONT_SIZE_ORDER.length - 1) {
      onUpdateFontSize(FONT_SIZE_ORDER[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = FONT_SIZE_ORDER.indexOf(fontSize);
    if (currentIndex > 0) {
      onUpdateFontSize(FONT_SIZE_ORDER[currentIndex - 1]);
    }
  };

  if (isLoading) {
    const loadingMessage = translation === 'adpg' 
      ? 'Traduzindo e modernizando texto para a linguagem de hoje...'
      : 'Inclinando os ouvidos para a Palavra...';
      
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-app-taupe">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-serif italic text-lg text-app-text">{loadingMessage}</p>
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
      className="flex-1 overflow-y-auto px-4 py-8 lg:px-24 bg-app-bg transition-colors duration-300 relative"
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Chapter Header */}
        <header className="text-center space-y-2 mb-12 border-b border-app-border pb-8 rounded-3xl -mx-4 px-4 sm:mx-0 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="flex gap-2 sm:gap-4 mb-4">
              <button 
                onClick={(e) => { e.stopPropagation(); onTestamentSelect?.('Antigo'); }}
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border transition-colors ${currentBook.testament === 'Antigo' ? 'bg-app-accent text-white border-app-accent' : 'border-app-border text-app-taupe hover:border-app-accent hover:text-app-accent'}`}
              >
                Antigo Testamento
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onTestamentSelect?.('Novo'); }}
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border transition-colors ${currentBook.testament === 'Novo' ? 'bg-app-accent text-white border-app-accent' : 'border-app-border text-app-taupe hover:border-app-accent hover:text-app-accent'}`}
              >
                Novo Testamento
              </button>
            </div>
            
            <div 
              className="flex items-center justify-center gap-2 mt-2 cursor-pointer group p-2 hover:bg-app-accent/5 rounded-xl transition-colors"
              onClick={() => onOpenQuickSelector?.()}
            >
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-app-accent group-hover:text-app-accent/80 transition-colors">
                {currentBook.name} {currentChapter}
              </h1>
              <ChevronDown size={28} className="text-app-taupe opacity-50 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" />
            </div>

            {chapterTitle && (
              <p className="text-lg md:text-xl font-serif italic text-app-text mt-4">
                {chapterTitle}
              </p>
            )}
            <div className="w-12 h-1 bg-app-accent mx-auto mt-4 rounded-full opacity-20" />
            <p className="text-[10px] text-app-taupe/60 uppercase tracking-widest mt-4">
              Clique no título para mudar de livro ou capítulo
            </p>
          </motion.div>
        </header>

        <div className="space-y-6">
          {verses.map((v) => {
            const verseId = `${v.book_id}-${v.chapter}-${v.verse}`;
            const highlight = getVerseHighlight(v);
            const colorConfig = highlight ? HIGHLIGHT_COLORS.find(c => c.name === highlight.color) : null;
            const isSelected = selectedVerses.has(verseId);

            return (
              <motion.div
                key={verseId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => toggleVerseSelection(verseId)}
                className={`group relative bible-text p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'border-2 border-app-accent bg-app-accent/5 shadow-md scale-[1.01]' 
                    : isFavorite(v)
                      ? 'border border-app-border bg-app-accent/5'
                      : 'hover:bg-app-sidebar/40 border border-transparent'
                } ${colorConfig ? `${colorConfig.bg} ${colorConfig.border} border-solid` : ''}`}
                id={`verse-${v.chapter}-${v.verse}`}
              >
                <sup className={`text-[10px] font-sans font-bold mr-2 uppercase tracking-tighter select-none transition-colors ${
                  isSelected ? 'text-app-accent' : 'text-natural-copper'
                }`}>
                  {v.verse}
                </sup>
                <span className={`tracking-tight transition-colors ${FONT_FAMILIES[fontFamily]} ${FONT_SIZES[fontSize]} ${LINE_SPACINGS[lineSpacing]} ${
                  isSelected ? 'text-app-accent font-medium' : TEXT_COLORS[textColor]
                }`}>
                  {v.text}
                </span>

                {/* Verse Actions */}
                <div 
                  className={`absolute -top-4 right-2 flex items-center gap-1 transition-all z-10 ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
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
                    <button
                      onClick={() => handleShowCrossRefs(v)}
                      className="p-1 px-2 text-app-taupe hover:text-app-accent flex items-center gap-1 transition-colors border-l border-app-border"
                      title="Referências Cruzadas"
                    >
                      <Link2 size={14} />
                    </button>
                    <div className="relative border-l border-app-border">
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

        {/* Navigation Arrows */}
        <div className="flex items-center justify-between pt-12 pb-8">
          <button
            onClick={onPrevChapter}
            className="flex items-center gap-2 px-6 py-3 bg-app-sidebar/50 hover:bg-app-sidebar rounded-full text-app-taupe hover:text-app-accent transition-all border border-app-border group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Anterior</span>
          </button>
          
          <button
            onClick={onNextChapter}
            className="flex items-center gap-2 px-6 py-3 bg-app-sidebar/50 hover:bg-app-sidebar rounded-full text-app-taupe hover:text-app-accent transition-all border border-app-border group"
          >
            <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Próximo</span>
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-16 pb-12 text-center border-t border-app-border">
          <p className="text-[10px] text-app-taupe font-sans font-bold tracking-[0.2em] uppercase">
            {translation === 'mnpg' ? 'MNPG (Fiel aos Originais)' : translation === 'king_james' ? 'King James Atualizada' : translation === 'rccv' ? 'Almeida Revista e Corrigida' : 'Almeida Tradicional'} • ADPG Bíblia Digital
          </p>
          {translation === 'mnpg' && (
            <p className="mt-2 text-[9px] text-app-accent font-bold uppercase tracking-wider">
              Nota: Versão focada em precisão literal dos textos originais.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <div className="fixed bottom-6 right-4 sm:right-6 md:right-8 flex flex-col gap-2 z-40">
            <div className="flex flex-col bg-app-bg border border-app-border rounded-full shadow-lg overflow-hidden">
              <button
                onClick={handleZoomIn}
                disabled={fontSize === 'extra-large'}
                className="p-3 text-app-taupe hover:text-app-accent hover:bg-app-sidebar/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all border-b border-app-border"
                title="Aumentar Zoom"
              >
                <ZoomIn size={20} />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={fontSize === 'small'}
                className="p-3 text-app-taupe hover:text-app-accent hover:bg-app-sidebar/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Diminuir Zoom"
              >
                <ZoomOut size={20} />
              </button>
            </div>
            
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToTop}
              className="p-3 bg-app-accent text-white rounded-full shadow-lg hover:opacity-90 transition-all flex items-center justify-center"
              title="Voltar ao início"
            >
              <ArrowUp size={20} />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeVerseForRefs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-app-bg border border-app-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-app-border flex items-center justify-between bg-app-sidebar/30">
                <div className="flex items-center gap-3">
                  <div className="bg-app-accent/10 p-2 rounded-xl">
                    <Link2 size={20} className="text-app-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-app-accent leading-tight">Referências Cruzadas</h3>
                    <p className="text-xs text-app-taupe font-bold uppercase tracking-wider mt-0.5">
                      {activeVerseForRefs.book_name} {activeVerseForRefs.chapter}:{activeVerseForRefs.verse}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveVerseForRefs(null)}
                  className="p-2 text-app-taupe hover:text-app-accent hover:bg-app-sidebar/50 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {isCrossRefLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-app-accent" />
                    <p className="text-sm italic text-app-taupe font-serif">Buscando conexões bíblicas...</p>
                  </div>
                ) : crossRefs && crossRefs.length > 0 ? (
                  <div className="space-y-4">
                    {crossRefs.map((ref, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-app-sidebar/20 rounded-xl border border-app-border/50 hover:border-app-accent/30 transition-all group"
                      >
                        <p className="text-sm font-bold text-app-accent mb-2 uppercase tracking-wide flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-app-accent opacity-60"></span>
                          {ref.reference}
                        </p>
                        <p className="text-sm font-serif italic text-app-text leading-relaxed opacity-90">
                          "{ref.snippet}"
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-app-taupe italic font-serif">
                    Nenhuma referência encontrada para este versículo.
                  </div>
                )}
              </div>

              <div className="p-4 bg-app-sidebar/30 border-t border-app-border text-center">
                <button
                  onClick={() => setActiveVerseForRefs(null)}
                  className="w-full py-2.5 bg-app-accent text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-all uppercase tracking-widest"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
