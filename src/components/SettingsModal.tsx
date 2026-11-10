import React from 'react';
import { GameSettings, CameraMode, AIDifficulty } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { X, Volume2, Video, Clock, Gauge, Compass } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const update = (partial: Partial<GameSettings>) => {
    const updated = { ...settings, ...partial };
    onUpdateSettings(updated);
    if ('sfxVolume' in partial || 'crowdVolume' in partial) {
      soundEngine.setVolumes(updated.sfxVolume, updated.crowdVolume);
    }
    if ('soundEnabled' in partial) {
      soundEngine.setSoundEnabled(updated.soundEnabled);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <h2 className="font-athletic text-2xl font-black uppercase tracking-wider text-white">
            Game Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Camera View */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Video className="w-4 h-4 text-sky-400" />
              <span>Broadcast Camera Angle</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'tele', label: 'Tele Broadcast' },
                { id: 'dynamic', label: 'Dynamic Action' },
                { id: 'topdown', label: 'Top-Down Tactical' },
                { id: 'endtoend', label: 'End-to-End' },
              ].map(cam => (
                <button
                  key={cam.id}
                  onClick={() => update({ cameraMode: cam.id as CameraMode })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    settings.cameraMode === cam.id
                      ? 'bg-sky-600 border-sky-400 text-white shadow'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Difficulty */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Opponent AI Difficulty</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'beginner', label: 'Beginner' },
                { id: 'amateur', label: 'Amateur' },
                { id: 'legend', label: 'Legend' },
              ].map(diff => (
                <button
                  key={diff.id}
                  onClick={() => update({ difficulty: diff.id as AIDifficulty })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    settings.difficulty === diff.id
                      ? 'bg-amber-600 border-amber-400 text-white shadow'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Match Duration */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Match Duration</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 8].map(mins => (
                <button
                  key={mins}
                  onClick={() => update({ matchDurationMinutes: mins })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    settings.matchDurationMinutes === mins
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>

          {/* Audio Volume Sliders */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Volume2 className="w-4 h-4 text-rose-400" />
              <span>Audio & Commentary</span>
            </div>

            {/* Live Commentator Audio Controls */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Sharhlovchi Ovozi (Live Commentary)</span>
                <span className="text-[10px] text-slate-400">Match davomida ovozli sharh</span>
              </div>
              <input
                type="checkbox"
                checked={settings.commentaryEnabled}
                onChange={e => update({ commentaryEnabled: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Sharh Tili (Language)</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => update({ commentaryLanguage: 'uz' })}
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    settings.commentaryLanguage === 'uz' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  O&apos;zbekcha
                </button>
                <button
                  type="button"
                  onClick={() => update({ commentaryLanguage: 'en' })}
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    settings.commentaryLanguage === 'en' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Sound Effects (To&apos;p va hushtak)</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={e => update({ sfxVolume: parseFloat(e.target.value) })}
                className="w-36 accent-sky-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Stadium Crowd Ambience</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.crowdVolume}
                onChange={e => update({ crowdVolume: parseFloat(e.target.value) })}
                className="w-36 accent-sky-500"
              />
            </div>
          </div>

          {/* Gameplay Toggles */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-slate-300">Show Radar Mini-Map</span>
              <input
                type="checkbox"
                checked={settings.showRadar}
                onChange={e => update({ showRadar: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-slate-300">Auto-Switch Player Near Ball</span>
              <input
                type="checkbox"
                checked={settings.autoSwitch}
                onChange={e => update({ autoSwitch: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-lg"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
