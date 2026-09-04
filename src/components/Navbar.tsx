import React from 'react';
import { ActiveTab } from '../types';
import { 
  Bot, 
  Code2, 
  Layers, 
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
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'chat', label: 'LAYA Assistant', icon: <Bot className="w-4 h-4" />, badge: 'AI' },
    { id: 'queryBuilder', label: 'Encoded Query', icon: <Code2 className="w-4 h-4" /> },
    { id: 'widgetStudio', label: 'Portal Widget Studio', icon: <Layers className="w-4 h-4" /> },
    { id: 'codeAuditor', label: 'Anti-Pattern Scanner', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'tokens', label: 'Horizon Tokens', icon: <Palette className="w-4 h-4" /> },
    { id: 'apiRef', label: 'API Reference', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#032D42] text-white border-b border-[#0A3D56] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0080A3] to-[#00B589] flex items-center justify-center shadow-inner text-white font-bold text-lg tracking-wider border border-white/20">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  LAYA
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0080A3]/30 border border-[#00B589]/40 text-[#00E5A3]">
                  ServiceNow Specialist
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                Full-Stack Architecture & Development Studio
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-700/60 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  serverStatus === 'online'
                    ? 'bg-emerald-400 animate-pulse'
                    : serverStatus === 'connecting'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-slate-300 font-medium text-[11px]">
                {serverStatus === 'online' ? 'Gemini Active' : serverStatus === 'connecting' ? 'Connecting' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none py-1 border-t border-white/10">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0080A3] text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
