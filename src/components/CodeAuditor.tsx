import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Play, 
  ArrowRight,
  Code
} from 'lucide-react';
import { ANTI_PATTERNS } from '../data/servicenowData';
import { DetectedIssue } from '../types';

const SAMPLE_BAD_SNIPPET = `(function executeRule(current, previous /*null when async*/) {
  // Check if priority is critical
  if (current.priority == 1) {
    // ❌ Anti-pattern: Hardcoded sys_id
    var supportGroupId = '46d44a23a9fe19810012d100cca80666';
    current.assignment_group = supportGroupId;
    
    // ❌ Anti-pattern: Unbounded query without setLimit
    var grAudit = new GlideRecord('sys_audit');
    grAudit.addQuery('documentkey', current.sys_id);
    grAudit.query();
    
    // ❌ Anti-pattern: Calling current.update() inside Business Rule!
    current.update();
  }
})(current, previous);`;

export const CodeAuditor: React.FC = () => {
  const [code, setCode] = useState(SAMPLE_BAD_SNIPPET);
  const [issues, setIssues] = useState<DetectedIssue[]>([]);
  const [hasScanned, setHasScanned] = useState(false);

  const runAudit = () => {
    const found: DetectedIssue[] = [];
    ANTI_PATTERNS.forEach((rule) => {
      // Reset regex state
      rule.regex.lastIndex = 0;
      const match = rule.regex.exec(code);
      if (match) {
        found.push({
          rule,
          matchText: match[0],
        });
      }
    });

    setIssues(found);
    setHasScanned(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#032D42]">
              ServiceNow Code Auditor & Anti-Pattern Scanner
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Audit Business Rules, Script Includes, and Client Scripts for recursive loops, hardcoded sys_ids, and performance bottlenecks.
          </p>
        </div>

        <button
          onClick={runAudit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0080A3] hover:bg-[#032D42] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Scan Code Now</span>
        </button>
      </div>

      {/* Editor & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Paste ServiceNow Script
            </span>
            <button
              onClick={() => {
                setCode(SAMPLE_BAD_SNIPPET);
                setHasScanned(false);
              }}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
            >
              Reset to Sample
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setHasScanned(false);
            }}
            placeholder="// Paste Business Rule or Client Script here..."
            className="w-full h-[420px] bg-[#0d1520] text-emerald-300 font-mono text-xs p-4 rounded-xl focus:outline-none resize-none leading-relaxed border border-slate-800"
            spellCheck={false}
          />
        </div>

        {/* Audit Results */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Audit Findings ({hasScanned ? issues.length : 0})
            </h3>
            {hasScanned && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  issues.length === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {issues.length === 0 ? 'All Clean' : `${issues.length} Issues Found`}
              </span>
            )}
          </div>

          {!hasScanned ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-slate-400 space-y-3">
              <Code className="w-8 h-8 text-slate-300" />
              <p className="text-xs">
                Click <strong>Scan Code Now</strong> to analyze your script against ServiceNow production standards.
              </p>
            </div>
          ) : issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-emerald-600 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <div>
                <h4 className="font-bold text-sm text-slate-800">No Violations Detected!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your script passed all standard checks for infinite recursion, sys_id pollution, and unbounded queries.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[420px] pr-1">
              {issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-900">
                        {issue.rule.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                      {issue.rule.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {issue.rule.explanation}
                  </p>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                    <span className="font-bold block mb-1">Recommended Fix:</span>
                    {issue.rule.remediation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
