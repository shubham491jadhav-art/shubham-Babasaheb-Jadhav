export type ConnectorType = 'CCS2' | 'NACS' | 'CHAdeMO' | 'Type 2';

export type StallStatus = 'available' | 'in-use' | 'reserved' | 'maintenance';

export interface TimeSlot {
  id: string;
  startTime: string; // e.g. "11:00"
  endTime: string;   // e.g. "11:45"
  isAvailable: boolean;
  priceModifier?: number; // e.g. 1.0 for off-peak, 1.15 for peak
}

export interface Stall {
  id: string;
  stallNumber: string; // e.g. "A1", "A2"
  connectorType: ConnectorType;
  maxPowerKw: number;
  status: StallStatus;
  currentVehicleSoC?: number; // if in-use
  estimatedAvailableInMins?: number;
  slots: TimeSlot[];
}

export interface StationAmenity {
  id: string;
  name: string;
  icon: string;
}

export interface EVStation {
  id: string;
  name: string;
  brand: string;
  address: string;
  city: string;
  postalCode: string;
  distanceKm: number;
  coordinates: {
    lat: number;
    lng: number;
    mapX: number; // 0-100% relative map position
    mapY: number;
  };
  rating: number;
  reviewsCount: number;
  pricingPerKwh: number;
  idleFeePerMin: number;
  parkingFeeText: string;
  openStatus: string;
  is24Hours: boolean;
  greenEnergyPercent: number; // e.g. 100% solar
  stalls: Stall[];
  amenities: string[];
  bannerImage: string;
  peakHoursInfo: string;
}

export interface EVVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  batteryCapacityKwh: number;
  maxChargingSpeedKw: number;
  connectorType: ConnectorType;
  usableRangeKm: number;
  currentBatteryPercent: number;
  targetBatteryPercent: number;
  licensePlate?: string;
}

export type PaymentMethodType = 'credit_card' | 'apple_pay' | 'google_pay' | 'rfid_wallet' | 'instant_upi';

export interface Booking {
  id: string;
  bookingCode: string;
  stationId: string;
  stationName: string;
  stationAddress: string;
  stallId: string;
  stallNumber: string;
  connectorType: ConnectorType;
  powerKw: number;
  date: string; // "Today, Oct 8"
  startTime: string;
  endTime: string;
  durationMinutes: number;
  vehicleModel: string;
  licensePlate: string;
  estimatedKwh: number;
  targetSocPercent: number;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
  unlockPin: string;
  paymentMethod: PaymentMethodType;
  pricing: {
    energyEstimate: number;
    reservationFee: number;
    taxes: number;
    discount: number;
    totalAmount: number;
  };
  createdAt: string;
}

export interface ActiveSession {
  bookingId: string;
  stationName: string;
  stallNumber: string;
  powerKw: number;
  currentPowerDeliveryKw: number;
  voltageV: number;
  currentA: number;
  batteryPercent: number;
  initialBatteryPercent: number;
  targetBatteryPercent: number;
  kwhDelivered: number;
  totalKwhRequired: number;
  elapsedSeconds: number;
  estimatedTotalSeconds: number;
  currentCost: number;
  isPaused: boolean;
}

export interface StationFilterState {
  searchQuery: string;
  connectorType: 'all' | ConnectorType;
  minPowerKw: number; // 0, 50, 150, 300
  onlyAvailable: boolean;
  amenityFilter: string;
  sortBy: 'distance' | 'power' | 'rating' | 'price';
}
