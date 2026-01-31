"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, Calendar, MapPin, Car, CreditCard, Star } from 'lucide-react';
import { BookingData } from '../BookingWizard';
import { useAppStore, type Appointment } from '@/lib/store';
import { mockDetailers } from '@/lib/mockData';

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

export function ConfirmationStep({
  bookingData,
  onComplete,
  isLoading,
  setIsLoading,
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
      // Simulate booking creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock booking ID
      const mockBookingId = `TUM${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setBookingId(mockBookingId);
      
      // Create appointment object and save to store
      if (bookingData.selectedDetailer && bookingData.selectedService && bookingData.scheduledStartTime) {
        const detailer = mockDetailers.find(d => d.id === bookingData.selectedDetailer);
        const service = detailer?.services.find(s => s.id === bookingData.selectedService);
        
        if (detailer && service) {
          const appointmentDate = new Date(bookingData.scheduledStartTime);
          const appointment: Appointment = {
            id: mockBookingId,
            customerId: activeCustomerId,
            detailerId: detailer.id,
            detailerName: detailer.name,
            businessName: detailer.businessName,
            serviceId: service.id,
            serviceName: service.name,
            serviceDescription: service.description,
            price: service.price,
            scheduledDate: appointmentDate.toISOString().split('T')[0],
            scheduledTime: appointmentDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            }),
            duration: service.duration,
            address: bookingData.serviceAddress ? 
              `${bookingData.serviceAddress.street}, ${bookingData.serviceAddress.city}, ${bookingData.serviceAddress.state}` :
              'Address not specified',
            phone: detailer.phone,
            status: 'scheduled',
            bookedAt: new Date().toISOString(),
            notes: bookingData.specialInstructions
          };
          
          // Save appointment to global store
          addAppointment(appointment);
        }
      }
      
      // Call completion handler
      onComplete?.(mockBookingId);
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

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
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
        <p className="text-gray-600">Your appointment has been successfully scheduled.</p>
        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Booking #{bookingId}
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-4">
        {/* Service Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Service Details</h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="font-medium">Premium Exterior Detail</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {bookingData.scheduledStartTime && formatDate(bookingData.scheduledStartTime)} at{' '}
                {bookingData.scheduledStartTime && formatTime(bookingData.scheduledStartTime)}
              </span>
            </div>
            <div className="flex items-start text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 mt-0.5" />
              <span>
                {bookingData.serviceAddress ? 
                  `${bookingData.serviceAddress.street}, ${bookingData.serviceAddress.city}, ${bookingData.serviceAddress.state}` :
                  'Address not specified'
                }
              </span>
            </div>
            {bookingData.vehicleInfo && (
              <div className="flex items-center text-sm text-gray-600">
                <Car className="h-4 w-4 mr-2" />
                <span>
                  {bookingData.vehicleInfo.year} {bookingData.vehicleInfo.make} {bookingData.vehicleInfo.model}
                  {bookingData.vehicleInfo.color && ` (${bookingData.vehicleInfo.color})`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Service</span>
              <span className="text-gray-900">$75.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">$6.56</span>
            </div>
            {bookingData.tipAmount && bookingData.tipAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tip</span>
                <span className="text-gray-900">{formatPrice(bookingData.tipAmount)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span className="text-gray-900">Total Charged</span>
                <span className="text-gray-900">
                  {formatPrice(8156 + (bookingData.tipAmount || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What Happens Next?</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Your provider will be notified and will confirm the appointment</li>
            <li>• You'll receive SMS and email notifications with updates</li>
            <li>• The provider will arrive at your scheduled time</li>
            <li>• Payment will be processed after service completion</li>
          </ul>
        </div>

        {/* Special Instructions */}
        {bookingData.specialInstructions && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">Special Instructions</h3>
            <p className="text-sm text-yellow-800">{bookingData.specialInstructions}</p>
          </div>
        )}
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