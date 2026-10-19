export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  category?: 'backend' | 'frontend' | 'portal' | 'security' | 'workflow' | 'integration';
  isError?: boolean;
  errorType?: 'high_demand' | 'network' | 'generic';
  modelUsed?: string;
}

export type ActiveTab =
  | 'chat'
  | 'instance'
  | 'flowDesigner'
  | 'decisionTables'
  | 'emailNotifications'
  | 'catalogStudio'
  | 'updateSetManager'
  | 'queryBuilder'
  | 'widgetStudio'
  | 'codeAuditor'
  | 'tokens'
  | 'apiRef';

// ==========================================
// 1. FLOW DESIGNER & WORKFLOW BUILDER TYPES
// ==========================================
export type FlowTriggerType = 'record_created' | 'record_updated' | 'record_created_or_updated' | 'scheduled' | 'rest_api' | 'service_catalog';

export interface FlowTrigger {
  id: string;
  type: FlowTriggerType;
  table: string;
  conditions: string;
  runWhen: 'always' | 'unique_changes' | 'daily' | 'hourly';
  description?: string;
}

export type FlowActionType =
  | 'update_record'
  | 'create_record'
  | 'ask_for_approval'
  | 'send_email'
  | 'create_task'
  | 'decision_table'
  | 'run_subflow'
  | 'wait_for_condition'
  | 'if_condition'
  | 'for_each'
  | 'log_message';

export interface FlowActionStep {
  id: string;
  stepNumber: number;
  label: string;
  type: FlowActionType;
  targetTable?: string;
  decisionTableId?: string;
  subflowName?: string;
  dataPillInputs: Record<string, string>;
  conditions?: string;
  notes?: string;
  isApproval?: boolean;
  approvalRules?: {
    approverType: 'user' | 'group' | 'decision_table';
    target: string;
    rule: 'anyone' | 'all' | 'majority' | 'percentage';
  };
}

export interface FlowDefinition {
  id: string;
  name: string;
  internalName: string;
  description: string;
  applicationScope: string;
  trigger: FlowTrigger;
  steps: FlowActionStep[];
  status: 'draft' | 'published';
}

// ==========================================
// 2. DECISION TABLES & APPROVAL ENGINE TYPES
// ==========================================
export interface DecisionInputVariable {
  id: string;
  label: string;
  name: string;
  type: 'string' | 'number' | 'currency' | 'choice' | 'boolean' | 'reference';
  referenceTable?: string;
  choices?: string[];
}

export interface DecisionOutputVariable {
  id: string;
  label: string;
  name: string;
  type: 'string' | 'reference' | 'boolean' | 'number';
  referenceTable?: string;
}

export interface DecisionConditionCell {
  inputId: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'IN' | 'CONTAINS' | 'ANY';
  value: string;
}

export interface DecisionRow {
  id: string;
  order: number;
  description: string;
  conditions: Record<string, DecisionConditionCell>;
  outputs: Record<string, string>;
}

export interface DecisionTableConfig {
  id: string;
  name: string;
  sysId: string;
  applicationScope: string;
  description: string;
  inputs: DecisionInputVariable[];
  outputs: DecisionOutputVariable[];
  rows: DecisionRow[];
  defaultOutputs: Record<string, string>;
}

// ==========================================
// 3. OUTBOUND EMAIL NOTIFICATION TYPES
// ==========================================
export type NotificationSendTrigger = 'record_inserted' | 'record_updated' | 'record_inserted_or_updated' | 'event_fired';

export interface EmailNotificationConfig {
  id: string;
  name: string;
  applicationScope: string;
  table: string;
  active: boolean;
  trigger: NotificationSendTrigger;
  condition: string;
  eventName?: string;
  // Who will receive
  recipientFields: string[]; // e.g. ['assigned_to', 'caller_id']
  recipientUsers: string[];
  recipientGroups: string[];
  sendToEventParm1: boolean;
  sendToEventParm2: boolean;
  sendToEventCreator: boolean;
  // Content
  subject: string;
  messageType: 'html' | 'text' | 'html_and_text';
  templateTheme: 'modern_card' | 'incident_alert' | 'approval_action' | 'catalog_receipt';
  bodyHtml: string;
  includeWatermark: boolean;
  includeUriRef: boolean;
}

// ==========================================
// 4. SERVICE CATALOG ITEM CREATOR TYPES
// ==========================================
export type CatalogVariableType =
  | 'single_line_text'
  | 'multi_line_text'
  | 'select_box'
  | 'reference'
  | 'checkbox'
  | 'date'
  | 'datetime'
  | 'radio';

export interface CatalogVariable {
  id: string;
  name: string;
  label: string;
  type: CatalogVariableType;
  mandatory: boolean;
  readOnly: boolean;
  defaultValue?: string;
  helpText?: string;
  choices?: string[];
  referenceTable?: string;
  order: number;
}

export interface CatalogUIPolicyRule {
  id: string;
  conditionVariable: string;
  conditionOperator: '==' | '!=' | 'is_checked' | 'is_not_empty';
  conditionValue: string;
  actions: {
    targetVariable: string;
    visible?: boolean;
    mandatory?: boolean;
    readOnly?: boolean;
  }[];
}

export interface CatalogItemDefinition {
  id: string;
  name: string;
  shortDescription: string;
  category: string;
  catalog: string;
  price: number;
  recurringPrice?: number;
  icon: string;
  variables: CatalogVariable[];
  uiPolicies: CatalogUIPolicyRule[];
  fulfillmentFlow: string;
  deliveryDays: number;
}

// ==========================================
// 5. UPDATE SET MERGER & DEPLOYMENT TYPES
// ==========================================
export interface UpdateSetPayload {
  sysId: string;
  name: string;
  targetName: string;
  type: 'sys_script' | 'sys_script_client' | 'sys_script_include' | 'sys_ui_action' | 'sys_ui_policy' | 'sysevent_email_action' | 'sc_cat_item' | 'sp_widget';
  action: 'INSERT_OR_UPDATE' | 'DELETE';
  updatedBy: string;
  updatedOn: string;
  xmlPayloadPreview: string;
}

export interface IndividualUpdateSet {
  id: string;
  name: string;
  sysId: string;
  author: string;
  state: 'In progress' | 'Complete' | 'Ignore';
  description: string;
  payloads: UpdateSetPayload[];
}

export interface UpdateCollision {
  collisionKey: string; // e.g. "sys_script_include:IncidentUtils"
  type: string;
  targetName: string;
  collidingSets: {
    setId: string;
    setName: string;
    updatedOn: string;
    author: string;
    snippet: string;
  }[];
  selectedWinnerSetId: string; // user chosen resolution
  resolutionStrategy: 'latest' | 'earliest' | 'custom';
}

export interface ReleasePackageConfig {
  packageName: string;
  releaseNumber: string;
  targetInstance: string;
  description: string;
  sourceSets: IndividualUpdateSet[];
}

export interface InstanceStatus {
  instanceUrl: string;
  isReachable: boolean;
  isAuthenticated: boolean;
  hasCredentials: boolean;
  pingMs?: number;
  statusCode?: number;
  userName?: string;
  userRoles?: string[];
  errorMessage?: string;
  errorDetail?: string;
  passwordNeedsReset?: boolean;
  isHibernating?: boolean;
  lastChecked?: string;
  authMethod?: 'basic' | 'token' | 'none';
}

export interface TableRecord {
  sys_id: string;
  [key: string]: any;
}

export interface QueryCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  conjunction: '^' | '^OR' | '^NQ';
}

export interface ServicePortalWidgetData {
  name: string;
  id: string;
  description: string;
  serverScript: string;
  clientController: string;
  template: string;
  css: string;
  optionSchema?: string;
}

export interface AntiPatternRule {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'BEST_PRACTICE';
  regex: RegExp;
  category: string;
  explanation: string;
  remediation: string;
  sampleBad: string;
  sampleGood: string;
}

export interface DetectedIssue {
  rule: AntiPatternRule;
  matchLine?: number;
  matchText?: string;
}

export interface HorizonToken {
  category: 'Colors' | 'Alerts & Severity' | 'Components' | 'Spacing' | 'Typography' | 'Elevation';
  name: string;
  value: string;
  description: string;
  previewType: 'color' | 'spacing' | 'font' | 'shadow';
}
