"use client";

import { useState } from 'react';
import { Car, Clock, MapPin, CreditCard, Check } from 'lucide-react';
import { VehicleSelectionStep } from './steps/VehicleInfoStep';
import { SchedulingStep } from './steps/SchedulingStep';
import { AddressStepEnhanced as AddressStep } from './steps/AddressStepEnhanced';
import { PaymentStep } from './steps/PaymentStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { BookingProgress } from './BookingProgress';
import type { BodyType } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

interface BookingWizardProps {
  providerId?: string;
  onComplete?: (bookingId: string) => void;
  compact?: boolean;
}

export interface BookingVehicle {
  id: string;
  bodyType: BodyType;
  serviceId: string;
  serviceName: string;
  basePrice: number;
  adjustedPrice: number;
  luxuryCare: boolean;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  specialNotes?: string;
}

export interface BookingData {
  providerId?: string;
  scheduledStartTime?: string;
  serviceAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };
  vehicles: BookingVehicle[];
  totalPrice?: number;
  specialInstructions?: string;
  addOnServices?: string[];
  promotionCode?: string;
  paymentMethodId?: string;
  tipAmount?: number;
  stripePaymentIntentId?: string;
  // Legacy fields kept for compatibility with existing step components
  serviceId?: string;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    color?: string;
    size: 'compact' | 'midsize' | 'large' | 'suv' | 'truck';
    licensePlate?: string;
    specialNotes?: string;
  };
}

export function BookingWizard({
  providerId,
  onComplete,
  compact = false
}: BookingWizardProps) {
  const { t } = useTranslation();

  const STEPS = [
    { id: 'vehicles', label: t('bookingWizard.cars'), icon: Car },
    { id: 'schedule', label: t('bookingWizard.schedule'), icon: Clock },
    { id: 'address', label: t('bookingWizard.address'), icon: MapPin },
    { id: 'payment', label: t('bookingWizard.payment'), icon: CreditCard },
    { id: 'confirmation', label: t('bookingWizard.confirm'), icon: Check }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({
    providerId,
    vehicles: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      case 0: // Cars
        return bookingData.vehicles.length > 0 &&
          bookingData.vehicles.every(v => v.serviceId && v.bodyType);
      case 1: // Schedule
        return !!bookingData.scheduledStartTime;
      case 2: // Address
        return !!bookingData.serviceAddress;
      case 3: // Payment
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
        return <VehicleSelectionStep {...stepProps} />;
      case 1:
        return <SchedulingStep {...stepProps} />;
      case 2:
        return <AddressStep {...stepProps} />;
      case 3:
        return <PaymentStep {...stepProps} />;
      case 4:
        return <ConfirmationStep {...stepProps} onComplete={onComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className={compact ? 'overflow-x-hidden' : 'max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden'}>
      {/* Header */}
      {!compact && (
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">{t('bookingWizard.bookService')}</h2>
          <p className="text-teal-100 text-sm mt-1">
            {t('bookingWizard.completeBooking')} {STEPS.length} {t('bookingWizard.easySteps')}
          </p>
        </div>
      )}

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
      <div className={compact ? '' : 'p-6'}>
        {renderCurrentStep()}
      </div>

      {/* Navigation Footer */}
      {!compact && (
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
            {t('bookingWizard.previous')}
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {t('bookingWizard.step')} {currentStep + 1} {t('bookingWizard.of')} {STEPS.length}
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
              {isLoading ? t('bookingWizard.processing') : t('bookingWizard.continue')}
            </button>
          ) : (
            <div className="w-20" />
          )}
        </div>
      )}
    </div>
  );
}
