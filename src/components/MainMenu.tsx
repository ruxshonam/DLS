import React, { useState } from 'react';
import { TeamData, GameMode, MatchPlayMode } from '../types/game';
import { INITIAL_TEAMS } from '../data/teamsData';
import { Play, Trophy, Target, Dumbbell, Shield, Users, Settings as SettingsIcon, Volume2, VolumeX, ChevronRight, Globe, ShoppingBag, UserCheck, Bot } from 'lucide-react';

interface MainMenuProps {
  userTeam: TeamData;
  opponentTeam: TeamData;
  matchPlayMode: MatchPlayMode;
  onSelectUserTeam: (team: TeamData) => void;
  onSelectOpponentTeam: (team: TeamData) => void;
  onSelectPlayMode: (mode: MatchPlayMode) => void;
  onStartGame: (mode: GameMode) => void;
  onOpenSquadManagement: () => void;
  onOpenClubCustomizer: () => void;
  onOpenTransferMarket: () => void;
  onOpenFriendMatch: () => void;
  onOpenSettings: () => void;
  onOpenTournament: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  userTeam,
  opponentTeam,
  matchPlayMode,
  onSelectUserTeam,
  onSelectOpponentTeam,
  onSelectPlayMode,
  onStartGame,
  onOpenSquadManagement,
  onOpenClubCustomizer,
  onOpenTransferMarket,
  onOpenFriendMatch,
  onOpenSettings,
  onOpenTournament,
  soundEnabled,
  onSoundToggle,
}) => {
  const [showTeamSelector, setShowTeamSelector] = useState<'user' | 'opponent' | null>(null);

  const calculateOvr = (team: TeamData) => {
    const starters = team.players.slice(0, 11);
    return Math.round(starters.reduce((acc, p) => acc + p.rating, 0) / starters.length);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto">
      {/* Top Bar: Brand, Current Club, and Utility Actions */}
      <header className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg border border-white/20">
            <span className="font-athletic text-2xl font-black text-white">DL</span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-athletic text-2xl sm:text-3xl font-black tracking-wider text-white uppercase leading-none">
              Dream League <span className="text-sky-400">3D</span>
            </h1>
            <span className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5">
              Pro Football Simulation
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation / Club Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTeamSelector('user')}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/15 transition-all shadow-md group"
          >
            <div
              className="w-4 h-4 rounded-full border border-white/30"
              style={{ backgroundColor: userTeam.primaryColor }}
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                {userTeam.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                OVR {calculateOvr(userTeam)} · {userTeam.formation}
              </span>
            </div>
          </button>

          <button
            onClick={onSoundToggle}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/15 transition-colors shadow-md"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/15 transition-colors shadow-md"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="my-auto py-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">
        {/* Play Mode Selector: 1 Player (vs Bot) or 2 Players (Local 1v1 on 1 PC) */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-white/15 shadow-xl backdrop-blur-sm">
            <button
              onClick={() => onSelectPlayMode('1player')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                matchPlayMode === '1player'
                  ? 'bg-sky-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>1 O&apos;yinchi (Bot / AI)</span>
            </button>

            <button
              onClick={() => onSelectPlayMode('2players_local')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                matchPlayMode === '2players_local'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>2 O&apos;yinchi (1 Kompyuter / Klaviatura)</span>
            </button>
          </div>
        </div>

        {/* Matchup Showcase Bar */}
        <div className="relative rounded-2xl p-6 bg-slate-950/75 border border-white/15 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
          {/* Home / User Team */}
          <div
            onClick={() => setShowTeamSelector('user')}
            className="flex items-center gap-4 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-athletic font-black text-2xl text-white border-2 border-white/30 shadow-xl"
              style={{ backgroundColor: userTeam.primaryColor }}
            >
              <span className={userTeam.primaryColor === '#FFFFFF' ? 'text-slate-900' : 'text-white'}>
                {userTeam.shortName}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                {matchPlayMode === '2players_local' ? '1-O\'YINCHI (P1)' : 'YOUR CLUB'}
              </span>
              <h2 className="font-athletic text-2xl font-black text-white uppercase">
                {userTeam.name}
              </h2>
              <span className="text-xs text-slate-400 font-mono-numbers">
                Rating: <strong className="text-amber-400">{calculateOvr(userTeam)}</strong> · {userTeam.stadiumName}
              </span>
            </div>
          </div>

          {/* Central VS Badge & Primary Kick Off Action */}
          <div className="flex flex-col items-center">
            <span className="font-athletic text-3xl font-black text-slate-500 italic mb-2">
              VS
            </span>
            <button
              onClick={() => onStartGame('quick')}
              className="flex items-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-400 hover:to-blue-500 text-white font-athletic text-2xl font-black uppercase tracking-wider shadow-2xl transition-all transform hover:scale-105 active:scale-95 border border-sky-300/40"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>KICK OFF</span>
            </button>
            <span className="text-[10px] text-slate-400 mt-1 font-mono-numbers">
              {matchPlayMode === '2players_local' ? 'Local 1v1 on 1 PC' : 'vs Intelligent AI'}
            </span>
          </div>

          {/* Opponent Team */}
          <div
            onClick={() => setShowTeamSelector('opponent')}
            className="flex items-center gap-4 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors text-right"
          >
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                {matchPlayMode === '2players_local' ? '2-O\'YINCHI (P2)' : 'OPPONENT (AI)'}
              </span>
              <h2 className="font-athletic text-2xl font-black text-white uppercase">
                {opponentTeam.name}
              </h2>
              <span className="text-xs text-slate-400 font-mono-numbers">
                Rating: <strong className="text-amber-400">{calculateOvr(opponentTeam)}</strong> · {opponentTeam.country}
              </span>
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-athletic font-black text-2xl text-white border-2 border-white/30 shadow-xl"
              style={{ backgroundColor: opponentTeam.primaryColor }}
            >
              <span className={opponentTeam.primaryColor === '#FFFFFF' ? 'text-slate-900' : 'text-white'}>
                {opponentTeam.shortName}
              </span>
            </div>
          </div>
        </div>

        {/* Game Modes Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Quick Match */}
          <div
            onClick={() => onStartGame('quick')}
            className="group relative rounded-xl p-5 bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-sky-400/50 shadow-xl transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-athletic text-xl font-black text-white uppercase tracking-wide">
                Quick Match
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Autlar, burchak to&apos;plari, podkatlar va qoidalar bilan to&apos;liq match.
              </p>
            </div>
          </div>

          {/* 2. Tournament Mode */}
          <div
            onClick={onOpenTournament}
            className="group relative rounded-xl p-5 bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-amber-400/50 shadow-xl transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                <Trophy className="w-5 h-5" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-athletic text-xl font-black text-white uppercase tracking-wide">
                Tournament Cup
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                8 jamoali kubok bosqichi: 1/4 final, yarim final va Grand Final.
              </p>
            </div>
          </div>

          {/* 3. Penalty Shootout */}
          <div
            onClick={() => onStartGame('penalty')}
            className="group relative rounded-xl p-5 bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-rose-400/50 shadow-xl transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-400/30">
                <Target className="w-5 h-5" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-athletic text-xl font-black text-white uppercase tracking-wide">
                Penalty Shootout
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                5 tadan penalti tepish va darvozabon sakrashlari.
              </p>
            </div>
          </div>

          {/* 4. Friend Match (Online Remote Room) */}
          <div
            onClick={onOpenFriendMatch}
            className="group relative rounded-xl p-5 bg-gradient-to-br from-indigo-950/80 to-slate-900/80 hover:from-indigo-900/80 hover:to-slate-800/90 border border-indigo-500/30 hover:border-indigo-400 shadow-xl transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30">
                <Globe className="w-5 h-5" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-athletic text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
                <span>Friend Match</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-mono">ONLINE</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Do&apos;stlar bilan 6 xonali kod orqali masofadan ulanib o&apos;ynash.
              </p>
            </div>
          </div>
        </div>

        {/* Club Operations Action Bar: Squad, Kit Creator, and Transfer Market */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={onOpenSquadManagement}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-900/85 hover:bg-slate-800/90 border border-white/15 transition-all shadow-lg text-left group"
          >
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-sky-400" />
              <div>
                <h4 className="font-athletic text-lg font-black text-white uppercase">
                  Squad & Taktika
                </h4>
                <p className="text-xs text-slate-400">
                  Ism, raqam va tarkibni almashtirish (Saqlanadi).
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
          </button>

          <button
            onClick={onOpenTransferMarket}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-900/85 hover:bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 transition-all shadow-lg text-left group"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-amber-400" />
              <div>
                <h4 className="font-athletic text-lg font-black text-white uppercase">
                  Transfer Bozori
                </h4>
                <p className="text-xs text-slate-400">
                  Yulduz futbolchilarni sotib olish va jamoa.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
          </button>

          <button
            onClick={onOpenClubCustomizer}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-900/85 hover:bg-slate-800/90 border border-white/15 transition-all shadow-lg text-left group"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-emerald-400" />
              <div>
                <h4 className="font-athletic text-lg font-black text-white uppercase">
                  Klub & Forma Yaratish
                </h4>
                <p className="text-xs text-slate-400">
                  Forma ranglari, chiziqlar, stadion nomi.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Footer Controls & Copyright */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>Dream League 3D v2.0</span>
          <span>·</span>
          <span>Haqiqiy 11v11 Qoidalar (Aut, Burchak, Podkat, Kartochkalar, Penalti, Sharhlovchi)</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>P1: <strong className="text-white">WASD + SPACE + X + Q + C</strong></span>
          <span>·</span>
          <span>P2: <strong className="text-white">ARROWS + L + K + I + O</strong></span>
        </div>
      </footer>

      {/* Team Selection Drawer Modal */}
      {showTeamSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-athletic text-2xl font-black uppercase tracking-wider text-white">
                {showTeamSelector === 'user' ? 'Jamoangizni Tanlang' : 'Raqib Jamoani Tanlang'}
              </h3>
              <button
                onClick={() => setShowTeamSelector(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Yopish
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 overflow-y-auto">
              {INITIAL_TEAMS.map(team => {
                const isSelected =
                  showTeamSelector === 'user'
                    ? userTeam.id === team.id
                    : opponentTeam.id === team.id;

                return (
                  <div
                    key={team.id}
                    onClick={() => {
                      if (showTeamSelector === 'user') onSelectUserTeam(team);
                      else onSelectOpponentTeam(team);
                      setShowTeamSelector(null);
                    }}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-400 ring-1 ring-sky-400'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-athletic font-black text-lg text-white border border-white/20 shadow"
                      style={{ backgroundColor: team.primaryColor }}
                    >
                      <span className={team.primaryColor === '#FFFFFF' ? 'text-slate-900' : 'text-white'}>
                        {team.shortName}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white">{team.name}</span>
                      <span className="text-xs text-slate-400 font-mono-numbers">
                        Rating: <strong className="text-amber-400">{calculateOvr(team)}</strong> · {team.country}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
