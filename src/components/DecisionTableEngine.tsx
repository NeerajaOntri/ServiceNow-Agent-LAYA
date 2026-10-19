import React, { useState } from 'react';
import { 
  TableProperties, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Code2, 
  Sparkles, 
  FileJson, 
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  UserCheck,
  ChevronRight,
  Layers
} from 'lucide-react';
import { DecisionTableConfig, DecisionInputVariable, DecisionOutputVariable, DecisionRow } from '../types';

interface DecisionTableEngineProps {
  onAuditScript?: (code: string, title: string) => void;
}

const PRESET_DECISION_TABLES: DecisionTableConfig[] = [
  {
    id: 'dt-hardware-approval',
    name: 'IT Hardware Cost & Department Approval Matrix',
    sysId: 'd6b79c02db200010f3c5f53a299619a1',
    applicationScope: 'global',
    description: 'Determines required executive sign-off and SLA based on hardware expense and requesting department.',
    inputs: [
      { id: 'in_cost', label: 'Item Total Cost ($)', name: 'cost', type: 'currency' },
      { id: 'in_dept', label: 'Requesting Department', name: 'department', type: 'choice', choices: ['Engineering', 'Sales', 'Finance', 'Executive', 'ANY'] },
      { id: 'in_expedited', label: 'Expedited Delivery', name: 'expedited', type: 'boolean' }
    ],
    outputs: [
      { id: 'out_approver', label: 'Required Approval Group', name: 'approval_group', type: 'reference', referenceTable: 'sys_user_group' },
      { id: 'out_auto_approve', label: 'Auto-Approve Flag', name: 'auto_approve', type: 'boolean' },
      { id: 'out_sla_hours', label: 'SLA Target (Hours)', name: 'sla_target_hours', type: 'number' }
    ],
    defaultOutputs: {
      out_approver: 'IT Helpdesk Standard Tier',
      out_auto_approve: 'false',
      out_sla_hours: '48'
    },
    rows: [
      {
        id: 'row-1',
        order: 100,
        description: 'Micro-purchases under $500: Instant auto-approval',
        conditions: {
          in_cost: { inputId: 'in_cost', operator: '<=', value: '500' },
          in_dept: { inputId: 'in_dept', operator: 'ANY', value: '' },
          in_expedited: { inputId: 'in_expedited', operator: 'ANY', value: '' }
        },
        outputs: {
          out_approver: 'System Auto-Approval',
          out_auto_approve: 'true',
          out_sla_hours: '2'
        }
      },
      {
        id: 'row-2',
        order: 200,
        description: 'Engineering high-cost hardware ($5,000+): VP of Engineering',
        conditions: {
          in_cost: { inputId: 'in_cost', operator: '>', value: '5000' },
          in_dept: { inputId: 'in_dept', operator: '==', value: 'Engineering' },
          in_expedited: { inputId: 'in_expedited', operator: 'ANY', value: '' }
        },
        outputs: {
          out_approver: 'VP of Engineering Approvers',
          out_auto_approve: 'false',
          out_sla_hours: '12'
        }
      },
      {
        id: 'row-3',
        order: 300,
        description: 'Major Enterprise CapEx ($10,000+): CFO Executive Board',
        conditions: {
          in_cost: { inputId: 'in_cost', operator: '>', value: '10000' },
          in_dept: { inputId: 'in_dept', operator: 'ANY', value: '' },
          in_expedited: { inputId: 'in_expedited', operator: 'ANY', value: '' }
        },
        outputs: {
          out_approver: 'CFO & Executive Finance Committee',
          out_auto_approve: 'false',
          out_sla_hours: '24'
        }
      },
      {
        id: 'row-4',
        order: 400,
        description: 'Standard Manager Approval Tier ($500 - $10,000)',
        conditions: {
          in_cost: { inputId: 'in_cost', operator: '>', value: '500' },
          in_dept: { inputId: 'in_dept', operator: 'ANY', value: '' },
          in_expedited: { inputId: 'in_expedited', operator: 'ANY', value: '' }
        },
        outputs: {
          out_approver: 'Department Line Manager',
          out_auto_approve: 'false',
          out_sla_hours: '24'
        }
      }
    ]
  },
  {
    id: 'dt-incident-vip-routing',
    name: 'VIP & Critical Incident Escalation Decision Table',
    sysId: 'e8a19283fa300021c4b7e52b388710b2',
    applicationScope: 'global',
    description: 'Routes severe production outages and VIP callers to specialized CSIRT and Command Center leadership.',
    inputs: [
      { id: 'in_urgency', label: 'Urgency', name: 'urgency', type: 'choice', choices: ['1 - High', '2 - Medium', '3 - Low'] },
      { id: 'in_vip', label: 'Is VIP Caller', name: 'is_vip', type: 'boolean' },
      { id: 'in_tier1_ci', label: 'Tier 1 Critical CI', name: 'is_tier1_ci', type: 'boolean' }
    ],
    outputs: [
      { id: 'out_triage_group', label: 'Escalation Group', name: 'escalation_group', type: 'string' },
      { id: 'out_broadcast', label: 'Broadcast Bridge Required', name: 'bridge_required', type: 'boolean' }
    ],
    defaultOutputs: {
      out_triage_group: 'Service Desk Tier 1',
      out_broadcast: 'false'
    },
    rows: [
      {
        id: 'row-1',
        order: 100,
        description: 'Tier 1 Outage + VIP: Emergency Command Center',
        conditions: {
          in_urgency: { inputId: 'in_urgency', operator: '==', value: '1 - High' },
          in_vip: { inputId: 'in_vip', operator: '==', value: 'true' },
          in_tier1_ci: { inputId: 'in_tier1_ci', operator: '==', value: 'true' }
        },
        outputs: {
          out_triage_group: 'Major Incident Command Center (MICC)',
          out_broadcast: 'true'
        }
      },
      {
        id: 'row-2',
        order: 200,
        description: 'VIP High Urgency: Executive White-Glove Support',
        conditions: {
          in_urgency: { inputId: 'in_urgency', operator: '==', value: '1 - High' },
          in_vip: { inputId: 'in_vip', operator: '==', value: 'true' },
          in_tier1_ci: { inputId: 'in_tier1_ci', operator: 'ANY', value: '' }
        },
        outputs: {
          out_triage_group: 'Executive VIP Rapid Response',
          out_broadcast: 'false'
        }
      }
    ]
  }
];

export const DecisionTableEngine: React.FC<DecisionTableEngineProps> = ({ onAuditScript }) => {
  const [tables, setTables] = useState<DecisionTableConfig[]>(PRESET_DECISION_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<string>(PRESET_DECISION_TABLES[0].id);
  const [activeTab, setActiveTab] = useState<'matrix' | 'testBench' | 'script'>('matrix');
  const [copied, setCopied] = useState(false);

  // Test bench state
  const [testInputs, setTestInputs] = useState<Record<string, string>>({
    in_cost: '12500',
    in_dept: 'Engineering',
    in_expedited: 'false',
    in_urgency: '1 - High',
    in_vip: 'true',
    in_tier1_ci: 'true'
  });
  const [testResult, setTestResult] = useState<{
    matchedRow: DecisionRow | null;
    isDefaultFallback: boolean;
    outputs: Record<string, string>;
  } | null>(null);

  const currentTable = tables.find(t => t.id === selectedTableId) || tables[0];

  const updateCurrentTable = (updater: (prev: DecisionTableConfig) => DecisionTableConfig) => {
    setTables(prev => prev.map(t => t.id === currentTable.id ? updater(t) : t));
  };

  // Add rule row
  const handleAddRow = () => {
    const newRow: DecisionRow = {
      id: `row-${Date.now()}`,
      order: (currentTable.rows.length + 1) * 100,
      description: 'Custom Decision Rule',
      conditions: currentTable.inputs.reduce((acc, input) => {
        acc[input.id] = { inputId: input.id, operator: 'ANY', value: '' };
        return acc;
      }, {} as Record<string, any>),
      outputs: currentTable.outputs.reduce((acc, output) => {
        acc[output.id] = '';
        return acc;
      }, {} as Record<string, string>)
    };

    updateCurrentTable(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  };

  const handleDeleteRow = (rowId: string) => {
    updateCurrentTable(prev => ({
      ...prev,
      rows: prev.rows.filter(r => r.id !== rowId)
    }));
  };

  const handleConditionChange = (rowId: string, inputId: string, operator: any, value: string) => {
    updateCurrentTable(prev => ({
      ...prev,
      rows: prev.rows.map(r => {
        if (r.id !== rowId) return r;
        return {
          ...r,
          conditions: {
            ...r.conditions,
            [inputId]: { inputId, operator, value }
          }
        };
      })
    }));
  };

  const handleOutputChange = (rowId: string, outputId: string, value: string) => {
    updateCurrentTable(prev => ({
      ...prev,
      rows: prev.rows.map(r => {
        if (r.id !== rowId) return r;
        return {
          ...r,
          outputs: {
            ...r.outputs,
            [outputId]: value
          }
        };
      })
    }));
  };

  // Live condition row evaluator
  const handleRunEvaluation = () => {
    // Evaluate rows in order
    const sortedRows = [...currentTable.rows].sort((a, b) => a.order - b.order);

    for (const row of sortedRows) {
      let rowMatches = true;

      for (const input of currentTable.inputs) {
        const cond = row.conditions[input.id];
        if (!cond || cond.operator === 'ANY') continue;

        const valActual = testInputs[input.id] ?? '';
        const valTarget = cond.value;

        if (input.type === 'currency' || input.type === 'number') {
          const numActual = parseFloat(valActual) || 0;
          const numTarget = parseFloat(valTarget) || 0;

          if (cond.operator === '>' && !(numActual > numTarget)) rowMatches = false;
          else if (cond.operator === '<' && !(numActual < numTarget)) rowMatches = false;
          else if (cond.operator === '>=' && !(numActual >= numTarget)) rowMatches = false;
          else if (cond.operator === '<=' && !(numActual <= numTarget)) rowMatches = false;
          else if (cond.operator === '==' && numActual !== numTarget) rowMatches = false;
        } else if (input.type === 'boolean') {
          const boolActual = valActual === 'true';
          const boolTarget = valTarget === 'true';
          if (cond.operator === '==' && boolActual !== boolTarget) rowMatches = false;
        } else {
          // String / Choice
          if (cond.operator === '==' && valActual.toLowerCase() !== valTarget.toLowerCase()) rowMatches = false;
          else if (cond.operator === '!=' && valActual.toLowerCase() === valTarget.toLowerCase()) rowMatches = false;
          else if (cond.operator === 'CONTAINS' && !valActual.toLowerCase().includes(valTarget.toLowerCase())) rowMatches = false;
        }

        if (!rowMatches) break;
      }

      if (rowMatches) {
        setTestResult({
          matchedRow: row,
          isDefaultFallback: false,
          outputs: row.outputs
        });
        return;
      }
    }

    // No row matched -> fallback default
    setTestResult({
      matchedRow: null,
      isDefaultFallback: true,
      outputs: currentTable.defaultOutputs
    });
  };

  const generateDecisionScript = () => {
    const inputPayload = currentTable.inputs.map(i => {
      const exampleVal = testInputs[i.id] || (i.type === 'currency' || i.type === 'number' ? '1000' : i.type === 'boolean' ? 'true' : 'Hardware');
      return `    inputs['${i.name}'] = ${i.type === 'number' || i.type === 'currency' ? exampleVal : `'${exampleVal}'`};`;
    }).join('\n');

    return `// ====================================================================
// ServiceNow Decision Builder API Script
// Decision Table: ${currentTable.name} (sys_id: ${currentTable.sysId})
// Application Scope: ${currentTable.applicationScope}
// ====================================================================
(function evaluateDecision() {
  try {
    var inputs = {};
${inputPayload}

    gs.info('Evaluating Decision Table: ${currentTable.name}');

    // Method 1: Using modern Flow Designer DecisionTableAPI
    var dtApi = new sn_fd.DecisionTableAPI();
    var decisionAnswer = dtApi.getDecision('${currentTable.sysId}', inputs);

    if (decisionAnswer && decisionAnswer.isValidRecord()) {
      gs.info('Decision match found: ' + decisionAnswer.getDisplayValue());
      
      // Extract resolved output fields
      var result = {
${currentTable.outputs.map(o => `        ${o.name}: decisionAnswer.getValue('${o.name}')`).join(',\n')}
      };
      
      gs.info('Resolved Decision Result: ' + JSON.stringify(result));
      return result;
    } else {
      gs.warn('No specific rule matched. Applying configured default fallback.');
      return ${JSON.stringify(currentTable.defaultOutputs, null, 2)};
    }
  } catch (ex) {
    gs.error('Decision Table execution error: ' + ex.getMessage());
  }
})();`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#032D42] via-[#083344] to-[#0E7490] text-white p-6 rounded-2xl shadow-md border border-cyan-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <TableProperties className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black tracking-tight font-mono">
              DECISION TABLES & APPROVAL ENGINE
            </h1>
          </div>
          <p className="text-slate-300 text-sm max-w-2xl">
            Visual matrix builder for ServiceNow Decision Tables (<code className="text-cyan-300 font-mono">sys_decision</code>). Map condition variables to output approval groups, SLAs, and export ready-to-run Decision Builder scripts.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const newDT: DecisionTableConfig = {
                id: `dt-${Date.now()}`,
                name: 'Custom Approval Decision Table',
                sysId: 'f' + Math.random().toString(16).substring(2, 34),
                applicationScope: 'global',
                description: 'Custom condition routing matrix',
                inputs: [
                  { id: 'in_val', label: 'Threshold Amount', name: 'amount', type: 'currency' },
                  { id: 'in_type', label: 'Request Type', name: 'type', type: 'choice', choices: ['Standard', 'Urgent'] }
                ],
                outputs: [
                  { id: 'out_grp', label: 'Approver Group', name: 'approval_group', type: 'string' }
                ],
                defaultOutputs: { out_grp: 'Default Reviewers' },
                rows: []
              };
              setTables([newDT, ...tables]);
              setSelectedTableId(newDT.id);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-900 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Decision Table
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Tables List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
              Decision Tables (sys_decision)
            </h3>
            <div className="space-y-1.5">
              {tables.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all border cursor-pointer ${
                    t.id === selectedTableId
                      ? 'bg-cyan-50 border-cyan-300 text-cyan-900 shadow-xs font-semibold'
                      : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  <p className="font-bold text-slate-800 line-clamp-1">{t.name}</p>
                  <p className="text-[10px] font-mono text-cyan-700 mt-0.5 truncate">{t.sysId}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600 font-medium">
                    <span>{t.inputs.length} inputs</span>
                    <span>&bull;</span>
                    <span>{t.outputs.length} outputs</span>
                    <span>&bull;</span>
                    <span>{t.rows.length} rules</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Table Metadata */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-600">
              Table Configuration
            </h3>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Table Label</label>
              <input
                type="text"
                value={currentTable.name}
                onChange={(e) => updateCurrentTable(p => ({ ...p, name: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">sys_id Identifier</label>
              <input
                type="text"
                value={currentTable.sysId}
                onChange={(e) => updateCurrentTable(p => ({ ...p, sysId: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-cyan-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Description</label>
              <textarea
                rows={2}
                value={currentTable.description}
                onChange={(e) => updateCurrentTable(p => ({ ...p, description: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Matrix, Test Bench, or Script */}
        <div className="lg:col-span-3 space-y-4">
          {/* Sub Navigation */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'matrix'
                    ? 'bg-[#0E7490] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                Decision Matrix (Conditions & Outputs)
              </button>
              <button
                onClick={() => setActiveTab('testBench')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'testBench'
                    ? 'bg-[#0E7490] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                Live Rule Evaluation Bench
              </button>
              <button
                onClick={() => setActiveTab('script')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'script'
                    ? 'bg-[#0E7490] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                DecisionTableAPI Script
              </button>
            </div>

            <button
              onClick={handleAddRow}
              className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-cyan-100 text-cyan-900 hover:bg-cyan-200 transition-colors cursor-pointer mr-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Rule Row
            </button>
          </div>

          {activeTab === 'matrix' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    {/* High-level Header (Inputs vs Outputs) */}
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3 w-16 text-center">Order</th>
                      <th className="p-3">Rule Description</th>
                      <th colSpan={currentTable.inputs.length} className="p-3 bg-blue-50 text-blue-900 border-l border-r border-blue-200 text-center font-extrabold uppercase tracking-wider">
                        Condition Inputs ({currentTable.inputs.length})
                      </th>
                      <th colSpan={currentTable.outputs.length} className="p-3 bg-emerald-50 text-emerald-900 border-r border-emerald-200 text-center font-extrabold uppercase tracking-wider">
                        Result Outputs ({currentTable.outputs.length})
                      </th>
                      <th className="p-3 w-12 text-center">Action</th>
                    </tr>
                    {/* Specific Column Names */}
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                      <th className="p-2.5 text-center">#</th>
                      <th className="p-2.5">Rule Summary</th>
                      {currentTable.inputs.map(input => (
                        <th key={input.id} className="p-2.5 bg-blue-50/50 text-blue-950 border-l border-blue-100">
                          <div>{input.label}</div>
                          <span className="text-[9px] font-mono text-blue-600 font-normal">({input.type})</span>
                        </th>
                      ))}
                      {currentTable.outputs.map(output => (
                        <th key={output.id} className="p-2.5 bg-emerald-50/50 text-emerald-950 border-l border-emerald-100">
                          <div>{output.label}</div>
                          <span className="text-[9px] font-mono text-emerald-600 font-normal">({output.type})</span>
                        </th>
                      ))}
                      <th className="p-2.5 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentTable.rows.map((row, rIdx) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 text-center font-mono font-bold text-slate-500">
                          {row.order}
                        </td>
                        <td className="p-2.5 min-w-[200px]">
                          <input
                            type="text"
                            value={row.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCurrentTable(p => ({
                                ...p,
                                rows: p.rows.map(r => r.id === row.id ? { ...r, description: val } : r)
                              }));
                            }}
                            className="w-full px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-cyan-500 font-medium text-slate-800"
                          />
                        </td>

                        {/* Condition Cells */}
                        {currentTable.inputs.map(input => {
                          const cell = row.conditions[input.id] || { inputId: input.id, operator: 'ANY', value: '' };
                          return (
                            <td key={input.id} className="p-2.5 bg-blue-50/20 border-l border-blue-100 min-w-[140px]">
                              <div className="flex items-center gap-1">
                                <select
                                  value={cell.operator}
                                  onChange={(e) => handleConditionChange(row.id, input.id, e.target.value, cell.value)}
                                  className="px-1.5 py-1 rounded bg-white border border-blue-200 text-[11px] font-bold text-blue-900"
                                >
                                  <option value="ANY">ANY (*)</option>
                                  <option value="==">== (Equal)</option>
                                  <option value="!=">!= (Not Equal)</option>
                                  <option value=">">&gt; (Greater)</option>
                                  <option value="<">&lt; (Less)</option>
                                  <option value=">=">&gt;= (At least)</option>
                                  <option value="<=">&lt;= (At most)</option>
                                  <option value="CONTAINS">Contains</option>
                                </select>
                                {cell.operator !== 'ANY' && (
                                  <input
                                    type="text"
                                    value={cell.value}
                                    onChange={(e) => handleConditionChange(row.id, input.id, cell.operator, e.target.value)}
                                    className="w-20 px-1.5 py-1 rounded bg-white border border-blue-200 text-[11px] font-mono text-blue-950"
                                    placeholder="val"
                                  />
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {/* Output Cells */}
                        {currentTable.outputs.map(output => {
                          const val = row.outputs[output.id] || '';
                          return (
                            <td key={output.id} className="p-2.5 bg-emerald-50/20 border-l border-emerald-100 min-w-[150px]">
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => handleOutputChange(row.id, output.id, e.target.value)}
                                className="w-full px-2 py-1 rounded bg-white border border-emerald-200 text-[11px] font-medium text-emerald-950 focus:ring-1 focus:ring-emerald-500"
                                placeholder={`Output for ${output.name}`}
                              />
                            </td>
                          );
                        })}

                        {/* Delete Row Action */}
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Default Fallback Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold text-slate-700">Default Output Fallback (when no rule matches):</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {currentTable.outputs.map(output => (
                    <div key={output.id} className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-500">{output.name}:</span>
                      <input
                        type="text"
                        value={currentTable.defaultOutputs[output.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCurrentTable(p => ({
                            ...p,
                            defaultOutputs: { ...p.defaultOutputs, [output.id]: val }
                          }));
                        }}
                        className="px-2 py-1 rounded bg-white border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testBench' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Interactive Rule Evaluator & Simulator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Supply test inputs below and click "Evaluate Decision" to verify exactly which rule row triggers.
                    </p>
                  </div>
                  <button
                    onClick={handleRunEvaluation}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Evaluate Decision
                  </button>
                </div>

                {/* Input Fields Test Bench */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {currentTable.inputs.map(input => (
                    <div key={input.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <label className="block font-semibold text-slate-700 mb-1">
                        {input.label}
                      </label>
                      <input
                        type="text"
                        value={testInputs[input.id] || ''}
                        onChange={(e) => setTestInputs({ ...testInputs, [input.id]: e.target.value })}
                        placeholder={`Enter ${input.name}`}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono font-medium focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluation Result Card */}
              {testResult && (
                <div className={`p-5 rounded-2xl border-2 transition-all shadow-sm ${
                  testResult.isDefaultFallback
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {testResult.isDefaultFallback ? (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                      <h4 className="font-bold text-sm">
                        {testResult.isDefaultFallback
                          ? 'No Specific Row Matched — Executed Default Fallback'
                          : `Matched Rule Order #${testResult.matchedRow?.order}: "${testResult.matchedRow?.description}"`}
                      </h4>
                    </div>
                  </div>

                  {/* Resolved Outputs */}
                  <div className="bg-white/80 p-4 rounded-xl border border-black/10 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Resolved Output Values:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentTable.outputs.map(out => (
                        <div key={out.id} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-500 block font-semibold">{out.label}</span>
                          <span className="font-mono font-bold text-xs text-slate-900 mt-0.5 block truncate">
                            {typeof testResult.outputs[out.id] === 'object' && testResult.outputs[out.id] !== null
                              ? JSON.stringify(testResult.outputs[out.id])
                              : String(testResult.outputs[out.id] || '(none)')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'script' && (
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  ServiceNow Script Execution Snippet (sn_fd.DecisionTableAPI)
                </span>
                <div className="flex items-center gap-2">
                  {onAuditScript && (
                    <button
                      onClick={() => onAuditScript(generateDecisionScript(), `DecisionTable: ${currentTable.name}`)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-900/60 text-purple-300 hover:bg-purple-800/80 transition-colors cursor-pointer"
                    >
                      Audit Script
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateDecisionScript());
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied Script' : 'Copy Script'}
                  </button>
                </div>
              </div>
              <pre className="text-xs font-mono text-cyan-200/90 bg-black/40 p-4 rounded-xl overflow-x-auto max-h-[500px] leading-relaxed">
                {generateDecisionScript()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
