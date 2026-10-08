import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend, Cell
} from 'recharts';
import { BarChart3, Users, Video, AlertTriangle, Activity, ArrowRight, ShieldCheck } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-400">
        Calculating multi-camera behavioral statistics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono">
              SECURITY ANALYTICS & SPATIAL MOVEMENT TELEMETRY
            </h2>
            <p className="text-xs text-slate-400">
              Aggregated Computer Vision Inference • Flow Analysis • Cross-Camera Transition Matrices
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL CAMERAS</span>
            <Video className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {data.summary.active_cameras} / {data.summary.total_cameras}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">100% Operational</span>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PEOPLE TRACKED</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {data.summary.people_tracked}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Global Re-ID Identities</span>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACTIVE ALERTS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {data.summary.active_alerts}
          </div>
          <span className="text-[10px] text-red-400 font-mono">1 High Priority</span>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AVG RE-ID ACCURACY</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {(data.summary.avg_reid_confidence * 100).toFixed(0)}%
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">OSNet Feature Matching</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Hourly Traffic Density */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
              PEOPLE DETECTED PER HOUR (BY CAMERA)
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">TODAY</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourly_traffic}>
                <defs>
                  <linearGradient id="colorGate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCorridor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070B14', borderColor: '#1E2D4A', fontSize: 11 }}
                />
                <Area type="monotone" dataKey="Main Gate" stroke="#06B6D4" fillOpacity={1} fill="url(#colorGate)" />
                <Area type="monotone" dataKey="Corridor A" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCorridor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Camera Activity Frequency */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
            CAMERA EVENT DENSITY & THROUGHPUT
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.camera_activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070B14', borderColor: '#1E2D4A', fontSize: 11 }}
                />
                <Bar dataKey="events" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cross-Camera Transitions Table */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
          CROSS-CAMERA SPATIAL TRANSITIONS (INTER-CAMERA HOPS)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.transitions.map((tr: any, idx: number) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-cyan-400 font-semibold">{tr.from}</div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span>{tr.to}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-white">{tr.count}</div>
                <div className="text-[9px] font-mono text-slate-500">TRANSITS</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
