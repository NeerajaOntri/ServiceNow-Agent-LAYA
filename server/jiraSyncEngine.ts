export interface JiraSyncResult {
  shouldSync: boolean;
  issueKey: string;
  summary: string;
  issueType: 'Story' | 'Bug' | 'Task' | 'Epic';
  status: 'SYNCED' | 'IN PROGRESS' | 'RESOLVED' | 'TO DO';
  priority: 'Highest' | 'High' | 'Medium' | 'Low';
  projectKey: string;
  projectName: string;
  assignee: string;
  serviceNowRef: {
    table: string;
    sysId?: string;
    number?: string;
  };
  sprint: string;
  syncTimestamp: string;
  jiraUrl: string;
}

// In-memory counter for incremental enterprise keys
let issueCounter = 301;

/**
 * Checks if the prompt or ServiceNow deployment artifact qualifies for Jira Workspace Sync.
 */
export function checkAndGenerateJiraSync(params: {
  prompt: string;
  table: string;
  sysId?: string;
  number?: string;
  recordName?: string;
  developerName?: string;
  priority?: string;
}): JiraSyncResult | null {
  const { prompt, table, sysId, number, recordName, developerName, priority } = params;
  const lower = prompt.toLowerCase();
  const cleanDev = (developerName || 'Saikiran Veera').replace(/^Dev\s*\d+\s*:\s*/i, '').trim();

  // Jira trigger keywords or typical development artifacts requiring enterprise tracking
  const hasJiraIntent =
    lower.includes('jira') ||
    lower.includes('story') ||
    lower.includes('user story') ||
    lower.includes('bug') ||
    lower.includes('defect') ||
    lower.includes('track') ||
    lower.includes('issue') ||
    lower.includes('task') ||
    lower.includes('sprint') ||
    lower.includes('feature') ||
    lower.includes('backlog') ||
    lower.includes('epic') ||
    lower.includes('acceptance criteria') ||
    table === 'sys_script_include' ||
    table === 'sys_script' ||
    table === 'sys_hub_flow' ||
    table === 'change_request' ||
    table === 'problem';

  if (!hasJiraIntent) {
    return null;
  }

  const currentIssueNum = issueCounter++;
  const issueKey = `LAYA-${currentIssueNum}`;

  // Determine issue type
  let issueType: 'Story' | 'Bug' | 'Task' | 'Epic' = 'Story';
  if (lower.includes('bug') || lower.includes('defect') || lower.includes('outage') || table === 'problem') {
    issueType = 'Bug';
  } else if (lower.includes('epic') || lower.includes('initiative')) {
    issueType = 'Epic';
  } else if (table === 'sys_script' || table === 'sys_script_include' || lower.includes('task') || lower.includes('patch')) {
    issueType = 'Task';
  }

  // Determine priority
  let jiraPriority: 'Highest' | 'High' | 'Medium' | 'Low' = 'High';
  if (priority === '1' || lower.includes('p1') || lower.includes('critical') || lower.includes('emergency')) {
    jiraPriority = 'Highest';
  } else if (priority === '2' || lower.includes('p2') || lower.includes('high')) {
    jiraPriority = 'High';
  } else if (priority === '3' || lower.includes('p3') || lower.includes('medium')) {
    jiraPriority = 'Medium';
  } else {
    jiraPriority = 'Low';
  }

  const titleSummary = recordName || prompt.slice(0, 75);
  const formattedSummary = `[SN:${table}] ${titleSummary}`;

  return {
    shouldSync: true,
    issueKey,
    summary: formattedSummary,
    issueType,
    status: 'SYNCED',
    priority: jiraPriority,
    projectKey: 'LAYA',
    projectName: 'ServiceNow Enterprise Orchestration',
    assignee: cleanDev,
    serviceNowRef: {
      table,
      sysId,
      number: number || sysId,
    },
    sprint: 'Sprint 24 (Q4 Platform Modernization)',
    syncTimestamp: new Date().toISOString(),
    jiraUrl: `https://jira.enterprise.internal/browse/${issueKey}`,
  };
}
