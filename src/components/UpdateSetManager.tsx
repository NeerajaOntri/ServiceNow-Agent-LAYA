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
  HelpCircle,
  Users,
  UserPlus,
  UserCheck,
  Shield,
  Zap,
  Filter,
  X,
  BadgeCheck,
  Tag
} from 'lucide-react';
import { IndividualUpdateSet, UpdateSetPayload, UpdateCollision, TeamMember } from '../types';

interface UpdateSetManagerProps {
  onAuditScript?: (code: string, title: string) => void;
}

const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Alex Martinez',
    role: 'Backend Arch',
    email: 'alex.martinez@company.com',
    associatedUpdateSetId: 'us-sprint-101',
    associatedUpdateSetName: 'US-101: VIP Incident Intelligent Flow & UI Action',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'tm-2',
    name: 'Sarah Jenkins',
    role: 'Frontend Dev',
    email: 'sarah.jenkins@company.com',
    associatedUpdateSetId: 'us-sprint-102',
    associatedUpdateSetName: 'US-102: Incident Form Client Script & Helper Utilities',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'tm-3',
    name: 'Rajiv Patel',
    role: 'SRE & ITSM',
    email: 'rajiv.patel@company.com',
    associatedUpdateSetId: 'us-sprint-103',
    associatedUpdateSetName: 'US-103: Hotfix SLA Notification & Priority Matrix',
    avatarColor: 'bg-purple-600',
  },
];

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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [releasePackageName, setReleasePackageName] = useState('Release_2026_Sprint_14_Consolidated');
  const [releaseDescription, setReleaseDescription] = useState('Consolidated release package merging multi-developer update sets for production deployment.');
  const [targetInstance, setTargetInstance] = useState('https://dev442469.service-now.com');
  const [selectedConflictKey, setSelectedConflictKey] = useState<string | null>('sys_script_include:IncidentVIPUtils');
  const [activeTab, setActiveTab] = useState<'merger' | 'conflicts' | 'script' | 'xmlPreview'>('conflicts');
  const [copied, setCopied] = useState(false);
  const [statusToast, setStatusToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Modal States
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Form Fields for Add Member / Developer
  const [devName, setDevName] = useState('');
  const [devRole, setDevRole] = useState('Flow Developer');
  const [devUpdateSetName, setDevUpdateSetName] = useState('');
  const [devDescription, setDevDescription] = useState('');
  const [includeCollision, setIncludeCollision] = useState(true);
  const [collisionTarget, setCollisionTarget] = useState<'IncidentVIPUtils' | 'Calculate SLA Urgency Multiplier'>('IncidentVIPUtils');

  // Resolution choices per collisionKey
  const [resolutionPicks, setResolutionPicks] = useState<Record<string, string>>({
    'sys_script_include:IncidentVIPUtils': 'us-sprint-102' // Defaults to latest
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setStatusToast({ message, type });
    setTimeout(() => setStatusToast(null), 4000);
  };

  // Quick preset loader in modal
  const applyPreset = (name: string, role: string, updateSetName: string, desc: string) => {
    setDevName(name);
    setDevRole(role);
    setDevUpdateSetName(updateSetName);
    setDevDescription(desc);
  };

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
    const winnerName = updateSets.find(s => s.id === winnerSetId)?.name || winnerSetId;
    showToast(`Selected "${winnerName}" as winner for ${collisionKey.split(':')[1]}!`);
  };

  const handleRemoveUpdateSet = (setId: string) => {
    setUpdateSets(prev => prev.filter(s => s.id !== setId));
    setTeamMembers(prev => prev.filter(m => m.associatedUpdateSetId !== setId));
    showToast('Update Set removed from consolidated release.', 'info');
  };

  const handleRemoveTeamMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    if (member?.associatedUpdateSetId) {
      setUpdateSets(prev => prev.filter(s => s.id !== member.associatedUpdateSetId));
    }
    showToast(`Removed team member ${member?.name || ''} and their update set.`, 'info');
  };

  // Generate mock payloads for new team member / developer
  const generateDeveloperPayloads = (
    name: string, 
    role: string, 
    setName: string, 
    shouldCollide: boolean
  ): UpdateSetPayload[] => {
    const userHandle = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const payloads: UpdateSetPayload[] = [];

    if (shouldCollide) {
      if (collisionTarget === 'IncidentVIPUtils') {
        payloads.push({
          sysId: `pay-${Date.now()}-1`,
          name: 'sys_script_include_9281a',
          targetName: 'IncidentVIPUtils',
          type: 'sys_script_include',
          action: 'INSERT_OR_UPDATE',
          updatedBy: userHandle,
          updatedOn: timestamp,
          xmlPayloadPreview: `var IncidentVIPUtils = Class.create();
IncidentVIPUtils.prototype = {
    initialize: function() {
        // Architecture overhaul by ${name} (${role})
        // Integrated with Flow Designer engine & GlideScriptCache
        this.cacheManager = new GlideScriptCache('vip_incident_store');
        this.flowApi = sn_fd.FlowAPI;
    },
    isCallerVIP: function(callerSysId) {
        if (!callerSysId) return false;
        var inMemory = this.cacheManager.get(callerSysId);
        if (inMemory !== null) return inMemory === 'true';

        var grUser = new GlideRecordSecure('sys_user');
        if (grUser.get(callerSysId)) {
            var isVip = grUser.getValue('vip') == '1';
            this.cacheManager.put(callerSysId, '' + isVip, 600);
            if (isVip) {
                this.dispatchVIPHandling(callerSysId);
            }
            return isVip;
        }
        return false;
    },
    dispatchVIPHandling: function(callerSysId) {
        gs.info('[${name}] Dispatched expedited VIP queue for caller: ' + callerSysId);
    },
    type: 'IncidentVIPUtils'
};`
        });
      } else {
        payloads.push({
          sysId: `pay-${Date.now()}-1`,
          name: 'sys_script_4401a',
          targetName: 'Calculate SLA Urgency Multiplier',
          type: 'sys_script',
          action: 'INSERT_OR_UPDATE',
          updatedBy: userHandle,
          updatedOn: timestamp,
          xmlPayloadPreview: `(function executeRule(current, previous) {
    // Dynamic multiplier calculation by ${name} (${role})
    if (current.priority == 1 && current.caller_id.vip == true) {
        current.business_duration = 1800; // 30 min critical SLA
        gs.addInfoMessage('[${name}] Executive Priority SLA multiplier engaged.');
    }
})(current, previous);`
        });
      }
    }

    // Role-specific secondary payload
    if (role.toLowerCase().includes('flow')) {
      payloads.push({
        sysId: `pay-${Date.now()}-2`,
        name: 'sys_hub_flow_3391b',
        targetName: 'VIP Rapid Triage & Subflow Runner',
        type: 'sys_script',
        action: 'INSERT_OR_UPDATE',
        updatedBy: userHandle,
        updatedOn: timestamp,
        xmlPayloadPreview: `// Flow Action Trigger Script by ${name} (${role})
(function executeSubflowTrigger(current, previous) {
    if (current.priority == 1 && current.caller_id.vip == true) {
        var inputs = {};
        inputs['incident_record'] = current;
        inputs['urgency_threshold'] = 1;
        sn_fd.FlowAPI.getRunner().subflow('global.vip_rapid_triage').inBackground().withInputs(inputs).run();
    }
})(current, previous);`
      });
    } else if (role.toLowerCase().includes('admin')) {
      payloads.push({
        sysId: `pay-${Date.now()}-2`,
        name: 'sys_decision_multi_approver_812',
        targetName: 'Executive Escalation Decision Table Matrix',
        type: 'sys_script',
        action: 'INSERT_OR_UPDATE',
        updatedBy: userHandle,
        updatedOn: timestamp,
        xmlPayloadPreview: `// Decision Table execution by ${name} (${role})
var dt = new sn_dt.DecisionTableAPI();
var inputs = new Object();
inputs['u_priority'] = current.getValue('priority');
inputs['u_caller_vip'] = current.caller_id.vip.toString();
var decision = dt.getDecision('executive_escalation_rules', inputs);
if (decision) {
    current.assignment_group = decision.u_approval_group;
}`
      });
    } else {
      payloads.push({
        sysId: `pay-${Date.now()}-2`,
        name: 'sys_ui_action_custom_dev',
        targetName: `${role} Custom Escalation Action`,
        type: 'sys_ui_action',
        action: 'INSERT_OR_UPDATE',
        updatedBy: userHandle,
        updatedOn: timestamp,
        xmlPayloadPreview: `function onCustomEscalate() {
    g_form.addInfoMessage('Escalation routine triggered by ${name} (${role}).');
    g_form.setValue('state', '2'); // In Progress
    g_form.save();
}`
      });
    }

    return payloads;
  };

  const handleAddDeveloperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = devName.trim() || 'New Developer';
    const finalRole = devRole.trim() || 'ServiceNow Developer';
    const finalSetName = devUpdateSetName.trim() || `US-${100 + updateSets.length + 1}: ${finalRole} Updates by ${finalName.split(' ')[0]}`;
    const finalDesc = devDescription.trim() || `Contributed by ${finalName} (${finalRole}) for release package.`;

    const newSetId = `us-dev-${Date.now()}`;
    const newSysId = 'e' + Math.random().toString(16).substring(2, 34);
    const mockPayloads = generateDeveloperPayloads(finalName, finalRole, finalSetName, includeCollision);

    const newUpdateSet: IndividualUpdateSet = {
      id: newSetId,
      name: finalSetName,
      sysId: newSysId,
      author: `${finalName} (${finalRole})`,
      state: 'Complete',
      description: finalDesc,
      payloads: mockPayloads
    };

    const newMemberId = `tm-${Date.now()}`;
    const avatarColors = ['bg-amber-600', 'bg-rose-600', 'bg-cyan-600', 'bg-teal-600', 'bg-indigo-600'];
    const newTeamMember: TeamMember = {
      id: newMemberId,
      name: finalName,
      role: finalRole,
      email: `${finalName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@company.com`,
      associatedUpdateSetId: newSetId,
      associatedUpdateSetName: finalSetName,
      avatarColor: avatarColors[teamMembers.length % avatarColors.length]
    };

    // Dynamically append to state
    setUpdateSets(prev => [...prev, newUpdateSet]);
    setTeamMembers(prev => [...prev, newTeamMember]);

    // If collision included, ensure conflict tab highlights the collision
    if (includeCollision) {
      const collisionKey = `${mockPayloads[0].type}:${mockPayloads[0].targetName}`;
      setSelectedConflictKey(collisionKey);
      setActiveTab('conflicts');
      showToast(`Added ${finalName} & "${finalSetName}"! Overlap detected with ${mockPayloads[0].targetName}.`);
    } else {
      showToast(`Added ${finalName} & "${finalSetName}" with ${mockPayloads.length} XML payloads.`);
    }

    // Reset and close
    setDevName('');
    setDevUpdateSetName('');
    setDevDescription('');
    setIsAddMemberModalOpen(false);
  };

  // Generate Background Script to merge in target instance
  const generateMergeBackgroundScript = () => {
    const sourceSysIds = updateSets.map(s => `'${s.sysId}'`).join(', ');

    return `// ====================================================================
// ServiceNow Background Script: Safe Update Set Merge & Release Packaging
// Target Consolidated Set: ${releasePackageName}
// Team Contributors: ${teamMembers.map(m => `${m.name} (${m.role})`).join(', ')}
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
    while (grXml.next()) {
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
      {/* Toast Notification */}
      {statusToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusToast.message}</span>
          <button 
            onClick={() => setStatusToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

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
            Merge individual ServiceNow Update Sets (<code className="text-indigo-300 font-mono">sys_update_set</code>) into clean release bundles, manage multi-user developer contributions, detect artifact collision conflicts, and export background commit scripts.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main prompt requirement: Add Team Member / Developer button */}
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>Add Team Member / Developer</span>
          </button>

          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15"
          >
            <Users className="w-4 h-4 text-indigo-300" />
            <span>Team Roster ({teamMembers.length})</span>
          </button>

          <button
            onClick={() => {
              const newSet: IndividualUpdateSet = {
                id: `us-${Date.now()}`,
                name: `US-${100 + updateSets.length + 1}: Developer Hotfix`,
                sysId: 'd' + Math.random().toString(16).substring(2, 34),
                author: 'System Admin',
                state: 'Complete',
                description: 'Custom updates staged by administrator',
                payloads: [
                  {
                    sysId: `pay-${Date.now()}`,
                    name: 'sys_script_custom',
                    targetName: 'Custom Business Rule',
                    type: 'sys_script',
                    action: 'INSERT_OR_UPDATE',
                    updatedBy: 'admin',
                    updatedOn: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    xmlPayloadPreview: '// Business Rule payload staged for deployment'
                  }
                ]
              };
              setUpdateSets([...updateSets, newSet]);
              showToast(`Added quick update set: ${newSet.name}`);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-100 transition-colors cursor-pointer border border-indigo-400/30"
          >
            <Plus className="w-4 h-4" />
            Quick Update Set
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Team Members & Source Update Sets (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Section: Team Members & Multi-User Sets */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-50 text-indigo-600">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Team Members & Developers
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {teamMembers.length} active contributors
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer border border-indigo-200"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add</span>
              </button>
            </div>

            {/* List of team members */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {teamMembers.map(member => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-full ${member.avatarColor || 'bg-slate-600'} text-white flex items-center justify-center font-bold text-[11px] shrink-0`}>
                      {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{member.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50/90 px-1.5 py-0.2 rounded border border-indigo-100 truncate max-w-[120px]">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {member.associatedUpdateSetName && (
                      <span className="text-[9px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200" title={member.associatedUpdateSetName}>
                        {member.associatedUpdateSetName.split(':')[0]}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveTeamMember(member.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
              <label className="block text-slate-600 mb-1 font-medium">Target Instance URL</label>
              <input
                type="text"
                value={targetInstance}
                onChange={(e) => setTargetInstance(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
              />
            </div>
          </div>

          {/* Included Update Sets List (dynamically appended) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
                Source Update Sets ({updateSets.length})
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                {updateSets.reduce((sum, s) => sum + s.payloads.length, 0)} payloads
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {updateSets.map(set => {
                // Check if this set participates in any detected collision
                const hasCollision = collisions.some(c => c.collidingSets.some(item => item.setId === set.id));
                
                return (
                  <div
                    key={set.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 line-clamp-1">{set.name}</span>
                      <button
                        onClick={() => handleRemoveUpdateSet(set.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer shrink-0"
                        title="Exclude from Merge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-1">{set.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200 gap-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700 truncate">
                        <User className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="truncate">{set.author}</span>
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasCollision && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[9px] border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                            Collision
                          </span>
                        )}
                        <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {set.payloads.length} XML
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Conflict Engine & Exporters (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub Navigation Bar */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1">
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
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-950">
                        <h4 className="font-bold text-sm">
                          {collisions.length} Overlapping Artifact Collision{collisions.length > 1 ? 's' : ''} Across {teamMembers.length} Developers
                        </h4>
                        <p className="mt-0.5 leading-relaxed">
                          Multiple update sets modify the identical target record in ServiceNow. Select which developer version wins or should be committed into the release package.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAddMemberModalOpen(true)}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add Developer Set
                    </button>
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
                        <span className="text-[10px] text-slate-500 font-sans">
                          ({c.collidingSets.length} developer version{c.collidingSets.length > 1 ? 's' : ''})
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Multi-version side-by-side Collision Diff & Resolution Picker */}
                  {selectedCollision && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase block">
                            Colliding Target: {selectedCollision.type}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>{selectedCollision.targetName}</span>
                            <span className="text-xs font-normal text-slate-500">
                              ({selectedCollision.collidingSets.length} competing implementations)
                            </span>
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Selected Winner:</span>
                          <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-950 font-bold text-xs border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {selectedCollision.collidingSets.find(s => s.setId === selectedCollision.selectedWinnerSetId)?.setName.split(':')[0] || 'Selected'}
                          </span>
                        </div>
                      </div>

                      {/* Versions Comparison Cards (Supports 2, 3, or more versions) */}
                      <div className={`grid grid-cols-1 ${selectedCollision.collidingSets.length >= 3 ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                        {selectedCollision.collidingSets.map(version => {
                          const isWinner = selectedCollision.selectedWinnerSetId === version.setId;
                          return (
                            <div
                              key={version.setId}
                              className={`p-4 rounded-xl border-2 transition-all space-y-3 flex flex-col justify-between ${
                                isWinner
                                  ? 'bg-indigo-50/70 border-indigo-500 shadow-md ring-1 ring-indigo-400'
                                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-bold text-slate-900 text-xs block line-clamp-1">
                                      {version.setName}
                                    </span>
                                    <div className="flex items-center gap-1 text-[11px] text-indigo-900 font-medium mt-0.5">
                                      <User className="w-3 h-3 text-indigo-600" />
                                      <span>{version.author}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      {version.updatedOn}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleSelectWinner(selectedCollision.collisionKey, version.setId)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                                      isWinner
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                  >
                                    {isWinner ? '✓ Winner' : 'Set as Winner'}
                                  </button>
                                </div>

                                {/* Code preview snippet */}
                                <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-lg overflow-x-auto max-h-[260px] leading-relaxed border border-slate-800">
                                  {version.snippet}
                                </pre>
                              </div>

                              {isWinner && (
                                <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[10px] text-indigo-800 font-semibold">
                                  <span>Designated as authoritative release payload</span>
                                  <BadgeCheck className="w-4 h-4 text-indigo-600" />
                                </div>
                              )}
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Consolidated Release Package Inventory
                  </h3>
                  <p className="text-xs text-slate-500">
                    All staged XML artifacts from {updateSets.length} source update sets across {teamMembers.length} team members.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  {updateSets.reduce((sum, s) => sum + s.payloads.length, 0)} total payloads
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
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

      {/* MODAL 1: ADD TEAM MEMBER / DEVELOPER MODAL */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#032D42] to-[#1e1b4b] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Team Member / Developer</h3>
                  <p className="text-[11px] text-slate-300">
                    Register a team developer and stage their associated ServiceNow Update Set
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddDeveloperSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Quick Fill Presets */}
              <div>
                <label className="block text-slate-600 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                  Quick Fill Developer Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset(
                      'Saikiran Veera', 
                      'Flow Developer', 
                      'US-104: Custom Flow Designer Updates',
                      'Implements Flow Designer triggers and decision table routing for VIP caller incidents.'
                    )}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 cursor-pointer text-[11px] transition-colors"
                  >
                    + Saikiran Veera (Flow Dev)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(
                      'Krishna Gollakota', 
                      'ServiceNow Admin', 
                      'US-105: Security & Decision Table Engine',
                      'Enterprise decision logic rules and security group routing.'
                    )}
                    className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold border border-teal-200 cursor-pointer text-[11px] transition-colors"
                  >
                    + Krishna Gollakota (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset(
                      'Priya Sharma', 
                      'Technical Architect', 
                      'US-106: Microservice Architecture & API Hook',
                      'High-throughput caching integration and webhook event queue.'
                    )}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold border border-purple-200 cursor-pointer text-[11px] transition-colors"
                  >
                    + Priya Sharma (Architect)
                  </button>
                </div>
              </div>

              {/* Developer Name */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Developer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saikiran Veera, Krishna Gollakota"
                  value={devName}
                  onChange={(e) => {
                    setDevName(e.target.value);
                    if (!devUpdateSetName && e.target.value) {
                      setDevUpdateSetName(`US-${100 + updateSets.length + 1}: ${devRole} Updates by ${e.target.value.split(' ')[0]}`);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                />
              </div>

              {/* Developer Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={devRole}
                    onChange={(e) => {
                      setDevRole(e.target.value);
                      if (devName && (!devUpdateSetName || devUpdateSetName.startsWith('US-'))) {
                        setDevUpdateSetName(`US-${100 + updateSets.length + 1}: ${e.target.value} Updates`);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="ServiceNow Admin">ServiceNow Admin</option>
                    <option value="Flow Developer">Flow Developer</option>
                    <option value="Technical Architect">Technical Architect</option>
                    <option value="ITSM Specialist">ITSM Specialist</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Integration Engineer">Integration Engineer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Work Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. saikiran@company.com"
                    value={devName ? `${devName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@company.com` : ''}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Associated Update Set Name */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Associated Update Set Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. US-104: Custom Flow Designer Updates"
                  value={devUpdateSetName}
                  onChange={(e) => setDevUpdateSetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 font-semibold"
                />
              </div>

              {/* Update Set Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Update Set Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of the development changes and artifacts included..."
                  value={devDescription}
                  onChange={(e) => setDevDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              {/* Collision Resolver Participation Box */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-950">
                    <input
                      type="checkbox"
                      checked={includeCollision}
                      onChange={(e) => setIncludeCollision(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    />
                    <span>Participate in Collision & Conflict Resolver</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Interactive Merge
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/90 leading-relaxed pl-6">
                  Automatically stages a mock ServiceNow XML payload targeting <code className="font-mono font-bold text-amber-950 bg-amber-100 px-1 py-0.5 rounded">IncidentVIPUtils</code> so this developer's Update Set will actively participate alongside Alex Martinez & Sarah Jenkins in the side-by-side conflict resolution matrix.
                </p>

                {includeCollision && (
                  <div className="pl-6 pt-1 flex items-center gap-2">
                    <span className="text-[10px] text-amber-900 font-medium">Colliding Target:</span>
                    <select
                      value={collisionTarget}
                      onChange={(e) => setCollisionTarget(e.target.value as any)}
                      className="text-[11px] font-mono px-2 py-1 rounded-lg border border-amber-300 bg-white text-slate-800 font-semibold cursor-pointer"
                    >
                      <option value="IncidentVIPUtils">sys_script_include: IncidentVIPUtils</option>
                      <option value="Calculate SLA Urgency Multiplier">sys_script: Calculate SLA Urgency Multiplier</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold transition-all shadow-md cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Member & Update Set</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL TEAM ROSTER MODAL */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Release Team Roster & Contributor Matrix</h3>
                  <p className="text-[11px] text-slate-400">
                    Active ServiceNow developers contributing to {releasePackageName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamMembers.map(member => {
                  const set = updateSets.find(s => s.id === member.associatedUpdateSetId);
                  return (
                    <div 
                      key={member.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${member.avatarColor || 'bg-slate-700'} text-white flex items-center justify-center font-bold text-xs`}>
                            {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{member.name}</h4>
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                              {member.role}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                          title="Remove from Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 text-[11px] space-y-1">
                        <div className="text-slate-600 font-medium truncate">
                          Update Set: <span className="font-mono text-indigo-950 font-bold">{member.associatedUpdateSetName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span>{member.email}</span>
                          <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                            {set?.payloads.length || 0} XML changes
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Total Developers: <strong className="text-slate-800">{teamMembers.length}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsTeamModalOpen(false);
                    setIsAddMemberModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Another Developer
                </button>
                <button
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
