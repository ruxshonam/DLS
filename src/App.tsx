import React, { useState, useEffect, useRef } from 'react';
import { TeamData, PlayerData, GameMode, GameSettings, MatchStats, MatchPlayMode } from './types/game';
import { INITIAL_TEAMS, getSavedUserTeam, saveUserTeam } from './data/teamsData';
import { GameEngine } from './game/gameEngine';
import { soundEngine } from './audio/soundEngine';
import { commentator } from './audio/commentatorEngine';
import { MainMenu } from './components/MainMenu';
import { ScoreboardHUD } from './components/ScoreboardHUD';
import { TouchControls } from './components/TouchControls';
import { PenaltyOverlay } from './components/PenaltyOverlay';
import { TeamManagementModal } from './components/TeamManagementModal';
import { CustomClubModal } from './components/CustomClubModal';
import { SettingsModal } from './components/SettingsModal';
import { TournamentModal } from './components/TournamentModal';
import { MatchSummaryModal } from './components/MatchSummaryModal';
import { TransferMarketModal } from './components/TransferMarketModal';
import { FriendMatchModal } from './components/FriendMatchModal';
import { Play, RotateCcw, Home, Volume2, VolumeX, Eye } from 'lucide-react';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Active Screen & Game State
  const [activeScreen, setActiveScreen] = useState<'menu' | 'match'>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('quick');

  // Teams with local persistence
  const [userTeam, setUserTeam] = useState<TeamData>(() => {
    return getSavedUserTeam();
  });
  const [opponentTeam, setOpponentTeam] = useState<TeamData>(INITIAL_TEAMS[1]);

  // Handle persistent user team updates (renamed players, swapped lineup, club name, kits, transfers)
  const handleUpdateUserTeam = (newTeam: TeamData) => {
    setUserTeam(newTeam);
    saveUserTeam(newTeam);
    if (engineRef.current) {
      engineRef.current.applyTeamUpdate(newTeam, true);
    }
  };

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    commentaryEnabled: true,
    commentaryLanguage: 'uz',
    crowdVolume: 0.8,
    sfxVolume: 0.8,
    matchDurationMinutes: 3,
    difficulty: 'amateur',
    cameraMode: 'tele',
    showRadar: true,
    autoSwitch: true,
    matchPlayMode: '1player',
  });

  // Live Match Telemetry
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchMinute, setMatchMinute] = useState(0);
  const [matchSecond, setMatchSecond] = useState(0);
  const [currentHalf, setCurrentHalf] = useState<1 | 2 | 'extra' | 'penalties' | 'ended'>(1);
  const [periodStatus, setPeriodStatus] = useState<'kickoff' | 'playing' | 'halftime' | 'fulltime' | 'extra_time_1' | 'extra_time_2' | 'penalty_shootout' | 'goal_replay' | 'throw_in' | 'corner_kick' | 'goal_kick' | 'free_kick'>('kickoff');
  const [controlledPlayer, setControlledPlayer] = useState<PlayerData | null>(null);
  const [controlledStamina, setControlledStamina] = useState(100);
  const [powerMeter, setPowerMeter] = useState<{ power: number; actionType: 'shoot' | 'pass' | 'through' }>({
    power: 0,
    actionType: 'shoot',
  });
  const [goalEvent, setGoalEvent] = useState<{ scorerName: string; teamId: string; shotSpeedKmh: number } | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Penalty Mode State
  const [penaltyRoundsHome, setPenaltyRoundsHome] = useState<(boolean | null)[]>([null, null, null, null, null]);
  const [penaltyRoundsAway, setPenaltyRoundsAway] = useState<(boolean | null)[]>([null, null, null, null, null]);
  const [penaltyAimX, setPenaltyAimX] = useState(0);

  // Modals
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [showClubModal, setShowClubModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showTransferMarket, setShowTransferMarket] = useState(false);
  const [showFriendMatch, setShowFriendMatch] = useState(false);
  const [showMatchSummary, setShowMatchSummary] = useState(false);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);

  // Keep audio engines synced with settings
  useEffect(() => {
    soundEngine.setSoundEnabled(settings.soundEnabled);
    commentator.setMuted(!settings.commentaryEnabled);
    commentator.setLanguage(settings.commentaryLanguage);
  }, [settings.soundEnabled, settings.commentaryEnabled, settings.commentaryLanguage]);

  // Initialize or Re-initialize Game Engine
  const startMatch = (mode: GameMode, home = userTeam, away = opponentTeam) => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }

    if (!canvasMountRef.current) return;

    setGameMode(mode);
    setHomeScore(0);
    setAwayScore(0);
    setMatchMinute(0);
    setMatchSecond(0);
    setCurrentHalf(1);
    setPeriodStatus(mode === 'penalty' ? 'playing' : 'kickoff');
    setIsPaused(false);
    setShowMatchSummary(false);
    setGoalEvent(null);
    setPenaltyRoundsHome([null, null, null, null, null]);
    setPenaltyRoundsAway([null, null, null, null, null]);

    const engine = new GameEngine(
      canvasMountRef.current,
      home,
      away,
      mode,
      settings,
      {
        onScoreUpdate: (h, a) => {
          setHomeScore(h);
          setAwayScore(a);
        },
        onTimeUpdate: (min, sec, half) => {
          setMatchMinute(min);
          setMatchSecond(sec);
          setCurrentHalf(half);
        },
        onGoal: (scorer, teamId, speed) => {
          setGoalEvent({ scorerName: scorer, teamId, shotSpeedKmh: speed });
          setTimeout(() => setGoalEvent(null), 4000);
        },
        onMatchPeriodChange: period => {
          setPeriodStatus(period);
          if (period === 'halftime' || period === 'fulltime') {
            if (engineRef.current) {
              setMatchStats({ ...engineRef.current.matchStats });
            }
            setShowMatchSummary(true);
          }
        },
        onControlledPlayerChange: (p, stamina) => {
          setControlledPlayer(p);
          setControlledStamina(stamina);
        },
        onPowerMeterChange: (power, actionType) => {
          setPowerMeter({ power, actionType });
        },
        onPenaltyRoundUpdate: (_userTurn, homeRounds, awayRounds) => {
          setPenaltyRoundsHome([...homeRounds]);
          setPenaltyRoundsAway([...awayRounds]);
        },
      }
    );

    engineRef.current = engine;
    setActiveScreen('match');
  };

  // Launch initial engine for Menu background preview
  useEffect(() => {
    if (!canvasMountRef.current) return;

    if (!engineRef.current) {
      const engine = new GameEngine(
        canvasMountRef.current,
        userTeam,
        opponentTeam,
        'quick',
        settings,
        {
          onScoreUpdate: (h, a) => {
            setHomeScore(h);
            setAwayScore(a);
          },
          onTimeUpdate: (min, sec, half) => {
            setMatchMinute(min);
            setMatchSecond(sec);
            setCurrentHalf(half);
          },
          onGoal: (scorer, teamId, speed) => {
            setGoalEvent({ scorerName: scorer, teamId, shotSpeedKmh: speed });
          },
          onMatchPeriodChange: period => {
            setPeriodStatus(period);
          },
          onControlledPlayerChange: (p, stamina) => {
            setControlledPlayer(p);
            setControlledStamina(stamina);
          },
          onPowerMeterChange: (power, actionType) => {
            setPowerMeter({ power, actionType });
          },
        }
      );
      engineRef.current = engine;
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  // Sync penalty aim oscillation
  useEffect(() => {
    if (activeScreen === 'match' && (gameMode === 'penalty' || periodStatus === 'penalty_shootout')) {
      const interval = setInterval(() => {
        if (engineRef.current) {
          setPenaltyAimX(engineRef.current.penaltyAimX);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [activeScreen, gameMode, periodStatus]);

  const handlePauseToggle = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    if (engineRef.current) {
      engineRef.current.setPaused(nextPaused);
    }
  };

  const handleCameraCycle = () => {
    const modes: ('tele' | 'dynamic' | 'topdown' | 'endtoend')[] = ['tele', 'dynamic', 'topdown', 'endtoend'];
    const nextIdx = (modes.indexOf(settings.cameraMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    const newSettings = { ...settings, cameraMode: nextMode };
    setSettings(newSettings);
    if (engineRef.current) {
      engineRef.current.settings = newSettings;
    }
  };

  const handleSoundToggle = () => {
    const enabled = !settings.soundEnabled;
    const newSettings = { ...settings, soundEnabled: enabled };
    setSettings(newSettings);
    soundEngine.setSoundEnabled(enabled);
    if (engineRef.current) {
      engineRef.current.settings = newSettings;
    }
  };

  const handleCommentaryToggle = () => {
    const enabled = !settings.commentaryEnabled;
    const newSettings = { ...settings, commentaryEnabled: enabled };
    setSettings(newSettings);
    commentator.setMuted(!enabled);
    if (engineRef.current) {
      engineRef.current.settings = newSettings;
    }
  };

  const handleExitToMenu = () => {
    setShowMatchSummary(false);
    setIsPaused(false);
    setActiveScreen('menu');
    if (engineRef.current) {
      engineRef.current.setupPeriod('kickoff');
      engineRef.current.setPaused(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. 3D WebGL Canvas Viewport Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full z-0 pointer-events-auto" />

      {/* 2. Main Menu Overlay */}
      {activeScreen === 'menu' && (
        <MainMenu
          userTeam={userTeam}
          opponentTeam={opponentTeam}
          matchPlayMode={settings.matchPlayMode}
          onSelectUserTeam={handleUpdateUserTeam}
          onSelectOpponentTeam={setOpponentTeam}
          onSelectPlayMode={pm => {
            const newSettings = { ...settings, matchPlayMode: pm };
            setSettings(newSettings);
            if (engineRef.current) engineRef.current.settings = newSettings;
          }}
          onStartGame={mode => startMatch(mode)}
          onOpenSquadManagement={() => setShowSquadModal(true)}
          onOpenClubCustomizer={() => setShowClubModal(true)}
          onOpenTransferMarket={() => setShowTransferMarket(true)}
          onOpenFriendMatch={() => setShowFriendMatch(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenTournament={() => setShowTournamentModal(true)}
          soundEnabled={settings.soundEnabled}
          onSoundToggle={handleSoundToggle}
        />
      )}

      {/* 3. In-Game Match View Overlay */}
      {activeScreen === 'match' && (
        <>
          {/* Live Scoreboard HUD */}
          <ScoreboardHUD
            engine={engineRef.current}
            homeTeam={userTeam}
            awayTeam={opponentTeam}
            homeScore={homeScore}
            awayScore={awayScore}
            matchMinute={matchMinute}
            matchSecond={matchSecond}
            currentHalf={currentHalf}
            periodStatus={periodStatus}
            controlledPlayer={controlledPlayer}
            controlledStamina={controlledStamina}
            powerMeter={powerMeter}
            goalEvent={goalEvent}
            onPauseToggle={handlePauseToggle}
            isPaused={isPaused}
            onCameraCycle={handleCameraCycle}
            soundEnabled={settings.soundEnabled}
            onSoundToggle={handleSoundToggle}
            commentaryEnabled={settings.commentaryEnabled}
            onCommentaryToggle={handleCommentaryToggle}
            showRadar={settings.showRadar}
            matchPlayMode={settings.matchPlayMode}
          />

          {/* Penalty Shootout Overlay (Active during Penalty Mode OR during Post-Extra-Time Tiebreaker) */}
          {(gameMode === 'penalty' || periodStatus === 'penalty_shootout') && (
            <PenaltyOverlay
              engine={engineRef.current}
              homeScore={homeScore}
              awayScore={awayScore}
              penaltyAimX={penaltyAimX}
              roundsHome={penaltyRoundsHome}
              roundsAway={penaltyRoundsAway}
              isUserShooting={true}
              onShoot={() => {
                if (engineRef.current) {
                  engineRef.current.startCharge(1, 'shoot');
                  setTimeout(() => {
                    engineRef.current?.executeChargedAction(1);
                  }, 200);
                }
              }}
            />
          )}

          {/* On-screen Touch Controls (Virtual Joystick & Action Buttons) */}
          <TouchControls engine={engineRef.current} />

          {/* In-Game Pause Menu Modal */}
          {isPaused && (
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
              <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 flex flex-col items-center gap-4 text-slate-100">
                <h3 className="font-athletic text-3xl font-black uppercase tracking-wider text-white">
                  Match Paused
                </h3>
                <div className="w-full flex flex-col gap-2.5 mt-2">
                  <button
                    onClick={handlePauseToggle}
                    className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume Match</span>
                  </button>

                  <button
                    onClick={handleCommentaryToggle}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <span>🎙️ Commentary ({settings.commentaryEnabled ? 'ON' : 'OFF'})</span>
                  </button>

                  <button
                    onClick={handleCameraCycle}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Camera Angle ({settings.cameraMode})</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowSquadModal(true);
                      handlePauseToggle();
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all border border-slate-700"
                  >
                    Tactics & Substitutions
                  </button>

                  <button
                    onClick={() => startMatch(gameMode)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restart Match</span>
                  </button>

                  <button
                    onClick={handleExitToMenu}
                    className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-bold text-xs transition-all border border-rose-800/60 flex items-center justify-center gap-2 mt-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>Quit to Main Menu</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. Squad & Tactics Modal */}
      {showSquadModal && (
        <TeamManagementModal
          team={userTeam}
          onUpdateTeam={handleUpdateUserTeam}
          onClose={() => setShowSquadModal(false)}
        />
      )}

      {/* 5. Custom Club & Kit Creator Modal */}
      {showClubModal && (
        <CustomClubModal
          initialClub={userTeam}
          onSaveClub={handleUpdateUserTeam}
          onClose={() => setShowClubModal(false)}
        />
      )}

      {/* 6. Transfer Market Modal */}
      {showTransferMarket && (
        <TransferMarketModal
          userTeam={userTeam}
          onUpdateUserTeam={handleUpdateUserTeam}
          onClose={() => setShowTransferMarket(false)}
        />
      )}

      {/* 7. Friend Match Online Remote Modal */}
      {showFriendMatch && (
        <FriendMatchModal
          userTeam={userTeam}
          onStartOnlineMatch={(role, roomId, remoteTeam) => {
            setShowFriendMatch(false);
            setOpponentTeam(remoteTeam);
            startMatch('friend', userTeam, remoteTeam);
          }}
          onClose={() => setShowFriendMatch(false)}
        />
      )}

      {/* 8. Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* 9. Tournament Mode Modal */}
      {showTournamentModal && (
        <TournamentModal
          userTeam={userTeam}
          onStartTournamentMatch={(home, away) => {
            setShowTournamentModal(false);
            startMatch('tournament', home, away);
          }}
          onClose={() => setShowTournamentModal(false)}
        />
      )}

      {/* 10. Half-time & Full-time Match Summary Modal */}
      {showMatchSummary && matchStats && (
        <MatchSummaryModal
          isHalfTime={periodStatus === 'halftime'}
          homeTeam={userTeam}
          awayTeam={opponentTeam}
          homeScore={homeScore}
          awayScore={awayScore}
          stats={matchStats}
          onContinue={() => {
            setShowMatchSummary(false);
            if (periodStatus === 'halftime') {
              if (engineRef.current) {
                engineRef.current.setupPeriod('kickoff');
                engineRef.current.periodStatus = 'playing';
              }
            } else {
              handleExitToMenu();
            }
          }}
          onRematch={() => startMatch(gameMode)}
          onExitToMenu={handleExitToMenu}
        />
      )}
    </div>
  );
}
