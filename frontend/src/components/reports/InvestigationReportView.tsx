import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Report } from '../../types';
import { FileText, Download, ShieldCheck, Check, Clock, Video, Users, RefreshCw } from 'lucide-react';

export const InvestigationReportView: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await api.getReports();
      setReports(data);
      if (data.length > 0) setSelectedReport(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportId: string) => {
    try {
      const res = await api.exportReport(reportId);
      // Trigger download of markdown report
      const blob = new Blob([res.content], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', res.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportNotice(`Report [${reportId}] exported successfully as ${res.filename}`);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono">
              OFFICIAL FORENSIC INVESTIGATION REPORTS
            </h2>
            <p className="text-xs text-slate-400">
              Evidence-Backed Summaries • Chronological Incident Transcripts • PDF/MD Export
            </p>
          </div>
        </div>

        {selectedReport && (
          <button
            onClick={() => handleExport(selectedReport.id)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT REPORT</span>
          </button>
        )}
      </div>

      {exportNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-400">
          Loading forensic dossiers...
        </div>
      ) : selectedReport ? (
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-7 shadow-xl space-y-6 max-w-4xl mx-auto">
          {/* Report Top Meta */}
          <div className="border-b border-slate-800 pb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono text-cyan-400 font-bold tracking-wider uppercase mb-1">
                INCIDENT REPORT DOSSIER [{selectedReport.id}]
              </div>
              <h2 className="text-xl font-bold text-white">{selectedReport.title}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Lead Investigator: <span className="text-slate-200">{selectedReport.investigator_name}</span> • Type: <span className="text-slate-200">{selectedReport.incident_type}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                CONFIDENCE: {(selectedReport.confidence * 100).toFixed(0)}%
              </span>
              <div className="text-[10px] text-slate-400 font-mono mt-1.5">
                STATUS: {selectedReport.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
              1. EXECUTIVE SUMMARY
            </h4>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed">
              {selectedReport.summary}
            </div>
          </div>

          {/* Involved Entities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[10px] block uppercase">PERSONS OF INTEREST</span>
              <div className="flex gap-2 flex-wrap">
                {selectedReport.persons_involved.map((pid) => (
                  <span key={pid} className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                    {pid}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[10px] block uppercase">CAMERAS INVOLVED</span>
              <div className="flex gap-2 flex-wrap">
                {selectedReport.cameras_involved.map((cid) => (
                  <span key={cid} className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {cid}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reconstructed Incident Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
              2. VERIFIED CHRONOLOGICAL MOVEMENT TIMELINE
            </h4>
            <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              {selectedReport.timeline.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-400 font-bold">{item.time}</span>
                    <span className="text-slate-300 font-medium font-mono">{item.camera}</span>
                    <span className="text-slate-400">({item.event})</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.person}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Citing */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
              3. VERIFIED DIGITAL EVIDENCE RECORDS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedReport.evidence_list.map((ev, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono text-cyan-400 font-bold">{ev.id}</div>
                    <div className="text-slate-200">{ev.title}</div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {(ev.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Digital Sign-off */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Signed by MultiStream AI Guardrail Engine</span>
            </div>
            <div>Generated: {selectedReport.created_at}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
