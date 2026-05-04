import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Bell, Clock, MapPin, Plus, Trash2, Edit2, Loader2, BookOpen, Shield, Sun, Users } from 'lucide-react';
import { useAuth, handleFirestoreError, OperationType } from './AuthProvider';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface NoticesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChurchEvent {
  id: string;
  title: string;
  type: string;
  icon: string;
  date: string;
  time: string;
  location: string;
  description: string;
  createdAt: number;
}

interface ChurchNotice {
  id: string;
  title: string;
  date: string;
  description: string;
  createdAt: number;
}

const ICONS: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen size={18} />,
  Shield: <Shield size={18} />,
  Sun: <Sun size={18} />,
  Users: <Users size={18} />,
  Calendar: <Calendar size={18} />
};

export default function NoticesModal({ isOpen, onClose }: NoticesModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.email === 'marcosnatalina@gmail.com';

  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [notices, setNotices] = useState<ChurchNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit states
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editingEventData, setEditingEventData] = useState<Partial<ChurchEvent> | null>(null);
  
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [editingNoticeData, setEditingNoticeData] = useState<Partial<ChurchNotice> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const unsubs: (() => void)[] = [];

    try {
      const eventsSub = onSnapshot(collection(db, 'churchEvents'), (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChurchEvent[];
        setEvents(eventsData.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'churchEvents');
      });
      unsubs.push(eventsSub);

      const noticesSub = onSnapshot(collection(db, 'churchNotices'), (snapshot) => {
        const noticesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChurchNotice[];
        setNotices(noticesData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
        setIsLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'churchNotices');
        setIsLoading(false);
      });
      unsubs.push(noticesSub);

    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }

    return () => unsubs.forEach(unsub => unsub());
  }, [isOpen]);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventData?.title || !editingEventData?.type) return;

    try {
      const eventId = editingEventData.id || crypto.randomUUID();
      const updatedData = {
        title: editingEventData.title || '',
        type: editingEventData.type || '',
        icon: editingEventData.icon || 'Calendar',
        date: editingEventData.date || '',
        time: editingEventData.time || '',
        location: editingEventData.location || '',
        description: editingEventData.description || '',
        updatedAt: Date.now(),
        createdAt: editingEventData.createdAt || Date.now(),
      };

      await setDoc(doc(db, 'churchEvents', eventId), updatedData);
      setIsEditingEvent(false);
      setEditingEventData(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'churchEvents');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await deleteDoc(doc(db, 'churchEvents', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'churchEvents');
    }
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoticeData?.title || !editingNoticeData?.description) return;

    try {
      const noticeId = editingNoticeData.id || crypto.randomUUID();
      const updatedData = {
        title: editingNoticeData.title || '',
        date: editingNoticeData.date || '',
        description: editingNoticeData.description || '',
        updatedAt: Date.now(),
        createdAt: editingNoticeData.createdAt || Date.now(),
      };

      await setDoc(doc(db, 'churchNotices', noticeId), updatedData);
      setIsEditingNotice(false);
      setEditingNoticeData(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'churchNotices');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este recado?')) return;
    try {
      await deleteDoc(doc(db, 'churchNotices', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'churchNotices');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 p-safe">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-app-sidebar/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-app-bg border border-app-border rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col overflow-hidden relative z-10"
        >
          {/* Cabeçalho */}
          <div className="flex-none p-4 sm:p-6 border-b border-app-border flex items-center justify-between bg-app-sidebar/30">
            <div className="flex items-center gap-3">
              <div className="bg-app-accent/10 p-2 rounded-xl">
                <Bell className="text-app-accent" size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-app-text">Avisos e Eventos</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-app-sidebar/50 rounded-full transition-colors text-app-taupe"
              title="Fechar (Esc)"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-app-taupe gap-4">
                <Loader2 className="animate-spin" size={32} />
                <p>Carregando...</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-8 pb-10">
                
                {/* Eventos Regulares */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-app-accent flex items-center gap-2">
                      <Calendar size={20} /> Agenda de Cultos
                    </h3>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setEditingEventData({});
                          setIsEditingEvent(true);
                        }}
                        className="flex items-center gap-2 text-xs font-bold bg-app-accent text-white px-3 py-1.5 rounded-lg hover:bg-app-accent/90 transition-colors"
                      >
                        <Plus size={14} /> Adicionar
                      </button>
                    )}
                  </div>
                  
                  {isEditingEvent ? (
                    <form onSubmit={handleSaveEvent} className="bg-app-sidebar/30 border border-app-border rounded-xl p-4 space-y-4 mb-6">
                      <h4 className="font-bold">{editingEventData?.id ? 'Editar Evento' : 'Novo Evento'}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Título (ex: Culto de Ensino)"
                          className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-app-accent"
                          value={editingEventData?.title || ''}
                          onChange={(e) => setEditingEventData({ ...editingEventData, title: e.target.value })}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Tipo (ex: Culto)"
                          className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-app-accent"
                          value={editingEventData?.type || ''}
                          onChange={(e) => setEditingEventData({ ...editingEventData, type: e.target.value })}
                          required
                        />
                        <select
                          className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-app-accent"
                          value={editingEventData?.icon || 'Calendar'}
                          onChange={(e) => setEditingEventData({ ...editingEventData, icon: e.target.value })}
                        >
                          <option value="BookOpen">Livro Aberto</option>
                          <option value="Shield">Escudo</option>
                          <option value="Sun">Sol</option>
                          <option value="Users">Pessoas</option>
                          <option value="Calendar">Calendário</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Data/Dia (ex: Toda Terça-feira)"
                          className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-app-accent"
                          value={editingEventData?.date || ''}
                          onChange={(e) => setEditingEventData({ ...editingEventData, date: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Horário (ex: 19:30)"
                          className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-app-accent"
                          value={editingEventData?.time || ''}
                          onChange={(e) => setEditingEventData({ ...editingEventData, time: e.target.value })}
                        />
                        <input
                          type="text"
                          placeholder="Local (ex: Sede)"
                          className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-app-accent"
                          value={editingEventData?.location || ''}
                          onChange={(e) => setEditingEventData({ ...editingEventData, location: e.target.value })}
                        />
                      </div>
                      <textarea
                        placeholder="Descrição"
                        className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-app-accent h-24 resize-none"
                        value={editingEventData?.description || ''}
                        onChange={(e) => setEditingEventData({ ...editingEventData, description: e.target.value })}
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setIsEditingEvent(false); setEditingEventData(null); }}
                          className="px-4 py-2 text-sm bg-app-bg border border-app-border rounded-lg hover:bg-app-sidebar transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm bg-app-accent text-white rounded-lg hover:bg-app-accent/90 transition-colors"
                        >
                          Salvar
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {events.length === 0 && !isEditingEvent && (
                    <p className="text-app-taupe text-sm italic">Nenhum evento agendado.</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map(event => (
                      <div key={event.id} className="bg-app-sidebar/30 border border-app-border rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:border-app-accent/30 transition-colors">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-app-accent/5 to-transparent rounded-bl-full pointer-events-none" />
                        
                        <div className="flex items-start justify-between relative z-10">
                          <div className="flex items-center gap-2 text-app-accent font-medium">
                            {ICONS[event.icon] || <Calendar size={18} />}
                            <span>{event.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-app-accent/10 text-app-accent px-2 py-1 rounded-md">
                              {event.type}
                            </span>
                            {isAdmin && (
                              <div className="flex items-center gap-1">
                                <button onClick={() => { setEditingEventData(event); setIsEditingEvent(true); }} className="text-app-taupe hover:text-app-accent p-1">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteEvent(event.id)} className="text-app-taupe hover:text-red-500 p-1">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-app-text/80 mt-1 relative z-10">{event.description}</p>
                        
                        <div className="mt-auto pt-3 flex flex-wrap items-center gap-3 text-xs text-app-taupe border-t border-app-border/50 relative z-10">
                          {event.date && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{event.date}</span>
                            </div>
                          )}
                          {event.time && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1 w-full mt-1">
                              <MapPin size={14} />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Central de Avisos */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-app-text flex items-center gap-2">
                      <Bell size={20} className="text-yellow-500" /> Mural de Recados
                    </h3>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setEditingNoticeData({});
                          setIsEditingNotice(true);
                        }}
                        className="flex items-center gap-2 text-xs font-bold bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <Plus size={14} /> Adicionar
                      </button>
                    )}
                  </div>

                  {isEditingNotice ? (
                    <form onSubmit={handleSaveNotice} className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 space-y-4 mb-6">
                       <h4 className="font-bold text-yellow-600">{editingNoticeData?.id ? 'Editar Recado' : 'Novo Recado'}</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Título do Recado"
                          className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-yellow-500"
                          value={editingNoticeData?.title || ''}
                          onChange={(e) => setEditingNoticeData({ ...editingNoticeData, title: e.target.value })}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Período/Data (opcional)"
                          className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-yellow-500"
                          value={editingNoticeData?.date || ''}
                          onChange={(e) => setEditingNoticeData({ ...editingNoticeData, date: e.target.value })}
                        />
                       </div>
                       <textarea
                        placeholder="Descrição do Recado"
                        className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-yellow-500 h-24 resize-none"
                        value={editingNoticeData?.description || ''}
                        onChange={(e) => setEditingNoticeData({ ...editingNoticeData, description: e.target.value })}
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setIsEditingNotice(false); setEditingNoticeData(null); }}
                          className="px-4 py-2 text-sm bg-app-bg border border-app-border rounded-lg hover:bg-app-sidebar transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          Salvar
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {notices.length === 0 && !isEditingNotice && (
                    <p className="text-app-taupe text-sm italic">Nenhum recado no momento.</p>
                  )}

                  <div className="space-y-4">
                    {notices.map(notice => (
                      <div key={notice.id} className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex gap-4 group">
                        <div className="hidden sm:flex shrink-0 w-12 h-12 bg-yellow-500/10 rounded-full items-center justify-center text-yellow-600">
                          <Bell size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-app-text mb-1">{notice.title}</h4>
                            {isAdmin && (
                              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingNoticeData(notice); setIsEditingNotice(true); }} className="text-app-taupe hover:text-yellow-600 p-1">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteNotice(notice.id)} className="text-app-taupe hover:text-red-500 p-1">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-app-text/80">{notice.description}</p>
                          {notice.date && (
                            <div className="mt-2 text-xs font-medium text-yellow-600/80 bg-yellow-500/10 inline-block px-2 py-1 rounded-md">
                              {notice.date}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
