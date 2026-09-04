import React, { useState } from 'react';
import { API_CHEAT_SHEET } from '../data/servicenowData';
import { BookOpen, Search, Sparkles, Copy, Check, Terminal } from 'lucide-react';

interface ApiReferenceProps {
  onAskLaya: (prompt: string) => void;
}

export const ApiReference: React.FC<ApiReferenceProps> = ({ onAskLaya }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const filteredCategories = API_CHEAT_SHEET.map((cat) => {
    const items = cat.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...cat, items };
  }).filter((cat) => cat.items.length > 0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0080A3]" />
            <h2 className="text-xl font-bold text-slate-900">
              ServiceNow Platform API Quick Reference
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Essential server-side, client-side, and Service Portal API syntax patterns for certified developers.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search APIs, classes, methods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0080A3]"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {filteredCategories.map((cat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0080A3]" />
              <span>{cat.category}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cat.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 hover:border-[#0080A3]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 text-[#0080A3]">
                      {item.name}
                    </span>
                    <button
                      onClick={() => handleCopy(item.desc, `${idx}-${itemIdx}`)}
                      className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Copy syntax"
                    >
                      {copiedItem === `${idx}-${itemIdx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>

                  <button
                    onClick={() =>
                      onAskLaya(
                        `Show comprehensive code examples and best practice usage for ServiceNow API: ${item.name}`
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#0080A3] hover:underline pt-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Ask LAYA for code examples</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
