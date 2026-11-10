import React, { useState, useRef, useEffect } from 'react';
import { GameEngine } from '../game/gameEngine';

interface TouchControlsProps {
  engine: GameEngine | null;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);

  // Touch joystick handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!joystickBaseRef.current || !engine) return;
    const touch = e.touches[0];
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    updateJoystick(touch.clientX - centerX, touch.clientY - centerY);
    setJoystickActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickBaseRef.current || !engine) return;
    const touch = e.touches[0];
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    updateJoystick(touch.clientX - centerX, touch.clientY - centerY);
  };

  const handleTouchEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    if (engine) {
      engine.joystickVector = { x: 0, y: 0 };
    }
  };

  const updateJoystick = (dx: number, dy: number) => {
    const maxRadius = 45;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const nx = (Math.cos(angle) * clampedDist) / maxRadius;
    const ny = (Math.sin(angle) * clampedDist) / maxRadius;

    setJoystickPos({ x: Math.cos(angle) * clampedDist, y: Math.sin(angle) * clampedDist });

    if (engine) {
      engine.joystickVector = { x: nx, y: ny };
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Left Virtual Joystick */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-28 h-28 rounded-full bg-slate-900/60 border border-white/20 backdrop-blur-sm flex items-center justify-center touch-none shadow-xl"
        >
          <div
            className={`w-12 h-12 rounded-full bg-sky-500/80 border border-sky-300 shadow-md transition-transform duration-75 flex items-center justify-center ${
              joystickActive ? 'scale-110 bg-sky-400' : ''
            }`}
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/70" />
          </div>
          <span className="absolute bottom-2 text-[9px] uppercase tracking-wider font-semibold text-slate-400">
            Move
          </span>
        </div>
      </div>

      {/* Right Action Buttons: Inspired by Dream League Soccer (A = Shoot, B = Pass, C = Through Pass) */}
      <div className="absolute bottom-8 right-8 pointer-events-auto flex items-end gap-3">
        {/* Switch Player Button */}
        <button
          onClick={() => engine?.switchControlledPlayer()}
          className="w-13 h-13 rounded-full bg-slate-800/80 active:bg-slate-700 text-slate-300 border border-slate-600/60 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 text-xs font-bold"
          title="Switch Player [TAB]"
        >
          <span className="text-[10px] text-slate-400">TAB</span>
          <span>SWAP</span>
        </button>

        {/* Slide Tackle (Podkat) Button */}
        <button
          onClick={() => engine?.performSlideTackle(1)}
          className="w-13 h-13 rounded-full bg-indigo-700/85 active:bg-indigo-600 text-white border border-indigo-400 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 text-xs font-bold"
          title="Slide Tackle / Podkat [C]"
        >
          <span className="text-[10px] opacity-75">C</span>
          <span>SLIDE</span>
        </button>

        {/* Q: Lob / Through Pass */}
        <button
          onPointerDown={() => engine?.startCharge(1, 'through')}
          onPointerUp={() => engine?.executeChargedAction(1)}
          className="w-15 h-15 rounded-full bg-amber-600/85 active:bg-amber-500 text-white border border-amber-400 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 text-sm font-bold"
          title="Through Pass [Q]"
        >
          <span className="text-[10px] opacity-75">Q</span>
          <span>THRU</span>
        </button>

        {/* B: Ground Pass */}
        <button
          onPointerDown={() => engine?.startCharge(1, 'pass')}
          onPointerUp={() => engine?.executeChargedAction(1)}
          className="w-16 h-16 rounded-full bg-emerald-600/85 active:bg-emerald-500 text-white border border-emerald-400 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 text-base font-extrabold"
          title="Pass [X]"
        >
          <span className="text-[10px] opacity-75">X</span>
          <span>PASS</span>
        </button>

        {/* A: Shoot */}
        <button
          onPointerDown={() => engine?.startCharge(1, 'shoot')}
          onPointerUp={() => engine?.executeChargedAction(1)}
          className="w-18 h-18 rounded-full bg-rose-600/90 active:bg-rose-500 text-white border-2 border-rose-300 flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-95 text-lg font-black"
          title="Shoot [SPACE]"
        >
          <span className="text-[10px] opacity-75">SPACE</span>
          <span>SHOOT</span>
        </button>
      </div>
    </div>
  );
};
