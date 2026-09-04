import React, { useState, useMemo } from 'react';
import { SN_TABLES, SN_OPERATORS } from '../data/servicenowData';
import { QueryCondition } from '../types';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Code2, 
  Terminal, 
  Globe, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface QueryBuilderProps {
  onAskLaya: (prompt: string) => void;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ onAskLaya }) => {
  const [selectedTable, setSelectedTable] = useState('incident');
  const [customTableName, setCustomTableName] = useState('');
  const [conditions, setConditions] = useState<QueryCondition[]>([
    { id: '1', conjunction: '^', field: 'active', operator: '=', value: 'true' },
    { id: '2', conjunction: '^', field: 'priority', operator: '<=', value: '2' },
    { id: '3', conjunction: '^', field: 'assigned_to', operator: 'ISNOTEMPTY', value: '' },
  ]);
  const [orderByField, setOrderByField] = useState('sys_created_on');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [recordLimit, setRecordLimit] = useState(50);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const activeTableDef = useMemo(() => {
    return SN_TABLES.find((t) => t.name === selectedTable);
  }, [selectedTable]);

  const availableFields = useMemo(() => {
    return activeTableDef?.fields || [
      { name: 'number', label: 'Number' },
      { name: 'state', label: 'State' },
      { name: 'priority', label: 'Priority' },
      { name: 'active', label: 'Active' },
      { name: 'assigned_to', label: 'Assigned To' },
      { name: 'sys_created_on', label: 'Created On' },
    ];
  }, [activeTableDef]);

  const targetTableName = selectedTable === 'custom' ? (customTableName || 'u_custom_table') : selectedTable;

  // Compute Encoded Query String
  const encodedQuery = useMemo(() => {
    if (conditions.length === 0) return '';
    const parts = conditions.map((c, index) => {
      let segment = '';
      if (c.operator === 'ISEMPTY') {
        segment = `${c.field}ISEMPTY`;
      } else if (c.operator === 'ISNOTEMPTY') {
        segment = `${c.field}ISNOTEMPTY`;
      } else if (c.operator.startsWith('RELATIVEGE') || c.operator.startsWith('DYNAMIC')) {
        segment = `${c.field}${c.operator}`;
      } else {
        segment = `${c.field}${c.operator}${c.value}`;
      }

      if (index === 0) return segment;
      return `${c.conjunction}${segment}`;
    });

    let queryStr = parts.join('');
    if (orderByField) {
      queryStr += orderDirection === 'desc' ? `^ORDERBYDESC${orderByField}` : `^ORDERBY${orderByField}`;
    }
    return queryStr;
  }, [conditions, orderByField, orderDirection]);

  // Compute Server Script
  const serverScript = useMemo(() => {
    return `// ServiceNow Server-Side Script (GlideRecordSecure)
// Best Practice: Always check .next() and use getValue()
var gr = new GlideRecordSecure('${targetTableName}');
gr.addEncodedQuery('${encodedQuery}');
gr.setLimit(${recordLimit});
gr.query();

gs.info('[QueryRunner] Found {0} matching records in ${targetTableName}', gr.getRowCount());

while (gr.next()) {
    var recordNumber = gr.getValue('number') || gr.getUniqueValue();
    var recordState = gr.getDisplayValue('state') || '';
    gs.info('[Record: {0}] State: {1}', recordNumber, recordState);
}`;
  }, [targetTableName, encodedQuery, recordLimit]);

  // REST API URL
  const restUrl = useMemo(() => {
    return `/api/now/table/${targetTableName}?sysparm_query=${encodeURIComponent(encodedQuery)}&sysparm_limit=${recordLimit}&sysparm_display_value=true`;
  }, [targetTableName, encodedQuery, recordLimit]);

  const addCondition = (conjunction: '^' | '^OR' | '^NQ') => {
    const newId = Date.now().toString();
    const defaultField = availableFields[0]?.name || 'active';
    setConditions((prev) => [
      ...prev,
      { id: newId, conjunction, field: defaultField, operator: '=', value: '' },
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<QueryCondition>) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-4 space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#0080A3]" />
              ServiceNow Encoded Query & Script Generator
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Visually construct valid ServiceNow query strings, table filters, and production-ready GlideRecordSecure snippets.
            </p>
          </div>
          <button
            onClick={() => onAskLaya(`Explain this ServiceNow encoded query: "${encodedQuery}" on table "${targetTableName}", and advise if any indexes or optimizations are needed.`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0080A3]" />
            Ask LAYA About This Query
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Query Builder */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
              1. Select Table
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#0080A3] outline-none"
              >
                {SN_TABLES.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.label} ({t.name})
                  </option>
                ))}
                <option value="custom">Custom Table...</option>
              </select>

              {selectedTable === 'custom' && (
                <input
                  type="text"
                  placeholder="e.g. u_custom_tracker"
                  value={customTableName}
                  onChange={(e) => setCustomTableName(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-mono focus:ring-1 focus:ring-[#0080A3] outline-none"
                />
              )}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-500">
                  2. Filter Conditions
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => addCondition('^')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>AND (^)</span>
                  </button>
                  <button
                    onClick={() => addCondition('^OR')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>OR (^OR)</span>
                  </button>
                </div>
              </div>

              {/* Conditions List */}
              <div className="space-y-2.5">
                {conditions.map((cond, index) => {
                  const opDef = SN_OPERATORS.find((o) => o.value === cond.operator);
                  const isNoValue = opDef?.noValue;

                  return (
                    <div
                      key={cond.id}
                      className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs"
                    >
                      {/* Conjunction Badge */}
                      <span className="font-mono text-[10px] font-semibold px-2 py-1 rounded bg-slate-200 text-slate-700 w-12 text-center">
                        {index === 0 ? 'WHERE' : cond.conjunction === '^' ? 'AND' : 'OR'}
                      </span>

                      {/* Field */}
                      <select
                        value={cond.field}
                        onChange={(e) => updateCondition(cond.id, { field: e.target.value })}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
                      >
                        {availableFields.map((f) => (
                          <option key={f.name} value={f.name}>
                            {f.label} ({f.name})
                          </option>
                        ))}
                      </select>

                      {/* Operator */}
                      <select
                        value={cond.operator}
                        onChange={(e) => updateCondition(cond.id, { operator: e.target.value })}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none font-mono"
                      >
                        {SN_OPERATORS.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      {/* Value (if applicable) */}
                      {!isNoValue && (
                        <input
                          type="text"
                          placeholder={opDef?.placeholder || 'value'}
                          value={cond.value}
                          onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
                          className="flex-1 min-w-[90px] px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
                        />
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeCondition(cond.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors ml-auto cursor-pointer"
                        title="Remove condition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                {conditions.length === 0 && (
                  <p className="text-xs text-slate-400 italic p-3 text-center border border-dashed rounded-lg">
                    No conditions added. Click AND (^) to add a filter.
                  </p>
                )}
              </div>
            </div>

            {/* Sorting & Limit */}
            <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Order By Field
                </label>
                <select
                  value={orderByField}
                  onChange={(e) => setOrderByField(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
                >
                  <option value="">(None)</option>
                  {availableFields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.label} ({f.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Direction
                </label>
                <select
                  value={orderDirection}
                  onChange={(e) => setOrderDirection(e.target.value as 'asc' | 'desc')}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
                >
                  <option value="desc">Descending (^ORDERBYDESC)</option>
                  <option value="asc">Ascending (^ORDERBY)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Record Limit
                </label>
                <input
                  type="number"
                  value={recordLimit}
                  onChange={(e) => setRecordLimit(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
                  min={1}
                  max={500}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Outputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Output 1: Encoded Query String */}
          <div className="bg-slate-900 rounded-xl p-4 text-white border border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 font-mono">
                <Terminal className="w-3.5 h-3.5" />
                <span>Encoded Query String</span>
              </div>
              <button
                onClick={() => handleCopy(encodedQuery, 'encodedQuery')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedType === 'encodedQuery' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-black/50 p-3 rounded-lg font-mono text-xs text-[#00E5A3] break-all border border-slate-800 select-all">
              {encodedQuery || '<no query specified>'}
            </div>
          </div>

          {/* Output 2: GlideRecordSecure Server Script */}
          <div className="bg-slate-900 rounded-xl p-4 text-white border border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0080A3] font-mono">
                <Code2 className="w-3.5 h-3.5" />
                <span>Server Script (GlideRecordSecure)</span>
              </div>
              <button
                onClick={() => handleCopy(serverScript, 'serverScript')}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedType === 'serverScript' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-black/50 p-3 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800 scrollbar-thin">
              <code>{serverScript}</code>
            </pre>
          </div>

          {/* Output 3: REST API Endpoint */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Globe className="w-3.5 h-3.5 text-[#0080A3]" />
                <span>Table API GET URI</span>
              </div>
              <button
                onClick={() => handleCopy(restUrl, 'restUrl')}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {copiedType === 'restUrl' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg font-mono text-xs text-slate-700 break-all border border-slate-200">
              {restUrl}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
