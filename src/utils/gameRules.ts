/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoardCoord, DiceMode, DiceRollResult, Player, PlayerId, ShellState, Token } from '../types/game';

// Center Home Coordinate (Garbha Gudi / Illu)
export const CENTER_COORD: BoardCoord = { r: 2, c: 2 };

// Safe Zone Coordinates (marked with 'X' / Katta / Illu)
export const SAFE_COORDS: BoardCoord[] = [
  { r: 4, c: 2 }, // South Home
  { r: 0, c: 2 }, // North Home
  { r: 2, c: 4 }, // East Home
  { r: 2, c: 0 }, // West Home
  { r: 2, c: 2 }, // Center Home
];

export function isSafeCoord(coord: BoardCoord): boolean {
  return SAFE_COORDS.some(s => s.r === coord.r && s.c === coord.c);
}

export function isCenterCoord(coord: BoardCoord): boolean {
  return coord.r === CENTER_COORD.r && coord.c === CENTER_COORD.c;
}

export function coordsEqual(a: BoardCoord, b: BoardCoord): boolean {
  return a.r === b.r && a.c === b.c;
}

/**
 * 16 Perimeter squares in Counter-Clockwise order, starting from South Home (4,2)
 */
export const PERIMETER_PATH: BoardCoord[] = [
  /*  0 */ { r: 4, c: 2 }, // South Home
  /*  1 */ { r: 4, c: 3 },
  /*  2 */ { r: 4, c: 4 }, // Bottom-Right Corner
  /*  3 */ { r: 3, c: 4 },
  /*  4 */ { r: 2, c: 4 }, // East Home
  /*  5 */ { r: 1, c: 4 },
  /*  6 */ { r: 0, c: 4 }, // Top-Right Corner
  /*  7 */ { r: 0, c: 3 },
  /*  8 */ { r: 0, c: 2 }, // North Home
  /*  9 */ { r: 0, c: 1 },
  /* 10 */ { r: 0, c: 0 }, // Top-Left Corner
  /* 11 */ { r: 1, c: 0 },
  /* 12 */ { r: 2, c: 0 }, // West Home
  /* 13 */ { r: 3, c: 0 },
  /* 14 */ { r: 4, c: 0 }, // Bottom-Left Corner
  /* 15 */ { r: 4, c: 1 },
];

/**
 * Inner 8 squares in Clockwise order around Center (2,2)
 */
export const INNER_PATH_CLOCKWISE: BoardCoord[] = [
  /*  0 */ { r: 3, c: 2 }, // South inner entrance
  /*  1 */ { r: 3, c: 1 },
  /*  2 */ { r: 2, c: 1 }, // West inner entrance
  /*  3 */ { r: 1, c: 1 },
  /*  4 */ { r: 1, c: 2 }, // North inner entrance
  /*  5 */ { r: 1, c: 3 },
  /*  6 */ { r: 2, c: 3 }, // East inner entrance
  /*  7 */ { r: 3, c: 3 },
];

// Starting offset index in the PERIMETER_PATH for each player
export const PLAYER_START_PERIMETER_OFFSET: Record<PlayerId, number> = {
  south: 0,
  east: 4,
  north: 8,
  west: 12,
};

// Starting offset index in the INNER_PATH_CLOCKWISE for each player
export const PLAYER_INNER_ENTRY_OFFSET: Record<PlayerId, number> = {
  south: 0, // (3,2)
  west: 2,  // (2,1)
  north: 4, // (1,2)
  east: 6,  // (2,3)
};

/**
 * Returns the exact coordinate on the board for a player at a given stepIndex (0 to 24).
 * Step 0 to 15: Outer loop (counter-clockwise from their starting home)
 * Step 16 to 23: Inner loop (clockwise from their inner entrance)
 * Step 24: Center Home (2,2)
 */
export function getCoordForPlayerStep(playerId: PlayerId, stepIndex: number): BoardCoord {
  if (stepIndex >= 24) {
    return CENTER_COORD;
  }

  if (stepIndex < 16) {
    const baseOffset = PLAYER_START_PERIMETER_OFFSET[playerId];
    const pathIdx = (baseOffset + stepIndex) % 16;
    return PERIMETER_PATH[pathIdx];
  }

  // Inner track: steps 16 to 23 (8 squares)
  const innerStep = stepIndex - 16; // 0 to 7
  const baseInnerOffset = PLAYER_INNER_ENTRY_OFFSET[playerId];
  const innerIdx = (baseInnerOffset + innerStep) % 8;
  return INNER_PATH_CLOCKWISE[innerIdx];
}

/**
 * Calculate move target for a token given a roll value and player's kill status.
 * Returns null if the move is invalid (e.g. overshooting center home).
 */
export interface MoveSimulation {
  canMove: boolean;
  newStepIndex: number;
  newCoord: BoardCoord;
  isFinished: boolean;
  enteredInner: boolean;
  loopedOuter: boolean;
  capturedToken: Token | null;
}

export function simulateMove(
  player: Player,
  token: Token,
  roll: number,
  allPlayers: Player[]
): MoveSimulation | null {
  if (token.isFinished) return null;

  const currentStep = token.stepIndex;

  // Case 1: Token is already on inner track (steps 16 to 23)
  if (currentStep >= 16) {
    const targetStep = currentStep + roll;
    if (targetStep > 24) {
      // Must land on Center (step 24) with exact roll
      return null;
    }
    const isFinished = targetStep === 24;
    const newCoord = isFinished ? CENTER_COORD : getCoordForPlayerStep(player.id, targetStep);

    // Check for capture
    const capturedToken = checkCapture(player.id, newCoord, allPlayers);

    return {
      canMove: true,
      newStepIndex: targetStep,
      newCoord,
      isFinished,
      enteredInner: false,
      loopedOuter: false,
      capturedToken,
    };
  }

  // Case 2: Token is on outer track (steps 0 to 15)
  const rawTargetStep = currentStep + roll;

  if (rawTargetStep <= 15) {
    // Normal outer move
    const newCoord = getCoordForPlayerStep(player.id, rawTargetStep);
    const capturedToken = checkCapture(player.id, newCoord, allPlayers);

    return {
      canMove: true,
      newStepIndex: rawTargetStep,
      newCoord,
      isFinished: false,
      enteredInner: false,
      loopedOuter: false,
      capturedToken,
    };
  }

  // Passing step 15 (entering inner track or looping around)
  if (player.hasKill) {
    // Player has unlocked the inner track!
    // rawTargetStep > 15: step 16 is first inner square
    if (rawTargetStep > 24) {
      // Overshot center home
      return null;
    }

    const isFinished = rawTargetStep === 24;
    const newCoord = isFinished ? CENTER_COORD : getCoordForPlayerStep(player.id, rawTargetStep);
    const capturedToken = checkCapture(player.id, newCoord, allPlayers);

    return {
      canMove: true,
      newStepIndex: rawTargetStep,
      newCoord,
      isFinished,
      enteredInner: true,
      loopedOuter: false,
      capturedToken,
    };
  } else {
    // Player does NOT have a kill yet!
    // Cannot enter the inner track; must continue looping outer perimeter
    const loopedStep = rawTargetStep % 16;
    const newCoord = getCoordForPlayerStep(player.id, loopedStep);
    const capturedToken = checkCapture(player.id, newCoord, allPlayers);

    return {
      canMove: true,
      newStepIndex: loopedStep,
      newCoord,
      isFinished: false,
      enteredInner: false,
      loopedOuter: true,
      capturedToken,
    };
  }
}

/**
 * Check if landing on targetCoord will capture an opponent token
 */
function checkCapture(currentPid: PlayerId, targetCoord: BoardCoord, allPlayers: Player[]): Token | null {
  if (isSafeCoord(targetCoord)) {
    return null; // Safe zones prevent any captures
  }

  for (const p of allPlayers) {
    if (p.id === currentPid) continue;
    for (const t of p.tokens) {
      if (!t.isFinished && coordsEqual(t.coord, targetCoord)) {
        return t; // Enemy token captured!
      }
    }
  }

  return null;
}

/**
 * Roll Gavvalu (Cowrie Shells)
 */
export function rollCowries(mode: DiceMode): DiceRollResult {
  const totalShells = mode === '6_shells' ? 6 : 4;
  const shells: ShellState[] = [];
  let openCount = 0;

  for (let i = 0; i < totalShells; i++) {
    const isOpen = Math.random() < 0.5;
    if (isOpen) openCount++;

    shells.push({
      isOpen,
      rotation: Math.floor(Math.random() * 360),
      offsetX: Math.floor((Math.random() - 0.5) * 24),
      offsetY: Math.floor((Math.random() - 0.5) * 24),
    });
  }

  if (mode === '4_shells') {
    if (openCount === 0) {
      return {
        value: 8,
        openCount,
        totalShells,
        shells,
        isBonus: true,
        nameEnglish: 'Ashta / Bara (8)',
        nameTelugu: 'అష్ట / బార (8)',
        audioKey: 'ashta',
      };
    } else if (openCount === 4) {
      return {
        value: 4,
        openCount,
        totalShells,
        shells,
        isBonus: true,
        nameEnglish: 'Chowka (4)',
        nameTelugu: 'చౌక (4)',
        audioKey: 'chowka',
      };
    } else {
      const names: Record<number, { en: string; te: string }> = {
        1: { en: 'One (1)', te: 'ఒకటి (1)' },
        2: { en: 'Two (2)', te: 'రెండు (2)' },
        3: { en: 'Three (3)', te: 'మూడు (3)' },
      };
      return {
        value: openCount,
        openCount,
        totalShells,
        shells,
        isBonus: false,
        nameEnglish: names[openCount].en,
        nameTelugu: names[openCount].te,
        audioKey: openCount === 1 ? 'single' : openCount === 2 ? 'double' : 'triple',
      };
    }
  } else {
    // 6 Shells Mode (Pedda Baara Katta)
    if (openCount === 0) {
      return {
        value: 12,
        openCount,
        totalShells,
        shells,
        isBonus: true,
        nameEnglish: 'Bara (12)',
        nameTelugu: 'బార (12)',
        audioKey: 'bara',
      };
    } else if (openCount === 4) {
      return {
        value: 4,
        openCount,
        totalShells,
        shells,
        isBonus: true,
        nameEnglish: 'Chowka (4)',
        nameTelugu: 'చౌక (4)',
        audioKey: 'chowka',
      };
    } else {
      const names: Record<number, { en: string; te: string }> = {
        1: { en: 'One (1)', te: 'ఒకటి (1)' },
        2: { en: 'Two (2)', te: 'రెండు (2)' },
        3: { en: 'Three (3)', te: 'మూడు (3)' },
        5: { en: 'Five (5)', te: 'ఐదు (5)' },
        6: { en: 'Six (6)', te: 'ఆరు (6)' },
      };
      return {
        value: openCount,
        openCount,
        totalShells,
        shells,
        isBonus: false,
        nameEnglish: names[openCount]?.en || `${openCount}`,
        nameTelugu: names[openCount]?.te || `${openCount}`,
        audioKey: openCount === 1 ? 'single' : openCount === 2 ? 'double' : 'triple',
      };
    }
  }
}

/**
 * Initial Players configuration
 */
export function createInitialPlayers(
  count: 2 | 3 | 4,
  aiPlayerIds: PlayerId[],
  customNames?: Partial<Record<PlayerId, string>>
): Player[] {
  const configs: Record<PlayerId, {
    name: string;
    nameTelugu: string;
    colorName: string;
    colorHex: string;
    bgHex: string;
    borderHex: string;
    homeCoord: BoardCoord;
    bot: {
      name: string;
      teluguName: string;
      avatar: string;
      tagline: string;
      taglineTelugu: string;
    };
  }> = {
    south: {
      name: 'Player 1 (South)',
      nameTelugu: 'ఆటగాడు 1 (కుంకుమ)',
      colorName: 'Terracotta Red',
      colorHex: '#dc2626',
      bgHex: '#ef4444',
      borderHex: '#991b1b',
      homeCoord: { r: 4, c: 2 },
      bot: {
        name: 'Thatha (Grandfather)',
        teluguName: 'తాతగారు',
        avatar: '👴',
        tagline: 'Patient and strategic elder',
        taglineTelugu: 'ఓర్పుగా ఆడే గ్రామ పెద్ద',
      },
    },
    north: {
      name: count === 2 ? 'Player 2 (North)' : 'Player 3 (North)',
      nameTelugu: count === 2 ? 'ఆటగాడు 2 (పసుపు)' : 'ఆటగాడు 3 (పసుపు)',
      colorName: 'Turmeric Gold',
      colorHex: '#d97706',
      bgHex: '#f59e0b',
      borderHex: '#92400e',
      homeCoord: { r: 0, c: 2 },
      bot: {
        name: 'Athayya (Aunt)',
        teluguName: 'అత్తయ్య',
        avatar: '🧕',
        tagline: 'Ruthless hunter of opponent tokens',
        taglineTelugu: 'వేటాడటంలో దిట్ట',
      },
    },
    east: {
      name: 'Player 2 (East)',
      nameTelugu: 'ఆటగాడు 2 (నీలం)',
      colorName: 'Peacock Teal',
      colorHex: '#0d9488',
      bgHex: '#14b8a6',
      borderHex: '#115e59',
      homeCoord: { r: 2, c: 4 },
      bot: {
        name: 'Bava (Cousin)',
        teluguName: 'బావ',
        avatar: '👦',
        tagline: 'Daring risk-taker',
        taglineTelugu: 'సాహసోపేతమైన ఎత్తులు',
      },
    },
    west: {
      name: 'Player 4 (West)',
      nameTelugu: 'ఆటగాడు 4 (ఆకుపచ్చ)',
      colorName: 'Tulasi Green',
      colorHex: '#16a34a',
      bgHex: '#22c55e',
      borderHex: '#166534',
      homeCoord: { r: 2, c: 0 },
      bot: {
        name: 'Chelli (Sister)',
        teluguName: 'చెల్లి',
        avatar: '👧',
        tagline: 'Swift runner to the center home',
        taglineTelugu: 'చకచకా ఇల్లు చేరే నేర్పరి',
      },
    },
  };

  const selectedIds: PlayerId[] =
    count === 2 ? ['south', 'north'] : count === 3 ? ['south', 'east', 'north'] : ['south', 'east', 'north', 'west'];

  return selectedIds.map(id => {
    const cfg = configs[id];
    const isAI = aiPlayerIds.includes(id);
    const customName = customNames?.[id]?.trim();

    const displayName = isAI ? cfg.bot.name : (customName || cfg.name);
    const displayNameTelugu = isAI ? cfg.bot.teluguName : (customName || cfg.nameTelugu);

    const tokens: Token[] = [0, 1, 2, 3].map(idx => ({
      id: `${id}_token_${idx}`,
      playerId: id,
      index: idx,
      stepIndex: 0,
      lapCount: 0,
      isFinished: false,
      coord: { ...cfg.homeCoord },
    }));

    return {
      id,
      name: displayName,
      nameTelugu: displayNameTelugu,
      colorName: cfg.colorName,
      colorHex: cfg.colorHex,
      bgHex: cfg.bgHex,
      borderHex: cfg.borderHex,
      homeCoord: { ...cfg.homeCoord },
      isAI,
      botPersonality: cfg.bot,
      hasKill: false,
      killsCount: 0,
      tokens,
    };
  });
}
