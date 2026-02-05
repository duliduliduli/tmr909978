"use client";

import { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { BookingData, BookingVehicle } from '../BookingWizard';
import { useAppStore, calculateAdjustedPrice, type BodyType, type Service } from '@/lib/store';

interface VehicleSelectionStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const BODY_TYPES: { value: BodyType; label: string; icon: string }[] = [
  { value: 'car', label: 'Car', icon: '🚗' },
  { value: 'van', label: 'Van', icon: '🚐' },
  { value: 'truck', label: 'Truck', icon: '🛻' },
  { value: 'suv', label: 'SUV', icon: '🚙' },
];

export function VehicleSelectionStep({
  bookingData,
  updateBookingData,
  onNext,
  setError
}: VehicleSelectionStepProps) {
  const { getActiveServicesByDetailer } = useAppStore();
  const [vehicles, setVehicles] = useState<BookingVehicle[]>(
    bookingData.vehicles.length > 0 ? bookingData.vehicles : []
  );
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());

  const services = bookingData.providerId
    ? getActiveServicesByDetailer(bookingData.providerId)
    : [];

  // Sync vehicles to parent
  useEffect(() => {
    const totalPrice = vehicles.reduce((sum, v) => sum + v.adjustedPrice, 0);
    updateBookingData({ vehicles, totalPrice });
  }, [vehicles]);

  const addVehicle = () => {
    const defaultService = services[0];
    const newVehicle: BookingVehicle = {
      id: `veh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      bodyType: 'car',
      serviceId: defaultService?.id || '',
      serviceName: defaultService?.name || '',
      basePrice: defaultService?.price || 0,
      adjustedPrice: defaultService?.price || 0,
      luxuryCare: false,
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const removeVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    setExpandedDetails(prev => {
      const next = new Set(prev);
      next.delete(vehicleId);
      return next;
    });
  };

  const updateVehicle = (vehicleId: string, updates: Partial<BookingVehicle>) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;
      const updated = { ...v, ...updates };

      // Recalculate adjusted price when body type, service, or luxury care changes
      if (updates.serviceId || updates.bodyType !== undefined || updates.luxuryCare !== undefined) {
        const service = services.find(s => s.id === updated.serviceId);
        if (service) {
          updated.basePrice = service.price;
          updated.serviceName = service.name;
          updated.adjustedPrice = calculateAdjustedPrice(
            service.price,
            updated.bodyType,
            service.bodyTypeMultipliers,
            updated.luxuryCare,
            service.luxuryCareSurchargePercent
          );
        }
      }
      return updated;
    }));
  };

  const toggleDetails = (vehicleId: string) => {
    setExpandedDetails(prev => {
      const next = new Set(prev);
      if (next.has(vehicleId)) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });
  };

  const totalPrice = vehicles.reduce((sum, v) => sum + v.adjustedPrice, 0);
  const isValid = vehicles.length > 0 && vehicles.every(v => v.serviceId && v.bodyType);

  // Auto-add first vehicle if empty
  useEffect(() => {
    if (vehicles.length === 0 && services.length > 0) {
      addVehicle();
    }
  }, [services.length]);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Select Cars for Service</h3>
        <p className="text-sm text-gray-500">
          Add your vehicles and choose a service for each one.
        </p>
      </div>

      {services.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            This detailer has no active services configured. Please go back and select a different detailer.
          </p>
        </div>
      )}

      {/* Vehicle Cards */}
      <div className="space-y-4">
        {vehicles.map((vehicle, index) => {
          const selectedService = services.find(s => s.id === vehicle.serviceId);
          const isDetailsOpen = expandedDetails.has(vehicle.id);

          return (
            <div
              key={vehicle.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900 text-sm">Vehicle {index + 1}</span>
                </div>
                {vehicles.length > 1 && (
                  <button
                    onClick={() => removeVehicle(vehicle.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="p-4 space-y-4">
                {/* Body Type Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Body Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BODY_TYPES.map((bt) => (
                      <button
                        key={bt.value}
                        onClick={() => updateVehicle(vehicle.id, { bodyType: bt.value })}
                        className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          vehicle.bodyType === bt.value
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg">{bt.icon}</span>
                        <span className="text-xs">{bt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Service</label>
                  <select
                    value={vehicle.serviceId}
                    onChange={(e) => {
                      const svc = services.find(s => s.id === e.target.value);
                      if (svc) {
                        updateVehicle(vehicle.id, {
                          serviceId: svc.id,
                          serviceName: svc.name,
                          basePrice: svc.price,
                        });
                      }
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  >
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} — ${svc.price.toFixed(2)} ({svc.duration} min)
                      </option>
                    ))}
                  </select>
                  {selectedService && (
                    <p className="text-xs text-gray-500 mt-1">{selectedService.description}</p>
                  )}
                </div>

                {/* Luxury Care Toggle */}
                <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <div>
                      <span className="text-sm font-medium text-amber-900">Luxury Care</span>
                      {selectedService && selectedService.luxuryCareSurchargePercent > 0 && (
                        <span className="text-xs text-amber-700 ml-1.5">
                          (+{selectedService.luxuryCareSurchargePercent}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => updateVehicle(vehicle.id, { luxuryCare: !vehicle.luxuryCare })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      vehicle.luxuryCare ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        vehicle.luxuryCare ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Price Display */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {vehicle.bodyType !== 'car' && selectedService && (
                      <span className="text-xs text-gray-400">
                        Base ${vehicle.basePrice.toFixed(2)} x {selectedService.bodyTypeMultipliers[vehicle.bodyType]}
                        {vehicle.luxuryCare ? ` + ${selectedService.luxuryCareSurchargePercent}% luxury` : ''}
                      </span>
                    )}
                    {vehicle.bodyType === 'car' && vehicle.luxuryCare && selectedService && (
                      <span className="text-xs text-gray-400">
                        Base ${vehicle.basePrice.toFixed(2)} + {selectedService.luxuryCareSurchargePercent}% luxury
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    ${vehicle.adjustedPrice.toFixed(2)}
                  </div>
                </div>

                {/* Vehicle Details (Collapsible) */}
                <div>
                  <button
                    onClick={() => toggleDetails(vehicle.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isDetailsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    Vehicle Details (Optional)
                  </button>

                  {isDetailsOpen && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Make</label>
                          <input
                            type="text"
                            value={vehicle.make || ''}
                            onChange={(e) => updateVehicle(vehicle.id, { make: e.target.value })}
                            placeholder="Honda"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Model</label>
                          <input
                            type="text"
                            value={vehicle.model || ''}
                            onChange={(e) => updateVehicle(vehicle.id, { model: e.target.value })}
                            placeholder="Civic"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Color</label>
                          <input
                            type="text"
                            value={vehicle.color || ''}
                            onChange={(e) => updateVehicle(vehicle.id, { color: e.target.value })}
                            placeholder="Silver"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">License Plate</label>
                          <input
                            type="text"
                            value={vehicle.licensePlate || ''}
                            onChange={(e) => updateVehicle(vehicle.id, { licensePlate: e.target.value.toUpperCase() })}
                            placeholder="ABC123"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Special Notes</label>
                        <textarea
                          value={vehicle.specialNotes || ''}
                          onChange={(e) => updateVehicle(vehicle.id, { specialNotes: e.target.value })}
                          placeholder="Any special requirements..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Another Car */}
      <button
        onClick={addVehicle}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Another Car
      </button>

      {/* Running Total */}
      {vehicles.length > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-teal-900">
              Total ({vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''})
            </p>
            <p className="text-xs text-teal-700">
              {vehicles.map(v => v.serviceName).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
            </p>
          </div>
          <div className="text-2xl font-bold text-teal-900">
            ${totalPrice.toFixed(2)}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {isValid && (
        <button
          onClick={onNext}
          className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          Continue to Schedule
        </button>
      )}
    </div>
  );
}
