import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EnterpriseOrchestrator } from './components/EnterpriseOrchestrator';
import { ChatView } from './components/ChatView';
import { InstanceConnector } from './components/InstanceConnector';
import { QueryBuilder } from './components/QueryBuilder';
import { WidgetStudio } from './components/WidgetStudio';
import { CodeAuditor } from './components/CodeAuditor';
import { TokensInspector } from './components/TokensInspector';
import { ApiReference } from './components/ApiReference';
import { FlowDesignerBuilder } from './components/FlowDesignerBuilder';
import { DecisionTableEngine } from './components/DecisionTableEngine';
import { EmailNotificationStudio } from './components/EmailNotificationStudio';
import { CatalogItemStudio } from './components/CatalogItemStudio';
import { UpdateSetManager } from './components/UpdateSetManager';
import { ActiveTab, ChatMessage, InstanceStatus, TeamMember, IndividualUpdateSet, DeploymentResultCard } from './types';
import { parsePromptToServiceNowIntent } from './utils/universalIntentParser';
import { AddDeveloperModal } from './components/AddDeveloperModal';

// Initial Multi-User Developer Profiles
const INITIAL_DEVELOPERS: TeamMember[] = [
  {
    id: 'dev-1',
    name: 'Saikiran Veera',
    role: 'Flow Developer',
    email: 'saikiran.veera@company.com',
    associatedUpdateSetId: 'us-101',
    associatedUpdateSetName: 'US-101_Saikiran',
    avatarColor: 'bg-teal-600',
    state: 'In progress',
    personaCode: 'Dev 1',
  },
  {
    id: 'dev-2',
    name: 'Neeraja Omtri',
    role: 'Lead ServiceNow Architect',
    email: 'neeraja.omtri@company.com',
    associatedUpdateSetId: 'us-102',
    associatedUpdateSetName: 'US-102_Neeraja',
    avatarColor: 'bg-indigo-600',
    state: 'In progress',
    personaCode: 'Dev 2',
  },
  {
    id: 'dev-3',
    name: 'Krishna Gollakota',
    role: 'ServiceNow Admin',
    email: 'krishna.gollakota@company.com',
    associatedUpdateSetId: 'us-103',
    associatedUpdateSetName: 'US-103_Krishna',
    avatarColor: 'bg-purple-600',
    state: 'Complete',
    personaCode: 'Dev 3',
  },
];

// Initial Staged Update Sets with Real XML Payload Snippets & Colliding Target Record
const INITIAL_UPDATE_SETS: IndividualUpdateSet[] = [
  {
    id: 'us-101',
    name: 'US-101_Saikiran',
    sysId: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    author: 'Saikiran Veera (Flow Developer)',
    state: 'In progress',
    description: 'VIP Incident Flow Designer triage, decision routing, and base IncidentVIPUtils helper.',
    payloads: [
      {
        sysId: 'pay-101-1',
        name: 'sys_script_include_9281a',
        targetName: 'IncidentVIPUtils',
        type: 'sys_script_include',
        action: 'INSERT_OR_UPDATE',
        updatedBy: 'saikiran.veera',
        updatedOn: '2026-10-18 14:10:00',
        xmlPayloadPreview: `var IncidentVIPUtils = Class.create();
IncidentVIPUtils.prototype = {
    initialize: function() {},
    // Flow-optimized validation for VIP caller status
    isCallerVIP: function(callerSysId) {
        if (!callerSysId) return false;
        var grUser = new GlideRecord('sys_user');
        if (grUser.get(callerSysId)) {
            return grUser.getValue('vip') == '1';
        }
        return false;
    },
    type: 'IncidentVIPUtils'
};`
      },
      {
        sysId: 'pay-101-2',
        name: 'sys_hub_flow_4421a',
        targetName: 'VIP Incident Intelligent Triage',
        type: 'sys_hub_flow' as any,
        action: 'INSERT_OR_UPDATE',
        updatedBy: 'saikiran.veera',
        updatedOn: '2026-10-18 15:30:00',
        xmlPayloadPreview: `<!-- Flow Designer Trigger on Incident Insert [caller_id.vip == true] -->`
      }
    ]
  },
  {
    id: 'us-102',
    name: 'US-102_Neeraja',
    sysId: 'b2c3d4e5f60718293a4b5c6d7e8f90a1',
    author: 'Neeraja Omtri (Lead Architect)',
    state: 'In progress',
    description: 'Enterprise caching layer on IncidentVIPUtils and White-Glove client script banner.',
    payloads: [
      {
        sysId: 'pay-102-1',
        name: 'sys_script_include_9281a',
        targetName: 'IncidentVIPUtils',
        type: 'sys_script_include',
        action: 'INSERT_OR_UPDATE',
        updatedBy: 'neeraja.omtri',
        updatedOn: '2026-10-19 09:45:00',
        xmlPayloadPreview: `var IncidentVIPUtils = Class.create();
IncidentVIPUtils.prototype = {
    initialize: function() {
        // High-performance session caching by Lead Architect
        this._cache = {};
    },
    isCallerVIP: function(callerSysId) {
        if (!callerSysId) return false;
        if (this._cache[callerSysId] !== undefined) {
            return this._cache[callerSysId];
        }
        var grUser = new GlideRecordSecure('sys_user');
        if (grUser.get(callerSysId)) {
            var isVip = grUser.getValue('vip') == '1';
            this._cache[callerSysId] = isVip;
            return isVip;
        }
        return false;
    },
    type: 'IncidentVIPUtils'
};`
      },
      {
        sysId: 'pay-102-2',
        name: 'sys_script_client_1192a',
        targetName: 'Highlight VIP Caller Banner',
        type: 'sys_script_client',
        action: 'INSERT_OR_UPDATE',
        updatedBy: 'neeraja.omtri',
        updatedOn: '2026-10-19 11:15:00',
        xmlPayloadPreview: `function onLoad() {
    if (g_form.getValue('caller_id.vip') === 'true') {
        g_form.addInfoMessage('★ White-Glove VIP Support Protocol Engaged.');
    }
}`
      }
    ]
  },
  {
    id: 'us-103',
    name: 'US-103_Krishna',
    sysId: 'c3d4e5f60718293a4b5c6d7e8f90a1b2',
    author: 'Krishna Gollakota (ServiceNow Admin)',
    state: 'Complete',
    description: 'SLA Urgency Calculation Business Rule and Security Access Controls.',
    payloads: [
      {
        sysId: 'pay-103-1',
        name: 'sys_script_4401a',
        targetName: 'Calculate SLA Urgency Multiplier',
        type: 'sys_script',
        action: 'INSERT_OR_UPDATE',
        updatedBy: 'krishna.gollakota',
        updatedOn: '2026-10-17 16:30:00',
        xmlPayloadPreview: `(function executeRule(current, previous) {
    if (current.priority == 1 && current.caller_id.vip == true) {
        current.business_duration = 3600;
    }
})(current, previous);`
      }
    ]
  }
];

const SESSION_STORAGE_KEY = 'laya_now_assist_session_history';
const TEAM_STORAGE_KEY = 'laya_dynamic_team_roster';
const ACTIVE_DEV_KEY = 'laya_active_developer_persona';
const UPDATE_SETS_KEY = 'laya_dynamic_update_sets';

const loadSavedMessages = (): ChatMessage[] => {
  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading session chat history:', e);
  }
  return [];
};

const loadSavedTeam = (): TeamMember[] => {
  try {
    const saved = localStorage.getItem(TEAM_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading team roster:', e);
  }
  return INITIAL_DEVELOPERS;
};

const loadSavedUpdateSets = (): IndividualUpdateSet[] => {
  try {
    const saved = localStorage.getItem(UPDATE_SETS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading update sets:', e);
  }
  return INITIAL_UPDATE_SETS;
};

const loadSavedActiveDev = (team: TeamMember[]): TeamMember => {
  try {
    const saved = localStorage.getItem(ACTIVE_DEV_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const found = team.find(m => m.id === parsed.id);
      if (found) return found;
    }
  } catch (e) {}
  return team[0] || INITIAL_DEVELOPERS[0];
};

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [serverStatus, setServerStatus] = useState<'online' | 'connecting' | 'offline'>('connecting');
  const [instanceStatus, setInstanceStatus] = useState<InstanceStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(loadSavedMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDevModalOpen, setIsAddDevModalOpen] = useState(false);

  // Synchronize chat history to localStorage for persistent multi-turn session retention
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (e) {
      console.error('Error saving session chat history:', e);
    }
  }, [messages]);

  const handleClearMessages = () => {
    setMessages([]);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {}
  };

  // Dynamic Multi-User Developer Profiles & Update Sets State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(loadSavedTeam);
  const [activeDeveloper, setActiveDeveloper] = useState<TeamMember>(() => loadSavedActiveDev(loadSavedTeam()));
  const [updateSets, setUpdateSets] = useState<IndividualUpdateSet[]>(loadSavedUpdateSets);

  // Persist dynamic team roster, active developer persona, and update sets
  useEffect(() => {
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(teamMembers));
    } catch (e) {}
  }, [teamMembers]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_DEV_KEY, JSON.stringify(activeDeveloper));
    } catch (e) {}
  }, [activeDeveloper]);

  useEffect(() => {
    try {
      localStorage.setItem(UPDATE_SETS_KEY, JSON.stringify(updateSets));
    } catch (e) {}
  }, [updateSets]);

  // Selected table/query for builder cross-navigation
  const [builderTable, setBuilderTable] = useState<string>('incident');
  const [builderQuery, setBuilderQuery] = useState<string>('');

  // Script code for auditor cross-navigation
  const [auditorScript, setAuditorScript] = useState<string>('');

  const fetchInstanceStatus = async () => {
    try {
      const res = await fetch('/api/servicenow/status');
      if (res.ok) {
        const data = await res.json();
        setInstanceStatus(data);
      }
    } catch (err) {
      console.error('Error fetching instance status:', err);
    }
  };

  // Check health and instance status on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      })
      .catch(() => {
        setServerStatus('offline');
      });

    fetchInstanceStatus();
  }, []);

  // Developer Profile callbacks
  const handleAddTeamMember = (newMember: TeamMember, newSet: IndividualUpdateSet) => {
    setTeamMembers(prev => [...prev, newMember]);
    setUpdateSets(prev => [newSet, ...prev]);
    setActiveDeveloper(newMember);
  };

  const handleUpdateTeamMember = (updatedMember: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    if (activeDeveloper.id === updatedMember.id) {
      setActiveDeveloper(updatedMember);
    }
  };

  const handleToggleActiveSetState = () => {
    if (!activeDeveloper.associatedUpdateSetId) return;
    const targetSetId = activeDeveloper.associatedUpdateSetId;
    const currentSet = updateSets.find(s => s.id === targetSetId);
    if (!currentSet) return;

    const nextState = currentSet.state === 'Complete' ? ('In progress' as const) : ('Complete' as const);
    
    // Update updateSets
    const updatedSets = updateSets.map(s => s.id === targetSetId ? { ...s, state: nextState } : s);
    setUpdateSets(updatedSets);

    // Update activeDeveloper
    const updatedDev = { ...activeDeveloper, state: nextState };
    setActiveDeveloper(updatedDev);
    setTeamMembers(prev => prev.map(m => m.id === updatedDev.id ? updatedDev : m));
  };

  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            deploymentResult: m.deploymentResult,
            jiraSync: m.jiraSync,
          })),
          activeDeveloperName: activeDeveloper.name,
          activeUpdateSetName: activeDeveloper.associatedUpdateSetName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'model',
          content: data.error || 'Failed to complete autonomous deployment to dev442469.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          errorType: 'generic',
          deploymentResult: data.deploymentResult,
          jiraSync: data.jiraSync || data.deploymentResult?.jiraSync,
        };
        setMessages([...newMessages, errorMsg]);
      } else {
        const botMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed,
          deploymentResult: data.deploymentResult,
          jiraSync: data.jiraSync || data.deploymentResult?.jiraSync,
        };
        setMessages([...newMessages, botMsg]);
      }
    } catch (err: any) {
      const targetUrl = instanceStatus?.instanceUrl || 'https://dev442469.service-now.com';
      const fallbackDeployment: DeploymentResultCard = {
        success: false,
        table: 'incident',
        recordSummary: `Execution error for prompt: "${userText.slice(0, 50)}"`,
        instanceUrl: targetUrl,
        error: err?.message || 'Network error connecting to ServiceNow dev442469 deployment endpoint',
      };
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        content: `### ⚠️ Autonomous Deployment Discrepancy\n\n${err?.message || 'Network connection issue.'} Click **Retry Deployment** below to retry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        errorType: 'network',
        deploymentResult: fallbackDeployment,
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex !== -1) {
      const actualIndex = messages.length - 1 - lastUserIndex;
      const lastUserMsg = messages[actualIndex];
      const trimmed = messages.slice(0, actualIndex + 1);
      setMessages(trimmed.slice(0, -1));
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleOpenQueryInBuilder = (query: string, table: string) => {
    setBuilderQuery(query);
    setBuilderTable(table);
    setActiveTab('queryBuilder');
  };

  const handleAuditScript = (scriptCode: string, scriptTitle: string) => {
    setAuditorScript(scriptCode);
    setActiveTab('codeAuditor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
        instanceStatus={instanceStatus}
        activeDeveloper={activeDeveloper}
        onSelectDeveloper={setActiveDeveloper}
        teamMembers={teamMembers}
        onToggleActiveSetState={handleToggleActiveSetState}
        onOpenAddDevModal={() => setIsAddDevModalOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'orchestrator' && (
          <EnterpriseOrchestrator
            instanceStatus={instanceStatus}
            teamMembers={teamMembers}
            onAddTeamMember={handleAddTeamMember}
            onUpdateTeamMember={handleUpdateTeamMember}
            activeDeveloper={activeDeveloper}
            onSelectDeveloper={setActiveDeveloper}
            updateSets={updateSets}
            onUpdateSetsChange={setUpdateSets}
            onAuditScript={handleAuditScript}
            onNavigateToInstance={() => setActiveTab('instance')}
          />
        )}
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onRetry={handleRetry}
            instanceStatus={instanceStatus}
            onNavigateToInstance={() => setActiveTab('instance')}
            onClearMessages={handleClearMessages}
            activeDeveloper={activeDeveloper}
            onSelectDeveloper={setActiveDeveloper}
            teamMembers={teamMembers}
            onToggleActiveSetState={handleToggleActiveSetState}
            onOpenAddDevModal={() => setIsAddDevModalOpen(true)}
          />
        )}
        {activeTab === 'instance' && (
          <InstanceConnector
            instanceStatus={instanceStatus}
            onRefreshStatus={fetchInstanceStatus}
            onOpenQueryInBuilder={handleOpenQueryInBuilder}
            onAuditScript={handleAuditScript}
          />
        )}
        {activeTab === 'flowDesigner' && (
          <FlowDesignerBuilder
            onNavigateToDecisionTables={() => setActiveTab('decisionTables')}
            onAuditScript={handleAuditScript}
          />
        )}
        {activeTab === 'decisionTables' && (
          <DecisionTableEngine onAuditScript={handleAuditScript} />
        )}
        {activeTab === 'emailNotifications' && (
          <EmailNotificationStudio onAuditScript={handleAuditScript} />
        )}
        {activeTab === 'catalogStudio' && (
          <CatalogItemStudio onAuditScript={handleAuditScript} />
        )}
        {activeTab === 'updateSetManager' && (
          <UpdateSetManager onAuditScript={handleAuditScript} />
        )}
        {activeTab === 'queryBuilder' && (
          <QueryBuilder
            initialTable={builderTable}
            initialQuery={builderQuery}
            instanceStatus={instanceStatus}
          />
        )}
        {activeTab === 'widgetStudio' && <WidgetStudio />}
        {activeTab === 'codeAuditor' && <CodeAuditor initialScript={auditorScript} />}
        {activeTab === 'tokens' && <TokensInspector />}
        {activeTab === 'apiRef' && <ApiReference />}
      </main>

      <AddDeveloperModal
        isOpen={isAddDevModalOpen}
        onClose={() => setIsAddDevModalOpen(false)}
        onAddTeamMember={handleAddTeamMember}
        existingMemberCount={teamMembers.length}
        updateSetsCount={updateSets.length}
      />
    </div>
  );
}

export default App;
