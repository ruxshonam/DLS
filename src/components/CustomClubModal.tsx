import React, { useState } from 'react';
import { TeamData, KitPattern } from '../types/game';
import { saveCustomClub, INITIAL_TEAMS } from '../data/teamsData';
import { X, Check, Palette, Shield } from 'lucide-react';

interface CustomClubModalProps {
  initialClub?: TeamData;
  onSaveClub: (club: TeamData) => void;
  onClose: () => void;
}

export const CustomClubModal: React.FC<CustomClubModalProps> = ({
  initialClub,
  onSaveClub,
  onClose,
}) => {
  const [name, setName] = useState(initialClub?.name || 'Dream FC');
  const [shortName, setShortName] = useState(initialClub?.shortName || 'DFC');
  const [stadiumName, setStadiumName] = useState(initialClub?.stadiumName || 'Victory Park');
  const [primaryColor, setPrimaryColor] = useState(initialClub?.primaryColor || '#0284c7');
  const [secondaryColor, setSecondaryColor] = useState(initialClub?.secondaryColor || '#ffffff');
  const [accentColor, setAccentColor] = useState(initialClub?.accentColor || '#facc15');
  const [gkColor, setGkColor] = useState(initialClub?.gkColor || '#10b981');
  const [kitPattern, setKitPattern] = useState<KitPattern>(initialClub?.kitPattern || 'stripes');

  const colorPresets = [
    '#ffffff', '#0f172a', '#dc2626', '#1d4ed8', '#0284c7', 
    '#16a34a', '#eab308', '#9333ea', '#ea580c', '#0d9488'
  ];

  const handleSave = () => {
    const updated: TeamData = {
      ...(initialClub || INITIAL_TEAMS[0]),
      id: initialClub?.id || 'custom_club',
      name: name.trim() || 'Dream FC',
      shortName: shortName.trim().toUpperCase().slice(0, 3) || 'DFC',
      stadiumName: stadiumName.trim() || 'Dream Arena',
      primaryColor,
      secondaryColor,
      accentColor,
      gkColor,
      kitPattern,
      country: initialClub?.country || 'World',
      formation: initialClub?.formation || '4-3-3',
      players: initialClub?.players && initialClub.players.length >= 11 ? initialClub.players : INITIAL_TEAMS[0].players,
    };

    saveCustomClub(updated);
    onSaveClub(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-sky-400" />
            <h2 className="font-athletic text-2xl font-black uppercase tracking-wider text-white">
              Create Your Club
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
          {/* Left Column: Form Fields */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                Club Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={24}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  Short Tag (3)
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={e => setShortName(e.target.value.toUpperCase())}
                  maxLength={3}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-black text-sm uppercase focus:outline-none focus:border-sky-500 font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  Kit Pattern
                </label>
                <select
                  value={kitPattern}
                  onChange={e => setKitPattern(e.target.value as KitPattern)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="solid">Solid</option>
                  <option value="stripes">Stripes</option>
                  <option value="hoops">Hoops</option>
                  <option value="sash">Sash</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                Home Stadium
              </label>
              <input
                type="text"
                value={stadiumName}
                onChange={e => setStadiumName(e.target.value)}
                maxLength={30}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Color Swatches */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Primary Kit Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPrimaryColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      primaryColor === c ? 'scale-115 border-white ring-2 ring-sky-400' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Secondary Color (Shorts/Stripes)
              </label>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSecondaryColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      secondaryColor === c ? 'scale-115 border-white ring-2 ring-sky-400' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Goalkeeper Kit Color
              </label>
              <div className="flex flex-wrap gap-2">
                {['#10b981', '#f59e0b', '#0ea5e9', '#ec4899', '#6366f1'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setGkColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      gkColor === c ? 'scale-115 border-white ring-2 ring-sky-400' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Kit Preview */}
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4">
              Kit Preview
            </span>

            {/* Stylized Jersey Mockup */}
            <div className="relative w-44 h-48 rounded-2xl flex flex-col items-center justify-center shadow-2xl overflow-hidden border border-white/20"
                 style={{ backgroundColor: primaryColor }}>
              {/* Pattern Overlay */}
              {kitPattern === 'stripes' && (
                <div className="absolute inset-0 flex justify-between pointer-events-none">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="w-5 h-full opacity-90" style={{ backgroundColor: secondaryColor }} />
                  ))}
                </div>
              )}
              {kitPattern === 'hoops' && (
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="h-4 w-full opacity-90" style={{ backgroundColor: secondaryColor }} />
                  ))}
                </div>
              )}
              {kitPattern === 'sash' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, transparent 40%, ${secondaryColor} 40%, ${secondaryColor} 60%, transparent 60%)`,
                  }}
                />
              )}

              {/* Collar & Badge */}
              <div
                className="absolute top-0 w-16 h-8 rounded-b-full border-b-2 border-x-2 border-white/40 shadow-inner"
                style={{ backgroundColor: accentColor }}
              />

              {/* Club Crest & Number */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full border-2 border-white/60 flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  <span className="text-[10px] font-black tracking-tighter text-slate-900">
                    {shortName}
                  </span>
                </div>
                <span
                  className="font-athletic text-5xl font-black mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                  style={{ color: accentColor }}
                >
                  10
                </span>
              </div>
            </div>

            {/* Matching Shorts */}
            <div
              className="w-28 h-12 rounded-b-xl border border-white/20 mt-2 shadow-lg flex items-center justify-center"
              style={{ backgroundColor: secondaryColor }}
            >
              <div className="w-2 h-full opacity-30" style={{ backgroundColor: primaryColor }} />
            </div>

            <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-wider">
              {name} · {shortName}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Save Club</span>
          </button>
        </div>
      </div>
    </div>
  );
};
