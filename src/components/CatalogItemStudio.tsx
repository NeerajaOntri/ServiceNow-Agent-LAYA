import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Eye, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  FileCode, 
  Sparkles, 
  Layers, 
  Send, 
  ChevronRight, 
  Laptop, 
  ShieldAlert, 
  ShoppingCart, 
  HelpCircle,
  Calendar,
  DollarSign,
  Package,
  Terminal
} from 'lucide-react';
import { CatalogItemDefinition, CatalogVariable, CatalogUIPolicyRule } from '../types';

interface CatalogItemStudioProps {
  onAuditScript?: (code: string, title: string) => void;
}

const PRESET_CATALOG_ITEMS: CatalogItemDefinition[] = [
  {
    id: 'cat-developer-laptop',
    name: 'Developer High-Performance Workstation Request',
    shortDescription: 'Request a standard or specialized MacBook Pro M3 or Dell Precision developer machine.',
    category: 'Hardware',
    catalog: 'Service Catalog',
    price: 2499.00,
    recurringPrice: 0,
    icon: 'Laptop',
    deliveryDays: 3,
    fulfillmentFlow: 'Hardware Procurement & Multi-Tier Approval',
    variables: [
      {
        id: 'var-1',
        name: 'requested_for',
        label: 'Employee Name (Requested For)',
        type: 'reference',
        referenceTable: 'sys_user',
        mandatory: true,
        readOnly: false,
        defaultValue: 'David Miller',
        helpText: 'Select the primary user of this equipment.',
        order: 100
      },
      {
        id: 'var-2',
        name: 'os_platform',
        label: 'Operating System & Hardware Platform',
        type: 'select_box',
        mandatory: true,
        readOnly: false,
        defaultValue: 'Apple macOS (M3 Max 64GB)',
        choices: [
          'Apple macOS (M3 Max 64GB)',
          'Apple macOS (M3 Pro 36GB)',
          'Dell Precision 5680 Linux Ubuntu',
          'Lenovo ThinkPad P1 Gen 6 (Windows 11 Enterprise)'
        ],
        order: 200
      },
      {
        id: 'var-3',
        name: 'need_external_monitors',
        label: 'Include Dual 4K External Monitors & Dock',
        type: 'checkbox',
        mandatory: false,
        readOnly: false,
        defaultValue: 'false',
        helpText: 'Includes Dell 32" 4K USB-C Hub Monitor and Thunderbolt 4 dock.',
        order: 300
      },
      {
        id: 'var-4',
        name: 'monitor_delivery_address',
        label: 'Home Office Shipping Address',
        type: 'multi_line_text',
        mandatory: false,
        readOnly: false,
        defaultValue: '',
        helpText: 'Required if accessories or external monitors are selected.',
        order: 400
      },
      {
        id: 'var-5',
        name: 'business_justification',
        label: 'Project Business Justification',
        type: 'multi_line_text',
        mandatory: true,
        readOnly: false,
        defaultValue: 'Lead backend engineer on Q4 Global Payments Migration.',
        helpText: 'Explain why high-spec hardware is required for this role.',
        order: 500
      }
    ],
    uiPolicies: [
      {
        id: 'uip-1',
        conditionVariable: 'need_external_monitors',
        conditionOperator: 'is_checked',
        conditionValue: 'true',
        actions: [
          { targetVariable: 'monitor_delivery_address', visible: true, mandatory: true }
        ]
      }
    ]
  },
  {
    id: 'cat-cloud-access',
    name: 'AWS / GCP Production Cloud Infrastructure Access',
    shortDescription: 'Request elevated IAM roles and temporary production access for cloud services.',
    category: 'Security & Access',
    catalog: 'Technical Service Catalog',
    price: 0,
    recurringPrice: 0,
    icon: 'Shield',
    deliveryDays: 1,
    fulfillmentFlow: 'Security Access Rapid Approval',
    variables: [
      {
        id: 'var-10',
        name: 'cloud_provider',
        label: 'Target Cloud Environment',
        type: 'select_box',
        mandatory: true,
        readOnly: false,
        defaultValue: 'AWS (Amazon Web Services)',
        choices: ['AWS (Amazon Web Services)', 'GCP (Google Cloud Platform)', 'Azure'],
        order: 100
      },
      {
        id: 'var-11',
        name: 'iam_role_level',
        label: 'Requested Permission Level',
        type: 'select_box',
        mandatory: true,
        readOnly: false,
        defaultValue: 'Read-Only Auditor',
        choices: ['Read-Only Auditor', 'DevOps Deployer (Staging)', 'Production Admin (Break-Glass)'],
        order: 200
      },
      {
        id: 'var-12',
        name: 'duration_hours',
        label: 'Access Duration (Hours)',
        type: 'select_box',
        mandatory: true,
        readOnly: false,
        defaultValue: '8 Hours',
        choices: ['4 Hours', '8 Hours', '24 Hours', '7 Days'],
        order: 300
      },
      {
        id: 'var-13',
        name: 'change_ticket_ref',
        label: 'Associated Change Request / Incident Number',
        type: 'single_line_text',
        mandatory: true,
        readOnly: false,
        defaultValue: 'CHG0029104',
        helpText: 'Production access requires an approved Change Request.',
        order: 400
      }
    ],
    uiPolicies: []
  }
];

export const CatalogItemStudio: React.FC<CatalogItemStudioProps> = ({ onAuditScript }) => {
  const [items, setItems] = useState<CatalogItemDefinition[]>(PRESET_CATALOG_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string>(PRESET_CATALOG_ITEMS[0].id);
  const [activeTab, setActiveTab] = useState<'portalPreview' | 'variables' | 'exportXml'>('portalPreview');
  const [copied, setCopied] = useState(false);

  // Portal interactive form state
  const [portalFormValues, setPortalFormValues] = useState<Record<string, string>>({
    requested_for: 'David Miller (Staff Engineer)',
    os_platform: 'Apple macOS (M3 Max 64GB)',
    need_external_monitors: 'false',
    monitor_delivery_address: '',
    business_justification: 'Lead engineer on Payment Gateway architecture.',
    cloud_provider: 'AWS (Amazon Web Services)',
    iam_role_level: 'DevOps Deployer (Staging)',
    duration_hours: '8 Hours',
    change_ticket_ref: 'CHG0029104'
  });
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [submittedOrder, setSubmittedOrder] = useState<{ reqNumber: string; ritmNumber: string } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const currentItem = items.find(i => i.id === selectedItemId) || items[0];

  const updateCurrentItem = (updater: (prev: CatalogItemDefinition) => CatalogItemDefinition) => {
    setItems(prev => prev.map(i => i.id === currentItem.id ? updater(i) : i));
  };

  // Check UI Policies for dynamic field visibility/mandatory
  const isFieldVisible = (variableName: string): boolean => {
    for (const policy of currentItem.uiPolicies) {
      const act = policy.actions.find(a => a.targetVariable === variableName);
      if (!act) continue;

      const triggerVal = portalFormValues[policy.conditionVariable];
      let matches = false;

      if (policy.conditionOperator === 'is_checked') {
        matches = triggerVal === 'true';
      } else if (policy.conditionOperator === '==') {
        matches = triggerVal === policy.conditionValue;
      }

      if (matches && act.visible !== undefined) {
        return act.visible;
      } else if (!matches && act.visible !== undefined) {
        // If condition not met, revert
        return !act.visible;
      }
    }
    return true;
  };

  const isFieldMandatory = (variable: CatalogVariable): boolean => {
    for (const policy of currentItem.uiPolicies) {
      const act = policy.actions.find(a => a.targetVariable === variable.name);
      if (!act) continue;

      const triggerVal = portalFormValues[policy.conditionVariable];
      if (policy.conditionOperator === 'is_checked' && triggerVal === 'true') {
        if (act.mandatory !== undefined) return act.mandatory;
      }
    }
    return variable.mandatory;
  };

  // Submit order in Portal simulation
  const handleOrderNow = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    for (const variable of currentItem.variables) {
      if (!isFieldVisible(variable.name)) continue;
      const mandatory = isFieldMandatory(variable);
      const val = portalFormValues[variable.name] || '';

      if (mandatory && (!val || val.trim() === '')) {
        errors[variable.name] = `${variable.label} is required.`;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const randomReq = `REQ00${Math.floor(10000 + Math.random() * 90000)}`;
    const randomRitm = `RITM00${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmittedOrder({ reqNumber: randomReq, ritmNumber: randomRitm });
  };

  const handleAddVariable = (type: CatalogVariable['type']) => {
    const newVar: CatalogVariable = {
      id: `var-${Date.now()}`,
      name: `custom_field_${currentItem.variables.length + 1}`,
      label: `New ${type.replace(/_/g, ' ')} Field`,
      type,
      mandatory: false,
      readOnly: false,
      defaultValue: '',
      helpText: '',
      choices: type === 'select_box' ? ['Option A', 'Option B', 'Option C'] : undefined,
      referenceTable: type === 'reference' ? 'sys_user' : undefined,
      order: (currentItem.variables.length + 1) * 100
    };

    updateCurrentItem(p => ({
      ...p,
      variables: [...p.variables, newVar]
    }));
  };

  const handleDeleteVariable = (varId: string) => {
    updateCurrentItem(p => ({
      ...p,
      variables: p.variables.filter(v => v.id !== varId)
    }));
  };

  const generateCatalogItemXml = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<unload unload_date="2026-10-14 00:00:00">
  <sc_cat_item action="INSERT_OR_UPDATE">
    <name>${currentItem.name}</name>
    <short_description>${currentItem.shortDescription}</short_description>
    <category>${currentItem.category}</category>
    <price>${currentItem.price}</price>
    <delivery_time>${currentItem.deliveryDays} 00:00:00</delivery_time>
    <flow_designer_flow>${currentItem.fulfillmentFlow}</flow_designer_flow>
    <active>true</active>
    <visible_standalone>true</visible_standalone>
  </sc_cat_item>

  <!-- Variables (item_option_new) -->
${currentItem.variables.map(v => `  <item_option_new action="INSERT_OR_UPDATE">
    <name>${v.name}</name>
    <question_text>${v.label}</question_text>
    <type>${v.type === 'select_box' ? '5' : v.type === 'reference' ? '8' : v.type === 'checkbox' ? '7' : '6'}</type>
    <mandatory>${v.mandatory}</mandatory>
    <read_only>${v.readOnly}</read_only>
    <order>${v.order}</order>
    <help_text>${v.helpText || ''}</help_text>
    <reference>${v.referenceTable || ''}</reference>
  </item_option_new>`).join('\n\n')}
</unload>`;
  };

  const generateCatalogScript = () => {
    return `// ====================================================================
// ServiceNow Background Script: Create sc_cat_item and Variables
// ====================================================================
(function createCatalogItem() {
  try {
    var grCatItem = new GlideRecord('sc_cat_item');
    grCatItem.addQuery('name', '${currentItem.name}');
    grCatItem.query();
    
    if (!grCatItem.next()) {
      grCatItem.initialize();
      grCatItem.setValue('name', '${currentItem.name}');
    }
    grCatItem.setValue('short_description', '${currentItem.shortDescription}');
    grCatItem.setValue('price', ${currentItem.price});
    grCatItem.setValue('active', true);
    var itemSysId = grCatItem.update();
    
    gs.info('Catalog Item saved: ' + itemSysId);

    // Create / Attach Variables (item_option_new)
${currentItem.variables.map(v => `    var grVar = new GlideRecord('item_option_new');
    grVar.initialize();
    grVar.setValue('cat_item', itemSysId);
    grVar.setValue('name', '${v.name}');
    grVar.setValue('question_text', '${v.label}');
    grVar.setValue('mandatory', ${v.mandatory});
    grVar.setValue('order', ${v.order});
    grVar.insert();`).join('\n')}

    gs.info('All variables provisioned successfully for ${currentItem.name}');
    return itemSysId;
  } catch (ex) {
    gs.error('Catalog item creation error: ' + ex.getMessage());
  }
})();`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#032D42] via-[#064e3b] to-[#059669] text-white p-6 rounded-2xl shadow-md border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShoppingBag className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black tracking-tight font-mono">
              SERVICE CATALOG ITEM CREATOR & PORTAL PREVIEW
            </h1>
          </div>
          <p className="text-slate-300 text-sm max-w-2xl">
            Build full ServiceNow Catalog Items (<code className="text-emerald-300 font-mono">sc_cat_item</code>) with variable sets and test them in a pixel-perfect, interactive Service Portal form preview (<code className="text-emerald-300 font-mono">/sp?id=sc_cat_item</code>).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const newI: CatalogItemDefinition = {
                id: `cat-${Date.now()}`,
                name: 'New IT Service Request',
                shortDescription: 'Submit a custom IT service or software license request',
                category: 'IT Services',
                catalog: 'Service Catalog',
                price: 0,
                icon: 'Package',
                deliveryDays: 2,
                fulfillmentFlow: 'Standard Request Fulfillment',
                variables: [
                  {
                    id: `var-init-1`,
                    name: 'short_description',
                    label: 'Summary of Request',
                    type: 'single_line_text',
                    mandatory: true,
                    readOnly: false,
                    order: 100
                  }
                ],
                uiPolicies: []
              };
              setItems([newI, ...items]);
              setSelectedItemId(newI.id);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-900 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Catalog Item
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Catalog Items List & Variable Editor (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Catalog Item Selector */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
              Catalog Items (sc_cat_item)
            </h3>
            <div className="space-y-1.5">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setSubmittedOrder(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all border cursor-pointer ${
                    item.id === selectedItemId
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs font-semibold'
                      : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-emerald-700 uppercase font-bold">
                      {item.category}
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.price > 0 ? `$${item.price.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">{item.variables.length} variables &bull; {item.deliveryDays}d SLA</p>
                </button>
              ))}
            </div>
          </div>

          {/* Item Properties Form */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-600">
              Item Metadata
            </h3>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Item Name</label>
              <input
                type="text"
                value={currentItem.name}
                onChange={(e) => updateCurrentItem(p => ({ ...p, name: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Category</label>
              <input
                type="text"
                value={currentItem.category}
                onChange={(e) => updateCurrentItem(p => ({ ...p, category: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Price ($)</label>
                <input
                  type="number"
                  value={currentItem.price}
                  onChange={(e) => updateCurrentItem(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Delivery SLA (Days)</label>
                <input
                  type="number"
                  value={currentItem.deliveryDays}
                  onChange={(e) => updateCurrentItem(p => ({ ...p, deliveryDays: parseInt(e.target.value) || 1 }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Short Description</label>
              <textarea
                rows={2}
                value={currentItem.shortDescription}
                onChange={(e) => updateCurrentItem(p => ({ ...p, shortDescription: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Service Portal Preview & Variable Manager (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub Navigation Bar */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('portalPreview')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'portalPreview'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Service Portal Live Preview (/sp?id=sc_cat_item)
              </button>
              <button
                onClick={() => setActiveTab('variables')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'variables'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Variable Form Builder ({currentItem.variables.length})
              </button>
              <button
                onClick={() => setActiveTab('exportXml')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'exportXml'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                XML & Background Script
              </button>
            </div>

            <span className="text-xs text-slate-500 font-mono pr-2">
              Catalog: {currentItem.catalog}
            </span>
          </div>

          {/* TAB 1: SERVICE PORTAL LIVE INTERACTIVE PREVIEW */}
          {activeTab === 'portalPreview' && (
            <div className="space-y-4">
              {/* Simulated Service Portal Shell */}
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                {/* Service Portal Header / Top Navigation Mock */}
                <div className="bg-[#032D42] text-white px-6 py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold font-mono text-teal-300 text-sm">Service Portal</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-200">Catalog &bull; {currentItem.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300">Welcome, David Miller</span>
                    <div className="w-7 h-7 rounded-full bg-teal-500 text-slate-900 font-bold flex items-center justify-center text-xs">
                      DM
                    </div>
                  </div>
                </div>

                {/* Service Portal Breadcrumbs */}
                <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 text-[11px] text-slate-600 flex items-center gap-1.5">
                  <span className="text-[#0080A3] font-medium hover:underline cursor-pointer">Home</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-[#0080A3] font-medium hover:underline cursor-pointer">Service Catalog</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-700 font-medium">{currentItem.category}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-900 font-bold">{currentItem.name}</span>
                </div>

                {/* Main Portal Item Content */}
                <div className="p-6">
                  {submittedOrder ? (
                    <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                        <Check className="w-7 h-7 stroke-[3]" />
                      </div>
                      <h3 className="text-lg font-bold text-emerald-950">
                        Order Placed Successfully!
                      </h3>
                      <p className="text-xs text-emerald-800 max-w-md mx-auto">
                        Your request has been submitted to the ServiceNow Request Fulfillment engine. An approval notification has been dispatched to your manager.
                      </p>

                      <div className="flex justify-center gap-4 py-2">
                        <div className="bg-white px-4 py-2 rounded-xl border border-emerald-200 text-xs font-mono font-bold text-slate-800">
                          Request: <span className="text-emerald-700">{submittedOrder.reqNumber}</span>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl border border-emerald-200 text-xs font-mono font-bold text-slate-800">
                          RITM: <span className="text-emerald-700">{submittedOrder.ritmNumber}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSubmittedOrder(null)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
                      >
                        Submit Another Request
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleOrderNow} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Item Description & Interactive Form (2 cols) */}
                      <div className="md:col-span-2 space-y-5">
                        <div className="border-b border-slate-200 pb-4">
                          <h2 className="text-xl font-bold text-slate-900">
                            {currentItem.name}
                          </h2>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {currentItem.shortDescription}
                          </p>
                        </div>

                        {/* Interactive Variables Form Fields */}
                        <div className="space-y-4">
                          {currentItem.variables.map(variable => {
                            if (!isFieldVisible(variable.name)) return null;
                            const mandatory = isFieldMandatory(variable);
                            const error = formErrors[variable.name];

                            return (
                              <div key={variable.id} className="space-y-1 text-xs">
                                <label className="block font-semibold text-slate-800">
                                  {variable.label}
                                  {mandatory && <span className="text-rose-500 font-bold ml-1">*</span>}
                                </label>

                                {variable.type === 'single_line_text' && (
                                  <input
                                    type="text"
                                    value={portalFormValues[variable.name] || ''}
                                    onChange={(e) => setPortalFormValues({ ...portalFormValues, [variable.name]: e.target.value })}
                                    className={`w-full px-3 py-2 rounded-lg border text-xs ${
                                      error ? 'border-rose-400 bg-rose-50' : 'border-slate-300 focus:border-emerald-500'
                                    }`}
                                  />
                                )}

                                {variable.type === 'multi_line_text' && (
                                  <textarea
                                    rows={3}
                                    value={portalFormValues[variable.name] || ''}
                                    onChange={(e) => setPortalFormValues({ ...portalFormValues, [variable.name]: e.target.value })}
                                    className={`w-full px-3 py-2 rounded-lg border text-xs ${
                                      error ? 'border-rose-400 bg-rose-50' : 'border-slate-300 focus:border-emerald-500'
                                    }`}
                                  />
                                )}

                                {variable.type === 'select_box' && (
                                  <select
                                    value={portalFormValues[variable.name] || ''}
                                    onChange={(e) => setPortalFormValues({ ...portalFormValues, [variable.name]: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:border-emerald-500"
                                  >
                                    {(variable.choices || []).map(ch => (
                                      <option key={ch} value={ch}>{ch}</option>
                                    ))}
                                  </select>
                                )}

                                {variable.type === 'reference' && (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={portalFormValues[variable.name] || ''}
                                      onChange={(e) => setPortalFormValues({ ...portalFormValues, [variable.name]: e.target.value })}
                                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                                      placeholder={`Lookup from ${variable.referenceTable || 'table'}...`}
                                    />
                                  </div>
                                )}

                                {variable.type === 'checkbox' && (
                                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={portalFormValues[variable.name] === 'true'}
                                      onChange={(e) => setPortalFormValues({ ...portalFormValues, [variable.name]: e.target.checked ? 'true' : 'false' })}
                                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-slate-700 font-medium">Enable this option</span>
                                  </label>
                                )}

                                {variable.helpText && (
                                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                                    {variable.helpText}
                                  </p>
                                )}

                                {error && (
                                  <p className="text-[11px] text-rose-600 font-semibold">
                                    {error}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Price & Order Action Card (1 col) */}
                      <div className="md:col-span-1 space-y-4">
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                          <div>
                            <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block">Price</span>
                            <div className="text-2xl font-black text-slate-900 mt-1">
                              {currentItem.price > 0 ? `$${(currentItem.price * orderQuantity).toFixed(2)}` : 'Free'}
                            </div>
                            {orderQuantity > 1 && currentItem.price > 0 && (
                              <span className="text-[11px] text-slate-500 font-mono">
                                (${currentItem.price.toFixed(2)} each)
                              </span>
                            )}
                          </div>

                          <div className="border-t border-slate-200 pt-3">
                            <span className="text-xs text-slate-600 font-medium block mb-1">Quantity</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold hover:bg-slate-100 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-bold text-sm">{orderQuantity}</span>
                              <button
                                type="button"
                                onClick={() => setOrderQuantity(orderQuantity + 1)}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold hover:bg-slate-100 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="border-t border-slate-200 pt-3 text-xs space-y-1.5 text-slate-600">
                            <div className="flex justify-between">
                              <span>Estimated Delivery:</span>
                              <span className="font-semibold text-slate-800">{currentItem.deliveryDays} business days</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fulfillment:</span>
                              <span className="font-semibold text-slate-800">{currentItem.fulfillmentFlow}</span>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Order Now
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VARIABLE FORM BUILDER */}
          {activeTab === 'variables' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Catalog Variables (item_option_new)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure question labels, field types, mandatory rules, and default values.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAddVariable('single_line_text')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    + Text
                  </button>
                  <button
                    onClick={() => handleAddVariable('select_box')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    + Select Box
                  </button>
                  <button
                    onClick={() => handleAddVariable('reference')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    + Reference
                  </button>
                  <button
                    onClick={() => handleAddVariable('checkbox')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    + Checkbox
                  </button>
                </div>
              </div>

              {/* Variables List */}
              <div className="space-y-3">
                {currentItem.variables.map((v, idx) => (
                  <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={v.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentItem(p => ({
                              ...p,
                              variables: p.variables.map(item => item.id === v.id ? { ...item, label: val } : item)
                            }));
                          }}
                          className="font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-emerald-600 bg-transparent px-1"
                        />
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                          {v.type}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteVariable(v.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                        title="Delete Variable"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block">Variable Name</label>
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentItem(p => ({
                              ...p,
                              variables: p.variables.map(item => item.id === v.id ? { ...item, name: val } : item)
                            }));
                          }}
                          className="w-full px-2 py-1 rounded bg-white border border-slate-300 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block">Default Value</label>
                        <input
                          type="text"
                          value={v.defaultValue || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentItem(p => ({
                              ...p,
                              variables: p.variables.map(item => item.id === v.id ? { ...item, defaultValue: val } : item)
                            }));
                          }}
                          className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-3 sm:col-span-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={v.mandatory}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              updateCurrentItem(p => ({
                                ...p,
                                variables: p.variables.map(item => item.id === v.id ? { ...item, mandatory: checked } : item)
                              }));
                            }}
                            className="w-3.5 h-3.5 rounded text-emerald-600"
                          />
                          <span className="text-slate-700 font-semibold">Mandatory</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={v.readOnly}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              updateCurrentItem(p => ({
                                ...p,
                                variables: p.variables.map(item => item.id === v.id ? { ...item, readOnly: checked } : item)
                              }));
                            }}
                            className="w-3.5 h-3.5 rounded text-emerald-600"
                          />
                          <span className="text-slate-700 font-semibold">Read Only</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT XML & GLIDESCRIPT */}
          {activeTab === 'exportXml' && (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    ServiceNow Service Catalog XML Update Set
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateCatalogItemXml());
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy XML
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 bg-black/40 p-4 rounded-xl overflow-x-auto max-h-[250px] leading-relaxed">
                  {generateCatalogItemXml()}
                </pre>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Background Script (Deploy sc_cat_item via GlideRecord)
                  </span>
                  <div className="flex items-center gap-2">
                    {onAuditScript && (
                      <button
                        onClick={() => onAuditScript(generateCatalogScript(), `CatalogItem: ${currentItem.name}`)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-900/60 text-purple-300 hover:bg-purple-800/80 transition-colors cursor-pointer"
                      >
                        Audit Script
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateCatalogScript());
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Script
                    </button>
                  </div>
                </div>
                <pre className="text-xs font-mono text-emerald-200/90 bg-black/40 p-4 rounded-xl overflow-x-auto max-h-[250px] leading-relaxed">
                  {generateCatalogScript()}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
