import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { QueryBuilder } from './components/QueryBuilder';
import { WidgetStudio } from './components/WidgetStudio';
import { CodeAuditor } from './components/CodeAuditor';
import { TokensInspector } from './components/TokensInspector';
import { ApiReference } from './components/ApiReference';
import { ActiveTab, ChatMessage } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [serverStatus, setServerStatus] = useState<'online' | 'connecting' | 'offline'>('connecting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check health on mount
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
  }, []);

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
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'model',
          content: data.error || 'Failed to generate response. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
          errorType: data.isHighDemand ? 'high_demand' : 'generic',
        };
        setMessages([...newMessages, errorMsg]);
      } else {
        const botMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed,
        };
        setMessages([...newMessages, botMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        content: err?.message || 'Network error connecting to LAYA server.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        errorType: 'network',
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    // Find the last user message
    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex !== -1) {
      const actualIndex = messages.length - 1 - lastUserIndex;
      const lastUserMsg = messages[actualIndex];
      // Strip error message if trailing
      const trimmed = messages.slice(0, actualIndex + 1);
      setMessages(trimmed.slice(0, -1));
      handleSendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
      />

      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onRetry={handleRetry}
          />
        )}
        {activeTab === 'queryBuilder' && <QueryBuilder />}
        {activeTab === 'widgetStudio' && <WidgetStudio />}
        {activeTab === 'codeAuditor' && <CodeAuditor />}
        {activeTab === 'tokens' && <TokensInspector />}
        {activeTab === 'apiRef' && <ApiReference />}
      </main>
    </div>
  );
}

export default App;
