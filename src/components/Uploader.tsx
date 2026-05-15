'use client';

import { FileText, KeyRound, HelpCircle, Sparkles, Save } from 'lucide-react';
import Flashcards from './Flashcards';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

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
    }
  };

  const handleAnalyze = async () => {
    if (!text && !file) {
      setError('Please paste some text or upload a PDF first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setIsSaved(false);
    toast.success('Analysis saved to history!');
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
  toast.error('Please log in before saving.');
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
      toast.success('Analysis saved to history!');
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

  return (
    
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-6 p-6 md:p-8 bg-white/70 dark:bg-slate-900/70 border border-white/40 dark:border-slate-800 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Upload or Paste Content
        </h2>

        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Option 1: Paste Text
          </label>
          <textarea
            className="w-full min-h-[160px] p-4 bg-slate-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all resize-y text-gray-900 dark:text-gray-100 placeholder-gray-400"
            placeholder="Paste your study material here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading || !!file}
          />
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-800"></div>
          <span className="text-xs font-black uppercase text-gray-400 tracking-widest">OR</span>
          <div className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-800"></div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Option 2: Upload PDF
          </label>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-3 file:px-6
              file:rounded-xl file:border-0
              file:text-sm file:font-bold
              file:bg-indigo-50 file:text-indigo-700
              dark:file:bg-indigo-500/20 dark:file:text-indigo-400
              hover:file:bg-indigo-100 hover:dark:file:bg-indigo-500/30
              transition-all cursor-pointer bg-slate-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-2"
          />
        </div>
        <div className="flex flex-col gap-2">
  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
    Choose Study Mode
  </label>

  <select
    value={studyMode}
    onChange={(e) => setStudyMode(e.target.value)}
    className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
  >
    <option value="summary">Summary</option>
    <option value="practice">Practice</option>
    <option value="quiz">Quiz</option>
    <option value="flashcards">Flashcards</option>
  </select>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Difficulty Level
            </label>
            <select
              className="p-3 bg-slate-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Question Type
            </label>
            <select
              className="p-3 bg-slate-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-gray-100"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
            >
              <option value="short-answer">Short Answer</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="fill-in-the-blank">Fill in the Blank</option>
              <option value="long-answer">Long Answer</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          className={`mt-4 w-full text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg ${
  isLoading
    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed shadow-none'
    : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:shadow-2xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0'
}`}
        >
          {isLoading ? (
  'Generating...'
) : (
  <div className="flex items-center gap-2">
    <Sparkles className="w-5 h-5" />
    <span>Generate {studyMode}</span>
  </div>
)}
    
        </button>
      </div>

      {results && (
        <div className="flex flex-col gap-8 p-6 md:p-8 bg-white/80 dark:bg-slate-900/80 border border-white/50 dark:border-slate-800 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl animate-fade-in-up">
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-3">
  <span className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  </span>
  Summary
</h3>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              {results.summary}
            </p>
          </div>

          <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800"></div>

          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-3">
  <span className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
    <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />
  </span>
  Key Points
</h3>
          
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {results.keyPoints.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 bg-slate-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700"
                >
                  <span className="mt-1 text-purple-500">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800"></div>

          {studyMode !== 'flashcards' && (
  <div className="space-y-4">
    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-3">
  <span className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
    <HelpCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
  </span>
  Practice Questions
</h3>

            <div className="space-y-4 mt-4">
              {results.questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-5 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl"
                >
                  <div className="mb-3 inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
  {q.type.replace(/-/g, ' ')}
</div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    <span className="text-orange-500 mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </p>

                  {q.options && q.options.length > 0 && (
                    <ul className="mt-3 ml-6 list-disc text-gray-700 dark:text-gray-300">
                      {q.options.map((option, optionIndex) => (
                        <li key={optionIndex}>{option}</li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => toggleAnswer(q.id || String(idx))}
                    className="mt-4 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
                  >
                    {openAnswers[q.id || String(idx)] ? 'Hide Answer' : 'Show Answer'}
                  </button>

                  {openAnswers[q.id || String(idx)] && (
                    <div className="mt-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 text-gray-700 dark:text-gray-300">
                      <strong>Answer:</strong> {q.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {studyMode === 'flashcards' && results.flashcards && (
          <Flashcards cards={results.flashcards} />
        )}
<button
  onClick={handleSave}
  disabled={!results || isSaving || isSaved}
  className={`w-full py-3 px-5 rounded-2xl font-bold text-white transition-all flex items-center justify-center ${
  isSaved
    ? 'bg-emerald-600 cursor-not-allowed'
    : isSaving
      ? 'bg-slate-400 cursor-not-allowed'
      : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:shadow-xl hover:-translate-y-0.5'
}`}
>
  <div className="flex items-center justify-center gap-2">
  <Save className="w-4 h-4" />
  <span>
    {isSaved ? 'Saved to History' : isSaving ? 'Saving...' : 'Save to History'}
  </span>
</div>
</button>
        </div>
      )}
    </div>
  );
}