/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BoardTheme, Language } from '../types/game';
import { Volume2, VolumeX } from 'lucide-react';

interface TopNavProps {
  language: Language;
  onToggleLanguage: () => void;
  theme: BoardTheme;
  onSelectTheme: (theme: BoardTheme) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenHeritage: () => void;
  onNewGame: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  language,
  onToggleLanguage,
  theme,
  onSelectTheme,
  soundEnabled,
  onToggleSound,
  onOpenRules,
  onOpenHeritage,
  onNewGame,
}) => {
  return (
    <header className="w-full bg-stone-950/80 backdrop-blur-md border-b border-stone-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-lg sm:text-xl font-bold tracking-tight text-amber-400 font-cinzel whitespace-nowrap shrink-0">
            Bara Katta · బారాకట్ట
          </span>
        </div>

        {/* Zone 2: 4-5 clean single-line nav links / interactive controls */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-stone-300">
          <button
            onClick={onOpenRules}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {language === 'te' ? 'నియమాలు' : 'Rules'}
          </button>

          <button
            onClick={onOpenHeritage}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {language === 'te' ? 'చరిత్ర' : 'Heritage'}
          </button>

          {/* Theme Selector Dropdown / Cycle */}
          <div className="relative group whitespace-nowrap shrink-0">
            <button
              onClick={() => {
                const nextTheme: BoardTheme =
                  theme === 'thinnelu'
                    ? 'kalamkari'
                    : theme === 'kalamkari'
                    ? 'brass_teak'
                    : 'thinnelu';
                onSelectTheme(nextTheme);
              }}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1"
              title="Click to switch board theme"
            >
              <span>{language === 'te' ? 'థీమ్' : 'Theme'}:</span>
              <span className="text-amber-400 font-semibold capitalize">
                {theme === 'thinnelu'
                  ? language === 'te'
                    ? 'తిన్నె'
                    : 'Verandah'
                  : theme === 'kalamkari'
                  ? language === 'te'
                    ? 'కలంకారి'
                    : 'Silk'
                  : language === 'te'
                  ? 'టేకు'
                  : 'Teak'}
              </span>
            </button>
          </div>

          {/* Language Switch */}
          <button
            onClick={onToggleLanguage}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-amber-300 font-semibold"
          >
            {language === 'te' ? 'English' : 'తెలుగు'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="text-stone-400 hover:text-amber-400 transition-colors shrink-0 p-1 cursor-pointer"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            onClick={onNewGame}
            className="px-3.5 py-1.5 text-xs font-semibold text-stone-950 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm hover:shadow-amber-500/30"
          >
            {language === 'te' ? 'కొత్త ఆట' : 'New Game'}
          </button>
        </div>
      </div>
    </header>
  );
};
