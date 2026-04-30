import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, LogIn, UserPlus, Chrome, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isRegistering) {
        if (!name.trim()) throw new Error('Por favor, informe seu nome');
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setIsLoading(false);
    }
  };

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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-app-bg rounded-3xl shadow-2xl z-[101] overflow-hidden border border-app-border"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-app-accent">
                  {isRegistering ? 'Criar Conta' : 'Acessar ADPG'}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-app-sidebar rounded-full transition-colors text-app-taupe">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-500 text-sm rounded-xl border border-red-100 dark:border-red-900/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-app-taupe" size={18} />
                    <input
                      id="register-name"
                      type="text"
                      placeholder="Seu nome"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-app-sidebar border border-app-border rounded-2xl focus:ring-2 focus:ring-app-accent outline-none text-app-text transition-all"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-app-taupe" size={18} />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Seu e-mail"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-app-sidebar border border-app-border rounded-2xl focus:ring-2 focus:ring-app-accent outline-none text-app-text transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-app-taupe" size={18} />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Sua senha"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-app-sidebar border border-app-border rounded-2xl focus:ring-2 focus:ring-app-accent outline-none text-app-text transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-4 bg-app-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                    id="submit-auth-btn"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />)}
                    {isRegistering ? 'Registrar' : 'Entrar'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-4 bg-app-sidebar border border-app-border text-app-taupe rounded-2xl font-bold hover:bg-app-bg transition-all"
                    id="cancel-auth-btn"
                  >
                    Sair
                  </button>
                </div>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-app-border" />
                <span className="text-xs text-app-taupe uppercase tracking-widest font-bold">ou</span>
                <div className="flex-1 h-px bg-app-border" />
              </div>

              <button
                id="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-4 bg-white dark:bg-white/5 border border-app-border text-app-text rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-app-sidebar transition-all"
              >
                <Chrome size={20} />
                Continuar com Google
              </button>

              <div className="mt-8 text-center text-sm text-app-taupe">
                {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                <button
                  id="toggle-auth-mode"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="ml-2 text-app-accent font-bold hover:underline"
                >
                  {isRegistering ? 'Entre aqui' : 'Crie uma agora'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
