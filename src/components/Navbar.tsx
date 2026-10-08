import React from 'react';
import { EVVehicle, Booking } from '../types/ev';
import {
  Zap,
  Car,
  Calendar,
  Wallet,
  Activity,
  BatteryCharging,
  Compass,
  Bell
} from 'lucide-react';

interface NavbarProps {
  currentVehicle: EVVehicle;
  bookingsCount: number;
  walletBalance: number;
  onOpenVehicles: () => void;
  onOpenBookings: () => void;
  onQuickLocate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentVehicle,
  bookingsCount,
  walletBalance,
  onOpenVehicles,
  onOpenBookings,
  onQuickLocate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 fill-current transform -rotate-6" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white font-mono">
                VOLTFLOW
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold tracking-wide">
                EV Grid
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Availability Active
              </span>
              <span>·</span>
              <span>Online Payment Ready</span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Locate Button */}
          <button
            onClick={onQuickLocate}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nearest 350kW</span>
          </button>

          {/* Active Vehicle Button */}
          <button
            onClick={onOpenVehicles}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition-all text-xs"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Car className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-white leading-tight">
                {currentVehicle.model.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-400 leading-none">
                {currentVehicle.currentBatteryPercent}% SoC · {currentVehicle.connectorType}
              </div>
            </div>
          </button>

          {/* Wallet Balance Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Pass:</span>
            <span className="text-emerald-400 font-bold">${walletBalance.toFixed(2)}</span>
          </div>

          {/* My Bookings Button */}
          <button
            onClick={onOpenBookings}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition-all"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">My Slots</span>

            {bookingsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                {bookingsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
