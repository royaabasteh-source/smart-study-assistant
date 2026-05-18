'use client';

import AnalysisHistory from '@/components/AnalysisHistory';
import Uploader from '@/components/Uploader';
import { Toaster } from 'react-hot-toast';
import { WandSparkles } from 'lucide-react';
import Auth from '@/components/Auth';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [refreshHistory, setRefreshHistory] = useState(0);

  return (
    <main className="min-h-screen bg-[url('/2.jpg')] bg-cover bg-center bg-fixed flex flex-col items-center p-6 md:p-10 relative overflow-hidden text-white selection:bg-indigo-400/30">
      {/* Deep navy overlay with blur to soften starry background */}
      <div className="absolute inset-0 bg-[#050b1a]/[0.92] backdrop-blur-[6px] z-0"></div>
      
      {/* Soft radial vignette — pushes focus to center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(3,7,18,0.7)_100%)] pointer-events-none z-0"></div>
      
      {/* Ultra-subtle tech grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 16px 48px -12px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(24px)',
            fontSize: '14px',
          },
        }}
      />
      
      {/* Ambient gradient orbs — very soft atmospheric glow */}
      <motion.div 
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.06, 0.12, 0.06],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/15 to-blue-400/10 blur-[160px] rounded-full pointer-events-none z-0"
      ></motion.div>
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.10, 0.05],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
        className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-violet-500/12 to-cyan-400/8 blur-[160px] rounded-full pointer-events-none z-0"
      ></motion.div>
      {/* Third accent orb — center */}
      <motion.div 
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.03, 0.07, 0.03],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6
        }}
        className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-gradient-to-r from-cyan-400/8 to-indigo-400/8 blur-[140px] rounded-full pointer-events-none z-0"
      ></motion.div>

      {/* Floating Auth Widget */}
      <div className="z-20 w-full max-w-5xl flex justify-end">
        <Auth />
      </div>

      {/* Hero Header Section */}
      <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center gap-5 text-center mb-14 pt-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="relative inline-flex items-center justify-center p-5 rounded-2xl glass-card-elevated shadow-[0_8px_32px_rgba(99,102,241,0.12)] mb-3 group hover:border-indigo-400/30 transition-all duration-500"
        >
          {/* Hover glow aura */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/15 to-cyan-400/15 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <WandSparkles className="w-9 h-9 text-indigo-400 group-hover:text-cyan-400 group-hover:rotate-12 transition-all duration-500 z-10" />
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">Smart Study </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300">Assistant</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-slate-300 max-w-2xl font-light leading-relaxed"
        >
          Elevate your learning. Upload lecture slides, PDF textbooks, or raw study notes to instantly unlock high-fidelity summaries, key concepts, test quizzes, and active-recall flashcards.
        </motion.p>
      </div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="z-10 w-full flex flex-col gap-16"
      >
        <Uploader onSaved={() => setRefreshHistory((prev) => prev + 1)} />
        <AnalysisHistory refreshTrigger={refreshHistory} />
      </motion.div>
    </main>
  );
}
