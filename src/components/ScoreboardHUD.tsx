import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { TeamData, PlayerData } from '../types/game';
import { RadarMap } from './RadarMap';
import { GameEngine } from '../game/gameEngine';
import { Pause, Play, Volume2, VolumeX, Eye } from 'lucide-react';

interface ScoreboardHUDProps {
  engine: GameEngine | null;
  homeTeam: TeamData;
  awayTeam: TeamData;
  homeScore: number;
  awayScore: number;
  matchMinute: number;
  matchSecond: number;
  currentHalf: 1 | 2 | 'extra' | 'penalties' | 'ended';
  periodStatus: 'kickoff' | 'playing' | 'halftime' | 'fulltime' | 'extra_time_1' | 'extra_time_2' | 'penalty_shootout' | 'goal_replay' | 'throw_in' | 'corner_kick' | 'goal_kick' | 'free_kick';
  controlledPlayer: PlayerData | null;
  controlledStamina: number;
  powerMeter: { power: number; actionType: 'shoot' | 'pass' | 'through' };
  goalEvent: { scorerName: string; teamId: string; shotSpeedKmh: number } | null;
  onPauseToggle: () => void;
  isPaused: boolean;
  onCameraCycle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  commentaryEnabled: boolean;
  onCommentaryToggle: () => void;
  showRadar: boolean;
  matchPlayMode?: string;
}

export const ScoreboardHUD: React.FC<ScoreboardHUDProps> = ({
  engine,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  matchMinute,
  matchSecond,
  currentHalf,
  periodStatus,
  controlledPlayer,
  controlledStamina,
  powerMeter,
  goalEvent,
  onPauseToggle,
  isPaused,
  onCameraCycle,
  soundEnabled,
  onSoundToggle,
  commentaryEnabled,
  onCommentaryToggle,
  showRadar,
  matchPlayMode,
}) => {
  // Trigger colorful confetti explosion on Goal!
  useEffect(() => {
    if (goalEvent) {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#facc15', '#ef4444', '#10b981', '#ffffff'],
      });
    }
  }, [goalEvent]);

  const formattedTime = `${String(matchMinute).padStart(2, '0')}:${String(matchSecond).padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 z-20">
      {/* Top Header: Scoreboard & Quick Controls */}
      <div className="flex items-start justify-between w-full">
        {/* Broadcast Scoreboard Bar */}
        <div className="flex items-center shadow-2xl rounded-lg overflow-hidden border border-white/20 hud-panel pointer-events-auto">
          {/* Home Team */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/90">
            <div
              className="w-4 h-4 rounded-full border border-white/30 shadow-inner"
              style={{ backgroundColor: homeTeam.primaryColor }}
            />
            <span className="font-athletic text-lg font-black tracking-wider text-white uppercase">
              {homeTeam.shortName}
            </span>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 font-mono-numbers text-xl font-black text-white border-x border-white/10">
            <span className="text-sky-400">{homeScore}</span>
            <span className="text-slate-500 font-light">-</span>
            <span className="text-rose-400">{awayScore}</span>
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/90">
            <span className="font-athletic text-lg font-black tracking-wider text-white uppercase">
              {awayTeam.shortName}
            </span>
            <div
              className="w-4 h-4 rounded-full border border-white/30 shadow-inner"
              style={{ backgroundColor: awayTeam.primaryColor }}
            />
          </div>

          {/* Time & Half Badge */}
          <div className="flex flex-col items-center justify-center px-3 py-1.5 bg-sky-950/80 border-l border-white/10 min-w-[70px]">
            <span className="font-mono-numbers text-sm font-bold text-sky-200">
              {formattedTime}
            </span>
            <span className="text-[9px] font-semibold tracking-wider text-sky-400 uppercase">
              {currentHalf === 'extra' ? (periodStatus === 'extra_time_1' ? '1st ET' : '2nd ET') :
               currentHalf === 'penalties' ? 'Penalties' :
               currentHalf === 1 ? '1st Half' : currentHalf === 2 ? '2nd Half' : 'Match'}
            </span>
          </div>
        </div>

        {/* Top Right Match Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Commentator Audio Toggle */}
          <button
            onClick={onCommentaryToggle}
            className={`p-2 rounded-lg border transition-colors shadow-md flex items-center gap-1.5 text-xs font-bold ${
              commentaryEnabled ? 'bg-indigo-900/80 border-indigo-400 text-indigo-200' : 'bg-slate-900/80 border-white/15 text-slate-400'
            }`}
            title={commentaryEnabled ? 'Sharhlovchini o\'chirish (Mute Commentary)' : 'Sharhlovchini yoqish (Enable Commentary)'}
          >
            <span>🎙️</span>
            <span className="hidden sm:inline text-[10px]">{commentaryEnabled ? 'SHARH ON' : 'SHARH OFF'}</span>
          </button>

          <button
            onClick={onCameraCycle}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/15 transition-colors shadow-md"
            title="Switch Camera View"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={onSoundToggle}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/15 transition-colors shadow-md"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
          </button>
          <button
            onClick={onPauseToggle}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/15 transition-colors shadow-md"
            title={isPaused ? 'Resume Match' : 'Pause Match'}
          >
            {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Out / Corner / Foul / Extra Time Alert Banner */}
      {(['throw_in', 'corner_kick', 'goal_kick', 'free_kick', 'extra_time_1', 'extra_time_2', 'penalty_shootout'].includes(periodStatus)) && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2 rounded-full hud-panel border border-sky-400 shadow-2xl pointer-events-none animate-pulse">
          <span className="font-athletic text-base font-black tracking-wider text-sky-300 uppercase">
            {periodStatus === 'throw_in' ? 'AUT · THROW-IN' :
             periodStatus === 'corner_kick' ? 'BURCHAK TO\'PI · CORNER KICK' :
             periodStatus === 'goal_kick' ? 'DARVOZADAN TEPISH · GOAL KICK' :
             periodStatus === 'free_kick' ? 'JARIMA ZARBASI · FREE KICK' :
             periodStatus === 'extra_time_1' ? '1-QO\'SHIMCHA BO\'LIM · 1ST EXTRA TIME (15s)' :
             periodStatus === 'extra_time_2' ? '2-QO\'SHIMCHA BO\'LIM · 2ND EXTRA TIME (15s)' :
             'PENALTILAR SERIYASI · PENALTY SHOOTOUT'}
          </span>
        </div>
      )}

      {/* Center Action Charge Power Meter */}
      {powerMeter.power > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <span className="text-xs uppercase font-athletic font-bold tracking-widest text-white/90 drop-shadow mb-1">
            {powerMeter.actionType === 'shoot' ? 'Shot Power' : powerMeter.actionType === 'pass' ? 'Pass Power' : 'Through Ball'}
          </span>
          <div className="w-48 h-3.5 rounded-full bg-slate-950/80 p-0.5 border border-white/30 shadow-2xl overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                powerMeter.power > 0.8
                  ? 'bg-rose-500 shadow-rose-500/50'
                  : powerMeter.power > 0.4
                  ? 'bg-amber-400 shadow-amber-400/50'
                  : 'bg-emerald-400 shadow-emerald-400/50'
              }`}
              style={{ width: `${Math.round(powerMeter.power * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Goal Replay Overlay Banner */}
      {periodStatus === 'goal_replay' && goalEvent && (
        <div className="absolute inset-x-0 top-1/3 flex flex-col items-center justify-center pointer-events-none animate-bounce">
          <div className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600/95 via-rose-600/95 to-amber-600/95 border-2 border-yellow-300 shadow-2xl flex flex-col items-center text-center">
            <h2 className="font-athletic text-5xl font-black text-white tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              GOAAAL!
            </h2>
            <p className="text-xl font-bold text-yellow-200 mt-1">
              {goalEvent.scorerName}
            </p>
            <div className="flex items-center gap-3 text-xs text-white/90 mt-1 font-mono-numbers">
              <span>{matchMinute}&apos;</span>
              <span>·</span>
              <span>{goalEvent.shotSpeedKmh} KM/H</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Row: Controlled Player Card + Mini-map Radar */}
      <div className="flex items-end justify-between w-full">
        {/* Controlled Player Info Card */}
        {controlledPlayer && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-white/20 hud-panel shadow-2xl pointer-events-auto">
            <div className="flex flex-col items-center justify-center w-10 h-10 rounded-md bg-slate-800 border border-white/10 font-athletic font-black text-white text-lg">
              <span>{controlledPlayer.number}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-300 border border-sky-400/30">
                  {controlledPlayer.position}
                </span>
                <span className="font-bold text-sm text-white truncate max-w-[140px]">
                  {controlledPlayer.name}
                </span>
                <span className="text-xs font-mono-numbers font-bold text-amber-400">
                  {controlledPlayer.rating}
                </span>
              </div>
              {/* Stamina bar */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] text-slate-400 uppercase font-semibold">STAMINA</span>
                <div className="w-24 h-1.5 rounded-full bg-slate-950 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-100"
                    style={{ width: `${Math.round(controlledStamina)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Center Mini-Map Radar */}
        {showRadar && (
          <div className="hidden sm:block">
            <RadarMap engine={engine} />
          </div>
        )}

        {/* Keyboard Controls Hint */}
        {matchPlayMode === '2players_local' ? (
          <div className="hidden lg:flex flex-col gap-1 text-[10px] text-slate-400 px-3 py-1.5 rounded-md bg-slate-950/80 border border-white/10 font-mono-numbers">
            <div><strong className="text-sky-400">P1:</strong> WASD (Move) · SPACE (Shoot) · X (Pass) · Q (Lob) · C (Podkat) · TAB (Swap)</div>
            <div><strong className="text-amber-400">P2:</strong> ARROWS (Move) · L (Shoot) · K (Pass) · I (Lob) · O (Podkat) · P (Swap)</div>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 px-3 py-1.5 rounded-md bg-slate-950/70 border border-white/10 font-mono-numbers">
            <span><strong className="text-white">WASD</strong> Move</span>
            <span><strong className="text-white">SHIFT</strong> Sprint</span>
            <span><strong className="text-white">SPACE</strong> Shoot</span>
            <span><strong className="text-white">X</strong> Pass</span>
            <span><strong className="text-white">Q</strong> Lob</span>
            <span><strong className="text-white">C</strong> Podkat</span>
            <span><strong className="text-white">TAB</strong> Swap</span>
          </div>
        )}
      </div>
    </div>
  );
};
