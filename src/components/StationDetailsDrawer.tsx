import React from 'react';
import { EVStation, Stall } from '../types/ev';
import {
  X,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  Leaf,
  Coffee,
  Wifi,
  Sun,
  BatteryCharging,
  DollarSign,
  AlertCircle,
  Share2,
  Navigation
} from 'lucide-react';

interface StationDetailsDrawerProps {
  station: EVStation | null;
  isOpen: boolean;
  onClose: () => void;
  onBookSlot: (station: EVStation) => void;
}

export const StationDetailsDrawer: React.FC<StationDetailsDrawerProps> = ({
  station,
  isOpen,
  onClose,
  onBookSlot,
}) => {
  if (!isOpen || !station) return null;

  const availableCount = station.stalls.filter((s) => s.status === 'available').length;
  const maxKw = Math.max(...station.stalls.map((s) => s.maxPowerKw));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Banner Image */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-950 shrink-0">
          <img
            src={station.bannerImage}
            alt={station.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-950/70 hover:bg-slate-900 backdrop-blur-md rounded-xl text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Network tag */}
          <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/80 text-xs font-semibold text-slate-200">
            {station.brand}
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-md">
                {station.name}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{station.address}, {station.city}</span>
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-amber-400 block">
                ★ {station.rating} ({station.reviewsCount})
              </span>
              <span className="text-[11px] text-slate-400">{station.distanceKm} km away</span>
            </div>
          </div>
        </div>

        {/* Scrollable details content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Max Speed</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {maxKw} kW DC
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Base Tariff</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                ${station.pricingPerKwh}/kWh
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Availability</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {availableCount}/{station.stalls.length} Free
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Clean Energy</div>
              <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                {station.greenEnergyPercent}%
              </div>
            </div>
          </div>

          {/* Stalls Breakdown */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Station Charging Stalls ({station.stalls.length} Total)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {station.stalls.map((stall) => {
                const isAvail = stall.status === 'available';
                const isInUse = stall.status === 'in-use';

                return (
                  <div
                    key={stall.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-white">
                          {stall.stallNumber}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {stall.connectorType} · {stall.maxPowerKw} kW
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-medium ${
                          isAvail
                            ? 'text-emerald-400'
                            : isInUse
                            ? 'text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {isAvail
                          ? 'Available'
                          : isInUse
                          ? `In Use (${stall.estimatedAvailableInMins}m left)`
                          : 'Maintenance'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amenities & Perks */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Site Amenities &amp; Features
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {station.amenities.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-300"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational hours & pricing note */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium">Hours of Operation:</span>
              <span>{station.is24Hours ? '24 Hours / 7 Days' : station.openStatus}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium">Parking Fee:</span>
              <span>{station.parkingFeeText}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium">Peak Hours:</span>
              <span>{station.peakHoursInfo}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium">Idle Fee:</span>
              <span>${station.idleFeePerMin.toFixed(2)}/min after 10-min grace</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-mono">
            <span className="text-slate-400">Rate: </span>
            <span className="text-emerald-400 font-bold">${station.pricingPerKwh}/kWh</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onBookSlot(station);
            }}
            className="py-2.5 px-6 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
          >
            <BatteryCharging className="w-4 h-4" />
            <span>Book a Slot at this Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
};
