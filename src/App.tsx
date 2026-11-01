/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BoardTheme,
  DiceRollResult,
  GameSettings,
  Language,
  MoveLogEntry,
  Player,
  PlayerId,
  Token,
} from './types/game';
import {
  coordsEqual,
  createInitialPlayers,
  isSafeCoord,
  MoveSimulation,
  rollCowries,
  simulateMove,
} from './utils/gameRules';
import { chooseBotMove } from './utils/botAi';
import { sound } from './utils/audio';
import { triggerHaptic } from './utils/haptics';
import { TopNav } from './components/TopNav';
import { Board } from './components/Board';
import { CowrieDice } from './components/CowrieDice';
import { PlayerCard } from './components/PlayerCard';
import { MoveLog } from './components/MoveLog';
import { RulesModal } from './components/RulesModal';
import { HeritageModal } from './components/HeritageModal';
import { NewGameModal } from './components/NewGameModal';
import { GameOverModal } from './components/GameOverModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineBanner } from './components/OfflineBanner';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { Sparkles, Swords, RefreshCw, HelpCircle, History, Info, BookOpen, Volume2, VolumeX, Palette, Users, Smartphone } from 'lucide-react';

const INITIAL_SETTINGS: GameSettings = {
  playerCount: 4,
  aiPlayerIds: ['east', 'north', 'west'], // Default: Player 1 (South) is Human, 3 Bots
  diceMode: '4_shells',
  theme: 'thinnelu',
  language: 'te',
  soundEnabled: true,
};

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [players, setPlayers] = useState<Player[]>(() =>
    createInitialPlayers(
      INITIAL_SETTINGS.playerCount,
      INITIAL_SETTINGS.aiPlayerIds,
      INITIAL_SETTINGS.playerNames
    )
  );
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [turnState, setTurnState] = useState<
    'WAITING_ROLL' | 'WAITING_MOVE' | 'ROLLING_ANIMATION' | 'MOVING_ANIMATION'
  >('WAITING_ROLL');
  const [lastRoll, setLastRoll] = useState<DiceRollResult | null>(null);
  const [eligibleTokens, setEligibleTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [hoveredSimulation, setHoveredSimulation] = useState<MoveSimulation | null>(null);
  const [botSpeechBubble, setBotSpeechBubble] = useState<Partial<Record<PlayerId, string>>>({});
  const [logs, setLogs] = useState<MoveLogEntry[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [rankedPlayers, setRankedPlayers] = useState<Player[]>([]);
  const [passDeviceNotice, setPassDeviceNotice] = useState<string | null>(null);

  // Mobile App Navigation Tab
  const [mobileTab, setMobileTab] = useState<MobileTab>('board');

  // Modals state
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isHeritageOpen, setIsHeritageOpen] = useState(false);
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);

  const activePlayer = players[activePlayerIndex];
  const activePlayerRef = useRef(activePlayer);
  activePlayerRef.current = activePlayer;

  const isAllOffline = players.every(p => !p.isAI);

  // Add entry to move log
  const addLog = useCallback(
    (
      playerId: PlayerId,
      text: string,
      textTelugu: string,
      type: MoveLogEntry['type'] = 'move'
    ) => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newEntry: MoveLogEntry = {
        id: `log_${Date.now()}_${Math.random()}`,
        playerId,
        text,
        textTelugu,
        type,
        timestamp,
      };
      setLogs(prev => [newEntry, ...prev.slice(0, 50)]);
    },
    []
  );

  // Advance turn to next unfinished player
  const advanceTurn = useCallback(() => {
    setTurnState('WAITING_ROLL');
    setLastRoll(null);
    setEligibleTokens([]);
    setSelectedToken(null);
    setHoveredSimulation(null);

    setActivePlayerIndex(prevIdx => {
      let nextIdx = (prevIdx + 1) % players.length;
      let loopCount = 0;
      while (
        players[nextIdx].tokens.every(t => t.isFinished) &&
        loopCount < players.length
      ) {
        nextIdx = (nextIdx + 1) % players.length;
        loopCount++;
      }

      // If playing offline Pass & Play, announce passing device to next player
      if (players.every(p => !p.isAI)) {
        const nextPlayer = players[nextIdx];
        setPassDeviceNotice(nextPlayer.name);
        setTimeout(() => setPassDeviceNotice(null), 2400);
      }

      return nextIdx;
    });
  }, [players]);

  // Execute a selected move
  const executeMove = useCallback(
    (token: Token, sim: MoveSimulation) => {
      setTurnState('MOVING_ANIMATION');
      sound.playTokenMove();
      triggerHaptic('light');

      const currentPlayer = activePlayerRef.current;
      let earnedBonusTurn = false;
      let causedCapture = false;

      // Update players state
      setPlayers(prevPlayers => {
        let updatedHasKill = currentPlayer.hasKill;
        let updatedKillsCount = currentPlayer.killsCount;

        // If capture occurred
        if (sim.capturedToken) {
          causedCapture = true;
          earnedBonusTurn = true;
          updatedHasKill = true;
          updatedKillsCount += 1;
          sound.playCapture();
          triggerHaptic('heavy');

          const capturedPlayer = prevPlayers.find(p => p.id === sim.capturedToken!.playerId);
          addLog(
            currentPlayer.id,
            `Captured ${capturedPlayer?.name}'s token at (${sim.newCoord.r}, ${sim.newCoord.c})! Daadi done!`,
            `${capturedPlayer?.nameTelugu} కాయపై దాడి చేశారు! గమ్యం వైపు దారి తెరుచుకుంది!`,
            'kill'
          );
        } else if (isSafeCoord(sim.newCoord)) {
          sound.playSafeZone();
          triggerHaptic('medium');
        }

        if (sim.isFinished) {
          sound.playHomeReached();
          triggerHaptic('bonus');
          addLog(
            currentPlayer.id,
            `Reached the central home sanctum (Garbha Gudi)!`,
            `కాయ విజయవంతంగా గర్భగుడికి చేరింది!`,
            'home'
          );
        }

        return prevPlayers.map(p => {
          if (p.id === currentPlayer.id) {
            const newTokens = p.tokens.map(t =>
              t.id === token.id
                ? {
                    ...t,
                    stepIndex: sim.newStepIndex,
                    coord: sim.newCoord,
                    isFinished: sim.isFinished,
                  }
                : t
            );
            return {
              ...p,
              hasKill: updatedHasKill,
              killsCount: updatedKillsCount,
              tokens: newTokens,
            };
          }

          if (sim.capturedToken && p.id === sim.capturedToken.playerId) {
            const newTokens = p.tokens.map(t =>
              t.id === sim.capturedToken!.id
                ? {
                    ...t,
                    stepIndex: 0,
                    coord: { ...p.homeCoord },
                  }
                : t
            );
            return {
              ...p,
              tokens: newTokens,
            };
          }

          return p;
        });
      });

      // Check if current player just won
      setTimeout(() => {
        setPlayers(latestPlayers => {
          const freshCurrent = latestPlayers.find(p => p.id === currentPlayer.id)!;
          const allFinished = freshCurrent.tokens.every(t => t.isFinished);

          if (allFinished) {
            sound.playVictory();
            triggerHaptic('victory');
            setWinner(freshCurrent);

            const sorted = [...latestPlayers].sort((a, b) => {
              const aDone = a.tokens.filter(t => t.isFinished).length;
              const bDone = b.tokens.filter(t => t.isFinished).length;
              if (bDone !== aDone) return bDone - aDone;
              return b.killsCount - a.killsCount;
            });
            setRankedPlayers(sorted);
            setIsGameOverOpen(true);
            return latestPlayers;
          }

          const hadRollBonus = lastRoll?.isBonus ?? false;

          if (hadRollBonus || causedCapture) {
            sound.playBonus();
            triggerHaptic('bonus');
            addLog(
              currentPlayer.id,
              `${hadRollBonus ? 'Rolled bonus' : 'Made capture'}! Gets +1 Extra Roll!`,
              `${hadRollBonus ? 'ప్రత్యేక సంఖ్య పడింది' : 'దాడి చేశారు'}! అదనపు వంతు లభించింది!`,
              'bonus'
            );
            setTurnState('WAITING_ROLL');
            setLastRoll(null);
            setEligibleTokens([]);
            setSelectedToken(null);
            setHoveredSimulation(null);
          } else {
            advanceTurn();
          }

          return latestPlayers;
        });
      }, 400);
    },
    [activePlayerRef, addLog, advanceTurn, lastRoll]
  );

  // Handle dice roll
  const handleRoll = useCallback(() => {
    if (turnState !== 'WAITING_ROLL') return;

    setTurnState('ROLLING_ANIMATION');
    sound.playShellRoll();
    triggerHaptic('light');

    setTimeout(() => {
      const rollResult = rollCowries(settings.diceMode);
      setLastRoll(rollResult);
      if (rollResult.isBonus) {
        triggerHaptic('bonus');
      }

      addLog(
        activePlayer.id,
        `Tossed ${rollResult.nameEnglish}`,
        `${rollResult.nameTelugu} పడింది`,
        rollResult.isBonus ? 'bonus' : 'roll'
      );

      const eligible: Token[] = [];
      activePlayer.tokens.forEach(tok => {
        if (!tok.isFinished) {
          const sim = simulateMove(activePlayer, tok, rollResult.value, players);
          if (sim && sim.canMove) {
            eligible.push(tok);
          }
        }
      });

      setEligibleTokens(eligible);

      if (eligible.length === 0) {
        addLog(
          activePlayer.id,
          `No legal moves for roll of ${rollResult.value}. Turn passed.`,
          `${rollResult.value} కి వేయడానికి ఎత్తులు లేవు. వంతు దాటింది.`,
          'pass'
        );
        setTimeout(() => {
          advanceTurn();
        }, 1200);
      } else {
        setTurnState('WAITING_MOVE');
      }
    }, 450);
  }, [activePlayer, addLog, advanceTurn, players, settings.diceMode, turnState]);

  // AI Bot Automated Turn Loop (Only fires for AI players)
  useEffect(() => {
    if (!activePlayer.isAI || winner) return;

    let timer: NodeJS.Timeout;

    if (turnState === 'WAITING_ROLL') {
      timer = setTimeout(() => {
        handleRoll();
      }, 700);
    } else if (turnState === 'WAITING_MOVE' && lastRoll && eligibleTokens.length > 0) {
      timer = setTimeout(() => {
        const decision = chooseBotMove(activePlayer, lastRoll.value, players);
        if (decision) {
          if (decision.quipTelugu) {
            setBotSpeechBubble({
              [activePlayer.id]:
                settings.language === 'te' ? decision.quipTelugu : decision.quipEnglish,
            });
            setTimeout(() => {
              setBotSpeechBubble({});
            }, 2500);
          }
          executeMove(decision.token, decision.simulation);
        } else {
          advanceTurn();
        }
      }, 900);
    }

    return () => clearTimeout(timer);
  }, [
    activePlayer,
    advanceTurn,
    eligibleTokens,
    executeMove,
    handleRoll,
    lastRoll,
    players,
    settings.language,
    turnState,
    winner,
  ]);

  // Handle Token Click by Human
  const handleSelectToken = (token: Token) => {
    if (turnState !== 'WAITING_MOVE' || !lastRoll) return;
    if (activePlayer.isAI) return;

    const sim = simulateMove(activePlayer, token, lastRoll.value, players);
    if (!sim || !sim.canMove) return;

    setSelectedToken(token);
    setHoveredSimulation(sim);
    executeMove(token, sim);
  };

  // Handle Token Hover by Human for Ghost Target Preview
  const handleHoverToken = (token: Token | null) => {
    if (!token || !lastRoll) {
      setHoveredSimulation(null);
      return;
    }
    const sim = simulateMove(activePlayer, token, lastRoll.value, players);
    setHoveredSimulation(sim);
  };

  // Restart or Start New Game
  const startNewGame = (newSettings: GameSettings) => {
    setSettings(newSettings);
    const newPlayers = createInitialPlayers(
      newSettings.playerCount,
      newSettings.aiPlayerIds,
      newSettings.playerNames
    );
    setPlayers(newPlayers);
    setActivePlayerIndex(0);
    setTurnState('WAITING_ROLL');
    setLastRoll(null);
    setEligibleTokens([]);
    setSelectedToken(null);
    setHoveredSimulation(null);
    setWinner(null);
    setRankedPlayers([]);
    setLogs([]);
    setMobileTab('board');
    setPassDeviceNotice(null);

    const modeLabel =
      newSettings.aiPlayerIds.length === 0
        ? `${newSettings.playerCount} Players Offline Pass & Play`
        : '1 Player vs Village Bots';

    addLog(
      newPlayers[0].id,
      `Match started (${modeLabel})! Traditional rules active.`,
      `కొత్త బారాకట్ట ఆట మొదలైంది (${newSettings.playerCount} ఆటగాళ్ళు)! శుభం!`,
      'bonus'
    );
  };

  // Direct 1-click Quick Mode Starters
  const start2POffline = () => {
    startNewGame({
      ...settings,
      playerCount: 2,
      aiPlayerIds: [], // 100% human offline
    });
  };

  const start4POffline = () => {
    startNewGame({
      ...settings,
      playerCount: 4,
      aiPlayerIds: [], // 100% human offline
    });
  };

  const startVsBots = () => {
    startNewGame({
      ...settings,
      playerCount: 4,
      aiPlayerIds: ['east', 'north', 'west'],
    });
  };

  const canQuickRoll =
    turnState === 'WAITING_ROLL' && !activePlayer.isAI && !winner;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white pb-20 lg:pb-6">
      {/* PWA In-App Install Prompt Banner */}
      <PWAInstallPrompt language={settings.language} />

      {/* PWA Offline Connectivity Banner */}
      <OfflineBanner language={settings.language} />

      {/* 3-Zone Top Bar Contract */}
      <TopNav
        language={settings.language}
        onToggleLanguage={() =>
          setSettings(s => ({ ...s, language: s.language === 'te' ? 'en' : 'te' }))
        }
        theme={settings.theme}
        onSelectTheme={t => setSettings(s => ({ ...s, theme: t }))}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => {
          const next = !settings.soundEnabled;
          sound.setEnabled(next);
          setSettings(s => ({ ...s, soundEnabled: next }));
        }}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenHeritage={() => setIsHeritageOpen(true)}
        onNewGame={() => setIsNewGameOpen(true)}
      />

      {/* Quick Mode Bar (2 Players Offline / 4 Players Offline / Vs Bots) */}
      <div className="bg-stone-900/90 border-b border-stone-800/80 px-3 py-1.5 flex items-center justify-center">
        <div className="flex items-center gap-1.5 p-1 bg-stone-950/70 rounded-xl border border-stone-800/80 text-xs">
          <button
            onClick={start2POffline}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
              players.length === 2 && isAllOffline
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title="Start 2 Players Offline Pass & Play match"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{settings.language === 'te' ? '2P ఆఫ్‌లైన్' : '2P Offline'}</span>
          </button>

          <button
            onClick={start4POffline}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
              players.length === 4 && isAllOffline
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title="Start 4 Players Offline Pass & Play match"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{settings.language === 'te' ? '4P ఆఫ్‌లైన్' : '4P Offline'}</span>
          </button>

          <button
            onClick={startVsBots}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
              !isAllOffline
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
            title="Play against Telugu village elder bots"
          >
            <span>🤖</span>
            <span>{settings.language === 'te' ? 'బోట్స్ తో' : 'Vs Bots'}</span>
          </button>
        </div>
      </div>

      {/* Pass Device Banner for Offline Pass & Play */}
      {passDeviceNotice && (
        <div className="bg-amber-500 text-stone-950 text-xs font-bold py-1.5 px-4 text-center shadow-md animate-in slide-in-from-top-2 duration-200 flex items-center justify-center gap-2">
          <Smartphone className="w-4 h-4 animate-bounce" />
          <span>
            {settings.language === 'te'
              ? `ఫోన్‌ను ${passDeviceNotice} కి ఇవ్వండి (వంతు వచ్చింది)`
              : `Pass device to ${passDeviceNotice}'s turn!`}
          </span>
        </div>
      )}

      {/* Main Game Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 lg:p-6 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-8">
        {/* Left Side: Players List & Game Info (Desktop OR mobileTab === 'players') */}
        <section
          className={`w-full lg:w-72 flex-col gap-3 order-2 lg:order-1 ${
            mobileTab === 'players' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-400 font-medium px-1">
            <span className="font-bold text-stone-200">
              {isAllOffline
                ? settings.language === 'te'
                  ? `ఆఫ్‌లైన్ ఆట (${players.length} మంది)`
                  : `${players.length}P Offline Pass & Play`
                : settings.language === 'te'
                ? 'ఆటగాళ్ళు (Players)'
                : 'Match Players'}
            </span>
            <span className="font-mono text-[11px] text-amber-400">
              {settings.diceMode === '4_shells' ? '4 Gavvalu' : '6 Gavvalu'}
            </span>
          </div>

          {/* Player Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
            {players.map((p, idx) => (
              <PlayerCard
                key={p.id}
                player={p}
                isActive={idx === activePlayerIndex}
                language={settings.language}
                speechBubble={botSpeechBubble[p.id]}
              />
            ))}
          </div>

          {/* Quick Cultural Tips Card */}
          <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800/80 text-[11px] text-stone-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
              <Info className="w-3.5 h-3.5" />
              <span>{settings.language === 'te' ? 'తిన్నె ముచ్చట్లు (Village Wisdom)' : 'Village Strategy'}</span>
            </div>
            <p className="leading-snug">
              {settings.language === 'te'
                ? "దాడి (Kill) చేసేవరకు లోపలి గడులకు వెళ్లలేరు! 'X' ఉన్న గడులు సురక్షితమైనవి (ఇల్లు)."
                : "You cannot enter the inner ring until you capture (Daadi) an opponent token! 'X' marks Safe Zones."}
            </p>
          </div>
        </section>

        {/* Center: The Board Arena (Desktop OR mobileTab === 'board') */}
        <section
          className={`flex-col items-center gap-3 order-1 lg:order-2 w-full max-w-md sm:max-w-xl ${
            mobileTab === 'board' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Turn Announcement Banner */}
          <div className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 shadow-sm text-xs select-none">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activePlayer.colorHex }}
              />
              <span className="font-bold text-stone-200 truncate">
                {settings.language === 'te'
                  ? `${activePlayer.nameTelugu} వంతు`
                  : `${activePlayer.name}'s Turn`}
              </span>
              {isAllOffline && (
                <span className="text-[10px] text-amber-400 font-semibold hidden xs:inline">
                  (Pass & Play)
                </span>
              )}
            </div>

            <div className="text-amber-400 font-medium text-[11px] sm:text-xs shrink-0 ml-2">
              {turnState === 'WAITING_ROLL'
                ? activePlayer.isAI
                  ? settings.language === 'te'
                    ? 'గవ్వలు విసురుతున్నారు...'
                    : 'Bot rolling...'
                  : settings.language === 'te'
                  ? 'గవ్వలు విసరండి'
                  : 'Toss Gavvalu!'
                : turnState === 'WAITING_MOVE'
                ? settings.language === 'te'
                  ? 'కాయను తాకండి'
                  : 'Tap token to move'
                : turnState === 'ROLLING_ANIMATION'
                ? settings.language === 'te'
                  ? 'దొర్లుతున్నాయి...'
                  : 'Rolling...'
                : settings.language === 'te'
                ? 'కదులుతోంది...'
                : 'Moving...'}
            </div>
          </div>

          {/* 5x5 Grid Board */}
          <Board
            theme={settings.theme}
            language={settings.language}
            players={players}
            activePlayerId={activePlayer.id}
            eligibleTokens={eligibleTokens}
            selectedToken={selectedToken}
            onSelectToken={handleSelectToken}
            hoveredMoveSimulation={hoveredSimulation}
            onHoverToken={handleHoverToken}
          />

          {/* Mobile Shells Display (Visible directly under board on mobile if in board tab) */}
          <div className="w-full max-w-sm lg:hidden bg-stone-900/90 rounded-2xl border border-stone-800 p-3 shadow-md flex flex-col items-center mt-1">
            <CowrieDice
              lastRoll={lastRoll}
              isRolling={turnState === 'ROLLING_ANIMATION'}
              canRoll={turnState === 'WAITING_ROLL' && !activePlayer.isAI}
              onRoll={handleRoll}
              language={settings.language}
              activePlayerColor={activePlayer.colorHex}
            />
          </div>
        </section>

        {/* Right Side / Mobile Tab Content: Move Commentary & Rules */}
        <section
          className={`w-full lg:w-80 flex-col gap-4 order-3 ${
            mobileTab === 'logs'
              ? 'flex'
              : mobileTab === 'rules'
              ? 'flex'
              : 'hidden lg:flex'
          }`}
        >
          {/* Desktop Cowrie Shells Dice Container (Hidden on mobile since placed under board) */}
          <div className="hidden lg:flex bg-stone-900/90 rounded-3xl border border-stone-800 p-4 shadow-xl flex-col items-center">
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-xs">
              <span className="font-bold text-amber-400 font-cinzel">
                {settings.language === 'te' ? 'గవ్వల పళ్ళెం (Gavvalu)' : 'Cowrie Shells Tray'}
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                {settings.diceMode === '4_shells' ? '4 Shells' : '6 Shells'}
              </span>
            </div>

            <CowrieDice
              lastRoll={lastRoll}
              isRolling={turnState === 'ROLLING_ANIMATION'}
              canRoll={turnState === 'WAITING_ROLL' && !activePlayer.isAI}
              onRoll={handleRoll}
              language={settings.language}
              activePlayerColor={activePlayer.colorHex}
            />
          </div>

          {/* If mobile tab is 'logs' or on desktop: show MoveLog */}
          {(mobileTab === 'logs' || window.innerWidth >= 1024) && (
            <MoveLog logs={logs} players={players} language={settings.language} />
          )}

          {/* If mobile tab is 'rules': show mobile quick settings & rules launcher */}
          {mobileTab === 'rules' && (
            <div className="lg:hidden flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
                <h3 className="font-bold text-amber-400 text-sm font-cinzel">
                  {settings.language === 'te' ? 'ఆట విధానాలు & ఎంపికలు' : 'Game Modes & Rules'}
                </h3>
                <div className="space-y-2 text-xs">
                  {/* Quick offline buttons in mobile rules menu */}
                  <button
                    onClick={start2POffline}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>{settings.language === 'te' ? '2 ప్లేయర్స్ ఆఫ్‌లైన్ ఆట' : '2 Players Offline Match'}</span>
                    <Users className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={start4POffline}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>{settings.language === 'te' ? '4 ప్లేయర్స్ ఆఫ్‌లైన్ ఆట' : '4 Players Offline Match'}</span>
                    <Users className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={() => setIsRulesOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>{settings.language === 'te' ? 'ఆట పూర్తి నియమాలు' : 'Full Game Rules'}</span>
                    <BookOpen className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={() => setIsHeritageOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>{settings.language === 'te' ? 'సంస్కృతి & చరిత్ర' : 'Heritage & Folklore'}</span>
                    <History className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={() => {
                      const nextTheme: BoardTheme =
                        settings.theme === 'thinnelu'
                          ? 'kalamkari'
                          : settings.theme === 'kalamkari'
                          ? 'brass_teak'
                          : 'thinnelu';
                      setSettings(s => ({ ...s, theme: nextTheme }));
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>
                      {settings.language === 'te' ? 'బోర్డు శైలి మార్చు' : 'Switch Theme'}:{' '}
                      <strong className="text-amber-400 capitalize">{settings.theme}</strong>
                    </span>
                    <Palette className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    onClick={() => {
                      const next = !settings.soundEnabled;
                      sound.setEnabled(next);
                      setSettings(s => ({ ...s, soundEnabled: next }));
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>
                      {settings.language === 'te' ? 'శబ్దం (Sound)' : 'Audio FX'}:{' '}
                      <strong className="text-amber-400">
                        {settings.soundEnabled ? 'ON' : 'OFF'}
                      </strong>
                    </span>
                    {settings.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-amber-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-stone-500" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsNewGameOpen(true)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md"
              >
                {settings.language === 'te' ? 'అనుకూల ఆట మొదలుపెట్టు' : 'Custom Game Setup'}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={mobileTab}
        onSelectTab={tab => setMobileTab(tab)}
        language={settings.language}
        canQuickRoll={canQuickRoll}
        isRolling={turnState === 'ROLLING_ANIMATION'}
        onQuickRoll={handleRoll}
        activePlayer={activePlayer}
      />

      {/* Modals */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        language={settings.language}
      />

      <HeritageModal
        isOpen={isHeritageOpen}
        onClose={() => setIsHeritageOpen(false)}
        language={settings.language}
      />

      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        currentSettings={settings}
        onStartGame={startNewGame}
        language={settings.language}
      />

      <GameOverModal
        isOpen={isGameOverOpen}
        winner={winner}
        rankedPlayers={rankedPlayers}
        onPlayAgain={() => {
          setIsGameOverOpen(false);
          startNewGame(settings);
        }}
        language={settings.language}
      />
    </div>
  );
}
