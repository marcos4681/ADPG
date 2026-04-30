import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, BookOpen, Loader2 } from 'lucide-react';
import { Verse } from '../types';
import { searchBibleLocal } from '../services/searchService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (verse: Verse) => void;
}

export default function SearchModal({ isOpen, onClose, onSelectResult }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 3) {
        setIsLoading(true);
        setHasError(false);
        try {
          const data = await searchBibleLocal(query);
          setResults(data);
        } catch (err) {
          console.error(err);
          setHasError(true);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-app-bg rounded-3xl shadow-2xl z-[101] overflow-hidden border border-app-border flex flex-col max-h-[70vh]"
          >
            <div className="p-6 border-b border-app-border">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-taupe" size={20} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Pesquisar em toda a Bíblia..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-app-sidebar border border-app-border rounded-2xl focus:ring-2 focus:ring-app-accent outline-none text-app-text transition-all text-lg"
                />
                <button 
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-app-bg rounded-full text-app-taupe"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-app-taupe space-y-3">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="text-sm font-medium">Buscando nas Escrituras...</p>
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <div className="space-y-4">
                  <p className="px-4 text-xs font-bold text-app-taupe uppercase tracking-widest">
                    {results.length} resultados encontrados
                  </p>
                  {results.map((v, i) => (
                    <button
                      key={`${v.book_id}-${v.chapter}-${v.verse}-${i}`}
                      onClick={() => onSelectResult(v)}
                      className="w-full text-left p-4 hover:bg-app-sidebar rounded-2xl border border-transparent hover:border-app-border transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-app-accent uppercase tracking-tighter">
                          {v.book_name} {v.chapter}:{v.verse}
                        </span>
                        <BookOpen size={14} className="text-app-taupe opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-app-text leading-relaxed line-clamp-3">
                        {v.text}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {!isLoading && query.trim().length >= 3 && results.length === 0 && !hasError && (
                <div className="text-center py-12 text-app-taupe">
                  <p className="text-sm">Nenhum resultado encontrado para "{query}"</p>
                </div>
              )}

              {!isLoading && query.trim().length > 0 && query.trim().length < 3 && (
                <div className="text-center py-12 text-app-taupe">
                  <p className="text-sm italic">Digite pelo menos 3 caracteres...</p>
                </div>
              )}

              {hasError && (
                <div className="text-center py-12 text-red-500">
                  <p className="text-sm">Ocorreu um erro ao realizar a busca.</p>
                </div>
              )}
              
              {!isLoading && query.trim().length === 0 && (
                <div className="text-center py-12 text-app-taupe opacity-50">
                  <Search size={48} className="mx-auto mb-4" />
                  <p className="text-sm">Encontre passagens, palavras ou temas...</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-app-sidebar border-t border-app-border text-center">
              <p className="text-[10px] text-app-taupe uppercase tracking-widest font-bold">
                Versão Almeida Corrigida Fiel (ACF)
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
