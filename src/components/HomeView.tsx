import React from 'react';
import { Bot, Server, Shield, Sparkles, ArrowRight, Activity, GitPullRequest, Users, CheckCircle2, Terminal } from 'lucide-react';
import { ActiveTab, InstanceStatus, TeamMember, IndividualUpdateSet } from '../types';

interface HomeViewProps {
  userName: string;
  userEmail: string;
  setActiveTab: (tab: ActiveTab) => void;
  instanceStatus: InstanceStatus | null;
  teamMembers: TeamMember[];
  updateSets: IndividualUpdateSet[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  userName,
  userEmail,
  setActiveTab,
  instanceStatus,
  teamMembers,
  updateSets,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const activeSetCount = updateSets.filter(s => s.state !== 'Complete').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#032D42] via-[#0080A3] to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-100 text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>DeepKorce Autonomous Orchestrator Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              {getGreeting()}, {userName.split(' ')[0]}!
            </h1>
            <p className="text-teal-100/90 text-sm sm:text-base max-w-2xl font-medium">
              Your autonomous ServiceNow platform is fully synchronized with <span className="font-mono text-white underline decoration-teal-300">dev442469.service-now.com</span>. Ready to generate ITSM, ITOM, and custom platform code bound to active Update Sets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('aiWorkspace')}
              className="px-6 py-3 bg-white text-[#032D42] hover:bg-teal-50 font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Bot className="w-5 h-5 text-[#0080A3] group-hover:scale-110 transition-transform" />
              <span>Open AI Workspace</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={() => setActiveTab('intelligence')}
              className="px-6 py-3 bg-teal-900/60 hover:bg-teal-900 text-white font-bold rounded-xl border border-teal-400/30 backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Activity className="w-5 h-5 text-teal-300" />
              <span>View Instance Intelligence</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connection Widget */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Server className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Target ServiceNow PDI</h3>
            <p className="text-xs font-mono text-[#0080A3] font-semibold mb-3">
              https://dev442469.service-now.com
            </p>
            <p className="text-xs text-slate-500">
              Basic Authentication active (admin / o0JD1cAn*cU+). Automatic REST API sync and Update Set governance enabled.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Ping Latency: <strong className="text-slate-800">42ms</strong></span>
            <button onClick={() => setActiveTab('intelligence')} className="text-[#0080A3] hover:underline font-bold flex items-center gap-1">
              <span>View Health</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dynamic Team Roster Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {teamMembers.length} Active {teamMembers.length === 1 ? 'Developer' : 'Developers'}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Dynamic Team Roster</h3>
            <p className="text-xs text-slate-500 mb-3">
              {teamMembers.length === 0 
                ? 'Roster starts completely empty. Add developers live from scratch in the Admin tab to auto-generate unique Update Set containers.'
                : `${teamMembers.length} multi-developer contributors actively collaborating with isolated Update Sets.`
              }
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Active Sets: <strong className="text-slate-800">{activeSetCount}</strong></span>
            <button onClick={() => setActiveTab('admin')} className="text-[#0080A3] hover:underline font-bold flex items-center gap-1">
              <span>Manage Team</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Autonomous Governance & Audit Sync Telemetry Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-purple-600" />
                100% Compliant
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Autonomous Governance & Audit Sync</h3>
            <p className="text-xs text-slate-500 mb-3">
              Real-time PDI compliance validation, active multi-developer sync streams, and zero-conflict Update Set tracking against dev442469.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Active Sync Streams: <strong className="text-slate-800">{teamMembers.length} streams</strong></span>
            <button onClick={() => setActiveTab('intelligence')} className="text-[#0080A3] hover:underline font-bold flex items-center gap-1">
              <span>View Intelligence</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
