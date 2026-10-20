import { ArchitecturePlan, ArchitectureComponent, DiagramNode, DiagramEdge, TeamMember } from '../types';

/**
 * Dynamically format an Update Set name based on the selected developer persona
 * and the requirement topic or prompt content.
 * e.g. "US-SaikiranVeera_VIPIncidentEscalation" or "US-NeerajaOmtri_AssetDisposalWorkflow"
 */
export function formatDynamicUpdateSetName(
  devName: string,
  topicOrPrompt: string,
  includeTimestamp = false
): string {
  // Clean developer persona name (strip "Dev 1:", special chars, spaces)
  const cleanDev = devName
    .replace(/^Dev\s*\d+\s*:\s*/i, '')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '');

  let topic = 'General';
  if (topicOrPrompt) {
    const brdMatch = topicOrPrompt.match(/BRD-?\d+[:\s]+([^.\n\r]+)/i);
    const storyMatch = topicOrPrompt.match(/User Story[:\s]+([^.\n\r]+)/i);
    if (brdMatch && brdMatch[1]) {
      topic = brdMatch[1].trim();
    } else if (storyMatch && storyMatch[1]) {
      topic = storyMatch[1].trim();
    } else {
      const firstLine = topicOrPrompt.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, ' ');
      const words = firstLine.trim().split(/\s+/).filter(w => w.length > 2).slice(0, 3);
      if (words.length > 0) {
        topic = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      }
    }
  }

  const cleanTopic = topic.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24) || 'FeaturePackage';
  
  if (includeTimestamp) {
    const timeStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8);
    return `US-${cleanDev || 'Dev'}_${cleanTopic}_${timeStr}`;
  }
  return `US-${cleanDev || 'Dev'}_${cleanTopic}`;
}

/**
 * Generate a dynamic ServiceNow architecture plan, components, and XML customer update payloads
 * for ANY arbitrary user input or custom BRD prompt.
 */
export function generateDynamicPlanFromInput(
  rawPrompt: string,
  appScope: string,
  developer: TeamMember
): ArchitecturePlan {
  const promptLower = rawPrompt.toLowerCase();
  
  let entity = 'Feature';
  let targetTable = 'incident';

  if (promptLower.includes('catalog') || promptLower.includes('laptop') || promptLower.includes('hardware') || promptLower.includes('order') || promptLower.includes('item')) {
    entity = 'HardwareRequest';
    targetTable = 'sc_req_item';
  } else if (promptLower.includes('change') || promptLower.includes('release') || promptLower.includes('deployment') || promptLower.includes('cab')) {
    entity = 'ChangeGovernance';
    targetTable = 'change_request';
  } else if (promptLower.includes('user') || promptLower.includes('onboard') || promptLower.includes('employee') || promptLower.includes('offboard')) {
    entity = 'UserLifecycle';
    targetTable = 'sys_user';
  } else if (promptLower.includes('asset') || promptLower.includes('disposal') || promptLower.includes('inventory') || promptLower.includes('ci')) {
    entity = 'AssetLifecycle';
    targetTable = 'alm_asset';
  } else if (promptLower.includes('problem') || promptLower.includes('known error') || promptLower.includes('root cause')) {
    entity = 'ProblemRemediation';
    targetTable = 'problem';
  } else if (promptLower.includes('security') || promptLower.includes('vulnerability') || promptLower.includes('threat')) {
    entity = 'SecOpsTriage';
    targetTable = 'sn_si_incident';
  } else {
    const words = rawPrompt.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/).filter(w => w.length > 3).slice(0, 2);
    if (words.length > 0) {
      entity = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    }
    targetTable = 'incident';
  }

  const entitySnake = entity.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const scopePrefix = appScope || 'x_snc_custom';
  const cleanSummary = rawPrompt.slice(0, 160).replace(/[\r\n]+/g, ' ').trim();

  const components: ArchitectureComponent[] = [
    {
      id: `comp-dyn-1-${Date.now()}`,
      type: 'sys_db_object',
      typeName: 'Table Schema Extension',
      name: `u_${entitySnake}_record`,
      targetTable: targetTable,
      description: `ServiceNow schema extension definition with audit tracking, dictionary entries, and indexing for ${entity}.`,
      details: {
        'Target Table': targetTable,
        'Scope': scopePrefix,
        'Audit Enabled': 'true',
        'Key Fields': `u_${entitySnake}_status, u_priority_code, u_assigned_team, u_sla_target`
      },
      codeSnippet: `<!-- sys_dictionary schema payload for ${targetTable} -->
<record_update sys_domain="global" table="sys_dictionary">
  <sys_dictionary action="INSERT_OR_UPDATE">
    <name>${targetTable}</name>
    <element>u_${entitySnake}_status</element>
    <column_label>${entity} Status</column_label>
    <internal_type>string</internal_type>
    <max_length>40</max_length>
    <choice>1</choice>
    <active>true</active>
    <sys_scope>${scopePrefix}</sys_scope>
  </sys_dictionary>
</record_update>`,
      dependencies: [targetTable],
      scope: scopePrefix
    },
    {
      id: `comp-dyn-2-${Date.now()}`,
      type: 'sys_hub_flow',
      typeName: 'Flow Designer Flow',
      name: `${entity} Intelligent Orchestration Flow`,
      targetTable: targetTable,
      description: `Automated background flow triggered on ${targetTable} insert/update, executing conditions and action dispatch.`,
      details: {
        'Trigger': `Record Created or Updated on [${targetTable}]`,
        'Execution': 'Async in Background',
        'Run As': 'System Administrator',
        'Action 1': `Evaluate ${entity} Decision Matrix`,
        'Action 2': 'Update Target Record State',
        'Action 3': 'Trigger Multi-Channel Notifications'
      },
      codeSnippet: `// ServiceNow FlowAPI Execution Runner
sn_fd.FlowAPI.getRunner()
    .flow('${scopePrefix}.${entitySnake}_orchestration_flow')
    .inBackground()
    .withInputs({
        current: current,
        table_name: '${targetTable}'
    }).run();`,
      dependencies: [`sys_decision:${entity} Matrix`, targetTable],
      scope: scopePrefix
    },
    {
      id: `comp-dyn-3-${Date.now()}`,
      type: 'sys_decision',
      typeName: 'Decision Table',
      name: `${entity} Routing & Priority Matrix`,
      targetTable: 'sys_decision',
      description: `Multi-condition evaluation matrix determining target SLA, assignment group, and escalation tier.`,
      details: {
        'Decision Table': `sys_decision: ${entity} Rules`,
        'Input Condition': `${entity} Criteria Match`,
        'Output Column': 'u_target_assignment_group + u_urgency'
      },
      codeSnippet: `var decisionMap = {
    'entity_code': current.getValue('number') || '',
    'state': current.getValue('state') || '1'
};
var answer = sn_fd.DecisionTableAPI.getDecision('${entitySnake}_routing_matrix', decisionMap);
var targetGroup = answer.u_assignment_group;
var calculatedSla = answer.u_target_mttr_hours;`,
      dependencies: ['sys_decision_question'],
      scope: scopePrefix
    },
    {
      id: `comp-dyn-4-${Date.now()}`,
      type: 'sys_script_include',
      typeName: 'Script Include',
      name: `${entity}Utils`,
      targetTable: 'sys_script_include',
      description: `High-performance server-side helper class encapsulating business rules, caching, and GlideRecordSecure queries.`,
      details: {
        'Client Callable': 'true',
        'Active': 'true',
        'Access': 'All Application Scopes',
        'Methods': 'evaluateCriteria(), processAction(), getTargetTier()'
      },
      codeSnippet: `var ${entity}Utils = Class.create();
${entity}Utils.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    initialize: function() {
        this._cache = {};
        this.scope = '${scopePrefix}';
    },
    evaluateCriteria: function(recordSysId) {
        if (!recordSysId) return false;
        var gr = new GlideRecordSecure('${targetTable}');
        if (gr.get(recordSysId)) {
            // Evaluated rule for: ${cleanSummary}
            return true;
        }
        return false;
    },
    processAction: function(recordSysId, actionType) {
        var gr = new GlideRecordSecure('${targetTable}');
        if (gr.get(recordSysId)) {
            gr.setValue('work_notes', '[LAYA Automated Action] ' + actionType + ' executed by ${developer.name}.');
            gr.update();
            return true;
        }
        return false;
    },
    type: '${entity}Utils'
});`,
      dependencies: [targetTable],
      scope: scopePrefix
    },
    {
      id: `comp-dyn-5-${Date.now()}`,
      type: 'sys_script',
      typeName: 'Business Rule',
      name: `${entity} Validation & Governance Rule`,
      targetTable: targetTable,
      description: `Before-insert/update database trigger enforcing business constraints and preventing anti-patterns.`,
      details: {
        'When': 'before',
        'On': 'Insert / Update',
        'Condition': 'current.active == true',
        'Order': '100'
      },
      codeSnippet: `(function executeRule(current, previous /*null when async*/) {
    // Platform Standard: GlideRecordSecure logic via Script Include
    var utils = new ${entity}Utils();
    if (!utils.evaluateCriteria(current.getUniqueValue())) {
        // Enforce validations
    }
})(current, previous);`,
      dependencies: [`sys_script_include:${entity}Utils`, targetTable],
      scope: scopePrefix
    },
    {
      id: `comp-dyn-6-${Date.now()}`,
      type: 'sysevent_email_action',
      typeName: 'Notification',
      name: `${entity} Stakeholder Action Alert`,
      targetTable: targetTable,
      description: `Automated event-driven email notification dispatching SLA alerts and action links to assigned teams.`,
      details: {
        'Event Name': `${scopePrefix}.${entitySnake}.notify`,
        'Recipients': 'Assigned Group & Watchlist',
        'Delivery Priority': 'High (P1)'
      },
      codeSnippet: `gs.eventQueue('${scopePrefix}.${entitySnake}.notify', current, current.assigned_to || current.opened_by, '${cleanSummary}');`,
      dependencies: [targetTable],
      scope: scopePrefix
    }
  ];

  const diagramNodes: DiagramNode[] = [
    { id: 'node-1', label: `${targetTable}`, sublabel: 'Source Record Trigger', category: 'trigger', x: 60, y: 140 },
    { id: 'node-2', label: `${entity} Business Rule`, sublabel: 'sys_script before rule', category: 'logic', x: 280, y: 70 },
    { id: 'node-3', label: `${entity} Flow`, sublabel: 'sys_hub_flow async engine', category: 'logic', x: 280, y: 220 },
    { id: 'node-4', label: `${entity} Matrix`, sublabel: 'sys_decision table', category: 'data', x: 520, y: 70 },
    { id: 'node-5', label: `${entity}Utils`, sublabel: 'sys_script_include helper', category: 'data', x: 520, y: 220 },
    { id: 'node-6', label: `${entity} Alerts`, sublabel: 'sysevent_email_action', category: 'notification', x: 750, y: 140 }
  ];

  const diagramEdges: DiagramEdge[] = [
    { from: 'node-1', to: 'node-2', label: 'before trigger' },
    { from: 'node-1', to: 'node-3', label: 'async trigger' },
    { from: 'node-2', to: 'node-4', label: 'rules' },
    { from: 'node-3', to: 'node-5', label: 'evaluates' },
    { from: 'node-4', to: 'node-6', label: 'notifies' },
    { from: 'node-5', to: 'node-6', label: 'dispatches' }
  ];

  return {
    id: `plan-dyn-${Date.now()}`,
    title: `${entity} Architecture Plan`,
    prompt: rawPrompt,
    scope: scopePrefix,
    summary: `End-to-end ServiceNow architecture translating "${cleanSummary}" into 6 coordinated platform components on [${targetTable}].`,
    components,
    diagramNodes,
    diagramEdges,
    approved: false,
    assignedDeveloperId: developer.id,
    targetUpdateSetId: developer.associatedUpdateSetId,
    generatedTimestamp: new Date().toLocaleTimeString()
  };
}
