import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Book, Loader2 } from 'lucide-react';
import { WordDefinition } from '../types';
import { fetchWordDefinition } from '../services/bibleService';

interface DictionaryModalProps {
  word: string | null;
  context?: string;
  onClose: () => void;
}

export default function DictionaryModal({ word, context, onClose }: DictionaryModalProps) {
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (word) {
      setLoading(true);
      setError(null);
      fetchWordDefinition(word, context)
        .then(def => {
          if (def) {
            setDefinition(def);
          } else {
            setError(`Não foi possível encontrar uma definição para "${word}".`);
          }
        })
        .catch(err => {
          console.error(err);
          setError("Ocorreu um erro ao buscar a definição.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setDefinition(null);
      setError(null);
    }
  }, [word, context]);

  if (!word) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[85vh] bg-app-bg border border-app-border rounded-2xl shadow-xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-app-border bg-app-sidebar">
            <h2 className="text-lg font-serif font-bold text-app-accent flex items-center gap-2">
              <Book size={20} />
              Dicionário Bíblico
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-app-taupe hover:text-app-accent hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 sm:p-6 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-app-taupe">
                <Loader2 size={32} className="animate-spin mb-4 text-app-accent" />
                <p>Buscando significado...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6 text-red-400">
                <p>{error}</p>
              </div>
            ) : definition ? (
              <div className="space-y-4 text-app-text">
                <div>
                  <h1 className="text-2xl font-bold font-serif text-app-accent mb-1">{definition.word}</h1>
                  {definition.originalWord && (
                    <p className="text-sm text-app-taupe italic bg-app-sidebar inline-block px-3 py-1 rounded-full border border-app-border">
                      {definition.originalWord}
                    </p>
                  )}
                </div>
                
                <div className="bg-app-sidebar p-4 rounded-xl border border-app-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-app-taupe mb-2">Significado</h3>
                  <p className="text-[15px] leading-relaxed">{definition.meaning}</p>
                </div>

                <div className="bg-app-accent/10 p-4 rounded-xl border border-app-accent/20">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-app-accent mb-2">Contexto</h3>
                  <p className="text-[15px] leading-relaxed text-app-text/90">{definition.context}</p>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
