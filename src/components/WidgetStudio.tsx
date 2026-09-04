import React, { useState } from 'react';
import { 
  LayoutTemplate, 
  Code2, 
  Eye, 
  Server, 
  Cpu, 
  FileCode, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { SAMPLE_WIDGETS } from '../data/servicenowData';

export const WidgetStudio: React.FC = () => {
  const [activePane, setActivePane] = useState<'server' | 'client' | 'html' | 'css' | 'preview'>('server');
  const [widgetData, setWidgetData] = useState(SAMPLE_WIDGETS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    let content = '';
    if (activePane === 'server') content = widgetData.serverScript;
    if (activePane === 'client') content = widgetData.clientController;
    if (activePane === 'html') content = widgetData.template;
    if (activePane === 'css') content = widgetData.css;

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Studio Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-teal-50 text-[#0080A3]">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#032D42]">
              Service Portal Widget Studio
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Inspect, edit, and prototype ServiceNow Service Portal (sp_widget) components across all 4 architectural layers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Preset:</span>
          <select
            value={widgetData.id}
            onChange={(e) => {
              const found = SAMPLE_WIDGETS.find((w) => w.id === e.target.value);
              if (found) setWidgetData(found);
            }}
            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            {SAMPLE_WIDGETS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor & Preview Pane Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Tab Navigation for Widget Layers */}
        <div className="flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800">
          <div className="flex space-x-1 py-2 overflow-x-auto">
            <button
              onClick={() => setActivePane('server')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activePane === 'server'
                  ? 'bg-[#0080A3] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Server Script</span>
            </button>
            <button
              onClick={() => setActivePane('client')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activePane === 'client'
                  ? 'bg-[#0080A3] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Client Controller</span>
            </button>
            <button
              onClick={() => setActivePane('html')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activePane === 'html'
                  ? 'bg-[#0080A3] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>HTML Template</span>
            </button>
            <button
              onClick={() => setActivePane('css')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activePane === 'css'
                  ? 'bg-[#0080A3] text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>CSS / SCSS</span>
            </button>
            <button
              onClick={() => setActivePane('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activePane === 'preview'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          {activePane !== 'preview' && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-xs text-teal-400 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        {/* Editor Body */}
        <div className="p-4 bg-[#0d1520] min-h-[420px]">
          {activePane === 'server' && (
            <textarea
              value={widgetData.serverScript}
              onChange={(e) => setWidgetData({ ...widgetData, serverScript: e.target.value })}
              className="w-full h-[400px] bg-transparent text-emerald-300 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          )}

          {activePane === 'client' && (
            <textarea
              value={widgetData.clientController}
              onChange={(e) => setWidgetData({ ...widgetData, clientController: e.target.value })}
              className="w-full h-[400px] bg-transparent text-sky-300 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          )}

          {activePane === 'html' && (
            <textarea
              value={widgetData.template}
              onChange={(e) => setWidgetData({ ...widgetData, template: e.target.value })}
              className="w-full h-[400px] bg-transparent text-amber-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          )}

          {activePane === 'css' && (
            <textarea
              value={widgetData.css}
              onChange={(e) => setWidgetData({ ...widgetData, css: e.target.value })}
              className="w-full h-[400px] bg-transparent text-purple-300 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          )}

          {activePane === 'preview' && (
            <div className="p-6 bg-slate-100 rounded-xl min-h-[380px] flex items-center justify-center">
              {/* Simulated Service Portal Widget Card */}
              <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-[#032D42] text-white p-3.5 flex items-center justify-between">
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    My Active Incidents (2)
                  </div>
                  <button className="text-[11px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-teal-100 cursor-pointer">
                    Refresh
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="p-3.5 hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#0080A3]">INC0010482</div>
                      <div className="text-xs font-medium text-slate-800">Email service degraded in EMEA</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Priority: P1 - Critical | State: In Progress</div>
                    </div>
                    <button className="text-[11px] px-2.5 py-1 rounded bg-teal-50 text-teal-700 font-semibold hover:bg-teal-100 cursor-pointer">
                      Resolve
                    </button>
                  </div>

                  <div className="p-3.5 hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#0080A3]">INC0010495</div>
                      <div className="text-xs font-medium text-slate-800">VPN token MFA reset required</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Priority: P3 - Moderate | State: New</div>
                    </div>
                    <button className="text-[11px] px-2.5 py-1 rounded bg-teal-50 text-teal-700 font-semibold hover:bg-teal-100 cursor-pointer">
                      Resolve
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Rendered via sp_widget simulator
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
