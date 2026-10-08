import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, LogOut, Database, PlaySquare } from 'lucide-react';
import { useDataMode } from '../../context/DataContext';

interface HeaderProps {
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({ activeView }) => {
  const { user, logout } = useAuth();
  const { dataMode, setDataMode } = useDataMode();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-[#0B1120]/90 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
            MULTISTREAM <span className="text-cyan-400">AI</span>
            <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">v1.0</span>
          </div>
          <div className="text-[11px] text-slate-400 font-sans">Multi-Stream Video Intelligence Platform</div>
        </div>
      </div>

      {/* Center: Mode Toggle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#0D1424] p-1 rounded-lg border border-slate-800/80 shadow-sm">
        <button
          onClick={() => setDataMode('demo')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
            dataMode === 'demo'
              ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/50'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <PlaySquare className="w-3.5 h-3.5" />
          DEMO / SIMULATION
        </button>
        <button
          onClick={() => setDataMode('real')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
            dataMode === 'real'
              ? 'bg-red-950/40 text-red-400 shadow-sm border border-red-900/50'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          REAL FOOTAGE
        </button>
      </div>

      {/* Right: User Profile & Direct Logout Button */}
      <div className="flex items-center gap-4">
        {/* User Profile Info */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pl-3 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-slate-200">{user?.full_name || 'Security Officer'}</div>
              <div className="text-[10px] text-slate-400 font-mono">{user?.phone_number || '+91 9876543210'}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
              {user?.full_name ? user.full_name[0] : 'S'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0D1424] border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-800/80">
                <div className="text-xs font-semibold text-white">{user?.full_name}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{user?.phone_number}</div>
                <div className="text-[10px] text-cyan-400 font-mono mt-1">{user?.department}</div>
              </div>

              <div className="py-1">
                <div className="px-4 py-1.5 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Role</span>
                  <span className="font-mono text-cyan-400 text-[10px] uppercase">{user?.role?.replace('_', ' ')}</span>
                </div>
                <div className="px-4 py-1.5 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Status</span>
                  <span className="font-mono text-emerald-400 text-[10px]">Active</span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-1 mt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-950/30 flex items-center gap-2 cursor-pointer transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Direct Always-Visible Logout Button */}
        <button
          onClick={logout}
          title="Terminate session and logout"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 hover:border-red-500/60 text-red-300 hover:text-red-100 text-xs font-mono transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" />
          <span className="font-semibold">LOGOUT</span>
        </button>
      </div>
    </header>
  );
};
