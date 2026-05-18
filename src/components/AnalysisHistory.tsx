'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { 
  Search, 
  BookOpen, 
  Calendar, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  AlertTriangle,
  Clock,
  ChevronRight,
  FileText,
  KeyRound,
  HelpCircle,
  BookMarked,
  ArrowUpRight
} from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-in-the-blank' | 'short-answer' | 'long-answer';
  question: string;
  options?: string[];
  answer: string;
}

interface Analysis {
  id: string;
  fileName: string;
  summary: string;
  keyPoints: string[];
  questions: Question[];
  createdAt: string;
  difficulty?: string;
  studyMode?: string;
  questionType?: string;
}

export default function AnalysisHistory({
  refreshTrigger,
}: {
  refreshTrigger?: number;
}) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selected, setSelected] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setAnalyses([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/analysis/history?userId=${user.uid}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch history');
        }

        setAnalyses(data.analyses || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/analysis/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete analysis.');
      }

      setAnalyses((prev) => prev.filter((item) => item.id !== id));

      if (selected?.id === id) {
        setSelected(null);
      }

      setDeleteId(null);
      toast.success('Study session deleted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete session.');
    }
  };

  const handleRename = async (id: string) => {
    if (!editedName.trim()) return;

    try {
      const res = await fetch(`/api/analysis/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: editedName.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to rename.');
      }

      setAnalyses((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                fileName: editedName.trim(),
              }
            : item
        )
      );

      if (selected?.id === id) {
        setSelected({
          ...selected,
          fileName: editedName.trim(),
        });
      }

      setEditingId(null);
      setEditedName('');
      toast.success('Session renamed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to rename study session.');
    }
  };

  const filteredAnalyses = analyses.filter((item) =>
    item.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const getDifficultyBadge = (difficulty?: string) => {
    const diff = difficulty?.toLowerCase() || 'medium';
    switch (diff) {
      case 'easy':
        return 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400';
      case 'hard':
        return 'bg-red-500/10 border border-red-500/25 text-red-400';
      default:
        return 'bg-amber-500/10 border border-amber-500/25 text-amber-400';
    }
  };

  const getQuestionTypeColors = (type?: string) => {
    const t = type?.toLowerCase() || 'short-answer';
    switch (t) {
      case 'multiple-choice':
        return 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400';
      case 'fill-in-the-blank':
        return 'bg-purple-500/10 border border-purple-500/25 text-purple-400';
      case 'short-answer':
        return 'bg-violet-500/10 border border-violet-500/25 text-violet-400';
      case 'long-answer':
        return 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-400';
      default:
        return 'bg-slate-500/10 border border-slate-500/25 text-slate-400';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 z-10 relative">
      {/* Section container with subtle bg for separation */}
      <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/30 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      {/* Header & Search Area */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 border-b border-slate-600/50 pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 drop-shadow-sm">
            <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <BookMarked className="w-5 h-5" />
            </span>
            Personal Study Library
          </h2>
          <p className="text-xs text-slate-400 font-light">
            Search, rename, and review your previous AI summaries and mock exams.
          </p>
        </div>

        {/* Custom Frosted Search Bar */}
        {user && (
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-xs md:text-sm rounded-2xl border border-slate-500/40 bg-slate-800/50 shadow-inner text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
            />
          </div>
        )}
      </div>

      {/* Auth state checking */}
      {!user && (
        <div className="p-8 rounded-3xl border border-slate-600/50 text-center bg-slate-900/70 backdrop-blur-md shadow-lg shadow-black/30">
          <p className="text-4xl mb-3 opacity-60">🔒</p>
          <h3 className="text-base font-bold text-slate-200">
            History Locked
          </h3>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto font-light">
            Please log in or sign up in the top right to start archiving and viewing your personalized study sessions.
          </p>
        </div>
      )}

      {/* Loading Skeletons */}
      {user && loading && (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse h-20 rounded-2xl bg-slate-900/60 border border-slate-600/40"
            ></div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {user && !loading && filteredAnalyses.length === 0 && (
        <div className="p-12 rounded-3xl border border-dashed border-slate-600/50 text-center bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-black/30">
          <p className="text-4xl mb-4">📂</p>
          <h3 className="text-lg font-bold text-slate-200">
            No Saved Materials Found
          </h3>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto font-light">
            Once you paste notes or upload a PDF textbook, click the save button at the bottom to store it in your library.
          </p>
        </div>
      )}

      {/* Library History Grid List */}
      {user && !loading && filteredAnalyses.length > 0 && (
        <div className="grid gap-4 grid-cols-1">
          {filteredAnalyses.map((item) => (
            <motion.div
              layoutId={`card-container-${item.id}`}
              key={item.id}
              className="p-5 rounded-2xl border border-slate-600/50 bg-slate-900/65 backdrop-blur-md hover:bg-slate-900/80 shadow-lg shadow-black/30 hover:border-slate-500/70 transition-all duration-300 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editingId === item.id ? (
                    <div className="flex flex-wrap gap-2.5 items-center">
                      <input
                        ref={inputRef}
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="px-3.5 py-2 text-xs md:text-sm rounded-xl border border-white/10 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        autoFocus
                      />

                      <button
                        onClick={() => handleRename(item.id)}
                        className="px-3.5 py-2 text-xs rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all active:scale-95 cursor-pointer"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditedName('');
                        }}
                        className="px-3.5 py-2 text-xs rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer space-y-1.5"
                      onClick={() => setSelected(item)}
                    >
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition truncate pr-4">
                          {item.fileName}
                        </h3>
                        {item.difficulty && (
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${getDifficultyBadge(item.difficulty)}`}>
                            {item.difficulty}
                          </span>
                        )}
                        {item.studyMode && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                            {item.studyMode}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-slate-500 text-[11px] font-medium pl-0.5">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                          Inspect <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {editingId !== item.id && (
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditedName(item.fileName);

                        setTimeout(() => {
                          inputRef.current?.focus();
                          inputRef.current?.select();
                        }, 0);
                      }}
                      className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all border border-white/5 active:scale-95 cursor-pointer"
                      title="Rename"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all border border-red-500/15 active:scale-95 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={() => setSelected(item)}
                      className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all border border-indigo-500/20 active:scale-95 cursor-pointer ml-1"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>

      {/* Cinematic Inspect Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-500/50 bg-slate-900/[0.97] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 md:p-8 relative scrollbar-thin flex flex-col gap-6"
              initial={{ scale: 0.94, y: 25, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 25, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top sticky title container */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-600/40 pb-5 sticky top-0 bg-slate-900/80 backdrop-blur-2xl z-10 pt-1">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                      {selected.fileName}
                    </h2>
                    {selected.difficulty && (
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getDifficultyBadge(selected.difficulty)}`}>
                        {selected.difficulty}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selected.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(selected.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white transition active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable details contents */}
              <div className="space-y-8 py-2">
                {/* Executive Summary */}
                <div className="space-y-3.5">
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                      <FileText className="w-4.5 h-4.5" />
                    </span>
                    Executive Summary
                  </h3>

                  <div className="relative p-5 rounded-2xl bg-slate-800/45 shadow-inner border border-slate-500/40 text-sm md:text-base leading-relaxed text-slate-100 font-normal">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl"></div>
                    {selected.summary}
                  </div>
                </div>

                <div className="h-[1px] w-full bg-slate-700/40"></div>

                {/* Key Concepts */}
                <div className="space-y-3.5">
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                      <KeyRound className="w-4.5 h-4.5" />
                    </span>
                    Core Concepts
                  </h3>

                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selected.keyPoints.map((kp, i) => (
                      <li
                        key={i}
                        className="p-4 rounded-2xl bg-slate-800/45 border border-slate-500/40 flex items-start gap-3 hover:bg-slate-800/65 transition shadow-md shadow-black/20"
                      >
                        <span className="flex items-center justify-center mt-0.5 w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal">{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selected.questions && selected.questions.length > 0 && (
                  <>
                    <div className="h-[1px] w-full bg-slate-700/40"></div>

                    {/* Question list */}
                    <div className="space-y-3.5">
                      <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                        <span className="p-1.5 bg-orange-500/10 rounded-lg text-orange-400">
                          <HelpCircle className="w-4.5 h-4.5" />
                        </span>
                        Archived Practice Set
                      </h3>

                      <div className="flex flex-col gap-4">
                        {selected.questions.map((q, i) => (
                          <div
                            key={q.id || i}
                            className="p-5 rounded-2xl border border-slate-500/40 bg-slate-800/45 flex flex-col gap-3 shadow-md shadow-black/25"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getQuestionTypeColors(q.type)}`}>
                                {q.type?.replace(/-/g, ' ') || 'question'}
                              </div>
                              <span className="text-xs text-slate-450 font-bold">Question {i + 1}</span>
                            </div>

                            <p className="font-extrabold text-slate-100 text-sm md:text-base leading-relaxed">
                              <span className="text-orange-400 mr-1.5 font-black">Q.</span>
                              {q.question}
                            </p>

                            {q.options && q.options.length > 0 && (
                              <div className="mt-2 grid grid-cols-1 gap-2.5 pl-2">
                                {q.options.map((option, optionIndex) => (
                                  <div 
                                    key={optionIndex} 
                                    className="px-4 py-3 text-xs bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 font-medium flex items-center gap-3"
                                  >
                                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center uppercase shrink-0">
                                      {String.fromCharCode(65 + optionIndex)}
                                    </span>
                                    <span>{option}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-3 p-4 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-xs md:text-sm text-slate-100 leading-relaxed font-normal shadow-inner">
                              <span className="font-bold text-indigo-400 mr-1.5">Correct Answer:</span>
                              {q.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Actions footer */}
              <div className="flex justify-end border-t border-slate-700/40 pt-5 mt-2">
                <button
                  onClick={() => setSelected(null)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-white/5"
                >
                  Done Reviewing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Deletion Modal Redesign */}
      <AnimatePresence>
        {deleteId && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="w-full max-w-sm rounded-3xl bg-slate-900/[0.97] border border-slate-600/50 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
              initial={{ scale: 0.93, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.93, y: 15, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Confirm Deletion
                  </h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Are you sure you want to delete this study session? This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-350 font-semibold text-xs transition active:scale-95 cursor-pointer border border-slate-700/60"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/20 transition active:scale-95 cursor-pointer"
                >
                  Delete Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
