import React, { useState } from 'react';
import { Users, UserPlus, GitPullRequest, Shield, Trash2, CheckCircle2, AlertTriangle, Sparkles, Server } from 'lucide-react';
import { TeamMember, IndividualUpdateSet } from '../types';

interface AdminViewProps {
  teamMembers: TeamMember[];
  updateSets: IndividualUpdateSet[];
  activeDeveloper: TeamMember | null;
  onSelectDeveloper: (member: TeamMember) => void;
  onImpersonateDeveloper: (member: TeamMember) => void;
  onAddTeamMember: (newMember: TeamMember, newSet: IndividualUpdateSet) => void;
  onToggleActiveSetState: () => void;
  onOpenAddDevModal: () => void;
  onRemoveTeamMember?: (id: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  teamMembers,
  updateSets,
  activeDeveloper,
  onSelectDeveloper,
  onImpersonateDeveloper,
  onAddTeamMember,
  onToggleActiveSetState,
  onOpenAddDevModal,
}) => {
  const [quickName, setQuickName] = useState('');
  const [quickRole, setQuickRole] = useState('ServiceNow Developer');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const finalName = quickName.trim();
    const finalRole = quickRole.trim();
    const cleanFirst = finalName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    const timestampStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const finalSetName = `US-${cleanFirst}_${timestampStr}`;

    const devId = `dev-${Date.now()}`;
    const setId = `us-${Date.now()}`;
    const personaCode = `Dev ${teamMembers.length + 1}`;

    const avatarColors = ['bg-teal-600', 'bg-indigo-600', 'bg-purple-600', 'bg-blue-600', 'bg-emerald-600'];
    const avatarColor = avatarColors[teamMembers.length % avatarColors.length];

    const newMember: TeamMember = {
      id: devId,
      name: finalName,
      role: finalRole,
      email: `${finalName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@company.com`,
      associatedUpdateSetId: setId,
      associatedUpdateSetName: finalSetName,
      avatarColor,
      state: 'In progress',
      personaCode,
    };

    const newSet: IndividualUpdateSet = {
      id: setId,
      name: finalSetName,
      sysId: 'us' + Math.random().toString(16).substring(2, 32),
      author: `${finalName} (${finalRole})`,
      state: 'In progress',
      description: `Autonomous container dynamically provisioned for ${finalName} (${finalRole}) on dev442469`,
      payloads: [
        {
          sysId: `pay-${Date.now()}-1`,
          name: 'sys_script_include_9281a',
          targetName: 'IncidentVIPUtils',
          type: 'sys_script_include',
          action: 'INSERT_OR_UPDATE',
          updatedBy: finalName.toLowerCase().replace(/[^a-z0-9]/g, '.'),
          updatedOn: new Date().toISOString().replace('T', ' ').substring(0, 19),
          xmlPayloadPreview: `// Auto-generated artifact in ${finalSetName}\nvar IncidentVIPUtils = Class.create();\nIncidentVIPUtils.prototype = {\n    initialize: function() {\n        this._dev = '${finalName}';\n    },\n    isCallerVIP: function(callerSysId) {\n        return true;\n    }\n};`,
        },
      ],
    };

    onAddTeamMember(newMember, newSet);
    setQuickName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
              Zero Hardcoding Governance
            </span>
            <span className="text-xs font-mono text-slate-500">dev442469.service-now.com</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Dynamic Admin & Team Roster</h1>
          <p className="text-sm text-slate-500">
            Manage multi-developer contributors, active Update Set containers (`US-[Name]_[Timestamp]`), and impersonate developer workspaces.
          </p>
        </div>

        <button
          onClick={onOpenAddDevModal}
          className="px-5 py-2.5 bg-gradient-to-r from-[#0080A3] to-teal-500 hover:from-[#006d8a] hover:to-teal-400 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Developer from Scratch</span>
        </button>
      </div>

      {/* Quick Add Developer Inline Bar */}
      <div className="bg-gradient-to-r from-[#032D42] to-[#0080A3] rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-base font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-300" />
          <span>Quick Register New Developer & Auto-Generate Update Set</span>
        </h3>
        <p className="text-xs text-teal-100 mb-4">
          Instantly register a new team member and provision an isolated `US-[Name]_[Timestamp]` container on dev442469.
        </p>

        <form onSubmit={handleQuickAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="Developer Full Name (e.g. Alex Rivera)"
            className="px-4 py-2.5 bg-slate-950/60 border border-teal-500/30 rounded-xl text-white placeholder-slate-400 text-xs focus:outline-none focus:border-teal-300"
          />
          <input
            type="text"
            required
            value={quickRole}
            onChange={(e) => setQuickRole(e.target.value)}
            placeholder="Role (e.g. Lead ITSM Engineer)"
            className="px-4 py-2.5 bg-slate-950/60 border border-teal-500/30 rounded-xl text-white placeholder-slate-400 text-xs focus:outline-none focus:border-teal-300"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-white text-[#032D42] hover:bg-teal-50 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#0080A3]" />
            <span>Register & Provision Set</span>
          </button>
        </form>
      </div>

      {/* Team Roster Grid */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0080A3]" />
            <span>Registered Team Members ({teamMembers.length})</span>
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {teamMembers.length === 0 ? 'Starts completely empty (0 entries)' : 'Active multi-developer sync'}
          </span>
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-base mb-1">Zero Developers Registered</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              The team members and developer list starts completely empty. Add real team members live from scratch above to auto-generate unique Update Set containers.
            </p>
            <button
              onClick={onOpenAddDevModal}
              className="px-4 py-2 bg-[#0080A3] text-white font-bold rounded-xl text-xs shadow-md inline-flex items-center gap-2 cursor-pointer hover:bg-[#006d8a]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add First Developer</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => {
              const matchedSet = updateSets.find(s => s.id === member.associatedUpdateSetId);
              const isActivePersona = activeDeveloper?.id === member.id;

              return (
                <div
                  key={member.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isActivePersona
                      ? 'border-teal-500 bg-teal-50/20 shadow-md ring-1 ring-teal-500/30'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${member.avatarColor || 'bg-teal-600'} text-white font-bold flex items-center justify-center text-sm shadow-sm`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                          <p className="text-xs text-slate-500">{member.role}</p>
                        </div>
                      </div>
                      {isActivePersona && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-600 text-white">
                          Active Persona
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs pt-3 border-t border-slate-200/60 font-mono">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Email:</span>
                        <span className="text-slate-900 truncate max-w-[180px]">{member.email}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Update Set:</span>
                        <span className="text-[#0080A3] font-bold truncate max-w-[170px]" title={member.associatedUpdateSetName}>
                          {member.associatedUpdateSetName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Set State:</span>
                        <span className={`font-bold ${matchedSet?.state === 'Complete' ? 'text-emerald-600' : 'text-blue-600'}`}>
                          {matchedSet?.state || 'In progress'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                    <button
                      onClick={() => onImpersonateDeveloper(member)}
                      className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs"
                      title="Impersonate this developer persona"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Impersonate</span>
                    </button>
                    {!isActivePersona ? (
                      <button
                        onClick={() => onSelectDeveloper(member)}
                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all cursor-pointer text-center"
                      >
                        Select
                      </button>
                    ) : (
                      <button
                        onClick={onToggleActiveSetState}
                        className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition-all cursor-pointer text-center"
                      >
                        Toggle State
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
