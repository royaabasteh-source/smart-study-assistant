
'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

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
      toast.success('Analysis deleted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete analysis.');
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
      toast.success('Analysis renamed!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to rename analysis.');
    }
  };

  const filteredAnalyses = analyses.filter((item) =>
    item.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto mt-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            📚 Analysis History
          </h2>

          <p className="text-slate-300 mt-1">
            View, rename, and manage your saved AI study sessions.
          </p>
        </div>

        <input
          type="text"
          placeholder="Search history..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        />
      </div>

      {loading && (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse h-24 rounded-2xl bg-gray-200 dark:bg-gray-800"
            ></div>
          ))}
        </div>
      )}

      {!loading && filteredAnalyses.length === 0 && (
        <div className="p-10 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-900">
          <p className="text-5xl mb-3">📂</p>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            No analyses found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Generate and save study material to see it here.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filteredAnalyses.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                {editingId === item.id ? (
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      ref={inputRef}
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                      autoFocus
                    />

                    <button
                      onClick={() => handleRename(item.id)}
                      className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditedName('');
                      }}
                      className="px-4 py-2 rounded-xl bg-gray-500 text-white font-semibold hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => setSelected(item)}
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.fileName}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {editingId !== item.id && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setEditedName(item.fileName);

                      setTimeout(() => {
                        inputRef.current?.focus();
                        inputRef.current?.select();
                      }, 0);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    Rename
                  </button>

                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
  {selected && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelected(null)}
    >
      <motion.div
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-indigo-100 dark:border-indigo-900/40 bg-white dark:bg-gray-900 shadow-2xl p-6 md:p-8"
        initial={{ scale: 0.95, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 30, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-6 sticky top-0 bg-white dark:bg-gray-900 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {selected.fileName}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {new Date(selected.createdAt).toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => setSelected(null)}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Summary
            </h3>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {selected.summary}
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Key Points
            </h3>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selected.keyPoints.map((kp, i) => (
                <li
                  key={i}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                >
                  {kp}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Practice Questions
            </h3>

            <div className="flex flex-col gap-4">
              {selected.questions.map((q, i) => (
                <div
                  key={q.id || i}
                  className="p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10"
                >
                  <div className="mb-3 inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                    {q.type?.replace(/-/g, ' ') || 'question'}
                  </div>

                  <p className="font-bold text-gray-900 dark:text-white">
                    <span className="text-orange-500 mr-2">Q{i + 1}.</span>
                    {q.question}
                  </p>

                  {q.options && q.options.length > 0 && (
                    <ul className="mt-3 ml-6 list-disc text-gray-700 dark:text-gray-300">
                      {q.options.map((option, optionIndex) => (
                        <li key={optionIndex}>{option}</li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 text-gray-700 dark:text-gray-300">
                    <strong>Answer:</strong> {q.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 p-8 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Delete Analysis?
              </h3>

              <p className="text-gray-500 dark:text-gray-400 mt-3">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
