import React, { useState, useEffect } from 'react';
import { ActiveSession, Booking } from '../types/ev';
import {
  Zap,
  BatteryCharging,
  Pause,
  Play,
  Square,
  Thermometer,
  Gauge,
  Leaf,
  CheckCircle2,
  Download,
  Share2,
  X,
  Clock,
  DollarSign
} from 'lucide-react';

interface ActiveSessionModalProps {
  session: ActiveSession | null;
  isOpen: boolean;
  onClose: () => void;
  onStopSession: (finalKwh: number, finalCost: number) => void;
}

export const ActiveSessionModal: React.FC<ActiveSessionModalProps> = ({
  session,
  isOpen,
  onClose,
  onStopSession,
}) => {
  if (!isOpen || !session) return null;

  const [currentSoc, setCurrentSoc] = useState<number>(session.batteryPercent);
  const [kwhDelivered, setKwhDelivered] = useState<number>(session.kwhDelivered);
  const [currentCost, setCurrentCost] = useState<number>(session.currentCost);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(session.elapsedSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Dynamic fluctuating power delivery around nominal speed
  const [currentKw, setCurrentKw] = useState<number>(session.powerKw);

  // Live timer effect
  useEffect(() => {
    if (isPaused || isCompleted) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      // Add energy smoothly (every second simulates fast charging)
      // Approx 0.08 kWh per second in demo fast-time
      const energyIncrement = 0.09;
      setKwhDelivered((prev) => {
        const next = Number((prev + energyIncrement).toFixed(2));
        if (next >= session.totalKwhRequired) {
          setIsCompleted(true);
        }
        return next;
      });

      // Update SoC
      setCurrentSoc((prev) => {
        if (prev >= session.targetBatteryPercent) {
          setIsCompleted(true);
          return session.targetBatteryPercent;
        }
        return Math.min(session.targetBatteryPercent, Number((prev + 0.15).toFixed(1)));
      });

      // Update cost
      setCurrentCost((prev) => Number((prev + energyIncrement * 0.38).toFixed(2)));

      // Slight natural fluctuation in kW
      setCurrentKw((prev) => {
        const base = session.powerKw;
        const jitter = Math.floor(Math.random() * 9) - 4;
        return Math.max(20, Math.min(base, base + jitter));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isCompleted, session]);

  const handleStop = () => {
    setIsCompleted(true);
    onStopSession(kwhDelivered, currentCost);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const co2SavedKg = Number((kwhDelivered * 0.42).toFixed(1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wide">
                Live High-Power Charging Telemetry
              </div>
              <h2 className="text-sm font-bold text-white">
                {session.stationName} · Stall {session.stallNumber}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Gauges Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Main Hero Battery SoC Dial */}
          <div className="relative flex flex-col items-center justify-center py-4">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              {/* Radial background circle */}
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-emerald-400 transition-all duration-700 ease-out"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * currentSoc) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              {/* Center Metrics Display */}
              <div className="absolute flex flex-col items-center text-center">
                <BatteryCharging className="w-6 h-6 text-emerald-400 animate-bounce mb-1" />
                <span className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
                  {Math.round(currentSoc)}%
                </span>
                <span className="text-xs text-slate-400 mt-0.5">
                  Target {session.targetBatteryPercent}%
                </span>
              </div>
            </div>

            {/* Glowing Live kW status */}
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 shadow-lg shadow-emerald-500/20">
              <Zap className="w-4 h-4 text-emerald-400 fill-current" />
              <span className="text-sm font-mono font-bold text-emerald-300">
                {isPaused ? '0.0' : currentKw} kW
              </span>
              <span className="text-xs text-emerald-400/80">Active Flow</span>
            </div>
          </div>

          {/* Grid of Live Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">Delivered</div>
              <div className="text-sm font-bold font-mono text-white mt-1">
                {kwhDelivered} kWh
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">Duration</div>
              <div className="text-sm font-bold font-mono text-white mt-1">
                {formatTime(elapsedSeconds)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">Running Cost</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
                ${currentCost.toFixed(2)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">CO₂ Avoided</div>
              <div className="text-sm font-bold font-mono text-cyan-400 mt-1">
                {co2SavedKg} kg
              </div>
            </div>
          </div>

          {/* Electrical Specifications Pill Row */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-around text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-500" />
              <span>Voltage: <strong className="text-slate-200 font-mono">{session.voltageV}V</strong></span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <span>Current: <strong className="text-slate-200 font-mono">{session.currentA}A</strong></span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-slate-500" />
              <span>Liquid Cooled Plug</span>
            </div>
          </div>

          {/* Completion summary if reached target */}
          {isCompleted && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Target SoC Reached! Ready for Departure.</span>
              </div>
              <p className="text-xs text-slate-300">
                Total energy delivered: <strong>{kwhDelivered} kWh</strong>. Total settled to your payment card: <strong>${currentCost.toFixed(2)}</strong>.
              </p>
            </div>
          )}

          {/* Remote Actions Controls */}
          <div className="flex items-center gap-3 pt-2">
            {!isCompleted ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                    isPaused
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? 'Resume Charging' : 'Pause Session'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleStop}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop &amp; Unplug</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-all text-center"
              >
                Close &amp; View Digital Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
