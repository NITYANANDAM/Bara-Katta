/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PlayerId, Token } from '../types/game';

interface TokenPieceProps {
  token: Token;
  playerColorHex: string;
  isEligible: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  countOnSquare?: number;
}

export const TokenPiece: React.FC<TokenPieceProps> = ({
  token,
  playerColorHex,
  isEligible,
  isSelected = false,
  onClick,
  size = 'md',
  countOnSquare,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 sm:w-9 sm:h-9 text-xs',
    lg: 'w-10 h-10 sm:w-11 sm:h-11 text-sm',
  }[size];

  // Distinct emblem for each player
  const getEmblem = (pid: PlayerId) => {
    switch (pid) {
      case 'south':
        // Sun motif (Terracotta Red)
        return '☀️';
      case 'north':
        // Lotus / Royal flower (Turmeric Gold)
        return '🪷';
      case 'east':
        // Peacock motif (Peacock Teal)
        return '🦚';
      case 'west':
        // Sacred Leaf (Tulasi Green)
        return '🌿';
    }
  };

  return (
    <div
      onClick={isEligible ? onClick : undefined}
      className={`relative rounded-full flex items-center justify-center transition-all select-none shadow-md ${sizeClasses} ${
        isEligible
          ? 'cursor-pointer hover:scale-115 active:scale-95 animate-bounce shadow-amber-500/50'
          : 'cursor-default'
      } ${
        isSelected
          ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-stone-900 scale-110 z-20'
          : ''
      }`}
      style={{
        backgroundColor: playerColorHex,
        border: '2px solid rgba(255, 255, 255, 0.75)',
        boxShadow: isEligible
          ? '0 0 14px rgba(245, 158, 11, 0.8), 0 4px 6px rgba(0,0,0,0.4)'
          : '0 3px 6px rgba(0,0,0,0.4)',
      }}
      title={`Token ${token.index + 1} (${token.stepIndex === 0 ? 'Home' : `Step ${token.stepIndex}`})`}
    >
      {/* Lacquer / metallic coin inner bevel ring */}
      <div className="absolute inset-0.5 rounded-full border border-black/25 pointer-events-none" />

      {/* Emblem icon */}
      <span className="text-[11px] sm:text-[13px] leading-none pointer-events-none drop-shadow">
        {getEmblem(token.playerId)}
      </span>

      {/* Stacking indicator if multiple tokens of same player on same cell */}
      {countOnSquare && countOnSquare > 1 && (
        <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-amber-300 border border-amber-500/50 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
          {countOnSquare}
        </span>
      )}
    </div>
  );
};
