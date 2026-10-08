import React, { useState, useMemo, useEffect } from 'react';
import {
  EVStation,
  EVVehicle,
  Booking,
  ActiveSession,
  StationFilterState,
  ConnectorType,
} from './types/ev';
import { MOCK_STATIONS } from './data/mockStations';
import { DEFAULT_VEHICLES } from './data/vehicles';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { InteractiveMap } from './components/InteractiveMap';
import { StationCard } from './components/StationCard';
import { BookingModal } from './components/BookingModal';
import { ActiveSessionModal } from './components/ActiveSessionModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { StationDetailsDrawer } from './components/StationDetailsDrawer';
import { VehicleManagerModal } from './components/VehicleManagerModal';
import {
  Zap,
  BatteryCharging,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Radio,
  Sparkles,
  MapPin,
  Flame,
  Award
} from 'lucide-react';

export default function App() {
  // Main Data States
  const [stations, setStations] = useState<EVStation[]>(MOCK_STATIONS);
  const [vehicles, setVehicles] = useState<EVVehicle[]>(DEFAULT_VEHICLES);
  const [currentVehicle, setCurrentVehicle] = useState<EVVehicle>(DEFAULT_VEHICLES[1]); // Hyundai IONIQ 5 AWD

  // Initial demo bookings
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'bk-demo-1',
      bookingCode: 'VF-8842-SF',
      stationId: 'st-01',
      stationName: 'VoltFlow HyperHub - Grand Central',
      stationAddress: '420 Metropolis Parkway, Downtown Tech District',
      stallId: 'st-01-a1',
      stallNumber: 'Bay 01',
      connectorType: 'CCS2',
      powerKw: 350,
      date: 'Today, Oct 8',
      startTime: '11:30',
      endTime: '12:15',
      durationMinutes: 45,
      vehicleModel: 'Hyundai IONIQ 5 AWD',
      licensePlate: 'HY-492-QX',
      estimatedKwh: 52.4,
      targetSocPercent: 85,
      status: 'confirmed',
      unlockPin: '4892',
      paymentMethod: 'credit_card',
      pricing: {
        energyEstimate: 19.91,
        reservationFee: 1.50,
        taxes: 1.76,
        discount: 0,
        totalAmount: 23.17,
      },
      createdAt: '10:15 AM',
    },
  ]);

  // Active Live Charging Session State
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(false);

  // Modals & Drawers
  const [selectedStationId, setSelectedStationId] = useState<string | null>(stations[0].id);
  const [bookingStation, setBookingStation] = useState<EVStation | null>(null);
  const [drawerStation, setDrawerStation] = useState<EVStation | null>(null);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState<boolean>(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState<boolean>(false);

  // Layout View mode
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');

  // Filter State
  const [filters, setFilters] = useState<StationFilterState>({
    searchQuery: '',
    connectorType: 'all',
    minPowerKw: 0,
    onlyAvailable: false,
    amenityFilter: '',
    sortBy: 'distance',
  });

  // Wallet
  const [walletBalance, setWalletBalance] = useState<number>(45.00);

  // Live Grid Real-Time Simulation Effect (Simulates occasional stall changes)
  const [liveGridActive, setLiveGridActive] = useState<boolean>(true);
  const [liveToast, setLiveToast] = useState<string | null>(null);

  useEffect(() => {
    if (!liveGridActive) return;

    const interval = setInterval(() => {
      // Pick random station and toggle one stall's availability
      setStations((prevStations) => {
        const randStationIdx = Math.floor(Math.random() * prevStations.length);
        const targetStation = prevStations[randStationIdx];
        if (!targetStation) return prevStations;

        const randStallIdx = Math.floor(Math.random() * targetStation.stalls.length);
        const targetStall = targetStation.stalls[randStallIdx];

        if (targetStall.status === 'maintenance') return prevStations;

        const newStatus = targetStall.status === 'available' ? 'in-use' : 'available';

        const updatedStalls = [...targetStation.stalls];
        updatedStalls[randStallIdx] = {
          ...targetStall,
          status: newStatus,
          estimatedAvailableInMins: newStatus === 'in-use' ? 18 : undefined,
        };

        const updatedStation = {
          ...targetStation,
          stalls: updatedStalls,
        };

        const newArr = [...prevStations];
        newArr[randStationIdx] = updatedStation;

        if (newStatus === 'available') {
          setLiveToast(
            `⚡ Real-time Update: ${targetStall.stallNumber} at ${targetStation.name.split(' - ')[0]} is now available!`
          );
          setTimeout(() => setLiveToast(null), 4000);
        }

        return newArr;
      });
    }, 18000);

    return () => clearInterval(interval);
  }, [liveGridActive]);

  // Filtered & Sorted Stations
  const filteredStations = useMemo(() => {
    return stations
      .filter((st) => {
        // Search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          const matchName = st.name.toLowerCase().includes(query);
          const matchCity = st.city.toLowerCase().includes(query);
          const matchAddress = st.address.toLowerCase().includes(query);
          const matchBrand = st.brand.toLowerCase().includes(query);
          if (!matchName && !matchCity && !matchAddress && !matchBrand) return false;
        }

        // Connector type
        if (filters.connectorType !== 'all') {
          const hasConnector = st.stalls.some(
            (stall) => stall.connectorType === filters.connectorType
          );
          if (!hasConnector) return false;
        }

        // Min Power
        if (filters.minPowerKw > 0) {
          const maxStationKw = Math.max(...st.stalls.map((s) => s.maxPowerKw));
          if (maxStationKw < filters.minPowerKw) return false;
        }

        // Only Available
        if (filters.onlyAvailable) {
          const hasAvailable = st.stalls.some((s) => s.status === 'available');
          if (!hasAvailable) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'distance') return a.distanceKm - b.distanceKm;
        if (filters.sortBy === 'power') {
          const maxA = Math.max(...a.stalls.map((s) => s.maxPowerKw));
          const maxB = Math.max(...b.stalls.map((s) => s.maxPowerKw));
          return maxB - maxA;
        }
        if (filters.sortBy === 'rating') return b.rating - a.rating;
        if (filters.sortBy === 'price') return a.pricingPerKwh - b.pricingPerKwh;
        return 0;
      });
  }, [stations, filters]);

  // Handle booking confirmed
  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);

    // Mark that specific stall as reserved in station
    setStations((prev) =>
      prev.map((st) => {
        if (st.id !== newBooking.stationId) return st;
        return {
          ...st,
          stalls: st.stalls.map((stall) => {
            if (stall.id !== newBooking.stallId) return stall;
            return {
              ...stall,
              status: 'reserved',
            };
          }),
        };
      })
    );
  };

  // Launch live session immediately
  const handleStartSession = (booking: Booking) => {
    const session: ActiveSession = {
      bookingId: booking.id,
      stationName: booking.stationName,
      stallNumber: booking.stallNumber,
      powerKw: booking.powerKw,
      currentPowerDeliveryKw: Math.min(booking.powerKw, currentVehicle.maxChargingSpeedKw),
      voltageV: 780,
      currentA: 285,
      batteryPercent: currentVehicle.currentBatteryPercent,
      initialBatteryPercent: currentVehicle.currentBatteryPercent,
      targetBatteryPercent: booking.targetSocPercent,
      kwhDelivered: 1.2,
      totalKwhRequired: booking.estimatedKwh,
      elapsedSeconds: 15,
      estimatedTotalSeconds: 1200,
      currentCost: 0.45,
      isPaused: false,
    };

    setActiveSession(session);
    setIsSessionModalOpen(true);

    // Update booking status
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: 'active' } : b))
    );
  };

  // Complete session
  const handleStopSession = (finalKwh: number, finalCost: number) => {
    if (!activeSession) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === activeSession.bookingId
          ? {
              ...b,
              status: 'completed',
              estimatedKwh: finalKwh,
              pricing: { ...b.pricing, totalAmount: finalCost },
            }
          : b
      )
    );

    // Update car SoC
    setCurrentVehicle((prev) => ({
      ...prev,
      currentBatteryPercent: activeSession.targetBatteryPercent,
    }));
  };

  // Cancel booking
  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
  };

  // Quick locate nearest 350kW
  const handleQuickLocate = () => {
    const ultraFast = stations.find((st) =>
      st.stalls.some((s) => s.maxPowerKw >= 300 && s.status === 'available')
    );
    if (ultraFast) {
      setSelectedStationId(ultraFast.id);
      setBookingStation(ultraFast);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentVehicle={currentVehicle}
        bookingsCount={bookings.filter((b) => b.status === 'confirmed').length}
        walletBalance={walletBalance}
        onOpenVehicles={() => setIsVehicleModalOpen(true)}
        onOpenBookings={() => setIsMyBookingsOpen(true)}
        onQuickLocate={handleQuickLocate}
      />

      {/* Real-time Toast Alert */}
      {liveToast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce bg-slate-900 border border-emerald-500/80 text-emerald-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{liveToast}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="border-b border-slate-900 bg-gradient-to-b from-slate-900/50 to-transparent py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Reserve High-Speed EV Charging Ahead of Time</span>
            </h1>
            <p className="text-xs text-slate-400">
              Live stall occupancy telemetry, instant slot reservation hold, and direct online payment for clean electric mobility.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Grid Frequency: <strong className="text-white">60.02 Hz</strong></span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <span>Avg Peak Rate: <strong className="text-emerald-400">$0.36/kWh</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={() =>
            setFilters({
              searchQuery: '',
              connectorType: 'all',
              minPowerKw: 0,
              onlyAvailable: false,
              amenityFilter: '',
              sortBy: 'distance',
            })
          }
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalStations={filteredStations.length}
        />

        {/* Content Views */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Vector Map (7 cols) */}
            <div className="lg:col-span-7 h-[500px] lg:h-[680px] sticky top-20">
              <InteractiveMap
                stations={filteredStations}
                selectedStationId={selectedStationId}
                onSelectStation={(st) => setSelectedStationId(st.id)}
                onBookSlot={(st) => setBookingStation(st)}
              />
            </div>

            {/* Station List Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-4 max-h-[680px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Found {filteredStations.length} charging hubs</span>
                <span>Click card to inspect stalls</span>
              </div>

              {filteredStations.length === 0 ? (
                <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                  <Zap className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-white">No stations match filters</p>
                  <p className="text-xs text-slate-400">
                    Try adjusting power speed or selecting "All Plugs".
                  </p>
                </div>
              ) : (
                filteredStations.map((station) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    isSelected={station.id === selectedStationId}
                    onSelect={() => setSelectedStationId(station.id)}
                    onBookSlot={() => setBookingStation(station)}
                    onViewDetails={() => setDrawerStation(station)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Showing {filteredStations.length} stations in card view
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  isSelected={station.id === selectedStationId}
                  onSelect={() => setSelectedStationId(station.id)}
                  onBookSlot={() => setBookingStation(station)}
                  onViewDetails={() => setDrawerStation(station)}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'map' && (
          <div className="w-full h-[760px]">
            <InteractiveMap
              stations={filteredStations}
              selectedStationId={selectedStationId}
              onSelectStation={(st) => setSelectedStationId(st.id)}
              onBookSlot={(st) => setBookingStation(st)}
            />
          </div>
        )}
      </main>

      {/* Floating Active Charging Telemetry Banner (If session active) */}
      {activeSession && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40">
          <div
            onClick={() => setIsSessionModalOpen(true)}
            className="p-3.5 bg-slate-900/95 border border-emerald-500/80 rounded-2xl shadow-2xl backdrop-blur-xl cursor-pointer hover:border-emerald-400 transition-all flex items-center justify-between gap-3 ring-2 ring-emerald-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <BatteryCharging className="w-5 h-5 animate-bounce" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              </div>

              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Charging in Progress</span>
                  <span className="text-emerald-400 font-mono">
                    {Math.round(activeSession.batteryPercent)}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {activeSession.stallNumber} · {activeSession.powerKw} kW DC Flow
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400 block">
                ${activeSession.currentCost.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">Tap to inspect</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {bookingStation && (
        <BookingModal
          station={bookingStation}
          selectedVehicle={currentVehicle}
          isOpen={!!bookingStation}
          onClose={() => setBookingStation(null)}
          onBookingSuccess={handleBookingSuccess}
          onStartSessionImmediate={(bk) => handleStartSession(bk)}
        />
      )}

      <ActiveSessionModal
        session={activeSession}
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onStopSession={(finalKwh, finalCost) => {
          handleStopSession(finalKwh, finalCost);
          setIsSessionModalOpen(false);
          setActiveSession(null);
        }}
      />

      <MyBookingsModal
        bookings={bookings}
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        onCancelBooking={handleCancelBooking}
        onStartSession={(bk) => handleStartSession(bk)}
      />

      <StationDetailsDrawer
        station={drawerStation}
        isOpen={!!drawerStation}
        onClose={() => setDrawerStation(null)}
        onBookSlot={(st) => {
          setDrawerStation(null);
          setBookingStation(st);
        }}
      />

      <VehicleManagerModal
        currentVehicle={currentVehicle}
        allVehicles={vehicles}
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSelectVehicle={(v) => setCurrentVehicle(v)}
        onAddVehicle={(newV) => setVehicles((prev) => [...prev, newV])}
      />
    </div>
  );
}
