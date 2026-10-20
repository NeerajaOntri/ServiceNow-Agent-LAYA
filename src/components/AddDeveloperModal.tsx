import React, { useState } from 'react';
import { UserPlus, X, Sparkles, Server, CheckCircle2, Loader2 } from 'lucide-react';
import { TeamMember, IndividualUpdateSet } from '../types';

interface AddDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTeamMember: (newMember: TeamMember, newSet: IndividualUpdateSet) => Promise<void> | void;
  existingMemberCount: number;
  updateSetsCount: number;
}

export const AddDeveloperModal: React.FC<AddDeveloperModalProps> = ({
  isOpen,
  onClose,
  onAddTeamMember,
  existingMemberCount,
  updateSetsCount,
}) => {
  const [devName, setDevName] = useState('');
  const [devRole, setDevRole] = useState('Flow Developer');
  const [customSetName, setCustomSetName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate standardized unique format: US-[DeveloperName]_[Timestamp]
  const cleanFirst = devName.trim() ? devName.trim().split(' ')[0].replace(/[^a-zA-Z0-9]/g, '') : 'Dev';
  const timestampStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const defaultSetName = `US-${cleanFirst}_${timestampStr}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const finalSetName = customSetName.trim() || defaultSetName;
    const finalName = devName.trim();
    const finalRole = devRole;

    const devId = `dev-${Date.now()}`;
    const setId = `us-${Date.now()}`;
    const personaCode = `Dev ${existingMemberCount + 1}`;

    const avatarColors = [
      'bg-teal-600',
      'bg-indigo-600',
      'bg-purple-600',
      'bg-blue-600',
      'bg-emerald-600',
      'bg-rose-600',
      'bg-amber-600',
    ];
    const avatarColor = avatarColors[existingMemberCount % avatarColors.length];

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
      description: `Dynamic Update Set auto-generated on dev442469 for ${finalName} (${finalRole})`,
      payloads: [
        {
          sysId: `pay-${Date.now()}-1`,
          name: 'sys_script_include_9281a',
          targetName: 'IncidentVIPUtils',
          type: 'sys_script_include',
          action: 'INSERT_OR_UPDATE',
          updatedBy: finalName.toLowerCase().replace(/[^a-z0-9]/g, '.'),
          updatedOn: new Date().toISOString().replace('T', ' ').substring(0, 19),
          xmlPayloadPreview: `// Auto-generated artifact in ${finalSetName}\nvar IncidentVIPUtils = Class.create();\nIncidentVIPUtils.prototype = {\n    initialize: function() {\n        this._dev = '${finalName}';\n    },\n    isCallerVIP: function(callerSysId) {\n        var gr = new GlideRecordSecure('sys_user');\n        return gr.get(callerSysId) && gr.getValue('vip') == '1';\n    }\n};`,
        },
      ],
    };

    try {
      // Execute live creation on dev442469 Table API
      const response = await fetch('/api/servicenow/update-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalSetName,
          state: 'in progress',
          description: `Autonomous container dynamically provisioned for ${finalName} (${finalRole}) on dev442469`,
        }),
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data?.success && data?.sysId) {
        newSet.sysId = data.sysId;
      }
    } catch (err: any) {
      console.warn('Real-time sys_update_set creation warning:', err?.message);
    }

    try {
      await onAddTeamMember(newMember, newSet);
      onClose();
      setDevName('');
      setCustomSetName('');
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to register developer persona');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#032D42] via-[#0080A3] to-[#1e1b4b] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-teal-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Add Dynamic Developer Persona</h3>
              <p className="text-[11px] text-teal-100">
                Auto-generates a unique Update Set container on <span className="font-mono font-bold">dev442469</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {submitError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
              {submitError}
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1.5">
              Quick Role Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Saikiran Veera', role: 'Flow Developer' },
                { name: 'Neeraja Omtri', role: 'Lead ServiceNow Architect' },
                { name: 'Krishna Gollakota', role: 'ServiceNow Admin' },
                { name: 'Aarav Sharma', role: 'ITSM Senior Specialist' },
                { name: 'Priya Iyer', role: 'Integration Engineer' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setDevName(p.name);
                    setDevRole(p.role);
                    const clean = p.name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
                    setCustomSetName(`US-${clean}_${timestampStr}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 font-semibold border border-slate-200 hover:border-teal-300 transition-colors cursor-pointer text-[11px]"
                >
                  + {p.name} ({p.role.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Developer Full Name */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Developer Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Saikiran Veera, Neeraja Omtri, Jordan Vance"
              value={devName}
              onChange={(e) => {
                setDevName(e.target.value);
                if (!customSetName && e.target.value) {
                  const clean = e.target.value.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
                  setCustomSetName(`US-${clean}_${timestampStr}`);
                }
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0080A3] focus:border-transparent"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Platform Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={devRole}
              onChange={(e) => setDevRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0080A3]"
            >
              <option value="Lead ServiceNow Architect">Lead ServiceNow Architect</option>
              <option value="Flow Developer">Flow Developer</option>
              <option value="ServiceNow Admin">ServiceNow Admin</option>
              <option value="ITSM Senior Specialist">ITSM Senior Specialist</option>
              <option value="Integration Engineer">Integration Engineer</option>
              <option value="Service Portal Developer">Service Portal Developer</option>
            </select>
          </div>

          {/* Unique Active Update Set Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-bold">
                Auto-Generated Update Set Container <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                US-[Dev]_[Timestamp]
              </span>
            </div>
            <input
              type="text"
              required
              placeholder={defaultSetName}
              value={customSetName || (devName ? defaultSetName : '')}
              onChange={(e) => setCustomSetName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-[#0080A3]"
            />
            <p className="text-[10.5px] text-slate-500 mt-1 flex items-center gap-1">
              <Server className="w-3 h-3 text-teal-600" />
              Will be immediately committed into <code className="font-mono text-slate-700 font-bold">sys_update_set</code> on dev442469.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!devName.trim() || isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0080A3] to-teal-600 hover:from-[#032D42] hover:to-teal-700 text-white font-bold cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Provisioning on dev442469...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Add Developer & Bind Set</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
