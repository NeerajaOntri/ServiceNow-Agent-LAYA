import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  ExternalLink, 
  GitCommit, 
  Layers, 
  User, 
  Calendar, 
  Tag, 
  CheckCircle2,
  Workflow
} from 'lucide-react';
import { JiraSyncCardData } from '../types';

interface JiraSyncCardProps {
  syncData: JiraSyncCardData;
}

export const JiraSyncCard: React.FC<JiraSyncCardProps> = ({ syncData }) => {
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(syncData.issueKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const typeColorMap = {
    Story: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Bug: 'bg-rose-100 text-rose-800 border-rose-300',
    Task: 'bg-blue-100 text-blue-800 border-blue-300',
    Epic: 'bg-purple-100 text-purple-800 border-purple-300',
  };

  const priorityColorMap = {
    Highest: 'text-rose-600 bg-rose-50 border-rose-200',
    High: 'text-amber-600 bg-amber-50 border-amber-200',
    Medium: 'text-blue-600 bg-blue-50 border-blue-200',
    Low: 'text-slate-600 bg-slate-50 border-slate-200',
  };

  return (
    <div className="mt-3 rounded-xl border border-blue-400/40 bg-gradient-to-b from-white via-blue-50/25 to-slate-50 p-4 shadow-md text-xs relative overflow-hidden group">
      {/* Top Accent Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500" />

      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-blue-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-700 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-xs">
            <Workflow className="w-3 h-3" />
            JIRA WORKSPACE SYNCED
          </span>
          <span className="text-[10px] font-bold text-blue-900 bg-blue-100/90 px-2 py-0.5 rounded-full border border-blue-300">
            {syncData.issueKey}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${typeColorMap[syncData.issueType] || 'bg-slate-100 text-slate-700'}`}>
            {syncData.issueType}
          </span>
          <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${priorityColorMap[syncData.priority]}`}>
            {syncData.priority}
          </span>
        </div>
      </div>

      {/* Summary Title */}
      <div className="mb-3">
        <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{syncData.summary}</span>
        </h4>
        <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
          Bi-directional traceability active between ServiceNow <span className="font-mono text-teal-800 font-bold">[{syncData.serviceNowRef.table}]</span> and Jira project <span className="font-mono font-bold text-blue-800">[{syncData.projectKey}]</span>.
        </p>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-100/70 border border-slate-200/80 mb-3 text-[11px]">
        {/* Jira Issue Key with Quick Copy */}
        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200/60">
          <span className="text-slate-500 font-medium">Jira Issue Key:</span>
          <div className="flex items-center gap-1.5 font-mono font-bold text-blue-900">
            <span>{syncData.issueKey}</span>
            <button
              onClick={handleCopyKey}
              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Copy Jira Key"
            >
              {copiedKey ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Sync Status */}
        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200/60">
          <span className="text-slate-500 font-medium">Sync Status:</span>
          <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {syncData.status}
          </span>
        </div>

        {/* Sprint */}
        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200/60">
          <span className="text-slate-500 font-medium">Sprint:</span>
          <span className="font-medium text-slate-700 truncate max-w-[140px] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {syncData.sprint}
          </span>
        </div>

        {/* Assignee */}
        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200/60">
          <span className="text-slate-500 font-medium">Assignee:</span>
          <span className="font-medium text-slate-800 truncate max-w-[140px] flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            {syncData.assignee}
          </span>
        </div>
      </div>

      {/* Direct Clickable Deep Link */}
      <div className="space-y-2 pt-2 border-t border-slate-200/80">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span>Jira Workspace Tracking URL:</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(syncData.jiraUrl);
            }}
            className="text-[10px] text-blue-700 hover:text-blue-900 font-mono hover:underline cursor-pointer"
            title="Copy URL"
          >
            Copy Link
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-blue-50/60 border border-blue-200/70">
          <a
            href={syncData.jiraUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono font-medium text-blue-900 hover:text-blue-700 hover:underline break-all flex-1"
          >
            {syncData.jiraUrl}
          </a>

          <a
            href={syncData.jiraUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition-all duration-150 cursor-pointer group/link hover:shadow-md"
          >
            <span>Open in Jira</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};
