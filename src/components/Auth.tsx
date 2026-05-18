'use client';

import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import toast from 'react-hot-toast';
import { LogIn, LogOut, UserPlus, X, UserCircle, Mail, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsOpen(false);
      }
    });

    return () => unsub();
  }, []);

  const handleRegister = async () => {
    if (!email || !password) {
      toast.error('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Email and password are required.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Logout failed.');
    }
  };

  return (
    <>
      {/* Floating Auth Widget */}
      <div className="fixed top-5 right-5 z-40">
        {user ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-slate-600/50 bg-slate-900/80 backdrop-blur-xl px-4 py-2.5 shadow-lg shadow-black/30"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
                <UserCircle className="w-5 h-5 text-white" />
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-200 max-w-[180px] truncate">
                {user.email}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border border-red-500/20 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(true)}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-3 text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 border border-indigo-400/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4.5 h-4.5" />
            Sign In / Join
          </motion.button>
        )}
      </div>

      {/* Cinematic Modal */}
      <AnimatePresence>
        {isOpen && !user && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl border border-slate-500/40 bg-slate-900/[0.97] backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
              initial={{ scale: 0.93, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.93, y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background gradient orb inside modal */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-xs text-slate-400 mt-1.5 font-light">
                    Join or log in to sync and save your AI study history.
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider pl-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-600/50 bg-slate-800/40 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider pl-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-600/50 bg-slate-800/40 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex flex-col gap-3 pt-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white text-sm font-bold shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    {loading ? 'Processing...' : 'Sign In'}
                  </motion.button>

                  <div className="flex items-center gap-2 py-1">
                    <div className="h-[1px] flex-1 bg-slate-700/40"></div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">New to Smart Study?</span>
                    <div className="h-[1px] flex-1 bg-slate-700/40"></div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:bg-slate-850 disabled:text-slate-500 text-slate-100 hover:text-white text-sm font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create New Account
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}