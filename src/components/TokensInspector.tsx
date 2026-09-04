import React, { useState } from 'react';
import { Palette, Copy, Check, Search } from 'lucide-react';
import { HORIZON_TOKENS } from '../data/servicenowData';

export const TokensInspector: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const categories = ['All', 'Colors', 'Alerts & Severity', 'Spacing', 'Elevation'];

  const filteredTokens = HORIZON_TOKENS.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesQuery =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.value.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleCopy = (tokenName: string) => {
    navigator.clipboard.writeText(`var(${tokenName})`);
    setCopiedToken(tokenName);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-teal-50 text-[#0080A3]">
              <Palette className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#032D42]">
              Next Experience / Horizon Design Tokens
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Inspect official ServiceNow Next Experience (Horizon) CSS variables for brand colors, alerts, spacing, and elevation.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tokens..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#0080A3] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Token Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTokens.map((token) => (
          <div
            key={token.name}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:border-teal-300 transition-all space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {token.category}
                </span>
                <button
                  onClick={() => handleCopy(token.name)}
                  className="flex items-center gap-1 text-[11px] text-[#0080A3] hover:text-[#032D42] font-semibold cursor-pointer"
                  title="Copy var() syntax"
                >
                  {copiedToken === token.name ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedToken === token.name ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Visual preview according to type */}
              <div className="flex items-center gap-3 mb-2.5">
                {token.previewType === 'color' && (
                  <div
                    className="w-9 h-9 rounded-xl border border-slate-200 shadow-inner shrink-0"
                    style={{ backgroundColor: token.value }}
                  />
                )}
                {token.previewType === 'spacing' && (
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    <div
                      className="bg-teal-600 rounded"
                      style={{ width: token.value, height: token.value }}
                    />
                  </div>
                )}
                {token.previewType === 'shadow' && (
                  <div
                    className="w-9 h-9 rounded-xl bg-white shrink-0 border border-slate-100"
                    style={{ boxShadow: token.value }}
                  />
                )}

                <div className="min-w-0">
                  <div className="font-mono text-xs font-bold text-slate-800 truncate">
                    {token.value}
                  </div>
                  <div className="font-mono text-[11px] text-teal-700 truncate">
                    {token.name}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {token.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
