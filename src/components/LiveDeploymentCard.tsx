import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Server, 
  Clock, 
  RotateCcw, 
  Layers, 
  AlertTriangle,
  User,
  Database
} from 'lucide-react';
import { DeploymentResultCard } from '../types';

interface LiveDeploymentCardProps {
  deployment: DeploymentResultCard;
  onRetry?: () => void;
}

export const LiveDeploymentCard: React.FC<LiveDeploymentCardProps> = ({
  deployment,
  onRetry,
}) => {
  const [copiedSysId, setCopiedSysId] = useState(false);

  const handleCopySysId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deployment.sysId) return;
    navigator.clipboard.writeText(deployment.sysId);
    setCopiedSysId(true);
    setTimeout(() => setCopiedSysId(false), 2000);
  };

  const instanceHost = (deployment.instanceUrl || 'https://dev442469.service-now.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const deepLink = deployment.deepLink || `https://${instanceHost}/now/nav/ui/classic/params/target/${deployment.table}.do?sys_id=${deployment.sysId}`;

  if (!deployment.success) {
    return (
      <div className="mt-3.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-200/80">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-rose-800 text-[11px]">
              DEPLOYMENT BLOCKED — DEV442469
            </span>
          </div>
          <span className="font-mono text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-bold">
            Table: {deployment.table}
          </span>
        </div>

        <p className="text-slate-800 font-medium mb-2 leading-relaxed">
          {deployment.error || 'Failed to complete REST transaction on ServiceNow Table API.'}
        </p>

        {deployment.explanation && (
          <p className="text-slate-600 text-[11px] mb-3">
            {deployment.explanation}
          </p>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Deployment</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3.5 rounded-xl border border-emerald-500/40 bg-gradient-to-b from-white via-emerald-50/20 to-slate-50 p-4 shadow-md text-xs relative overflow-hidden group">
      {/* Top Accent Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-[#0080A3]" />

      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-emerald-100">
        <div className="flex flex-wrap items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-xs">
            <CheckCircle2 className="w-3 h-3" />
            NOW ASSIST AUTONOMOUS EXECUTION COMPLETE
          </span>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300/80">
            DEPLOYED TO INSTANCE DEV442469
          </span>
          {deployment.selfCorrected && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300">
              Self-Corrected & Auto-Healed
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold border border-slate-200">
            {deployment.table}
          </span>
          {deployment.executionTimeMs !== undefined && (
            <span className="flex items-center gap-1 text-slate-500 bg-slate-100/70 px-1.5 py-0.5 rounded text-[10px]">
              <Clock className="w-3 h-3 text-slate-400" />
              {deployment.executionTimeMs}ms
            </span>
          )}
        </div>
      </div>

      {/* Record Summary Title */}
      <div className="mb-3">
        <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          <Database className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{deployment.recordSummary}</span>
        </h4>
        {deployment.explanation && (
          <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
            {deployment.explanation}
          </p>
        )}
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-100/70 border border-slate-200/80 mb-3 text-[11px]">
        {/* SysID with Quick Copy */}
        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200/60">
          <span className="text-slate-500 font-medium">Record sys_id:</span>
          <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
            <span className="truncate max-w-[130px]">{deployment.sysId}</span>
            <button
              onClick={handleCopySysId}
              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Copy sys_id to clipboard"
            >
              {copiedSysId ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Target Instance */}
        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200/60">
          <span className="text-slate-500 font-medium">Instance:</span>
          <span className="font-mono font-bold text-teal-800 flex items-center gap-1">
            <Server className="w-3 h-3 text-teal-600" />
            dev442469
          </span>
        </div>

        {/* Update Set Scope */}
        {deployment.updateSetName && (
          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200/60">
            <span className="text-slate-500 font-medium">Update Set:</span>
            <span className="font-mono font-bold text-indigo-700 truncate max-w-[130px] flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-500" />
              {deployment.updateSetName}
            </span>
          </div>
        )}

        {/* Developer Persona */}
        {deployment.developerName && (
          <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200/60">
            <span className="text-slate-500 font-medium">Persona:</span>
            <span className="font-medium text-slate-800 truncate max-w-[130px] flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              {deployment.developerName}
            </span>
          </div>
        )}
      </div>

      {/* Direct Clickable Deep Link */}
      <div className="space-y-2 pt-2 border-t border-slate-200/80">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span>Direct Record URL:</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(deepLink);
            }}
            className="text-[10px] text-teal-700 hover:text-teal-900 font-mono hover:underline cursor-pointer"
            title="Copy URL"
          >
            Copy Link
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-teal-50/60 border border-teal-200/70">
          <a
            href={deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono font-medium text-teal-900 hover:text-teal-700 hover:underline break-all flex-1"
          >
            {deepLink}
          </a>

          <a
            href={deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0080A3] hover:bg-[#032D42] text-white font-bold text-xs shadow-sm transition-all duration-150 cursor-pointer group/link hover:shadow-md"
          >
            <span>Open in ServiceNow</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};
