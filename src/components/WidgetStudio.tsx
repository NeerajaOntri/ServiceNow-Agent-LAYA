import React, { useState } from 'react';
import { SAMPLE_WIDGET } from '../data/servicenowData';
import { ServicePortalWidgetData } from '../types';
import { 
  Layers, 
  Code, 
  Eye, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  FileCode, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw
} from 'lucide-react';

interface WidgetStudioProps {
  onAskLaya: (prompt: string) => void;
}

interface MockIncident {
  sys_id: string;
  number: string;
  short_description: string;
  priority: string;
  priority_code: string;
  created: string;
}

const INITIAL_MOCK_INCIDENTS: MockIncident[] = [
  {
    sys_id: '9d38c11e5f510100a9ad2572f2b47701',
    number: 'INC0010042',
    short_description: 'Core VPN Gateway connection timeout for remote staff',
    priority: '1 - Critical',
    priority_code: '1',
    created: '2026-09-03 14:20:10',
  },
  {
    sys_id: '9d38c11e5f510100a9ad2572f2b47702',
    number: 'INC0010045',
    short_description: 'Outlook calendar synchronization failure on iOS devices',
    priority: '2 - High',
    priority_code: '2',
    created: '2026-09-03 16:05:44',
  },
  {
    sys_id: '9d38c11e5f510100a9ad2572f2b47703',
    number: 'INC0010049',
    short_description: 'Request for secondary monitor in Building 4',
    priority: '3 - Moderate',
    priority_code: '3',
    created: '2026-09-04 08:30:00',
  },
];

export const WidgetStudio: React.FC<WidgetStudioProps> = ({ onAskLaya }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'preview' | 'html' | 'client' | 'server' | 'css'>('preview');
  const [widgetData, setWidgetData] = useState<ServicePortalWidgetData>(SAMPLE_WIDGET);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  // Simulated widget state for live preview
  const [mockIncidents, setMockIncidents] = useState<MockIncident[]>(INITIAL_MOCK_INCIDENTS);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmModalItem, setConfirmModalItem] = useState<MockIncident | null>(null);

  const handleCopy = (code: string, tab: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleSimulatedResolve = (item: MockIncident) => {
    setConfirmModalItem(item);
  };

  const confirmResolve = () => {
    if (!confirmModalItem) return;
    const resolvedItem = confirmModalItem;
    setConfirmModalItem(null);
    // Simulate $scope.server.update()
    setMockIncidents((prev) => prev.filter((i) => i.sys_id !== resolvedItem.sys_id));
    setAlertMessage(`${resolvedItem.number} has been resolved successfully (simulated via $scope.server.update).`);
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const resetMockData = () => {
    setMockIncidents(INITIAL_MOCK_INCIDENTS);
    setAlertMessage(null);
  };

  const exportUpdateSetXml = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<unload unload_date="${new Date().toISOString()}">
  <sp_widget action="INSERT_OR_UPDATE">
    <id>${widgetData.id}</id>
    <name>${widgetData.name}</name>
    <description>${widgetData.description}</description>
    <template><![CDATA[${widgetData.template}]]></template>
    <client_script><![CDATA[${widgetData.clientController}]]></client_script>
    <script><![CDATA[${widgetData.serverScript}]]></script>
    <css><![CDATA[${widgetData.css}]]></css>
    <option_schema><![CDATA[${widgetData.optionSchema || '[]'}]]></option_schema>
  </sp_widget>
</unload>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sp_widget_${widgetData.id}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0080A3]" />
            <h2 className="text-xl font-bold text-slate-900">
              Service Portal Widget Studio (sp_widget)
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Build, test, and preview AngularJS + Bootstrap 3 widgets with Server Scripts, Client Controllers, and Horizon SCSS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskLaya(`Explain the communication pattern between Service Portal Server Script and Client Controller using $scope.server.update() and spUtil. Show an example of passing input parameters.`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0080A3]" />
            Ask LAYA About Widgets
          </button>
          <button
            onClick={exportUpdateSetXml}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#032D42] hover:bg-[#0080A3] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export XML
          </button>
        </div>
      </div>

      {/* Widget Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveCodeTab('preview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeCodeTab === 'preview'
                  ? 'bg-[#0080A3] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Portal Preview</span>
            </button>
            <button
              onClick={() => setActiveCodeTab('server')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeCodeTab === 'server'
                  ? 'bg-[#0080A3] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Server Script</span>
            </button>
            <button
              onClick={() => setActiveCodeTab('client')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeCodeTab === 'client'
                  ? 'bg-[#0080A3] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Client Controller</span>
            </button>
            <button
              onClick={() => setActiveCodeTab('html')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeCodeTab === 'html'
                  ? 'bg-[#0080A3] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>HTML Template</span>
            </button>
            <button
              onClick={() => setActiveCodeTab('css')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeCodeTab === 'css'
                  ? 'bg-[#0080A3] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>CSS / SCSS</span>
            </button>
          </div>

          {activeCodeTab !== 'preview' && (
            <button
              onClick={() => {
                const code =
                  activeCodeTab === 'server'
                    ? widgetData.serverScript
                    : activeCodeTab === 'client'
                    ? widgetData.clientController
                    : activeCodeTab === 'html'
                    ? widgetData.template
                    : widgetData.css;
                handleCopy(code, activeCodeTab);
              }}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {copiedTab === activeCodeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {/* TAB 1: Live Interactive Preview */}
          {activeCodeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Interactive Service Portal Simulation (AngularJS sandbox)</span>
                </div>
                <button
                  onClick={resetMockData}
                  className="flex items-center gap-1 text-slate-600 hover:text-[#0080A3] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Demo State</span>
                </button>
              </div>

              {/* Banner Alert if triggered */}
              {alertMessage && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{alertMessage}</span>
                </div>
              )}

              {/* Simulated Service Portal Widget Container */}
              <div className="max-w-3xl mx-auto border border-slate-300 rounded-lg shadow-sm overflow-hidden bg-white">
                {/* Widget Header */}
                <div className="bg-[#032D42] text-white px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <span>📋</span>
                    <span>My Assigned Incidents</span>
                  </h3>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
                    {mockIncidents.length} Active
                  </span>
                </div>

                {/* Widget Body */}
                <div className="p-4">
                  {mockIncidents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 space-y-2">
                      <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                      <p className="text-sm font-medium">All clear! No pending incidents assigned to you.</p>
                      <button
                        onClick={resetMockData}
                        className="text-xs text-[#0080A3] hover:underline cursor-pointer"
                      >
                        Click to restore demo incidents
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {mockIncidents.map((item) => (
                        <div
                          key={item.sys_id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-md transition-colors"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-800">
                                {item.number}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  item.priority_code === '1'
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                    : item.priority_code === '2'
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {item.priority}
                              </span>
                            </div>
                            <div className="text-xs text-slate-700 font-medium">
                              {item.short_description}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Created: {item.created}
                            </div>
                          </div>

                          <button
                            onClick={() => handleSimulatedResolve(item)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded shadow-xs transition-colors shrink-0 cursor-pointer self-start sm:self-center flex items-center gap-1"
                          >
                            <span>Resolve</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation Modal (spModal.confirm simulation) */}
              {confirmModalItem && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fadeIn">
                  <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      <span>Confirm Resolution</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Are you sure you want to mark <strong>{confirmModalItem.number}</strong> as Resolved? This will trigger a server update and notification.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setConfirmModalItem(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmResolve}
                        className="px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                      >
                        Confirm Resolve
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Server Script */}
          {activeCodeTab === 'server' && (
            <div className="space-y-2">
              <div className="text-xs text-slate-500 font-medium">
                Server Script runs when the widget initializes or when <code>$scope.server.update()</code> is invoked with <code>input</code> payload.
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800 scrollbar-thin">
                <code>{widgetData.serverScript}</code>
              </pre>
            </div>
          )}

          {/* TAB 3: Client Controller */}
          {activeCodeTab === 'client' && (
            <div className="space-y-2">
              <div className="text-xs text-slate-500 font-medium">
                AngularJS Client Controller manages user interactions, calling <code>$scope.server.update()</code>, <code>spModal</code>, and broadcasting <code>$rootScope</code> events.
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800 scrollbar-thin">
                <code>{widgetData.clientController}</code>
              </pre>
            </div>
          )}

          {/* TAB 4: HTML Template */}
          {activeCodeTab === 'html' && (
            <div className="space-y-2">
              <div className="text-xs text-slate-500 font-medium">
                HTML Template uses AngularJS directives (<code>ng-repeat</code>, <code>ng-if</code>, <code>ng-class</code>) and Bootstrap 3 grid system.
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800 scrollbar-thin">
                <code>{widgetData.template}</code>
              </pre>
            </div>
          )}

          {/* TAB 5: CSS / SCSS */}
          {activeCodeTab === 'css' && (
            <div className="space-y-2">
              <div className="text-xs text-slate-500 font-medium">
                Scoped CSS/SCSS with ServiceNow Horizon design tokens.
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto border border-slate-800 scrollbar-thin">
                <code>{widgetData.css}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
