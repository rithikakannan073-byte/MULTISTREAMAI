import React, { useState } from 'react';
import { EvidenceItem } from '../../types';
import { X, Play, Pause, RotateCcw, ShieldCheck, Video, Calendar, Camera as CameraIcon, Download } from 'lucide-react';

interface EvidenceModalProps {
  evidence: EvidenceItem | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'frame' | 'clip'>('frame');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B1120] border border-slate-700/80 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-mono text-cyan-400 font-semibold">
                VERIFIED CCTV EVIDENCE RECORD [{evidence.id}]
              </div>
              <h3 className="text-sm font-bold text-white">{evidence.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Display Area */}
        <div className="p-5 space-y-4">
          {/* Mode switch */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 w-fit">
            <button
              onClick={() => { setActiveTab('frame'); setIsPlaying(false); }}
              className={`px-3 py-1 rounded text-xs font-mono cursor-pointer transition-colors ${
                activeTab === 'frame' ? 'bg-cyan-950 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              [FOCUSED FRAME CROP]
            </button>
            <button
              onClick={() => { setActiveTab('clip'); setIsPlaying(true); }}
              className={`px-3 py-1 rounded text-xs font-mono cursor-pointer transition-colors ${
                activeTab === 'clip' ? 'bg-cyan-950 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              [VIDEO CLIP PLAYBACK]
            </button>
          </div>

          {/* Visual Canvas Simulator */}
          <div className="relative bg-[#070B14] border border-slate-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
            {/* Visual simulation content */}
            <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center relative bg-gradient-to-b from-slate-900/40 to-slate-950">
              <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400 bg-black/70 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>CAMERA: {evidence.camera_name || evidence.camera_id}</span>
              </div>
              <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-300 bg-black/70 px-2 py-0.5 rounded border border-slate-800">
                {evidence.timestamp}
              </div>

              {/* Subject Representation */}
              <div className="relative border-2 border-cyan-400 rounded-lg p-6 bg-cyan-950/20 shadow-lg glow-cyan max-w-xs">
                <div className="w-16 h-16 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center mx-auto mb-2 text-cyan-400 font-bold font-mono text-lg">
                  {evidence.person_id || 'OBJ'}
                </div>
                <div className="text-xs font-mono text-cyan-300 font-bold">
                  {evidence.person_id ? `SUBJECT ${evidence.person_id}` : 'DETECTED OBJECT'}
                </div>
                <div className="text-[11px] text-slate-300 mt-1 leading-snug">
                  {evidence.notes || 'Facial & visual feature vector verified against historical tracks.'}
                </div>
                <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-black/60 py-0.5 px-2 rounded inline-block">
                  MATCH CONFIDENCE: {(evidence.confidence * 100).toFixed(1)}%
                </div>
              </div>

              {/* Playback Overlay if video clip mode */}
              {activeTab === 'clip' && (
                <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md rounded-lg p-2 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1 rounded bg-cyan-500 text-black hover:bg-cyan-400 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-[11px] text-slate-300">00:0{isPlaying ? '3' : '1'} / 00:08</span>
                  </div>
                  <div className="text-[10px] text-slate-400">1080p • 30 FPS • H.265</div>
                </div>
              )}
            </div>
          </div>

          {/* Forensic Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">CAMERA SOURCE</span>
              <span className="text-white font-medium">{evidence.camera_id}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">TIMECODE</span>
              <span className="text-white font-medium">{evidence.timestamp.split(' ')[-1]}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">CONFIDENCE</span>
              <span className="text-cyan-400 font-bold">{(evidence.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">RE-ID STATUS</span>
              <span className="text-emerald-400 font-medium">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Chain of Custody Secured</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
