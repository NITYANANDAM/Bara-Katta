/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types/game';
import { X, Heart, Landmark, Compass, Sparkles } from 'lucide-react';

interface HeritageModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HeritageModal: React.FC<HeritageModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-stone-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div>
            <h2 className="text-lg font-bold font-cinzel text-amber-400">
              {language === 'te'
                ? 'బారాకట్ట సాంస్కృతిక వారసత్వం (Heritage & Folklore)'
                : 'Bara Katta Cultural Heritage & Lore'}
            </h2>
            <p className="text-xs text-stone-400">
              {language === 'te'
                ? 'తెలుగు పల్లెటూళ్ళ సంప్రదాయ తిన్నెకడ ఆట'
                : 'Verandah Nostalgia of Telugu Villages'}
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
          {/* Section 1: Thinnelu Culture */}
          <section className="space-y-2">
            <h3 className="font-bold text-amber-300 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-400" />
              <span>{language === 'te' ? 'పల్లెటూరి తిన్నెలు (Verandah Thinnelu)' : 'Village Verandahs (Thinnelu)'}</span>
            </h3>
            <p className="text-stone-300">
              {language === 'te'
                ? 'ఆంధ్రప్రదేశ్ మరియు తెలంగాణ గ్రామాలలో వేసవి మధ్యాహ్నాలు, సంక్రాంతి, ఉగాది పండుగల వేళల్లో ఇంటి ముందున్న తిన్నెలపై కూర్చొని తాతయ్యలు, అమ్మమ్మలు పిల్లలతో బారాకట్ట (లేదా అష్టా చమ్మా) ఆడేవారు. నేలపై ముగ్గుపిండితో లేదా బొగ్గుతో 5x5 గడులు గీసి, చింతపిక్కలు లేదా గవ్వలతో గంటల తరబడి ఆనందంగా గడిపేవారు.'
                : 'In rural Andhra Pradesh and Telangana, summer afternoons and festive holidays (Sankranti, Ugadi) were celebrated on the shaded front verandahs ("Thinnelu"). Grandparents sat alongside grandchildren, hand-drawing the 5x5 grid with chalk or rice flour directly on the red-oxide floor, tossing cowrie shells (gavvalu) with lively laughter.'}
            </p>
          </section>

          {/* Section 2: Mathematical Wit & Memory */}
          <section className="space-y-2">
            <h3 className="font-bold text-amber-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>{language === 'te' ? 'గణిత ప్రతిభ & వ్యూహం (Mathematical Mind)' : 'Strategic Wit & Village Mathematics'}</span>
            </h3>
            <p className="text-stone-300">
              {language === 'te'
                ? 'ఈ ఆట పిల్లల్లో శీఘ్ర గణిత ఆలోచనను, సహనాన్ని, వ్యూహాత్మక ప్రణాళికను పెంచుతుంది. ఎప్పుడు ఎదుటి కాయను దాడి చేయాలి, ఎప్పుడు సురక్షితమైన ఇల్లు (Safe Zone)లో దాగుండాలి, లోపలి వలయానికి ఎలా దారి వేయాలనే ఆలోచనలే దీనిని అద్భుతమైన వ్యూహాత్మక క్రీడగా మలిచాయి.'
                : 'Bara Katta trained young minds in mental arithmetic, risk management, and spatial foresight. Deciding whether to risk chasing an enemy token for a crucial "Daadi" (kill prerequisite) or seek refuge in a safe illu square created thrilling game dynamics without costly equipment.'}
            </p>
          </section>

          {/* Section 3: Names across regions */}
          <section className="space-y-2">
            <h3 className="font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'te' ? 'వివిధ ప్రాంతాల పేర్లు (Regional Variations)' : 'Names Across Regions'}</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-stone-800/80 border border-stone-700/50">
                <span className="font-bold text-amber-300 block">బారాకట్ట (Bara Katta)</span>
                <span className="text-stone-400">కోస్తా & రాయలసీమ ప్రాంతాలు</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-800/80 border border-stone-700/50">
                <span className="font-bold text-amber-300 block">అష్టా చమ్మా (Ashta Chamma)</span>
                <span className="text-stone-400">తెలంగాణ & సకల ఆంధ్ర ప్రాంతాలు</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-800/80 border border-stone-700/50">
                <span className="font-bold text-amber-300 block">జువ్వ ఆట (Juvva Aata)</span>
                <span className="text-stone-400">ఉత్తరాంధ్ర గ్రామీణ ప్రాంతం</span>
              </div>
              <div className="p-2.5 rounded-lg bg-stone-800/80 border border-stone-700/50">
                <span className="font-bold text-amber-300 block">చౌకా బారా / కట్టె మనే</span>
                <span className="text-stone-400">కర్ణాటక & దక్షిణ భారతం</span>
              </div>
            </div>
          </section>

          {/* Section 4: Traditional Seeds & Gavvalu */}
          <section className="space-y-2">
            <h3 className="font-bold text-amber-300 flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-400" />
              <span>{language === 'te' ? 'చింతపిక్కలు మరియు గవ్వలు' : 'Tamarind Seeds & Cowrie Shells'}</span>
            </h3>
            <p className="text-stone-300">
              {language === 'te'
                ? 'మార్కెట్ పాచికలు రాకమునుపు, చింత గింజలను సగానికి కోసి (రెండు వైపులా రంగు తేడాతో) లేదా సముద్రపు గవ్వలను (Cowrie shells) ఉపయోగించి సంఖ్యలను లెక్కించేవారు. ఇవి విసిరినప్పుడు వచ్చే శబ్దం, పల్లెటూరి వెచ్చని జ్ఞాపకాలను మోసుకొస్తుంది.'
                : 'Long before modern plastic dice existed, village households split tamarind seeds in halves (revealing white interiors vs black coats) or tossed natural sea cowries. The rhythmic ceramic clacking of shells remains an iconic sound of South Indian village courtyards.'}
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-950 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
          >
            {language === 'te' ? 'ముగించు (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
