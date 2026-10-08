import React, { useState } from 'react';
import { EVVehicle, ConnectorType } from '../types/ev';
import { DEFAULT_VEHICLES } from '../data/vehicles';
import { X, Car, Check, Plus, BatteryCharging, Zap } from 'lucide-react';

interface VehicleManagerModalProps {
  currentVehicle: EVVehicle;
  allVehicles: EVVehicle[];
  isOpen: boolean;
  onClose: () => void;
  onSelectVehicle: (vehicle: EVVehicle) => void;
  onAddVehicle: (newVehicle: EVVehicle) => void;
}

export const VehicleManagerModal: React.FC<VehicleManagerModalProps> = ({
  currentVehicle,
  allVehicles,
  isOpen,
  onClose,
  onSelectVehicle,
  onAddVehicle,
}) => {
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Form fields for new custom vehicle
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [batteryKwh, setBatteryKwh] = useState<number>(75);
  const [maxKw, setMaxKw] = useState<number>(150);
  const [connector, setConnector] = useState<ConnectorType>('CCS2');
  const [plate, setPlate] = useState<string>('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model) return;

    const newVeh: EVVehicle = {
      id: `custom-${Date.now()}`,
      make,
      model,
      year: 2024,
      batteryCapacityKwh: batteryKwh,
      maxChargingSpeedKw: maxKw,
      connectorType: connector,
      usableRangeKm: Math.round(batteryKwh * 5.8),
      currentBatteryPercent: 25,
      targetBatteryPercent: 85,
      licensePlate: plate || 'EV-NEW-01',
    };

    onAddVehicle(newVeh);
    onSelectVehicle(newVeh);
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wide">
              Garage &amp; Electric Vehicle Profiles
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">Select Active EV</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] space-y-4">
          {!isAddingNew ? (
            <>
              <div className="space-y-2.5">
                {allVehicles.map((veh) => {
                  const isSelected = veh.id === currentVehicle.id;
                  return (
                    <div
                      key={veh.id}
                      onClick={() => {
                        onSelectVehicle(veh);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {veh.make} {veh.model}
                          </div>
                          <div className="text-xs text-slate-400">
                            {veh.batteryCapacityKwh} kWh · Up to {veh.maxChargingSpeedKw} kW · {veh.connectorType}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-3 border border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/40 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Another Electric Car</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Make / Brand</label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Polestar, Rivian"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. 3 Dual Motor"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Battery Size (kWh)</label>
                  <input
                    type="number"
                    min="20"
                    max="220"
                    value={batteryKwh}
                    onChange={(e) => setBatteryKwh(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max DC Speed (kW)</label>
                  <input
                    type="number"
                    min="20"
                    max="350"
                    value={maxKw}
                    onChange={(e) => setMaxKw(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Port Connector</label>
                  <select
                    value={connector}
                    onChange={(e) => setConnector(e.target.value as ConnectorType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="CCS2">CCS2 (Combo)</option>
                    <option value="NACS">NACS (Tesla)</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                    <option value="Type 2">Type 2 (Mennekes)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">License Plate</label>
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    placeholder="e.g. 7XYZ99"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-semibold"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
