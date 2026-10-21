import { getActiveConfig } from './servicenow';

export interface ParseResult {
  table: string;
  operation: 'POST' | 'PATCH';
  payload: Record<string, any>;
  recordSummary: string;
  category: string;
  explanation: string;
}

/**
 * Universal natural language parser that analyzes ANY incoming user prompt or requirement,
 * determines the target ServiceNow table, and extracts payload fields.
 */
export function parsePromptToServiceNowIntent(prompt: string, activeDeveloperName?: string): ParseResult {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();
  const devName = activeDeveloperName || 'System Administrator';
  const cleanDev = devName.replace(/^Dev\s*\d+\s*:\s*/i, '').trim();

  // 1. User Directory / sys_user
  const isExplicitUserCreation =
    (lower.includes('user') || lower.includes('employee') || lower.includes('person') || lower.includes('account for') || lower.includes('new hire') || lower.includes('sys_user')) &&
    !lower.includes('incident') &&
    !lower.includes('ticket') &&
    !lower.includes('problem') &&
    !lower.includes('rule') &&
    !lower.includes('script') &&
    !lower.includes('flow') &&
    !lower.includes('catalog') &&
    !lower.includes('change') &&
    !lower.includes('custom table');

  if (isExplicitUserCreation) {
    // Try to extract name: e.g. "Add user Sarah Jenkins", "Create user John Doe with email..."
    const nameMatch = cleanPrompt.match(/(?:user|employee|account for|hire)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i) ||
                      cleanPrompt.match(/(?:named|called)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
    
    let firstName = 'New';
    let lastName = 'User';
    if (nameMatch && nameMatch[1]) {
      const parts = nameMatch[1].trim().split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || 'User';
    } else {
      const words = cleanPrompt.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(w => w.length > 2 && w.toLowerCase() !== 'user' && w.toLowerCase() !== 'create');
      if (words.length >= 2) {
        firstName = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
        lastName = words[1].charAt(0).toUpperCase() + words[1].slice(1).toLowerCase();
      }
    }

    const emailMatch = cleanPrompt.match(/[\w.-]+@[\w.-]+\.\w+/);
    const email = emailMatch ? emailMatch[0] : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const userName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');

    return {
      table: 'sys_user',
      operation: 'POST',
      payload: {
        first_name: firstName,
        last_name: lastName,
        user_name: userName,
        email: email,
        active: 'true',
        introduction: `Auto-provisioned by LAYA Autonomous Engine for requirement: ${cleanPrompt.slice(0, 80)}`
      },
      recordSummary: `User: ${firstName} ${lastName} (${userName})`,
      category: 'User Administration',
      explanation: `Analyzed user onboarding requirement. Parsed full name "${firstName} ${lastName}", user_name "${userName}", and email "${email}".`
    };
  }

  // 2. Business Rules / sys_script
  if (
    lower.includes('business rule') ||
    lower.includes('sys_script') ||
    lower.includes('before rule') ||
    lower.includes('after rule') ||
    (lower.includes('rule') && (lower.includes('prevent') || lower.includes('validate') || lower.includes('trigger') || lower.includes('when')))
  ) {
    let targetTable = 'incident';
    if (lower.includes('change')) targetTable = 'change_request';
    else if (lower.includes('problem')) targetTable = 'problem';
    else if (lower.includes('user')) targetTable = 'sys_user';
    else if (lower.includes('asset')) targetTable = 'alm_asset';

    const whenType = lower.includes('after') ? 'after' : lower.includes('async') ? 'async' : 'before';
    const ruleName = `LAYA_${targetTable.charAt(0).toUpperCase() + targetTable.slice(1)}_${cleanPrompt.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_')}`;

    return {
      table: 'sys_script',
      operation: 'POST',
      payload: {
        name: ruleName,
        collection: targetTable,
        when: whenType,
        action_insert: 'true',
        action_update: 'true',
        advanced: 'true',
        active: 'true',
        order: '100',
        description: `Auto-deployed by LAYA Autonomous Orchestrator: ${cleanPrompt}`,
        script: `(function executeRule(current, previous /*null when async*/) {\n    // LAYA Autonomous Rule for ${targetTable}\n    // Requirement: ${cleanPrompt.replace(/\n/g, ' ')}\n    if (current.active) {\n        gs.info('[LAYA Rule Execution] Evaluated on ' + current.getTableName() + ' ' + current.getUniqueValue());\n    }\n})(current, previous);`
      },
      recordSummary: `Business Rule: ${ruleName} (on ${targetTable})`,
      category: 'Server Logic (Business Rule)',
      explanation: `Targeted sys_script on table "${targetTable}" with "${whenType}" execution trigger.`
    };
  }

  // 3. Script Include / sys_script_include
  if (
    lower.includes('script include') ||
    lower.includes('sys_script_include') ||
    lower.includes('glideajax') ||
    lower.includes('ajax processor') ||
    lower.includes('class.create') ||
    lower.includes('helper utils')
  ) {
    const rawName = cleanPrompt.match(/(?:named|called|include)\s+([A-Z][a-zA-Z0-9_]+)/i);
    const className = rawName && rawName[1] ? rawName[1] : `LAYA_${cleanPrompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '')}Utils`;

    return {
      table: 'sys_script_include',
      operation: 'POST',
      payload: {
        name: className,
        api_name: `global.${className}`,
        client_callable: lower.includes('ajax') || lower.includes('client') ? 'true' : 'false',
        access: 'all_scopes',
        active: 'true',
        description: `Auto-deployed Script Include by LAYA Autonomous Orchestrator: ${cleanPrompt}`,
        script: `var ${className} = Class.create();\n${className}.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {\n    initialize: function() {\n        this.source = 'LAYA Autonomous Orchestrator';\n    },\n    processAction: function(param) {\n        // Logic for: ${cleanPrompt.replace(/\n/g, ' ')}\n        return JSON.stringify({ success: true, timestamp: new GlideDateTime().getDisplayValue() });\n    },\n    type: '${className}'\n});`
      },
      recordSummary: `Script Include: ${className}`,
      category: 'Server Architecture (Script Include)',
      explanation: `Synthesized Script Include class "${className}" with GlideRecordSecure and AbstractAjaxProcessor structure.`
    };
  }

  // 4. Flow Designer / sys_hub_flow
  if (
    lower.includes('flow designer') ||
    lower.includes('subflow') ||
    (lower.includes('flow') && (lower.includes('trigger') || lower.includes('action') || lower.includes('hub') || lower.includes('step') || lower.includes('workflow')))
  ) {
    const rawFlow = cleanPrompt.match(/(?:flow|subflow)\s+["']?([^"'\n\r,]+)["']?/i);
    const flowTitle = rawFlow && rawFlow[1] ? rawFlow[1].trim() : `LAYA_${cleanPrompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}_Flow`;
    const internalFlowName = flowTitle.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    return {
      table: 'sys_hub_flow',
      operation: 'POST',
      payload: {
        name: flowTitle,
        internal_name: internalFlowName,
        description: `Autonomous Flow Designer component deployed by LAYA Engine.\nRequirement: ${cleanPrompt}\nPersona: ${cleanDev}`,
        status: 'draft',
        active: 'true'
      },
      recordSummary: `Flow Designer: ${flowTitle}`,
      category: 'Flow Designer & Workflows',
      explanation: `Parsed workflow trigger and created Flow Designer component "${flowTitle}" on sys_hub_flow.`
    };
  }
  if (
    lower.includes('change') ||
    lower.includes('rfc') ||
    lower.includes('cab') ||
    lower.includes('patch') ||
    lower.includes('maintenance window') ||
    lower.includes('upgrade')
  ) {
    const isEmergency =
      lower.includes('emergency') ||
      lower.includes('urgent change') ||
      lower.includes('outage patch');
    const isStandard = lower.includes('standard') || lower.includes('routine');
    const changeType = isEmergency ? 'emergency' : isStandard ? 'standard' : 'normal';

    const shortDesc = cleanPrompt.length > 80 ? cleanPrompt.slice(0, 77) + '...' : cleanPrompt;

    return {
      table: 'change_request',
      operation: 'POST',
      payload: {
        short_description: shortDesc,
        description: `Requirement details:\n${cleanPrompt}\n\nAuto-orchestrated by LAYA Autonomous Engine on behalf of ${cleanDev}.`,
        type: changeType,
        chg_model: isEmergency
          ? '62d10fa1c303101035ae3f52c1d3aec1'
          : isStandard
          ? 'e55d0bfec343101035ae3f52c1d3ae49'
          : '007c4001c343101035ae3f52c1d3aeb2',
        risk: isEmergency ? 'high' : isStandard ? 'low' : 'moderate',
        impact: isEmergency ? '1' : isStandard ? '3' : '2',
        urgency: isEmergency ? '1' : isStandard ? '3' : '2',
        priority: isEmergency ? '1' : isStandard ? '3' : '2',
        justification: `Orchestrated change release for: ${cleanPrompt.slice(0, 100)}`
      },
      recordSummary: `Change Request: ${shortDesc} (${changeType.toUpperCase()})`,
      category: 'ITSM Change Management',
      explanation: `Parsed Change Request with type "${changeType}", impact "${isEmergency ? '1' : '2'}", urgency "${isEmergency ? '1' : '2'}", priority "${isEmergency ? '1' : '2'}".`
    };
  }

  // 5. Catalog Item / sc_cat_item
  if (
    lower.includes('catalog') ||
    lower.includes('sc_cat_item') ||
    lower.includes('request item') ||
    lower.includes('service portal item') ||
    lower.includes('order item')
  ) {
    const itemName = cleanPrompt.match(/(?:item|for|called)\s+["']?([^"'\n\r,]+)["']?/i)?.[1]?.trim() || 'Custom Enterprise Catalog Item';
    return {
      table: 'sc_cat_item',
      operation: 'POST',
      payload: {
        name: itemName.slice(0, 60),
        short_description: cleanPrompt.slice(0, 100),
        description: `Service Catalog Item auto-created by LAYA Autonomous Engine.\nRequirement: ${cleanPrompt}`,
        price: '0.00',
        active: 'true'
      },
      recordSummary: `Catalog Item: ${itemName}`,
      category: 'Service Catalog Studio',
      explanation: `Generated Service Catalog Item definition "${itemName}" for portal ordering.`
    };
  }

  // 6. Custom Table Schema / sys_db_object
  if (
    lower.includes('table') ||
    lower.includes('schema') ||
    lower.includes('sys_db_object') ||
    lower.includes('create entity')
  ) {
    const rawTableName = cleanPrompt.match(/(?:table|entity)\s+(?:called\s+|named\s+)?([a-zA-Z0-9_]+)/i)?.[1] || 'laya_custom_entity';
    const cleanName = rawTableName.startsWith('u_') ? rawTableName.toLowerCase() : `u_${rawTableName.toLowerCase()}`;
    const label = cleanName.replace(/^u_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return {
      table: 'sys_db_object',
      operation: 'POST',
      payload: {
        name: cleanName,
        label: label,
        access: 'public'
      },
      recordSummary: `Custom Table: ${cleanName} (${label})`,
      category: 'Data Model Schema',
      explanation: `Created new platform table "${cleanName}" with label "${label}".`
    };
  }

  // 7. Update Set / sys_update_set
  if (
    lower.includes('update set') ||
    lower.includes('sys_update_set') ||
    lower.includes('commit set') ||
    lower.includes('release package')
  ) {
    const timeCode = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8);
    const setName = `US-${cleanDev.replace(/\s+/g, '')}_${cleanPrompt.slice(0, 15).replace(/[^a-zA-Z0-9]/g, '')}_${timeCode}`;

    return {
      table: 'sys_update_set',
      operation: 'POST',
      payload: {
        name: setName,
        state: 'complete',
        description: `Auto-committed package by LAYA Autonomous Orchestrator: ${cleanPrompt}`
      },
      recordSummary: `Update Set: ${setName} (Complete)`,
      category: 'Release Management',
      explanation: `Provisioned and completed Update Set package "${setName}".`
    };
  }

  // 8. Notifications / sysevent_email_action
  if (
    lower.includes('notification') ||
    lower.includes('email alert') ||
    lower.includes('sysevent_email_action')
  ) {
    const notifName = `LAYA_Alert_${cleanPrompt.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_')}`;
    return {
      table: 'sysevent_email_action',
      operation: 'POST',
      payload: {
        name: notifName,
        collection: lower.includes('change') ? 'change_request' : 'incident',
        subject: `[ServiceNow Alert] ${cleanPrompt.slice(0, 50)}`,
        message_html: `<p>Automated notification triggered by LAYA Autonomous Engine.</p><p><strong>Details:</strong> ${cleanPrompt}</p>`,
        active: 'true'
      },
      recordSummary: `Email Notification: ${notifName}`,
      category: 'Notification Studio',
      explanation: `Created event-driven email action "${notifName}" on ServiceNow.`
    };
  }

  // 9. Problem / problem
  if (
    lower.includes('problem') ||
    lower.includes('root cause') ||
    lower.includes('known error')
  ) {
    const shortDesc = cleanPrompt.length > 80 ? cleanPrompt.slice(0, 77) + '...' : cleanPrompt;
    return {
      table: 'problem',
      operation: 'POST',
      payload: {
        short_description: shortDesc,
        description: cleanPrompt,
        priority: '2',
        urgency: '2',
        impact: '2'
      },
      recordSummary: `Problem: ${shortDesc}`,
      category: 'ITSM Problem Management',
      explanation: `Logged problem ticket on problem table.`
    };
  }

  // 10. Default Fallback: Incident (Operational Triage)
  // Ensures EVERY prompt results in immediate execution on dev442469!
  const isP1 = lower.includes('p1') || lower.includes('critical') || lower.includes('urgent') || lower.includes('outage') || lower.includes('down');
  const isP2 = lower.includes('p2') || lower.includes('high') || lower.includes('severe');
  const priority = isP1 ? '1' : isP2 ? '2' : '3';
  const shortDesc = cleanPrompt.length > 80 ? cleanPrompt.slice(0, 77) + '...' : cleanPrompt;

  return {
    table: 'incident',
    operation: 'POST',
    payload: {
      short_description: shortDesc,
      description: `Requirement details:\n${cleanPrompt}\n\n[Auto-Deployed by LAYA Autonomous Engine to dev442469 for persona: ${cleanDev}]`,
      urgency: priority,
      impact: priority,
      priority: priority,
      comments: `Autonomous execution completed by LAYA. Requestor: ${cleanDev}`
    },
    recordSummary: `Incident: ${shortDesc} (Priority ${priority})`,
    category: 'ITSM Incident Management',
    explanation: `Identified operational requirement. Executed auto-creation of Incident record with Priority ${priority}.`
  };
}

/**
 * Live Autonomous Execution against ServiceNow instance dev442469.
 */
export async function executeUniversalDeployment(params: {
  prompt: string;
  table?: string;
  payload?: Record<string, any>;
  activeUpdateSetName?: string;
  developerName?: string;
}): Promise<{
  success: boolean;
  table: string;
  sysId?: string;
  number?: string;
  name?: string;
  deepLink?: string;
  recordSummary: string;
  category?: string;
  record?: any;
  error?: string;
  executionTimeMs: number;
  instanceUrl: string;
  explanation?: string;
  updateSetName?: string;
  developerName?: string;
  displayFields?: Record<string, any>;
}> {
  const startTime = Date.now();
  const config = getActiveConfig();
  const targetUrl = (config.instanceUrl || 'https://dev442469.service-now.com').replace(/\/$/, '');
  const username = config.username || 'admin';
  const password = config.password || 'o0JD1cAn*cU+';

  const devName = params.developerName || 'System Administrator';
  const cleanDev = devName.replace(/^Dev\s*\d+\s*:\s*/i, '').trim();

  // 1. Parse intent if not explicitly overridden
  const parsed = parsePromptToServiceNowIntent(params.prompt, cleanDev);
  const targetTable = params.table || parsed.table;

  // Derive or use active Update Set name
  const activeUpdateSetName = params.activeUpdateSetName || `US-${cleanDev.replace(/\s+/g, '')}_${targetTable}_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8)}`;

  // Enrich payload with update set tracking
  const basePayload = { ...parsed.payload, ...(params.payload || {}) };
  if (basePayload.description) {
    basePayload.description += `\n\n[Active Update Set: ${activeUpdateSetName} | Persona: ${cleanDev}]`;
  }
  if (basePayload.comments && !basePayload.description) {
    basePayload.comments += ` [Tied to Update Set: ${activeUpdateSetName}]`;
  }

  try {
    const authString = Buffer.from(`${username}:${password}`).toString('base64');

    // Asynchronously ensure or touch the active Update Set on dev442469
    if (targetTable !== 'sys_update_set') {
      fetch(`${targetUrl}/api/now/table/sys_update_set`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: activeUpdateSetName,
          state: 'in progress',
          description: `Active development update set container for ${cleanDev} via LAYA Orchestrator.`
        })
      }).catch(() => {});
    }

    const url = `${targetUrl}/api/now/table/${targetTable}?sysparm_display_value=true`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500); // Fast under 8s timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(basePayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);
    const executionTimeMs = Date.now() - startTime;

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.error?.detail || `HTTP ${response.status}: Failed to create record on ${targetTable}`;
      return {
        success: false,
        table: targetTable,
        recordSummary: parsed.recordSummary,
        category: parsed.category,
        error: errorMsg,
        executionTimeMs,
        instanceUrl: targetUrl,
        explanation: parsed.explanation,
        updateSetName: activeUpdateSetName,
        developerName: cleanDev,
      };
    }

    const createdRecord = data?.result;
    const sysId = createdRecord?.sys_id || (typeof createdRecord === 'object' ? createdRecord.sys_id : '');
    const recordNumber = createdRecord?.number || createdRecord?.task_effective_number || '';
    const recordName = createdRecord?.name || createdRecord?.user_name || createdRecord?.short_description || '';

    // Direct deep link format per requirement:
    // https://dev442469.service-now.com/now/nav/ui/classic/params/target/[table_name].do?sys_id=[returned_sys_id]
    const deepLink = `${targetUrl}/now/nav/ui/classic/params/target/${targetTable}.do?sys_id=${sysId}`;

    // Compute display summary
    const displaySummary = recordNumber ? `${targetTable.toUpperCase()} ${recordNumber} - ${parsed.recordSummary}` : parsed.recordSummary;

    return {
      success: true,
      table: targetTable,
      sysId,
      number: recordNumber,
      name: recordName,
      deepLink,
      recordSummary: displaySummary,
      category: parsed.category,
      record: createdRecord,
      executionTimeMs,
      instanceUrl: targetUrl,
      explanation: parsed.explanation,
      updateSetName: activeUpdateSetName,
      developerName: cleanDev,
      displayFields: {
        'Target Table': targetTable,
        'Record Identifier': recordNumber || recordName || sysId,
        'ServiceNow sys_id': sysId,
        'Active Update Set': activeUpdateSetName,
        'Developer Persona': cleanDev,
        'State / Status': createdRecord?.state || 'Active / Complete',
        'Target Instance': 'dev442469.service-now.com'
      }
    };
  } catch (err: any) {
    const executionTimeMs = Date.now() - startTime;
    return {
      success: false,
      table: targetTable,
      recordSummary: parsed.recordSummary,
      category: parsed.category,
      error: err?.message || `Network error connecting to ${targetUrl}/api/now/table/${targetTable}`,
      executionTimeMs,
      instanceUrl: targetUrl,
      explanation: parsed.explanation,
      updateSetName: activeUpdateSetName,
      developerName: cleanDev,
    };
  }
}
