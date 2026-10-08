import React from 'react';
import { StationFilterState, ConnectorType } from '../types/ev';
import { Search, SlidersHorizontal, Zap, MapPin, CheckCircle2, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  filters: StationFilterState;
  onChange: (filters: StationFilterState) => void;
  onReset: () => void;
  viewMode: 'split' | 'grid' | 'map';
  onViewModeChange: (mode: 'split' | 'grid' | 'map') => void;
  totalStations: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  viewMode,
  onViewModeChange,
  totalStations,
}) => {
  const connectors: { label: string; value: 'all' | ConnectorType }[] = [
    { label: 'All Plugs', value: 'all' },
    { label: 'CCS2 (EU/Global)', value: 'CCS2' },
    { label: 'NACS (Tesla)', value: 'NACS' },
    { label: 'CHAdeMO', value: 'CHAdeMO' },
    { label: 'Type 2 AC', value: 'Type 2' },
  ];

  const powerSpeeds = [
    { label: 'All Speeds', value: 0 },
    { label: '50kW+ Fast', value: 50 },
    { label: '150kW+ Rapid', value: 150 },
    { label: '350kW Ultra', value: 300 },
  ];

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3.5">
      {/* Top Search + View Mode row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by station name, street, neighborhood, or city..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort & View Mode Segmented Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-xl">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onChange({ ...filters, sortBy: e.target.value as StationFilterState['sortBy'] })
              }
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="distance" className="bg-slate-900">Sort: Closest First</option>
              <option value="power" className="bg-slate-900">Sort: Highest Power</option>
              <option value="rating" className="bg-slate-900">Sort: Top Rated</option>
              <option value="price" className="bg-slate-900">Sort: Lowest $/kWh</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => onViewModeChange('split')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'split'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Map &amp; List
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid Cards
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'map'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Map
            </button>
          </div>
        </div>
      </div>

      {/* Second row: Plugs & Power Speed filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        {/* Connector Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 font-medium">Connector:</span>
          {connectors.map((conn) => {
            const isActive = filters.connectorType === conn.value;
            return (
              <button
                key={conn.value}
                onClick={() => onChange({ ...filters, connectorType: conn.value })}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {conn.label}
              </button>
            );
          })}
        </div>

        {/* Power Speeds */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 font-medium">Power:</span>
          {powerSpeeds.map((spd) => {
            const isActive = filters.minPowerKw === spd.value;
            return (
              <button
                key={spd.value}
                onClick={() => onChange({ ...filters, minPowerKw: spd.value })}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {spd.label}
              </button>
            );
          })}

          {/* Toggle Available Only */}
          <button
            onClick={() => onChange({ ...filters, onlyAvailable: !filters.onlyAvailable })}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              filters.onlyAvailable
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Available Now
          </button>

          {/* Reset button */}
          {(filters.searchQuery ||
            filters.connectorType !== 'all' ||
            filters.minPowerKw > 0 ||
            filters.onlyAvailable) && (
            <button
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
