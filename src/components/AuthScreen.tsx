import React, { useState } from 'react';
import { Bot, Shield, ArrowRight, Lock, Mail, Terminal, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: (email: string, name: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn }) => {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('o0JD1cAn*cU+');
  const [name, setName] = useState('Enterprise Architect');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignIn(email, name || 'Enterprise Admin');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021F2D] via-[#032D42] to-[#01141F] flex flex-col justify-center items-center p-4 relative overflow-hidden text-white font-sans">
      {/* Background Decorative Grids & Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0080a312_1px,transparent_1px),linear-gradient(to_bottom,#0080a312_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0080A3] to-teal-400 shadow-xl ring-4 ring-teal-500/20 mb-4 animate-pulse">
            <Bot className="w-9 h-9 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-widest">
              DeepKorce Enterprise
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            LAYA — ServiceNow Autonomous Orchestrator
          </h1>
          <p className="text-sm text-teal-200/80 font-medium">
            DeepKorce Next-Gen Enterprise Architecture & PDI Sync Studio
          </p>
        </div>

        {/* Sign-In Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-slate-950 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
            Secure Enterprise Gateway
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-teal-300 mb-1.5">
                Full Name / Persona
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Shield className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all font-medium"
                  placeholder="e.g. Enterprise Architect"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-teal-300 mb-1.5">
                Enterprise Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all font-medium"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-teal-300 mb-1.5">
                PDI Basic Auth Password / Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all font-mono"
                  placeholder="••••••••••••"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Connected to <span className="text-teal-300 font-mono">dev442469.service-now.com</span> (Basic Auth)
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#0080A3] to-teal-500 hover:from-[#006d8a] hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating with dev442469...</span>
                </>
              ) : (
                <>
                  <span>Open Platform Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Features Footer */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-3 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>DeepKorce AI Parser</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Update Set Governance</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          LAYA Autonomous ServiceNow Engine • Powered by DeepKorce
        </p>
      </div>
    </div>
  );
};
