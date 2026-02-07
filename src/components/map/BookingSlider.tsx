"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, CreditCard, MapPin, User, X, ChevronLeft, CheckCircle } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe/getStripe';

const stripePromise = getStripe();

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface Detailer {
  id: string;
  name: string;
  businessName: string;
  rating: number;
  distance?: number;
  services: Service[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  date: string;
}

interface BookingSliderProps {
  detailer: Detailer;
  onClose: () => void;
  userLocation?: [number, number];
}

function PaymentForm({ 
  selectedService, 
  selectedDate, 
  selectedTime, 
  onSuccess 
}: {
  selectedService: Service;
  selectedDate: string;
  selectedTime: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setError(error.message || 'Payment failed');
        return;
      }

      // TODO: Call your backend to create payment intent and confirm booking
      console.log('Payment method created:', paymentMethod.id);
      
      // For demo, simulate success
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err) {
      setError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Payment Details</h4>
        <div className="bg-white p-3 rounded border">
          <CardElement options={cardStyle} />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-teal-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Total</span>
          <span className="font-bold text-xl text-teal-600">${selectedService.price}</span>
        </div>
        <div className="text-sm text-gray-600">
          {selectedService.name} • {selectedDate} at {selectedTime}
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            Processing...
          </div>
        ) : (
          `Pay $${selectedService.price}`
        )}
      </button>
    </form>
  );
}

export function BookingSlider({ detailer, onClose, userLocation }: BookingSliderProps) {
  const [step, setStep] = useState<'service' | 'datetime' | 'payment' | 'success'>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Generate next 7 days
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return days;
  };

  // Generate time slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      // Mock available time slots - in production, fetch from API
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour < 18; hour++) {
        for (let minute of [0, 30]) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push({
            time,
            available: Math.random() > 0.3, // Random availability for demo
            date: selectedDate
          });
        }
      }
      setAvailableSlots(slots);
    }
  }, [selectedDate, selectedService]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('datetime');
  };

  const handleDateTimeConfirm = () => {
    if (selectedDate && selectedTime) {
      setStep('payment');
    }
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  const days = getNext7Days();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {step !== 'service' && step !== 'success' && (
              <button 
                onClick={() => {
                  if (step === 'datetime') setStep('service');
                  if (step === 'payment') setStep('datetime');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold">{detailer.businessName}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {detailer.distance ? `${detailer.distance.toFixed(1)} miles away` : 'Distance unknown'}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* Step 1: Service Selection */}
          {step === 'service' && (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Select a Service</h3>
              <div className="space-y-3">
                {detailer.services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:bg-teal-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {service.duration} min
                          </div>
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                            {service.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl text-teal-600">${service.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 'datetime' && selectedService && (
            <div className="p-4">
              <div className="bg-teal-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium">{selectedService.name}</h4>
                <div className="text-sm text-gray-600">${selectedService.price} • {selectedService.duration} min</div>
              </div>

              <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
              
              {/* Date Selection */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Choose Date</h4>
                <div className="grid grid-cols-2 gap-2">
                  {days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedDate === day.date
                          ? 'border-teal-300 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{day.label}</div>
                      <div className="text-sm text-gray-500">{day.date}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Choose Time</h4>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedTime === slot.time
                            ? 'bg-teal-500 text-white'
                            : 'border border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDate && selectedTime && (
                <button
                  onClick={handleDateTimeConfirm}
                  className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors"
                >
                  Continue to Payment
                </button>
              )}
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && selectedService && (
            <div className="p-4">
              <div className="bg-teal-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium">{selectedService.name}</h4>
                <div className="text-sm text-gray-600">
                  {selectedDate} at {selectedTime} • {selectedService.duration} min
                </div>
              </div>

              <Elements stripe={stripePromise}>
                <PaymentForm
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && selectedService && (
            <div className="p-4 text-center">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600">
                  Your {selectedService.name} is scheduled for {selectedDate} at {selectedTime}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">Booking Details</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span>{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span>{selectedDate} at {selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{selectedService.duration} min</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${selectedService.price}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}