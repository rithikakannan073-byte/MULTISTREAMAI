import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLogEntry } from '../../types';
import { ShieldCheck, Clock, User, RefreshCw, Key, Search, FileText } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (act: string) => {
    switch (act) {
      case 'login':
      case 'logout':
        return 'bg-blue-950/80 text-blue-400 border-blue-500/30';
      case 'ai_investigation':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30';
      case 'evidence_viewed':
        return 'bg-purple-950/80 text-purple-400 border-purple-500/30';
      case 'report_exported':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
      case 'camera_changed':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono">
              SYSTEM COMPLIANCE & SECURITY AUDIT LOGS
            </h2>
            <p className="text-xs text-slate-400">
              Immutable chain-of-custody tracking all investigator queries, logins, and evidence inspections
            </p>
          </div>
        </div>

        <button onClick={loadLogs} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
            RECORDED AUDIT TRAILS ({logs.length} EVENTS)
          </h3>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-xs font-mono text-slate-400">
            Retrieving tamper-proof audit trail...
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="font-semibold text-white font-mono">{log.user_name || log.user_id}</span>
                    {log.user_role && (
                      <span className="text-[10px] font-mono text-slate-400">
                        ({log.user_role})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Resource: <span className="text-slate-300">{log.resource_type}</span>
                    {log.resource_id && <span> [{log.resource_id}]</span>}
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="text-[10px] text-slate-500 font-mono">
                      Meta: {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-500 shrink-0 self-start sm:self-center flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
