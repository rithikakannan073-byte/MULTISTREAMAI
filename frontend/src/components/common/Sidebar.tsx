import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Video,
  BotMessageSquare,
  Route,
  Clock,
  Search,
  Bell,
  BarChart3,
  Shield,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'cameras',
      label: 'Live Cameras',
      icon: Video,
    },
    {
      id: 'investigation',
      label: 'AI Investigation',
      icon: BotMessageSquare,
    },
    {
      id: 'journey',
      label: 'Person Journey',
      icon: Route,
    },
    {
      id: 'timeline',
      label: 'Event Timeline',
      icon: Clock,
    },
    {
      id: 'search',
      label: 'Search & Filter',
      icon: Search,
    },
    {
      id: 'alerts',
      label: 'Alert Center',
      icon: Bell,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-64 bg-[#0B1120] border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Brand Header in Sidebar */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Shield className="w-4 h-4" />
        </div>
        <div className="text-xs uppercase tracking-widest font-mono text-white font-bold">
          MULTISTREAM <span className="text-cyan-400">AI</span>
        </div>
      </div>

      {/* Nav items list */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 hover:border-red-500/60 text-red-300 hover:text-red-100 text-xs font-mono font-medium transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" />
          <span>SECURE LOGOUT</span>
        </button>
      </div>
    </aside>
  );
};
