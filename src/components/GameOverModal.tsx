/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, Player } from '../types/game';
import { Trophy, RotateCcw, Swords, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  winner: Player | null;
  rankedPlayers: Player[];
  onPlayAgain: () => void;
  language: Language;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  rankedPlayers,
  onPlayAgain,
  language,
}) => {
  if (!isOpen || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
      <div className="relative w-full max-w-md bg-stone-900 border border-amber-500/50 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden text-stone-200 text-center flex flex-col p-6 sm:p-8">
        {/* Decorative Top Rangoli Garland */}
        <div className="flex justify-center items-center gap-1 text-amber-400 text-sm mb-2">
          <span>❋</span>
          <span>✦</span>
          <span>❋</span>
          <span>✦</span>
          <span>❋</span>
        </div>

        {/* Winner Trophy & Crown */}
        <div className="relative mx-auto my-3">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-xl ring-4 ring-amber-400 ring-offset-4 ring-offset-stone-900 mx-auto"
            style={{ backgroundColor: winner.colorHex }}
          >
            {winner.isAI && winner.botPersonality ? winner.botPersonality.avatar : '👑'}
          </div>
          <div className="absolute -bottom-2 -right-1 bg-amber-500 text-stone-950 p-1.5 rounded-full shadow-lg">
            <Trophy className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Title */}
        <span className="text-xs uppercase tracking-widest text-amber-400 font-bold mt-2">
          {language === 'te' ? 'విజయ ఘోష (Victory Celebration)' : 'Victory Celebration'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-cinzel text-white mt-1">
          {language === 'te' ? `${winner.nameTelugu} విజేత!` : `${winner.name} Wins!`}
        </h2>
        <p className="text-xs text-stone-400 mt-1">
          {language === 'te'
            ? 'అన్ని కాయలను విజయవంతంగా గర్భగుడికి చేర్చి ఆటను గెలుచుకున్నారు!'
            : 'Successfully guided all 4 tokens into the central home sanctum!'}
        </p>

        {/* Podium Standings */}
        <div className="mt-6 bg-stone-950/60 rounded-2xl p-3 border border-stone-800/80 space-y-2">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block text-left">
            {language === 'te' ? 'అంతిమ స్థానాలు (Final Standings)' : 'Final Standings'}
          </span>
          <div className="space-y-1.5">
            {rankedPlayers.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      idx === 0
                        ? 'bg-amber-400 text-stone-950'
                        : idx === 1
                        ? 'bg-stone-300 text-stone-950'
                        : 'bg-amber-800 text-amber-200'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-stone-200">
                    {language === 'te' ? p.nameTelugu : p.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <Swords className="w-3 h-3 text-stone-400" />
                    {p.killsCount} {language === 'te' ? 'దాడి' : 'kills'}
                  </span>
                  <span>·</span>
                  <span className="text-amber-400 font-semibold">
                    {p.tokens.filter(t => t.isFinished).length}/4 Home
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-6 rounded-xl font-bold text-sm text-stone-950 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'te' ? 'మళ్ళీ ఆడండి (Play Again)' : 'Play Again'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
