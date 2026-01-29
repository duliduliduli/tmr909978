"use client";

import { useState } from 'react';
import { Car, Info } from 'lucide-react';
import { BookingData } from '../BookingWizard';

interface VehicleInfoStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function VehicleInfoStep({
  bookingData,
  updateBookingData,
  onNext,
  onPrev,
  isLoading,
  setError
}: VehicleInfoStepProps) {
  const [vehicleInfo, setVehicleInfo] = useState({
    make: bookingData.vehicleInfo?.make || '',
    model: bookingData.vehicleInfo?.model || '',
    year: bookingData.vehicleInfo?.year || new Date().getFullYear(),
    color: bookingData.vehicleInfo?.color || '',
    size: bookingData.vehicleInfo?.size || 'midsize' as const,
    licensePlate: bookingData.vehicleInfo?.licensePlate || '',
    specialNotes: bookingData.vehicleInfo?.specialNotes || ''
  });

  const handleInputChange = (field: keyof typeof vehicleInfo, value: any) => {
    const updated = { ...vehicleInfo, [field]: value };
    setVehicleInfo(updated);
    updateBookingData({ vehicleInfo: updated });
    setError(null);
  };

  const isFormComplete = vehicleInfo.make && vehicleInfo.model && vehicleInfo.year;

  const vehicleSizes = [
    { value: 'compact', label: 'Compact Car', description: 'Honda Civic, Toyota Corolla' },
    { value: 'midsize', label: 'Mid-Size Car', description: 'Honda Accord, Toyota Camry' },
    { value: 'large', label: 'Large Car', description: 'BMW 7 Series, Mercedes S-Class' },
    { value: 'suv', label: 'SUV', description: 'Honda CR-V, Toyota Highlander' },
    { value: 'truck', label: 'Pickup Truck', description: 'Ford F-150, Chevy Silverado' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Vehicle Information</h3>
        <p className="text-sm text-gray-600">
          Tell us about your vehicle so we can provide the best service possible.
        </p>
      </div>

      {/* Make and Model */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
            Make *
          </label>
          <input
            type="text"
            id="make"
            value={vehicleInfo.make}
            onChange={(e) => handleInputChange('make', e.target.value)}
            placeholder="Honda"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Model *
          </label>
          <input
            type="text"
            id="model"
            value={vehicleInfo.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            placeholder="Civic"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Year and Color */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year *
          </label>
          <select
            id="year"
            value={vehicleInfo.year}
            onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            type="text"
            id="color"
            value={vehicleInfo.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
            placeholder="Silver"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Vehicle Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Vehicle Size *
        </label>
        <div className="space-y-2">
          {vehicleSizes.map((size) => (
            <label
              key={size.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                vehicleInfo.size === size.value
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="size"
                value={size.value}
                checked={vehicleInfo.size === size.value}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                vehicleInfo.size === size.value
                  ? 'border-teal-500'
                  : 'border-gray-300'
              }`}>
                {vehicleInfo.size === size.value && (
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{size.label}</div>
                <div className="text-sm text-gray-500">{size.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* License Plate */}
      <div>
        <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">
          License Plate (Optional)
        </label>
        <input
          type="text"
          id="licensePlate"
          value={vehicleInfo.licensePlate}
          onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
          placeholder="ABC123"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          This helps our providers identify your vehicle
        </p>
      </div>

      {/* Special Notes */}
      <div>
        <label htmlFor="specialNotes" className="block text-sm font-medium text-gray-700 mb-1">
          Special Vehicle Notes (Optional)
        </label>
        <textarea
          id="specialNotes"
          value={vehicleInfo.specialNotes}
          onChange={(e) => handleInputChange('specialNotes', e.target.value)}
          placeholder="Any special requirements or notes about your vehicle..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          e.g., damaged areas to avoid, special paint type, accessibility needs
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h6 className="text-sm font-medium text-blue-900 mb-1">Why we need this information</h6>
            <p className="text-sm text-blue-700">
              Vehicle details help us bring the right equipment, determine accurate pricing, 
              and ensure our providers can deliver the best possible service for your specific vehicle type.
            </p>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      {isFormComplete && (
        <div className="pt-4">
          <button
            onClick={onNext}
            className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      )}
    </div>
  );
}