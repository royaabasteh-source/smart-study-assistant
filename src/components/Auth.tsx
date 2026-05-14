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
import { LogIn, LogOut, UserPlus, X, UserCircle } from 'lucide-react';
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
      <div className="fixed top-5 right-5 z-40">
        {user ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/40 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-3 shadow-xl">
            <UserCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />

            <span className="hidden md:inline text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[220px] truncate">
              {user.email}
            </span>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-5 py-3 font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Login
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && !user && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl border border-white/40 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl"
              initial={{ scale: 0.95, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 24, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                    Welcome back
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Login or create an account to save your study history.
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                />

                <div className="flex flex-col md:flex-row gap-3 pt-2">
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold transition flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    {loading ? 'Loading...' : 'Login'}
                  </button>

                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 dark:bg-white dark:text-slate-900 font-bold transition flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Register
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}