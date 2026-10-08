import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Camera } from '../../types';
import { Sliders, Video, Plus, Check, RefreshCw, Radio, ShieldAlert } from 'lucide-react';

export const CameraManagementView: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCam, setEditingCam] = useState<Camera | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      const data = await api.getCameras();
      setCameras(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCam) return;
    try {
      await api.updateCamera(editingCam);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadCameras();
      setEditingCam(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono">
              CAMERA FEED MANAGEMENT & RTSP CONFIGURATION
            </h2>
            <p className="text-xs text-slate-400">
              Restricted to Security Operations Manager • Real-time RTSP/HLS stream mapping
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Camera configuration updated and audit log recorded successfully.</span>
        </div>
      )}

      {/* Cameras Table */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
            ACTIVE SURVEILLANCE CHANNELS ({cameras.length})
          </h3>
          <button onClick={loadCameras} className="text-slate-400 hover:text-white p-1 rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {cameras.map((c) => (
            <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">{c.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    {c.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {c.id}</span>
                </div>
                <p className="text-xs text-slate-400">{c.location} • Zone: {c.zone}</p>
                <div className="text-[10px] font-mono text-slate-500">
                  Stream: {c.stream_url} • {c.resolution} @ {c.fps} FPS
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingCam(c)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingCam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B1120] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono">
              Configure Stream: {editingCam.name}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">Camera Name</label>
                <input
                  type="text"
                  value={editingCam.name}
                  onChange={(e) => setEditingCam({ ...editingCam, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Location / Zone</label>
                <input
                  type="text"
                  value={editingCam.location}
                  onChange={(e) => setEditingCam({ ...editingCam, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">Stream Endpoint (RTSP / MP4)</label>
                <input
                  type="text"
                  value={editingCam.stream_url || ''}
                  onChange={(e) => setEditingCam({ ...editingCam, stream_url: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCam(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
