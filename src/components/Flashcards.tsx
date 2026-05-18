'use client';

import { useState } from 'react';
import { Layers, HelpCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardsProps {
  cards: Flashcard[];
}

export default function Flashcards({ cards }: FlashcardsProps) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/40 pb-4">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Layers className="w-5 h-5" />
            </span>
            Interactive Flashcards
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-light">
            Boost active recall. Click any card to flip and verify your understanding.
          </p>
        </div>
        <div className="text-xs bg-slate-800/50 border border-slate-600/50 px-3 py-1.5 rounded-xl text-indigo-300 font-semibold w-max">
          {cards.length} Cards Generated
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => {
          const isFlipped = flipped[card.id];

          return (
            <motion.div
              key={card.id || index}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
              onClick={() => toggleCard(card.id)}
              className="group cursor-pointer perspective h-64 w-full"
            >
              <div
                className={`relative h-full w-full transition-all duration-500 transform-style-preserve-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front side of Card */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-7 shadow-2xl shadow-indigo-950/30 backface-hidden flex flex-col justify-between border border-white/10 relative overflow-hidden">
                  {/* Subtle inner card light overlay */}
                  <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full text-white/90">
                      FRONT • {index + 1}
                    </span>
                    <HelpCircle className="w-4 h-4 text-white/60" />
                  </div>

                  <div className="text-lg md:text-xl font-bold leading-relaxed tracking-wide text-white drop-shadow-sm z-10 my-4 line-clamp-4">
                    {card.front}
                  </div>

                  <div className="text-[11px] text-white/70 font-semibold flex items-center gap-1.5 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    Click card to reveal answer
                  </div>
                </div>

                {/* Back side of Card */}
                <div className="absolute inset-0 rounded-3xl bg-slate-900/[0.97] border border-slate-600/50 text-slate-100 p-7 shadow-2xl shadow-black/40 rotate-y-180 backface-hidden flex flex-col justify-between relative overflow-hidden">
                  {/* Subtle glow on card back */}
                  <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-indigo-500/5 blur-2xl rounded-full"></div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 px-2.5 py-1 rounded-full text-indigo-300 border border-indigo-500/30">
                      BACK • ANSWER
                    </span>
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                  </div>

                  <div className="text-base md:text-lg font-medium leading-relaxed text-slate-200 overflow-y-auto max-h-[110px] pr-1 py-1 scrollbar-thin">
                    {card.back}
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium">
                    Click to flip back
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style jsx>{`
        .perspective {
          perspective: 1200px;
        }

        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }

        .backface-hidden {
          backface-visibility: hidden;
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}