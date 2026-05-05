/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { askBibleQuestion } from '../services/geminiService';
import { useAuth, handleFirestoreError, OperationType } from './AuthProvider';
import { db } from '../lib/firebase';
import { doc, setDoc, collection, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp?: number;
}

interface AiAssistantProps {
  currentReference?: string;
  initialPrompt?: string;
  fontSize?: 'small' | 'medium' | 'large';
}

export default function AiAssistant({ currentReference, initialPrompt, fontSize = 'medium' }: AiAssistantProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionDocId = useRef<string>(`session-${Date.now()}`);

  // Load last study session if user is logged in
  useEffect(() => {
    if (user && isOpen && messages.length === 0) {
      const studiesRef = collection(db, 'users', user.uid, 'studies');
      const q = query(studiesRef, orderBy('updatedAt', 'desc'), limit(1));
      
      getDocs(q).then(snapshot => {
        if (!snapshot.empty) {
          const lastStudy = snapshot.docs[0].data();
          if (lastStudy.messages) {
            setMessages(lastStudy.messages);
            sessionDocId.current = snapshot.docs[0].id;
          }
        }
      }).catch(err => {
        console.warn('Could not load last study session:', err);
      });
    }
  }, [user, isOpen]);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  useEffect(() => {
    if (initialPrompt) {
      setIsOpen(true);
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askBibleQuestion(text, currentReference);
      const aiMsg: Message = { role: 'ai', content: response || 'Desculpe, não consegui processar sua dúvida.', timestamp: Date.now() };
      
      setMessages((prev) => {
        const newMessages = [...prev, aiMsg];
        
        if (user) {
          const studyRef = doc(db, 'users', user.uid, 'studies', sessionDocId.current);
          setDoc(studyRef, {
            userId: user.uid,
            reference: currentReference || 'Geral',
            messages: newMessages,
            updatedAt: Date.now()
          }, { merge: true }).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/studies/${sessionDocId.current}`);
          });
        }
        
        return newMessages;
      });
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Ocorreu um erro ao conectar com a sabedoria da IA. Verifique sua chave API.', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-4 sm:left-6 w-14 h-14 bg-app-accent text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-all z-50 hover:scale-110 active:scale-95"
        id="ai-assistant-toggle"
      >
        <Sparkles size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 left-4 sm:left-6 w-[90vw] max-w-md h-[70vh] bg-app-bg rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-app-border transition-colors duration-300"
            id="ai-assistant-panel"
          >
            {/* Header */}
            <div className="bg-app-accent p-4 text-white flex items-center justify-between border-b border-app-border">
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <h3 className="font-semibold text-sm tracking-wide">Estudioso Bíblico IA</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-black/10 rounded transition-colors" id="close-ai-panel">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-app-sidebar/30">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 p-6">
                  <div className="w-12 h-12 bg-app-accent/10 text-app-accent rounded-full flex items-center justify-center">
                    <MessageCircle size={24} />
                  </div>
                  <p className="text-app-taupe text-sm">
                    Olá! Posso te ajudar a entender passagens bíblicas, contextos históricos ou teologia protestante. Como posso ajudar hoje?
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 px-4 rounded-2xl shadow-sm ${getFontSizeClass()} ${
                      m.role === 'user' 
                        ? 'bg-app-accent text-white rounded-tr-none' 
                        : 'bg-app-bg border border-app-border text-app-text rounded-tl-none'
                    }`}
                  >
                    <div className="markdown-body">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`bg-app-bg border border-app-border p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 ${getFontSizeClass()}`}>
                    <Loader2 size={16} className="animate-spin text-app-accent" />
                    <span className="text-app-taupe italic">Consultando Escrituras...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-app-border bg-app-bg transition-colors">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Explique o versículo..."
                  className="flex-1 bg-app-sidebar border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-app-accent transition-all outline-none text-app-text placeholder:text-app-taupe/60"
                  id="ai-input"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 bg-app-accent text-white rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all shrink-0 shadow-sm"
                  id="send-ai-btn"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
