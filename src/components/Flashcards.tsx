'use client';

import { useState } from 'react';

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
    <div className="space-y-6 mt-8">
      <div>
        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          🃏 Flashcards
        </h3>

        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Click a card to flip it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, index) => {
          const isFlipped = flipped[card.id];

          return (
            <div
              key={card.id || index}
              onClick={() => toggleCard(card.id)}
              className="group cursor-pointer perspective"
            >
              <div
                className={`relative h-64 w-full transition-all duration-500 transform-style-preserve-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 shadow-2xl backface-hidden flex flex-col justify-between">
                  <div className="text-sm font-bold opacity-80">
                    FRONT
                  </div>

                  <div className="text-xl font-bold leading-relaxed">
                    {card.front}
                  </div>

                  <div className="text-sm opacity-70">
                    Click to reveal answer
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 rounded-3xl bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 text-gray-900 dark:text-white p-6 shadow-2xl rotate-y-180 backface-hidden flex flex-col justify-between">
                  <div className="text-sm font-bold text-indigo-500">
                    BACK
                  </div>

                  <div className="text-lg leading-relaxed">
                    {card.back}
                  </div>

                  <div className="text-sm text-gray-400">
                    Click to flip back
                  </div>
                </div>
              </div>
            </div>
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