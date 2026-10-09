import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Code, 
  Database,
  ArrowRight,
  Zap,
  RefreshCw,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { QueryCondition, InstanceStatus, TableRecord } from '../types';
import { 
  SERVICENOW_TABLES, 
  COMMON_FIELDS, 
  QUERY_OPERATORS 
} from '../data/servicenowData';

interface QueryBuilderProps {
  initialTable?: string;
  initialQuery?: string;
  instanceStatus?: InstanceStatus | null;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  initialTable,
  initialQuery,
  instanceStatus,
}) => {
  const [selectedTable, setSelectedTable] = useState(initialTable || 'incident');
  const [conditions, setConditions] = useState<QueryCondition[]>([
    { id: '1', field: 'active', operator: '=', value: 'true', conjunction: '^' },
    { id: '2', field: 'priority', operator: '=', value: '1', conjunction: '^' },
  ]);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Live execution state
  const [isExecutingLive, setIsExecutingLive] = useState(false);
  const [liveResults, setLiveResults] = useState<TableRecord[] | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isFallbackResult, setIsFallbackResult] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);

  const instanceHost = instanceStatus?.instanceUrl
    ? instanceStatus.instanceUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : 'dev213909.service-now.com';
  const shortInstanceName = instanceHost.split('.')[0] || 'dev213909';

  useEffect(() => {
    if (initialTable) setSelectedTable(initialTable);
  }, [initialTable]);

  const availableFields = COMMON_FIELDS[selectedTable] || COMMON_FIELDS.incident;

  const addCondition = () => {
    const newCond: QueryCondition = {
      id: String(Date.now()),
      field: availableFields[0]?.label || 'active',
      operator: '=',
      value: '',
      conjunction: '^',
    };
    setConditions([...conditions, newCond]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<QueryCondition>) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Generate standard ServiceNow Encoded Query format
  const generateEncodedQuery = (): string => {
    if (conditions.length === 0) return '';
    let queryStr = '';
    conditions.forEach((c, idx) => {
      let part = '';
      if (c.operator === 'ISEMPTY') {
        part = `${c.field}ISEMPTY`;
      } else if (c.operator === 'ISNOTEMPTY') {
        part = `${c.field}ISNOTEMPTY`;
      } else {
        part = `${c.field}${c.operator}${c.value}`;
      }

      if (idx === 0) {
        queryStr += part;
      } else {
        queryStr += `${c.conjunction}${part}`;
      }
    });
    return queryStr + '^EQ';
  };

  const encodedQuery = generateEncodedQuery();

  const glideRecordCode = `// Generated ServiceNow GlideRecord Script
var gr = new GlideRecordSecure('${selectedTable}');
gr.addEncodedQuery('${encodedQuery}');
gr.orderByDesc('sys_created_on');
gr.setLimit(50);
gr.query();

while (gr.next()) {
  var recNumber = gr.getValue('number') || gr.getUniqueValue();
  gs.info('Found record: ' + recNumber);
}`;

  const handleExecuteLive = async () => {
    setIsExecutingLive(true);
    setLiveError(null);
    try {
      const response = await fetch('/api/servicenow/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          query: encodedQuery,
          limit: 15,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setLiveError(data.error || 'Failed to execute query on ServiceNow instance.');
        setLiveResults(null);
      } else {
        setLiveResults(data.result || []);
        setIsFallbackResult(Boolean(data.isFallback));
        setFallbackReason(data.fallbackReason || null);
      }
    } catch (err: any) {
      setLiveError(err?.message || 'Network error running query.');
      setLiveResults(null);
    } finally {
      setIsExecutingLive(false);
    }
  };

  const copyToClipboard = (text: string, type: 'query' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'query') {
      setCopiedQuery(true);
      setTimeout(() => setCopiedQuery(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-teal-50 text-[#0080A3]">
              <Filter className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#032D42]">
              Encoded Query Builder
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Visually construct sysparm encoded query conditions, preview the native string,
            and export optimized server-side GlideRecord queries.
          </p>
        </div>

        {/* Target Table Dropdown */}
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Table:</span>
          <select
            value={selectedTable}
            onChange={(e) => {
              setSelectedTable(e.target.value);
              setConditions([
                { id: '1', field: 'active', operator: '=', value: 'true', conjunction: '^' },
              ]);
            }}
            className="text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {SERVICENOW_TABLES.map((t) => (
              <option key={t.name} value={t.name}>
                {t.label} ({t.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Condition Rows */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Query Filter Clauses</h3>
          <button
            onClick={addCondition}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-[#0080A3] hover:bg-teal-100 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Condition</span>
          </button>
        </div>

        <div className="space-y-3">
          {conditions.map((cond, index) => (
            <div
              key={cond.id}
              className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70"
            >
              {/* Conjunction operator for subsequent items */}
              {index > 0 && (
                <select
                  value={cond.conjunction}
                  onChange={(e) =>
                    updateCondition(cond.id, {
                      conjunction: e.target.value as '^' | '^OR' | '^NQ',
                    })
                  }
                  className="text-xs font-bold text-[#0080A3] bg-white border border-teal-200 rounded-lg px-2 py-1.5"
                >
                  <option value="^">AND (^)</option>
                  <option value="^OR">OR (^OR)</option>
                  <option value="^NQ">NEW QUERY (^NQ)</option>
                </select>
              )}

              {/* Field Select */}
              <select
                value={cond.field}
                onChange={(e) => updateCondition(cond.id, { field: e.target.value })}
                className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                {availableFields.map((f) => (
                  <option key={f.label} value={f.label}>
                    {f.label} ({f.type})
                  </option>
                ))}
              </select>

              {/* Operator Select */}
              <select
                value={cond.operator}
                onChange={(e) => updateCondition(cond.id, { operator: e.target.value })}
                className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                {QUERY_OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>

              {/* Value Input */}
              {cond.operator !== 'ISEMPTY' && cond.operator !== 'ISNOTEMPTY' && (
                <input
                  type="text"
                  value={cond.value}
                  onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
                  placeholder="Value (e.g., true, 1, Beth Anglin)"
                  className="flex-1 min-w-[160px] text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-500"
                />
              )}

              {/* Delete condition button */}
              <button
                onClick={() => removeCondition(cond.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Remove clause"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {conditions.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">
              No filter conditions. Query matches all records in {selectedTable}.
            </div>
          )}
        </div>
      </div>

      {/* Encoded String & Generated Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Raw Encoded Query String Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                ServiceNow Encoded Query String
              </span>
              <button
                onClick={() => copyToClipboard(encodedQuery, 'query')}
                className="flex items-center gap-1 text-xs text-[#0080A3] hover:text-[#032D42] font-semibold cursor-pointer"
              >
                {copiedQuery ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedQuery ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-900 text-teal-300 font-mono text-xs rounded-xl break-all min-h-[52px] select-all">
              {encodedQuery || '/* No conditions defined */'}
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <p className="text-[11px] text-slate-400">
              Paste directly into table URL parameter: <code>sysparm_query={encodedQuery}</code>
            </p>
            <button
              onClick={handleExecuteLive}
              disabled={isExecutingLive}
              className="w-full py-2 px-3 bg-[#0080A3] hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              {isExecutingLive ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing on {shortInstanceName}...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Execute on {shortInstanceName}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* GlideRecord Code Block Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <Code className="w-3.5 h-3.5 text-[#0080A3]" />
                <span>GlideRecordSecure Snippet</span>
              </div>
              <button
                onClick={() => copyToClipboard(glideRecordCode, 'code')}
                className="flex items-center gap-1 text-xs text-[#0080A3] hover:text-[#032D42] font-semibold cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#0d1520] text-slate-200 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed">
              {glideRecordCode}
            </pre>
          </div>
        </div>
      </div>

      {/* Live Query Results Panel */}
      {(liveResults !== null || liveError !== null) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-200/80 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0080A3]" />
              <h3 className="text-sm font-bold text-[#032D42]">
                Query Results: {instanceHost} ({selectedTable})
              </h3>
              {isFallbackResult && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Sandbox Dataset
                </span>
              )}
              {!isFallbackResult && liveResults !== null && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Instance Data
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setLiveResults(null);
                setLiveError(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
            >
              ✕ Close Results
            </button>
          </div>

          {liveError ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Query Execution Notice:</p>
                <p>{liveError}</p>
                {!instanceStatus?.isAuthenticated && (
                  <p className="mt-1 text-rose-700 font-medium">
                    Tip: Head over to the <strong>"Instance ({shortInstanceName})"</strong> tab to connect with your instance credentials.
                  </p>
                )}
              </div>
            </div>
          ) : liveResults?.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
              No matching records returned for this query on table <code>{selectedTable}</code>.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {liveResults?.map((rec, i) => (
                <div key={rec.sys_id || i} className="p-3 bg-white hover:bg-slate-50 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-[#0080A3] mr-2">
                      {rec.number || rec.name || rec.short_description || rec.sys_id}
                    </span>
                    {rec.short_description && (
                      <span className="text-slate-600 truncate">{rec.short_description}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {rec.priority && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                        P{rec.priority}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-slate-400">
                      sys_id: {rec.sys_id?.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
