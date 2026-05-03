/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Reader from './components/Reader';
import AiAssistant from './components/AiAssistant';
import LoginModal from './components/LoginModal';
import { useAuth, handleFirestoreError, OperationType } from './components/AuthProvider';
import { db } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import SearchModal from './components/SearchModal';
import SettingsModal from './components/SettingsModal';
import StudiesModal from './components/StudiesModal';
import DictionaryModal from './components/DictionaryModal';
import QuickSelectorModal from './components/QuickSelectorModal';
import VideoModal from './components/VideoModal';
import { Book, Verse, FavoriteVerse, Highlight, Settings } from './types';
import { PROTESTANT_BOOKS } from './constants';
import { fetchChapter, fetchChapterTitle } from './services/bibleService';
import { Bookmark, X, Star, Type, Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('bible_theme');
    if (saved === 'dark' || saved === 'light') return saved as 'light' | 'dark';
    return 'light';
  });
  const [currentBook, setCurrentBook] = useState<Book>(PROTESTANT_BOOKS[0]);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [favorites, setFavorites] = useState<FavoriteVerse[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isStudiesModalOpen, setIsStudiesModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isQuickSelectorOpen, setIsQuickSelectorOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedTestamentFilter, setSelectedTestamentFilter] = useState<'Antigo' | 'Novo' | null>(null);
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);
  const [dictionaryContext, setDictionaryContext] = useState<string | undefined>(undefined);
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('bible_settings');
    const defaultSettings: Settings = {
      fontSize: 'medium',
      chatFontSize: 'medium',
      theme: localStorage.getItem('bible_theme') === 'dark' ? 'dark' : 'light',
      translation: 'almeida',
      lineSpacing: 'relaxed',
      fontFamily: 'serif',
      textColor: 'default'
    };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validar tradução para evitar erros de versões não suportadas no passado
        if (!['almeida', 'rccv', 'mnpg', 'blivre', 'adpg'].includes(parsed.translation)) {
          parsed.translation = 'almeida';
        }
        // Ensure chatFontSize is set
        if (!parsed.chatFontSize) {
          parsed.chatFontSize = 'medium';
        }
        return { ...defaultSettings, ...parsed };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isDarkMode = theme === 'dark';

  // Update theme when settings.theme changes (from cloud or settings modal)
  useEffect(() => {
    if (settings.theme !== theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load user settings from Firestore if available
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          
          setSettings(current => {
            const needsUpdate = 
              (userData.fontSize && userData.fontSize !== current.fontSize) ||
              (userData.chatFontSize && userData.chatFontSize !== current.chatFontSize) ||
              (userData.theme && userData.theme !== current.theme) ||
              (userData.lineSpacing && userData.lineSpacing !== current.lineSpacing) ||
              (userData.translation && userData.translation !== current.translation) ||
              (userData.fontFamily && userData.fontFamily !== current.fontFamily) ||
              (userData.textColor && userData.textColor !== current.textColor);

            if (needsUpdate) {
              return {
                ...current,
                fontSize: userData.fontSize || current.fontSize,
                chatFontSize: userData.chatFontSize || current.chatFontSize,
                theme: userData.theme || current.theme,
                lineSpacing: userData.lineSpacing || current.lineSpacing,
                translation: userData.translation || current.translation,
                fontFamily: userData.fontFamily || current.fontFamily,
                textColor: userData.textColor || current.textColor
              };
            }
            return current;
          });
        }
      }, (err) => {
        // No fatal error, just log and use local
        console.warn('Could not load cloud settings:', err);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Update logic when settings change
  useEffect(() => {
    localStorage.setItem('bible_settings', JSON.stringify(settings));
    
    // Sync to Firestore if logged in
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        fontSize: settings.fontSize,
        chatFontSize: settings.chatFontSize,
        theme: settings.theme,
        lineSpacing: settings.lineSpacing,
        translation: settings.translation,
        fontFamily: settings.fontFamily || 'serif',
        textColor: settings.textColor || 'default',
        updatedAt: Date.now()
      }, { merge: true }).catch(err => {
        console.error('Error syncing settings to Firestore:', err);
      });
    }
  }, [settings, user]);
  const [aiPrompt, setAiPrompt] = useState<string | undefined>();

  // Sync theme with local storage and DOM
  useEffect(() => {
    const isDark = theme === 'dark';
    localStorage.setItem('bible_theme', theme);
    
    // Force a re-render cycle for class application
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Update settings to keep in sync
    setSettings(prev => prev.theme !== theme ? { ...prev, theme } : prev);

    // Update theme-color meta tag for mobile browser UI
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', isDark ? '#121212' : '#fdfcf8');
  }, [theme]);
  
  // Reading mode escape shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isReadingMode) {
        setIsReadingMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadingMode]);

  // Load favorites (Local or Firestore)
  useEffect(() => {
    if (user) {
      const favsRef = collection(db, 'users', user.uid, 'favorites');
      const q = query(favsRef, orderBy('savedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const remoteFavorites = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as FavoriteVerse[];
        setFavorites(remoteFavorites);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/favorites`);
      });

      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem('bible_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      } else {
        setFavorites([]);
      }
    }
  }, [user]);

  // Sync favorites with local storage (only when guest)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('bible_favorites', JSON.stringify(favorites));
    }
  }, [favorites, user]);

  // Load highlights (Local or Firestore)
  useEffect(() => {
    if (user) {
      const highlightsRef = collection(db, 'users', user.uid, 'highlights');
      
      const unsubscribe = onSnapshot(highlightsRef, (snapshot) => {
        const remoteHighlights = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as Highlight[];
        setHighlights(remoteHighlights);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/highlights`);
      });

      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem('bible_highlights');
      if (saved) {
        setHighlights(JSON.parse(saved));
      } else {
        setHighlights([]);
      }
    }
  }, [user]);

  // Sync highlights with local storage (only when guest)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('bible_highlights', JSON.stringify(highlights));
    }
  }, [highlights, user]);

  const loadChapter = useCallback(async (book: Book, chapter: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const [chapterVerses, title] = await Promise.all([
        fetchChapter(book.api_id, chapter, settings.translation),
        fetchChapterTitle(book.name, chapter)
      ]);
      setVerses(chapterVerses);
      setChapterTitle(title);
      setCurrentBook(book);
      setCurrentChapter(chapter);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Falha ao carregar o capítulo.');
    } finally {
      setIsLoading(false);
    }
  }, [settings.translation]);

  useEffect(() => {
    loadChapter(currentBook, currentChapter);
  }, [currentBook, currentChapter, loadChapter]);

  const toggleFavorite = async (verse: Verse) => {
    const verseId = `${verse.book_id}-${verse.chapter}-${verse.verse}`;
    const exists = favorites.find(f => f.book_id === verse.book_id && f.chapter === verse.chapter && f.verse === verse.verse);
    
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'favorites', verseId);
      try {
        if (exists) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, {
            userId: user.uid,
            book_id: verse.book_id,
            book_name: verse.book_name,
            chapter: verse.chapter,
            verse: verse.verse,
            text: verse.text,
            savedAt: Date.now()
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/favorites/${verseId}`);
      }
    } else {
      // Local logic
      if (exists) {
        setFavorites(favorites.filter(f => f !== exists));
      } else {
        setFavorites([...favorites, { ...verse, savedAt: Date.now() }]);
      }
    }
  };

  const isFavorite = (verse: Verse) => {
    return favorites.some(f => f.book_id === verse.book_id && f.chapter === verse.chapter && f.verse === verse.verse);
  };

  const toggleHighlight = async (verseId: string, color: string | null) => {
    const [bookId, chapterStr, verseStr] = verseId.split('-');
    const chapter = parseInt(chapterStr);
    const verseNum = parseInt(verseStr);
    
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'highlights', verseId);
      try {
        if (!color) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, {
            userId: user.uid,
            book_id: bookId,
            chapter: chapter,
            verse: verseNum,
            color: color,
            updatedAt: Date.now()
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/highlights/${verseId}`);
      }
    } else {
      if (!color) {
        setHighlights(highlights.filter(h => !(h.book_id === bookId && h.chapter === chapter && h.verse === verseNum)));
      } else {
        const newHighlight: Highlight = {
          book_id: bookId,
          chapter: chapter,
          verse: verseNum,
          color: color,
          updatedAt: Date.now()
        };
        const others = highlights.filter(h => !(h.book_id === bookId && h.chapter === chapter && h.verse === verseNum));
        setHighlights([...others, newHighlight]);
      }
    }
  };

  const handleExplain = (verse: Verse) => {
    setAiPrompt(`Explique o versículo ${verse.book_name} ${verse.chapter}:${verse.verse}: "${verse.text}"`);
    // Reset after trigger
    setTimeout(() => setAiPrompt(undefined), 100);
  };

  const jumpToVerse = (v: { book_id: string, chapter: number, verse: number }) => {
    const book = PROTESTANT_BOOKS.find(b => b.api_id === v.book_id || b.id === v.book_id);
    if (book) {
      setCurrentBook(book);
      setCurrentChapter(v.chapter);
      setIsFavoritesOpen(false);
      setIsSearchModalOpen(false);
      
      // Delay to allow loading, then scroll
      setTimeout(() => {
        const element = document.getElementById(`verse-${v.chapter}-${v.verse}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-app-accent/20');
          setTimeout(() => element.classList.remove('bg-app-accent/20'), 3000);
        }
      }, 1000);
    }
  };

  useEffect(() => {
    // Check for notification permission and handle live alerts
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        // Here we could add a real check using the YouTube API or an RSS feed
        // For demonstration, we'll log the setup
        console.log("Notification system ready for TV ADPG Live checks.");
      }
    }
  }, []);

  const goToNextChapter = () => {
    const currentIndex = PROTESTANT_BOOKS.findIndex(b => b.id === currentBook.id);
    if (currentChapter < currentBook.chapters) {
      setCurrentChapter(prev => prev + 1);
    } else if (currentIndex < PROTESTANT_BOOKS.length - 1) {
      setCurrentBook(PROTESTANT_BOOKS[currentIndex + 1]);
      setCurrentChapter(1);
    }
  };

  const goToPrevChapter = () => {
    const currentIndex = PROTESTANT_BOOKS.findIndex(b => b.id === currentBook.id);
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
    } else if (currentIndex > 0) {
      const prevBook = PROTESTANT_BOOKS[currentIndex - 1];
      setCurrentBook(prevBook);
      setCurrentChapter(prevBook.chapters);
    }
  };

  const [isLive, setIsLive] = useState(true); // Simulated live state

  return (
    <div className={`flex h-screen bg-app-bg overflow-hidden transition-colors duration-300 ${isReadingMode ? 'p-0' : ''}`}>
      {!isReadingMode && (
        <Sidebar
          currentBook={currentBook}
          currentChapter={currentChapter}
          onSelect={(b, c) => {
            setCurrentBook(b);
            setCurrentChapter(c);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onStudiesToggle={() => setIsStudiesModalOpen(true)}
          onOpenVideoModal={() => setIsVideoModalOpen(true)}
          isLive={isLive}
          onTestamentClick={(testament) => {
            setSelectedTestamentFilter(testament);
            setIsQuickSelectorOpen(true);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {!isReadingMode && (
          <Header
            currentBook={currentBook}
            currentChapter={currentChapter}
            isDarkMode={isDarkMode}
            isOffline={!isOnline}
            onThemeToggle={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            onSearchToggle={() => setIsSearchModalOpen(true)}
            onFavoritesToggle={() => setIsFavoritesOpen(true)}
            onStudiesToggle={() => setIsStudiesModalOpen(true)}
            onSettingsToggle={() => setIsSettingsModalOpen(true)}
            onReadingModeToggle={() => setIsReadingMode(true)}
            onOpenVideoModal={() => setIsVideoModalOpen(true)}
            isLive={isLive}
          />
        )}

        <main className={`flex-1 flex flex-col relative overflow-hidden ${isReadingMode ? 'max-w-4xl mx-auto w-full' : ''}`}>
          {isReadingMode && (
            <div className="absolute top-0 right-0 p-4 z-40 flex gap-2">
              <button 
                onClick={() => setSettings(prev => {
                  const sizes: ('small' | 'medium' | 'large' | 'extra-large')[] = ['small', 'medium', 'large', 'extra-large'];
                  const currentIndex = sizes.indexOf(prev.fontSize);
                  return { ...prev, fontSize: sizes[Math.max(0, currentIndex - 1)] };
                })}
                className="p-2 bg-app-bg/80 backdrop-blur border border-app-border rounded-full text-app-taupe hover:text-app-accent shadow-lg transition-all"
                title="Diminuir fonte"
              >
                <div className="flex items-center gap-2 px-2">
                  <ZoomOut size={16} />
                </div>
              </button>
              <button 
                onClick={() => setSettings(prev => {
                  const sizes: ('small' | 'medium' | 'large' | 'extra-large')[] = ['small', 'medium', 'large', 'extra-large'];
                  const currentIndex = sizes.indexOf(prev.fontSize);
                  return { ...prev, fontSize: sizes[Math.min(sizes.length - 1, currentIndex + 1)] };
                })}
                className="p-2 bg-app-bg/80 backdrop-blur border border-app-border rounded-full text-app-taupe hover:text-app-accent shadow-lg transition-all"
                title="Aumentar fonte"
              >
                <div className="flex items-center gap-2 px-2">
                  <ZoomIn size={16} />
                </div>
              </button>
              <button 
                onClick={() => setIsReadingMode(false)}
                className="p-2 bg-app-bg/80 backdrop-blur border border-app-border rounded-full text-app-taupe hover:text-red-500 shadow-lg transition-all flex items-center gap-2 px-4"
                title="Sair do Modo Leitura"
              >
                <X size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sair</span>
              </button>
            </div>
          )}
          <Reader
            verses={verses}
            highlights={highlights}
            isLoading={isLoading}
            error={error}
            chapterTitle={chapterTitle}
            fontSize={settings.fontSize}
            lineSpacing={settings.lineSpacing}
            fontFamily={settings.fontFamily}
            textColor={settings.textColor}
            translation={settings.translation}
            onUpdateFontSize={(size) => setSettings(prev => ({ ...prev, fontSize: size }))}
            onExplain={handleExplain}
            onToggleFavorite={toggleFavorite}
            onToggleHighlight={toggleHighlight}
            isFavorite={isFavorite}
            onRetry={() => loadChapter(currentBook, currentChapter)}
            currentBook={currentBook}
            currentChapter={currentChapter}
            onNextChapter={goToNextChapter}
            onPrevChapter={goToPrevChapter}
            onOpenQuickSelector={() => setIsQuickSelectorOpen(true)}
            onWordSelect={(word, context) => {
              setDictionaryWord(word);
              setDictionaryContext(context);
            }}
          />
        </main>
      </div>
      
      {!isReadingMode && (
        <AiAssistant
          currentReference={`${currentBook.name} ${currentChapter}`}
          initialPrompt={aiPrompt}
          fontSize={settings.chatFontSize}
        />
      )}

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectResult={jumpToVerse}
      />

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(updated) => setSettings(s => ({ ...s, ...updated }))}
        onReadingModeToggle={() => setIsReadingMode(true)}
      />

      <QuickSelectorModal
        isOpen={isQuickSelectorOpen}
        onClose={() => {
          setIsQuickSelectorOpen(false);
          setSelectedTestamentFilter(null);
        }}
        onSelect={(b, c) => {
          setCurrentBook(b);
          setCurrentChapter(c);
          setSelectedTestamentFilter(null);
        }}
        currentBook={currentBook}
        currentChapter={currentChapter}
        testamentFilter={selectedTestamentFilter}
      />

      <StudiesModal
        isOpen={isStudiesModalOpen}
        onClose={() => setIsStudiesModalOpen(false)}
      />

      <DictionaryModal
        word={dictionaryWord}
        context={dictionaryContext}
        onClose={() => {
          setDictionaryWord(null);
          setDictionaryContext(undefined);
        }}
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

      {/* Favorites Sidebar/Drawer */}
      <AnimatePresence>
        {isFavoritesOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFavoritesOpen(false)}
              className="fixed inset-0 bg-natural-moss/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-app-bg shadow-2xl z-50 flex flex-col border-l border-app-border"
            >
              <div className="p-6 border-b border-app-border flex items-center justify-between bg-app-accent text-white">
                <div className="flex items-center gap-2">
                  <Star size={20} fill="white" />
                  <h3 className="font-semibold text-lg tracking-tight">Destaques</h3>
                </div>
                <button onClick={() => setIsFavoritesOpen(false)} className="p-1 hover:bg-white/20 rounded transition-colors">
                  <X />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-app-sidebar/20">
                {favorites.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-app-taupe space-y-3 px-8 text-center">
                    <Bookmark size={48} className="opacity-10" />
                    <p className="text-sm font-medium">Sua coleção de versículos aparecerá aqui.</p>
                  </div>
                ) : (
                  favorites.sort((a, b) => b.savedAt - a.savedAt).map((fav, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-app-bg border border-app-border hover:border-app-accent hover:bg-app-sidebar cursor-pointer transition-all group shadow-sm"
                      onClick={() => jumpToVerse(fav)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-natural-copper uppercase tracking-wider">
                          {fav.book_name} {fav.chapter}:{fav.verse}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(fav);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-app-taupe hover:text-red-500 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-app-text line-clamp-3 font-serif italic leading-relaxed">
                        "{fav.text}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
