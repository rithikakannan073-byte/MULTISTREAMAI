import React, { useState, useEffect } from 'react';
import { Camera } from '../../types';
import { api } from '../../services/api';
import { CameraFeedCanvas } from './CameraFeedCanvas';
import { RealCameraSlot } from './RealCameraSlot';
import { useDataMode } from '../../context/DataContext';
import { Grid, Square, Layers, RefreshCw, Radio, Shield, Video, AlertCircle } from 'lucide-react';

export const LiveCameraGrid: React.FC = () => {
  const { dataMode } = useDataMode();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<'2x2' | 'single'>('2x2');
  const [selectedCamId, setSelectedCamId] = useState<string>('CAM-01');
  const [globalDetections, setGlobalDetections] = useState(true);

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

  const selectedCam = cameras.find((c) => c.id === selectedCamId) || cameras[0];

  return (
    <div className="space-y-4">
      {/* Top Surveillance Control Bar */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono tracking-tight flex items-center gap-2">
              SURVEILLANCE MATRIX – 4 ACTIVE STREAMS
              <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                SYNCHRONIZED RTSP
              </span>
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Global Detections Toggle */}
          <button
            onClick={() => setGlobalDetections(!globalDetections)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 cursor-pointer transition-colors ${
              globalDetections
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AI BBoxes: {globalDetections ? 'ON' : 'OFF'}</span>
          </button>

          {/* Grid Layout Toggle */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            <button
              onClick={() => setLayout('2x2')}
              className={`p-1.5 rounded text-xs cursor-pointer ${
                layout === '2x2' ? 'bg-cyan-950 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="2x2 Quad Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('single')}
              className={`p-1.5 rounded text-xs cursor-pointer ${
                layout === 'single' ? 'bg-cyan-950 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Focused Single Camera"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={loadCameras}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Refresh stream metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid or Single View */}
      {loading ? (
        <div className="h-96 flex items-center justify-center text-slate-400 font-mono text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
          Synchronizing multi-camera video streams...
        </div>
      ) : layout === '2x2' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cameras.map((cam) => (
            <div key={cam.id} className="relative">
              {dataMode === 'real' ? (
                <RealCameraSlot camera={cam} />
              ) : (
                <CameraFeedCanvas
                  camera={cam}
                  showDetections={globalDetections}
                  onSelect={() => {
                    setSelectedCamId(cam.id);
                    setLayout('single');
                  }}
                />
              )}
              {dataMode === 'demo' && (
                <div className="mt-2 flex items-center justify-between text-xs px-1 text-slate-400 font-mono">
                  <span>{cam.latest_event || 'Monitoring perimeter'}</span>
                  <span className="text-cyan-400 font-semibold">{cam.people_count} People Detected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Focused Single View */
        <div className="space-y-4">
          {selectedCam && (
            <div className="max-w-4xl mx-auto">
              {dataMode === 'real' ? (
                <RealCameraSlot camera={selectedCam} />
              ) : (
                <CameraFeedCanvas
                  camera={selectedCam}
                  showDetections={globalDetections}
                />
              )}
              <div className="mt-3 flex items-center justify-between bg-[#0B1120] border border-slate-800 rounded-xl p-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{selectedCam.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCam.location} • Zone: {selectedCam.zone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded border border-cyan-500/30">
                    Resolution: {selectedCam.resolution} @ {selectedCam.fps} FPS
                  </span>
                  <button
                    onClick={() => setLayout('2x2')}
                    className="px-3 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-300 hover:text-white cursor-pointer"
                  >
                    Back to 2x2 Grid
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick switcher tabs */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {cameras.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCamId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                  selectedCamId === c.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-semibold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {c.id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
