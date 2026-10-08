import React, { useState, useMemo } from 'react';
import { EVStation, Stall, TimeSlot, EVVehicle, Booking, PaymentMethodType } from '../types/ev';
import {
  X,
  Zap,
  Calendar,
  Clock,
  Car,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  QrCode,
  ArrowRight,
  Info,
  Sparkles,
  Lock,
  Wallet,
  Smartphone,
  Tag,
  AlertCircle
} from 'lucide-react';

interface BookingModalProps {
  station: EVStation;
  selectedVehicle: EVVehicle;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  onStartSessionImmediate: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  station,
  selectedVehicle,
  isOpen,
  onClose,
  onBookingSuccess,
  onStartSessionImmediate,
}) => {
  // Step tracker: 1 = Stall & Slot, 2 = Vehicle & Range Calc, 3 = Payment Gateway, 4 = Confirmation Ticket
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 state
  const [selectedStallId, setSelectedStallId] = useState<string>(
    station.stalls.find((s) => s.status === 'available')?.id || station.stalls[0]?.id
  );
  const selectedStall = station.stalls.find((s) => s.id === selectedStallId) || station.stalls[0];

  const [bookingDate, setBookingDate] = useState<'today' | 'tomorrow'>('today');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    selectedStall?.slots.find((s) => s.isAvailable)?.id || selectedStall?.slots[0]?.id || ''
  );

  // Step 2 state: vehicle battery adjustment
  const [currentSoc, setCurrentSoc] = useState<number>(selectedVehicle.currentBatteryPercent);
  const [targetSoc, setTargetSoc] = useState<number>(selectedVehicle.targetBatteryPercent);

  // Step 3 state: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('credit_card');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 9821');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvc, setCardCvc] = useState<string>('842');
  const [cardHolder, setCardHolder] = useState<string>('Alex Morgan');
  const [saveCard, setSaveCard] = useState<boolean>(true);

  // Promo code
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState<string>('');

  // Payment processing status
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentPhase, setPaymentPhase] = useState<string>('');

  // Created booking upon completion
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  // Selected slot object
  const selectedSlot = selectedStall?.slots.find((s) => s.id === selectedSlotId) || selectedStall?.slots[0];

  // Energy & Price calculations
  const batteryCapacity = selectedVehicle.batteryCapacityKwh;
  const socDiffPercent = Math.max(5, targetSoc - currentSoc);
  const estimatedKwh = Number(((batteryCapacity * socDiffPercent) / 100).toFixed(1));

  // Charging time estimate in minutes: (kWh / effective kW) * 60 with taper curve
  const effectiveKw = Math.min(selectedVehicle.maxChargingSpeedKw, selectedStall?.maxPowerKw || 150);
  const estimatedMinutes = Math.max(
    15,
    Math.round((estimatedKwh / effectiveKw) * 60 * 1.12)
  );

  // Range added
  const rangePerKwh = selectedVehicle.usableRangeKm / selectedVehicle.batteryCapacityKwh;
  const estimatedRangeAddedKm = Math.round(estimatedKwh * rangePerKwh);

  // Costs
  const energyCost = estimatedKwh * station.pricingPerKwh * (selectedSlot?.priceModifier || 1.0);
  const slotReservationFee = 1.50; // standard reservation hold fee
  const subtotal = energyCost + slotReservationFee;
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const taxes = (subtotal - discountAmount) * 0.0825; // 8.25% local utility tax
  const totalAmount = Math.max(1.0, subtotal - discountAmount + taxes);

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'VOLT20') {
      setAppliedPromo({ code: 'VOLT20', discountPercent: 20 });
    } else if (code === 'ECODRIVE' || code === 'GREENPOWER') {
      setAppliedPromo({ code: code, discountPercent: 15 });
    } else {
      setPromoError('Invalid promo code. Try "VOLT20" for 20% off.');
    }
  };

  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    setPaymentPhase('Verifying secure payment token with PCI-DSS Gateway...');

    setTimeout(() => {
      setPaymentPhase('Authenticating 3D Secure 2.0 with issuing bank...');
    }, 900);

    setTimeout(() => {
      setPaymentPhase('Reserving slot & securing Stall Lock Pin...');
    }, 1800);

    setTimeout(() => {
      setIsProcessingPayment(false);
      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        bookingCode: `VF-${Math.floor(1000 + Math.random() * 9000)}-${station.city.slice(0, 2).toUpperCase()}`,
        stationId: station.id,
        stationName: station.name,
        stationAddress: station.address,
        stallId: selectedStall.id,
        stallNumber: selectedStall.stallNumber,
        connectorType: selectedStall.connectorType,
        powerKw: selectedStall.maxPowerKw,
        date: bookingDate === 'today' ? 'Today, Oct 8' : 'Tomorrow, Oct 9',
        startTime: selectedSlot?.startTime || '11:00',
        endTime: selectedSlot?.endTime || '11:45',
        durationMinutes: 45,
        vehicleModel: `${selectedVehicle.make} ${selectedVehicle.model}`,
        licensePlate: selectedVehicle.licensePlate || 'EV-882-YL',
        estimatedKwh,
        targetSocPercent: targetSoc,
        status: 'confirmed',
        unlockPin: String(Math.floor(1000 + Math.random() * 9000)),
        paymentMethod,
        pricing: {
          energyEstimate: Number(energyCost.toFixed(2)),
          reservationFee: slotReservationFee,
          taxes: Number(taxes.toFixed(2)),
          discount: Number(discountAmount.toFixed(2)),
          totalAmount: Number(totalAmount.toFixed(2)),
        },
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConfirmedBooking(newBooking);
      setCurrentStep(4);
      onBookingSuccess(newBooking);
    }, 2600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header with Step Progress */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Slot Reservation &amp; Checkout
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Step {currentStep} of 4</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5 truncate max-w-md">
              {station.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-4 border-b border-slate-800 text-[11px] font-medium shrink-0">
          {[
            { num: 1, label: 'Stall & Slot' },
            { num: 2, label: 'Vehicle & SoC' },
            { num: 3, label: 'Online Payment' },
            { num: 4, label: 'Confirmation' },
          ].map((s) => (
            <div
              key={s.num}
              className={`py-2 px-2 text-center border-b-2 transition-all ${
                currentStep === s.num
                  ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10 font-semibold'
                  : currentStep > s.num
                  ? 'border-emerald-600/50 text-slate-400'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <span className="hidden sm:inline">Step {s.num}: </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Stall & Slot Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Stall Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
                  1. Select Charging Stall &amp; Connector
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {station.stalls.map((stall) => {
                    const isSelected = stall.id === selectedStallId;
                    const isAvail = stall.status === 'available';
                    const isCompatible =
                      stall.connectorType === selectedVehicle.connectorType ||
                      stall.connectorType === 'CCS2';

                    return (
                      <div
                        key={stall.id}
                        onClick={() => {
                          setSelectedStallId(stall.id);
                          // select first available slot
                          const firstAvail = stall.slots.find((s) => s.isAvailable);
                          if (firstAvail) setSelectedSlotId(firstAvail.id);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/40'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                              <Zap className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-white">
                                {stall.stallNumber}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {stall.connectorType}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-emerald-400">
                              {stall.maxPowerKw} kW
                            </div>
                            <div
                              className={`text-[10px] font-medium ${
                                isAvail ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {isAvail ? 'Ready Now' : 'In Use'}
                            </div>
                          </div>
                        </div>

                        {/* Compatibility indicator */}
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span>
                            {isCompatible ? '✓ Matches ' + selectedVehicle.make : 'May require adapter'}
                          </span>
                          <span>${station.pricingPerKwh}/kWh</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time Slot Selector */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    2. Select Reservation Slot
                  </label>

                  {/* Day picker buttons */}
                  <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setBookingDate('today')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        bookingDate === 'today'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Today (Oct 8)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingDate('tomorrow')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors ${
                        bookingDate === 'tomorrow'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tomorrow (Oct 9)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedStall.slots.map((slot) => {
                    const isSelected = slot.id === selectedSlotId;
                    return (
                      <button
                        type="button"
                        key={slot.id}
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-semibold'
                            : slot.isAvailable
                            ? 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-emerald-500/60'
                            : 'bg-slate-950/30 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono">{slot.startTime} - {slot.endTime}</span>
                        </div>
                        <div className="text-[10px] mt-1 flex items-center justify-between opacity-80">
                          <span>{slot.isAvailable ? 'Available' : 'Booked'}</span>
                          {slot.priceModifier && slot.priceModifier > 1 ? (
                            <span>Peak (1.15x)</span>
                          ) : (
                            <span>Standard</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grace Period & Station Policy info note */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">15-Minute Grace Period:</span> Your reserved stall is guaranteed and held for 15 minutes past start time. Automatic remote plug unlock PIN provided upon booking.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Vehicle & Range Calculator */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Selected Vehicle Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                    </h4>
                    <p className="text-xs text-slate-400">
                      Plate: {selectedVehicle.licensePlate} · Battery: {selectedVehicle.batteryCapacityKwh} kWh · Max Speed: {selectedVehicle.maxChargingSpeedKw} kW
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-400 font-mono font-semibold">
                    {selectedVehicle.connectorType}
                  </span>
                </div>
              </div>

              {/* Smart SoC Sliders */}
              <div className="space-y-5 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-300 font-medium">Current Battery (Arrival SoC)</span>
                    <span className="font-mono text-amber-400 font-bold">{currentSoc}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={currentSoc}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCurrentSoc(val);
                      if (val >= targetSoc) setTargetSoc(Math.min(100, val + 15));
                    }}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300 font-medium">Target Battery (Departure SoC)</span>
                      <span className="text-[10px] text-slate-500">(80% recommended for battery life)</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">{targetSoc}%</span>
                  </div>
                  <input
                    type="range"
                    min={currentSoc + 5}
                    max="100"
                    value={targetSoc}
                    onChange={(e) => setTargetSoc(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Quick 80% and 100% buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTargetSoc(80)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Quick 80% (Fastest Charge)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetSoc(90)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Road Trip 90%
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetSoc(100)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Full 100%
                  </button>
                </div>
              </div>

              {/* Live Charging Telemetry Estimates */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">Energy Needed</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    +{estimatedKwh} kWh
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">Estimated Duration</div>
                  <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                    ~{estimatedMinutes} mins
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">Range Added</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                    +{estimatedRangeAddedKm} km
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Online Payment Gateway */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Payment Methods Tabs */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-medium">Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'apple_pay'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-xs font-medium">Apple Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('google_pay')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'google_pay'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-medium">Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('rfid_wallet')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'rfid_wallet'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="text-xs font-medium">VoltPass RFID</span>
                  </button>
                </div>
              </div>

              {/* Payment Detail Form */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-3.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="rounded accent-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-300">
                      Save card for 1-tap plug &amp; charge at all VoltFlow hubs
                    </span>
                  </label>
                </div>
              )}

              {paymentMethod === 'apple_pay' && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                  <Smartphone className="w-8 h-8 text-white mx-auto" />
                  <div className="text-sm font-semibold text-white">Apple Pay Ready</div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Touch ID / Face ID verification will be requested to authorize ${totalAmount.toFixed(2)}.
                  </p>
                </div>
              )}

              {paymentMethod === 'google_pay' && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-sm font-semibold text-white">Google Pay Ready</div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Authorize through your default Google Pay payment profile.
                  </p>
                </div>
              )}

              {paymentMethod === 'rfid_wallet' && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-300 font-medium">VoltPass Card Balance</div>
                    <div className="text-sm font-mono font-bold text-emerald-400">$45.00</div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-emerald-400 h-1.5 rounded-full w-2/3" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Includes 5% Clean Energy Member cash-back discount on this session.
                  </p>
                </div>
              )}

              {/* Promo Code Input */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Have a Promo / Voucher Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. VOLT20 or ECODRIVE"
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs uppercase font-mono text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Code {appliedPromo.code} applied ({appliedPromo.discountPercent}% discount)
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {promoError}
                  </p>
                )}
              </div>

              {/* Itemized Order Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Energy Estimate ({estimatedKwh} kWh @ ${station.pricingPerKwh}/kWh)</span>
                  <span className="font-mono text-slate-200">${energyCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Slot Hold &amp; Network Fee</span>
                  <span className="font-mono text-slate-200">${slotReservationFee.toFixed(2)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Discount ({appliedPromo.code})</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-400">
                  <span>Estimated Utility Taxes &amp; Grid Fees</span>
                  <span className="font-mono text-slate-200">${taxes.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-semibold">
                  <span className="text-white">Total Estimated Authorization</span>
                  <span className="font-mono text-emerald-400 text-base">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1">
                  *Only actual kWh delivered at the charger will be billed. Authorization hold automatically settles upon unplugging.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation & Boarding Pass */}
          {currentStep === 4 && confirmedBooking && (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Slot Reservation Confirmed!</h4>
                  <p className="text-xs text-emerald-300/90">
                    Payment authorized successfully. Your charger is reserved and locked for your arrival.
                  </p>
                </div>
              </div>

              {/* Digital Pass / Ticket Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      RESERVATION PASS
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {confirmedBooking.stationName}
                    </h3>
                    <p className="text-xs text-slate-400">{confirmedBooking.stationAddress}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400">PASS CODE</span>
                    <div className="text-sm font-mono font-bold text-emerald-400">
                      {confirmedBooking.bookingCode}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Assigned Stall</span>
                    <span className="font-bold text-white text-sm font-mono">
                      {confirmedBooking.stallNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block">Time Slot</span>
                    <span className="font-bold text-white">
                      {confirmedBooking.startTime} - {confirmedBooking.endTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block">Stall Unlock PIN</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {confirmedBooking.unlockPin}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block">Power Speed</span>
                    <span className="font-bold text-white font-mono">
                      {confirmedBooking.powerKw} kW DC
                    </span>
                  </div>
                </div>

                {/* QR Code and Check-in scanner instruction */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* SVG Stylized QR Code */}
                    <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shadow-md">
                      <QrCode className="w-14 h-14 text-slate-950" />
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-white">Scan at Stall Pillar</div>
                      <p className="text-[11px] text-slate-400">
                        Scan this QR or enter PIN {confirmedBooking.unlockPin} to unlock charger plug.
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Authorized</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      ${confirmedBooking.pricing.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons on Confirmation */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartSessionImmediate(confirmedBooking);
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Plug-In &amp; Start Live Session Now</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Done (View in My Bookings)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions (Steps 1 to 3) */}
        {currentStep < 4 && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <span>Continue to Vehicle Specs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleProcessPayment}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Authorize &amp; Pay ${totalAmount.toFixed(2)}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Payment Processing Overlay */}
        {isProcessingPayment && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin" />
              <ShieldCheck className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto" />
            </div>
            <h3 className="text-base font-bold text-white">Securing Online Payment</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm font-mono animate-pulse">
              {paymentPhase}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
