import Uploader from '@/components/Uploader';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background glowing orbs for UI aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center gap-8 text-center mb-8">
        <div className="inline-block p-4 rounded-3xl bg-blue-500/10 mb-2">
          <span className="text-5xl">🧠</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight">
          Smart Study Assistant
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-light leading-relaxed">
          Upload your notes or PDF files and instantly get summaries, key points, and exam-style questions powered by AI.
        </p>
      </div>

      <div className="z-10 w-full">
        <Uploader />
      </div>
    </main>
  );
}
