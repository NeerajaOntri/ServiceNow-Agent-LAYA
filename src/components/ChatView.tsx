import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { ChatMessage } from '../types';
import { STARTER_PROMPTS } from '../data/servicenowData';
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Code, 
  ArrowRight,
  RefreshCw,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onClearChat: () => void;
  onRetryMessage?: (failedId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearChat,
  onRetryMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] max-w-5xl mx-auto w-full px-2 sm:px-4 py-3">
      {/* Header Info Banner */}
      <div className="flex items-center justify-between py-2 px-3 bg-slate-100 rounded-lg border border-slate-200 mb-3 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0080A3]" />
          <span>
            <strong className="text-slate-900">ServiceNow Expert Mode:</strong> Interprets queries through tables, business rules, client scripts, ACLs, and Service Portal.
          </span>
        </div>
        {messages.length > 1 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            title="Clear conversation history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#032D42] to-[#0080A3] flex items-center justify-center text-white shadow-lg shadow-teal-900/10">
              <Bot className="w-9 h-9" />
            </div>
            <div className="max-w-xl space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">
                Hi, I'm <span className="text-[#0080A3]">LAYA</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your friendly ServiceNow full-stack development assistant. I specialize in backend architecture (tables, business rules, script includes, ACLs, flows), frontend UI (client scripts, UI policies, UI Builder), and Service Portal widgets.
              </p>
            </div>

            {/* Starter Prompt Cards */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
              {STARTER_PROMPTS.map((starter, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(starter.prompt)}
                  className="p-3 rounded-lg bg-white border border-slate-200 hover:border-[#0080A3] hover:shadow-sm transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#0080A3] mb-1">
                    <span>{starter.category}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-xs font-medium text-slate-800 line-clamp-1 mb-0.5">
                    {starter.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {starter.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className={`w-8 h-8 rounded-lg ${msg.isError ? 'bg-amber-600' : 'bg-[#032D42]'} text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-sm`}>
                  {msg.isError ? <AlertTriangle className="w-4 h-4" /> : 'L'}
                </div>
              )}

              <div
                className={`relative max-w-[88%] sm:max-w-[82%] rounded-xl p-4 text-sm shadow-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#032D42] text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-amber-50/80 border border-amber-300 text-amber-950 rounded-tl-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-100/30 text-[11px] font-medium opacity-75">
                  <div className="flex items-center gap-1.5">
                    <span>{msg.role === 'user' ? 'You (Developer)' : 'LAYA (ServiceNow Specialist)'}</span>
                    {msg.modelUsed && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.role === 'model' && !msg.isError && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-teal-600 transition-colors cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                ) : (
                  <div className="markdown-body prose prose-slate prose-sm max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:border prose-pre:border-slate-800 prose-code:text-[#0080A3] prose-code:font-mono prose-code:text-xs">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}

                {/* Error Retry Action */}
                {msg.isError && onRetryMessage && (
                  <div className="mt-3 pt-2 border-t border-amber-200 flex items-center justify-between gap-2">
                    <span className="text-xs text-amber-800">
                      Spikes in traffic are usually temporary.
                    </span>
                    <button
                      onClick={() => onRetryMessage(msg.id)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Request</span>
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-[#032D42] text-white flex items-center justify-center shrink-0 font-bold text-xs">
              L
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 rounded-tl-none shadow-sm flex items-center gap-2 text-xs text-slate-600">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0080A3]" />
              <span>LAYA is inspecting ServiceNow metadata and drafting solution...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="mt-3 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
        {/* Quick Suggestion Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-[11px]">
          <button
            type="button"
            onClick={() => setInputText('How do I build an onLoad Client Script and GlideAjax Script Include to auto-populate user fields?')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors"
          >
            ⚡ Async GlideAjax
          </button>
          <button
            type="button"
            onClick={() => setInputText('How do I prevent infinite recursion when updating records in Business Rules?')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors"
          >
            🛡️ Avoid current.update()
          </button>
          <button
            type="button"
            onClick={() => setInputText('Build a Service Portal widget with Server Script, Client Controller, and HTML Template.')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors"
          >
            🧩 Portal Widget
          </button>
          <button
            type="button"
            onClick={() => setInputText('How do I configure table ACLs and roles for a custom application?')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors"
          >
            🔒 Table ACLs & Roles
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-1">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask LAYA about ServiceNow schemas, Business Rules, Script Includes, Service Portal, ACLs, or ATF..."
            className="flex-1 resize-none border-0 focus:ring-0 text-sm text-slate-800 placeholder:text-slate-400 p-2 outline-none font-sans"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-2.5 rounded-lg text-white font-medium transition-all duration-150 flex items-center justify-center shrink-0 ${
              inputText.trim() && !isLoading
                ? 'bg-[#0080A3] hover:bg-[#006682] shadow-sm cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
