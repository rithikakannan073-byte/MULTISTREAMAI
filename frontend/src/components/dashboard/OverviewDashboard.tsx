import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Camera, Alert } from '../../types';
import { CameraFeedCanvas } from '../surveillance/CameraFeedCanvas';
import { useAuth } from '../../context/AuthContext';
import {
  Video, Users, AlertTriangle, Clock, ArrowRight,
  ShieldCheck, BotMessageSquare, Route, FileText, CheckCircle2
} from 'lucide-react';

interface OverviewDashboardProps {
  setActiveView: (view: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ setActiveView }) => {
  const { role, hasPermission } = useAuth();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cams, alts] = await Promise.all([api.getCameras(), api.getAlerts()]);
        setCameras(cams);
        setAlerts(alts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B1120] to-[#070B14] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ACTIVE PERIMETER DEFENSE & FORENSICS</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Surveillance Intelligence Command Center
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Real-time multi-camera tracking, OSNet global identity mapping, and conversational CCTV inquiry.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setActiveView('investigation')}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <BotMessageSquare className="w-4 h-4" />
              <span>AI INVESTIGATION</span>
            </button>

            <button
              onClick={() => setActiveView('journey')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-medium text-xs font-mono transition-all flex items-center gap-2 cursor-pointer"
            >
              <Route className="w-4 h-4 text-cyan-400" />
              <span>PERSON JOURNEY (P023)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">TOTAL CAMERAS</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">4 / 4</div>
            <div className="text-[10px] text-emerald-400 font-mono">100% ONLINE</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <Video className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">PEOPLE DETECTED</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">20</div>
            <div className="text-[10px] text-cyan-400 font-mono">ByteTrack Intra-Cam</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">ACTIVE EVENTS</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">50</div>
            <div className="text-[10px] text-slate-400 font-mono">Indexed in Graph</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">SURVEILLANCE ALERTS</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5">{alerts.length}</div>
            <div className="text-[10px] text-red-400 font-mono">1 High Priority</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main 4 Camera Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-2">
            <Video className="w-4 h-4 text-cyan-400" />
            <span>LIVE CCTV PREVIEW CHANNELS</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cameras.map((cam) => (
            <div
              key={cam.id}
              className="bg-[#0B1120] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <CameraFeedCanvas camera={cam} onSelect={() => setActiveView('cameras')} />
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white font-mono">{cam.name}</h3>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {cam.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{cam.location}</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border-t border-slate-800/80 text-[10px] font-mono flex items-center justify-between text-slate-400">
                <span>{cam.people_count} People Detected</span>
                <span className="text-cyan-400">{cam.object_count} Objects</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Investigation Scenario Spotlight Card */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-cyan-400">
            DEMONSTRATION SCENARIO SPOTLIGHT: PERSON P023
          </span>
          <span className="text-[11px] font-mono text-slate-400">Cross-Camera Transit Event</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Subject <strong>P023</strong> (Man in Blue Shirt) entered via <strong>Camera 01 (Main Gate)</strong> at 10:21:34,
          moved along <strong>Camera 02 (Corridor A)</strong> at 10:22:18, interacted with Associate <strong>P014</strong> at 10:23:01,
          and departed through the emergency exit in <strong>Camera 04 (Parking Lot)</strong> at 10:24:06 into a silver sedan.
        </p>
        <div className="pt-2 flex items-center gap-3">
          {hasPermission('use_ai_investigation') && (
            <button
              onClick={() => setActiveView('investigation')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>Ask AI: "Where did the man in the blue shirt go?"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
