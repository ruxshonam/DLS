import React from 'react';
import { GameEngine } from '../game/gameEngine';
import { Target, Check, X } from 'lucide-react';

interface PenaltyOverlayProps {
  engine: GameEngine | null;
  homeScore: number;
  awayScore: number;
  penaltyAimX: number; // -1 to 1
  roundsHome: (boolean | null)[];
  roundsAway: (boolean | null)[];
  isUserShooting: boolean;
  onShoot: () => void;
}

export const PenaltyOverlay: React.FC<PenaltyOverlayProps> = ({
  engine,
  penaltyAimX,
  roundsHome,
  roundsAway,
  isUserShooting,
  onShoot,
}) => {
  // Map aimX (-1 to 1) to screen percentage (30% to 70%)
  const aimLeftPct = 50 + penaltyAimX * 24;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col items-center justify-between p-6 z-20">
      {/* Top Penalty Score Trackers */}
      <div className="flex flex-col items-center gap-2 p-3 rounded-xl hud-panel border border-white/20 shadow-2xl pointer-events-auto">
        <span className="text-xs font-athletic font-bold uppercase tracking-widest text-amber-400">
          Penalty Shootout
        </span>
        <div className="flex items-center gap-8">
          {/* Home team kicks */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white mr-1">HOME</span>
            {roundsHome.map((res, idx) => (
              <div
                key={idx}
                className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold ${
                  res === true
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : res === false
                    ? 'bg-rose-600 border-rose-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {res === true ? <Check className="w-3.5 h-3.5" /> : res === false ? <X className="w-3.5 h-3.5" /> : idx + 1}
              </div>
            ))}
          </div>

          <span className="text-sm font-black text-slate-500">VS</span>

          {/* Away team kicks */}
          <div className="flex items-center gap-1.5">
            {roundsAway.map((res, idx) => (
              <div
                key={idx}
                className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold ${
                  res === true
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : res === false
                    ? 'bg-rose-600 border-rose-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {res === true ? <Check className="w-3.5 h-3.5" /> : res === false ? <X className="w-3.5 h-3.5" /> : idx + 1}
              </div>
            ))}
            <span className="text-xs font-bold text-white ml-1">AWAY</span>
          </div>
        </div>
      </div>

      {/* Goal Aim Reticle (Simulating Goal Target) */}
      <div className="relative w-full max-w-xl h-36 border-2 border-dashed border-white/30 rounded-t-xl bg-sky-950/20 flex items-center justify-center">
        {/* Crossbar & Posts Graphic */}
        <div className="absolute top-0 inset-x-0 h-2 bg-white/60 shadow" />
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-white/60 shadow" />
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-white/60 shadow" />

        {/* Dynamic Aim Crosshair */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: `${aimLeftPct}%`, top: '45%' }}
        >
          <div className="relative flex items-center justify-center">
            <Target className="w-10 h-10 text-rose-500 animate-spin-slow drop-shadow-md" />
            <div className="absolute w-2 h-2 rounded-full bg-rose-400" />
          </div>
        </div>
      </div>

      {/* Bottom Penalty Trigger */}
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        <button
          onClick={onShoot}
          className="px-10 py-3 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-athletic text-2xl font-black uppercase tracking-widest shadow-2xl border-2 border-rose-300 transition-all"
        >
          STRIKE BALL [SPACE]
        </button>
        <span className="text-xs text-slate-300 font-medium">
          Time your shot as the target aligns with the corners!
        </span>
      </div>
    </div>
  );
};
