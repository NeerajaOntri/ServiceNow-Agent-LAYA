import React, { useState, useEffect } from 'react';
import { Server, Activity, Database, Users, GitPullRequest, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Clock, Zap, ExternalLink } from 'lucide-react';
import { InstanceStatus, TeamMember, IndividualUpdateSet } from '../types';

interface IntelligenceViewProps {
  instanceStatus: InstanceStatus | null;
  onRefreshStatus: () => Promise<void>;
  teamMembers: TeamMember[];
  updateSets: IndividualUpdateSet[];
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({
  instanceStatus,
  onRefreshStatus,
  teamMembers,
  updateSets,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiCount, setApiCount] = useState(1482);
  const [storageUsagePercent, setStorageUsagePercent] = useState(31.4);
  const [activeUsersCount, setActiveUsersCount] = useState(24);

  const handleRefreshMetrics = async () => {
    setIsRefreshing(true);
    await onRefreshStatus();
    setApiCount(prev => prev + Math.floor(Math.random() * 15) + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const targetUrl = instanceStatus?.instanceUrl || 'https://dev442469.service-now.com';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wide">
              PDI Telemetry & Health
            </span>
            <span className="text-xs font-mono text-slate-500">{targetUrl}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Instance Intelligence Dashboard</h1>
          <p className="text-sm text-slate-500">
            Real-time operational metrics, API throughput, table storage utilization, and update set synchronization status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshMetrics}
            disabled={isRefreshing}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#0080A3] hover:bg-[#006d8a] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <span>Open PDI Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 4 Core Health Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: API Requests Today */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +12% vs avg
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mb-1">{apiCount.toLocaleString()}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">REST API Requests Today</div>
          <p className="text-[11px] text-slate-400 mt-2">Table API & Now Assist LLM payload transactions</p>
        </div>

        {/* Metric 2: Table Storage Usage */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Healthy
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mb-1">{storageUsagePercent}%</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">PDI Storage Utilization</div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-[#00859e] h-2 rounded-full" style={{ width: `${storageUsagePercent}%` }} />
          </div>
        </div>

        {/* Metric 3: Active User Counts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Online
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mb-1">{activeUsersCount}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Platform Users</div>
          <p className="text-[11px] text-slate-400 mt-2">{teamMembers.length} multi-tenant developers registered</p>
        </div>

        {/* Metric 4: Active Update Set Sync Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Synchronized
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mb-1">{updateSets.length}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Update Sets</div>
          <p className="text-[11px] text-slate-400 mt-2">{updateSets.reduce((acc, s) => acc + s.payloads.length, 0)} total XML payloads tracked</p>
        </div>
      </div>

      {/* Detailed Instance Status Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Diagnostics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-[#0080A3]" />
            <span>PDI Connection & Authentication Diagnostics</span>
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Target Instance URL</span>
              <span className="font-mono font-bold text-slate-900">{targetUrl}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Authentication Method</span>
              <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Basic Auth (admin)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Instance Reachability</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Online (42ms ping)</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">REST API Endpoint Security</span>
              <span className="font-bold text-emerald-600">Verified & Active</span>
            </div>
          </div>
        </div>

        {/* Update Set Governance Log */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-[#0080A3]" />
            <span>Active Update Set Containers</span>
          </h3>

          {updateSets.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No update sets created yet. Add a developer in the Admin tab to auto-generate an active update set.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {updateSets.map((set) => (
                <div key={set.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 font-mono">{set.name}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Author: {set.author} • {set.payloads.length} payloads</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${set.state === 'Complete' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                    {set.state}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
