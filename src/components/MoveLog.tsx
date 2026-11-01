/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language, MoveLogEntry, Player } from '../types/game';
import { ScrollText, Swords, Sparkles, Home, Dices } from 'lucide-react';

interface MoveLogProps {
  logs: MoveLogEntry[];
  players: Player[];
  language: Language;
}

export const MoveLog: React.FC<MoveLogProps> = ({ logs, players, language }) => {
  const getPlayer = (pid: string) => players.find(p => p.id === pid);

  const getLogIcon = (type: MoveLogEntry['type']) => {
    switch (type) {
      case 'roll':
        return <Dices className="w-3.5 h-3.5 text-stone-400" />;
      case 'bonus':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'kill':
        return <Swords className="w-3.5 h-3.5 text-red-400" />;
      case 'home':
        return <Home className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />;
    }
  };

  return (
    <div className="w-full bg-stone-900/80 rounded-2xl border border-stone-800/80 p-3.5 text-xs flex flex-col h-44 overflow-hidden">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-stone-400 font-medium">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-amber-400">
          <ScrollText className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'te' ? 'ఆట వ్యాఖ్యానం (Move Commentary)' : 'Game Log'}</span>
        </span>
        <span className="text-[10px] text-stone-500 font-mono">
          {logs.length} {language === 'te' ? 'ఎత్తులు' : 'moves'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-none">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-stone-500 italic text-[11px]">
            {language === 'te' ? 'ఆట ప్రారంభమైంది! మొదటి ఎత్తు వేయండి.' : 'Game started! Roll the gavvalu to begin.'}
          </div>
        ) : (
          logs.map(log => {
            const player = getPlayer(log.playerId);
            return (
              <div
                key={log.id}
                className="flex items-start gap-2 text-[11px] leading-tight text-stone-300"
              >
                <span className="mt-0.5 shrink-0">{getLogIcon(log.type)}</span>
                <div className="flex-1 min-w-0">
                  <span
                    className="font-bold mr-1.5"
                    style={{ color: player?.colorHex || '#f59e0b' }}
                  >
                    {language === 'te' ? player?.nameTelugu : player?.name}:
                  </span>
                  <span>{language === 'te' ? log.textTelugu : log.text}</span>
                </div>
                <span className="text-[9px] text-stone-500 font-mono shrink-0">
                  {log.timestamp}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
