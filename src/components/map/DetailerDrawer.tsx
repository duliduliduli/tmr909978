"use client";

import { useState } from 'react';
import { Star, Clock, Phone, X, Calendar, CreditCard, ChevronLeft, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';

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

// Enhanced Payment Form Component
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Add a space every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.nameOnCard) {
      setError('Please fill in all payment details');
      return;
    }
    
    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
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
      <div className="bg-slate-50 rounded-lg p-4">
        <h4 className="font-medium text-sm text-slate-900 mb-3">Payment Details</h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Name on Card
            </label>
            <input
              type="text"
              value={paymentData.nameOnCard}
              onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              value={paymentData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                value={paymentData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={paymentData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-xs">{error}</div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing...' : `Pay $${selectedService.price}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export function DetailerDrawer({ detailer, onClose, onBookService }: DetailerDrawerProps) {
  const [bookingStep, setBookingStep] = useState<'details' | 'service' | 'datetime' | 'payment' | 'success'>('details');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return days;
  };

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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-4 right-4 bg-white rounded-t-2xl border-t border-slate-200 z-50 shadow-2xl max-h-[85vh] mb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto max-h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              {bookingStep !== 'details' && (
                <button 
                  onClick={() => {
                    if (bookingStep === 'service') setBookingStep('details');
                    else if (bookingStep === 'datetime') setBookingStep('service');
                    else if (bookingStep === 'payment') setBookingStep('datetime');
                  }}
                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                </button>
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900">{detailer.businessName}</h3>
                {detailer.distance && (
                  <p className="text-xs text-slate-600 font-medium">{detailer.distance.toFixed(1)} miles away</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          <div className="p-4">
            {/* Detailer Details View */}
            {bookingStep === 'details' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Rating and Hours */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-sm text-slate-900">{detailer.rating}</span>
                    <span className="text-xs text-slate-500">({detailer.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock className="h-3 w-3" />
                    <span>{detailer.hours}</span>
                  </div>
                </div>

                {/* Coin Info */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: detailer.coin.iconColor }} />
                    <span className="text-sm font-medium text-slate-900">{detailer.coin.name}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Earn {detailer.coin.earnRate}x coins • ${detailer.coin.redemptionValue.toFixed(2)} per coin
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-semibold text-slate-900">Services</h4>
                  {detailer.services.slice(0, 3).map((service) => (
                    <div key={service.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">{service.name}</div>
                        <div className="text-xs text-slate-600">{service.duration} min</div>
                      </div>
                      <div className="text-sm font-bold text-slate-900">${service.price}</div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setBookingStep('service')}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  Book Service
                </button>
              </motion.div>
            )}

            {/* Service Selection */}
            {bookingStep === 'service' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h4 className="text-sm font-semibold mb-3 text-slate-900">Select a Service</h4>
                <div className="space-y-2 mb-4">
                  {detailer.services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        setBookingStep('datetime');
                      }}
                      className="border border-slate-200 rounded-lg p-3 hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-slate-900">{service.name}</h5>
                          <p className="text-xs text-slate-600 mt-1">{service.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{service.duration} min</span>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-medium">{service.category}</span>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-slate-900">${service.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Date & Time Selection */}
            {bookingStep === 'datetime' && selectedService && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <h5 className="text-sm font-medium text-slate-900">{selectedService.name}</h5>
                  <div className="text-xs text-slate-600">${selectedService.price} • {selectedService.duration} min</div>
                </div>

                <h4 className="text-sm font-semibold mb-3 text-slate-900">Select Date & Time</h4>
                
                {/* Date Selection */}
                <div className="mb-4">
                  <h5 className="text-xs font-medium mb-2 text-slate-700">Date</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {days.map((day) => (
                      <button
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${
                          selectedDate === day.date
                            ? 'border-slate-400 bg-slate-100 text-slate-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
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
                    <h5 className="text-xs font-medium mb-2 text-slate-700">Time</h5>
                    <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-2 rounded text-xs font-medium transition-all ${
                            !slot.available
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : selectedTime === slot.time
                              ? 'bg-slate-900 text-white'
                              : 'border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
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
                    className="w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    Continue to Payment
                  </button>
                )}
              </motion.div>
            )}

            {/* Payment */}
            {bookingStep === 'payment' && selectedService && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <h5 className="text-sm font-medium text-slate-900">{selectedService.name}</h5>
                  <div className="text-xs text-slate-600">
                    {selectedDate} at {selectedTime} • ${selectedService.price}
                  </div>
                </div>

                <Elements stripe={stripePromise}>
                  <PaymentForm
                    selectedService={selectedService}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSuccess={() => setBookingStep('success')}
                  />
                </Elements>
              </motion.div>
            )}

            {/* Success */}
            {bookingStep === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Your {selectedService?.name} is scheduled for {selectedDate} at {selectedTime}
                </p>
                <button
                  onClick={onClose}
                  className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}