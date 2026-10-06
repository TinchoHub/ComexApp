import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedProvider: string;
  onProviderChange: (value: string) => void;
  providers: string[];
  totalCount: number;
}

export const FilterBar: React.FC<Props> = ({
  searchTerm,
  onSearchChange,
  selectedProvider,
  onProviderChange,
  providers,
  totalCount,
}) => {
  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs mb-5 flex items-center justify-between flex-wrap gap-3">
      {/* Search & Provider Select */}
      <div className="flex items-center gap-3 flex-1 min-w-[280px]">
        {/* Search input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por Item o N° Despacho..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Provider Dropdown */}
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedProvider}
            onChange={(e) => onProviderChange(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todos los Proveedores ({totalCount})</option>
            {providers.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Provider Quick Pills */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <span className="text-[11px] text-slate-400 hidden lg:inline mr-1">Rápido:</span>
        <button
          onClick={() => onProviderChange('ALL')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
            selectedProvider === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos ({totalCount})
        </button>
        {providers.map((prov) => (
          <button
            key={prov}
            onClick={() => onProviderChange(prov)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              selectedProvider === prov
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {prov}
          </button>
        ))}
      </div>
    </div>
  );
};
