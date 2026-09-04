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
  Layers
} from 'lucide-react';
import { ChatMessage } from '../types';
import { STARTER_PROMPTS } from '../data/servicenowData';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onRetry: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onRetry,
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
    <div className="flex flex-col h-[calc(100vh-4.25rem)] max-w-5xl mx-auto px-4 py-4">
      {/* Main Chat Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#032D42] to-[#0080A3] flex items-center justify-center text-white shadow-lg ring-4 ring-teal-50">
              <Bot className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#032D42] tracking-tight">
                Ask LAYA Anything in ServiceNow
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your dedicated AI development engineer for Server Scripting, Business Rules,
                GlideAjax, Flow Designer, Catalog Items, and Service Portal Widgets.
              </p>
            </div>

            {/* Starter Prompt Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-left pt-2">
              {STARTER_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(item.prompt)}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 text-left transition-all duration-150 group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0080A3]">
                      {item.category}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 group-hover:text-[#032D42] mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>

            {/* Quick Capability Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                <Terminal className="w-3.5 h-3.5 text-teal-600" /> GlideRecord & GlideAggregate
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                <Layers className="w-3.5 h-3.5 text-teal-600" /> Service Portal Widgets
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Anti-Pattern Prevention
              </span>
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
                      <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry Request</span>
                      </button>
                    </div>
                  ) : (
                    <div className="markdown-body text-slate-800 text-[13.5px] leading-relaxed overflow-x-auto">
                      <Markdown>{msg.content}</Markdown>
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

      {/* Input Prompt Box */}
      <form onSubmit={handleSubmit} className="mt-3 relative">
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
            placeholder="Ask LAYA about Script Includes, Business Rules, Flow Designer, Service Portal, GlideRecord..."
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
