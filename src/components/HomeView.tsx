import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Bell, Clock, MapPin, Plus, Trash2, Edit2, Loader2, BookOpen, Shield, Sun, Users, Image, Camera, PlayCircle } from 'lucide-react';
import { useAuth, handleFirestoreError, OperationType } from './AuthProvider';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

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

interface ChurchBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
  createdAt: number;
}

interface ChurchPost {
  id: string;
  description?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: number;
}

const ICONS: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen size={18} />,
  Shield: <Shield size={18} />,
  Sun: <Sun size={18} />,
  Users: <Users size={18} />,
  Calendar: <Calendar size={18} />
};

import Logo from './Logo';

export default function HomeView() {
  const { user } = useAuth();
  const isAdmin = user?.email === 'marcosnatalina@gmail.com';

  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [notices, setNotices] = useState<ChurchNotice[]>([]);
  const [banners, setBanners] = useState<ChurchBanner[]>([]);
  const [posts, setPosts] = useState<ChurchPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit states
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editingEventData, setEditingEventData] = useState<Partial<ChurchEvent> | null>(null);
  
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [editingNoticeData, setEditingNoticeData] = useState<Partial<ChurchNotice> | null>(null);

  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [editingBannerData, setEditingBannerData] = useState<Partial<ChurchBanner> | null>(null);

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editingPostData, setEditingPostData] = useState<Partial<ChurchPost> | null>(null);
  const [postSourceType, setPostSourceType] = useState<'image' | 'video_upload' | 'video_link'>('image');

  useEffect(() => {
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
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'churchNotices');
      });
      unsubs.push(noticesSub);

      const bannersSub = onSnapshot(collection(db, 'churchBanners'), (snapshot) => {
        const bannersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChurchBanner[];
        setBanners(bannersData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'churchBanners');
      });
      unsubs.push(bannersSub);

      const postsSub = onSnapshot(collection(db, 'churchPosts'), (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChurchPost[];
        setPosts(postsData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
        setIsLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'churchPosts');
        setIsLoading(false);
      });
      unsubs.push(postsSub);

    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }

    return () => unsubs.forEach(unsub => unsub());
  }, []);

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
    try {
      await deleteDoc(doc(db, 'churchNotices', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'churchNotices');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma imagem de até 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new self.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max width/height for banner compression
        const MAX_DIMENSION = 1200;
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setEditingBannerData(prev => prev ? { ...prev, imageUrl: dataUrl } : prev);
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBannerData?.title || !editingBannerData?.imageUrl) return;

    try {
      const bannerId = editingBannerData.id || crypto.randomUUID();
      const updatedData = {
        title: editingBannerData.title || '',
        imageUrl: editingBannerData.imageUrl || '',
        linkUrl: editingBannerData.linkUrl || '',
        active: editingBannerData.active !== undefined ? editingBannerData.active : true,
        updatedAt: Date.now(),
        createdAt: editingBannerData.createdAt || Date.now(),
      };

      await setDoc(doc(db, 'churchBanners', bannerId), updatedData);
      setIsEditingBanner(false);
      setEditingBannerData(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'churchBanners');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'churchBanners', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'churchBanners');
    }
  };

  const handlePostFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma imagem de até 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new self.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_DIMENSION = 1600;
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setEditingPostData(prev => prev ? { ...prev, mediaUrl: dataUrl, mediaType: 'image' } : prev);
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePostVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 700 * 1024) {
      alert('Aviso: Como os vídeos são salvos diretamente no banco de dados (sem o Firebase Storage), o limite é de 700KB por vídeo. Para vídeos comuns do celular, recomendamos usar a opção de link do YouTube.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setEditingPostData(prev => prev ? { ...prev, mediaUrl: event.target!.result as string, mediaType: 'video' } : prev);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPostData?.mediaUrl) return;

    try {
      const postId = editingPostData.id || crypto.randomUUID();
      const updatedData = {
        description: editingPostData.description || '',
        mediaUrl: editingPostData.mediaUrl || '',
        mediaType: editingPostData.mediaType || 'image',
        updatedAt: Date.now(),
        createdAt: editingPostData.createdAt || Date.now(),
      };

      await setDoc(doc(db, 'churchPosts', postId), updatedData);
      setIsEditingPost(false);
      setEditingPostData(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'churchPosts');
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'churchPosts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'churchPosts');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-app-border scrollbar-track-transparent">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col items-center mb-8 pb-8 border-b border-app-border relative">
          <img 
            src="/logo.png" 
            alt="Logo ADPG" 
            className="w-full max-w-[280px] h-auto object-contain drop-shadow-md"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              document.getElementById('home-text-logo')!.style.display = 'flex';
            }} 
          />
          <div id="home-text-logo" className="w-full flex-col items-center mt-2" style={{ display: 'none' }}>
            <Logo />
          </div>
          <h1 className="text-xl sm:text-2xl mt-4 font-serif font-bold text-app-accent text-center">Mural de Recados, Avisos e Eventos</h1>
        </div>

        {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-app-taupe gap-4">
                <Loader2 className="animate-spin" size={32} />
                <p>Carregando...</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-8 pb-10">
                
                {/* Banners */}
                <section>
                  {(banners.length > 0 || isAdmin) && (
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-app-text flex items-center gap-2">
                        <Image size={20} className="text-blue-500" /> Banners em Destaque
                      </h3>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setEditingBannerData({ active: true });
                            setIsEditingBanner(true);
                          }}
                          className="flex items-center gap-2 text-xs font-bold bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Plus size={14} /> Adicionar Banner
                        </button>
                      )}
                    </div>
                  )}

                  {isEditingBanner ? (
                    <form onSubmit={handleSaveBanner} className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-4 mb-6">
                       <h4 className="font-bold text-blue-600">{editingBannerData?.id ? 'Editar Banner' : 'Novo Banner'}</h4>
                       <div className="grid grid-cols-1 gap-4">
                        <input
                          type="text"
                          placeholder="Título do Banner"
                          className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-blue-500"
                          value={editingBannerData?.title || ''}
                          onChange={(e) => setEditingBannerData({ ...editingBannerData, title: e.target.value })}
                          required
                        />
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-app-text">Imagem do Banner (até 5MB)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="bg-app-bg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer text-app-text"
                          />
                          {editingBannerData?.imageUrl && (
                            <img src={editingBannerData.imageUrl} alt="Preview" className="max-h-32 object-contain rounded-lg border border-app-border mt-2" />
                          )}
                        </div>
                        <input
                          type="url"
                          placeholder="URL de Destino / Link (opcional)"
                          className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-blue-500"
                          value={editingBannerData?.linkUrl || ''}
                          onChange={(e) => setEditingBannerData({ ...editingBannerData, linkUrl: e.target.value })}
                        />
                        <label className="flex items-center gap-2 text-sm text-app-text cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingBannerData?.active ?? true}
                            onChange={(e) => setEditingBannerData({ ...editingBannerData, active: e.target.checked })}
                            className="w-4 h-4 rounded accent-blue-500"
                          />
                          Banner Ativo
                        </label>
                       </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => { setIsEditingBanner(false); setEditingBannerData(null); }}
                          className="px-4 py-2 text-sm bg-app-bg border border-app-border rounded-lg hover:bg-app-sidebar transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Salvar
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {banners.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {banners.filter(b => b.active || isAdmin).map(banner => (
                        <div key={banner.id} className={`relative group rounded-xl overflow-hidden border ${!banner.active ? 'border-red-500/50 opacity-50' : 'border-app-border'}`}>
                          {banner.linkUrl ? (
                            <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                              <img src={banner.imageUrl} alt={banner.title} className="w-full h-auto object-cover max-h-[300px]" referrerPolicy="no-referrer" />
                            </a>
                          ) : (
                            <img src={banner.imageUrl} alt={banner.title} className="w-full h-auto object-cover max-h-[300px]" referrerPolicy="no-referrer" />
                          )}
                          
                          {banner.title && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 z-10 pointer-events-none">
                              <h4 className="text-white font-bold text-lg drop-shadow-md">{banner.title}</h4>
                            </div>
                          )}

                          {isAdmin && (
                            <div className="absolute top-2 right-2 z-20 bg-black/60 backdrop-blur-sm rounded-lg p-1 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingBannerData(banner); setIsEditingBanner(true); }} className="text-white hover:text-blue-400 p-1 bg-white/10 rounded">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteBanner(banner.id)} className="text-white hover:text-red-400 p-1 bg-white/10 rounded">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                          {!banner.active && isAdmin && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                              INATIVO
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

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

                {/* Galeria / Mural de Fotos e Vídeos */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-app-text flex items-center gap-2">
                      <Camera size={20} className="text-pink-500" /> Galeria / Posts
                    </h3>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setEditingPostData({ mediaType: 'image' });
                          setPostSourceType('image');
                          setIsEditingPost(true);
                        }}
                        className="flex items-center gap-2 text-xs font-bold bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition-colors"
                      >
                        <Plus size={14} /> Postar Mídia
                      </button>
                    )}
                  </div>

                  {isEditingPost ? (
                    <form onSubmit={handleSavePost} className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-4 space-y-4 mb-6">
                       <h4 className="font-bold text-pink-600">{editingPostData?.id ? 'Editar Post' : 'Novo Post'}</h4>
                       
                       <div className="flex flex-col sm:flex-row gap-4 mb-2">
                         <label className="flex items-center gap-2 text-sm cursor-pointer">
                           <input type="radio" name="mediaType" checked={postSourceType === 'image'} onChange={() => { setPostSourceType('image'); setEditingPostData({ ...editingPostData, mediaType: 'image', mediaUrl: '' }); }} className="accent-pink-500" />
                           Foto (Upload)
                         </label>
                         <label className="flex items-center gap-2 text-sm cursor-pointer">
                           <input type="radio" name="mediaType" checked={postSourceType === 'video_upload'} onChange={() => { setPostSourceType('video_upload'); setEditingPostData({ ...editingPostData, mediaType: 'video', mediaUrl: '' }); }} className="accent-pink-500" />
                           Vídeo (Upload do Celular)
                         </label>
                         <label className="flex items-center gap-2 text-sm cursor-pointer">
                           <input type="radio" name="mediaType" checked={postSourceType === 'video_link'} onChange={() => { setPostSourceType('video_link'); setEditingPostData({ ...editingPostData, mediaType: 'video', mediaUrl: '' }); }} className="accent-pink-500" />
                           Vídeo (Link do YouTube)
                         </label>
                       </div>

                       {postSourceType === 'image' ? (
                         <div className="flex flex-col gap-2">
                           <label className="text-sm font-medium text-app-text">Imagem do Post (até 5MB)</label>
                           <input
                             type="file"
                             accept="image/*"
                             onChange={handlePostFileUpload}
                             className="bg-app-bg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600 cursor-pointer text-app-text"
                           />
                           {editingPostData?.mediaUrl && (
                             <img src={editingPostData.mediaUrl} alt="Preview" className="max-h-32 object-contain rounded-lg border border-app-border mt-2" />
                           )}
                         </div>
                       ) : postSourceType === 'video_upload' ? (
                         <div className="flex flex-col gap-2">
                           <label className="text-sm font-medium text-app-text">Vídeo do Post (até 700KB)</label>
                           <input
                             type="file"
                             accept="video/*"
                             onChange={handlePostVideoUpload}
                             className="bg-app-bg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600 cursor-pointer text-app-text"
                           />
                           {editingPostData?.mediaUrl && (
                             <video src={editingPostData.mediaUrl} controls className="max-h-32 object-contain rounded-lg border border-app-border mt-2" />
                           )}
                         </div>
                       ) : (
                         <input
                           type="url"
                           placeholder="Link do vídeo (Ex: https://youtube.com/watch?v=...)"
                           className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-pink-500"
                           value={editingPostData?.mediaUrl || ''}
                           onChange={(e) => setEditingPostData({ ...editingPostData, mediaUrl: e.target.value })}
                           required
                         />
                       )}

                       <textarea
                        placeholder="Legenda ou descrição (opcional)"
                        className="bg-app-bg border border-app-border rounded-lg p-2 text-sm w-full outline-pink-500 h-20 resize-none"
                        value={editingPostData?.description || ''}
                        onChange={(e) => setEditingPostData({ ...editingPostData, description: e.target.value })}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setIsEditingPost(false); setEditingPostData(null); }}
                          className="px-4 py-2 text-sm bg-app-bg border border-app-border rounded-lg hover:bg-app-sidebar transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={!editingPostData?.mediaUrl}
                          className="px-4 py-2 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
                        >
                          Postar
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {posts.length === 0 && !isEditingPost && (
                    <p className="text-app-taupe text-sm italic">Nenhuma foto ou vídeo postado.</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {posts.map(post => (
                      <div key={post.id} className="bg-app-sidebar/30 border border-app-border rounded-xl p-3 flex flex-col gap-2 relative group hover:border-pink-500/30 transition-colors">
                        <div className={`rounded-lg overflow-hidden relative bg-black flex items-center justify-center min-h-[200px] ${post.mediaType === 'video' ? 'aspect-video w-full' : ''}`}>
                          {post.mediaType === 'video' ? (
                            post.mediaUrl.includes('youtube.com') || post.mediaUrl.includes('youtu.be') ? (
                              <iframe 
                                className="w-full h-full absolute inset-0"
                                src={`https://www.youtube.com/embed/${post.mediaUrl.includes('v=') ? post.mediaUrl.split('v=')[1]?.split('&')[0] : post.mediaUrl.split('/').pop()}`} 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                              ></iframe>
                            ) : post.mediaUrl.startsWith('data:video') || post.mediaUrl.endsWith('.mp4') ? (
                              <video src={post.mediaUrl} controls className="w-full h-full object-contain absolute inset-0" />
                            ) : (
                               <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-pink-500 hover:text-pink-400">
                                 <PlayCircle size={48} />
                                 <span className="text-xs font-bold uppercase">Assistir Vídeo Externo</span>
                               </a>
                            )
                          ) : (
                            <img src={post.mediaUrl} alt="Post media" className="w-full h-auto object-contain max-h-[500px]" referrerPolicy="no-referrer" />
                          )}
                        </div>
                        
                        {post.description && (
                          <p className="text-sm text-app-text/90 px-1">{post.description}</p>
                        )}
                        
                        <div className="mt-auto pt-2 flex items-center justify-between">
                           <span className="text-xs font-medium text-app-taupe px-1">
                             {new Date(post.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                           </span>
                           {isAdmin && (
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { 
                                setEditingPostData(post); 
                                setPostSourceType(post.mediaType === 'image' ? 'image' : ((post.mediaUrl.startsWith('data:video') || post.mediaUrl.endsWith('.mp4')) ? 'video_upload' : 'video_link'));
                                setIsEditingPost(true); 
                              }} className="text-app-taupe hover:text-pink-500 p-1">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeletePost(post.id)} className="text-app-taupe hover:text-red-500 p-1">
                                <Trash2 size={14} />
                              </button>
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
    </div>
  );
}
