"use client";

import { useState } from 'react';
import { Star, Clock, Phone, X, Calendar, CreditCard, ChevronLeft, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface DetailerDrawerProps {
  detailer: {
    id: string;
    name: string;
    businessName: string;
    rating: number;
    reviewCount: number;
    distance?: number;
    coin: {
      name: string;
      iconColor: string;
      earnRate: number;
      redemptionValue: number;
    };
    phone: string;
    hours: string;
    services: Service[];
  };
  onClose: () => void;
  onBookService: () => void;
}

// Payment Form Component
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
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setError(error.message || 'Payment failed');
        return;
      }

      // Simulate success for demo
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err) {
      setError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="font-medium text-sm text-gray-900 mb-2">Payment Details</h4>
        <div className="bg-white p-3 rounded border text-sm">
          <CardElement />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="bg-teal-50 rounded-lg p-3">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">Total</span>
          <span className="font-bold text-lg text-teal-600">${selectedService.price}</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {selectedService.name} • {selectedDate} at {selectedTime}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!stripe || isProcessing}
        className="w-full bg-teal-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : `Pay $${selectedService.price}`}
      </button>
    </div>
  );
}

export function DetailerDrawer({ detailer, onClose }: DetailerDrawerProps) {
  const [bookingStep, setBookingStep] = useState<'details' | 'service' | 'datetime' | 'payment' | 'success'>('details');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

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

  // Generate time slots
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          available: Math.random() > 0.3
        });
      }
    }
    return slots;
  };

  const days = getNext7Days();
  const timeSlots = getTimeSlots();

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t border-gray-200 z-40 shadow-xl">
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            {bookingStep !== 'details' && (
              <button 
                onClick={() => {
                  if (bookingStep === 'service') setBookingStep('details');
                  else if (bookingStep === 'datetime') setBookingStep('service');
                  else if (bookingStep === 'payment') setBookingStep('datetime');
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900">{detailer.businessName}</h3>
              {detailer.distance && (
                <p className="text-xs text-teal-600 font-medium">{detailer.distance.toFixed(1)} miles away</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {/* Detailer Details View */}
          {bookingStep === 'details' && (
            <>
              {/* Rating and Hours */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium text-sm">{detailer.rating}</span>
                  <span className="text-xs text-gray-500">({detailer.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock className="h-3 w-3" />
                  <span>{detailer.hours}</span>
                </div>
              </div>

              {/* Coin Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: detailer.coin.iconColor }} />
                  <span className="text-sm font-medium text-gray-900">{detailer.coin.name}</span>
                </div>
                <div className="text-xs text-gray-600">
                  Earn {detailer.coin.earnRate}x coins • ${detailer.coin.redemptionValue.toFixed(2)} per coin
                </div>
              </div>

              {/* Services */}
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Services</h4>
                {detailer.services.slice(0, 3).map((service) => (
                  <div key={service.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-xs text-gray-600">{service.duration} min</div>
                    </div>
                    <div className="text-sm font-bold text-teal-600">${service.price}</div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setBookingStep('service')}
                className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors"
              >
                Book Service
              </button>
            </>
          )}

          {/* Service Selection */}
          {bookingStep === 'service' && (
            <>
              <h4 className="text-sm font-semibold mb-3">Select a Service</h4>
              <div className="space-y-2 mb-4">
                {detailer.services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setBookingStep('datetime');
                    }}
                    className="border border-gray-200 rounded-lg p-3 hover:border-teal-300 hover:bg-teal-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-gray-900">{service.name}</h5>
                        <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{service.duration} min</span>
                          <span className="px-1 py-0.5 bg-gray-100 rounded text-xs">{service.category}</span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-teal-600">${service.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Date & Time Selection */}
          {bookingStep === 'datetime' && selectedService && (
            <>
              <div className="bg-teal-50 rounded-lg p-2 mb-4">
                <h5 className="text-sm font-medium">{selectedService.name}</h5>
                <div className="text-xs text-gray-600">${selectedService.price} • {selectedService.duration} min</div>
              </div>

              <h4 className="text-sm font-semibold mb-3">Select Date & Time</h4>
              
              {/* Date Selection */}
              <div className="mb-4">
                <h5 className="text-xs font-medium mb-2 text-gray-700">Date</h5>
                <div className="grid grid-cols-2 gap-2">
                  {days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`p-2 rounded-lg border text-left text-xs ${
                        selectedDate === day.date
                          ? 'border-teal-300 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{day.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-4">
                  <h5 className="text-xs font-medium mb-2 text-gray-700">Time</h5>
                  <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-1 rounded text-xs font-medium ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedTime === slot.time
                            ? 'bg-teal-500 text-white'
                            : 'border border-gray-200 hover:border-teal-300'
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
                  onClick={() => setBookingStep('payment')}
                  className="w-full bg-teal-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-600"
                >
                  Continue to Payment
                </button>
              )}
            </>
          )}

          {/* Payment */}
          {bookingStep === 'payment' && selectedService && (
            <>
              <div className="bg-teal-50 rounded-lg p-2 mb-4">
                <h5 className="text-sm font-medium">{selectedService.name}</h5>
                <div className="text-xs text-gray-600">{selectedDate} at {selectedTime}</div>
              </div>

              <Elements stripe={stripePromise}>
                <PaymentForm
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSuccess={() => setBookingStep('success')}
                />
              </Elements>
            </>
          )}

          {/* Success */}
          {bookingStep === 'success' && selectedService && (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Booking Confirmed!</h4>
              <p className="text-sm text-gray-600 mb-4">
                Your {selectedService.name} is scheduled for {selectedDate} at {selectedTime}
              </p>
              <button
                onClick={onClose}
                className="w-full bg-teal-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-600"
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