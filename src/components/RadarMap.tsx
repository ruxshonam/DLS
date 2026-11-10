import React, { useRef, useEffect } from 'react';
import { GameEngine } from '../game/gameEngine';

interface RadarMapProps {
  engine: GameEngine | null;
}

export const RadarMap: React.FC<RadarMapProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId = 0;

    const renderRadar = () => {
      const canvas = canvasRef.current;
      if (!canvas || !engine) {
        animId = requestAnimationFrame(renderRadar);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Clear with dark turf tint
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, 0, w, h);

      // Border & Center Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(4, 4, w - 8, h - 8);

      // Halfway line
      ctx.beginPath();
      ctx.moveTo(w / 2, 4);
      ctx.lineTo(w / 2, h - 4);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Penalty Boxes
      const pboxW = 20;
      const pboxH = 34;
      ctx.strokeRect(4, (h - pboxH) / 2, pboxW, pboxH);
      ctx.strokeRect(w - 4 - pboxW, (h - pboxH) / 2, pboxW, pboxH);

      // Pitch coordinate mapping: X from -52.5 to 52.5 -> 4 to w-4
      // Z from -34 to 34 -> 4 to h-4
      const mapX = (x: number) => 4 + ((x + 52.5) / 105) * (w - 8);
      const mapZ = (z: number) => 4 + ((z + 34) / 68) * (h - 8);

      // Draw Home Players
      const homeColor = engine.homeTeam.primaryColor === '#FFFFFF' ? '#e2e8f0' : engine.homeTeam.primaryColor;
      for (const p of engine.homePlayers) {
        const px = mapX(p.position.x);
        const py = mapZ(p.position.z);

        if (p === engine.controlledPlayer) {
          // Highlight ring for user player
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 5.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = p.data.position === 'GK' ? '#f59e0b' : homeColor;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Away Players
      const awayColor = engine.awayTeam.primaryColor === '#FFFFFF' ? '#cbd5e1' : engine.awayTeam.primaryColor;
      for (const p of engine.awayPlayers) {
        const px = mapX(p.position.x);
        const py = mapZ(p.position.z);

        ctx.fillStyle = p.data.position === 'GK' ? '#ec4899' : awayColor;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Football
      const bx = mapX(engine.ball.position.x);
      const by = mapZ(engine.ball.position.z);
      ctx.fillStyle = '#facc15'; // Bright yellow
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      animId = requestAnimationFrame(renderRadar);
    };

    animId = requestAnimationFrame(renderRadar);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-white/20 shadow-lg pointer-events-none">
      <canvas
        ref={canvasRef}
        width={160}
        height={100}
        className="block"
      />
    </div>
  );
};
