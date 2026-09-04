import React, { useState } from 'react';
import { ANTI_PATTERN_RULES } from '../data/servicenowData';
import { DetectedIssue, AntiPatternRule } from '../types';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  ArrowRight, 
  Code, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface CodeAuditorProps {
  onAskLaya: (prompt: string) => void;
}

const SAMPLE_BUGGY_CODE = `(function executeRule(current, previous /*null when async*/) {
    // 1. Insecure query bypassing user ACLs
    var userGr = new GlideRecord('sys_user');
    userGr.addQuery('department', '=' + current.department);
    userGr.query();

    // 2. Hardcoded sys_id
    var vipGroupId = 'd625dccec0a8016700a222a0f7900d03';

    if (current.priority == 1) {
        current.assignment_group = vipGroupId;
        // 3. Dangerous recursion!
        current.update();
    }

    // 4. Uncategorized print
    gs.print("Processed incident: " + current.number);

})(current, previous);`;

export const CodeAuditor: React.FC<CodeAuditorProps> = ({ onAskLaya }) => {
  const [code, setCode] = useState(SAMPLE_BUGGY_CODE);
  const [issues, setIssues] = useState<DetectedIssue[]>([]);
  const [scanned, setScanned] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const runAudit = () => {
    const lines = code.split('\n');
    const detected: DetectedIssue[] = [];

    ANTI_PATTERN_RULES.forEach((rule) => {
      lines.forEach((line, lineIndex) => {
        // Test against line
        if (rule.regex.test(line)) {
          detected.push({
            rule,
            matchLine: lineIndex + 1,
            matchText: line.trim(),
          });
        }
        // Reset regex state
        rule.regex.lastIndex = 0;
      });
    });

    setIssues(detected);
    setScanned(true);
  };

  const loadSample = (sample: string) => {
    setCode(sample);
    setScanned(false);
    setIssues([]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900">
              ServiceNow Anti-Pattern & Best Practice Scanner
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Detect recursive <code>current.update()</code>, synchronous GlideAjax, client-side GlideRecord, SQL injection risks, and hardcoded sys_ids.
          </p>
        </div>

        <button
          onClick={() =>
            onAskLaya(
              `Please review this ServiceNow script for security, performance, and best practices:\n\n\`\`\`javascript\n${code}\n\`\`\``
            )
          }
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0080A3] hover:bg-[#006682] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask LAYA to Refactor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Editor Input */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Script to Scan
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Preset:</span>
                <button
                  onClick={() => loadSample(SAMPLE_BUGGY_CODE)}
                  className="text-[#0080A3] hover:underline cursor-pointer font-medium"
                >
                  Insecure Business Rule
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={16}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setScanned(false);
                }}
                className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-900 text-slate-100 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0080A3] leading-relaxed scrollbar-thin"
                placeholder="Paste ServiceNow JavaScript here (Business Rule, Script Include, Client Script)..."
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Checks 7 certified ServiceNow security & performance rules
              </span>
              <button
                onClick={runAudit}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#032D42] hover:bg-[#0080A3] text-white text-xs font-semibold rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Scan Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Detected Issues & Recommendations */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 min-h-[420px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>Audit Results</span>
                {scanned && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      issues.length === 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'} Found
                  </span>
                )}
              </h3>
            </div>

            {!scanned ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-2">
                <ShieldAlert className="w-12 h-12 text-slate-300" />
                <p className="text-xs">Click "Scan Code" to inspect your script for ServiceNow anti-patterns.</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-600 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
                <h4 className="text-base font-bold text-slate-800">Clean Script! No Anti-Patterns Found</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Your code adheres to ServiceNow certified standards: no recursive calls, no unparameterized queries, and proper logging.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {issues.map((issue, idx) => {
                  const isCritical = issue.rule.severity === 'CRITICAL';
                  const isWarning = issue.rule.severity === 'WARNING';

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-lg border text-xs space-y-2.5 transition-all ${
                        isCritical
                          ? 'bg-rose-50/70 border-rose-200'
                          : isWarning
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-blue-50/70 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {isCritical ? (
                            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          ) : (
                            <Info className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                          <span className="font-bold text-slate-900">
                            {issue.rule.title}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isCritical
                              ? 'bg-rose-600 text-white'
                              : isWarning
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {issue.rule.severity}
                        </span>
                      </div>

                      {issue.matchLine && (
                        <div className="font-mono text-[11px] text-slate-700 bg-white/80 px-2 py-1 rounded border border-slate-200">
                          Line {issue.matchLine}: <code className="text-rose-700 font-bold">{issue.matchText}</code>
                        </div>
                      )}

                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {issue.rule.explanation}
                      </p>

                      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-700 font-semibold">
                          Recommendation: {issue.rule.remediation}
                        </span>
                        <button
                          onClick={() => handleCopy(issue.rule.sampleGood, `rule-${idx}`)}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Copy recommended pattern"
                        >
                          {copiedId === `rule-${idx}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Fix</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
