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

export type ActiveTab = 'chat' | 'queryBuilder' | 'widgetStudio' | 'codeAuditor' | 'tokens' | 'apiRef';

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
