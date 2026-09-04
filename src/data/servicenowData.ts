import { 
  AntiPatternRule, 
  HorizonToken, 
  ServicePortalWidgetData 
} from '../types';

export const STARTER_PROMPTS = [
  {
    category: 'Backend Scripting',
    title: 'GlideAjax Script Include & Client Script',
    prompt: 'How do I build an asynchronous GlideAjax Script Include and an onChange Client Script to fetch user department, manager, and email without freezing the browser?',
  },
  {
    category: 'Architecture & Safety',
    title: 'Prevent current.update() Infinite Loops',
    prompt: 'Explain why calling current.update() in a Before/After Business Rule causes recursion issues, and show the exact correct pattern for updating fields vs updating related records.',
  },
  {
    category: 'Service Portal',
    title: 'Build a Complete Portal Widget',
    prompt: 'Create a Service Portal widget with Server Script, Client Controller, HTML Template, and CSS that displays the logged-in user’s open incidents with a 1-click status update action.',
  },
  {
    category: 'Security & Access Control',
    title: 'Secure Scoped App ACLs',
    prompt: 'How should I design table-level (*, none) and field-level ACLs for a custom scoped application to ensure proper role segregation and security compliance?',
  },
];

export const SERVICENOW_TABLES = [
  { name: 'incident', label: 'Incident', extends: 'task' },
  { name: 'change_request', label: 'Change Request', extends: 'task' },
  { name: 'problem', label: 'Problem', extends: 'task' },
  { name: 'sc_req_item', label: 'Requested Item (RITM)', extends: 'task' },
  { name: 'sc_request', label: 'Request (REQ)', extends: 'task' },
  { name: 'sys_user', label: 'User', extends: 'none' },
  { name: 'sys_user_group', label: 'Group', extends: 'none' },
  { name: 'cmdb_ci', label: 'Configuration Item (CI)', extends: 'none' },
  { name: 'sys_audit', label: 'Audit History', extends: 'none' },
  { name: 'syslog', label: 'System Log', extends: 'none' },
];

export const COMMON_FIELDS: Record<string, { label: string; type: string }[]> = {
  incident: [
    { label: 'active', type: 'boolean' },
    { label: 'priority', type: 'integer' },
    { label: 'state', type: 'choice' },
    { label: 'category', type: 'string' },
    { label: 'caller_id', type: 'reference' },
    { label: 'assignment_group', type: 'reference' },
    { label: 'assigned_to', type: 'reference' },
    { label: 'short_description', type: 'string' },
    { label: 'sys_created_on', type: 'datetime' },
  ],
  task: [
    { label: 'active', type: 'boolean' },
    { label: 'priority', type: 'integer' },
    { label: 'state', type: 'choice' },
    { label: 'short_description', type: 'string' },
    { label: 'assignment_group', type: 'reference' },
  ],
  sys_user: [
    { label: 'active', type: 'boolean' },
    { label: 'user_name', type: 'string' },
    { label: 'first_name', type: 'string' },
    { label: 'last_name', type: 'string' },
    { label: 'email', type: 'string' },
    { label: 'department', type: 'reference' },
    { label: 'manager', type: 'reference' },
  ],
};

export const QUERY_OPERATORS = [
  { value: '=', label: 'is (=)' },
  { value: '!=', label: 'is not (!=)' },
  { value: 'LIKE', label: 'contains (LIKE)' },
  { value: 'STARTSWITH', label: 'starts with (STARTSWITH)' },
  { value: 'ENDSWITH', label: 'ends with (ENDSWITH)' },
  { value: 'IN', label: 'is one of (IN)' },
  { value: 'NOT LIKE', label: 'does not contain (NOT LIKE)' },
  { value: '<', label: 'less than (<)' },
  { value: '>', label: 'greater than (>)' },
  { value: '<=', label: 'less than or equal (<=)' },
  { value: '>=', label: 'greater than or equal (>=)' },
  { value: 'ISEMPTY', label: 'is empty (ISEMPTY)' },
  { value: 'ISNOTEMPTY', label: 'is not empty (ISNOTEMPTY)' },
];

export const SAMPLE_WIDGETS: ServicePortalWidgetData[] = [
  {
    id: 'my_open_incidents',
    name: 'My Open Incidents Quick-Card',
    description: 'Displays the active incidents assigned to or opened by the logged-in user with live count badges and resolution action.',
    serverScript: `(function() {
  data.incidents = [];
  data.userId = gs.getUserID();
  
  if (input && input.action === 'resolve_incident') {
    var grInc = new GlideRecordSecure('incident');
    if (grInc.get(input.sys_id)) {
      grInc.setValue('state', 6); // Resolved
      grInc.setValue('close_notes', 'Resolved via Service Portal Widget');
      grInc.update();
      gs.addInfoMessage('Incident ' + grInc.getValue('number') + ' marked as Resolved.');
    }
  }

  var gr = new GlideRecordSecure('incident');
  gr.addQuery('active', true);
  var qc = gr.addQuery('caller_id', data.userId);
  qc.addOrCondition('assigned_to', data.userId);
  gr.orderByDesc('sys_updated_on');
  gr.setLimit(10);
  gr.query();

  while (gr.next()) {
    data.incidents.push({
      sys_id: gr.getUniqueValue(),
      number: gr.getValue('number'),
      short_description: gr.getValue('short_description'),
      priority: gr.getDisplayValue('priority'),
      state: gr.getDisplayValue('state'),
      updated: gr.getDisplayValue('sys_updated_on')
    });
  }
})();`,
    clientController: `function($scope, spUtil) {
  var c = this;

  c.resolveIncident = function(sysId) {
    if (!confirm('Are you sure you want to mark this incident as resolved?')) return;
    
    c.server.get({
      action: 'resolve_incident',
      sys_id: sysId
    }).then(function(response) {
      c.data.incidents = response.data.incidents;
      spUtil.addInfoMessage('Incident updated successfully.');
    });
  };

  c.refresh = function() {
    c.server.update();
  };
}`,
    template: `<div class="panel panel-default shadow-sm border-0">
  <div class="panel-heading bg-primary text-white flex justify-between items-center p-3">
    <h4 class="panel-title font-bold m-0 flex items-center gap-2">
      <i class="fa fa-ticket"></i> My Active Incidents ({{c.data.incidents.length}})
    </h4>
    <button class="btn btn-xs btn-default" ng-click="c.refresh()">
      <i class="fa fa-refresh"></i> Refresh
    </button>
  </div>
  <div class="list-group">
    <div ng-if="c.data.incidents.length === 0" class="p-4 text-center text-muted">
      No open incidents currently pending for your account.
    </div>
    <div ng-repeat="inc in c.data.incidents" class="list-group-item flex justify-between items-center hover:bg-slate-50">
      <div>
        <div class="font-bold text-primary">{{inc.number}} - <span class="text-dark">{{inc.short_description}}</span></div>
        <div class="text-xs text-muted">Priority: {{inc.priority}} | State: {{inc.state}} | Updated: {{inc.updated}}</div>
      </div>
      <button class="btn btn-sm btn-outline-success" ng-click="c.resolveIncident(inc.sys_id)">
        <i class="fa fa-check"></i> Resolve
      </button>
    </div>
  </div>
</div>`,
    css: `.panel {
  border-radius: 8px;
  overflow: hidden;
}
.list-group-item {
  border-left: none;
  border-right: none;
  padding: 12px 16px;
}
.panel-heading {
  background-color: #032D42 !important;
}`,
  },
];

export const ANTI_PATTERNS: AntiPatternRule[] = [
  {
    id: 'current_update',
    title: 'current.update() in Business Rule',
    severity: 'CRITICAL',
    regex: /current\s*\.\s*update\s*\(/g,
    category: 'Server Logic',
    explanation: 'Calling current.update() inside a Before or After Business Rule causes recursive loop execution, high database locks, and can trigger 100+ nested executions.',
    remediation: 'In a BEFORE rule, simply assign values to fields (e.g. current.setValue("priority", 1)) — the platform automatically saves current. In an AFTER rule, update related records, NOT current.',
    sampleBad: `(function executeRule(current, previous) {
  current.state = 2;
  current.update(); // ❌ Causes recursion!
})(current, previous);`,
    sampleGood: `(function executeRule(current, previous) {
  // ✅ Before Business Rule:
  current.setValue('state', 2);
  // No update() required! Platform saves automatically.
})(current, previous);`,
  },
  {
    id: 'hardcoded_sys_id',
    title: 'Hardcoded sys_id in Script',
    severity: 'CRITICAL',
    regex: /['"][0-9a-f]{32}['"]/gi,
    category: 'Maintainability & Migration',
    explanation: 'Hardcoding 32-character hexadecimal sys_id strings creates fragile dependencies. When migrating update sets between DEV, TEST, and PROD, sys_ids can mismatch and break.',
    remediation: 'Store identifiers in System Properties (sys_properties) using gs.getProperty("my_prop") or query by a natural key (e.g., name, code).',
    sampleBad: `var gr = new GlideRecord('sys_user_group');
if (gr.get('46d44a23a9fe19810012d100cca80666')) { // ❌ Hardcoded sys_id
  // ...
}`,
    sampleGood: `var groupId = gs.getProperty('com.myapp.support_group.sys_id'); // ✅ System Property
var gr = new GlideRecord('sys_user_group');
if (gr.get(groupId)) {
  // ...
}`,
  },
  {
    id: 'missing_set_limit',
    title: 'Unbounded GlideRecord Query (Missing setLimit)',
    severity: 'WARNING',
    regex: /new\s+GlideRecord\s*\([^)]+\)(?:(?!setLimit)[\s\S])*?\.query\s*\(\s*\)/g,
    category: 'Performance',
    explanation: 'Querying tables without setLimit() can pull hundreds of thousands of records into JVM memory if conditions match broadly, causing OutOfMemory errors.',
    remediation: 'Always specify a reasonable boundary (e.g. gr.setLimit(100)) unless an unbounded batch job with proper chunking is strictly required.',
    sampleBad: `var gr = new GlideRecord('syslog');
gr.addQuery('level', 2);
gr.query(); // ❌ Could load 1,000,000 logs into memory!`,
    sampleGood: `var gr = new GlideRecord('syslog');
gr.addQuery('level', 2);
gr.setLimit(250); // ✅ Safeguard JVM memory
gr.query();`,
  },
  {
    id: 'sync_client_gliderecord',
    title: 'Client-Side Synchronous GlideRecord',
    severity: 'CRITICAL',
    regex: /var\s+\w+\s*=\s*new\s+GlideRecord\s*\(/g,
    category: 'Client Performance',
    explanation: 'Executing GlideRecord directly inside Client Scripts freezes the end-user browser window while waiting for synchronous server response.',
    remediation: 'Always use GlideAjax calling a client_callable Script Include with an asynchronous callback function.',
    sampleBad: `function onChange(control, oldValue, newValue, isLoading) {
  var gr = new GlideRecord('sys_user');
  gr.get(newValue); // ❌ Synchronous browser freeze!
  g_form.setValue('email', gr.email);
}`,
    sampleGood: `function onChange(control, oldValue, newValue, isLoading) {
  var ga = new GlideAjax('UserUtilsAjax');
  ga.addParam('sysparm_name', 'getUserDetails');
  ga.addParam('sysparm_user_id', newValue);
  ga.getXMLAnswer(function(response) { // ✅ Async callback
    g_form.setValue('email', response);
  });
}`,
  },
];

export const HORIZON_TOKENS: HorizonToken[] = [
  { category: 'Colors', name: '--now-color_brand--primary', value: '#032D42', description: 'Primary brand deep navy blue used for headers and primary controls.', previewType: 'color' },
  { category: 'Colors', name: '--now-color_brand--secondary', value: '#0080A3', description: 'ServiceNow signature teal/cyan accent color for links, buttons, and badges.', previewType: 'color' },
  { category: 'Colors', name: '--now-color_background--primary', value: '#FFFFFF', description: 'Canvas background for elevated panels, form views, and modal surfaces.', previewType: 'color' },
  { category: 'Colors', name: '--now-color_background--secondary', value: '#F4F6F8', description: 'Neutral background for workspace framing, page canvas, and borders.', previewType: 'color' },
  { category: 'Alerts & Severity', name: '--now-color_alert--critical', value: '#BD271E', description: 'Used for P1 incidents, critical outages, and fatal scanner violations.', previewType: 'color' },
  { category: 'Alerts & Severity', name: '--now-color_alert--warning', value: '#ED8B00', description: 'Used for P2 incidents, pending state alerts, and configuration warnings.', previewType: 'color' },
  { category: 'Alerts & Severity', name: '--now-color_alert--positive', value: '#237804', description: 'Success toasts, verified ACL checks, and active service health.', previewType: 'color' },
  { category: 'Alerts & Severity', name: '--now-color_alert--info', value: '#006699', description: 'Informational system notices and reference hints.', previewType: 'color' },
  { category: 'Spacing', name: '--now-static-space--xs', value: '4px', description: 'Micro space for badges, icon offsets, and compact form paddings.', previewType: 'spacing' },
  { category: 'Spacing', name: '--now-static-space--sm', value: '8px', description: 'Tight space for inline buttons, list item gaps, and tags.', previewType: 'spacing' },
  { category: 'Spacing', name: '--now-static-space--md', value: '16px', description: 'Standard container inner padding across workspace cards and widgets.', previewType: 'spacing' },
  { category: 'Spacing', name: '--now-static-space--lg', value: '24px', description: 'Generous section padding between major layout blocks.', previewType: 'spacing' },
  { category: 'Elevation', name: '--now-elevation--low', value: '0 1px 3px rgba(0,0,0,0.08)', description: 'Subtle lift for cards and table rows on hover.', previewType: 'shadow' },
  { category: 'Elevation', name: '--now-elevation--high', value: '0 8px 24px rgba(0,0,0,0.12)', description: 'Pronounced depth for modal dialogs and dropdown menus.', previewType: 'shadow' },
];

export const API_CHEAT_SHEET = [
  {
    scope: 'Server-Side',
    title: 'GlideRecord & GlideRecordSecure',
    description: 'Object-Relational Mapping (ORM) to perform database queries, insertions, updates, and deletes.',
    code: `var gr = new GlideRecordSecure('incident');
gr.addQuery('active', true);
gr.addQuery('priority', '<=', 2);
gr.orderByDesc('sys_created_on');
gr.setLimit(50);
gr.query();

while (gr.next()) {
  var incNum = gr.getValue('number'); // ✅ String extraction
  var sysId = gr.getUniqueValue();   // ✅ 32-char ID
  gs.info('P1/P2 Incident: ' + incNum);
}`,
  },
  {
    scope: 'Server-Side',
    title: 'GlideAggregate (High Performance Aggregations)',
    description: 'Executes native SQL COUNT, SUM, MIN, MAX, and AVG directly on the database engine.',
    code: `var ga = new GlideAggregate('incident');
ga.addQuery('active', true);
ga.addAggregate('COUNT');
ga.groupBy('category');
ga.query();

while (ga.next()) {
  var category = ga.getValue('category');
  var count = ga.getAggregate('COUNT');
  gs.info(category + ': ' + count);
}`,
  },
  {
    scope: 'Client-Side',
    title: 'g_form & g_user APIs',
    description: 'Manipulate form fields, dynamic validations, and current user profile metadata safely on the client.',
    code: `function onLoad() {
  // Set mandatory & read-only dynamically
  g_form.setMandatory('work_notes', true);
  g_form.setReadOnly('opened_by', true);

  // Check user role
  if (g_user.hasRole('admin')) {
    g_form.addInfoMessage('Logged in as Administrator');
  }

  // Get current record sys_id
  var recordId = g_form.getUniqueValue();
}`,
  },
  {
    scope: 'Client-Side',
    title: 'GlideAjax Client Invocation',
    description: 'Asynchronously invoke a client-callable Script Include without freezing user browser interaction.',
    code: `var ga = new GlideAjax('IncidentManagerAjax');
ga.addParam('sysparm_name', 'getIncidentDetails');
ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
ga.getXMLAnswer(function(answer) {
  if (answer) {
    var data = JSON.parse(answer);
    g_form.setValue('short_description', data.summary);
  }
});`,
  },
];
