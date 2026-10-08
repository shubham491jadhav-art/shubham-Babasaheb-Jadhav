import React, { useState } from 'react';
import { EVStation } from '../types/ev';
import { Zap, Navigation, Compass, Layers, Plus, Minus, BatteryCharging } from 'lucide-react';

interface InteractiveMapProps {
  stations: EVStation[];
  selectedStationId: string | null;
  onSelectStation: (station: EVStation) => void;
  onBookSlot: (station: EVStation) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  onBookSlot,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapMode, setMapMode] = useState<'streets' | 'satellite'>('streets');

  const selectedStation = stations.find((s) => s.id === selectedStationId);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(1.4, Math.max(0.85, Number((prev + delta).toFixed(2)))));
  };

  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[640px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* Top Map HUD overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl flex items-center gap-2.5 text-xs text-slate-200 shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white tracking-wide">Live Grid Telemetry</span>
          <span className="text-slate-500 font-mono">·</span>
          <span className="text-slate-400">{stations.length} Active Hubs</span>
        </div>

        <div className="hidden sm:flex bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl text-xs">
          <button
            onClick={() => setMapMode('streets')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              mapMode === 'streets'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vector Grid
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              mapMode === 'satellite'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Night Radar
          </button>
        </div>
      </div>

      {/* Map Controls: Zoom & Location */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl overflow-hidden flex flex-col shadow-lg">
          <button
            onClick={() => handleZoom(0.15)}
            className="p-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border-b border-slate-800"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setZoomLevel(1)}
          className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-lg"
          title="Reset View"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Map Canvas Visual Area */}
      <div
        className="relative flex-1 w-full h-full overflow-hidden transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
      >
        <svg
          className="w-full h-full absolute inset-0 pointer-events-none"
          viewBox="0 0 1000 700"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#082f49" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="parkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
            </linearGradient>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Grid background */}
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Bay Area Water / Shoreline curve */}
          <path
            d="M 680 0 C 720 180, 780 320, 950 480 L 1000 480 L 1000 0 Z"
            fill="url(#waterGrad)"
            stroke="#0369a1"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Parks & Green zones */}
          <path
            d="M 50 80 Q 150 60 220 120 T 180 260 Q 90 240 50 180 Z"
            fill="url(#parkGrad)"
            stroke="#10b981"
            strokeWidth="0.75"
            strokeOpacity="0.4"
          />
          <path
            d="M 120 440 Q 240 420 280 540 T 160 640 Q 90 580 120 440 Z"
            fill="url(#parkGrad)"
            stroke="#10b981"
            strokeWidth="0.75"
            strokeOpacity="0.4"
          />

          {/* Major Road Arterials / Highway Network */}
          <path
            d="M -50 200 L 1050 200"
            stroke="#334155"
            strokeWidth="3.5"
            strokeOpacity="0.6"
          />
          <path
            d="M -50 480 L 1050 480"
            stroke="#334155"
            strokeWidth="3.5"
            strokeOpacity="0.6"
          />
          <path
            d="M 480 -50 L 480 750"
            stroke="#334155"
            strokeWidth="4"
            strokeOpacity="0.7"
          />
          <path
            d="M 220 -50 L 220 750"
            stroke="#1e293b"
            strokeWidth="2.5"
          />
          <path
            d="M 720 -50 L 720 750"
            stroke="#1e293b"
            strokeWidth="2.5"
          />

          {/* Diagonal Highway 101 */}
          <path
            d="M -50 650 Q 400 380 950 50"
            fill="none"
            stroke="#475569"
            strokeWidth="4"
            strokeDasharray="12 4"
            strokeOpacity="0.5"
          />

          {/* Power Transmission line effect */}
          <path
            d="M 200 126 L 480 238 L 620 154 L 380 406"
            fill="none"
            stroke="#059669"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            strokeOpacity="0.35"
          />
        </svg>

        {/* User Vehicle Position Marker */}
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: '42%', top: '48%' }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-12 h-12 bg-cyan-500/20 rounded-full animate-ping opacity-60"></span>
            <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/50 border-2 border-white">
              <Navigation className="w-3.5 h-3.5 fill-current transform rotate-45" />
            </div>
            <div className="absolute top-8 px-2 py-0.5 rounded bg-slate-900/95 border border-cyan-500/50 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-md">
              Your Vehicle · 1.4km away
            </div>
          </div>
        </div>

        {/* Station Markers */}
        {stations.map((st) => {
          const isSelected = st.id === selectedStationId;
          const availableCount = st.stalls.filter((s) => s.status === 'available').length;
          const totalCount = st.stalls.length;
          const maxKw = Math.max(...st.stalls.map((s) => s.maxPowerKw));
          const hasUltraFast = maxKw >= 300;

          return (
            <div
              key={st.id}
              onClick={() => onSelectStation(st)}
              className="absolute z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 group"
              style={{
                left: `${st.coordinates.mapX}%`,
                top: `${st.coordinates.mapY}%`,
              }}
            >
              {/* Pulsing ring for high capacity stations */}
              {availableCount > 0 && (
                <div
                  className={`absolute -inset-2 rounded-full opacity-40 animate-pulse ${
                    hasUltraFast ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
              )}

              {/* Station Node Badge */}
              <div
                className={`relative px-2.5 py-1.5 rounded-xl border flex items-center gap-2 shadow-xl backdrop-blur-md transition-all ${
                  isSelected
                    ? 'bg-emerald-950/95 border-emerald-400 ring-2 ring-emerald-400/50 scale-105'
                    : availableCount > 0
                    ? 'bg-slate-900/95 border-slate-700 hover:border-emerald-500 text-slate-100'
                    : 'bg-slate-900/90 border-rose-800 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    hasUltraFast
                      ? 'bg-amber-500 text-slate-950'
                      : availableCount > 0
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-white max-w-[120px] truncate">
                      {st.name.split(' - ')[0]}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {maxKw}kW
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span
                      className={`font-semibold ${
                        availableCount > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {availableCount}/{totalCount} free
                    </span>
                    <span>·</span>
                    <span>${st.pricingPerKwh.toFixed(2)}/kWh</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Station Bottom Quick Drawer (When Station clicked on map) */}
      {selectedStation && (
        <div className="relative z-30 p-4 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
              <img
                src={selectedStation.bannerImage}
                alt={selectedStation.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1 bg-black/60 rounded px-1 text-[9px] font-mono text-emerald-300">
                {selectedStation.brand.split(' ')[0]}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white truncate max-w-[280px]">
                  {selectedStation.name}
                </h4>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  ★ {selectedStation.rating}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[320px]">
                {selectedStation.address} · {selectedStation.distanceKm} km away
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300">
                <span className="text-emerald-400 font-medium">
                  {selectedStation.stalls.filter((s) => s.status === 'available').length} of{' '}
                  {selectedStation.stalls.length} stalls free now
                </span>
                <span>·</span>
                <span>${selectedStation.pricingPerKwh}/kWh</span>
                <span>·</span>
                <span className="text-slate-400">{selectedStation.parkingFeeText}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => onSelectStation(selectedStation)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Inspect Stalls & Specs
            </button>
            <button
              onClick={() => onBookSlot(selectedStation)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <BatteryCharging className="w-3.5 h-3.5" />
              Book Slot Now
            </button>
          </div>
        </div>
      )}

      {/* Legend overlay bottom-left */}
      <div className="hidden md:flex absolute bottom-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-[11px] text-slate-300 items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Ultra-Fast (350kW)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
};
