/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, ChatMessage } from './types';
import { Navbar } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { QueryBuilder } from './components/QueryBuilder';
import { WidgetStudio } from './components/WidgetStudio';
import { CodeAuditor } from './components/CodeAuditor';
import { TokensInspector } from './components/TokensInspector';
import { ApiReference } from './components/ApiReference';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-msg',
    role: 'model',
    content: `👋 **Hello! I'm LAYA** — your ServiceNow full-stack development assistant.

I specialize in building, configuring, and troubleshooting ServiceNow applications:
- **Backend**: Tables, Columns, Dictionary Overrides, Business Rules, Script Includes, Flows, and ACLs.
- **Frontend & UI**: Client Scripts, UI Policies, UI Actions, and modern UI Builder macroponents.
- **Service Portal**: Complete widgets (Server Script, Client Controller, HTML Template, and SCSS).
- **Integrations & Security**: Scripted REST APIs, GlideRecordSecure, Connection Aliases, and ATF test suites.

How can I help you architect, code, or troubleshoot your ServiceNow project today?`,
    timestamp: 'Just now',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('laya_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved chat history', e);
    }
    return INITIAL_MESSAGES;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'connecting' | 'offline'>('connecting');

  // Check health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (err) {
        setServerStatus('offline');
      }
    }
    checkHealth();
  }, []);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('laya_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat messages', e);
    }
  }, [messages]);

  const handleSendMessage = async (text: string, isRetry = false) => {
    let currentHistory = messages;
    
    // If not a retry, add the user message
    if (!isRetry) {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      currentHistory = [...messages, userMsg];
      setMessages(currentHistory);
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentHistory
            .filter((m) => !m.isError)
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const err = new Error(errData.error || `Server responded with status ${response.status}`);
        (err as any).isHighDemand = response.status === 503 || errData.isHighDemand;
        throw err;
      }

      const data = await response.json();
      const replyContent = data.reply || 'No response returned.';

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: replyContent,
        modelUsed: data.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Failed to communicate with LAYA', err);
      const isHighDemand = err?.isHighDemand || err?.message?.includes('503') || err?.message?.includes('high demand');
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        isError: true,
        errorType: isHighDemand ? 'high_demand' : 'generic',
        content: isHighDemand
          ? `⚠️ **Service Unavailable (High Demand)**: Google's AI servers are currently experiencing a temporary spike in traffic. Our resilient backend automatically attempts multiple fallback models. Please click **Retry Request** below in a moment to try again.`
          : `⚠️ **Error communicating with LAYA backend**: ${err.message || 'Unknown network error'}. Please check your connection or retry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryMessage = (failedMsgId: string) => {
    // Find index of failed message
    const failedIndex = messages.findIndex((m) => m.id === failedMsgId);
    if (failedIndex === -1) return;

    // Find preceding user message
    let lastUserText = '';
    for (let i = failedIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserText = messages[i].content;
        break;
      }
    }

    if (!lastUserText) return;

    // Remove the failed message and any subsequent messages
    const trimmed = messages.slice(0, failedIndex);
    setMessages(trimmed);

    // Resend with trimmed history
    setTimeout(() => {
      handleSendMessage(lastUserText, true);
    }, 100);
  };

  const handleAskLaya = (prompt: string) => {
    setActiveTab('chat');
    handleSendMessage(prompt);
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    try {
      localStorage.removeItem('laya_chat_messages');
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full pb-8">
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onClearChat={handleClearChat}
            onRetryMessage={handleRetryMessage}
          />
        )}

        {activeTab === 'queryBuilder' && (
          <QueryBuilder onAskLaya={handleAskLaya} />
        )}

        {activeTab === 'widgetStudio' && (
          <WidgetStudio onAskLaya={handleAskLaya} />
        )}

        {activeTab === 'codeAuditor' && (
          <CodeAuditor onAskLaya={handleAskLaya} />
        )}

        {activeTab === 'tokens' && (
          <TokensInspector onAskLaya={handleAskLaya} />
        )}

        {activeTab === 'apiRef' && (
          <ApiReference onAskLaya={handleAskLaya} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">LAYA Studio</span>
            <span>•</span>
            <span>ServiceNow Full-Stack Architecture & Development</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Certified Best Practice Guardrails • Powered by Gemini
          </div>
        </div>
      </footer>
    </div>
  );
}
