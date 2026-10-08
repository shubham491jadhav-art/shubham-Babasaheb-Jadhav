import React from 'react';
import { EVStation, Stall } from '../types/ev';
import { Zap, Navigation, Clock, ShieldCheck, ChevronRight, Leaf } from 'lucide-react';

interface StationCardProps {
  station: EVStation;
  isSelected?: boolean;
  onSelect: () => void;
  onBookSlot: () => void;
  onViewDetails: () => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isSelected,
  onSelect,
  onBookSlot,
  onViewDetails,
}) => {
  const availableStalls = station.stalls.filter((s) => s.status === 'available');
  const inUseStalls = station.stalls.filter((s) => s.status === 'in-use');
  const maxKw = Math.max(...station.stalls.map((s) => s.maxPowerKw));

  // Unique connector types present in station
  const connectorTypes = Array.from(new Set(station.stalls.map((s) => s.connectorType)));

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl bg-slate-900 border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-emerald-500/80 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30'
          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
      }`}
    >
      <div>
        {/* Banner with clean unboxed network kicker */}
        <div className="relative h-40 w-full overflow-hidden bg-slate-950">
          <img
            src={station.bannerImage}
            alt={station.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Clean Top Overlay: Unboxed kicker */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
            <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-medium">
              {station.brand}
            </div>

            <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5 text-emerald-400 font-mono font-semibold">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Up to {maxKw} kW</span>
            </div>
          </div>

          {/* Clean Bottom Overlay within Image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                ★ {station.rating}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">({station.reviewsCount} reviews)</span>
            </div>

            {station.greenEnergyPercent === 100 && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-lg">
                <Leaf className="w-3 h-3 text-emerald-400" />
                <span>100% Green Energy</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          {/* Station Title & Distance */}
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold text-base text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                {station.name}
              </h3>
              <span className="text-xs font-mono font-medium text-slate-400 shrink-0">
                {station.distanceKm} km
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {station.address}
            </p>
          </div>

          {/* Live Stall Telemetry Indicator */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    availableStalls.length > 0
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="font-medium text-white">
                  {availableStalls.length} of {station.stalls.length} stalls available
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                {station.is24Hours ? '24/7 Access' : station.openStatus}
              </span>
            </div>

            {/* Micro Stall Grid Visual */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 pt-1">
              {station.stalls.map((stall) => {
                const isAvail = stall.status === 'available';
                const isInUse = stall.status === 'in-use';
                return (
                  <div
                    key={stall.id}
                    title={`${stall.stallNumber}: ${stall.connectorType} ${stall.maxPowerKw}kW (${stall.status})`}
                    className={`px-1.5 py-1 rounded text-center text-[10px] font-mono border transition-all ${
                      isAvail
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                        : isInUse
                        ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-500'
                    }`}
                  >
                    <div className="font-bold leading-none">{stall.stallNumber}</div>
                    <div className="text-[9px] opacity-75 mt-0.5 leading-none">
                      {stall.maxPowerKw}k
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connectors & Pricing Meta */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">Plugs:</span>
              <span className="text-slate-300 font-mono text-[11px]">
                {connectorTypes.join(' · ')}
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              <span className="text-emerald-400 font-semibold text-sm">
                ${station.pricingPerKwh.toFixed(2)}
              </span>
              <span className="text-slate-500 text-[11px]">/ kWh</span>
            </div>
          </div>

          {/* Amenities Text List */}
          <div className="text-[11px] text-slate-400 truncate">
            {station.amenities.slice(0, 3).join(' · ')}
            {station.amenities.length > 3 && ` · +${station.amenities.length - 3} more`}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="flex-1 py-2 px-3 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors text-center"
        >
          View Stalls
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBookSlot();
          }}
          className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Reserve Slot</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
