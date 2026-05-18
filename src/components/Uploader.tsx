'use client';

import { 
  FileText, 
  KeyRound, 
  HelpCircle, 
  Sparkles, 
  Save, 
  UploadCloud, 
  Target, 
  Zap, 
  Layers, 
  Check, 
  Loader2, 
  AlertCircle,
  BookOpen
} from 'lucide-react';
import Flashcards from './Flashcards';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { AnimatePresence, motion } from 'framer-motion';

interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-in-the-blank' | 'short-answer' | 'long-answer';
  question: string;
  options?: string[];
  answer: string;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface AnalysisResult {
  mode?: string;
  summary: string;
  keyPoints: string[];
  questions: Question[];
  flashcards?: Flashcard[];
}

export default function Uploader({
  onSaved,
}: {
  onSaved?: () => void;
}) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('short-answer');
  const [studyMode, setStudyMode] = useState('practice');
  const [user, setUser] = useState<User | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openAnswers, setOpenAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setText('');
      toast.success(`Loaded file: ${e.target.files[0].name}`);
    }
  };

  const handleAnalyze = async () => {
    if (!text && !file) {
      setError('Please paste some text or upload a PDF first.');
      toast.error('Please input some study material.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setIsSaved(false);
    setOpenAnswers({});

    try {
      const formData = new FormData();

      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', text);
      }

      formData.append('difficulty', difficulty);
      formData.append('questionType', questionType);
      formData.append('studyMode', studyMode);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze the document.');
      }

      setResults(data);
      toast.success('AI generation completed successfully!');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      toast.error(err.message || 'Analysis failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!results) return;
    if (!user) {
      toast.error('Please sign in to save your sessions.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const saveResponse = await fetch('/api/analysis/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          fileName: file ? file.name : 'Pasted text',
          summary: results.summary,
          keyPoints: results.keyPoints,
          questions: results.questions,
          flashcards: results.flashcards || [],
          studyMode,
          difficulty,
          questionType,
        }),
      });

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveData.error || 'Failed to save analysis.');
      }

      setIsSaved(true);
      toast.success('Session saved to history!');
      onSaved?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save analysis.');
      toast.error(err.message || 'Failed to save analysis.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAnswer = (id: string) => {
    setOpenAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Study Mode visual helper items
  const studyModes = [
    { id: 'summary', name: 'Summary', icon: FileText, desc: 'Key summaries & core concepts' },
    { id: 'practice', name: 'Practice', icon: Target, desc: 'Standard Q&A exercises' },
    { id: 'quiz', name: 'Quiz', icon: Zap, desc: 'Multiple choice checkpoints' },
    { id: 'flashcards', name: 'Flashcards', icon: Layers, desc: 'Flip active recall cards' },
  ];

  // Colors for badges based on type
  const getBadgeColors = (type: string) => {
    switch (type) {
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
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto z-10">
      {/* Redesigned Input Card */}
      <div className="flex flex-col gap-6 p-6 md:p-8 bg-slate-900/85 border border-slate-500/40 rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl relative overflow-hidden transition-all duration-300">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
            <span className="p-1 bg-indigo-500/10 rounded-lg text-indigo-400">
              <UploadCloud className="w-5 h-5" />
            </span>
            Upload or Paste Material
          </h2>
          {file && (
            <button 
              onClick={() => setFile(null)} 
              className="text-xs text-red-400 hover:text-red-300 font-semibold transition"
            >
              Clear file
            </button>
          )}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold flex items-center gap-2.5"
          >
            <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Text Paste Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider pl-1">
            Option 1: Paste Notes or Raw Text
          </label>
          <textarea
            className="w-full min-h-[150px] p-4 bg-slate-800/50 border border-slate-500/40 rounded-2xl shadow-inner focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-all duration-200 resize-y text-slate-100 placeholder-slate-400 text-sm leading-relaxed"
            placeholder="Paste your study materials, lecture scripts, or notes here..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (e.target.value) setFile(null);
            }}
            disabled={isLoading}
          />
        </div>

        {/* Or Divider */}
        <div className="flex items-center gap-4 py-1">
          <div className="h-[1px] flex-1 bg-slate-700/40"></div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">OR</span>
          <div className="h-[1px] flex-1 bg-slate-700/40"></div>
        </div>

        {/* File Uploader Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider pl-1">
            Option 2: Upload Document
          </label>
          <div className="relative group rounded-2xl bg-slate-800/50 border border-slate-500/40 shadow-inner hover:border-indigo-500/60 transition-all p-2 flex items-center justify-between">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center gap-3 pl-3 py-1">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition">
                {file ? file.name : "Select study PDF or TXT..."}
              </span>
            </div>
            <span className="px-4 py-2 text-xs font-bold bg-slate-800 text-slate-100 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all border border-slate-700">
              Browse
            </span>
          </div>
        </div>

        {/* Segmented Study Mode Card Layout */}
        <div className="flex flex-col gap-2.5 mt-2">
          <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider pl-1">
            Step 3: Select Study Mode
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
            {studyModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = studyMode === mode.id;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setStudyMode(mode.id)}
                  className={`relative p-3.5 rounded-2xl flex flex-col items-center text-center gap-2 border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200 shadow-md shadow-indigo-500/10'
                      : 'border-slate-600/50 bg-slate-800/50 hover:bg-slate-800/70 hover:border-slate-500 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isSelected ? 'text-indigo-400 scale-110' : 'text-slate-400'}`} />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold tracking-tight">{mode.name}</span>
                    <span className="text-[9px] opacity-75 font-light leading-none hidden md:inline">{mode.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dropdowns for Difficulty and Question Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider pl-1">
              Difficulty Level
            </label>
            <div className="relative">
              <select
                className="w-full p-3.5 text-sm bg-slate-800/50 border border-slate-500/40 rounded-2xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-inner transition cursor-pointer appearance-none"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">🟢 Easy Mode</option>
                <option value="medium">🟡 Medium Standard</option>
                <option value="hard">🔴 Hard Challenge</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider pl-1">
              Question Type (Q&A Modes)
            </label>
            <div className="relative">
              <select
                className="w-full p-3.5 text-sm bg-slate-800/50 border border-slate-500/40 rounded-2xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-inner transition cursor-pointer appearance-none"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
              >
                <option value="short-answer">📝 Short Answer</option>
                <option value="multiple-choice">🎯 Multiple Choice</option>
                <option value="fill-in-the-blank">🔤 Fill in the Blank</option>
                <option value="long-answer">📖 Long Essay Response</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={!isLoading ? { scale: 1.01, y: -1 } : {}}
          whileTap={!isLoading ? { scale: 0.99 } : {}}
          onClick={handleAnalyze}
          disabled={isLoading}
          className={`mt-4 w-full text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-base cursor-pointer ${
            isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:shadow-2xl hover:shadow-indigo-500/20 border border-indigo-400/20'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Generating AI study materials...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <span>Assemble AI {studyModes.find(m => m.id === studyMode)?.name}</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Loading Skeleton loader */}
      {isLoading && (
        <div className="flex flex-col gap-6 p-6 md:p-8 bg-slate-900/70 border border-slate-600/50 rounded-3xl animate-pulse">
          <div className="h-6 w-36 bg-slate-800 rounded-md mb-2"></div>
          <div className="h-20 bg-slate-800 rounded-2xl mb-4"></div>
          <div className="h-[1px] w-full bg-slate-700/30 my-2"></div>
          <div className="h-6 w-40 bg-slate-800 rounded-md mb-2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-16 bg-slate-800 rounded-xl"></div>
            <div className="h-16 bg-slate-800 rounded-xl"></div>
          </div>
        </div>
      )}

      {/* Redesigned AI Results Component */}
      <AnimatePresence>
        {results && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col gap-8 p-6 md:p-8 bg-slate-900/85 border border-slate-500/40 rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl relative overflow-hidden"
          >
            {/* Header background light */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>

            {/* Summary Box */}
            <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2.5">
                <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </span>
                AI Executive Summary
              </h3>
              
              <div className="relative p-5 rounded-2xl bg-slate-800/45 shadow-inner border border-slate-500/40 leading-relaxed text-sm md:text-base text-slate-100 font-normal">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl"></div>
                {results.summary}
              </div>
            </div>

            <div className="h-[1px] w-full bg-slate-700/40"></div>

            {/* Key Points Grid */}
            <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2.5">
                <span className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                  <KeyRound className="w-5 h-5" />
                </span>
                Core Study Concepts
              </h3>
            
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {results.keyPoints.map((point, idx) => (
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx}
                    className="flex items-start gap-3 bg-slate-800/45 hover:bg-slate-800/65 p-4 rounded-2xl border border-slate-500/40 transition-all shadow-md shadow-black/25"
                  >
                    <span className="flex items-center justify-center mt-0.5 w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-200 leading-relaxed font-normal">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="h-[1px] w-full bg-slate-700/40"></div>

            {/* Practice / Quiz Questions */}
            {studyMode !== 'flashcards' && (
              <div className="space-y-5 relative z-10">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2.5">
                  <span className="p-1.5 bg-orange-500/10 rounded-lg text-orange-400">
                    <HelpCircle className="w-5 h-5" />
                  </span>
                  Interactive Practice
                </h3>

                <div className="space-y-5 mt-4">
                  {results.questions.map((q, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={q.id || idx}
                      className="p-5 bg-slate-800/45 border border-slate-500/40 rounded-2xl hover:border-slate-400/50 transition-all flex flex-col gap-3 shadow-md shadow-black/25"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getBadgeColors(q.type)}`}>
                          {q.type.replace(/-/g, ' ')}
                        </div>
                        <span className="text-xs text-slate-450 font-bold">Exercise {idx + 1}</span>
                      </div>

                      <p className="font-extrabold text-slate-100 text-sm md:text-base leading-relaxed">
                        <span className="text-indigo-400 mr-1.5 font-black">Q.</span>
                        {q.question}
                      </p>

                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 grid grid-cols-1 gap-2.5 pl-2">
                          {q.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex} 
                              className="px-4 py-3 text-xs md:text-sm bg-slate-800/60 border border-slate-600/50 rounded-xl text-slate-200 font-medium flex items-center gap-3 hover:bg-slate-800/80 hover:border-slate-500 transition"
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center uppercase shrink-0">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-start mt-2">
                        <button
                          onClick={() => toggleAnswer(q.id || String(idx))}
                          className="px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-indigo-600 text-slate-100 hover:text-white text-xs font-bold transition-all duration-200 border border-slate-600/80 active:scale-95 cursor-pointer"
                        >
                          {openAnswers[q.id || String(idx)] ? 'Hide Answer' : 'Reveal Answer'}
                        </button>
                      </div>

                      {/* Smooth Framer Motion Answer Height Reveal */}
                      <AnimatePresence>
                        {openAnswers[q.id || String(idx)] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <div className="mt-3 p-4 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-xs md:text-sm text-slate-100 leading-relaxed font-normal shadow-inner">
                              <span className="font-bold text-indigo-400 mr-1.5">Answer:</span> 
                              {q.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Flashcards View */}
            {studyMode === 'flashcards' && results.flashcards && (
              <Flashcards cards={results.flashcards} />
            )}

            {/* Save to History Button */}
            <motion.button
              whileTap={!(isSaved || isSaving) ? { scale: 0.98 } : {}}
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className={`w-full py-4 px-5 rounded-2xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 hover:bg-emerald-700 border border-emerald-500/20 shadow-lg shadow-emerald-950/20'
                  : isSaving
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-slate-100 hover:bg-white text-slate-950 shadow-md font-extrabold'
              }`}
            >
              {isSaved ? (
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-white" />
                  <span>Successfully Saved to Library</span>
                </div>
              ) : isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span>Saving Session...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Archive to Study Library</span>
                </div>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}