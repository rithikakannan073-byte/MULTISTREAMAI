import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Alert, EvidenceItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { EvidenceModal } from '../common/EvidenceModal';
import { Bell, AlertTriangle, ShieldCheck, CheckCircle2, Video, RefreshCw, Clock } from 'lucide-react';

export const AlertCenterView: React.FC = () => {
  const { hasPermission } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      const updated = await api.acknowledgeAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityStyle = (s: string) => {
    switch (s) {
      case 'critical':
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/40 glow-red';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/30 text-red-400">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              REAL-TIME SURVEILLANCE ALERTS & INCIDENT RESPONSE
            </h2>
            <p className="text-xs text-slate-400">
              Automated Anomaly Detection: Restricted Area Breach • Unattended Bags • Loitering
            </p>
          </div>
        </div>

        <button
          onClick={loadAlerts}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
          title="Refresh alerts"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Alerts Cards */}
      {loading ? (
        <div className="h-48 flex items-center justify-center text-xs font-mono text-slate-400">
          Loading surveillance anomaly alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400 font-mono">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          All security zones clear. No unacknowledged alerts.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-xl border transition-all ${
                alert.status === 'active'
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-[#0B1120]/60 border-slate-900 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 ${getSeverityStyle(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white font-mono">{alert.title}</h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        [{alert.camera_name || alert.camera_id}]
                      </span>
                      {alert.person_id && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                          {alert.person_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{alert.description}</p>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 pt-1">
                      <Clock className="w-3 h-3" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() =>
                      setSelectedEvidence({
                        id: `EVD-${alert.id}`,
                        event_id: alert.event_id || 'EVT-ALT',
                        camera_id: alert.camera_id,
                        camera_name: alert.camera_name,
                        person_id: alert.person_id,
                        title: alert.title,
                        timestamp: alert.timestamp,
                        frame_image_url: '/frames/alert-crop.jpg',
                        confidence: 0.95,
                        notes: alert.description
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-cyan-400" />
                    <span>[EVIDENCE]</span>
                  </button>

                  {hasPermission('acknowledge_alerts') && alert.status === 'active' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono cursor-pointer transition-colors"
                    >
                      ACKNOWLEDGE
                    </button>
                  )}

                  {alert.status === 'acknowledged' && (
                    <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ACKNOWLEDGED</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
};
