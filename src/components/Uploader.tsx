'use client';
import { useState } from 'react';

// Type describing the structure of our AI's response
interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  questions: string[];
}

export default function Uploader() {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!text && !file) {
      setError("Please paste some text or upload a PDF first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', text);
      }

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {/* Upload Box */}
      <div className="flex flex-col gap-6 p-6 md:p-8 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl backdrop-blur-md transition-all">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Upload or Paste Content</h2>
        
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Option 1: Paste Text</label>
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
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Option 2: Upload PDF</label>
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

        <button 
          onClick={handleAnalyze}
          disabled={isLoading}
          className={`mt-4 w-full text-white font-bold py-4 px-6 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg ${
            isLoading 
              ? 'bg-blue-400 dark:bg-blue-800 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40 transform hover:-translate-y-1'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Generate Study Materials ✨'
          )}
        </button>
      </div>

      {/* Results Box */}
      {results && (
        <div className="flex flex-col gap-8 p-6 md:p-8 bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl shadow-2xl animate-fade-in-up">
          
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <span className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">📝</span> 
              Summary
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              {results.summary}
            </p>
          </div>

          <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800"></div>

          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <span className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">🔑</span> 
              Key Points
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {results.keyPoints.map((point: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 bg-slate-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="mt-1 text-purple-500">❖</span>
                  <span className="text-gray-700 dark:text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800"></div>

          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <span className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400">❓</span> 
              Practice Questions
            </h3>
            <div className="space-y-4 mt-4">
              {results.questions.map((q: string, idx: number) => (
                <div key={idx} className="p-5 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-500/20 rounded-2xl">
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    <span className="text-orange-500 mr-2">Q{idx + 1}.</span> 
                    {q}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
