import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Event, EvidenceItem } from '../../types';
import { EvidenceModal } from '../common/EvidenceModal';
import { Clock, Search, Filter, Video, RefreshCw, User } from 'lucide-react';

interface EventTimelineViewProps {
  mode?: 'timeline' | 'search';
}

export const EventTimelineView: React.FC<EventTimelineViewProps> = ({ mode = 'timeline' }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraFilter, setCameraFilter] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  const sampleQueries = [
    'Find the person wearing a blue shirt.',
    'Show P023 after 10:20 AM.',
    'Find activity near the parking area.',
    'Unattended package in corridor'
  ];

  useEffect(() => {
    loadEvents();
  }, [cameraFilter, personFilter, eventTypeFilter]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents({
        camera_id: cameraFilter || undefined,
        person_id: personFilter || undefined,
        event_type: eventTypeFilter || undefined
      });
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery !== undefined ? customQuery : searchQuery).trim();
    if (!query) {
      loadEvents();
      return;
    }
    setLoading(true);
    try {
      const res = await api.searchEvents(query);
      setEvents(res.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryClick = (q: string) => {
    setSearchQuery(q);
    handleSearch(undefined, q);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
              {mode === 'search' ? <Search className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                {mode === 'search' ? 'SURVEILLANCE SEARCH & FILTER' : 'CHRONOLOGICAL EVENT TIMELINE'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'search'
                  ? 'Natural-language queries & multi-attribute metadata search'
                  : 'Temporally ordered surveillance events across all monitored cameras'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people, objects, activities (e.g. 'person wearing blue shirt', 'unattended package', 'parking exit')..."
              className="w-full bg-[#070B14] border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs font-mono transition-all cursor-pointer shadow-md shadow-cyan-500/20"
          >
            SEARCH
          </button>
        </form>

        {/* Sample queries for Search Mode */}
        {mode === 'search' && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Suggested:</span>
            {sampleQueries.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQueryClick(sq)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {sq}
              </button>
            ))}
          </div>
        )}

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>FILTER BY:</span>
          </div>

          {/* Camera Filter */}
          <select
            value={cameraFilter}
            onChange={(e) => setCameraFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Cameras</option>
            <option value="CAM-01">Camera 01 – Main Gate</option>
            <option value="CAM-02">Camera 02 – Corridor A</option>
            <option value="CAM-03">Camera 03 – Reception</option>
            <option value="CAM-04">Camera 04 – Parking Lot</option>
          </select>

          {/* Person Filter */}
          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Persons</option>
            <option value="P023">P023 (Subject in Blue Shirt)</option>
            <option value="P014">P014 (Associate in Dark Jacket)</option>
            <option value="P007">P007 (Security Guard)</option>
            <option value="P011">P011 (Delivery Courier)</option>
            <option value="P018">P018 (Dr. Meera Sen)</option>
            <option value="P005">P005 (Contractor)</option>
          </select>

          {/* Event Type Filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Event Types</option>
            <option value="entry">Entry</option>
            <option value="exit">Exit</option>
            <option value="walking">Walking</option>
            <option value="interaction">Interaction</option>
            <option value="suspicious_activity">Suspicious Activity</option>
          </select>

          {(cameraFilter || personFilter || eventTypeFilter || searchQuery) && (
            <button
              onClick={() => {
                setCameraFilter('');
                setPersonFilter('');
                setEventTypeFilter('');
                setSearchQuery('');
                loadEvents();
              }}
              className="text-xs text-cyan-400 hover:underline cursor-pointer font-mono"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Events Table / Timeline List */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
            {mode === 'search' ? 'MATCHED SEARCH RESULTS' : 'RECORDED TIMELINE EVENTS'} ({events.length} EVENTS)
          </h3>
          <button
            onClick={loadEvents}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            title="Refresh events"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin mr-2 text-cyan-400" />
            Querying event database & embeddings...
          </div>
        ) : events.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-mono">
            No events match your criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-4 hover:bg-slate-900/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {/* Event Type Icon Badge */}
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0 font-mono text-xs font-bold mt-0.5">
                    {evt.camera_id.split('-')[1]}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white font-mono">{evt.camera_name || evt.camera_id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 uppercase font-semibold">
                        {evt.event_type}
                      </span>
                      {evt.global_person_id && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {evt.global_person_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{evt.description}</p>
                    <div className="text-[11px] font-mono text-slate-500 flex items-center gap-3">
                      <span>TIME: {evt.start_time}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        CONFIDENCE: {(evt.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() =>
                      setSelectedEvidence({
                        id: `EVD-${evt.id}`,
                        event_id: evt.id,
                        camera_id: evt.camera_id,
                        camera_name: evt.camera_name,
                        person_id: evt.global_person_id,
                        title: `${evt.camera_name || evt.camera_id} - ${evt.event_type.toUpperCase()}`,
                        timestamp: evt.start_time,
                        frame_image_url: evt.frame_path,
                        confidence: evt.confidence,
                        notes: evt.description
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>[VIEW EVIDENCE]</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
};
