/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book } from '../types';
import { PROTESTANT_BOOKS } from '../constants';
import { ChevronRight, ChevronDown, BookOpen, LogOut, LogIn, Clock } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';

interface SidebarProps {
  currentBook: Book;
  currentChapter: number;
  onSelect: (book: Book, chapter: number) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function Sidebar({ currentBook, currentChapter, onSelect, isOpen, onClose, onOpenLogin }: SidebarProps) {
  const { user, loginWithGoogle, logout } = useAuth();
  const [expandedTestament, setExpandedTestament] = useState<'Antigo' | 'Novo' | null>('Antigo');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(currentBook.id);

  const testaments = ['Antigo', 'Novo'] as const;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 bg-app-sidebar border-r border-app-border transform transition-all duration-300 ease-in-out lg:relative ${
        isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-none'
      }`}
    >
      <div className="h-full flex flex-col w-72">
        <div className="p-6 flex flex-col gap-1">
          <h1 className="text-2xl font-serif font-bold text-app-accent tracking-tight">ADPG</h1>
          <p className="text-[10px] uppercase tracking-widest text-app-taupe">Bíblia Digital</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {/* Testament Selectors */}
          {testaments.map((testament) => (
            <div key={testament} className="space-y-1">
              <button
                onClick={() => setExpandedTestament(expandedTestament === testament ? null : testament)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-app-taupe uppercase tracking-widest hover:bg-white/50 dark:hover:bg-white/5 rounded-lg transition-colors"
                id={`testament-btn-${testament}`}
              >
                {testament} Testamento
                {expandedTestament === testament ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              <AnimatePresence>
                {expandedTestament === testament && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-0.5 mt-2"
                  >
                    {PROTESTANT_BOOKS.filter((b) => b.testament === testament).map((book) => (
                      <div key={book.id}>
                        <button
                          onClick={() => setSelectedBookId(selectedBookId === book.id ? null : book.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${
                            currentBook.id === book.id
                              ? 'bg-app-bg shadow-sm text-app-accent font-semibold border border-app-border'
                              : 'text-app-text/70 hover:bg-white/50 dark:hover:bg-white/5'
                          }`}
                          id={`book-btn-${book.id}`}
                        >
                          {book.name}
                          {selectedBookId === book.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        <AnimatePresence>
                          {selectedBookId === book.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="p-3 bg-white/30 dark:bg-black/10 rounded-lg mt-1 mx-1 flex flex-col gap-2"
                            >
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBookId(null);
                                }}
                                className="text-[10px] uppercase font-bold text-app-accent flex items-center gap-1 hover:underline mb-1"
                              >
                                <ChevronRight size={10} className="rotate-180" />
                                Voltar para livros
                              </button>
                              <div className="grid grid-cols-5 gap-1.5">
                                {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
                                  <button
                                    key={ch}
                                    onClick={() => {
                                      onSelect(book, ch);
                                      if (window.innerWidth < 1024) onClose();
                                    }}
                                    className={`aspect-square flex items-center justify-center text-xs rounded-md border transition-all ${
                                      currentBook.id === book.id && currentChapter === ch
                                        ? 'bg-app-accent text-white border-app-accent shadow-sm'
                                        : 'bg-app-bg text-app-taupe border-app-border hover:border-app-accent hover:text-app-accent'
                                    }`}
                                    id={`chapter-btn-${book.id}-${ch}`}
                                  >
                                    {ch}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
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
