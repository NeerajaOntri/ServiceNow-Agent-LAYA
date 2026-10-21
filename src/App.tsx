import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { HomeView } from './components/HomeView';
import { ChatView } from './components/ChatView';
import { IntelligenceView } from './components/IntelligenceView';
import { AdminView } from './components/AdminView';
import { AddDeveloperModal } from './components/AddDeveloperModal';
import { ActiveTab, ChatMessage, InstanceStatus, TeamMember, IndividualUpdateSet, DeploymentResultCard } from './types';
import { Bot, Shield } from 'lucide-react';

const SESSION_STORAGE_KEY = 'laya_now_assist_session_history';
const TEAM_STORAGE_KEY = 'laya_dynamic_team_roster';
const ACTIVE_DEV_KEY = 'laya_active_developer_persona';
const UPDATE_SETS_KEY = 'laya_dynamic_update_sets';
const AUTH_STORAGE_KEY = 'laya_auth_state';

const loadSavedMessages = (): ChatMessage[] => {
  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [];
};

const loadSavedTeam = (): TeamMember[] => {
  try {
    const saved = localStorage.getItem(TEAM_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((m: any) => 
          !['Saikiran Veera', 'Neeraja Omtri', 'Krishna Gollakota'].includes(m.name)
        );
        return filtered;
      }
    }
  } catch (e) {}
  return []; // Starts completely empty (0 entries) upon load
};

const loadSavedUpdateSets = (): IndividualUpdateSet[] => {
  try {
    const saved = localStorage.getItem(UPDATE_SETS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((s: any) => 
          !['US-101_Saikiran', 'US-102_Neeraja', 'US-103_Krishna'].includes(s.name)
        );
        return filtered;
      }
    }
  } catch (e) {}
  return []; // Starts completely empty (0 entries) upon load
};

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [userName, setUserName] = useState<string>('Enterprise Architect');
  const [userEmail, setUserEmail] = useState<string>('admin@company.com');

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [serverStatus, setServerStatus] = useState<'online' | 'connecting' | 'offline'>('connecting');
  const [instanceStatus, setInstanceStatus] = useState<InstanceStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(loadSavedMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDevModalOpen, setIsAddDevModalOpen] = useState(false);

  // Impersonation State
  const [impersonatedDeveloper, setImpersonatedDeveloper] = useState<TeamMember | null>(null);

  // Dynamic Team Roster & Update Sets
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(loadSavedTeam);
  const [activeDeveloper, setActiveDeveloper] = useState<TeamMember | null>(() => {
    const team = loadSavedTeam();
    return team[0] || null;
  });
  const [updateSets, setUpdateSets] = useState<IndividualUpdateSet[]>(loadSavedUpdateSets);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, isAuthenticated ? 'true' : 'false');
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(teamMembers));
    } catch {}
  }, [teamMembers]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_DEV_KEY, JSON.stringify(activeDeveloper));
    } catch {}
  }, [activeDeveloper]);

  useEffect(() => {
    try {
      localStorage.setItem(UPDATE_SETS_KEY, JSON.stringify(updateSets));
    } catch {}
  }, [updateSets]);

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

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') setServerStatus('online');
        else setServerStatus('offline');
      })
      .catch(() => setServerStatus('offline'));

    fetchInstanceStatus();
  }, []);

  const handleSignIn = (email: string, name: string) => {
    setUserName(name);
    setUserEmail(email);
    setIsAuthenticated(true);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setImpersonatedDeveloper(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  };

  const handleAddTeamMember = (newMember: TeamMember, newSet: IndividualUpdateSet) => {
    setTeamMembers(prev => [...prev, newMember]);
    setUpdateSets(prev => [newSet, ...prev]);
    setActiveDeveloper(newMember);
  };

  const handleUpdateTeamMember = (updatedMember: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    if (activeDeveloper?.id === updatedMember.id) {
      setActiveDeveloper(updatedMember);
    }
    if (impersonatedDeveloper?.id === updatedMember.id) {
      setImpersonatedDeveloper(updatedMember);
    }
  };

  const handleImpersonateDeveloper = (member: TeamMember) => {
    setImpersonatedDeveloper(member);
    setActiveDeveloper(member);
    setActiveTab('aiWorkspace');
  };

  const handleEndImpersonation = () => {
    setImpersonatedDeveloper(null);
  };

  const handleToggleActiveSetState = () => {
    if (!activeDeveloper || !activeDeveloper.associatedUpdateSetId) return;
    const targetSetId = activeDeveloper.associatedUpdateSetId;
    const currentSet = updateSets.find(s => s.id === targetSetId);
    if (!currentSet) return;

    const nextState = currentSet.state === 'Complete' ? ('In progress' as const) : ('Complete' as const);
    
    setUpdateSets(prev => prev.map(s => s.id === targetSetId ? { ...s, state: nextState } : s));
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
          })),
          activeDeveloperName: activeDeveloper?.name || 'Administrator',
          activeUpdateSetName: activeDeveloper?.associatedUpdateSetName || 'US-DEFAULT_Orchestrator',
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
          deploymentResult: data.deploymentResult,
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
      const fallbackDeployment: DeploymentResultCard = {
        success: false,
        table: 'incident',
        recordSummary: `Execution error for prompt: "${userText.slice(0, 50)}"`,
        instanceUrl: 'https://dev442469.service-now.com',
        error: err?.message || 'Network connection error to ServiceNow dev442469',
      };
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        content: `### ⚠️ Autonomous Deployment Discrepancy\n\n${err?.message || 'Network error.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
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

  const handleClearMessages = () => {
    setMessages([]);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
  };

  // If not authenticated, show Clean Sign-In Screen
  if (!isAuthenticated) {
    return <AuthScreen onSignIn={handleSignIn} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8] relative">
      {/* Impersonation Banner */}
      {impersonatedDeveloper && (
        <div className="bg-indigo-900 text-white px-4 py-2.5 text-xs flex items-center justify-between gap-3 border-b border-indigo-700 z-40 sticky top-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Impersonating Session:</strong> {impersonatedDeveloper.name} ({impersonatedDeveloper.role}) • Active Container: <code className="font-mono text-indigo-200">{impersonatedDeveloper.associatedUpdateSetName}</code>
            </span>
          </div>
          <button
            onClick={handleEndImpersonation}
            className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
          >
            End Impersonation
          </button>
        </div>
      )}

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
        onLogout={handleLogout}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <HomeView
            userName={userName}
            userEmail={userEmail}
            setActiveTab={setActiveTab}
            instanceStatus={instanceStatus}
            teamMembers={teamMembers}
            updateSets={updateSets}
          />
        )}
        {activeTab === 'aiWorkspace' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onRetry={handleRetry}
            instanceStatus={instanceStatus}
            onNavigateToInstance={() => setActiveTab('intelligence')}
            onClearMessages={handleClearMessages}
            activeDeveloper={activeDeveloper}
            onSelectDeveloper={setActiveDeveloper}
            teamMembers={teamMembers}
            onToggleActiveSetState={handleToggleActiveSetState}
            onOpenAddDevModal={() => setIsAddDevModalOpen(true)}
          />
        )}
        {activeTab === 'intelligence' && (
          <IntelligenceView
            instanceStatus={instanceStatus}
            onRefreshStatus={fetchInstanceStatus}
            teamMembers={teamMembers}
            updateSets={updateSets}
          />
        )}
        {activeTab === 'admin' && (
          <AdminView
            teamMembers={teamMembers}
            updateSets={updateSets}
            activeDeveloper={activeDeveloper}
            onSelectDeveloper={setActiveDeveloper}
            onImpersonateDeveloper={handleImpersonateDeveloper}
            onAddTeamMember={handleAddTeamMember}
            onToggleActiveSetState={handleToggleActiveSetState}
            onOpenAddDevModal={() => setIsAddDevModalOpen(true)}
          />
        )}
      </main>

      {/* Floating AI Assistant Icon in bottom-right corner */}
      {activeTab !== 'aiWorkspace' && (
        <button
          onClick={() => setActiveTab('aiWorkspace')}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-[#0080A3] to-teal-400 text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-teal-500/30 group"
          title="Open AI Workspace"
        >
          <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

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
