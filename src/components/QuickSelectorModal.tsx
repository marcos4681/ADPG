import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ChevronLeft, BookOpen, ArrowRight } from 'lucide-react';
import { Book } from '../types';
import { PROTESTANT_BOOKS } from '../constants';

interface QuickSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (book: Book, chapter: number) => void;
  currentBook: Book;
  currentChapter: number;
  testamentFilter?: 'Antigo' | 'Novo' | null;
}

export default function QuickSelectorModal({
  isOpen,
  onClose,
  onSelect,
  currentBook,
  currentChapter,
  testamentFilter
}: QuickSelectorModalProps) {
  const [step, setStep] = useState<'book' | 'chapter'>('book');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('book');
      setSearchQuery('');
      setSelectedBook(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Smart search for pattern like "João 3"
  const quickSuggestion = useMemo(() => {
    if (!searchQuery) return null;
    
    // Pattern to match book and chapter, e.g. "João 3" or "1 Jo 2"
    const match = searchQuery.trim().match(/^([a-zA-Zãõáéíóúçêô\s]+)\s+(\d+)$/i) || 
                  searchQuery.trim().match(/^(\d\s+[a-zA-Zãõáéíóúçêô\s]+)\s+(\d+)$/i); // For 1 João 3
    
    if (match) {
      const parsedBookName = match[1].trim().toLowerCase();
      const parsedChapter = parseInt(match[2], 10);
      
      const foundBook = PROTESTANT_BOOKS.find(b => 
        b.name.toLowerCase().includes(parsedBookName) || 
        b.id.toLowerCase().includes(parsedBookName)
      );
      
      if (foundBook && parsedChapter >= 1 && parsedChapter <= foundBook.chapters) {
        return { book: foundBook, chapter: parsedChapter };
      }
    }
    return null;
  }, [searchQuery]);

  const filteredBooks = useMemo(() => {
    let books = PROTESTANT_BOOKS;
    if (testamentFilter) {
      books = books.filter(b => b.testament === testamentFilter);
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) return books;
    
    return books.filter(b => 
      b.name.toLowerCase().includes(query) || 
      b.id.toLowerCase().includes(query)
    );
  }, [searchQuery, testamentFilter]);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setStep('chapter');
    setSearchQuery('');
  };

  const handleChapterSelect = (chapter: number) => {
    if (selectedBook) {
      onSelect(selectedBook, chapter);
      onClose();
    }
  };

  const handleQuickSelect = () => {
    if (quickSuggestion) {
      onSelect(quickSuggestion.book, quickSuggestion.chapter);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-[10vh] sm:pt-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-app-bg border border-app-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-app-border bg-app-sidebar">
            {step === 'chapter' ? (
              <button
                onClick={() => setStep('book')}
                className="p-2 text-app-taupe hover:text-app-accent hover:bg-white/5 rounded-full transition-colors"
                title="Voltar"
              >
                <ChevronLeft size={20} />
              </button>
            ) : (
              <div className="pl-2">
                <BookOpen size={20} className="text-app-accent" />
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="text-lg font-bold text-app-accent">
                {step === 'book' ? (testamentFilter ? `${testamentFilter} Testamento` : 'Navegação Rápida') : selectedBook?.name}
              </h2>
              <p className="text-xs text-app-taupe">
                {step === 'book' ? 'Encontre um livro ou passagem' : 'Selecione o capítulo'}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-app-taupe hover:text-app-accent hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Input for Books */}
          {step === 'book' && (
            <div className="p-4 border-b border-app-border relative">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-taupe" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ex: João 3, Salmos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-app-sidebar border border-app-border rounded-xl py-3 pl-10 pr-4 text-app-text placeholder-app-taupe focus:outline-none focus:border-app-accent transition-colors"
                />
              </div>

              {/* Quick Suggestion */}
              {quickSuggestion && (
                <div 
                  onClick={handleQuickSelect}
                  className="mt-3 bg-app-accent text-white p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-app-accent/90 transition-colors shadow-lg"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">Ir para:</span>
                    <span className="font-serif text-lg font-bold">
                      {quickSuggestion.book.name} {quickSuggestion.chapter}
                    </span>
                  </div>
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          )}

          {/* Content Area */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
            {step === 'book' ? (
              <div className="p-2">
                {filteredBooks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {filteredBooks.map(book => (
                      <button
                        key={book.id}
                        onClick={() => handleBookSelect(book)}
                        className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                          book.id === currentBook.id 
                            ? 'bg-app-accent/10 text-app-accent' 
                            : 'text-app-text hover:bg-app-sidebar'
                        }`}
                      >
                        <span className="font-medium">{book.name}</span>
                        <span className="text-xs text-app-taupe uppercase">{book.id}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-app-taupe">
                    <p>Nenhum livro encontrado.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                  {Array.from({ length: selectedBook?.chapters || 0 }, (_, i) => i + 1).map(chap => (
                    <button
                      key={chap}
                      onClick={() => handleChapterSelect(chap)}
                      className={`
                        py-3 sm:py-4 rounded-xl text-center font-medium transition-all
                        ${
                          selectedBook?.id === currentBook.id && chap === currentChapter
                            ? 'bg-app-accent text-white shadow-md'
                            : 'bg-app-sidebar text-app-text hover:border-app-accent border border-transparent'
                        }
                      `}
                    >
                      {chap}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
