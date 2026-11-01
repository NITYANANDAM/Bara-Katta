/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BoardCoord, BoardTheme, Language, Player, PlayerId, Token } from '../types/game';
import {
  CENTER_COORD,
  coordsEqual,
  isSafeCoord,
  MoveSimulation,
} from '../utils/gameRules';
import { TokenPiece } from './TokenPiece';
import { Shield, Sparkles, Swords } from 'lucide-react';

interface BoardProps {
  theme: BoardTheme;
  language: Language;
  players: Player[];
  activePlayerId: PlayerId;
  eligibleTokens: Token[];
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
  hoveredMoveSimulation: MoveSimulation | null;
  onHoverToken: (token: Token | null) => void;
}

export const Board: React.FC<BoardProps> = ({
  theme,
  language,
  players,
  activePlayerId,
  eligibleTokens,
  selectedToken,
  onSelectToken,
  hoveredMoveSimulation,
  onHoverToken,
}) => {
  // Theme visual styling presets
  const themeStyles = {
    thinnelu: {
      boardBg: 'bg-[#5c2418]',
      boardBorder: 'border-[#3d160f]',
      cellBg: 'bg-[#6b2c1e]',
      cellAltBg: 'bg-[#7a3222]',
      cellBorder: 'border-[#a84d39]/40',
      safeBg: 'bg-[#4a1c12]',
      safeXColor: '#fde68a', // Pale gold / chalk yellow
      gridShadow: 'shadow-[0_20px_50px_rgba(40,12,6,0.6)]',
      centerBg: 'bg-[#40160d]',
    },
    kalamkari: {
      boardBg: 'bg-[#0f172a]',
      boardBorder: 'border-[#1e293b]',
      cellBg: 'bg-[#1e293b]',
      cellAltBg: 'bg-[#24334a]',
      cellBorder: 'border-[#ca8a04]/40',
      safeBg: 'bg-[#182337]',
      safeXColor: '#facc15', // Gold zari
      gridShadow: 'shadow-[0_20px_50px_rgba(2,6,23,0.7)]',
      centerBg: 'bg-[#121c2f]',
    },
    brass_teak: {
      boardBg: 'bg-[#291e14]',
      boardBorder: 'border-[#17100a]',
      cellBg: 'bg-[#3b2b1d]',
      cellAltBg: 'bg-[#453322]',
      cellBorder: 'border-[#d97706]/30',
      safeBg: 'bg-[#23180e]',
      safeXColor: '#fbbf24', // Brass gold
      gridShadow: 'shadow-[0_20px_50px_rgba(15,10,6,0.8)]',
      centerBg: 'bg-[#1c130b]',
    },
  }[theme];

  // Helper to find all tokens sitting on coordinate (r, c)
  const getTokensAtCoord = (coord: BoardCoord) => {
    const list: { token: Token; player: Player }[] = [];
    players.forEach(p => {
      p.tokens.forEach(t => {
        if (!t.isFinished && coordsEqual(t.coord, coord)) {
          list.push({ token: t, player: p });
        }
      });
    });
    return list;
  };

  // Finished tokens in the Center Garbha Gudi
  const finishedTokens: { token: Token; player: Player }[] = [];
  players.forEach(p => {
    p.tokens.forEach(t => {
      if (t.isFinished) {
        finishedTokens.push({ token: t, player: p });
      }
    });
  });

  // Render 5x5 Grid Cells
  const gridRows = [0, 1, 2, 3, 4];
  const gridCols = [0, 1, 2, 3, 4];

  return (
    <div className="flex flex-col items-center">
      {/* Outer Board Frame with traditional border trims */}
      <div
        className={`relative p-3 sm:p-4 rounded-3xl border-4 ${themeStyles.boardBorder} ${themeStyles.boardBg} ${themeStyles.gridShadow} transition-colors duration-500`}
      >
        {/* Subtle Rangoli / Muggu Corner Accents */}
        <div className="absolute top-2 left-2 text-amber-300/40 text-xs sm:text-sm select-none pointer-events-none">
          ❋
        </div>
        <div className="absolute top-2 right-2 text-amber-300/40 text-xs sm:text-sm select-none pointer-events-none">
          ❋
        </div>
        <div className="absolute bottom-2 left-2 text-amber-300/40 text-xs sm:text-sm select-none pointer-events-none">
          ❋
        </div>
        <div className="absolute bottom-2 right-2 text-amber-300/40 text-xs sm:text-sm select-none pointer-events-none">
          ❋
        </div>

        {/* 5x5 Grid Matrix */}
        <div className="grid grid-cols-5 grid-rows-5 gap-1.5 sm:gap-2 w-[310px] h-[310px] xs:w-[360px] xs:h-[360px] sm:w-[460px] sm:h-[460px] md:w-[500px] md:h-[500px]">
          {gridRows.map(r =>
            gridCols.map(c => {
              const currentCoord: BoardCoord = { r, c };
              const isSafe = isSafeCoord(currentCoord);
              const isCenter = currentCoord.r === CENTER_COORD.r && currentCoord.c === CENTER_COORD.c;
              const cellTokens = getTokensAtCoord(currentCoord);

              // Check if this square is the destination preview of a hovered/selected token
              const isPreviewTarget =
                hoveredMoveSimulation && coordsEqual(hoveredMoveSimulation.newCoord, currentCoord);

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative rounded-xl border ${
                    themeStyles.cellBorder
                  } flex items-center justify-center transition-all duration-200 select-none overflow-hidden ${
                    isCenter
                      ? `${themeStyles.centerBg} ring-2 ring-amber-400/50`
                      : isSafe
                      ? themeStyles.safeBg
                      : (r + c) % 2 === 0
                      ? themeStyles.cellBg
                      : themeStyles.cellAltBg
                  } ${
                    isPreviewTarget
                      ? 'ring-4 ring-amber-400 scale-[1.02] shadow-lg z-10'
                      : ''
                  }`}
                >
                  {/* SAFE ZONE ('X' / Katta / Illu) Traditional Inlaid Cross Marker */}
                  {isSafe && !isCenter && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <svg className="w-full h-full p-2 opacity-55" viewBox="0 0 100 100">
                        <line
                          x1="12"
                          y1="12"
                          x2="88"
                          y2="88"
                          stroke={themeStyles.safeXColor}
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <line
                          x1="88"
                          y1="12"
                          x2="12"
                          y2="88"
                          stroke={themeStyles.safeXColor}
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        {/* Little central floral bindu */}
                        <circle cx="50" cy="50" r="5" fill={themeStyles.safeXColor} />
                      </svg>
                      <div className="absolute bottom-1 right-1 text-[8px] sm:text-[9px] uppercase tracking-wider text-amber-200/50 font-bold flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5 inline" />
                        <span>{language === 'te' ? 'ఇల్లు' : 'SAFE'}</span>
                      </div>
                    </div>
                  )}

                  {/* CENTER SANCTUM (Garbha Gudi / Home) */}
                  {isCenter && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      <svg className="w-full h-full p-1 opacity-45 absolute" viewBox="0 0 100 100">
                        {/* Sacred Mandapa Cross & Diamond Pattern */}
                        <line x1="8" y1="8" x2="92" y2="92" stroke="#f59e0b" strokeWidth="5" />
                        <line x1="92" y1="8" x2="8" y2="92" stroke="#f59e0b" strokeWidth="5" />
                        <rect
                          x="25"
                          y="25"
                          width="50"
                          height="50"
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="2.5"
                          transform="rotate(45 50 50)"
                        />
                        <circle cx="50" cy="50" r="10" fill="#f59e0b" opacity="0.3" />
                      </svg>
                      <div className="relative z-10 flex flex-col items-center justify-center text-center">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 mb-0.5 animate-pulse" />
                        <span className="text-[9px] sm:text-[11px] font-bold text-amber-300 font-cinzel leading-tight tracking-wider">
                          {language === 'te' ? 'గర్భగుడి' : 'HOME'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Move Preview Ghost Badge / Attack indicator */}
                  {isPreviewTarget && (
                    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-amber-500/25 animate-pulse">
                      {hoveredMoveSimulation?.capturedToken ? (
                        <div className="flex flex-col items-center justify-center text-red-400 drop-shadow-md">
                          <Swords className="w-6 h-6 animate-spin text-red-400" />
                          <span className="text-[10px] font-black uppercase tracking-tight text-white bg-red-700/80 px-1 rounded mt-0.5">
                            {language === 'te' ? 'దాడి!' : 'KILL!'}
                          </span>
                        </div>
                      ) : hoveredMoveSimulation?.isFinished ? (
                        <div className="flex flex-col items-center justify-center text-amber-300">
                          <Sparkles className="w-6 h-6 animate-bounce" />
                          <span className="text-[9px] font-bold text-white bg-amber-600/80 px-1 rounded">
                            {language === 'te' ? 'గమ్యం!' : 'GOAL!'}
                          </span>
                        </div>
                      ) : (
                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-dashed border-amber-300 bg-amber-400/20 animate-ping" />
                      )}
                    </div>
                  )}

                  {/* TOKENS ON THIS CELL */}
                  <div className="relative z-10 w-full h-full p-1 flex items-center justify-center flex-wrap gap-1">
                    {/* If Center, show finished tokens */}
                    {isCenter
                      ? finishedTokens.map(({ token, player }) => (
                          <div key={token.id} className="transform scale-90 sm:scale-100">
                            <TokenPiece
                              token={token}
                              playerColorHex={player.colorHex}
                              isEligible={false}
                              size="sm"
                            />
                          </div>
                        ))
                      : cellTokens.map(({ token, player }) => {
                          const isEligible = eligibleTokens.some(t => t.id === token.id);
                          const isSelected = selectedToken?.id === token.id;

                          return (
                            <div
                              key={token.id}
                              onMouseEnter={() => isEligible && onHoverToken(token)}
                              onMouseLeave={() => isEligible && onHoverToken(null)}
                              className="transition-transform"
                            >
                              <TokenPiece
                                token={token}
                                playerColorHex={player.colorHex}
                                isEligible={isEligible}
                                isSelected={isSelected}
                                onClick={() => isEligible && onSelectToken(token)}
                                size={cellTokens.length > 2 ? 'sm' : 'md'}
                              />
                            </div>
                          );
                        })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
