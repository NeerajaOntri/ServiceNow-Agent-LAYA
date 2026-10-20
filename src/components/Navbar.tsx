import React from 'react';
import { ActiveTab, InstanceStatus, TeamMember } from '../types';
import { 
  Bot, 
  Filter, 
  LayoutTemplate, 
  ShieldAlert, 
  Palette, 
  BookOpen,
  Server,
  GitMerge,
  TableProperties,
  Mail,
  ShoppingBag,
  GitPullRequest,
  Boxes,
  User,
  UserPlus,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  serverStatus: 'online' | 'connecting' | 'offline';
  instanceStatus: InstanceStatus | null;
  activeDeveloper?: TeamMember;
  onSelectDeveloper?: (member: TeamMember) => void;
  teamMembers?: TeamMember[];
  onToggleActiveSetState?: () => void;
  onOpenAddDevModal?: () => void;
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
}) => {
  const shortInstanceName = instanceStatus?.instanceUrl
    ? instanceStatus.instanceUrl.replace(/^https?:\/\//, '').replace('.service-now.com', '').replace(/\/$/, '')
    : 'dev442469';

  const tabs = [
    { id: 'chat' as ActiveTab, label: 'Now Assist AI', icon: Bot, badge: 'AUTONOMOUS' },
    { id: 'orchestrator' as ActiveTab, label: 'Enterprise Orchestrator', icon: Boxes, badge: 'E2E' },
    { id: 'instance' as ActiveTab, label: `Instance (${shortInstanceName})`, icon: Server, badge: instanceStatus?.isAuthenticated ? 'LIVE' : instanceStatus?.isReachable ? 'ONLINE' : undefined },
    { id: 'flowDesigner' as ActiveTab, label: 'Flow Designer', icon: GitMerge, badge: 'NEW' },
    { id: 'decisionTables' as ActiveTab, label: 'Decision Tables', icon: TableProperties, badge: 'NEW' },
    { id: 'emailNotifications' as ActiveTab, label: 'Email Studio', icon: Mail, badge: 'NEW' },
    { id: 'catalogStudio' as ActiveTab, label: 'Catalog Studio', icon: ShoppingBag, badge: 'NEW' },
    { id: 'updateSetManager' as ActiveTab, label: 'Update Sets', icon: GitPullRequest, badge: 'NEW' },
    { id: 'queryBuilder' as ActiveTab, label: 'Encoded Query', icon: Filter },
    { id: 'widgetStudio' as ActiveTab, label: 'Widget Studio', icon: LayoutTemplate },
    { id: 'codeAuditor' as ActiveTab, label: 'Code Auditor', icon: ShieldAlert },
    { id: 'tokens' as ActiveTab, label: 'Horizon Tokens', icon: Palette },
    { id: 'apiRef' as ActiveTab, label: 'API Reference', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#032D42] text-white shadow-md border-b border-teal-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div 
              onClick={() => setActiveTab('chat')} 
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
                  ServiceNow Dev
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Full-Stack Architecture & Studio
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden xl:flex items-center space-x-1 bg-slate-900/50 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-[50vw] scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer shrink-0 relative ${
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
                          : tab.badge === 'E2E'
                          ? 'bg-teal-400 text-slate-950 font-black'
                          : tab.badge === 'NEW'
                          ? 'bg-amber-400 text-slate-950 font-black'
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

          {/* Right Status Indicators: Developer Profile Switcher, Instance & Server */}
          <div className="flex items-center gap-2 text-xs shrink-0">
            {/* Top Developer Persona Switcher */}
            {activeDeveloper && teamMembers && onSelectDeveloper && (
              <div className="hidden md:flex items-center gap-1.5 bg-slate-900/70 border border-teal-500/30 px-2 py-1 rounded-xl">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <select
                  value={activeDeveloper.id}
                  onChange={(e) => {
                    const dev = teamMembers.find(m => m.id === e.target.value);
                    if (dev) onSelectDeveloper(dev);
                  }}
                  className="bg-transparent text-white font-mono font-bold text-[11px] focus:outline-none cursor-pointer max-w-[150px] truncate"
                  title={`Active Developer: ${activeDeveloper.name} (${activeDeveloper.role})`}
                >
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-white font-sans">
                      {m.personaCode || 'Dev'}: {m.name}
                    </option>
                  ))}
                </select>

                {onToggleActiveSetState && (
                  <button
                    onClick={onToggleActiveSetState}
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono border cursor-pointer ${
                      activeDeveloper.state === 'Complete'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-950 text-amber-300 border-amber-500/40'
                    }`}
                    title="Toggle Update Set State (sys_update_set.state)"
                  >
                    {activeDeveloper.state === 'Complete' ? '✓ Complete' : '● In Progress'}
                  </button>
                )}

                {onOpenAddDevModal && (
                  <button
                    onClick={onOpenAddDevModal}
                    className="p-1 rounded text-teal-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Add Dynamic Developer Persona & Auto-Generate Update Set on dev442469"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Instance Quick Pill */}
            <button
              onClick={() => setActiveTab('instance')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                instanceStatus?.isAuthenticated
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80'
                  : instanceStatus?.isReachable
                  ? 'bg-teal-950/60 text-teal-300 border-teal-500/30 hover:bg-teal-900/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title={`ServiceNow Instance: ${instanceStatus?.instanceUrl || 'https://dev442469.service-now.com'}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  instanceStatus?.isAuthenticated
                    ? 'bg-emerald-400 animate-pulse'
                    : instanceStatus?.isReachable
                    ? 'bg-amber-400'
                    : 'bg-slate-400'
                }`}
              />
              <span className="font-mono">{shortInstanceName}</span>
            </button>

            {/* AI Assistant Server Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                serverStatus === 'online'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                  : serverStatus === 'connecting'
                  ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                  : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
              }`}
              title={
                serverStatus === 'online'
                  ? 'AI Engine Online'
                  : serverStatus === 'connecting'
                  ? 'Connecting to backend...'
                  : 'Server offline'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  serverStatus === 'online'
                    ? 'bg-emerald-400'
                    : serverStatus === 'connecting'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              <span className="capitalize">{serverStatus}</span>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Tab Scroller */}
        <div className="flex xl:hidden overflow-x-auto py-2 gap-1 border-t border-white/10 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0080A3] text-white font-medium'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
