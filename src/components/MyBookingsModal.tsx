import React, { useState } from 'react';
import { Booking } from '../types/ev';
import {
  X,
  Calendar,
  Clock,
  Zap,
  QrCode,
  ShieldAlert,
  ArrowRight,
  FileText,
  Trash2,
  CheckCircle2,
  Leaf,
  Download,
  AlertCircle
} from 'lucide-react';

interface MyBookingsModalProps {
  bookings: Booking[];
  isOpen: boolean;
  onClose: () => void;
  onCancelBooking: (bookingId: string) => void;
  onStartSession: (booking: Booking) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  bookings,
  isOpen,
  onClose,
  onCancelBooking,
  onStartSession,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [selectedPass, setSelectedPass] = useState<Booking | null>(null);
  const [showCancelConfirmId, setShowCancelConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'active'
  );
  const historyBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wide">
              Manage Reservations &amp; Passes
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">My Charging Sessions</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-4 bg-slate-950/40 shrink-0">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Upcoming / Active</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">
              {upcomingBookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Charging History</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">
              {historyBookings.length}
            </span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'upcoming' && (
            <>
              {upcomingBookings.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Zap className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-medium text-slate-300">No active reservations right now</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Choose any station from the map to reserve a stall ahead of time and avoid queues.
                  </p>
                </div>
              ) : (
                upcomingBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {bk.bookingCode}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs text-slate-400">{bk.date}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-0.5">{bk.stationName}</h4>
                        <p className="text-xs text-slate-400">{bk.stationAddress}</p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                        <span className="text-xs text-slate-400 font-mono">
                          Stall {bk.stallNumber} ({bk.connectorType})
                        </span>
                        <span className="text-sm font-mono font-bold text-emerald-400">
                          {bk.powerKw} kW DC
                        </span>
                      </div>
                    </div>

                    {/* Telemetry info row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Time Slot</span>
                        <span className="font-semibold text-white">
                          {bk.startTime} - {bk.endTime}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Stall Unlock PIN</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {bk.unlockPin}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Estimated Energy</span>
                        <span className="font-semibold text-white">
                          ~{bk.estimatedKwh} kWh
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Total Hold</span>
                        <span className="font-mono font-bold text-white">
                          ${bk.pricing.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        {showCancelConfirmId === bk.id ? (
                          <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-800/80 p-1.5 rounded-xl text-xs">
                            <span className="text-rose-300">Confirm cancel? (Hold refunded)</span>
                            <button
                              onClick={() => {
                                onCancelBooking(bk.id);
                                setShowCancelConfirmId(null);
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium"
                            >
                              Yes, Cancel
                            </button>
                            <button
                              onClick={() => setShowCancelConfirmId(null)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowCancelConfirmId(bk.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 py-1.5 px-2.5 rounded-lg hover:bg-rose-950/30 transition-colors flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Cancel Slot</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPass(bk)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Show QR Pass</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onStartSession(bk);
                          }}
                          className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>Plug-In &amp; Start Charge</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              {historyBookings.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm">No previous charging history recorded yet.</p>
                </div>
              ) : (
                historyBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{bk.stationName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            bk.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {bk.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-1">
                        {bk.date} · {bk.startTime} · Stall {bk.stallNumber} · {bk.estimatedKwh} kWh
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        ${bk.pricing.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">{bk.paymentMethod.replace('_', ' ')}</div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* QR Pass popover if opened */}
        {selectedPass && (
          <div className="fixed inset-0 z-60 bg-slate-950/90 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-emerald-400">{selectedPass.bookingCode}</span>
                <button
                  onClick={() => setSelectedPass(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-xl">
                <QrCode className="w-40 h-40 text-slate-950" />
              </div>

              <div>
                <div className="text-xs text-slate-400">Charger Unlock PIN</div>
                <div className="text-2xl font-mono font-extrabold text-emerald-400 tracking-wider">
                  {selectedPass.unlockPin}
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Hold QR code to scanner on Stall {selectedPass.stallNumber} at {selectedPass.stationName}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
