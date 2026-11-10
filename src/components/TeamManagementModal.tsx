import React, { useState, useEffect } from 'react';
import { TeamData, PlayerData, FormationType, PlayerPosition } from '../types/game';
import { FORMATIONS_COORDINATES, saveUserTeam } from '../data/teamsData';
import { soundEngine } from '../audio/soundEngine';
import { X, ArrowLeftRight, Shield, Check, Edit3, User, Hash, Save, Sparkles } from 'lucide-react';

interface TeamManagementModalProps {
  team: TeamData;
  onUpdateTeam: (updatedTeam: TeamData) => void;
  onClose: () => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  team,
  onUpdateTeam,
  onClose,
}) => {
  const [currentFormation, setCurrentFormation] = useState<FormationType>(team.formation);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(team.players[0]?.id || null);
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string>(team.name);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const starters = team.players.slice(0, 11);
  const subs = team.players.slice(11);

  const selectedPlayer = team.players.find(p => p.id === selectedPlayerId) || team.players[0];

  const triggerSaveNotification = (msg: string) => {
    setSavedNotice(msg);
    soundEngine.playUiClick();
    setTimeout(() => {
      setSavedNotice(null);
    }, 2800);
  };

  const notifyAndSave = (updated: TeamData, noticeMsg?: string) => {
    saveUserTeam(updated);
    onUpdateTeam(updated);
    if (noticeMsg) {
      triggerSaveNotification(noticeMsg);
    }
  };

  // Club Name change
  const handleClubNameChange = (newName: string) => {
    setClubName(newName);
    const updated: TeamData = {
      ...team,
      name: newName.trim() || 'My Football Club',
    };
    notifyAndSave(updated);
  };

  // Formation change
  const handleFormationChange = (form: FormationType) => {
    setCurrentFormation(form);
    const updated: TeamData = {
      ...team,
      formation: form,
    };
    notifyAndSave(updated, `Taktika ${form} ga o'zgartirildi va saqlandi!`);
  };

  // Swapping players
  const handlePlayerClick = (player: PlayerData) => {
    if (swapSourceId) {
      if (swapSourceId !== player.id) {
        // Perform Swap
        const idx1 = team.players.findIndex(p => p.id === swapSourceId);
        const idx2 = team.players.findIndex(p => p.id === player.id);
        if (idx1 !== -1 && idx2 !== -1) {
          const newPlayers = [...team.players];
          const p1 = newPlayers[idx1];
          const p2 = newPlayers[idx2];
          newPlayers[idx1] = p2;
          newPlayers[idx2] = p1;

          const updated: TeamData = {
            ...team,
            players: newPlayers,
          };
          notifyAndSave(updated, `${p1.name} va ${p2.name} almashtirildi va saqlandi!`);
        }
      }
      setSwapSourceId(null);
    } else {
      setSelectedPlayerId(player.id);
    }
  };

  const startSwap = (playerId: string) => {
    setSwapSourceId(playerId);
  };

  // Edit selected player's name
  const handlePlayerNameChange = (newName: string) => {
    if (!selectedPlayer) return;
    const updatedPlayers = team.players.map(p =>
      p.id === selectedPlayer.id ? { ...p, name: newName } : p
    );
    const updated: TeamData = { ...team, players: updatedPlayers };
    notifyAndSave(updated);
  };

  // Edit selected player's jersey number
  const handlePlayerNumberChange = (newNumber: number) => {
    if (!selectedPlayer) return;
    const clamped = Math.max(1, Math.min(99, newNumber || 1));
    const updatedPlayers = team.players.map(p =>
      p.id === selectedPlayer.id ? { ...p, number: clamped } : p
    );
    const updated: TeamData = { ...team, players: updatedPlayers };
    notifyAndSave(updated);
  };

  // Edit selected player's position
  const handlePlayerPositionChange = (newPos: PlayerPosition) => {
    if (!selectedPlayer) return;
    const updatedPlayers = team.players.map(p =>
      p.id === selectedPlayer.id ? { ...p, position: newPos } : p
    );
    const updated: TeamData = { ...team, players: updatedPlayers };
    notifyAndSave(updated, `${selectedPlayer.name} ampluasi ${newPos} ga o'zgartirildi!`);
  };

  // Team averages
  const attPlayers = starters.filter(p => ['ST', 'LW', 'RW'].includes(p.position));
  const midPlayers = starters.filter(p => ['CM', 'CAM', 'CDM', 'LM', 'RM'].includes(p.position));
  const defPlayers = starters.filter(p => ['CB', 'LB', 'RB', 'GK'].includes(p.position));

  const avgRating = (list: PlayerData[]) =>
    list.length ? Math.round(list.reduce((acc, p) => acc + p.rating, 0) / list.length) : 80;

  const formationCoords = FORMATIONS_COORDINATES[currentFormation] || FORMATIONS_COORDINATES['4-3-3'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full border border-white/40 shadow-inner"
              style={{ backgroundColor: team.primaryColor }}
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700">
                <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                <input
                  type="text"
                  value={clubName}
                  onChange={e => handleClubNameChange(e.target.value)}
                  placeholder="Klub nomini kiriting..."
                  maxLength={24}
                  className="font-athletic text-xl font-black uppercase tracking-wider text-white bg-transparent border-none focus:outline-none focus:ring-0 max-w-[200px] sm:max-w-[280px]"
                  title="Klub nomini o'zgartirish uchun yozing"
                />
              </div>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">· Tarkib & Taktika</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-mono-numbers">
              <span>Hujum: <strong className="text-rose-400">{avgRating(attPlayers)}</strong></span>
              <span>Yarim: <strong className="text-amber-400">{avgRating(midPlayers)}</strong></span>
              <span>Himoya: <strong className="text-sky-400">{avgRating(defPlayers)}</strong></span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Saved Alert Banner */}
        {savedNotice && (
          <div className="bg-emerald-600/90 text-white text-xs font-bold py-2 px-6 flex items-center justify-center gap-2 animate-pulse shadow-md">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* Content Body: Tactical Pitch + Bench + Player Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
          {/* Tactical 2D Pitch (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Taktika va O&apos;yinchilar Joylashuvi
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800">
                {(['4-3-3', '4-4-2', '3-5-2', '4-2-3-1'] as FormationType[]).map(f => (
                  <button
                    key={f}
                    onClick={() => handleFormationChange(f)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      currentFormation === f
                        ? 'bg-sky-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch Container */}
            <div className="relative w-full aspect-[4/3] rounded-xl border-2 border-emerald-600/40 bg-gradient-to-b from-emerald-800 to-emerald-950 p-4 shadow-inner overflow-hidden select-none">
              {/* Pitch markings */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white/20 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full border-2 border-white/20 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute inset-x-8 top-0 h-16 border-b-2 border-x-2 border-white/20 rounded-b-lg" />
              <div className="absolute inset-x-8 bottom-0 h-16 border-t-2 border-x-2 border-white/20 rounded-t-lg" />

              {/* Starter Player Nodes positioned on pitch */}
              {starters.map((player, idx) => {
                const coord = formationCoords[idx] || { x: -20, z: 0 };
                const topPct = 90 + (coord.x / 52.5) * 80;
                const leftPct = 50 + (coord.z / 34) * 40;

                const isSelected = selectedPlayerId === player.id;
                const isSwapping = swapSourceId === player.id;

                return (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-transform ${
                      isSwapping ? 'animate-pulse scale-110' : 'hover:scale-105'
                    }`}
                    style={{ top: `${Math.max(10, Math.min(90, topPct))}%`, left: `${Math.max(10, Math.min(90, leftPct))}%` }}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-athletic font-black text-sm text-white shadow-xl border-2 transition-all ${
                        isSelected
                          ? 'border-yellow-300 ring-2 ring-yellow-400/50'
                          : isSwapping
                          ? 'border-rose-400 ring-2 ring-rose-500'
                          : 'border-white/40'
                      }`}
                      style={{ backgroundColor: player.position === 'GK' ? team.gkColor : team.primaryColor }}
                    >
                      <span className={team.primaryColor === '#FFFFFF' && player.position !== 'GK' ? 'text-slate-900' : 'text-white'}>
                        {player.number}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-white bg-slate-950/80 px-1.5 py-0.5 rounded shadow mt-0.5 whitespace-nowrap truncate max-w-[70px]">
                      {player.name.split(' ')[1] || player.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {swapSourceId ? (
              <p className="text-xs text-amber-400 text-center font-medium animate-pulse">
                Almashtirish uchun boshqa o&apos;yinchini bosing (asosiy yoki zaxiradan)
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 text-center">
                O&apos;yinchi ma&apos;lumotini o&apos;zgartirish yoki almashtirish uchun ustiga bosing
              </p>
            )}
          </div>

          {/* Bench & Player Attributes (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Selected Player Card & Name/Number Editor */}
            {selectedPlayer && (
              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 shadow-lg flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-sky-400">
                    Tanlangan O&apos;yinchi Tahriri
                  </span>
                  <button
                    onClick={() => startSwap(selectedPlayer.id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow"
                    title="Boshqa o'yinchi bilan o'rnini almashtirish"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>O&apos;rin Almashtirish</span>
                  </button>
                </div>

                {/* Edit Player Name, Number & Position */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-sky-400" />
                      <span>O&apos;yinchi Ismi (Futbolchi Nomi)</span>
                    </label>
                    <input
                      type="text"
                      value={selectedPlayer.name}
                      onChange={e => handlePlayerNameChange(e.target.value)}
                      placeholder="Futbolchi ismini yozing..."
                      maxLength={24}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-amber-400" />
                        <span>Raqami (#)</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={selectedPlayer.number}
                        onChange={e => handlePlayerNumberChange(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-sky-500 font-mono-numbers"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                        <span>Amplua (Pozitsiya)</span>
                      </label>
                      <select
                        value={selectedPlayer.position}
                        onChange={e => handlePlayerPositionChange(e.target.value as PlayerPosition)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-sky-500"
                      >
                        {(['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'] as PlayerPosition[]).map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Attribute Bars */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono-numbers mt-1 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900">
                    <span className="text-slate-400 font-sans text-[11px]">Tezlik (Pace)</span>
                    <span className="font-bold text-white">{selectedPlayer.attributes.pace}</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900">
                    <span className="text-slate-400 font-sans text-[11px]">Zarba (Shot)</span>
                    <span className="font-bold text-white">{selectedPlayer.attributes.shooting}</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900">
                    <span className="text-slate-400 font-sans text-[11px]">Pas (Pass)</span>
                    <span className="font-bold text-white">{selectedPlayer.attributes.passing}</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900">
                    <span className="text-slate-400 font-sans text-[11px]">Dribling</span>
                    <span className="font-bold text-white">{selectedPlayer.attributes.dribbling}</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900">
                    <span className="text-slate-400 font-sans text-[11px]">Himoya (Def)</span>
                    <span className="font-bold text-white">{selectedPlayer.attributes.defending}</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-900">
                    <span className="text-slate-400 font-sans text-[11px]">Jismoniy (Phy)</span>
                    <span className="font-bold text-white">{selectedPlayer.attributes.physical}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Substitutes Bench */}
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Zaxira Futbolchilari ({subs.length}) · Asosiyga almashtirish uchun bosing
              </span>
              <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                {subs.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => handlePlayerClick(sub)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                      selectedPlayerId === sub.id
                        ? 'bg-slate-800 border-sky-400'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono-numbers">
                        #{sub.number}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-sky-400">
                        {sub.position}
                      </span>
                      <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                        {sub.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono-numbers text-yellow-400">
                      {sub.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Har bir o&apos;zgartirish avtomatik xotirada saqlanadi</span>
          </div>
          <button
            onClick={() => {
              notifyAndSave(team, 'Barcha nomlar va tarkib o\'yinga saqlandi!');
              setTimeout(() => onClose(), 400);
            }}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg transition-all shadow-lg active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Saqlash & Tasdiqlash</span>
          </button>
        </div>
      </div>
    </div>
  );
};

