import React, { useState } from 'react';
import { HORIZON_TOKENS } from '../data/servicenowData';
import { HorizonToken } from '../types';
import { 
  Palette, 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  Info,
  Layers
} from 'lucide-react';

interface TokensInspectorProps {
  onAskLaya: (prompt: string) => void;
}

export const TokensInspector: React.FC<TokensInspectorProps> = ({ onAskLaya }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const categories = ['All', 'Colors', 'Alerts & Severity', 'Components', 'Spacing', 'Elevation'];

  const filteredTokens = HORIZON_TOKENS.filter((token) => {
    const matchesCat = selectedCategory === 'All' || token.category === selectedCategory;
    const matchesSearch =
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (token: HorizonToken) => {
    // Format according to ServiceNow Horizon token guidelines: always wrap in rgb() if color
    let copyString = '';
    if (token.previewType === 'color') {
      copyString = `rgb(var(${token.name}, ${token.value}))`;
    } else {
      copyString = `var(${token.name}, ${token.value})`;
    }
    navigator.clipboard.writeText(copyString);
    setCopiedToken(token.name);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-4 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#0080A3]" />
            <h2 className="text-xl font-bold text-slate-900">
              ServiceNow Horizon Design Tokens
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Official Next Experience and UI Builder design tokens. Always wrapped in <code>rgb(var(--now-*, r,g,b))</code> for dark-mode adaptation.
          </p>
        </div>

        <button
          onClick={() =>
            onAskLaya(
              'Explain how to use ServiceNow Horizon design tokens in Next Experience Macroponents and custom UI Builder components.'
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0080A3]" />
          Ask LAYA About Horizon Tokens
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0080A3] text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0080A3]"
          />
        </div>
      </div>

      {/* Tokens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTokens.map((token) => (
          <div
            key={token.name}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-[#0080A3]/50 transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              {/* Category & Preview */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0080A3] bg-teal-50 px-2 py-0.5 rounded">
                  {token.category}
                </span>

                {token.previewType === 'color' && (
                  <div
                    className="w-6 h-6 rounded-md border border-slate-300 shadow-xs"
                    style={{ backgroundColor: `rgb(${token.value})` }}
                  />
                )}
                {token.previewType === 'spacing' && (
                  <div className="h-5 bg-slate-200 rounded flex items-center px-1 text-[10px] font-mono text-slate-600">
                    {token.value}
                  </div>
                )}
                {token.previewType === 'shadow' && (
                  <div
                    className="w-6 h-6 rounded bg-white border border-slate-200"
                    style={{ boxShadow: token.value }}
                  />
                )}
              </div>

              {/* Token Name */}
              <div className="font-mono text-xs font-bold text-slate-900 break-all select-all">
                {token.name}
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {token.description}
              </p>
            </div>

            {/* Token Value and Copy */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-slate-600">
                {token.previewType === 'color' ? `rgb(${token.value})` : token.value}
              </span>

              <button
                onClick={() => handleCopy(token)}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#0080A3] transition-colors cursor-pointer"
              >
                {copiedToken === token.name ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy CSS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTokens.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
          No tokens match your search criteria.
        </div>
      )}
    </div>
  );
};
