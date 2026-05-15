import AnalysisHistory from '@/components/AnalysisHistory';
import Uploader from '@/components/Uploader';
import { Toaster } from 'react-hot-toast';
import { WandSparkles } from 'lucide-react';
import Auth from '@/components/Auth';
import { useState } from 'react';

export default function Home() {
  const [refreshHistory, setRefreshHistory] = useState(0);
  return (
    
   <main className="min-h-screen bg-[url('/2.jpg')] bg-cover bg-center bg-fixed flex flex-col items-center p-6 md:p-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      <Toaster
  position="top-right"
  toastOptions={{
    style: {
      background: '#111827',
      color: '#fff',
      borderRadius: '16px',
      padding: '14px 18px',
    },
  }}
/>
      {/* Background glowing orbs for UI aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

<div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center gap-6 text-center mb-10 pt-8">
      
     <div className="inline-flex items-center justify-center p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/60 dark:border-slate-800 shadow-2xl shadow-indigo-500/10 mb-2 backdrop-blur">
         <WandSparkles className="w-12 h-12 text-indigo-500" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 dark:from-indigo-300 dark:via-blue-300 dark:to-cyan-300 tracking-tight" >
          Smart Study Assistant
        </h1>
        <p className="text-lg md:text-xl text-slate-100/90 max-w-2xl font-light leading-relaxed">
          Upload your notes or PDF files and instantly get summaries, key points, and exam-style questions powered by AI.
        </p>
      </div>
      <div className="z-10 w-full flex flex-col gap-10">
  <Auth />
  <Uploader onSaved={() => setRefreshHistory((prev) => prev + 1)} />
 <AnalysisHistory refreshTrigger={refreshHistory} />
</div>

    </main>
  );
}
