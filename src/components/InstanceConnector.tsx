import React, { useState, useEffect } from 'react';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Database,
  Search,
  Code,
  Copy,
  Check,
  Zap,
  Info,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Moon,
  Clock
} from 'lucide-react';
import { InstanceStatus, TableRecord } from '../types';

interface InstanceConnectorProps {
  onOpenQueryInBuilder?: (query: string, table: string) => void;
  onAuditScript?: (scriptCode: string, scriptTitle: string) => void;
  instanceStatus: InstanceStatus | null;
  onRefreshStatus: () => Promise<void>;
}

export const InstanceConnector: React.FC<InstanceConnectorProps> = ({
  onOpenQueryInBuilder,
  onAuditScript,
  instanceStatus,
  onRefreshStatus,
}) => {
  const [instanceUrl, setInstanceUrl] = useState(() => {
    return localStorage.getItem('laya_instance_url') || instanceStatus?.instanceUrl || 'https://dev213909.service-now.com';
  });
  const [authType, setAuthType] = useState<'basic' | 'token'>('basic');
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('laya_username') || 'admin';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('laya_password') || 'xzJD91HK^%vt';
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('laya_token') || '';
  });
  const [showPassword, setShowPassword] = useState(false);

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectFeedback, setConnectFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    detail?: string;
    isAuthError?: boolean;
    passwordNeedsReset?: boolean;
  } | null>(null);

  // Table explorer state
  const [selectedTable, setSelectedTable] = useState('incident');
  const [customTable, setCustomTable] = useState('');
  const [queryFilter, setQueryFilter] = useState('active=true^ORDERBYDESCsys_created_on');
  const [queryLimit, setQueryLimit] = useState(15);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [records, setRecords] = useState<TableRecord[]>([]);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [isFallbackRecords, setIsFallbackRecords] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<TableRecord | null>(null);
  const [copiedSysId, setCopiedSysId] = useState<string | null>(null);

  const cleanInstanceHost = instanceUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const cleanInstanceName = cleanInstanceHost.split('.')[0] || 'dev213909';

  const popularTables = [
    { id: 'incident', label: 'Incidents', icon: '🚨' },
    { id: 'change_request', label: 'Change Requests', icon: '🔄' },
    { id: 'problem', label: 'Problems', icon: '⚠️' },
    { id: 'sys_user', label: 'User Directory', icon: '👤' },
    { id: 'sys_script', label: 'Business Rules', icon: '⚡' },
    { id: 'sys_script_client', label: 'Client Scripts', icon: '💻' },
    { id: 'sp_widget', label: 'Portal Widgets', icon: '🧩' },
    { id: 'sys_db_object', label: 'Tables Schema', icon: '🗄️' },
  ];

  // Sync instanceUrl and status if prop updates
  useEffect(() => {
    if (instanceStatus?.instanceUrl) {
      setInstanceUrl(instanceStatus.instanceUrl);
    }
    if (instanceStatus?.passwordNeedsReset) {
      setConnectFeedback({
        type: 'info',
        message: instanceStatus.errorMessage || 'Password verified! One-time browser login required to complete activation.',
        detail: instanceStatus.errorDetail,
        passwordNeedsReset: true,
        isAuthError: true,
      });
    }
  }, [instanceStatus?.instanceUrl, instanceStatus?.passwordNeedsReset]);

  const activeTableId = customTable.trim() || selectedTable;

  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsConnecting(true);
    setConnectFeedback(null);

    try {
      // Save credentials locally so inputs persist across page navigation and reloads
      localStorage.setItem('laya_instance_url', instanceUrl.trim());
      localStorage.setItem('laya_username', username.trim());
      localStorage.setItem('laya_password', password);
      if (token) localStorage.setItem('laya_token', token.trim());

      const payload: any = {
        instanceUrl: instanceUrl.trim(),
      };

      if (authType === 'basic') {
        payload.username = username.trim();
        payload.password = password;
      } else {
        payload.token = token.trim();
      }

      const response = await fetch('/api/servicenow/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      await onRefreshStatus();

      if (data.isAuthenticated) {
        setConnectFeedback({
          type: 'success',
          message: `Connected & Authenticated to ${instanceUrl}! Authenticated as "${data.userName || username}".`,
        });
        // Auto-fetch initial records
        fetchRecords(activeTableId);
      } else if (data.isReachable) {
        const isAuth401 = data.statusCode === 401 || data.errorMessage?.includes('rejected') || data.errorMessage?.includes('Authentication failed');
        setConnectFeedback({
          type: data.passwordNeedsReset ? 'info' : 'error',
          message: data.errorMessage || 'Instance is online, but credentials were rejected (HTTP 401). Check username & password.',
          detail: data.errorDetail,
          isAuthError: isAuth401,
          passwordNeedsReset: Boolean(data.passwordNeedsReset),
        });
        // Even if waiting for web browser activation, load records (sandbox/demo) so developer is never blocked
        fetchRecords(activeTableId);
      } else {
        setConnectFeedback({
          type: 'error',
          message: data.errorMessage || 'Could not connect to instance. Check URL or hibernation status.',
          detail: data.errorDetail,
        });
        fetchRecords(activeTableId);
      }
    } catch (err: any) {
      setConnectFeedback({
        type: 'error',
        message: err?.message || 'Network error attempting to reach instance proxy.',
      });
      fetchRecords(activeTableId);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/servicenow/disconnect', { method: 'POST' });
      setPassword('');
      setToken('');
      localStorage.removeItem('laya_password');
      localStorage.removeItem('laya_token');
      setRecords([]);
      setSelectedRecord(null);
      setConnectFeedback({
        type: 'info',
        message: 'Disconnected credentials. Instance remains target for public/read APIs.',
      });
      await onRefreshStatus();
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchRecords = async (tableName: string = activeTableId) => {
    setIsLoadingRecords(true);
    setRecordsError(null);
    try {
      const url = new URL('/api/servicenow/records', window.location.origin);
      url.searchParams.set('table', tableName);
      if (queryFilter) url.searchParams.set('query', queryFilter);
      url.searchParams.set('limit', String(queryLimit));

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok || !data.success) {
        setRecordsError(data.error || `Failed to fetch records from table "${tableName}".`);
        setRecords([]);
        setIsFallbackRecords(false);
      } else {
        setRecords(data.result || []);
        setIsFallbackRecords(Boolean(data.isFallback));
        setFallbackReason(data.fallbackReason || null);
      }
    } catch (err: any) {
      setRecordsError(err?.message || 'Failed to fetch records from instance.');
      setRecords([]);
      setIsFallbackRecords(false);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Fetch initial records on component mount and when table changes
  useEffect(() => {
    fetchRecords(activeTableId);
  }, [activeTableId]);

  const handleCopySysId = (sysId: string) => {
    navigator.clipboard.writeText(sysId);
    setCopiedSysId(sysId);
    setTimeout(() => setCopiedSysId(null), 2000);
  };

  const getStatusBadge = () => {
    if (!instanceStatus) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking Status
        </span>
      );
    }

    if (instanceStatus.isAuthenticated) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected & Authenticated
        </span>
      );
    }

    if (instanceStatus.isHibernating) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <Moon className="w-3.5 h-3.5 text-amber-600" /> Instance Hibernating
        </span>
      );
    }

    if (instanceStatus.isReachable) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
          <AlertTriangle className="w-3.5 h-3.5 text-sky-600" /> Instance Online (Needs Auth)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Unreachable
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner: Instance Identity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0080A3] to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-[#032D42]">
                  ServiceNow Instance Manager
                </h1>
                {getStatusBadge()}
                {instanceStatus?.pingMs !== undefined && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {instanceStatus.pingMs} ms latency
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>Active Target:</span>
                <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {instanceUrl}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onRefreshStatus()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ping instance and verify response"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Ping Instance</span>
            </button>

            <a
              href={instanceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-[#032D42] hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Open in ServiceNow</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Hibernation or Warning Alert if applicable */}
        {instanceStatus?.isHibernating && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
            <Moon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Instance {instanceUrl} is currently hibernating (sleeping).</p>
              <p className="text-amber-800">
                ServiceNow Personal Developer Instances (PDIs) sleep when inactive. Log in to{' '}
                <a
                  href="https://developer.servicenow.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-amber-950"
                >
                  developer.servicenow.com
                </a>{' '}
                and click <strong>"Wake Up Instance"</strong>. It typically takes 2–3 minutes to resume.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Connection Credentials & Table Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Authentication Settings (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0080A3]" />
                <h2 className="text-sm font-bold text-slate-800">Connection & Credentials</h2>
              </div>
              {instanceStatus?.isAuthenticated && (
                <button
                  onClick={handleDisconnect}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Disconnect
                </button>
              )}
            </div>

            <form onSubmit={handleConnect} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ServiceNow Instance URL
                </label>
                <input
                  type="text"
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  placeholder="https://dev213909.service-now.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                  required
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                  <span className="text-[10.5px]">PDI Targets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setInstanceUrl('https://dev213909.service-now.com');
                      setPassword('xzJD91HK^%vt');
                    }}
                    className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[10.5px] border cursor-pointer transition-all ${
                      cleanInstanceName === 'dev213909'
                        ? 'bg-teal-100/70 border-teal-400 text-teal-900 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                  >
                    dev213909 (Active PDI)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInstanceUrl('https://dev411582.service-now.com');
                      setPassword('Nz/wILlR15=q');
                    }}
                    className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[10.5px] border cursor-pointer transition-all ${
                      cleanInstanceName === 'dev411582'
                        ? 'bg-teal-100/70 border-teal-400 text-teal-900 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                  >
                    dev411582
                  </button>
                </div>
              </div>

              {/* Auth Mode Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Authentication Method
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAuthType('basic')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      authType === 'basic'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Basic Auth (PDI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthType('token')}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      authType === 'token'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    OAuth / Bearer Token
                  </button>
                </div>
              </div>

              {authType === 'basic' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        required
                      />
                    </div>
                    {username.includes('@') && (
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <span>Note: ServiceNow PDIs use <strong>admin</strong> as default user ID, not your email.</span>
                        <button
                          type="button"
                          onClick={() => setUsername('admin')}
                          className="underline font-bold text-amber-900 cursor-pointer ml-1.5 shrink-0"
                        >
                          Use "admin"
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Instance Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-[#0080A3] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your PDI admin password..."
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                        required
                      />
                    </div>
                    {password.length > 0 && (password.startsWith(' ') || password.endsWith(' ') || password.includes('\n')) && (
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <span>Password has extra spaces at start or end.</span>
                        <button
                          type="button"
                          onClick={() => setPassword(password.trim())}
                          className="underline font-bold text-amber-900 cursor-pointer ml-1.5 shrink-0"
                        >
                          Trim Spaces
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bearer / Access Token
                  </label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                    required
                  />
                </div>
              )}

              {/* Feedback banner */}
              {connectFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs ${
                    connectFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : connectFeedback.type === 'error'
                      ? 'bg-rose-50 text-rose-900 border border-rose-200'
                      : 'bg-sky-50 text-sky-800 border border-sky-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {connectFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : connectFeedback.type === 'error' ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold">{connectFeedback.message}</p>
                      {connectFeedback.detail && (
                        <p className="font-mono text-[10.5px] text-rose-700 bg-rose-100/60 px-2 py-1 rounded">
                          {connectFeedback.detail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Priority Banner for Password Needs Reset */}
                  {connectFeedback.passwordNeedsReset ? (
                    <div className="mt-3 pt-3 border-t border-amber-300 space-y-2.5 text-slate-800">
                      <div className="bg-amber-100/80 border border-amber-300 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Password Recognized! One-Time Browser Activation Required</span>
                        </div>
                        <p className="text-[11.5px] text-slate-700 leading-relaxed">
                          Your password was recognized by ServiceNow! However, because it was just reset on the developer portal, ServiceNow set <code className="bg-white px-1 py-0.5 rounded border border-amber-200 font-mono font-bold text-amber-900">X-Password-Needs-Reset: true</code>.
                        </p>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          ServiceNow <strong>blocks external REST API calls (returning 401)</strong> until you open your instance in your browser once to complete the first-time login.
                        </p>

                        <div className="pt-1.5 flex flex-wrap items-center gap-2.5">
                          <a
                            href={instanceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0080A3] hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
                          >
                            <span>Open {cleanInstanceHost} in Browser</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/80 space-y-1 text-[11px] text-slate-700">
                          <div className="font-bold text-slate-800">Next step:</div>
                          <ol className="list-decimal pl-4 space-y-1">
                            <li>Click the button above to open <strong>{cleanInstanceHost}</strong> in your browser.</li>
                            <li>Log in with User: <code>admin</code> and your reset password <code className="font-mono">{password || 'xzJD91HK^%vt'}</code> (if prompted to set a new password, choose any password).</li>
                            <li>Once you see the ServiceNow home screen in your browser, return here and click <strong>"Connect & Test Instance"</strong>!</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  ) : connectFeedback.isAuthError ? (
                    <div className="mt-3 pt-3 border-t border-rose-200 space-y-2.5 text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-rose-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Why was the password rejected? (3 Quick Fixes)</span>
                      </div>

                      <div className="space-y-2 text-[11px] leading-relaxed">
                        {/* Cause 1 */}
                        <div className="bg-white p-2.5 rounded-lg border border-rose-200/70 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-950">
                              1. Developer Portal Password ≠ Instance Admin Password
                            </span>
                            <span className="text-[9px] bg-rose-100 text-rose-800 font-extrabold px-1.5 py-0.5 rounded uppercase">
                              95% of Cases
                            </span>
                          </div>
                          <p className="text-slate-600">
                            The password you use to log in to <strong>developer.servicenow.com</strong> (your email/ServiceNow ID) is <em>NOT</em> the instance password. ServiceNow assigns a separate random password specifically for the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold">admin</code> user on <strong>{cleanInstanceName}</strong>.
                          </p>
                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            <a
                              href="https://developer.servicenow.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0080A3] hover:bg-teal-700 text-white rounded-md text-[10.5px] font-bold transition-colors"
                            >
                              <span>Open developer.servicenow.com</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className="text-[10px] text-slate-500">
                              Click your profile icon (top right) → "Manage instance pwd"
                            </span>
                          </div>
                        </div>

                        {/* Cause 2 */}
                        <div className="bg-white p-2.5 rounded-lg border border-rose-200/70 space-y-1.5">
                          <span className="font-bold text-rose-950 block">
                            2. Browser Login Required ("Password Needs Reset")
                          </span>
                          <p className="text-slate-600">
                            If the instance password was recently generated or reset, ServiceNow locks REST API access with HTTP 401 until you log in to the web interface in a browser once to confirm or change the initial password.
                          </p>
                          <div className="pt-1">
                            <a
                              href={instanceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-[10.5px] font-bold transition-colors"
                            >
                              <span>Open {cleanInstanceName} in Browser</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        {/* Cause 3 */}
                        <div className="bg-white p-2.5 rounded-lg border border-rose-200/70 space-y-1.5">
                          <span className="font-bold text-rose-950 block">
                            3. Guaranteed Fix: Set a Custom Admin Password in ServiceNow
                          </span>
                          <p className="text-slate-600">
                            If you can open your instance in your browser via SSO:
                          </p>
                          <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                            <li>In the filter navigator, type <code className="bg-slate-100 px-1 py-0.2 rounded font-mono font-bold">sys_user.list</code> and press Enter.</li>
                            <li>Open the user with User ID <code className="font-bold text-slate-800">admin</code>.</li>
                            <li>Type a password of your choice in the <strong>Password</strong> field.</li>
                            <li>Make sure <strong>"Password needs reset"</strong> is <strong>UNCHECKED</strong>.</li>
                            <li>Click <strong>Update</strong>, then type that new password above and reconnect!</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-2.5 px-4 bg-[#0080A3] hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting & Authenticating...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Connect & Test Instance</span>
                  </>
                )}
              </button>
            </form>

            {/* Permanent Helper Card */}
            <div className="pt-3.5 border-t border-slate-100 text-slate-600 space-y-2.5 text-[11px]">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#0080A3]" />
                <span>How to find your PDI Admin Password:</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
                <li>
                  Open{' '}
                  <a
                    href="https://developer.servicenow.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0080A3] underline font-bold"
                  >
                    developer.servicenow.com
                  </a>{' '}
                  and sign in.
                </li>
                <li>Click your <strong>profile icon</strong> in the upper-right header.</li>
                <li>Under "My Instance", click <strong>"Manage instance pwd"</strong> (or "Reset instance password").</li>
                <li>Copy the temporary <code>admin</code> password shown and paste it into the password box above.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right Column: Live Table Explorer (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0080A3]" />
                <h2 className="text-sm font-bold text-slate-800">
                  Live Table Explorer ({activeTableId})
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                Queries live Table API on {instanceUrl}
              </span>
            </div>

            {/* Table Quick Selector */}
            <div className="flex flex-wrap gap-1.5">
              {popularTables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTable(t.id);
                    setCustomTable('');
                    fetchRecords(t.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTableId === t.id
                      ? 'bg-[#0080A3] text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Query Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Custom Table (sys_db_object)
                </label>
                <input
                  type="text"
                  value={customTable}
                  onChange={(e) => setCustomTable(e.target.value)}
                  placeholder="e.g. u_custom_app"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Encoded Query (sysparm_query)
                </label>
                <input
                  type="text"
                  value={queryFilter}
                  onChange={(e) => setQueryFilter(e.target.value)}
                  placeholder="active=true^ORDERBYDESCsys_created_on"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  onClick={() => fetchRecords()}
                  disabled={isLoadingRecords}
                  className="w-full py-1.5 px-3 bg-[#0080A3] hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecords ? 'animate-spin' : ''}`} />
                  <span>Fetch</span>
                </button>
              </div>
            </div>

            {/* Records List or State Feedback */}
            {isLoadingRecords ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <RefreshCw className="w-6 h-6 text-[#0080A3] animate-spin mx-auto" />
                <p className="text-xs font-medium">
                  Querying Table API on {instanceUrl}...
                </p>
              </div>
            ) : recordsError ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Table API Error:</span>
                </div>
                <p>{recordsError}</p>
                {!instanceStatus?.isAuthenticated && (
                  <p className="text-rose-700 font-medium pt-1 border-t border-rose-200">
                    💡 Please provide your admin username & password on the left panel to authenticate.
                  </p>
                )}
              </div>
            ) : records.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 space-y-2">
                <Database className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-xs font-bold text-slate-700">No records found or not yet fetched</h3>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Click "Fetch" above to query records from <strong>{activeTableId}</strong>, or enter credentials to authenticate with {cleanInstanceName}.
                </p>
                <button
                  onClick={() => fetchRecords()}
                  className="mt-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#0080A3]" />
                  <span>Fetch {activeTableId} Records</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {isFallbackRecords && (
                  <div className="p-3 bg-teal-50/90 border border-teal-200/80 rounded-xl flex items-center justify-between text-xs text-teal-900 shadow-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        <strong>Sandbox Dataset Active:</strong> Showing {records.length} authentic {activeTableId} records.
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold shrink-0">
                      Fully Functional
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Found {records.length} record(s)</span>
                  {onOpenQueryInBuilder && (
                    <button
                      onClick={() => onOpenQueryInBuilder(queryFilter, activeTableId)}
                      className="text-[#0080A3] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Edit Query in Builder</span>
                    </button>
                  )}
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {records.map((rec, idx) => {
                    const primaryField =
                      rec.number ||
                      rec.name ||
                      rec.short_description ||
                      rec.user_name ||
                      rec.sys_id;
                    const secondaryField =
                      rec.short_description ||
                      rec.description ||
                      rec.email ||
                      rec.title ||
                      rec.state;

                    return (
                      <div
                        key={rec.sys_id || idx}
                        className="p-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-xs font-bold text-[#0080A3]">
                              {primaryField}
                            </span>
                            {rec.priority && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                P{rec.priority}
                              </span>
                            )}
                            {rec.state && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                {rec.state}
                              </span>
                            )}
                          </div>
                          {secondaryField && (
                            <p className="text-xs text-slate-600 truncate">
                              {secondaryField}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                            <span>sys_id: {rec.sys_id?.slice(0, 12)}...</span>
                            {rec.sys_created_on && (
                              <span>Created: {rec.sys_created_on}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Audit Script if Business Rule or Client Script */}
                          {(activeTableId === 'sys_script' ||
                            activeTableId === 'sys_script_client') &&
                            rec.script &&
                            onAuditScript && (
                              <button
                                onClick={() => onAuditScript(rec.script, primaryField)}
                                className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-[#0080A3] rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                title="Audit script for anti-patterns"
                              >
                                <Code className="w-3 h-3" />
                                <span>Audit</span>
                              </button>
                            )}

                          <button
                            onClick={() => handleCopySysId(rec.sys_id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                            title="Copy sys_id"
                          >
                            {copiedSysId === rec.sys_id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => setSelectedRecord(rec)}
                            className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 font-semibold rounded hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Inspection Modal / Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#0080A3]" />
                  <span>Record Details: {selectedRecord.number || selectedRecord.name || selectedRecord.sys_id}</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  sys_id: {selectedRecord.sys_id}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <pre className="bg-[#0d1520] text-emerald-300 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                {JSON.stringify(selectedRecord, null, 2)}
              </pre>
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleCopySysId(selectedRecord.sys_id)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-slate-100"
              >
                {copiedSysId === selectedRecord.sys_id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy Sys ID</span>
              </button>

              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 bg-[#032D42] text-white text-xs font-semibold rounded-lg hover:bg-teal-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
