import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { LiveCameraGrid } from './components/surveillance/LiveCameraGrid';
import { AIChatInvestigation } from './components/investigation/AIChatInvestigation';
import { PersonJourneyView } from './components/journey/PersonJourneyView';
import { EventTimelineView } from './components/timeline/EventTimelineView';
import { AlertCenterView } from './components/alerts/AlertCenterView';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { RefreshCw } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center text-slate-400 font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
        Initializing cryptographic session & surveillance matrix...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <OverviewDashboard setActiveView={setActiveView} />;
      case 'cameras':
        return <LiveCameraGrid />;
      case 'investigation':
        return <AIChatInvestigation />;
      case 'journey':
        return <PersonJourneyView />;
      case 'timeline':
        return <EventTimelineView mode="timeline" />;
      case 'search':
        return <EventTimelineView mode="search" />;
      case 'alerts':
        return <AlertCenterView />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <OverviewDashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      <Header activeView={activeView} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainLayout />
      </DataProvider>
    </AuthProvider>
  );
}
