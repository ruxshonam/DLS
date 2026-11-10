import React, { useState } from 'react';
import { TeamData, TournamentMatch, TournamentState } from '../types/game';
import { INITIAL_TEAMS } from '../data/teamsData';
import { Trophy, Play, X, Award, ChevronRight } from 'lucide-react';

interface TournamentModalProps {
  userTeam: TeamData;
  onStartTournamentMatch: (homeTeam: TeamData, awayTeam: TeamData) => void;
  onClose: () => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  userTeam,
  onStartTournamentMatch,
  onClose,
}) => {
  // Generate 8-team single-elimination tournament
  const [tournament, setTournament] = useState<TournamentState>(() => {
    // Pick 7 other teams
    const opponents = INITIAL_TEAMS.filter(t => t.id !== userTeam.id).slice(0, 7);
    const all8 = [userTeam, ...opponents];

    // Quarter-finals (4 matches)
    const qfMatches: TournamentMatch[] = [
      { id: 'qf1', round: 'quarter', homeTeam: all8[0], awayTeam: all8[1], played: false },
      { id: 'qf2', round: 'quarter', homeTeam: all8[2], awayTeam: all8[3], played: false },
      { id: 'qf3', round: 'quarter', homeTeam: all8[4], awayTeam: all8[5], played: false },
      { id: 'qf4', round: 'quarter', homeTeam: all8[6], awayTeam: all8[7], played: false },
    ];

    return {
      currentRound: 'quarter',
      matches: qfMatches,
      userTeamId: userTeam.id,
    };
  });

  const [isChampion, setIsChampion] = useState(false);

  // Find user's current match in active round
  const userMatch = tournament.matches.find(
    m => m.round === tournament.currentRound && (m.homeTeam.id === userTeam.id || m.awayTeam.id === userTeam.id)
  );

  const simulateAiMatch = (m: TournamentMatch) => {
    const homeGoals = Math.floor(Math.random() * 3);
    let awayGoals = Math.floor(Math.random() * 3);
    if (homeGoals === awayGoals) {
      awayGoals = Math.random() > 0.5 ? homeGoals + 1 : Math.max(0, homeGoals - 1);
    }
    const winner = homeGoals > awayGoals ? m.homeTeam : m.awayTeam;
    return {
      ...m,
      homeScore: homeGoals,
      awayScore: awayGoals,
      winnerTeamId: winner.id,
      played: true,
    };
  };

  const advanceTournamentRound = () => {
    // If Quarter-finals finished -> setup Semi-finals
    if (tournament.currentRound === 'quarter') {
      const qfPlayed = tournament.matches.map(m => (m.played ? m : simulateAiMatch(m)));
      const winner1 = qfPlayed[0].winnerTeamId === qfPlayed[0].homeTeam.id ? qfPlayed[0].homeTeam : qfPlayed[0].awayTeam;
      const winner2 = qfPlayed[1].winnerTeamId === qfPlayed[1].homeTeam.id ? qfPlayed[1].homeTeam : qfPlayed[1].awayTeam;
      const winner3 = qfPlayed[2].winnerTeamId === qfPlayed[2].homeTeam.id ? qfPlayed[2].homeTeam : qfPlayed[2].awayTeam;
      const winner4 = qfPlayed[3].winnerTeamId === qfPlayed[3].homeTeam.id ? qfPlayed[3].homeTeam : qfPlayed[3].awayTeam;

      const sfMatches: TournamentMatch[] = [
        { id: 'sf1', round: 'semi', homeTeam: winner1, awayTeam: winner2, played: false },
        { id: 'sf2', round: 'semi', homeTeam: winner3, awayTeam: winner4, played: false },
      ];

      setTournament({
        currentRound: 'semi',
        matches: [...qfPlayed, ...sfMatches],
        userTeamId: userTeam.id,
      });
    } else if (tournament.currentRound === 'semi') {
      const sfMatches = tournament.matches.filter(m => m.round === 'semi');
      const sfPlayed = sfMatches.map(m => (m.played ? m : simulateAiMatch(m)));
      const winner1 = sfPlayed[0].winnerTeamId === sfPlayed[0].homeTeam.id ? sfPlayed[0].homeTeam : sfPlayed[0].awayTeam;
      const winner2 = sfPlayed[1].winnerTeamId === sfPlayed[1].homeTeam.id ? sfPlayed[1].homeTeam : sfPlayed[1].awayTeam;

      const finalMatch: TournamentMatch = {
        id: 'final',
        round: 'final',
        homeTeam: winner1,
        awayTeam: winner2,
        played: false,
      };

      setTournament({
        currentRound: 'final',
        matches: [...tournament.matches.filter(m => m.round !== 'semi'), ...sfPlayed, finalMatch],
        userTeamId: userTeam.id,
      });
    } else if (tournament.currentRound === 'final') {
      setIsChampion(true);
    }
  };

  const handlePlayUserMatch = () => {
    if (!userMatch) return;
    onStartTournamentMatch(userMatch.homeTeam, userMatch.awayTeam);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-athletic text-2xl font-black uppercase tracking-wider text-white">
                Dream Champions Cup
              </h2>
              <p className="text-xs text-slate-400">
                8 Teams Knockout Tournament · Round: <span className="text-amber-400 font-bold uppercase">{tournament.currentRound}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bracket Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {isChampion ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="w-24 h-24 text-amber-400 animate-bounce mb-4" />
              <h3 className="font-athletic text-4xl font-black text-amber-300 tracking-widest uppercase">
                Tournament Champions!
              </h3>
              <p className="text-base text-slate-300 mt-2 max-w-md">
                Congratulations! <strong>{userTeam.name}</strong> has lifted the Dream Champions Trophy!
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black tracking-wider text-sm transition-all shadow-xl"
              >
                Back to Menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quarter Finals */}
              <div className="flex flex-col gap-3">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Quarter-Finals
                </span>
                <div className="flex flex-col gap-2.5">
                  {tournament.matches
                    .filter(m => m.round === 'quarter')
                    .map(m => {
                      const isUserMatch = m.homeTeam.id === userTeam.id || m.awayTeam.id === userTeam.id;
                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 transition-all ${
                            isUserMatch
                              ? 'bg-sky-950/40 border-sky-400/80 ring-1 ring-sky-400/40'
                              : 'bg-slate-950/70 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white truncate max-w-[130px]">
                              {m.homeTeam.name}
                            </span>
                            <span className="font-mono-numbers font-black text-slate-300">
                              {m.played ? m.homeScore : '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white truncate max-w-[130px]">
                              {m.awayTeam.name}
                            </span>
                            <span className="font-mono-numbers font-black text-slate-300">
                              {m.played ? m.awayScore : '-'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Semi Finals */}
              <div className="flex flex-col gap-3">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Semi-Finals
                </span>
                <div className="flex flex-col gap-6 justify-center h-full">
                  {['sf1', 'sf2'].map((id, idx) => {
                    const m = tournament.matches.find(match => match.id === id);
                    if (!m) {
                      return (
                        <div key={id} className="p-4 rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-600">
                          TBD vs TBD
                        </div>
                      );
                    }
                    const isUserMatch = m.homeTeam.id === userTeam.id || m.awayTeam.id === userTeam.id;
                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                          isUserMatch
                            ? 'bg-sky-950/40 border-sky-400/80 ring-1 ring-sky-400/40'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate max-w-[130px]">
                            {m.homeTeam.name}
                          </span>
                          <span className="font-mono-numbers font-black text-slate-300">
                            {m.played ? m.homeScore : '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white truncate max-w-[130px]">
                            {m.awayTeam.name}
                          </span>
                          <span className="font-mono-numbers font-black text-slate-300">
                            {m.played ? m.awayScore : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Final */}
              <div className="flex flex-col gap-3">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  Cup Final
                </span>
                <div className="flex flex-col justify-center h-full">
                  {(() => {
                    const m = tournament.matches.find(match => match.round === 'final');
                    if (!m) {
                      return (
                        <div className="p-6 rounded-xl border border-dashed border-amber-900/50 bg-amber-950/10 text-center text-xs text-amber-500/70 flex flex-col items-center gap-2">
                          <Trophy className="w-8 h-8 opacity-40" />
                          <span>Grand Final Waiting</span>
                        </div>
                      );
                    }
                    return (
                      <div className="p-4 rounded-xl border border-amber-500/70 bg-gradient-to-b from-amber-950/40 to-slate-950 text-xs flex flex-col gap-2 shadow-2xl">
                        <div className="flex items-center justify-center gap-2 text-amber-300 font-bold mb-1">
                          <Award className="w-4 h-4" />
                          <span>Championship Decider</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-black text-white">{m.homeTeam.name}</span>
                          <span className="font-mono-numbers font-black text-amber-400 text-base">
                            {m.played ? m.homeScore : '-'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-black text-white">{m.awayTeam.name}</span>
                          <span className="font-mono-numbers font-black text-amber-400 text-base">
                            {m.played ? m.awayScore : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isChampion && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
            <button
              onClick={advanceTournamentRound}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Simulate AI Bracket Round
            </button>

            {userMatch && !userMatch.played ? (
              <button
                onClick={handlePlayUserMatch}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-black text-sm tracking-wide transition-all shadow-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Match: vs {userMatch.homeTeam.id === userTeam.id ? userMatch.awayTeam.name : userMatch.homeTeam.name}</span>
              </button>
            ) : (
              <button
                onClick={advanceTournamentRound}
                className="flex items-center gap-1.5 px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
              >
                <span>Advance to Next Round</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
