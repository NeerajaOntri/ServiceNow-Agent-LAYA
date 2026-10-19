import React, { useState } from 'react';
import { 
  GitMerge, 
  Play, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  FileCode, 
  Sparkles, 
  Copy, 
  Check, 
  TableProperties, 
  ArrowRight, 
  Send, 
  UserCheck, 
  Clock, 
  Terminal, 
  Database,
  Layers,
  HelpCircle
} from 'lucide-react';
import { FlowDefinition, FlowActionStep, FlowTrigger, FlowActionType } from '../types';

interface FlowDesignerBuilderProps {
  onNavigateToDecisionTables?: (tableId?: string) => void;
  onAuditScript?: (code: string, title: string) => void;
}

const PRESET_FLOWS: FlowDefinition[] = [
  {
    id: 'flow-vip-incident',
    name: 'VIP Incident Dynamic Escalation & Flow',
    internalName: 'vip_incident_dynamic_escalation',
    description: 'Triggered when a P1/P2 Incident is created with VIP caller. Evaluates Decision Table for approval tier, sends urgent alert, and creates an Incident Task.',
    applicationScope: 'global',
    status: 'published',
    trigger: {
      id: 'trig-1',
      type: 'record_created_or_updated',
      table: 'incident',
      conditions: 'priorityIN1,2^caller_id.vip=true^active=true',
      runWhen: 'unique_changes',
      description: 'Run when priority is P1/P2 and caller is VIP'
    },
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        label: 'Evaluate Approval via Decision Table',
        type: 'decision_table',
        decisionTableId: 'dt_incident_vip_routing',
        dataPillInputs: {
          'urgency': '{{trigger.current.urgency}}',
          'impact': '{{trigger.current.impact}}',
          'cmdb_ci': '{{trigger.current.cmdb_ci}}'
        },
        notes: 'Calls ServiceNow sys_decision to dynamically resolve executive notification tier and approval group.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        label: 'Ask for Executive Approval',
        type: 'ask_for_approval',
        isApproval: true,
        approvalRules: {
          approverType: 'decision_table',
          target: '{{step_1.decision_result.approval_group}}',
          rule: 'anyone'
        },
        dataPillInputs: {
          'record': '{{trigger.current}}',
          'approval_field': 'approval',
          'due_date': '{{trigger.current.sys_created_on + 2h}}'
        },
        notes: 'Waits for designated approval group determined by Decision Table.'
      },
      {
        id: 'step-3',
        stepNumber: 3,
        label: 'Send High-Priority Email to Major Incident Team',
        type: 'send_email',
        targetTable: 'incident',
        dataPillInputs: {
          'to': '{{step_1.decision_result.approval_group}}',
          'subject': '[MAJOR VIP ALERT] Incident {{trigger.current.number}} requires immediate attention',
          'body': 'VIP Caller: {{trigger.current.caller_id.name}}\nIssue: {{trigger.current.short_description}}'
        },
        notes: 'Dispatches branded enterprise alert template.'
      },
      {
        id: 'step-4',
        stepNumber: 4,
        label: 'Create Incident Task for L3 Engineering',
        type: 'create_task',
        targetTable: 'incident_task',
        dataPillInputs: {
          'incident': '{{trigger.current.sys_id}}',
          'short_description': 'L3 Investigation: {{trigger.current.short_description}}',
          'priority': '1',
          'assignment_group': 'Critical Incident Response Team'
        },
        notes: 'Generates parallel task for immediate triage.'
      }
    ]
  },
  {
    id: 'flow-procurement-approval',
    name: 'Hardware Procurement & Multi-Tier Approval',
    internalName: 'hardware_procurement_multitier',
    description: 'Processes Requested Items (sc_req_item) for hardware. Routes to Decision Table for cost-based approvals (Manager, Director, or CFO).',
    applicationScope: 'global',
    status: 'draft',
    trigger: {
      id: 'trig-2',
      type: 'record_created',
      table: 'sc_req_item',
      conditions: 'cat_item.category=Hardware^price>500',
      runWhen: 'always',
      description: 'Trigger on new hardware catalog items over $500'
    },
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        label: 'Route Approval by Cost Decision Matrix',
        type: 'decision_table',
        decisionTableId: 'dt_hardware_approval_matrix',
        dataPillInputs: {
          'total_cost': '{{trigger.current.price * trigger.current.quantity}}',
          'department': '{{trigger.current.request.requested_for.department}}'
        },
        notes: 'Resolves required approval tier based on item cost threshold.'
      },
      {
        id: 'step-2',
        stepNumber: 2,
        label: 'Ask for Tiered Approvals',
        type: 'ask_for_approval',
        isApproval: true,
        approvalRules: {
          approverType: 'decision_table',
          target: '{{step_1.decision_result.approver_group}}',
          rule: 'all'
        },
        dataPillInputs: {
          'record': '{{trigger.current}}',
          'approval_field': 'approval'
        }
      },
      {
        id: 'step-3',
        stepNumber: 3,
        label: 'Update RITM State to Work in Progress',
        type: 'update_record',
        targetTable: 'sc_req_item',
        dataPillInputs: {
          'state': '2',
          'stage': 'fulfillment'
        }
      },
      {
        id: 'step-4',
        stepNumber: 4,
        label: 'Run Subflow: IT Asset Tag & Staging',
        type: 'run_subflow',
        subflowName: 'global.it_asset_procurement_subflow',
        dataPillInputs: {
          'requested_item': '{{trigger.current.sys_id}}',
          'model_id': '{{trigger.current.configuration_item}}'
        }
      }
    ]
  }
];

export const FlowDesignerBuilder: React.FC<FlowDesignerBuilderProps> = ({
  onNavigateToDecisionTables,
  onAuditScript,
}) => {
  const [flows, setFlows] = useState<FlowDefinition[]>(PRESET_FLOWS);
  const [selectedFlowId, setSelectedFlowId] = useState<string>(PRESET_FLOWS[0].id);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'canvas' | 'code' | 'runner'>('canvas');
  const [copiedCode, setCopiedCode] = useState(false);

  const currentFlow = flows.find(f => f.id === selectedFlowId) || flows[0];

  const updateCurrentFlow = (updater: (prev: FlowDefinition) => FlowDefinition) => {
    setFlows(prev => prev.map(f => f.id === currentFlow.id ? updater(f) : f));
  };

  const handleTriggerChange = <K extends keyof FlowTrigger>(key: K, value: FlowTrigger[K]) => {
    updateCurrentFlow(prev => ({
      ...prev,
      trigger: { ...prev.trigger, [key]: value }
    }));
  };

  const handleAddStep = (type: FlowActionType) => {
    const newStep: FlowActionStep = {
      id: `step-${Date.now()}`,
      stepNumber: currentFlow.steps.length + 1,
      label: type === 'decision_table' ? 'Evaluate Decision Table' :
             type === 'ask_for_approval' ? 'Ask For Approval' :
             type === 'send_email' ? 'Send Outbound Notification' :
             type === 'create_task' ? 'Create Catalog/Incident Task' :
             type === 'run_subflow' ? 'Execute Subflow' :
             type === 'update_record' ? 'Update Record Fields' : 'Process Action',
      type,
      targetTable: currentFlow.trigger.table,
      decisionTableId: type === 'decision_table' ? 'sys_decision_approval_matrix' : undefined,
      dataPillInputs: type === 'decision_table' 
        ? { 'category': '{{trigger.current.category}}', 'cost': '{{trigger.current.price}}' }
        : { 'state': '2' },
      notes: ''
    };

    updateCurrentFlow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === currentFlow.steps.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...currentFlow.steps];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    
    // Recalculate step numbers
    const renumbered = updated.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    updateCurrentFlow(prev => ({ ...prev, steps: renumbered }));
  };

  const handleDeleteStep = (index: number) => {
    const updated = currentFlow.steps.filter((_, idx) => idx !== index);
    const renumbered = updated.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    updateCurrentFlow(prev => ({ ...prev, steps: renumbered }));
  };

  const handleStepChange = (index: number, updates: Partial<FlowActionStep>) => {
    const updated = [...currentFlow.steps];
    updated[index] = { ...updated[index], ...updates };
    updateCurrentFlow(prev => ({ ...prev, steps: updated }));
  };

  // Natural Language to Flow Algorithm converter
  const handleConvertNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim()) return;
    setIsAiGenerating(true);

    try {
      const prompt = `Convert the following ServiceNow process algorithm into a structured Flow Designer definition:
Process: "${naturalLanguageInput}"

Generate a clean JSON format matching:
{
  "name": "Flow Name",
  "internalName": "flow_name_underscore",
  "description": "Short explanation",
  "trigger": { "type": "record_created"|"record_updated"|"record_created_or_updated", "table": "incident"|"change_request"|"sc_req_item", "conditions": "encoded_query", "runWhen": "always"|"unique_changes" },
  "steps": [
    { "label": "Step label", "type": "decision_table"|"ask_for_approval"|"send_email"|"create_task"|"update_record"|"run_subflow", "dataPillInputs": { "key": "{{trigger.current.field}}" }, "notes": "Explanation" }
  ]
}
Return only JSON.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const jsonMatch = data.reply?.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, data.reply];
        const jsonStr = jsonMatch[1] || data.reply;
        const parsed = JSON.parse(jsonStr.trim());
        
function flattenDataPillInputs(inputs: any, prefix = ''): Record<string, string> {
  if (!inputs || typeof inputs !== 'object') return {};
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(inputs)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val === null || val === undefined) {
      result[fullKey] = '';
    } else if (typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenDataPillInputs(val, fullKey));
    } else if (Array.isArray(val)) {
      result[fullKey] = val.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
    } else {
      result[fullKey] = String(val);
    }
  }
  return result;
}

        const newFlow: FlowDefinition = {
          id: `flow-gen-${Date.now()}`,
          name: parsed.name || 'AI Generated Flow',
          internalName: parsed.internalName || 'ai_generated_flow',
          description: parsed.description || naturalLanguageInput,
          applicationScope: 'global',
          status: 'draft',
          trigger: {
            id: `trig-${Date.now()}`,
            type: parsed.trigger?.type || 'record_created_or_updated',
            table: parsed.trigger?.table || 'incident',
            conditions: parsed.trigger?.conditions || 'active=true',
            runWhen: parsed.trigger?.runWhen || 'unique_changes'
          },
          steps: (parsed.steps || []).map((s: any, idx: number) => ({
            id: `step-${Date.now()}-${idx}`,
            stepNumber: idx + 1,
            label: s.label || `Step ${idx + 1}`,
            type: s.type || 'update_record',
            targetTable: parsed.trigger?.table || 'incident',
            decisionTableId: s.type === 'decision_table' ? 'sys_decision_approval_matrix' : undefined,
            dataPillInputs: flattenDataPillInputs(s.dataPillInputs),
            notes: s.notes || ''
          }))
        };

        setFlows(prev => [newFlow, ...prev]);
        setSelectedFlowId(newFlow.id);
        setNaturalLanguageInput('');
      } else {
        fallbackGenerateLocal();
      }
    } catch {
      fallbackGenerateLocal();
    } finally {
      setIsAiGenerating(false);
    }
  };

  const fallbackGenerateLocal = () => {
    const isChange = naturalLanguageInput.toLowerCase().includes('change');
    const isApproval = naturalLanguageInput.toLowerCase().includes('approval') || naturalLanguageInput.toLowerCase().includes('approve');
    const isDecision = naturalLanguageInput.toLowerCase().includes('decision') || naturalLanguageInput.toLowerCase().includes('table') || naturalLanguageInput.toLowerCase().includes('tier');
    
    const table = isChange ? 'change_request' : 'incident';
    const newFlow: FlowDefinition = {
      id: `flow-gen-${Date.now()}`,
      name: isChange ? 'Change Management Standard Flow' : 'Incident Intelligent Triage Flow',
      internalName: isChange ? 'change_standard_flow' : 'incident_triage_flow',
      description: naturalLanguageInput,
      applicationScope: 'global',
      status: 'draft',
      trigger: {
        id: `trig-${Date.now()}`,
        type: 'record_created_or_updated',
        table,
        conditions: isChange ? 'type=normal^state=-5' : 'priorityIN1,2,3^active=true',
        runWhen: 'unique_changes'
      },
      steps: [
        ...(isDecision ? [{
          id: `step-1`,
          stepNumber: 1,
          label: 'Evaluate Decision Table: Dynamic Approval & Assignment',
          type: 'decision_table' as FlowActionType,
          decisionTableId: 'sys_decision_triage_routing',
          dataPillInputs: {
            'category': '{{trigger.current.category}}',
            'urgency': '{{trigger.current.urgency}}'
          },
          notes: 'Evaluates dynamic condition matrix.'
        }] : []),
        ...(isApproval ? [{
          id: `step-2`,
          stepNumber: isDecision ? 2 : 1,
          label: 'Ask for Dynamic Approval',
          type: 'ask_for_approval' as FlowActionType,
          isApproval: true,
          approvalRules: {
            approverType: 'decision_table' as const,
            target: '{{step_1.decision_result.approval_group}}',
            rule: 'anyone' as const
          },
          dataPillInputs: { 'record': '{{trigger.current}}' }
        }] : []),
        {
          id: `step-3`,
          stepNumber: (isDecision ? 1 : 0) + (isApproval ? 1 : 0) + 1,
          label: 'Update Record State & Assign Group',
          type: 'update_record' as FlowActionType,
          targetTable: table,
          dataPillInputs: { 'state': '2', 'work_notes': 'Auto-escalated by Flow Designer' }
        },
        {
          id: `step-4`,
          stepNumber: (isDecision ? 1 : 0) + (isApproval ? 1 : 0) + 2,
          label: 'Send High-Priority Email Notification',
          type: 'send_email' as FlowActionType,
          dataPillInputs: {
            'to': '{{trigger.current.assignment_group}}',
            'subject': `[Flow Alert] ${table.toUpperCase()} {{trigger.current.number}} processed`
          }
        }
      ]
    };

    setFlows(prev => [newFlow, ...prev]);
    setSelectedFlowId(newFlow.id);
    setNaturalLanguageInput('');
  };

  const generateGlideRunnerScript = () => {
    return `// ====================================================================
// ServiceNow Server Script: Trigger Flow Designer via FlowAPI
// Target Flow: ${currentFlow.name} (${currentFlow.internalName})
// Scope: ${currentFlow.applicationScope}
// ====================================================================
(function executeFlowFromScript() {
  try {
    var inputs = {};
    // Trigger Record Context
    var grRecord = new GlideRecord('${currentFlow.trigger.table}');
    grRecord.addQuery('active', true);
    grRecord.setLimit(1);
    grRecord.query();
    
    if (grRecord.next()) {
      inputs['current'] = grRecord;
      inputs['table_name'] = '${currentFlow.trigger.table}';
      
      gs.info('Starting execution of Flow: ${currentFlow.internalName} on ' + grRecord.getDisplayValue());
      
      // Execute asynchronously in background or synchronously via .run()
      var result = sn_fd.FlowAPI.getRunner()
        .flow('${currentFlow.applicationScope}.${currentFlow.internalName}')
        .inBackground()
        .withInputs(inputs)
        .run();
        
      var contextId = result.getContextId();
      gs.info('Flow execution scheduled successfully. Context sys_id: ' + contextId);
      return contextId;
    } else {
      gs.warn('No qualifying record found in ${currentFlow.trigger.table} to run flow.');
    }
  } catch (ex) {
    gs.error('Flow Designer execution failed: ' + ex.getMessage());
  }
})();`;
  };

  const generateSysHubFlowJson = () => {
    return JSON.stringify({
      sys_hub_flow: {
        name: currentFlow.name,
        internal_name: currentFlow.internalName,
        sys_scope: currentFlow.applicationScope,
        description: currentFlow.description,
        status: currentFlow.status,
        trigger: {
          table: currentFlow.trigger.table,
          type: currentFlow.trigger.type,
          conditions: currentFlow.trigger.conditions,
          run_trigger: currentFlow.trigger.runWhen
        },
        actions: currentFlow.steps.map(step => ({
          step: step.stepNumber,
          label: step.label,
          action_type: step.type,
          target_table: step.targetTable,
          decision_table_ref: step.decisionTableId,
          inputs: step.dataPillInputs,
          approval_config: step.approvalRules
        }))
      }
    }, null, 2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#032D42] via-[#043d59] to-[#0080A3] text-white p-6 rounded-2xl shadow-md border border-teal-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <GitMerge className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black tracking-tight font-mono">
              FLOW DESIGNER & WORKFLOW BUILDER
            </h1>
          </div>
          <p className="text-slate-300 text-sm max-w-2xl">
            Convert natural language algorithms into structured ServiceNow Flow Designer triggers, actions, subflows, and integrated Decision Tables (<code className="text-teal-300 font-mono">sys_decision</code>).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const newF: FlowDefinition = {
                id: `flow-${Date.now()}`,
                name: 'New Custom Flow',
                internalName: 'new_custom_flow',
                description: 'Custom ServiceNow workflow',
                applicationScope: 'global',
                status: 'draft',
                trigger: {
                  id: `trig-${Date.now()}`,
                  type: 'record_created_or_updated',
                  table: 'incident',
                  conditions: 'active=true',
                  runWhen: 'always'
                },
                steps: []
              };
              setFlows([newF, ...flows]);
              setSelectedFlowId(newF.id);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-900 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Flow
          </button>
        </div>
      </div>

      {/* NLP Process Converter Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0080A3]" />
            <h3 className="font-bold text-slate-800 text-sm">
              Algorithm to Flow Designer Generator (Natural Language)
            </h3>
          </div>
          <span className="text-[11px] text-slate-600 font-medium">
            AI & Pattern Converter
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={naturalLanguageInput}
            onChange={(e) => setNaturalLanguageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConvertNaturalLanguage()}
            placeholder="e.g. When a P1 incident is logged for VIP user, call Decision Table to pick approval tier, ask for approval, then email Major Incident team and create an Incident Task."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0080A3] focus:border-transparent"
          />
          <button
            onClick={handleConvertNaturalLanguage}
            disabled={isAiGenerating || !naturalLanguageInput.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0080A3] hover:bg-[#006e8c] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            {isAiGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Analyzing Algorithm...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Build Flow
              </>
            )}
          </button>
        </div>

        {/* Quick Example Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-600 font-medium">Quick Presets:</span>
          <button
            onClick={() => setNaturalLanguageInput('When a high priority incident is created with category=Software, run decision table to get L3 team, ask for approval, and send alert.')}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-colors"
          >
            Incident L3 Decision Flow
          </button>
          <button
            onClick={() => setNaturalLanguageInput('On new Hardware request item over $2,000, lookup decision table for manager vs VP approval, then trigger IT asset staging subflow.')}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-colors"
          >
            Hardware Procurement Matrix
          </button>
          <button
            onClick={() => setNaturalLanguageInput('When an Emergency Change request is submitted, route to CAB Decision Table, send urgent approval email, and set stage to Scheduled.')}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 transition-colors"
          >
            Emergency Change Flow
          </button>
        </div>
      </div>

      {/* Main Flow Designer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Flow List & Metadata */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
              Flow Repository
            </h3>
            <div className="space-y-1.5">
              {flows.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFlowId(f.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all border cursor-pointer ${
                    f.id === selectedFlowId
                      ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-xs font-semibold'
                      : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-slate-600 truncate max-w-[120px]">
                      {f.internalName}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      f.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {f.status}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 line-clamp-1">{f.name}</p>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{f.trigger.table} &bull; {f.steps.length} steps</p>
                </button>
              ))}
            </div>
          </div>

          {/* Flow Properties */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-600">
              Flow Properties
            </h3>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Flow Name</label>
              <input
                type="text"
                value={currentFlow.name}
                onChange={(e) => updateCurrentFlow(p => ({ ...p, name: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-1 focus:ring-[#0080A3]"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Internal API Name</label>
              <input
                type="text"
                value={currentFlow.internalName}
                onChange={(e) => updateCurrentFlow(p => ({ ...p, internalName: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-1 focus:ring-[#0080A3]"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Application Scope</label>
              <input
                type="text"
                value={currentFlow.applicationScope}
                onChange={(e) => updateCurrentFlow(p => ({ ...p, applicationScope: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-1 focus:ring-[#0080A3]"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Description</label>
              <textarea
                rows={2}
                value={currentFlow.description}
                onChange={(e) => updateCurrentFlow(p => ({ ...p, description: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#0080A3]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Visual Flow Canvas or Code Exporter */}
        <div className="lg:col-span-3 space-y-4">
          {/* Sub Tab Navigation */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSubTab('canvas')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'canvas'
                    ? 'bg-[#0080A3] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <GitMerge className="w-3.5 h-3.5" />
                Visual Flow Designer
              </button>
              <button
                onClick={() => setActiveSubTab('code')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'code'
                    ? 'bg-[#0080A3] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                JSON Definition (sys_hub_flow)
              </button>
              <button
                onClick={() => setActiveSubTab('runner')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'runner'
                    ? 'bg-[#0080A3] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                FlowAPI GlideScript Runner
              </button>
            </div>

            <span className="text-xs text-slate-600 font-mono pr-2">
              Steps: {currentFlow.steps.length}
            </span>
          </div>

          {activeSubTab === 'canvas' && (
            <div className="space-y-4">
              {/* TRIGGER CARD */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border-2 border-emerald-300 shadow-sm space-y-3 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white tracking-wider uppercase font-mono">
                      TRIGGER
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {currentFlow.trigger.type.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                  </div>
                  <span className="text-xs text-emerald-800 font-mono bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                    Table: {currentFlow.trigger.table}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Trigger Type</label>
                    <select
                      value={currentFlow.trigger.type}
                      onChange={(e) => handleTriggerChange('type', e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="record_created">Record Created</option>
                      <option value="record_updated">Record Updated</option>
                      <option value="record_created_or_updated">Record Created or Updated</option>
                      <option value="service_catalog">Service Catalog (sc_req_item)</option>
                      <option value="scheduled">Scheduled Flow</option>
                      <option value="rest_api">Inbound REST / Inbound Action</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Target Table</label>
                    <input
                      type="text"
                      value={currentFlow.trigger.table}
                      onChange={(e) => handleTriggerChange('table', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500"
                      placeholder="e.g. incident, change_request"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Run Trigger</label>
                    <select
                      value={currentFlow.trigger.runWhen}
                      onChange={(e) => handleTriggerChange('runWhen', e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="always">For every update (Always)</option>
                      <option value="unique_changes">Only if not currently running (Unique)</option>
                      <option value="hourly">Hourly batch</option>
                      <option value="daily">Daily batch</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Trigger Conditions (Encoded Query filter)
                  </label>
                  <input
                    type="text"
                    value={currentFlow.trigger.conditions}
                    onChange={(e) => handleTriggerChange('conditions', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs font-mono text-emerald-950 focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. priorityIN1,2^caller_id.vip=true"
                  />
                </div>
              </div>

              {/* FLOW ARROW CONNECTOR */}
              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-teal-400"></div>
              </div>

              {/* ACTION STEPS LIST */}
              <div className="space-y-4">
                {currentFlow.steps.map((step, index) => (
                  <div key={step.id} className="space-y-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-teal-300 transition-all space-y-3">
                      {/* Step Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-[#0080A3] text-white flex items-center justify-center text-xs font-black font-mono">
                            {step.stepNumber}
                          </span>
                          <div>
                            <input
                              type="text"
                              value={step.label}
                              onChange={(e) => handleStepChange(index, { label: e.target.value })}
                              className="font-bold text-slate-800 text-sm hover:border-b hover:border-slate-300 focus:outline-none focus:border-[#0080A3]"
                            />
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                step.type === 'decision_table'
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : step.type === 'ask_for_approval'
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                  : step.type === 'send_email'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-teal-100 text-teal-800 border border-teal-200'
                              }`}>
                                {step.type.replace(/_/g, ' ')}
                              </span>

                              {step.type === 'decision_table' && onNavigateToDecisionTables && (
                                <button
                                  onClick={() => onNavigateToDecisionTables(step.decisionTableId)}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800 underline cursor-pointer"
                                >
                                  <TableProperties className="w-3 h-3" />
                                  Open in Decision Tables Studio
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reorder & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveStep(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveStep(index, 'down')}
                            disabled={index === currentFlow.steps.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStep(index)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete Step"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Step Specific Details */}
                      {step.type === 'decision_table' && (
                        <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-purple-900 flex items-center gap-1.5">
                              <TableProperties className="w-4 h-4 text-purple-600" />
                              Decision Table Configuration (sys_decision)
                            </span>
                            <span className="font-mono text-[10px] text-purple-700">
                              sn_fd.DecisionTableAPI
                            </span>
                          </div>
                          <div>
                            <label className="block text-purple-800 font-medium mb-1">Decision Table Name or sys_id</label>
                            <input
                              type="text"
                              value={step.decisionTableId || ''}
                              onChange={(e) => handleStepChange(index, { decisionTableId: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-purple-300 font-mono text-purple-900"
                              placeholder="dt_incident_vip_routing"
                            />
                          </div>
                        </div>
                      )}

                      {step.type === 'ask_for_approval' && (
                        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-2 text-xs">
                          <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-amber-600" />
                            Approval Rules & Gate
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-amber-800 font-medium mb-1">Approver Target (Data Pill or Group)</label>
                              <input
                                type="text"
                                value={step.approvalRules?.target || '{{step_1.decision_result.approval_group}}'}
                                onChange={(e) => handleStepChange(index, {
                                  approvalRules: {
                                    approverType: step.approvalRules?.approverType || 'decision_table',
                                    target: e.target.value,
                                    rule: step.approvalRules?.rule || 'anyone'
                                  }
                                })}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-mono text-amber-900"
                              />
                            </div>
                            <div>
                              <label className="block text-amber-800 font-medium mb-1">Approval Condition</label>
                              <select
                                value={step.approvalRules?.rule || 'anyone'}
                                onChange={(e) => handleStepChange(index, {
                                  approvalRules: {
                                    approverType: step.approvalRules?.approverType || 'decision_table',
                                    target: step.approvalRules?.target || '',
                                    rule: e.target.value as any
                                  }
                                })}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900"
                              >
                                <option value="anyone">Anyone approves (First responder)</option>
                                <option value="all">Everyone must approve</option>
                                <option value="majority">Majority (&gt; 50%) approves</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Data Pill Inputs Bindings */}
                      <div className="space-y-1.5 text-xs">
                        <label className="block font-semibold text-slate-700">
                          Data Pill Bindings & Inputs (fd_data.*)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          {Object.entries(step.dataPillInputs).map(([k, val]) => (
                            <div key={k} className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-600 font-medium">{k}:</span>
                              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono text-[11px] border border-teal-200 truncate flex-1">
                                {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes / Documentation */}
                      <div>
                        <input
                          type="text"
                          value={step.notes || ''}
                          onChange={(e) => handleStepChange(index, { notes: e.target.value })}
                          placeholder="Add developer notes or business rule reference..."
                          className="w-full text-xs text-slate-500 italic bg-transparent border-b border-dashed border-slate-200 focus:outline-none focus:border-slate-400 py-1"
                        />
                      </div>
                    </div>

                    {/* Connector Arrow */}
                    {index < currentFlow.steps.length - 1 && (
                      <div className="flex justify-center">
                        <div className="w-0.5 h-6 bg-teal-400"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Step Selector */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center gap-3">
                <span className="text-xs font-semibold text-slate-600">Add Next Action or Flow Logic:</span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handleAddStep('decision_table')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-300 transition-colors cursor-pointer"
                  >
                    <TableProperties className="w-3.5 h-3.5" />
                    Decision Table (sys_decision)
                  </button>
                  <button
                    onClick={() => handleAddStep('ask_for_approval')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Ask for Approval
                  </button>
                  <button
                    onClick={() => handleAddStep('update_record')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-100 text-teal-800 hover:bg-teal-200 border border-teal-300 transition-colors cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    Update Record
                  </button>
                  <button
                    onClick={() => handleAddStep('send_email')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Email
                  </button>
                  <button
                    onClick={() => handleAddStep('create_task')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Task
                  </button>
                  <button
                    onClick={() => handleAddStep('run_subflow')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Run Subflow
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'code' && (
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-teal-400 flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  ServiceNow sys_hub_flow Export Definition
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateSysHubFlowJson());
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied JSON' : 'Copy JSON'}
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-200 bg-black/40 p-4 rounded-xl overflow-x-auto max-h-[500px] leading-relaxed">
                {generateSysHubFlowJson()}
              </pre>
            </div>
          )}

          {activeSubTab === 'runner' && (
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Background Script / GlideScript Execution (sn_fd.FlowAPI)
                </span>
                <div className="flex items-center gap-2">
                  {onAuditScript && (
                    <button
                      onClick={() => onAuditScript(generateGlideRunnerScript(), `FlowRunner: ${currentFlow.name}`)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-900/60 text-purple-300 hover:bg-purple-800/80 transition-colors cursor-pointer"
                    >
                      Audit Script
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateGlideRunnerScript());
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied Script' : 'Copy Script'}
                  </button>
                </div>
              </div>
              <pre className="text-xs font-mono text-emerald-200/90 bg-black/40 p-4 rounded-xl overflow-x-auto max-h-[500px] leading-relaxed">
                {generateGlideRunnerScript()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
