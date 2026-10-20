import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertCircle,
  Terminal,
  ShieldCheck,
  Layers,
  Workflow,
  UserPlus,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, InstanceStatus, TeamMember, IndividualUpdateSet } from '../types';
import { LiveDeploymentCard } from './LiveDeploymentCard';
import { JiraSyncCard } from './JiraSyncCard';

const QUICK_PILLS = [
  {
    label: '⚡ User Management',
    prompt: 'Onboard new employee Jordan Vance with engineering email',
  },
  {
    label: '⚡ Emergency Change',
    prompt: 'Create an emergency change request for outage patch on core switch',
  },
  {
    label: '⚡ Script Includes & Automation',
    prompt: 'Create a Script Include ServerUtils extending AbstractAjaxProcessor',
  },
];

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onRetry: () => void;
  instanceStatus?: InstanceStatus | null;
  onNavigateToInstance?: () => void;
  onClearMessages?: () => void;
  activeDeveloper?: TeamMember;
  onSelectDeveloper?: (member: TeamMember) => void;
  teamMembers?: TeamMember[];
  onToggleActiveSetState?: () => void;
  onOpenAddDevModal?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onRetry,
  instanceStatus,
  onNavigateToInstance,
  onClearMessages,
  activeDeveloper,
  onSelectDeveloper,
  teamMembers,
  onToggleActiveSetState,
  onOpenAddDevModal,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-4.25rem)] max-w-5xl mx-auto px-4 py-4 space-y-2">
      {/* Top Status Bar: ServiceNow (dev442469) | Active Persona | Jira Workspace: CONNECTED */}
      <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* ServiceNow dev442469 */}
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                instanceStatus?.isAuthenticated
                  ? 'bg-emerald-500 animate-pulse'
                  : instanceStatus?.isReachable
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="font-bold text-slate-800">dev442469</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {instanceStatus?.isAuthenticated ? 'ONLINE (Table API)' : 'ONLINE'}
            </span>
          </div>

          <span className="text-slate-300 font-light">|</span>

          {/* Active Developer Persona Dropdown & Container */}
          {activeDeveloper && teamMembers && (
            <div className="flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors">
              <div className={`w-4 h-4 rounded-full ${activeDeveloper.avatarColor || 'bg-teal-600'} text-white flex items-center justify-center font-bold text-[8px]`}>
                {activeDeveloper.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">Persona:</span>
              <select
                value={activeDeveloper.id}
                onChange={(e) => {
                  const target = teamMembers.find(m => m.id === e.target.value);
                  if (target && onSelectDeveloper) {
                    onSelectDeveloper(target);
                  }
                }}
                className="bg-transparent text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
                title="Switch active developer persona"
              >
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.personaCode || 'Dev'}: {m.name} ({m.role.split(' ')[0]})
                  </option>
                ))}
              </select>

              {onToggleActiveSetState && (
                <button
                  type="button"
                  onClick={onToggleActiveSetState}
                  className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border transition-colors cursor-pointer ${
                    activeDeveloper.state === 'Complete'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                  title="Toggle sys_update_set.state"
                >
                  {activeDeveloper.state === 'Complete' ? '✓ Complete' : '● In Prog'}
                </button>
              )}

              {onOpenAddDevModal && (
                <button
                  type="button"
                  onClick={onOpenAddDevModal}
                  className="ml-1 text-[#0080A3] hover:text-[#032D42] p-0.5 rounded hover:bg-slate-200/80 transition-colors cursor-pointer"
                  title="Add new developer persona"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <span className="text-slate-300 font-light hidden sm:inline">|</span>

          {/* Jira Workspace: CONNECTED */}
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-bold text-slate-800 hidden sm:inline">Jira:</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Workflow className="w-3 h-3 text-blue-600" />
              CONNECTED
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasMessages && (
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
              {messages.length} session entries
            </span>
          )}
          {hasMessages && onClearMessages && (
            <button
              onClick={onClearMessages}
              className="text-slate-400 hover:text-slate-600 font-medium text-[11px] hover:underline cursor-pointer flex items-center gap-1"
              title="Reset conversation timeline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Chat</span>
            </button>
          )}
          {onNavigateToInstance && (
            <button
              onClick={onNavigateToInstance}
              className="text-[#0080A3] hover:underline font-semibold text-[11px] cursor-pointer"
            >
              Manage Connection →
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#032D42] via-teal-700 to-[#0080A3] flex items-center justify-center text-white shadow-lg ring-4 ring-teal-50/70 mb-2">
              <Bot className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#032D42] tracking-tight">
                Ask LAYA Anything in ServiceNow
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Universal Autonomous Execution & Deployment Engine for dev442469
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-slate-500 text-xs font-medium mt-3">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Prompt anything below for automated live Table API deployment</span>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isCopied = copiedId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#032D42] text-teal-400 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] rounded-2xl px-4 py-3.5 shadow-sm text-sm ${
                    isUser
                      ? 'bg-[#0080A3] text-white rounded-br-none'
                      : msg.isError
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-none'
                      : 'bg-[#F8FAFC] text-slate-800 border border-slate-200/90 rounded-bl-none'
                  }`}
                >
                  {/* Header info / actions */}
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-black/5 text-[11px] opacity-75">
                    <span className="font-semibold tracking-wide">
                      {isUser ? 'You' : 'LAYA'}
                      {msg.modelUsed && !isUser && (
                        <span className="ml-2 font-mono text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          {msg.modelUsed}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {!isUser && !msg.isError && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-slate-200 text-slate-600 cursor-pointer"
                          title="Copy response"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Text / Markdown */}
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : msg.isError ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-rose-800">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <div className="leading-relaxed">{msg.content}</div>
                      </div>
                      {msg.deploymentResult && (
                        <LiveDeploymentCard deployment={msg.deploymentResult} onRetry={onRetry} />
                      )}
                      {(msg.jiraSync || msg.deploymentResult?.jiraSync) && (
                        <JiraSyncCard syncData={(msg.jiraSync || msg.deploymentResult?.jiraSync)!} />
                      )}
                      {!msg.deploymentResult && (
                        <button
                          onClick={onRetry}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry Request</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="markdown-body text-slate-800 text-[13.5px] leading-relaxed overflow-x-auto">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                      {msg.deploymentResult && (
                        <LiveDeploymentCard deployment={msg.deploymentResult} onRetry={onRetry} />
                      )}
                      {(msg.jiraSync || msg.deploymentResult?.jiraSync) && (
                        <JiraSyncCard syncData={(msg.jiraSync || msg.deploymentResult?.jiraSync)!} />
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-xl bg-[#032D42] text-teal-400 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0080A3] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#0080A3] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#0080A3] animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 font-medium ml-1">
                LAYA is analyzing ServiceNow architecture...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3 Simple, Minimal Pill Chips Directly Above Chat Bar */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 px-1">
        {QUICK_PILLS.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(pill.prompt)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200/90 hover:border-teal-400 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer disabled:opacity-50"
            title={pill.prompt}
          >
            <span>{pill.label}</span>
          </button>
        ))}
      </div>

      {/* Active Persona & Container Binding Strip */}
      {activeDeveloper && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-0.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-slate-700">Binding Persona:</span>
            <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {activeDeveloper.personaCode || 'Dev'}: {activeDeveloper.name}
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-semibold truncate">
              Container: {activeDeveloper.associatedUpdateSetName}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            All prompt deployments auto-bound to dev442469
          </span>
        </div>
      )}

      {/* Input Prompt Box */}
      <form onSubmit={handleSubmit} className="mt-1 relative">
        <div className="relative flex items-center bg-white rounded-2xl border border-slate-300 shadow-sm focus-within:border-[#0080A3] focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask LAYA anything... (e.g., Onboard employee, emergency change, business rule, script include, catalog item)"
            rows={2}
            className="w-full bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none"
            disabled={isLoading}
          />

          <div className="pr-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center cursor-pointer ${
                input.trim() && !isLoading
                  ? 'bg-[#0080A3] hover:bg-[#032D42] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title="Send to LAYA"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-1.5">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[9px]">Shift + Enter</kbd> for newline
        </p>
      </form>
    </div>
  );
};
