import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Database, FileVideo } from 'lucide-react';
import { api } from '../../services/api';
import { Camera } from '../../types';

interface RealCameraSlotProps {
  camera: Camera;
}

export const RealCameraSlot: React.FC<RealCameraSlotProps> = ({ camera }) => {
  const [videoStatus, setVideoStatus] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [camera.id]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/videos');
      const data = await response.json();
      const camVideo = data.find((v: any) => v.camera_id === camera.id);
      setVideoStatus(camVideo || null);
    } catch (err) {
      console.error('Error fetching video status:', err);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('camera_id', camera.id);
    formData.append('start_time', new Date().toISOString());

    try {
      await fetch('http://127.0.0.1:8000/api/videos/upload', {
        method: 'POST',
        body: formData,
      });
      fetchStatus();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!videoStatus) {
    return (
      <div className="w-full aspect-video bg-[#070B14] rounded-xl border-2 border-dashed border-slate-700/50 flex flex-col items-center justify-center relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
        <div className="absolute top-3 left-4 flex items-center gap-2 z-10">
          <div className="w-2 h-2 rounded-full bg-slate-500"></div>
          <span className="text-slate-400 font-mono text-xs font-semibold">{camera.name}</span>
        </div>
        
        <FileVideo className="w-8 h-8 text-slate-600 mb-3" />
        <h3 className="text-slate-300 font-bold font-mono tracking-tight">NO REAL CCTV FOOTAGE AVAILABLE</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">Slot empty. Upload real CCTV dataset.</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
          accept="video/mp4,video/avi,video/quicktime" 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-400 text-xs font-bold font-mono tracking-wide transition-all cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? 'UPLOADING...' : 'UPLOAD CCTV VIDEO'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black rounded-xl border border-slate-800 relative overflow-hidden group">
      <div className="absolute top-3 left-4 flex items-center gap-2 z-10 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-white font-mono text-[10px] font-bold tracking-wider">{camera.name}</span>
      </div>
      
      <div className="absolute top-3 right-4 z-10 flex flex-col gap-1 items-end">
        <div className="bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono font-bold backdrop-blur-sm uppercase">
          {videoStatus.status === 'processing' ? `PROCESSING ${videoStatus.progress?.toFixed(1)}%` : 'REAL FOOTAGE (PROCESSED)'}
        </div>
      </div>

      <video 
        src={`http://127.0.0.1:8000/media/real_cctv/${videoStatus.video_id}.mp4`} 
        className="w-full h-full object-cover opacity-80"
        controls
        muted
        loop
      />
    </div>
  );
};
