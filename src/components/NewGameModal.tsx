/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BoardTheme, DiceMode, GameSettings, Language, PlayerId } from '../types/game';
import { X, Users, User, Bot, Dices, Palette, Play, Sparkles, Shield } from 'lucide-react';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: GameSettings;
  onStartGame: (newSettings: GameSettings) => void;
  language: Language;
}

export type PresetMode = '2p_offline' | '4p_offline' | 'vs_ai' | 'spectate';

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onStartGame,
  language,
}) => {
  // Determine initial preset
  const getInitialPreset = (): PresetMode => {
    if (currentSettings.aiPlayerIds.length === 0) {
      return currentSettings.playerCount === 2 ? '2p_offline' : '4p_offline';
    }
    return 'vs_ai';
  };

  const [preset, setPreset] = useState<PresetMode>(getInitialPreset());
  const [playerNames, setPlayerNames] = useState<Partial<Record<PlayerId, string>>>(
    currentSettings.playerNames || {}
  );
  const [diceMode, setDiceMode] = useState<DiceMode>(currentSettings.diceMode);
  const [theme, setTheme] = useState<BoardTheme>(currentSettings.theme);

  if (!isOpen) return null;

  const handleStart = () => {
    let count: 2 | 3 | 4 = 4;
    let aiPlayerIds: PlayerId[] = [];

    if (preset === '2p_offline') {
      count = 2;
      aiPlayerIds = []; // 100% Offline Pass & Play for 2 humans!
    } else if (preset === '4p_offline') {
      count = 4;
      aiPlayerIds = []; // 100% Offline Pass & Play for 4 humans!
    } else if (preset === 'vs_ai') {
      count = 4;
      aiPlayerIds = ['east', 'north', 'west']; // 1 Human vs 3 Bots
    } else if (preset === 'spectate') {
      count = 4;
      aiPlayerIds = ['south', 'east', 'north', 'west'];
    }

    onStartGame({
      playerCount: count,
      aiPlayerIds,
      diceMode,
      theme,
      language,
      soundEnabled: currentSettings.soundEnabled,
      playerNames,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-stone-900 border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-stone-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/70">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-cinzel text-amber-400">
              {language === 'te' ? 'ఆట విధానం ఎంచుకోండి' : 'Choose Game Mode'}
            </h2>
            <p className="text-[11px] text-stone-400">
              {language === 'te'
                ? 'సంప్రదాయ నియమాలు యథావిధిగా వర్తిస్తాయి'
                : 'Authentic village board rules fully preserved'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Configuration Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Featured Presets (2P Offline, 4P Offline, Vs AI) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>
                {language === 'te' ? 'ఆఫ్‌లైన్ & మల్టీప్లేయర్ విధానాలు' : 'Offline & Multiplayer Modes'}
              </span>
            </label>

            <div className="grid grid-cols-1 gap-2">
              {/* Option 1: 2 Players Offline */}
              <button
                type="button"
                onClick={() => setPreset('2p_offline')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  preset === '2p_offline'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-800/80 border-stone-700/60 text-stone-300 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    2P
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-stone-100">
                        {language === 'te' ? '2 ప్లేయర్స్ ఆఫ్‌లైన్ (2 Players Offline)' : '2 Players Offline (Pass & Play)'}
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {language === 'te' ? 'ఆఫ్‌లైన్' : 'Offline'}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 block mt-0.5">
                      {language === 'te'
                        ? 'దక్షిణం (కుంకుమ) vs ఉత్తరం (పసుపు) · ఒకే ఫోన్‌లో ఇద్దరు ఆడవచ్చు'
                        : 'Player 1 (South) vs Player 2 (North) on the same phone'}
                    </span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  preset === '2p_offline' ? 'border-amber-400 bg-amber-400' : 'border-stone-500'
                }`}>
                  {preset === '2p_offline' && <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                </div>
              </button>

              {/* Option 2: 4 Players Offline */}
              <button
                type="button"
                onClick={() => setPreset('4p_offline')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  preset === '4p_offline'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-800/80 border-stone-700/60 text-stone-300 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-teal-600 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    4P
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-stone-100">
                        {language === 'te' ? '4 ప్లేయర్స్ ఆఫ్‌లైన్ (4 Players Offline)' : '4 Players Offline (Pass & Play)'}
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {language === 'te' ? 'ఆఫ్‌లైన్' : 'Offline'}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 block mt-0.5">
                      {language === 'te'
                        ? 'నాలుగు వైపులా 4 మిత్రులు/కుటుంబం · ఫోన్‌ను పంచుకుంటూ ఆడండి'
                        : 'Full 4-corner traditional village match with family & friends'}
                    </span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  preset === '4p_offline' ? 'border-amber-400 bg-amber-400' : 'border-stone-500'
                }`}>
                  {preset === '4p_offline' && <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                </div>
              </button>

              {/* Option 3: Vs Smart Bots */}
              <button
                type="button"
                onClick={() => setPreset('vs_ai')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  preset === 'vs_ai'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-800/80 border-stone-700/60 text-stone-300 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-900/60 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-lg shadow">
                    🤖
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-stone-100">
                        {language === 'te' ? 'గ్రామ పెద్దల AI తో ఆట (Vs Smart Bots)' : '1 Player vs Village Bots'}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 block mt-0.5">
                      {language === 'te'
                        ? 'తాతగారు, అత్తయ్య, బావ తో ఒంటరిగా ఆడుకోండి'
                        : 'Play solo against Thatha, Athayya, and Bava'}
                    </span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  preset === 'vs_ai' ? 'border-amber-400 bg-amber-400' : 'border-stone-500'
                }`}>
                  {preset === 'vs_ai' && <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                </div>
              </button>
            </div>
          </div>

          {/* Player Name Customization (When playing Offline) */}
          {(preset === '2p_offline' || preset === '4p_offline') && (
            <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-2.5">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {language === 'te'
                    ? 'ఆటగాళ్ళ పేర్లు (Player Names - Optional)'
                    : 'Player Names (Optional)'}
                </span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Player 1 South */}
                <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
                  <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
                  <input
                    type="text"
                    value={playerNames.south || ''}
                    onChange={e => setPlayerNames(prev => ({ ...prev, south: e.target.value }))}
                    placeholder={language === 'te' ? 'ఆటగాడు 1 (కుంకుమ)' : 'Player 1 (South)'}
                    className="bg-transparent text-stone-100 placeholder:text-stone-500 focus:outline-none w-full text-xs"
                    maxLength={15}
                  />
                </div>

                {/* Player 2 (North in 2P, East in 4P) */}
                {preset === '2p_offline' ? (
                  <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                    <input
                      type="text"
                      value={playerNames.north || ''}
                      onChange={e => setPlayerNames(prev => ({ ...prev, north: e.target.value }))}
                      placeholder={language === 'te' ? 'ఆటగాడు 2 (పసుపు)' : 'Player 2 (North)'}
                      className="bg-transparent text-stone-100 placeholder:text-stone-500 focus:outline-none w-full text-xs"
                      maxLength={15}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
                      <span className="w-3 h-3 rounded-full bg-teal-600 shrink-0" />
                      <input
                        type="text"
                        value={playerNames.east || ''}
                        onChange={e => setPlayerNames(prev => ({ ...prev, east: e.target.value }))}
                        placeholder={language === 'te' ? 'ఆటగాడు 2 (నీలం)' : 'Player 2 (East)'}
                        className="bg-transparent text-stone-100 placeholder:text-stone-500 focus:outline-none w-full text-xs"
                        maxLength={15}
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                      <input
                        type="text"
                        value={playerNames.north || ''}
                        onChange={e => setPlayerNames(prev => ({ ...prev, north: e.target.value }))}
                        placeholder={language === 'te' ? 'ఆటగాడు 3 (పసుపు)' : 'Player 3 (North)'}
                        className="bg-transparent text-stone-100 placeholder:text-stone-500 focus:outline-none w-full text-xs"
                        maxLength={15}
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
                      <span className="w-3 h-3 rounded-full bg-green-600 shrink-0" />
                      <input
                        type="text"
                        value={playerNames.west || ''}
                        onChange={e => setPlayerNames(prev => ({ ...prev, west: e.target.value }))}
                        placeholder={language === 'te' ? 'ఆటగాడు 4 (ఆకుపచ్చ)' : 'Player 4 (West)'}
                        className="bg-transparent text-stone-100 placeholder:text-stone-500 focus:outline-none w-full text-xs"
                        maxLength={15}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Authentic Rules Assurance Note */}
          <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold text-amber-300 block">
                {language === 'te' ? 'సంప్రదాయ నియమాలు యథాతథం:' : 'Game Rules Intact & Unchanged:'}
              </span>
              <span>
                {language === 'te'
                  ? '5x5 గడులు, 5 రక్షిత ఇళ్ళు (X), 16 బయటి గడుల ప్రయాణం, దాడి (Kill) నిబంధన, మరియు గర్భగుడికి చేరే నియమాలు అన్నీ అలాగే ఉంటాయి.'
                  : '5x5 grid, 5 Safe Zones (X), 16 outer steps, the mandatory Daadi (Kill) prerequisite, and exact roll to reach Garbha Gudi remain identical.'}
              </span>
            </div>
          </div>

          {/* Dice & Theme Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Dice Mode */}
            <div>
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Dices className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'te' ? 'గవ్వలు' : 'Cowries'}</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setDiceMode('4_shells')}
                  className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    diceMode === '4_shells'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-stone-800/80 border-stone-700/60 text-stone-400'
                  }`}
                >
                  4 Gavvalu
                </button>
                <button
                  type="button"
                  onClick={() => setDiceMode('6_shells')}
                  className={`py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    diceMode === '6_shells'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-stone-800/80 border-stone-700/60 text-stone-400'
                  }`}
                >
                  6 Gavvalu
                </button>
              </div>
            </div>

            {/* Board Theme */}
            <div>
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'te' ? 'బోర్డు శైలి' : 'Board Style'}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['thinnelu', 'kalamkari', 'brass_teak'] as BoardTheme[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`py-1.5 px-1 rounded-xl border text-center capitalize transition-all cursor-pointer ${
                      theme === t
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-stone-800/80 border-stone-700/60 text-stone-400'
                    }`}
                  >
                    {t === 'thinnelu' ? 'తిన్నె' : t === 'kalamkari' ? 'పట్టు' : 'టేకు'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/70 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            {language === 'te' ? 'రద్దు (Cancel)' : 'Cancel'}
          </button>
          <button
            onClick={handleStart}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-stone-950 bg-amber-500 rounded-xl hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {preset === '2p_offline'
                ? language === 'te' ? '2 ప్లేయర్స్ ఆట మొదలుపెట్టు' : 'Start 2P Offline Match'
                : preset === '4p_offline'
                ? language === 'te' ? '4 ప్లేయర్స్ ఆట మొదలుపెట్టు' : 'Start 4P Offline Match'
                : language === 'te' ? 'ఆట ప్రారంభించండి' : 'Start Match'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
