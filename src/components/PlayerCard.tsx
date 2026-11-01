/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, Player } from '../types/game';
import { CheckCircle2, Lock, ShieldCheck, Swords, Trophy } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  language: Language;
  speechBubble?: string;
  isCompact?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  language,
  speechBubble,
  isCompact = false,
}) => {
  const finishedCount = player.tokens.filter(t => t.isFinished).length;

  return (
    <div
      className={`relative rounded-2xl transition-all duration-300 p-3 sm:p-3.5 border ${
        isActive
          ? 'bg-stone-800/95 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/40'
          : 'bg-stone-900/80 border-stone-800/80 hover:border-stone-700/60'
      } ${isCompact ? 'w-full' : 'w-full max-w-sm'}`}
    >
      {/* Bot Speech Bubble if active */}
      {speechBubble && isActive && (
        <div className="absolute -top-10 left-4 right-4 z-30 bg-amber-50 text-stone-900 text-xs font-semibold py-1 px-3 rounded-xl shadow-lg border border-amber-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="truncate">{speechBubble}</div>
          <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-amber-50 rotate-45 border-r border-b border-amber-200" />
        </div>
      )}

      {/* Header: Player Name + Color + Turn Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar / Color Pill */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow shrink-0 text-white"
            style={{
              backgroundColor: player.colorHex,
              border: '2px solid rgba(255,255,255,0.7)',
            }}
          >
            {player.isAI && player.botPersonality ? player.botPersonality.avatar : '👤'}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-stone-100 truncate">
                {language === 'te' ? player.nameTelugu : player.name}
              </h3>
              {player.rank && (
                <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded-full border border-amber-500/30">
                  <Trophy className="w-2.5 h-2.5" /> #{player.rank}
                </span>
              )}
            </div>
            <span className="text-[11px] text-stone-400 block truncate">
              {player.isAI && player.botPersonality
                ? language === 'te'
                  ? player.botPersonality.taglineTelugu
                  : player.botPersonality.tagline
                : player.colorName}
            </span>
          </div>
        </div>

        {/* Turn Active Pill */}
        {isActive && (
          <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 animate-pulse">
            {language === 'te' ? 'వంతు (Turn)' : 'Active Turn'}
          </span>
        )}
      </div>

      {/* Progress & Kill Prerequisite Row */}
      <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2 text-xs">
        {/* Kill / Daadi Status */}
        <div className="flex items-center gap-1">
          {player.hasKill ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium" title="Inner track unlocked!">
              <Swords className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'te' ? 'దాడి అయింది' : 'Kill Unlocked'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-stone-400" title="Must kill an opponent token to enter inner loop">
              <Lock className="w-3.5 h-3.5 text-amber-500/80" />
              <span>{language === 'te' ? 'దాడి కావాలి' : 'Need 1 Kill'}</span>
            </span>
          )}
        </div>

        {/* Home finished counter */}
        <div className="flex items-center gap-1 font-mono text-[11px] text-stone-300">
          <CheckCircle2 className={`w-3.5 h-3.5 ${finishedCount > 0 ? 'text-amber-400' : 'text-stone-500'}`} />
          <span>
            {finishedCount}/4 {language === 'te' ? 'గమ్యం' : 'Home'}
          </span>
        </div>
      </div>

      {/* Token status miniature dots */}
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {player.tokens.map((tok, i) => (
          <div
            key={tok.id}
            className={`py-1 px-1 rounded-lg text-center text-[10px] font-mono transition-colors ${
              tok.isFinished
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : tok.stepIndex >= 16
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                : tok.stepIndex > 0
                ? 'bg-stone-800 text-stone-300 border border-stone-700/40'
                : 'bg-stone-900/60 text-stone-500 border border-stone-800/40'
            }`}
            title={`Token ${i + 1}: ${tok.isFinished ? 'Home Reached!' : `Step ${tok.stepIndex}/24`}`}
          >
            {tok.isFinished
              ? '★ WIN'
              : tok.stepIndex >= 16
              ? `In ${tok.stepIndex - 15}`
              : tok.stepIndex === 0
              ? 'Home'
              : `${tok.stepIndex}`}
          </div>
        ))}
      </div>
    </div>
  );
};
