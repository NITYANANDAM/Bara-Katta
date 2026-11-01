/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlayerId = 'south' | 'north' | 'east' | 'west';

export interface BoardCoord {
  r: number; // 0 to 4
  c: number; // 0 to 4
}

export interface Token {
  id: string;
  playerId: PlayerId;
  index: number; // 0 to 3
  stepIndex: number; // 0 to 24 (0 is start safe square, 15 is last outer, 16 is first inner, 24 is center home)
  lapCount: number; // How many outer loops completed if searching for a kill
  isFinished: boolean; // Reached center (2,2)
  coord: BoardCoord;
}

export interface Player {
  id: PlayerId;
  name: string;
  nameTelugu: string;
  colorName: string;
  colorHex: string;
  bgHex: string;
  borderHex: string;
  homeCoord: BoardCoord;
  isAI: boolean;
  botPersonality?: {
    name: string;
    teluguName: string;
    avatar: string;
    tagline: string;
    taglineTelugu: string;
  };
  hasKill: boolean;
  killsCount: number;
  tokens: Token[];
  rank?: number; // 1 for winner, etc.
}

export interface ShellState {
  isOpen: boolean; // true = mouth facing up (open), false = back/dome up (closed)
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export interface DiceRollResult {
  value: number; // 1, 2, 3, 4 (Chowka), 8 (Ashta), or 12 (Bara)
  openCount: number;
  totalShells: number;
  shells: ShellState[];
  isBonus: boolean;
  nameEnglish: string;
  nameTelugu: string;
  audioKey: 'single' | 'double' | 'triple' | 'chowka' | 'ashta' | 'bara';
}

export type BoardTheme = 'thinnelu' | 'kalamkari' | 'brass_teak';
export type DiceMode = '4_shells' | '6_shells';
export type Language = 'te' | 'en';

export interface MoveLogEntry {
  id: string;
  playerId: PlayerId;
  text: string;
  textTelugu: string;
  type: 'roll' | 'move' | 'kill' | 'home' | 'bonus' | 'pass';
  timestamp: string;
}

export interface GameSettings {
  playerCount: 2 | 3 | 4;
  aiPlayerIds: PlayerId[];
  diceMode: DiceMode;
  theme: BoardTheme;
  language: Language;
  soundEnabled: boolean;
  playerNames?: Partial<Record<PlayerId, string>>;
}
