import React, { useState } from 'react';
import { BookOpen, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { API_CHEAT_SHEET } from '../data/servicenowData';

export const ApiReference: React.FC = () => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (idx: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-teal-50 text-[#0080A3]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#032D42]">
              ServiceNow API Cheat Sheet
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Quick-reference patterns for GlideRecord, GlideAggregate, g_form, g_user, and GlideAjax with production best practices.
          </p>
        </div>
      </div>

      {/* Cheat Sheet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {API_CHEAT_SHEET.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.scope === 'Server-Side'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {item.scope}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                </div>
                <button
                  onClick={() => handleCopy(idx, item.code)}
                  className="flex items-center gap-1 text-xs text-[#0080A3] hover:text-[#032D42] font-semibold cursor-pointer"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 mb-3">{item.description}</p>

              <pre className="p-3.5 bg-[#0d1520] text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                {item.code}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
