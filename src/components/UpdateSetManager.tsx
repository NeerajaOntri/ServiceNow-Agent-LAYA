import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  Copy, 
  Check, 
  FileCode, 
  Terminal, 
  Sparkles, 
  Layers, 
  Diff, 
  Archive, 
  Clock, 
  User, 
  ExternalLink,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { IndividualUpdateSet, UpdateSetPayload, UpdateCollision } from '../types';

interface UpdateSetManagerProps {
  onAuditScript?: (code: string, title: string) => void;
}

const PRESET_UPDATE_SETS: IndividualUpdateSet[] = [
  {
    id: 'us-sprint-101',
    name: 'US-101: VIP Incident Intelligent Flow & UI Action',
    sysId: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    author: 'Alex Martinez (Backend Arch)',
    state: 'Complete',
    description: 'Implements Flow Designer trigger for VIP incidents and adds White-Glove button on Incident form.',
    payloads: [
      {
        sysId: 'pay-1',
        name: 'sys_script_include_9281a',
        targetName: 'IncidentVIPUtils',
        type: 'sys_script_include',
        action: 'INSERT_OR_UPDATE',
        updatedBy: 'alex.martinez',
        updatedOn: '2026-10-12 14:22:00',
        xmlPayloadPreview: `var IncidentVIPUtils = Class.create();
IncidentVIPUtils.prototype = {
    initialize: function() {},
    isCallerVIP: function(callerSysId) {
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
        sysId: 'pay-2',
        name: 'sys_ui_action_82194',
        targetName: 'White Glove Escalation',
        type: 'sys_ui_action',
        action: 'INSERT_OR_UPDATE',
        updatedBy: 'alex.martinez',
        updatedOn: '2026-10-12 15:40:00',
        xmlPayloadPreview: `// Client-side UI Action
function onWhiteGloveClick() {
    g_form.setValue('priority', '1');
    g_form.setValue('urgency', '1');
    g_form.save();
}`
      },
      {
        sysId: 'pay-3',
        name: 'sysevent_email_action_5521a',
        targetName: 'Incident VIP Emergency Notification',
        type: 'sysevent_email_action',
        action: 'INSERT_OR_UPDATE',
        updatedBy: 'alex.martinez',
        updatedOn: '2026-10-12 16:10:00',
        xmlPayloadPreview: `<!-- Email action configuration for VIP Escalation -->`
      }
    ]
  },
  {
    id: 'us-sprint-102',
    name: 'US-102: Incident Form Client Script & Helper Utilities',
    sysId: 'b2c3d4e5f60718293a4b5c6d7e8f90a1',
    author: 'Sarah Jenkins (Frontend Dev)',
    state: 'Complete',
    description: 'Form client scripts and modified IncidentVIPUtils with caching enhancements.',
    payloads: [
      {
        sysId: 'pay-4',
        name: 'sys_script_include_9281a',
        targetName: 'IncidentVIPUtils',
        type: 'sys_script_include',
        action: 'INSERT_OR_UPDATE',
        updatedBy: 'sarah.jenkins',
        updatedOn: '2026-10-13 11:05:00',
        xmlPayloadPreview: `var IncidentVIPUtils = Class.create();
IncidentVIPUtils.prototype = {
    initialize: function() {
        this._cache = {};
    },
    isCallerVIP: function(callerSysId) {
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
        sysId: 'pay-5',
        name: 'sys_script_client_1192a',
        targetName: 'Highlight VIP Caller Banner',
        type: 'sys_script_client',
        action: 'INSERT_OR_UPDATE',
        updatedBy: 'sarah.jenkins',
        updatedOn: '2026-10-13 13:30:00',
        xmlPayloadPreview: `function onLoad() {
    if (g_form.getValue('caller_id.vip') === 'true') {
        g_form.addInfoMessage('★ High Profile VIP Caller Attached to this Incident.');
    }
}`
      }
    ]
  },
  {
    id: 'us-sprint-103',
    name: 'US-103: Hotfix SLA Notification & Priority Matrix',
    sysId: 'c3d4e5f60718293a4b5c6d7e8f90a1b2',
    author: 'Rajiv Patel (SRE & ITSM)',
    state: 'Complete',
    description: 'Adjusts SLA response duration and notification triggers.',
    payloads: [
      {
        sysId: 'pay-6',
        name: 'sys_script_4401a',
        targetName: 'Calculate SLA Urgency Multiplier',
        type: 'sys_script',
        action: 'INSERT_OR_UPDATE',
        updatedBy: 'rajiv.patel',
        updatedOn: '2026-10-13 17:15:00',
        xmlPayloadPreview: `(function executeRule(current, previous) {
    if (current.priority == 1 && current.caller_id.vip == true) {
        current.business_duration = 3600;
    }
})(current, previous);`
      }
    ]
  }
];

export const UpdateSetManager: React.FC<UpdateSetManagerProps> = ({ onAuditScript }) => {
  const [updateSets, setUpdateSets] = useState<IndividualUpdateSet[]>(PRESET_UPDATE_SETS);
  const [releasePackageName, setReleasePackageName] = useState('Release_2026_Sprint_14_Consolidated');
  const [releaseDescription, setReleaseDescription] = useState('Consolidated release package merging US-101, US-102, and US-103 for production deployment.');
  const [targetInstance, setTargetInstance] = useState('https://instance-test.service-now.com');
  const [selectedConflictKey, setSelectedConflictKey] = useState<string | null>('sys_script_include:IncidentVIPUtils');
  const [activeTab, setActiveTab] = useState<'merger' | 'conflicts' | 'script' | 'xmlPreview'>('conflicts');
  const [copied, setCopied] = useState(false);

  // Resolution choices per collisionKey
  const [resolutionPicks, setResolutionPicks] = useState<Record<string, string>>({
    'sys_script_include:IncidentVIPUtils': 'us-sprint-102' // Defaults to latest (Sarah Jenkins' cached version)
  });

  // Calculate collisions: records where type + targetName are identical across different update sets
  const detectCollisions = (): UpdateCollision[] => {
    const payloadMap: Record<string, {
      setId: string;
      setName: string;
      updatedOn: string;
      author: string;
      snippet: string;
      type: string;
      targetName: string;
    }[]> = {};

    updateSets.forEach(set => {
      set.payloads.forEach(p => {
        const key = `${p.type}:${p.targetName}`;
        if (!payloadMap[key]) payloadMap[key] = [];
        payloadMap[key].push({
          setId: set.id,
          setName: set.name,
          updatedOn: p.updatedOn,
          author: p.updatedBy,
          snippet: p.xmlPayloadPreview,
          type: p.type,
          targetName: p.targetName
        });
      });
    });

    const collisions: UpdateCollision[] = [];
    Object.entries(payloadMap).forEach(([key, items]) => {
      if (items.length > 1) {
        collisions.push({
          collisionKey: key,
          type: items[0].type,
          targetName: items[0].targetName,
          collidingSets: items,
          selectedWinnerSetId: resolutionPicks[key] || items[items.length - 1].setId,
          resolutionStrategy: 'latest'
        });
      }
    });

    return collisions;
  };

  const collisions = detectCollisions();
  const selectedCollision = collisions.find(c => c.collisionKey === selectedConflictKey) || collisions[0];

  const handleSelectWinner = (collisionKey: string, winnerSetId: string) => {
    setResolutionPicks(prev => ({ ...prev, [collisionKey]: winnerSetId }));
  };

  const handleRemoveUpdateSet = (setId: string) => {
    setUpdateSets(prev => prev.filter(s => s.id !== setId));
  };

  // Generate Background Script to merge in target instance
  const generateMergeBackgroundScript = () => {
    const sourceSysIds = updateSets.map(s => `'${s.sysId}'`).join(', ');

    return `// ====================================================================
// ServiceNow Background Script: Safe Update Set Merge & Release Packaging
// Target Consolidated Set: ${releasePackageName}
// ====================================================================
(function mergeReleaseUpdateSets() {
  try {
    gs.info('Starting automated release packaging for ${releasePackageName}...');

    // Step 1: Create or Get Target Parent Release Update Set
    var grParent = new GlideRecord('sys_update_set');
    grParent.addQuery('name', '${releasePackageName}');
    grParent.query();
    
    var parentSysId = '';
    if (grParent.next()) {
      parentSysId = grParent.getUniqueValue();
      gs.info('Found existing target update set: ' + parentSysId);
    } else {
      grParent.initialize();
      grParent.setValue('name', '${releasePackageName}');
      grParent.setValue('description', '${releaseDescription.replace(/'/g, "\\'")}');
      grParent.setValue('state', 'in progress');
      parentSysId = grParent.insert();
      gs.info('Created new parent release update set: ' + parentSysId);
    }

    // Step 2: Merge child sys_update_xml customer updates into parent set
    var sourceIds = [${sourceSysIds}];
    var grXml = new GlideRecord('sys_update_xml');
    grXml.addQuery('update_set', 'IN', sourceIds);
    // Order by sys_updated_on ascending so newer changes overwrite older ones
    grXml.orderBy('sys_updated_on');
    grXml.query();

    var movedCount = 0;
    var collisionResolved = 0;

    while (grXml.next()) {
      var targetName = grXml.getValue('target_name');
      var updateType = grXml.getValue('type');
      
      // Update the parent reference
      grXml.setValue('update_set', parentSysId);
      grXml.update();
      movedCount++;
    }

    // Step 3: Mark source child update sets as 'ignore' or 'complete'
    for (var i = 0; i < sourceIds.length; i++) {
      var grSource = new GlideRecord('sys_update_set');
      if (grSource.get(sourceIds[i])) {
        grSource.setValue('state', 'ignore');
        grSource.setValue('description', grSource.getValue('description') + ' [Merged into ' + grParent.getValue('name') + ']');
        grSource.update();
      }
    }

    gs.info('SUCCESS: Successfully merged ' + movedCount + ' customer updates into ' + grParent.getValue('name'));
    return parentSysId;
  } catch (ex) {
    gs.error('Update set merge failed: ' + ex.getMessage());
  }
})();`;
  };

  const generateReleaseXml = () => {
    const totalPayloads = updateSets.reduce((sum, s) => sum + s.payloads.length, 0);
    return `<?xml version="1.0" encoding="UTF-8"?>
<unload unload_date="2026-10-14 00:00:00">
  <sys_remote_update_set action="INSERT_OR_UPDATE">
    <name>${releasePackageName}</name>
    <description>${releaseDescription}</description>
    <state>loaded</state>
    <num_updates>${totalPayloads}</num_updates>
    <collateral_type>sys_update_set</collateral_type>
  </sys_remote_update_set>

  <!-- Consolidated Customer Updates (sys_update_xml) -->
${updateSets.flatMap(s => s.payloads).map(p => `  <sys_update_xml action="INSERT_OR_UPDATE">
    <name>${p.name}</name>
    <target_name>${p.targetName}</target_name>
    <type>${p.type}</type>
    <action>${p.action}</action>
    <updated_by>${p.updatedBy}</updated_by>
    <payload><![CDATA[${p.xmlPayloadPreview}]]></payload>
  </sys_update_xml>`).join('\n\n')}
</unload>`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#032D42] via-[#1e1b4b] to-[#4338ca] text-white p-6 rounded-2xl shadow-md border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <GitPullRequest className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black tracking-tight font-mono">
              UPDATE SET MERGER & DEPLOYMENT MANAGEMENT
            </h1>
          </div>
          <p className="text-slate-300 text-sm max-w-2xl">
            Merge individual ServiceNow Update Sets (<code className="text-indigo-300 font-mono">sys_update_set</code>) into clean release bundles, detect target artifact collision conflicts, and export background commit scripts.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const newSet: IndividualUpdateSet = {
                id: `us-${Date.now()}`,
                name: 'US-Custom: Developer Hotfix',
                sysId: 'd' + Math.random().toString(16).substring(2, 34),
                author: 'System Admin',
                state: 'Complete',
                description: 'Custom updates',
                payloads: [
                  {
                    sysId: `pay-${Date.now()}`,
                    name: 'sys_script_custom',
                    targetName: 'Custom Business Rule',
                    type: 'sys_script',
                    action: 'INSERT_OR_UPDATE',
                    updatedBy: 'admin',
                    updatedOn: '2026-10-14 10:00:00',
                    xmlPayloadPreview: '// Business Rule payload'
                  }
                ]
              };
              setUpdateSets([...updateSets, newSet]);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-400 hover:bg-indigo-300 text-slate-900 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Update Set
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Source Update Sets & Release Config (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Target Release Package Setup */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Archive className="w-4 h-4 text-indigo-600" />
              Consolidated Release Package
            </h3>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Target Package Name</label>
              <input
                type="text"
                value={releasePackageName}
                onChange={(e) => setReleasePackageName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-indigo-950 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Release Description</label>
              <textarea
                rows={2}
                value={releaseDescription}
                onChange={(e) => setReleaseDescription(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Target Target Instance URL</label>
              <input
                type="text"
                value={targetInstance}
                onChange={(e) => setTargetInstance(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>
          </div>

          {/* Included Update Sets List */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Source Update Sets ({updateSets.length})
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {updateSets.reduce((sum, s) => sum + s.payloads.length, 0)} payloads
              </span>
            </div>

            <div className="space-y-2">
              {updateSets.map(set => (
                <div
                  key={set.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 line-clamp-1">{set.name}</span>
                    <button
                      onClick={() => handleRemoveUpdateSet(set.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                      title="Exclude from Merge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{set.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {set.author}
                    </span>
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {set.payloads.length} XML changes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Conflict Engine & Exporters (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub Navigation Bar */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('conflicts')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === 'conflicts'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Collision & Conflict Resolver
                {collisions.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-400 text-slate-900">
                    {collisions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('merger')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'merger'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                All Merged Payloads ({updateSets.reduce((sum, s) => sum + s.payloads.length, 0)})
              </button>
              <button
                onClick={() => setActiveTab('script')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'script'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                GlideUpdateSet Background Script
              </button>
              <button
                onClick={() => setActiveTab('xmlPreview')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'xmlPreview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Release XML Export
              </button>
            </div>
          </div>

          {/* TAB 1: CONFLICT RESOLVER */}
          {activeTab === 'conflicts' && (
            <div className="space-y-4">
              {collisions.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-950 text-sm">No Collision Conflicts Detected</h4>
                  <p className="text-xs text-emerald-800">
                    All customer updates in your source sets modify unique platform records. You can safely merge them without code collisions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Collision Alert Banner */}
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-950">
                      <h4 className="font-bold text-sm">
                        {collisions.length} Overlapping Artifact Collision{collisions.length > 1 ? 's' : ''} Detected
                      </h4>
                      <p className="mt-0.5 leading-relaxed">
                        Multiple update sets modify the identical target record in ServiceNow. Select which developer version wins or should be kept in the merged release.
                      </p>
                    </div>
                  </div>

                  {/* Conflict Selector Pills */}
                  <div className="flex flex-wrap gap-2">
                    {collisions.map(c => (
                      <button
                        key={c.collisionKey}
                        onClick={() => setSelectedConflictKey(c.collisionKey)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                          selectedCollision?.collisionKey === c.collisionKey
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {c.targetName}
                        <span className="text-[10px] text-slate-500">({c.collidingSets.length} versions)</span>
                      </button>
                    ))}
                  </div>

                  {/* Side-by-side Collision Diff & Resolution Picker */}
                  {selectedCollision && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase block">
                            Colliding Target: {selectedCollision.type}
                          </span>
                          <h3 className="text-base font-bold text-slate-900">
                            {selectedCollision.targetName}
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-bold text-xs">
                          Resolved Winner: {selectedCollision.collidingSets.find(s => s.setId === selectedCollision.selectedWinnerSetId)?.setName.split(':')[0]}
                        </span>
                      </div>

                      {/* Versions Comparison Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCollision.collidingSets.map(version => {
                          const isWinner = selectedCollision.selectedWinnerSetId === version.setId;
                          return (
                            <div
                              key={version.setId}
                              className={`p-4 rounded-xl border-2 transition-all space-y-3 ${
                                isWinner
                                  ? 'bg-indigo-50/60 border-indigo-500 shadow-sm'
                                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-900 text-xs block">
                                    {version.setName}
                                  </span>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                    <span>By {version.author}</span>
                                    <span>&bull;</span>
                                    <span>{version.updatedOn}</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleSelectWinner(selectedCollision.collisionKey, version.setId)}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                    isWinner
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {isWinner ? '✓ Winner Selected' : 'Set as Winner'}
                                </button>
                              </div>

                              {/* Code preview snippet */}
                              <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto max-h-[220px] leading-relaxed">
                                {version.snippet}
                              </pre>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALL MERGED PAYLOADS LIST */}
          {activeTab === 'merger' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Consolidated Release Package Inventory
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Target Name</th>
                      <th className="p-2.5">Source Update Set</th>
                      <th className="p-2.5">Author</th>
                      <th className="p-2.5">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {updateSets.flatMap(s => s.payloads.map(p => ({ ...p, parentSetName: s.name }))).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-indigo-700 font-semibold">
                          {item.type}
                        </td>
                        <td className="p-2.5 font-bold text-slate-800">
                          {item.targetName}
                        </td>
                        <td className="p-2.5 text-slate-600 truncate max-w-[200px]">
                          {item.parentSetName}
                        </td>
                        <td className="p-2.5 text-slate-500 font-mono">
                          {item.updatedBy}
                        </td>
                        <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                          {item.updatedOn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BACKGROUND COMMIT SCRIPT */}
          {activeTab === 'script' && (
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  ServiceNow Background Script (sys_update_set merger)
                </span>
                <div className="flex items-center gap-2">
                  {onAuditScript && (
                    <button
                      onClick={() => onAuditScript(generateMergeBackgroundScript(), `MergeScript: ${releasePackageName}`)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-900/60 text-purple-300 hover:bg-purple-800/80 transition-colors cursor-pointer"
                    >
                      Audit Script
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateMergeBackgroundScript());
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Merge Script
                  </button>
                </div>
              </div>
              <pre className="text-xs font-mono text-emerald-200/90 bg-black/40 p-4 rounded-xl overflow-x-auto max-h-[500px] leading-relaxed">
                {generateMergeBackgroundScript()}
              </pre>
            </div>
          )}

          {/* TAB 4: RELEASE XML EXPORT */}
          {activeTab === 'xmlPreview' && (
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-400 flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Remote Update Set Release Package (sys_remote_update_set.do ready)
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateReleaseXml());
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Release XML
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-300 bg-black/40 p-4 rounded-xl overflow-x-auto max-h-[500px] leading-relaxed">
                {generateReleaseXml()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
