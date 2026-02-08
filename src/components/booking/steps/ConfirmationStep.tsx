"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, Calendar, MapPin, Car, CreditCard, Star, Sparkles } from 'lucide-react';
import { BookingData } from '../BookingWizard';
import { useAppStore, type Appointment } from '@/lib/store';

interface ConfirmationStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  onComplete?: (bookingId: string) => void;
}

const BODY_TYPE_LABELS: Record<string, string> = {
  car: 'Car',
  van: 'Van',
  truck: 'Truck',
  suv: 'SUV',
};

export function ConfirmationStep({
  bookingData,
  onComplete,
  setError
}: ConfirmationStepProps) {
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(true);
  const { addAppointment, activeCustomerId } = useAppStore();

  useEffect(() => {
    createBooking();
  }, []);

  const createBooking = async () => {
    setIsCreatingBooking(true);
    setError(null);

    try {
      // Use the real bookingId from DB if available, otherwise fallback
      const realBookingId = bookingData.bookingId
        || bookingData.stripePaymentIntentId
        || `TUM${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setBookingId(realBookingId);

      // Create one appointment per vehicle
      if (bookingData.vehicles.length > 0 && bookingData.providerId) {
        const addressStr = bookingData.serviceAddress
          ? `${bookingData.serviceAddress.street}, ${bookingData.serviceAddress.city}, ${bookingData.serviceAddress.state}`
          : 'Address not specified';

        const scheduledDate = bookingData.scheduledStartTime
          ? new Date(bookingData.scheduledStartTime).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        const scheduledTime = bookingData.scheduledStartTime
          ? new Date(bookingData.scheduledStartTime).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          : '12:00 PM';

        bookingData.vehicles.forEach((vehicle, index) => {
          const vehicleLabel = vehicle.make && vehicle.model
            ? `${vehicle.make} ${vehicle.model}`
            : `${BODY_TYPE_LABELS[vehicle.bodyType]} #${index + 1}`;

          const appointment: Appointment = {
            id: `${realBookingId}_v${index}`,
            customerId: activeCustomerId,
            customerName: 'Customer',
            detailerId: bookingData.providerId!,
            detailerName: '',
            businessName: '',
            serviceId: vehicle.serviceId,
            serviceName: vehicle.serviceName,
            serviceDescription: `${vehicle.serviceName} for ${vehicleLabel}${vehicle.luxuryCare ? ' (Luxury Care)' : ''}`,
            price: vehicle.adjustedPrice,
            scheduledDate,
            scheduledTime,
            duration: 60,
            address: addressStr,
            latitude: bookingData.serviceAddress?.latitude || 34.0522,
            longitude: bookingData.serviceAddress?.longitude || -118.2437,
            phone: '',
            status: 'scheduled',
            bookedAt: new Date().toISOString(),
            notes: vehicle.specialNotes || undefined,
            // Arrival tracking
            isArrived: false,
            rescheduleCount: 0,
            // Missed tracking
            isMissed: false,
          };
          addAppointment(appointment);
        });
      }

      onComplete?.(realBookingId);
    } catch (error: any) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isCreatingBooking) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Creating Your Booking...</h3>
        <p className="text-gray-600">Please wait while we confirm your appointment.</p>
      </div>
    );
  }

  if (!bookingId) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Failed</h3>
        <p className="text-gray-600 mb-4">There was an error creating your booking.</p>
        <button
          onClick={createBooking}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalPrice = bookingData.totalPrice || bookingData.vehicles.reduce((sum, v) => sum + v.adjustedPrice, 0);

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center pb-6 border-b">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">
          {bookingData.vehicles.length} vehicle{bookingData.vehicles.length !== 1 ? 's' : ''} scheduled for service.
        </p>
        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Booking #{bookingId}
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-4">
        {/* Schedule & Location */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Appointment Details</h3>
          <div className="space-y-2">
            {bookingData.scheduledStartTime && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {formatDate(bookingData.scheduledStartTime)} at {formatTime(bookingData.scheduledStartTime)}
                </span>
              </div>
            )}
            <div className="flex items-start text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 mt-0.5" />
              <span>
                {bookingData.serviceAddress
                  ? `${bookingData.serviceAddress.street}, ${bookingData.serviceAddress.city}, ${bookingData.serviceAddress.state}`
                  : 'Address not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicles Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <Car className="h-4 w-4 mr-2" />
            Vehicles
          </h3>
          <div className="space-y-3">
            {bookingData.vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {vehicle.make && vehicle.model
                        ? `${vehicle.make} ${vehicle.model}`
                        : `${BODY_TYPE_LABELS[vehicle.bodyType]}`}
                    </span>
                  </div>
                  <div className="ml-8 flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{vehicle.serviceName}</span>
                    {vehicle.luxuryCare && (
                      <span className="text-xs text-amber-600 flex items-center gap-0.5">
                        <Sparkles className="h-3 w-3" /> Luxury
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">${vehicle.adjustedPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Summary
          </h3>
          <div className="space-y-2 text-sm">
            {bookingData.vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="flex justify-between">
                <span className="text-gray-600">
                  {vehicle.serviceName} ({BODY_TYPE_LABELS[vehicle.bodyType]})
                  {vehicle.luxuryCare ? ' + Luxury' : ''}
                </span>
                <span className="text-gray-900">${vehicle.adjustedPrice.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900 text-lg">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What Happens Next?</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>Your provider will be notified and will confirm the appointment</li>
            <li>You will receive notifications with updates</li>
            <li>The provider will arrive at your scheduled time</li>
            <li>Payment confirmed</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <button className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors">
          View Booking Details
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Add to Calendar
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Share Details
          </button>
        </div>
      </div>

      {/* Support Contact */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <p>Need help? Contact us at <a href="tel:+1-555-TUMARO-1" className="text-teal-600 hover:text-teal-700">+1-555-TUMARO-1</a></p>
        <p className="mt-1">or email <a href="mailto:support@tumaro.app" className="text-teal-600 hover:text-teal-700">support@tumaro.app</a></p>
      </div>
    </div>
  );
}
