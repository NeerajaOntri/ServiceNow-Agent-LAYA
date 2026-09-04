import { AntiPatternRule, HorizonToken, ServicePortalWidgetData } from '../types';

export const STARTER_PROMPTS = [
  {
    title: 'Custom Task Tracker App',
    category: 'Backend & Data Model',
    prompt: 'Help me design and build a full-stack ServiceNow custom task tracker application named "x_snc_tasker". Include the custom table schema (extending task), Dictionary Overrides, before & after Business Rules, ACLs, and custom app roles.',
  },
  {
    title: 'Service Portal Widget',
    category: 'Service Portal',
    prompt: 'Build a production-ready ServiceNow Service Portal widget for "My Approvals" with Server Script (GlideRecordSecure), Client Controller ($scope.server.update, spModal.confirm, spUtil), HTML Template, and SCSS using Horizon tokens.',
  },
  {
    title: 'Audit Insecure Scripts',
    category: 'Security & Quality',
    prompt: 'Explain the most common ServiceNow server-side and client-side anti-patterns (such as current.update() recursion, getXMLWait(), and un-parameterized queries). Show how to refactor them according to ServiceNow certified standards.',
  },
  {
    title: 'Scripted REST API Endpoint',
    category: 'Integrations',
    prompt: 'Write a complete ServiceNow Scripted REST API (sys_ws_definition) resource script for creating and querying incidents. Include pagination, query parameter validation, ACL check, error JSON payload, and status codes.',
  },
  {
    title: 'Async GlideAjax Pattern',
    category: 'Client Scripting',
    prompt: 'Provide a complete Script Include (extending AbstractAjaxProcessor) and an onChange Client Script that asynchronously fetches caller details (VIP status, department, location, manager) using GlideAjax with getXMLAnswer().',
  },
  {
    title: 'ATF Test Specification',
    category: 'Testing & ATF',
    prompt: 'Write an Automated Test Framework (ATF) test plan and test steps to validate the Incident resolution flow, verifying mandatory resolution code/notes and checking that business rules fire correctly.',
  },
];

export const SN_TABLES = [
  {
    name: 'incident',
    label: 'Incident',
    extends: 'task',
    fields: [
      { name: 'number', label: 'Number', type: 'string' },
      { name: 'short_description', label: 'Short Description', type: 'string' },
      { name: 'state', label: 'State', type: 'choice', choices: ['1 (New)', '2 (In Progress)', '3 (On Hold)', '6 (Resolved)', '7 (Closed)', '8 (Canceled)'] },
      { name: 'priority', label: 'Priority', type: 'choice', choices: ['1 (Critical)', '2 (High)', '3 (Moderate)', '4 (Low)', '5 (Planning)'] },
      { name: 'assigned_to', label: 'Assigned To', type: 'reference' },
      { name: 'assignment_group', label: 'Assignment Group', type: 'reference' },
      { name: 'caller_id', label: 'Caller', type: 'reference' },
      { name: 'category', label: 'Category', type: 'choice', choices: ['hardware', 'software', 'network', 'inquiry'] },
      { name: 'active', label: 'Active', type: 'boolean' },
      { name: 'sys_created_on', label: 'Created On', type: 'datetime' },
      { name: 'urgency', label: 'Urgency', type: 'choice', choices: ['1 (High)', '2 (Medium)', '3 (Low)'] },
      { name: 'impact', label: 'Impact', type: 'choice', choices: ['1 (High)', '2 (Medium)', '3 (Low)'] },
    ],
  },
  {
    name: 'change_request',
    label: 'Change Request',
    extends: 'task',
    fields: [
      { name: 'number', label: 'Number', type: 'string' },
      { name: 'short_description', label: 'Short Description', type: 'string' },
      { name: 'state', label: 'State', type: 'choice', choices: ['-5 (New)', '-4 (Assess)', '-3 (Authorize)', '-2 (Scheduled)', '-1 (Implement)', '0 (Review)', '3 (Closed)', '4 (Canceled)'] },
      { name: 'type', label: 'Type', type: 'choice', choices: ['normal', 'standard', 'emergency'] },
      { name: 'risk', label: 'Risk', type: 'choice', choices: ['1 (Very High)', '2 (High)', '3 (Moderate)', '4 (Low)'] },
      { name: 'assigned_to', label: 'Assigned To', type: 'reference' },
      { name: 'assignment_group', label: 'Assignment Group', type: 'reference' },
      { name: 'start_date', label: 'Planned Start', type: 'datetime' },
      { name: 'end_date', label: 'Planned End', type: 'datetime' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    name: 'problem',
    label: 'Problem',
    extends: 'task',
    fields: [
      { name: 'number', label: 'Number', type: 'string' },
      { name: 'short_description', label: 'Short Description', type: 'string' },
      { name: 'problem_state', label: 'Problem State', type: 'choice', choices: ['101 (New)', '102 (Assess)', '103 (Root Cause Analysis)', '104 (Fix in Progress)', '106 (Resolved)', '107 (Closed)'] },
      { name: 'priority', label: 'Priority', type: 'choice', choices: ['1', '2', '3', '4', '5'] },
      { name: 'assigned_to', label: 'Assigned To', type: 'reference' },
      { name: 'root_cause', label: 'Root Cause', type: 'string' },
      { name: 'work_around', label: 'Workaround', type: 'string' },
      { name: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    name: 'sys_user',
    label: 'User [sys_user]',
    extends: '',
    fields: [
      { name: 'user_name', label: 'User ID', type: 'string' },
      { name: 'first_name', label: 'First Name', type: 'string' },
      { name: 'last_name', label: 'Last Name', type: 'string' },
      { name: 'email', label: 'Email', type: 'string' },
      { name: 'active', label: 'Active', type: 'boolean' },
      { name: 'department', label: 'Department', type: 'reference' },
      { name: 'title', label: 'Title', type: 'string' },
      { name: 'vip', label: 'VIP', type: 'boolean' },
    ],
  },
  {
    name: 'cmdb_ci_server',
    label: 'Server [cmdb_ci_server]',
    extends: 'cmdb_ci',
    fields: [
      { name: 'name', label: 'Name', type: 'string' },
      { name: 'os', label: 'Operating System', type: 'string' },
      { name: 'ip_address', label: 'IP Address', type: 'string' },
      { name: 'install_status', label: 'Status', type: 'choice', choices: ['1 (Installed)', '2 (In Maintenance)', '7 (Retired)'] },
      { name: 'operational_status', label: 'Operational Status', type: 'choice', choices: ['1 (Operational)', '2 (Non-Operational)'] },
      { name: 'ram', label: 'RAM (MB)', type: 'integer' },
    ],
  },
];

export const SN_OPERATORS = [
  { value: '=', label: 'is (=)', placeholder: 'e.g. 1 or active' },
  { value: '!=', label: 'is not (!=)', placeholder: 'e.g. 6' },
  { value: 'LIKE', label: 'contains (LIKE)', placeholder: 'e.g. network' },
  { value: 'NOTLIKE', label: 'does not contain (NOTLIKE)', placeholder: 'e.g. test' },
  { value: 'STARTSWITH', label: 'starts with (STARTSWITH)', placeholder: 'e.g. INC' },
  { value: 'ENDSWITH', label: 'ends with (ENDSWITH)', placeholder: 'e.g. @company.com' },
  { value: 'IN', label: 'is one of (IN)', placeholder: 'e.g. 1,2,3' },
  { value: 'NOTIN', label: 'is not one of (NOTIN)', placeholder: 'e.g. 6,7' },
  { value: 'ISEMPTY', label: 'is empty (ISEMPTY)', noValue: true },
  { value: 'ISNOTEMPTY', label: 'is not empty (ISNOTEMPTY)', noValue: true },
  { value: '<=', label: 'less than or equal (<=)', placeholder: 'e.g. 2' },
  { value: '>=', label: 'greater than or equal (>=)', placeholder: 'e.g. 2' },
  { value: '<', label: 'less than (<)', placeholder: 'e.g. 3' },
  { value: '>', label: 'greater than (>)', placeholder: 'e.g. 1' },
  { value: 'RELATIVEGE@hour@ago@24', label: 'in the last 24 hours', noValue: true },
  { value: 'RELATIVEGE@day@ago@7', label: 'in the last 7 days', noValue: true },
  { value: 'DYNAMIC90d1921e5f510100a9ad2572f2b477fe', label: 'is (dynamic) Me', noValue: true },
];

export const SAMPLE_WIDGET: ServicePortalWidgetData = {
  name: 'My Open Incidents',
  id: 'my-open-incidents',
  description: 'Displays active incidents assigned to the logged-in user with quick actions and live status updates.',
  serverScript: `(function() {
    // Populate widget initial data or handle client updates
    if (input) {
        if (input.action === 'resolve_incident') {
            var gr = new GlideRecordSecure('incident');
            if (gr.get(input.sys_id)) {
                gr.setValue('state', '6'); // Resolved
                gr.setValue('close_code', 'Solved (Permanently)');
                gr.setValue('close_notes', 'Resolved via Service Portal Widget action.');
                gr.update();
                data.actionStatus = 'resolved';
            }
        }
    } else {
        data.title = 'My Assigned Incidents';
        data.items = [];

        var incGr = new GlideRecordSecure('incident');
        incGr.addActiveQuery();
        incGr.addQuery('assigned_to', gs.getUserID());
        incGr.orderByDesc('priority');
        incGr.setLimit(10);
        incGr.query();

        while (incGr.next()) {
            data.items.push({
                sys_id: incGr.getUniqueValue(),
                number: incGr.getValue('number'),
                short_description: incGr.getValue('short_description'),
                state: incGr.getDisplayValue('state'),
                priority: incGr.getDisplayValue('priority'),
                priority_code: incGr.getValue('priority'),
                created: incGr.getDisplayValue('sys_created_on')
            });
        }
    }
})();`,
  clientController: `function($scope, spUtil, spModal, $rootScope) {
    var c = this;

    c.resolve = function(item) {
        spModal.confirm('Are you sure you want to mark ' + item.number + ' as Resolved?')
            .then(function(confirmed) {
                if (confirmed) {
                    $scope.data.action = 'resolve_incident';
                    $scope.data.sys_id = item.sys_id;
                    $scope.server.update().then(function(response) {
                        spUtil.addInfoMessage(item.number + ' marked as Resolved.');
                        // Remove from active list
                        c.data.items = c.data.items.filter(function(i) {
                            return i.sys_id !== item.sys_id;
                        });
                    });
                }
            });
    };

    c.openDetail = function(item) {
        $rootScope.$broadcast('incident.selected', { sys_id: item.sys_id });
    };
}`,
  template: `<div class="panel panel-default sn-widget-card">
  <div class="panel-heading">
    <div class="row">
      <div class="col-xs-8">
        <h4 class="panel-title"><i class="fa fa-ticket"></i> {{::c.data.title}}</h4>
      </div>
      <div class="col-xs-4 text-right">
        <span class="badge">{{c.data.items.length}} Active</span>
      </div>
    </div>
  </div>
  <div class="panel-body">
    <div ng-if="c.data.items.length === 0" class="text-center text-muted p-lg">
      <i class="fa fa-check-circle-o fa-3x"></i>
      <p>All clear! No pending incidents assigned to you.</p>
    </div>
    <div class="list-group" ng-if="c.data.items.length > 0">
      <div ng-repeat="item in c.data.items track by item.sys_id" class="list-group-item">
        <div class="row">
          <div class="col-sm-3">
            <strong>{{item.number}}</strong>
            <div class="small text-muted">{{item.created}}</div>
          </div>
          <div class="col-sm-5">
            <span class="text-dark">{{item.short_description}}</span>
          </div>
          <div class="col-sm-2">
            <span class="label" ng-class="{'label-danger': item.priority_code == '1', 'label-warning': item.priority_code == '2', 'label-info': item.priority_code >= '3'}">
              {{item.priority}}
            </span>
          </div>
          <div class="col-sm-2 text-right">
            <button class="btn btn-sm btn-success" ng-click="c.resolve(item); $event.stopPropagation();" title="Resolve Incident">
              <i class="fa fa-check"></i> Resolve
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  css: `.sn-widget-card {
  border-radius: 6px;
  border: 1px solid rgb(var(--now-container--border-color, 218, 220, 224));
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.sn-widget-card .panel-heading {
  background-color: #032D42;
  color: #FFFFFF;
  font-weight: 600;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
.list-group-item:hover {
  background-color: #F8FAFC;
}`,
  optionSchema: `[
  {"name": "title", "label": "Title", "type": "string", "defaultValue": "My Assigned Incidents"},
  {"name": "limit", "label": "Record Limit", "type": "integer", "defaultValue": 10}
]`,
};

export const ANTI_PATTERN_RULES: AntiPatternRule[] = [
  {
    id: 'current-update',
    title: 'current.update() in Business Rule',
    severity: 'CRITICAL',
    regex: /current\.update\s*\(/g,
    category: 'Server-Side Recursion',
    explanation: 'Calling current.update() inside a Business Rule (before or after) triggers the Business Rule engine again on the same record, causing recursive execution loops and server freezing.',
    remediation: 'In "before" rules, simply assign values to current (e.g. current.state = 2;). In "after" rules, avoid updating current or use setWorkflow(false) if strictly required.',
    sampleBad: `(function executeRule(current, previous) {
    if (current.priority == 1) {
        current.urgency = 1;
        current.update(); // ❌ DANGEROUS: Recursive loop!
    }
})(current, previous);`,
    sampleGood: `(function executeRule(current, previous) {
    // In a "before" business rule, just set the value. Engine saves it automatically!
    if (current.priority == 1) {
        current.urgency = 1; // ✅ Saved automatically without current.update()
    }
})(current, previous);`,
  },
  {
    id: 'sync-glideajax',
    title: 'Synchronous GlideAjax (getXMLWait)',
    severity: 'CRITICAL',
    regex: /\.getXMLWait\s*\(/g,
    category: 'Client Performance / Browser Freeze',
    explanation: 'getXMLWait() blocks the browser UI thread completely until the server responds, degrading user experience and causing form stutter.',
    remediation: 'Always use the asynchronous ga.getXMLAnswer(callbackFunction) method.',
    sampleBad: `var ga = new GlideAjax('UserUtils');
ga.addParam('sysparm_name', 'getManager');
ga.getXMLWait(); // ❌ Synchronous freeze!
var manager = ga.getAnswer();`,
    sampleGood: `var ga = new GlideAjax('UserUtils');
ga.addParam('sysparm_name', 'getManager');
ga.getXMLAnswer(function(answer) { // ✅ Asynchronous callback
    g_form.setValue('manager', answer);
});`,
  },
  {
    id: 'client-gliderecord',
    title: 'Client-Side GlideRecord in Form Script',
    severity: 'CRITICAL',
    regex: /new\s+GlideRecord\s*\(/g,
    category: 'Client Security & Performance',
    explanation: 'Using GlideRecord in Client Scripts or Catalog Client Scripts exposes table schemas, bypasses fine-grained security, and is extremely slow.',
    remediation: 'Use a Script Include (AbstractAjaxProcessor) and call it asynchronously from the client with GlideAjax.',
    sampleBad: `var gr = new GlideRecord('sys_user'); // ❌ Client-side GlideRecord
gr.addQuery('active', true);
gr.query();`,
    sampleGood: `// Use GlideAjax to call a server-side Script Include
var ga = new GlideAjax('UserHelper');
ga.addParam('sysparm_name', 'fetchActiveUsers');
ga.getXMLAnswer(function(response) {
    // Process response safely
});`,
  },
  {
    id: 'hardcoded-sysid',
    title: 'Hardcoded 32-Character sys_id',
    severity: 'WARNING',
    regex: /['"][a-f0-9]{32}['"]/gi,
    category: 'Instance Portability & Hygiene',
    explanation: 'Hardcoding sys_ids breaks when moving code between sub-production (Dev/Test) and Production instances because sys_ids rarely match across instances.',
    remediation: 'Store sys_ids in System Properties (gs.getProperty) or look them up dynamically using encoded queries or reference qualifiers.',
    sampleBad: `if (current.assignment_group == 'd625dccec0a8016700a222a0f7900d03') { // ❌ Hardcoded sys_id
    // logic
}`,
    sampleGood: `var targetGroupId = gs.getProperty('my_app.network_team_group_id');
if (current.assignment_group == targetGroupId) { // ✅ Stored in System Property
    // logic
}`,
  },
  {
    id: 'unsecure-gliderecord',
    title: 'GlideRecord in User Context (Bypasses ACLs)',
    severity: 'WARNING',
    regex: /new\s+GlideRecord\s*\((?!.*GlideRecordSecure)/g,
    category: 'Contextual Security',
    explanation: 'GlideRecord queries execute with system privileges and ignore user Access Control Lists (ACLs). When acting on behalf of an end-user, this can expose sensitive rows.',
    remediation: 'Use GlideRecordSecure instead of GlideRecord in user-facing scripts, Service Portal widgets, and Scripted REST APIs.',
    sampleBad: `var gr = new GlideRecord('salary_record'); // ❌ Ignores user ACLs!
gr.query();`,
    sampleGood: `var gr = new GlideRecordSecure('salary_record'); // ✅ Enforces user ACLs!
gr.query();`,
  },
  {
    id: 'gs-print',
    title: 'gs.print() in Production Scripts',
    severity: 'BEST_PRACTICE',
    regex: /gs\.print\s*\(/g,
    category: 'Logging Hygiene',
    explanation: 'gs.print() sends untracked output directly to logs without severity categorization or context prefixing.',
    remediation: 'Use gs.info(), gs.warn(), or gs.error() with formatted context tags, e.g. gs.info("[MyApp:BR] Processing {0}", current.number);',
    sampleBad: `gs.print("User created: " + current.name); // ❌ Uncategorized print`,
    sampleGood: `gs.info("[UserSync:BR] User created: {0}", current.name); // ✅ Contextual logging`,
  },
  {
    id: 'query-concat',
    title: 'String Concatenation in addQuery (SQLi Risk)',
    severity: 'CRITICAL',
    regex: /\.addQuery\s*\(\s*['"][a-zA-Z0-9_]+['"]\s*,\s*['"][=><!]+['"]\s*\+/g,
    category: 'Query Injection Risk',
    explanation: 'Concatenating raw operator strings and user input directly into queries risks malformed conditions and injection.',
    remediation: 'Use the parameterized signature: gr.addQuery("state", "=", userInput); or gr.addQuery("state", userInput);',
    sampleBad: `gr.addQuery('short_description', '=' + userInput); // ❌ Concatenated operator`,
    sampleGood: `gr.addQuery('short_description', '=', userInput); // ✅ Clean parameterization`,
  },
];

export const HORIZON_TOKENS: HorizonToken[] = [
  { category: 'Colors', name: '--now-color--primary-1', value: '0, 128, 163', description: 'Primary ServiceNow brand teal/cyan', previewType: 'color' },
  { category: 'Colors', name: '--now-color--primary-2', value: '0, 102, 130', description: 'Primary dark brand variant', previewType: 'color' },
  { category: 'Colors', name: '--now-color--secondary-1', value: '3, 45, 66', description: 'Secondary deep navy brand color', previewType: 'color' },
  { category: 'Colors', name: '--now-color--neutral-0', value: '255, 255, 255', description: 'Pure neutral white', previewType: 'color' },
  { category: 'Colors', name: '--now-color--neutral-3', value: '244, 246, 248', description: 'Subtle gray surface background', previewType: 'color' },
  { category: 'Colors', name: '--now-color--neutral-12', value: '29, 34, 40', description: 'Near black text and headings', previewType: 'color' },
  { category: 'Alerts & Severity', name: '--now-color_alert--critical-2', value: '217, 30, 24', description: 'Critical alert / P1 red', previewType: 'color' },
  { category: 'Alerts & Severity', name: '--now-color_alert--warning-2', value: '243, 156, 18', description: 'Warning yellow / amber', previewType: 'color' },
  { category: 'Alerts & Severity', name: '--now-color_alert--positive-2', value: '39, 174, 96', description: 'Positive success green', previewType: 'color' },
  { category: 'Alerts & Severity', name: '--now-color_alert--info-2', value: '41, 128, 185', description: 'Informational blue', previewType: 'color' },
  { category: 'Components', name: '--now-actionable--primary--background-color', value: '0, 128, 163', description: 'Primary action button background', previewType: 'color' },
  { category: 'Components', name: '--now-container--background-color', value: '255, 255, 255', description: 'Card & modal container background', previewType: 'color' },
  { category: 'Components', name: '--now-container--border-color', value: '218, 220, 224', description: 'Card container border divider', previewType: 'color' },
  { category: 'Spacing', name: '--now-spacing--sm', value: '8px', description: '8px compact element spacing', previewType: 'spacing' },
  { category: 'Spacing', name: '--now-spacing--md', value: '12px', description: '12px standard layout spacing', previewType: 'spacing' },
  { category: 'Spacing', name: '--now-spacing--lg', value: '16px', description: '16px card padding', previewType: 'spacing' },
  { category: 'Spacing', name: '--now-spacing--xl', value: '24px', description: '24px section margin', previewType: 'spacing' },
  { category: 'Elevation', name: '--now-elevation--2', value: '0 1px 3px rgba(0,0,0,0.12)', description: 'Card surface elevation shadow', previewType: 'shadow' },
  { category: 'Elevation', name: '--now-elevation--4', value: '0 4px 6px rgba(0,0,0,0.15)', description: 'Dropdown and popover shadow', previewType: 'shadow' },
];

export const API_CHEAT_SHEET = [
  {
    category: 'Server-Side (GlideRecord & gs)',
    items: [
      { name: 'GlideRecordSecure', desc: 'ACL-respecting record query. Syntax: var gr = new GlideRecordSecure("incident");' },
      { name: 'GlideAggregate', desc: 'Fast database counts & statistics. Syntax: ga.addAggregate("COUNT");' },
      { name: 'GlideDateTime', desc: 'Timezone-safe date arithmetic. Syntax: var gdt = new GlideDateTime(); gdt.addDaysUTC(5);' },
      { name: 'gs.getUser()', desc: 'Current user object with roles, groups, and preferences. Syntax: gs.getUser().isMemberOf("Network");' },
      { name: 'gs.eventQueue()', desc: 'Fire platform events for notifications and workflows. Syntax: gs.eventQueue("incident.escalated", current, parm1, parm2);' },
      { name: 'sn_ws.RESTMessageV2', desc: 'Outbound HTTP/REST integrations. Syntax: var rm = new sn_ws.RESTMessageV2("MyEndpoint", "get");' },
    ],
  },
  {
    category: 'Client-Side (g_form & GlideAjax)',
    items: [
      { name: 'g_form.setValue()', desc: 'Set field value. Syntax: g_form.setValue("state", "2");' },
      { name: 'g_form.setMandatory()', desc: 'Toggle mandatory state dynamically. Syntax: g_form.setMandatory("work_notes", true);' },
      { name: 'g_form.addInfoMessage()', desc: 'Show top banner alert. Syntax: g_form.addInfoMessage("Record saved.");' },
      { name: 'GlideAjax (async)', desc: 'Call server Script Include. Syntax: ga.getXMLAnswer(function(ans) { ... });' },
      { name: 'g_scratchpad', desc: 'Read server data passed from Display Business Rules without extra queries.' },
    ],
  },
  {
    category: 'Service Portal ($sp & spUtil)',
    items: [
      { name: '$scope.server.update()', desc: 'Client-to-server data refresh triggered from Client Controller.' },
      { name: 'spUtil.addInfoMessage()', desc: 'Display portal notification banner. Syntax: spUtil.addInfoMessage("Saved!");' },
      { name: 'spModal.confirm()', desc: 'Service Portal promise-based confirm dialog. Syntax: spModal.confirm("Delete?");' },
      { name: '$rootScope.$broadcast()', desc: 'Inter-widget pub/sub event bus across different widgets on the same page.' },
    ],
  },
];
