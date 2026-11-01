/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, Player } from '../types/game';
import { LayoutGrid, Users, ScrollText, BookOpen, Dices } from 'lucide-react';

export type MobileTab = 'board' | 'players' | 'logs' | 'rules';

interface MobileBottomNavProps {
  currentTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  language: Language;
  canQuickRoll: boolean;
  isRolling: boolean;
  onQuickRoll: () => void;
  activePlayer: Player;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  language,
  canQuickRoll,
  isRolling,
  onQuickRoll,
  activePlayer,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Floating Thumb Action: Quick Roll Gavvalu when it's your turn */}
      {canQuickRoll && (
        <div className="px-4 pb-2 flex justify-center pointer-events-none">
          <button
            onClick={onQuickRoll}
            disabled={isRolling}
            className="pointer-events-auto w-full max-w-xs h-12 rounded-2xl text-stone-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 animate-bounce"
            style={{
              backgroundColor: activePlayer.colorHex,
              color: '#ffffff',
              boxShadow: `0 8px 24px ${activePlayer.colorHex}66`,
            }}
          >
            <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>
              {isRolling
                ? language === 'te'
                  ? 'గవ్వలు దొర్లుతున్నాయి...'
                  : 'Tossing Gavvalu...'
                : language === 'te'
                ? 'గవ్వలు విసరండి (Toss Gavvalu)'
                : 'Toss Gavvalu to Roll'}
            </span>
          </button>
        </div>
      )}

      {/* 4-Tab Navigation Bar */}
      <nav className="bg-stone-950/95 backdrop-blur-lg border-t border-stone-800/80 px-2 py-1.5 flex items-center justify-around text-center safe-area-pb">
        {/* Tab 1: Board */}
        <button
          onClick={() => onSelectTab('board')}
          className={`flex-1 flex flex-col items-center py-1 transition-colors min-h-[44px] justify-center cursor-pointer ${
            currentTab === 'board' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'te' ? 'ఆట' : 'Board'}
          </span>
        </button>

        {/* Tab 2: Players */}
        <button
          onClick={() => onSelectTab('players')}
          className={`flex-1 flex flex-col items-center py-1 transition-colors min-h-[44px] justify-center cursor-pointer ${
            currentTab === 'players' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'te' ? 'ఆటగాళ్ళు' : 'Players'}
          </span>
        </button>

        {/* Tab 3: Move Log */}
        <button
          onClick={() => onSelectTab('logs')}
          className={`flex-1 flex flex-col items-center py-1 transition-colors min-h-[44px] justify-center cursor-pointer ${
            currentTab === 'logs' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <ScrollText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'te' ? 'వ్యాఖ్యానం' : 'Log'}
          </span>
        </button>

        {/* Tab 4: Rules / Settings */}
        <button
          onClick={() => onSelectTab('rules')}
          className={`flex-1 flex flex-col items-center py-1 transition-colors min-h-[44px] justify-center cursor-pointer ${
            currentTab === 'rules' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">
            {language === 'te' ? 'నియమాలు' : 'Rules'}
          </span>
        </button>
      </nav>
    </div>
  );
};
