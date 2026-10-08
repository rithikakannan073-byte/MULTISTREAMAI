import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Person, EvidenceItem } from '../../types';
import { EvidenceModal } from '../common/EvidenceModal';
import { Route, User, Clock, ArrowRight, Video, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, Users } from 'lucide-react';

export const PersonJourneyView: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('P023');
  const [journeyData, setJourneyData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  useEffect(() => {
    loadPersons();
  }, []);

  useEffect(() => {
    if (selectedPersonId) {
      loadJourney(selectedPersonId);
    }
  }, [selectedPersonId]);

  const loadPersons = async () => {
    try {
      const data = await api.getPersons();
      setPersons(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadJourney = async (id: string) => {
    setLoading(true);
    try {
      const data = await api.getPersonJourney(id);
      setJourneyData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentPerson = persons.find((p) => p.id === selectedPersonId) || journeyData?.person;

  return (
    <div className="space-y-6">
      {/* Top Person Selector Bar */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              CROSS-CAMERA PERSON JOURNEY RECONSTRUCTION
            </h2>
            <p className="text-xs text-slate-400">
              OSNet Global Re-ID Identity Mapping Across Surveillance Cameras
            </p>
          </div>
        </div>

        {/* Person Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {persons.slice(0, 6).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPersonId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedPersonId === p.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {p.id} {p.status === 'flagged' && '⚠️'}
            </button>
          ))}
        </div>
      </div>

      {loading || !journeyData ? (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-400">
          Reconstructing spatial movement trajectory...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Subject Card & Forensic Summary */}
          <div className="space-y-4">
            <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-base">
                  {currentPerson?.id}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{currentPerson?.name_or_alias}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                        currentPerson?.status === 'flagged'
                          ? 'bg-red-950/60 text-red-400 border-red-500/40'
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {currentPerson?.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Re-ID: {(currentPerson?.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-cyan-400 font-semibold font-mono block mb-1">VISUAL DESCRIPTION</span>
                {currentPerson?.visual_description}
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">FIRST SEEN</span>
                  <span className="text-white font-medium">{currentPerson?.first_seen.split(' ')[-1]}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">LAST SEEN</span>
                  <span className="text-white font-medium">{currentPerson?.last_seen.split(' ')[-1]}</span>
                </div>
              </div>

              {/* Cameras Traversed */}
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block mb-2">
                  CAMERAS TRAVERSED ({currentPerson?.cameras_visited.length})
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {currentPerson?.cameras_visited.map((camId: string, idx: number) => (
                    <span
                      key={camId}
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1"
                    >
                      <span>{camId}</span>
                      {idx < currentPerson.cameras_visited.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-slate-500 ml-1" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Companion / Interactions Panel */}
            {journeyData.interactions && journeyData.interactions.length > 0 && (
              <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="text-xs font-mono text-purple-400 font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>IDENTIFIED PROXIMITY INTERACTIONS</span>
                </div>
                {journeyData.interactions.map((interaction: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{interaction.person_name}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{interaction.person_id}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{interaction.description}</p>
                    <div className="text-[10px] font-mono text-slate-500 pt-1">
                      Time: {interaction.timestamp.split(' ')[-1]} • Cam: {interaction.camera_id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (2 cols): Chronological Journey Timeline */}
          <div className="lg:col-span-2 bg-[#0B1120] border border-slate-800 rounded-xl p-6">
            <h3 className="text-xs uppercase tracking-wider font-mono font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>CHRONOLOGICAL MOVEMENT TRAJECTORY ({journeyData.timeline.length} VERIFIED STOPS)</span>
            </h3>

            <div className="relative border-l-2 border-cyan-500/30 ml-4 space-y-8 pb-4">
              {journeyData.timeline.map((node: any, idx: number) => (
                <div key={idx} className="relative pl-7 group">
                  {/* Step circle */}
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-[#0B1120] border-2 border-cyan-400 flex items-center justify-center text-xs font-mono font-bold text-cyan-400 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
                    {node.step_number}
                  </div>

                  {/* Step Card */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/40 transition-colors shadow-md space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{node.camera_name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 uppercase">
                          {node.event_type}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-cyan-300 font-semibold">
                        {node.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {node.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] text-emerald-400">
                        CONFIDENCE: {(node.confidence * 100).toFixed(0)}%
                      </span>
                      <button
                        onClick={() =>
                          setSelectedEvidence({
                            id: node.evidence_id,
                            event_id: node.event_id,
                            camera_id: node.camera_id,
                            camera_name: node.camera_name,
                            person_id: selectedPersonId,
                            title: `${node.camera_name} - ${node.event_type.toUpperCase()}`,
                            timestamp: node.full_timestamp,
                            frame_image_url: node.frame_url,
                            confidence: node.confidence,
                            notes: node.description
                          })
                        }
                        className="py-1 px-3 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-400 text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>[VIEW EVIDENCE]</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
