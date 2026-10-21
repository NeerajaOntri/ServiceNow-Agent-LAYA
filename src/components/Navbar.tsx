import React from 'react';
import { ActiveTab, InstanceStatus, TeamMember } from '../types';
import { 
  Home, 
  Bot, 
  Activity, 
  Users, 
  Server, 
  UserPlus,
  LogOut,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  serverStatus: 'online' | 'connecting' | 'offline';
  instanceStatus: InstanceStatus | null;
  activeDeveloper?: TeamMember | null;
  onSelectDeveloper?: (member: TeamMember) => void;
  teamMembers?: TeamMember[];
  onToggleActiveSetState?: () => void;
  onOpenAddDevModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  serverStatus,
  instanceStatus,
  activeDeveloper,
  onSelectDeveloper,
  teamMembers,
  onToggleActiveSetState,
  onOpenAddDevModal,
  onLogout,
}) => {
  const shortInstanceName = instanceStatus?.instanceUrl
    ? instanceStatus.instanceUrl.replace(/^https?:\/\//, '').replace('.service-now.com', '').replace(/\/$/, '')
    : 'dev442469';

  const tabs = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'aiWorkspace' as ActiveTab, label: 'AI Workspace', icon: Bot, badge: 'AI' },
    { id: 'intelligence' as ActiveTab, label: 'Intelligence', icon: Activity, badge: 'LIVE' },
    { id: 'admin' as ActiveTab, label: 'Admin', icon: Users, badge: teamMembers ? `${teamMembers.length}` : '0' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#032D42] text-white shadow-md border-b border-teal-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div 
              onClick={() => setActiveTab('home')} 
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0080A3] to-teal-400 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-500/20 cursor-pointer"
            >
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-mono">
                  LAYA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0080A3] text-teal-100 tracking-wide uppercase">
                  DeepKorce Orchestrator
                </span>
              </div>
              <p className="text-[11px] text-teal-300 font-semibold tracking-wide">
                DeepKorce Autonomous PDI Engine
              </p>
            </div>
          </div>

          {/* Essential 4 Navigation Items */}
          <nav className="flex items-center space-x-1.5 bg-slate-900/50 p-1 rounded-xl border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer shrink-0 relative ${
                    isActive
                      ? 'bg-[#0080A3] text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        tab.badge === 'LIVE'
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : tab.badge === 'AI'
                          ? 'bg-teal-400 text-slate-950 font-black'
                          : 'bg-teal-500/30 text-teal-200'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Indicators: Developer Profile Switcher, Instance & Logout */}
          <div className="flex items-center gap-2.5 text-xs shrink-0">
            {/* Instance badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/70 border border-teal-500/30 px-3 py-1.5 rounded-xl text-slate-200">
              <Server className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-mono text-[11px] font-bold text-teal-300">dev442469</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Connected" />
            </div>

            {/* Add Developer Button */}
            {onOpenAddDevModal && (
              <button
                onClick={onOpenAddDevModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                title="Add Developer Persona"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Add Dev</span>
              </button>
            )}

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                title="Sign out of enterprise session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
