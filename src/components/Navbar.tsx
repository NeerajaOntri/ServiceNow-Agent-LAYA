import React from 'react';
import { ActiveTab } from '../types';
import { 
  Bot, 
  Filter, 
  LayoutTemplate, 
  ShieldAlert, 
  Palette, 
  BookOpen,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  serverStatus: 'online' | 'connecting' | 'offline';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  serverStatus,
}) => {
  const tabs = [
    { id: 'chat' as ActiveTab, label: 'LAYA Assistant', icon: Bot },
    { id: 'queryBuilder' as ActiveTab, label: 'Encoded Query', icon: Filter },
    { id: 'widgetStudio' as ActiveTab, label: 'Widget Studio', icon: LayoutTemplate },
    { id: 'codeAuditor' as ActiveTab, label: 'Code Auditor', icon: ShieldAlert },
    { id: 'tokens' as ActiveTab, label: 'Horizon Tokens', icon: Palette },
    { id: 'apiRef' as ActiveTab, label: 'API Reference', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#032D42] text-white shadow-md border-b border-teal-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0080A3] to-teal-400 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-500/20">
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
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/40 p-1 rounded-xl border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#0080A3] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Server Connection Status Badge */}
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                serverStatus === 'online'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                  : serverStatus === 'connecting'
                  ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                  : 'bg-rose-950/60 text-rose-400 border-rose-500/30'
              }`}
              title={
                serverStatus === 'online'
                  ? 'API is ready and connected to Gemini'
                  : serverStatus === 'connecting'
                  ? 'Connecting to backend...'
                  : 'Server offline'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  serverStatus === 'online'
                    ? 'bg-emerald-400 animate-pulse'
                    : serverStatus === 'connecting'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              <span className="capitalize">{serverStatus}</span>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Tab Scroller */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-white/10 scrollbar-none">
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
