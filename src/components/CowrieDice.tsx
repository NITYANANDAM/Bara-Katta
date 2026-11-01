/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DiceRollResult, Language, ShellState } from '../types/game';
import { Sparkles, Dices } from 'lucide-react';

interface CowrieDiceProps {
  lastRoll: DiceRollResult | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  language: Language;
  activePlayerColor: string;
}

export const CowrieDice: React.FC<CowrieDiceProps> = ({
  lastRoll,
  isRolling,
  canRoll,
  onRoll,
  language,
  activePlayerColor,
}) => {
  // If no roll yet, show default placeholder shells
  const shellsToDisplay: ShellState[] = lastRoll
    ? lastRoll.shells
    : [
        { isOpen: true, rotation: 15, offsetX: -6, offsetY: 2 },
        { isOpen: false, rotation: -20, offsetX: 8, offsetY: -4 },
        { isOpen: true, rotation: 45, offsetX: -4, offsetY: 6 },
        { isOpen: false, rotation: 110, offsetX: 5, offsetY: 3 },
      ];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Shells Mat Display */}
      <div
        className="relative w-64 h-36 rounded-2xl border border-amber-900/40 bg-stone-900/90 shadow-inner flex items-center justify-center p-3 overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(120, 53, 15, 0.15) 0%, rgba(28, 25, 23, 0.95) 100%)',
        }}
      >
        {/* Decorative corner rangoli dots */}
        <div className="absolute top-2 left-2 text-amber-500/30 text-xs font-mono select-none">✦</div>
        <div className="absolute top-2 right-2 text-amber-500/30 text-xs font-mono select-none">✦</div>
        <div className="absolute bottom-2 left-2 text-amber-500/30 text-xs font-mono select-none">✦</div>
        <div className="absolute bottom-2 right-2 text-amber-500/30 text-xs font-mono select-none">✦</div>

        {/* The Cowrie Shells */}
        <div
          className={`grid ${
            shellsToDisplay.length > 4 ? 'grid-cols-3' : 'grid-cols-2'
          } gap-3 sm:gap-4 items-center justify-items-center transition-transform duration-300 ${
            isRolling ? 'scale-90 animate-pulse' : 'scale-100'
          }`}
        >
          {shellsToDisplay.map((shell, idx) => (
            <div
              key={idx}
              className="transition-all duration-300 transform select-none"
              style={{
                transform: `rotate(${shell.rotation}deg) translate(${shell.offsetX * 0.4}px, ${shell.offsetY * 0.4}px) ${
                  isRolling ? 'scale(0.85)' : 'scale(1)'
                }`,
              }}
            >
              <SingleCowrieShell isOpen={shell.isOpen} isRolling={isRolling} />
            </div>
          ))}
        </div>
      </div>

      {/* Roll Result Badge or Callout */}
      {lastRoll && !isRolling ? (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold font-cinzel ${
                lastRoll.isBonus ? 'text-amber-400' : 'text-stone-200'
              }`}
            >
              {language === 'te' ? lastRoll.nameTelugu : lastRoll.nameEnglish}
            </span>
            {lastRoll.isBonus && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold animate-pulse">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {language === 'te' ? '+1 అదనపు వంతు!' : '+1 Bonus Roll!'}
              </span>
            )}
          </div>
          <span className="text-xs text-stone-400 mt-0.5">
            {language === 'te'
              ? `${lastRoll.openCount} తెరిచినవి · ${lastRoll.totalShells - lastRoll.openCount} మూసినవి`
              : `${lastRoll.openCount} face-up · ${lastRoll.totalShells - lastRoll.openCount} face-down`}
          </span>
        </div>
      ) : (
        <div className="h-10 flex items-center justify-center text-xs text-stone-400 italic">
          {isRolling
            ? language === 'te'
              ? 'గవ్వలు దొర్లుతున్నాయి...'
              : 'Tossing cowrie shells...'
            : language === 'te'
            ? 'గవ్వలు విసరడానికి సిద్ధంగా ఉన్నాయి'
            : 'Ready to toss gavvalu'}
        </div>
      )}

      {/* Interactive Roll Action Button */}
      <button
        onClick={onRoll}
        disabled={!canRoll || isRolling}
        className={`w-full max-w-xs py-2.5 px-5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
          canRoll && !isRolling
            ? 'text-white cursor-pointer hover:brightness-110 shadow-amber-950/40 hover:shadow-lg'
            : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700/50'
        }`}
        style={
          canRoll && !isRolling
            ? {
                backgroundColor: activePlayerColor,
                boxShadow: `0 4px 14px ${activePlayerColor}40`,
              }
            : undefined
        }
      >
        <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
        <span>
          {isRolling
            ? language === 'te'
              ? 'విసురుతున్నారు...'
              : 'Rolling...'
            : language === 'te'
            ? 'గవ్వలు విసరండి (Roll Gavvalu)'
            : 'Toss Gavvalu (Roll Dice)'}
        </span>
      </button>
    </div>
  );
};

/**
 * Authentic SVG Representation of a Single Indian Cowrie Shell
 */
const SingleCowrieShell: React.FC<{ isOpen: boolean; isRolling: boolean }> = ({
  isOpen,
  isRolling,
}) => {
  return (
    <div
      className={`relative w-11 h-14 transition-all duration-300 drop-shadow-md ${
        isRolling ? 'rotate-180 scale-90 blur-[0.4px]' : ''
      }`}
    >
      <svg viewBox="0 0 44 56" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Shell Ceramic Ivory Gradient */}
          <linearGradient id="shellIvory" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffdfa" />
            <stop offset="50%" stopColor="#f7eed8" />
            <stop offset="100%" stopColor="#ebd6b3" />
          </linearGradient>

          {/* Golden shell back shadow */}
          <radialGradient id="shellBackDorsal" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#fffcf5" />
            <stop offset="65%" stopColor="#edd8b4" />
            <stop offset="100%" stopColor="#cb9b64" />
          </radialGradient>

          {/* Aperture inner dark slit */}
          <linearGradient id="shellSlit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a2810" />
            <stop offset="50%" stopColor="#1a0a04" />
            <stop offset="100%" stopColor="#4a2810" />
          </linearGradient>
        </defs>

        {isOpen ? (
          /* FACE-UP (OPEN MOUTH / APERTURE WITH SERRATED TEETH) */
          <g>
            {/* Outer porcelain rim */}
            <path
              d="M 22 2 C 34 2, 42 16, 42 32 C 42 46, 33 54, 22 54 C 11 54, 2 46, 2 32 C 2 16, 10 2, 22 2 Z"
              fill="url(#shellIvory)"
              stroke="#b89366"
              strokeWidth="1.2"
            />
            {/* Inner mouth recess */}
            <path
              d="M 22 8 C 30 14, 32 26, 30 42 C 28 47, 25 49, 22 49 C 19 49, 16 47, 14 42 C 12 26, 14 14, 22 8 Z"
              fill="#f1dfbf"
              stroke="#a87f4f"
              strokeWidth="0.8"
            />
            {/* Central deep opening slit */}
            <path
              d="M 22 10 Q 20 28 22 46 Q 24 28 22 10 Z"
              fill="url(#shellSlit)"
            />
            {/* Serrated cowrie teeth (left lip) */}
            <line x1="17" y1="17" x2="21" y2="17" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
            <line x1="16" y1="22" x2="21" y2="22" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
            <line x1="16" y1="27" x2="21" y2="27" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
            <line x1="16" y1="32" x2="21" y2="32" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
            <line x1="17" y1="37" x2="21" y2="37" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />

            {/* Serrated cowrie teeth (right lip) */}
            <line x1="23" y1="17" x2="27" y2="17" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
            <line x1="23" y1="22" x2="28" y2="22" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
            <line x1="23" y1="27" x2="28" y2="27" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
            <line x1="23" y1="32" x2="28" y2="32" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
            <line x1="23" y1="37" x2="27" y2="37" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
          </g>
        ) : (
          /* FACE-DOWN (CLOSED BACK / SMOOTH DOME WITH SUBTLE SPOTS & RIDGE) */
          <g>
            {/* Smooth porcelain convex body */}
            <path
              d="M 22 2 C 34 2, 42 16, 42 32 C 42 46, 33 54, 22 54 C 11 54, 2 46, 2 32 C 2 16, 10 2, 22 2 Z"
              fill="url(#shellBackDorsal)"
              stroke="#9d7446"
              strokeWidth="1.2"
            />
            {/* Dorsal highlight curve */}
            <path
              d="M 18 10 C 26 12, 30 24, 28 38"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.65"
            />
            {/* Subtle natural tiger-cowrie spots */}
            <circle cx="15" cy="24" r="1.5" fill="#a46d32" opacity="0.4" />
            <circle cx="28" cy="22" r="1.8" fill="#a46d32" opacity="0.4" />
            <circle cx="24" cy="34" r="1.2" fill="#a46d32" opacity="0.35" />
            <circle cx="16" cy="38" r="1.5" fill="#a46d32" opacity="0.4" />
            <circle cx="31" cy="32" r="1.3" fill="#a46d32" opacity="0.35" />
          </g>
        )}
      </svg>
    </div>
  );
};
