import React, { useRef, useEffect, useState } from 'react';
import { Camera } from '../../types';
import { Maximize2, Camera as CameraIcon, Play, Pause, Layers, ShieldAlert } from 'lucide-react';

interface CameraFeedCanvasProps {
  camera: Camera;
  showDetections?: boolean;
  onSelect?: () => void;
  onOpenEvidence?: (camId: string) => void;
}

export const CameraFeedCanvas: React.FC<CameraFeedCanvasProps> = ({
  camera,
  showDetections = true,
  onSelect,
  onOpenEvidence
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOverlays, setShowOverlays] = useState(showDetections);
  const [fps, setFps] = useState(30);

  useEffect(() => {
    setShowOverlays(showDetections);
  }, [showDetections]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Dark CCTV Background Environment
      ctx.fillStyle = '#080D1A';
      ctx.fillRect(0, 0, w, h);

      // Camera-specific environment render
      if (camera.id === 'CAM-01') {
        // Main Gate: Floor lines, turnstile gates
        ctx.strokeStyle = '#1E2D4A';
        ctx.lineWidth = 1;
        // Horizon & perimeter fence
        ctx.strokeRect(40, 60, w - 80, 2);
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo(60 + i * 45, 30);
          ctx.lineTo(60 + i * 45, 62);
          ctx.stroke();
        }
        // Turnstiles
        ctx.fillStyle = '#131F37';
        ctx.fillRect(100, 110, 45, 70);
        ctx.fillRect(200, 110, 45, 70);
        ctx.strokeStyle = '#06B6D4';
        ctx.strokeRect(100, 110, 45, 70);
        ctx.strokeRect(200, 110, 45, 70);
      } else if (camera.id === 'CAM-02') {
        // Corridor A: Perspective walls
        ctx.strokeStyle = '#1E2D4A';
        ctx.lineWidth = 1.5;
        // Hallway vanishing lines
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(130, 90);
        ctx.moveTo(w, 0); ctx.lineTo(230, 90);
        ctx.moveTo(0, h); ctx.lineTo(130, 150);
        ctx.moveTo(w, h); ctx.lineTo(230, 150);
        ctx.stroke();
        // End wall
        ctx.fillStyle = '#101B30';
        ctx.fillRect(130, 90, 100, 60);
      } else if (camera.id === 'CAM-03') {
        // Reception: Lobby front desk
        ctx.fillStyle = '#14223D';
        ctx.beginPath();
        ctx.roundRect(80, 130, 200, 45, 8);
        ctx.fill();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (camera.id === 'CAM-04') {
        // Parking: Parking slots & silver sedan
        ctx.strokeStyle = '#1E2D4A';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, 140, 80, 70);
        ctx.strokeRect(150, 140, 80, 70);
        ctx.strokeRect(250, 140, 80, 70);
        // Vehicle in slot 2
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(165, 145, 50, 40, 6);
        ctx.fill();
      }

      // 2. Animated Entities & YOLO11 Bounding Boxes
      if (camera.id === 'CAM-01') {
        // Person P023 moving through gate
        const px = 120 + Math.sin(t) * 20;
        const py = 120;
        
        // Subject silhouette
        ctx.fillStyle = '#0284C7'; // Blue shirt
        ctx.fillRect(px + 4, py + 12, 16, 24);
        ctx.fillStyle = '#F8FAFC'; // Head
        ctx.beginPath();
        ctx.arc(px + 12, py + 6, 6, 0, Math.PI * 2);
        ctx.fill();

        if (showOverlays) {
          // YOLO11 Bounding Box for P023
          ctx.strokeStyle = '#06B6D4';
          ctx.lineWidth = 2;
          ctx.strokeRect(px, py, 24, 48);

          // Tag
          ctx.fillStyle = '#06B6D4';
          ctx.fillRect(px, py - 18, 90, 16);
          ctx.fillStyle = '#040812';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('P023 | 96% | #17', px + 4, py - 6);

          // Detected Object (Shoulder Bag)
          ctx.strokeStyle = '#EAB308';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 16, py + 16, 10, 14);
          ctx.fillStyle = '#EAB308';
          ctx.fillRect(px + 16, py + 10, 48, 10);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('bag: 94%', px + 18, py + 18);
        }
      } else if (camera.id === 'CAM-02') {
        // Corridor: P023 & P014 interacting
        const p1x = 160;
        const p1y = 100;
        const p2x = 185;
        const p2y = 102;

        // P023
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(p1x + 3, p1y + 10, 14, 22);
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath(); ctx.arc(p1x + 10, p1y + 5, 5, 0, Math.PI * 2); ctx.fill();

        // P014
        ctx.fillStyle = '#475569'; // Dark jacket
        ctx.fillRect(p2x + 3, p2y + 10, 14, 22);
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath(); ctx.arc(p2x + 10, p2y + 5, 5, 0, Math.PI * 2); ctx.fill();

        if (showOverlays) {
          // BBox P023
          ctx.strokeStyle = '#06B6D4';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(p1x, p1y, 20, 42);
          ctx.fillStyle = '#06B6D4';
          ctx.fillRect(p1x, p1y - 16, 85, 14);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('P023 | 94% | #17', p1x + 3, p1y - 5);

          // BBox P014
          ctx.strokeStyle = '#A855F7';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(p2x, p2y, 20, 42);
          ctx.fillStyle = '#A855F7';
          ctx.fillRect(p2x, p2y - 16, 85, 14);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('P014 | 92% | #42', p2x + 3, p2y - 5);

          // Proximity link
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(p1x + 10, p1y + 20);
          ctx.lineTo(p2x + 10, p2y + 20);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (camera.id === 'CAM-04') {
        // Parking Lot: P023 departing towards car
        const px = 180 + Math.cos(t * 0.5) * 15;
        const py = 110;

        ctx.fillStyle = '#0284C7';
        ctx.fillRect(px + 4, py + 12, 16, 24);
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath(); ctx.arc(px + 12, py + 6, 6, 0, Math.PI * 2); ctx.fill();

        if (showOverlays) {
          ctx.strokeStyle = '#06B6D4';
          ctx.lineWidth = 2;
          ctx.strokeRect(px, py, 24, 46);
          ctx.fillStyle = '#06B6D4';
          ctx.fillRect(px, py - 18, 90, 16);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('P023 | 91% | #08', px + 4, py - 6);

          // Car BBox
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(160, 140, 60, 48);
          ctx.fillStyle = '#10B981';
          ctx.fillRect(160, 126, 75, 12);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('Sedan: 97%', 163, 136);
        }
      }

      // 3. Scanline effect & Surveillance Overlays
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
      }

      // Corner Crosshairs
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1;
      const corner = 15;
      // Top Left
      ctx.beginPath(); ctx.moveTo(10, 25); ctx.lineTo(10, 10); ctx.lineTo(25, 10); ctx.stroke();
      // Top Right
      ctx.beginPath(); ctx.moveTo(w - 25, 10); ctx.lineTo(w - 10, 10); ctx.lineTo(w - 10, 25); ctx.stroke();
      // Bottom Left
      ctx.beginPath(); ctx.moveTo(10, h - 25); ctx.lineTo(10, h - 10); ctx.lineTo(25, h - 10); ctx.stroke();
      // Bottom Right
      ctx.beginPath(); ctx.moveTo(w - 25, h - 10); ctx.lineTo(w - 10, h - 10); ctx.lineTo(w - 10, h - 25); ctx.stroke();

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [camera, showOverlays, isPlaying]);

  const now = new Date();
  const timeString = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);

  return (
    <div className="relative bg-[#070B14] border border-slate-800 rounded-xl overflow-hidden shadow-lg group hover:border-cyan-500/50 transition-colors">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={360}
        height={210}
        className="w-full h-auto block bg-[#070B14] cursor-pointer"
        onClick={onSelect}
      />

      {/* Top Banner Overlay */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-slate-700/80 text-emerald-400 font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
          <span className="px-2 py-0.5 rounded bg-black/60 border border-slate-700/80 text-white font-medium">
            {camera.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-black/60 border border-slate-700/80 text-slate-300">
            {timeString}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-400 text-[10px] font-bold">
            REC
          </span>
        </div>
      </div>

      {/* Bottom Info Bar Overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono">
        <div className="bg-black/75 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
          <span className="text-cyan-400 font-semibold">{camera.name}</span>
          <span className="text-slate-500 ml-2">| {camera.location}</span>
        </div>

        {/* Hover Controls */}
        <div className="flex items-center gap-1 bg-black/80 p-1 rounded border border-slate-800 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            title="Toggle YOLO11 Detections & Re-ID tags"
            className={`p-1 rounded cursor-pointer transition-colors ${
              showOverlays ? 'text-cyan-400 bg-cyan-950/80' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause feed' : 'Play feed'}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onSelect}
            title="Focus Camera"
            className="p-1 rounded text-slate-400 hover:text-cyan-400 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
