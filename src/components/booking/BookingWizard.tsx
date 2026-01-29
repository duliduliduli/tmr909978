"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Car, CreditCard, Check } from 'lucide-react';
import { ServiceSelectionStep } from './steps/ServiceSelectionStep';
import { SchedulingStep } from './steps/SchedulingStep';
import { AddressStep } from './steps/AddressStep';
import { VehicleInfoStep } from './steps/VehicleInfoStep';
import { PaymentStep } from './steps/PaymentStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { BookingProgress } from './BookingProgress';

interface BookingWizardProps {
  providerId?: string;
  serviceId?: string;
  onComplete?: (bookingId: string) => void;
}

export interface BookingData {
  providerId?: string;
  serviceId?: string;
  scheduledStartTime?: string;
  serviceAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    color?: string;
    size: 'compact' | 'midsize' | 'large' | 'suv' | 'truck';
    licensePlate?: string;
    specialNotes?: string;
  };
  specialInstructions?: string;
  addOnServices?: string[];
  promotionCode?: string;
  paymentMethodId?: string;
  tipAmount?: number;
}

const STEPS = [
  { id: 'service', label: 'Service', icon: Car },
  { id: 'schedule', label: 'Schedule', icon: Clock },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'vehicle', label: 'Vehicle', icon: Car },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'confirmation', label: 'Confirmation', icon: Check }
];

export function BookingWizard({ 
  providerId, 
  serviceId, 
  onComplete 
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({
    providerId,
    serviceId
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Skip service selection if serviceId is provided
  useEffect(() => {
    if (serviceId && currentStep === 0) {
      setCurrentStep(1);
    }
  }, [serviceId, currentStep]);

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
    setError(null);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Service
        return !!bookingData.serviceId;
      case 1: // Schedule  
        return !!bookingData.scheduledStartTime;
      case 2: // Address
        return !!bookingData.serviceAddress;
      case 3: // Vehicle
        return !!bookingData.vehicleInfo?.make && !!bookingData.vehicleInfo?.model;
      case 4: // Payment
        return !!bookingData.paymentMethodId;
      default:
        return true;
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      bookingData,
      updateBookingData,
      onNext: nextStep,
      onPrev: prevStep,
      isLoading,
      setIsLoading,
      setError
    };

    switch (currentStep) {
      case 0:
        return <ServiceSelectionStep {...stepProps} />;
      case 1:
        return <SchedulingStep {...stepProps} />;
      case 2:
        return <AddressStep {...stepProps} />;
      case 3:
        return <VehicleInfoStep {...stepProps} />;
      case 4:
        return <PaymentStep {...stepProps} />;
      case 5:
        return <ConfirmationStep {...stepProps} onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">Book a Service</h2>
        <p className="text-teal-100 text-sm mt-1">
          Complete your booking in {STEPS.length} easy steps
        </p>
      </div>

      {/* Progress Bar */}
      <BookingProgress 
        steps={STEPS} 
        currentStep={currentStep} 
        completedSteps={currentStep}
      />

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="p-6">
        {renderCurrentStep()}
      </div>

      {/* Navigation Footer */}
      <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 0 || isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            currentStep === 0 || isLoading
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Previous
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={nextStep}
            disabled={!canProceedToNext() || isLoading}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              !canProceedToNext() || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        ) : (
          <div className="w-20" /> // Spacer for last step
        )}
      </div>
    </div>
  );
}