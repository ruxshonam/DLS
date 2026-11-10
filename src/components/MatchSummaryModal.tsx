import React from 'react';
import { TeamData, MatchStats } from '../types/game';
import { Trophy, RotateCcw, Home, ArrowRight } from 'lucide-react';

interface MatchSummaryModalProps {
  isHalfTime: boolean;
  homeTeam: TeamData;
  awayTeam: TeamData;
  homeScore: number;
  awayScore: number;
  stats: MatchStats;
  onContinue: () => void;
  onRematch: () => void;
  onExitToMenu: () => void;
}

export const MatchSummaryModal: React.FC<MatchSummaryModalProps> = ({
  isHalfTime,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  stats,
  onContinue,
  onRematch,
  onExitToMenu,
}) => {
  const isHomeWin = homeScore > awayScore;
  const isDraw = homeScore === awayScore;

  // Calculate possession percentage
  const totalPasses = (stats.homePasses + stats.awayPasses) || 1;
  const homePossession = Math.round((stats.homePasses / totalPasses) * 100);
  const awayPossession = 100 - homePossession;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Banner */}
        <div className={`px-6 py-6 text-center border-b border-slate-800 ${
          isHalfTime
            ? 'bg-sky-950/70'
            : isHomeWin
            ? 'bg-gradient-to-r from-emerald-950 via-sky-950 to-emerald-950'
            : isDraw
            ? 'bg-slate-950'
            : 'bg-gradient-to-r from-rose-950 via-slate-950 to-rose-950'
        }`}>
          <span className="text-xs uppercase font-athletic font-bold tracking-widest text-slate-400">
            {isHalfTime ? 'Half-Time Report' : 'Full-Time Result'}
          </span>
          <h2 className="font-athletic text-4xl font-black uppercase tracking-wider text-white mt-1">
            {isHalfTime ? 'Interval' : isHomeWin ? 'Victory!' : isDraw ? 'Draw' : 'Defeat'}
          </h2>

          {/* Big Score Box */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-lg text-white">{homeTeam.name}</span>
              <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: homeTeam.primaryColor }} />
            </div>

            <div className="px-5 py-1.5 rounded-lg bg-slate-950 font-mono-numbers text-3xl font-black text-white border border-white/10 shadow-inner">
              <span className="text-sky-400">{homeScore}</span>
              <span className="text-slate-500 mx-2">-</span>
              <span className="text-rose-400">{awayScore}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: awayTeam.primaryColor }} />
              <span className="font-bold text-lg text-white">{awayTeam.name}</span>
            </div>
          </div>

          {/* Goal Scorers Log */}
          {stats.goals.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs text-slate-300 font-mono-numbers">
              {stats.goals.map((g, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-950/70 border border-white/10">
                  ⚽ {g.scorerName} ({g.minute}&apos;) · {g.shotSpeedKmh}km/h
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Match Statistics Comparison Bars */}
        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
            Match Statistics
          </span>

          {/* Stat Row Generator */}
          {[
            { label: 'Possession', home: `${homePossession}%`, away: `${awayPossession}%`, homeVal: homePossession, awayVal: awayPossession },
            { label: 'Total Shots', home: stats.homeShots, away: stats.awayShots, homeVal: stats.homeShots, awayVal: stats.awayShots },
            { label: 'Shots on Target', home: stats.homeShotsOnTarget, away: stats.awayShotsOnTarget, homeVal: stats.homeShotsOnTarget, awayVal: stats.awayShotsOnTarget },
            { label: 'Passes Completed', home: stats.homePasses, away: stats.awayPasses, homeVal: stats.homePasses, awayVal: stats.awayPasses },
            { label: 'Tackles', home: stats.homeTackles, away: stats.awayTackles, homeVal: stats.homeTackles, awayVal: stats.awayTackles },
          ].map(stat => {
            const sum = (stat.homeVal + stat.awayVal) || 1;
            const homePct = Math.round((stat.homeVal / sum) * 100);
            return (
              <div key={stat.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-mono-numbers font-bold">
                  <span className="text-sky-400">{stat.home}</span>
                  <span className="text-slate-400 font-sans font-semibold text-[11px] uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <span className="text-rose-400">{stat.away}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex border border-white/10">
                  <div
                    className="h-full bg-sky-500 rounded-l-full transition-all duration-300"
                    style={{ width: `${homePct}%` }}
                  />
                  <div
                    className="h-full bg-rose-500 rounded-r-full transition-all duration-300"
                    style={{ width: `${100 - homePct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <button
            onClick={onExitToMenu}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>

          <div className="flex items-center gap-3">
            {!isHalfTime && (
              <button
                onClick={onRematch}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rematch</span>
              </button>
            )}

            <button
              onClick={onContinue}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-black tracking-wider uppercase transition-all shadow-lg"
            >
              <span>{isHalfTime ? 'Start 2nd Half' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
