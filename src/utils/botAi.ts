/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player, Token } from '../types/game';
import { isSafeCoord, MoveSimulation, simulateMove } from './gameRules';

export interface BotDecision {
  token: Token;
  simulation: MoveSimulation;
  quipEnglish?: string;
  quipTelugu?: string;
}

export function chooseBotMove(
  botPlayer: Player,
  roll: number,
  allPlayers: Player[]
): BotDecision | null {
  const eligibleMoves: { token: Token; sim: MoveSimulation; score: number }[] = [];

  for (const token of botPlayer.tokens) {
    if (token.isFinished) continue;

    const sim = simulateMove(botPlayer, token, roll, allPlayers);
    if (!sim || !sim.canMove) continue;

    let score = 0;

    // 1. CAPTURE / DAADI (Highest reward)
    if (sim.capturedToken) {
      score += 1500;
      // If player doesn't have a kill yet, capturing is top priority!
      if (!botPlayer.hasKill) {
        score += 1000;
      }
    }

    // 2. REACHING CENTER HOME (2,2)
    if (sim.isFinished) {
      score += 1200;
    }

    // 3. ENTERING INNER TRACK
    if (sim.enteredInner) {
      score += 700;
    }

    // 4. LANDING ON SAFE ZONE (Katta / Illu)
    if (isSafeCoord(sim.newCoord)) {
      score += 400;
    }

    // 5. ESCAPING DANGER: if currently on an unsafe square and opponent is nearby
    if (!isSafeCoord(token.coord)) {
      // Check if an enemy token is behind within 1-8 steps
      let inDanger = false;
      for (const p of allPlayers) {
        if (p.id === botPlayer.id) continue;
        for (const t of p.tokens) {
          if (!t.isFinished && !isSafeCoord(t.coord)) {
            // If enemy is on same track and close
            if (t.stepIndex < token.stepIndex && token.stepIndex - t.stepIndex <= 8) {
              inDanger = true;
              break;
            }
          }
        }
      }
      if (inDanger) {
        score += 350;
      }
    }

    // 6. ADVANCING FORWARD
    score += sim.newStepIndex * 15;

    // Avoid moving a token that is already on a safe zone if another token is vulnerable
    if (isSafeCoord(token.coord) && !sim.isFinished && !sim.capturedToken) {
      score -= 80;
    }

    eligibleMoves.push({ token, sim, score });
  }

  if (eligibleMoves.length === 0) {
    return null;
  }

  // Pick highest scoring move
  eligibleMoves.sort((a, b) => b.score - a.score);
  const best = eligibleMoves[0];

  // Contextual bot banter
  let quipEnglish: string | undefined;
  let quipTelugu: string | undefined;

  if (best.sim.capturedToken) {
    quipEnglish = "Got you! That's a Daadi (Capture)! Back to your home!";
    quipTelugu = "దొరికావు! నా దాడి పడింది, నీ కాయ మొదట్లోకి వెళ్ళింది!";
  } else if (best.sim.isFinished) {
    quipEnglish = "One more token safe inside the sanctum!";
    quipTelugu = "నా కాయ గర్భగుడికి చేరిపోయింది!";
  } else if (best.sim.enteredInner) {
    quipEnglish = "Entering the inner ring now!";
    quipTelugu = "లోపలి వలయంలోకి ప్రవేశిస్తున్నా!";
  } else if (isSafeCoord(best.sim.newCoord)) {
    quipEnglish = "Resting in the safe illu!";
    quipTelugu = "ఇంటి కట్టలో సురక్షితంగా ఉన్నాను!";
  }

  return {
    token: best.token,
    simulation: best.sim,
    quipEnglish,
    quipTelugu,
  };
}
