/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types/game';
import { X, Shield, Swords, Sparkles, CheckCircle2, Dices } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-stone-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div>
            <h2 className="text-lg font-bold font-cinzel text-amber-400">
              {language === 'te' ? 'ఆట నియమాలు (Rules of Bara Katta)' : 'Bara Katta Rules & Mechanics'}
            </h2>
            <p className="text-xs text-stone-400">
              {language === 'te'
                ? 'సంప్రదాయ తెలుగు గ్రామీణ వ్యూహాత్మక క్రీడ'
                : 'Traditional Telugu Cross-and-Circle Strategy Board Game'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed">
          {/* 1. Objective */}
          <section className="space-y-2">
            <h3 className="font-bold text-amber-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>{language === 'te' ? '1. ముఖ్య ఉద్దేశం (The Goal)' : '1. Objective'}</span>
            </h3>
            <p className="text-stone-300">
              {language === 'te'
                ? 'ప్రతి ఆటగాడికి 4 కాయలు ఉంటాయి. మీ కాయలను బయటి వలయంలో అపసవ్య దిశలో (counter-clockwise) నడిపి, లోపలి వలయంలోకి ప్రవేశించి, మధ్యలోని గర్భగుడికి (Garbha Gudi / Home) చేర్చాలి. అన్ని కాయలను మొదట చేర్చినవారే విజేత.'
                : 'Each player controls 4 tokens starting from their home square. Move your tokens along the outer loop counter-clockwise, transition into the inner loop, and guide all 4 tokens into the central sanctum (Garbha Gudi). First player to finish all tokens wins!'}
            </p>
          </section>

          {/* 2. Gavvalu (Cowrie Shells) Scoring */}
          <section className="space-y-3">
            <h3 className="font-bold text-amber-300 flex items-center gap-2">
              <Dices className="w-4 h-4 text-amber-400" />
              <span>{language === 'te' ? '2. గవ్వల లెక్కలు (Cowrie Shells Scoring)' : '2. Cowrie Dice Rolls'}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/50">
                <span className="text-xs text-amber-400 font-bold block">1 Open Shell</span>
                <span className="text-base font-bold text-white font-mono">1 Step</span>
                <span className="text-[11px] text-stone-400 block">ఒకటి (Regular turn)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/50">
                <span className="text-xs text-amber-400 font-bold block">2 Open Shells</span>
                <span className="text-base font-bold text-white font-mono">2 Steps</span>
                <span className="text-[11px] text-stone-400 block">రెండు (Regular turn)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/50">
                <span className="text-xs text-amber-400 font-bold block">3 Open Shells</span>
                <span className="text-base font-bold text-white font-mono">3 Steps</span>
                <span className="text-[11px] text-stone-400 block">మూడు (Regular turn)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40">
                <span className="text-xs text-amber-300 font-bold block">4 Open Shells</span>
                <span className="text-base font-bold text-amber-400 font-mono">4 (Chowka)</span>
                <span className="text-[11px] text-amber-300/80 block">చౌక + బోనస్ వంతు! (+1 Roll)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40">
                <span className="text-xs text-amber-300 font-bold block">0 Open (All Closed)</span>
                <span className="text-base font-bold text-amber-400 font-mono">8 (Ashta / Bara)</span>
                <span className="text-[11px] text-amber-300/80 block">అష్ట / బార + బోనస్ వంతు! (+1 Roll)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/40">
                <span className="text-xs text-stone-400 font-bold block">6 Shells Mode</span>
                <span className="text-base font-bold text-white font-mono">12 (Pedda Bara)</span>
                <span className="text-[11px] text-stone-400 block">All closed = 12 steps</span>
              </div>
            </div>
          </section>

          {/* 3. The Kill (Daadi) Prerequisite */}
          <section className="space-y-2">
            <h3 className="font-bold text-amber-300 flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" />
              <span>{language === 'te' ? '3. దాడి నియమం (The Kill / Daadi Prerequisite)' : '3. The Kill (Daadi) Prerequisite'}</span>
            </h3>
            <p className="text-stone-300">
              {language === 'te'
                ? 'ఎదుటి ఆటగాడి కాయను కనీసం ఒక్కసారైనా "దాడి" (capture) చేయకుండా మీరు లోపలి వలయంలోకి ప్రవేశించలేరు! మీ కాయ బయటి వలయం పూర్తి చేసి, ఇంకా దాడి చేయకపోతే, అది మళ్లీ బయటి వలయంలోనే తిరగాలి. ఒక్కసారి ఎవరైనా ఒక కాయను దాడి చేస్తే, మీ అన్ని కాయలకూ లోపలి దారి తెరుచుకుంటుంది!'
                : 'A player CANNOT enter the inner track until they have successfully captured (killed) at least one opponent token! If a token completes the 16-square outer loop without a team kill, it must loop around the outer track again. Once you earn a kill, all your tokens gain permission to enter the inner lane.'}
            </p>
          </section>

          {/* 4. Safe Zones (Kattalu / Illu) */}
          <section className="space-y-2">
            <h3 className="font-bold text-amber-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>{language === 'te' ? '4. కట్టలు / ఇల్లు (Safe Zones)' : '4. Safe Zones (Kattalu / Illu)'}</span>
            </h3>
            <p className="text-stone-300">
              {language === 'te'
                ? "బోర్డుపై 'X' గుర్తు ఉన్న 5 గడులు (నాలుగు ఇళ్ళు మరియు మధ్యలోని గర్భగుడి) సురక్షితమైనవి. అక్కడ ఏ ఆటగాడి కాయనూ దాడి చేయలేరు. ఒకే గడిలో ఎంతమంది కాయలైనా కలిసి ఉండవచ్చు."
                : "Squares marked with an 'X' (the 4 outer home squares and the center sanctum) are Safe Zones. Tokens sitting in safe zones are completely immune to enemy captures. Multiple tokens can safely co-exist."}
            </p>
          </section>

          {/* 5. Bonus Turns */}
          <section className="space-y-2">
            <h3 className="font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'te' ? '5. అదనపు వంతులు (Bonus Turns)' : '5. Bonus Turns'}</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-stone-300">
              <li>
                {language === 'te'
                  ? 'చౌక (4) లేదా అష్ట/బార (8 లేదా 12) పడినప్పుడు అదనపు వంతు వస్తుంది.'
                  : 'Rolling Chowka (4) or Ashta/Bara (8/12) awards a bonus roll.'}
              </li>
              <li>
                {language === 'te'
                  ? 'ఎదుటి ఆటగాడి కాయను దాడి చేసినప్పుడు (capture) వెంటనే బోనస్ వంతు వస్తుంది!'
                  : 'Capturing an unprotected opponent token immediately awards a bonus turn!'}
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-950 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
          >
            {language === 'te' ? 'అర్థమైంది (Got it)' : 'Understood'}
          </button>
        </div>
      </div>
    </div>
  );
};
