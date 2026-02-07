"use client";

import { useState, useEffect, Fragment } from 'react';
import { Star, Clock, Phone, X, Calendar, CreditCard, ChevronLeft, CheckCircle, Car, ChevronUp, ChevronDown, Crown } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe/getStripe';
import { mockCustomers, type Vehicle } from '@/lib/mockData';

const stripePromise = getStripe();

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
  getFinalPrice,
  onSuccess
}: {
  selectedService: Service;
  selectedDate: string;
  selectedTime: string;
  getFinalPrice: (service: Service) => number;
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
            {isProcessing ? 'Processing...' : `Pay $${getFinalPrice(selectedService)}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export function DetailerDrawer({ detailer, onClose, onBookService }: DetailerDrawerProps) {
  const [bookingStep, setBookingStep] = useState<'details' | 'service' | 'vehicle' | 'datetime' | 'payment' | 'success'>('details');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [vehicleQuantities, setVehicleQuantities] = useState({
    car: 0,
    suv: 0,
    truck: 0,
    van: 0
  });
  const [washItems, setWashItems] = useState<{ id: string, vehicleType: 'car' | 'suv' | 'truck' | 'van', isLuxury: boolean, vehicleId?: string }[]>([]);
  const [customerCoins, setCustomerCoins] = useState<number>(0);
  const [showCoinInfo, setShowCoinInfo] = useState<boolean>(false);
  const [coinsToUse, setCoinsToUse] = useState<number>(0);
  const [selectedStoredVehicles, setSelectedStoredVehicles] = useState<string[]>([]);

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

  // Calculate total service time needed based on selected washes
  const calculateServiceDuration = () => {
    if (!selectedService) return 0;

    let totalMinutes = 0;
    const baseDuration = selectedService.duration; // Base duration from service

    washItems.forEach(item => {
      let itemDuration = baseDuration;

      // Vehicle type duration multipliers
      switch (item.vehicleType) {
        case 'car':
          itemDuration *= 1.0; // 35 minutes base
          break;
        case 'suv':
          itemDuration *= 1.3; // ~45 minutes
          break;
        case 'truck':
          itemDuration *= 1.5; // ~52 minutes
          break;
        case 'van':
          itemDuration *= 1.4; // ~49 minutes
          break;
      }

      // Luxury adds extra time
      if (item.isLuxury) {
        itemDuration *= 1.2; // +20% time for luxury care
      }

      totalMinutes += itemDuration;
    });

    return Math.ceil(totalMinutes);
  };

  const getTimeSlots = () => {
    const slots = [];
    const totalServiceTime = calculateServiceDuration();

    // Fixed detailer availability (simulate actual business hours with breaks)
    const detailerAvailability = {
      // Unavailable slots (lunch, existing bookings, etc.)
      unavailable: [
        '12:00', '12:30', '13:00', // Lunch break
        '10:30', '11:00', // Morning booking
        '15:00', '15:30', '16:00', // Afternoon booking
      ]
    };

    for (let hour = 9; hour < 18; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Check if this time slot can accommodate the full service duration
        let available = true;

        // Check if starting time is in unavailable list
        if (detailerAvailability.unavailable.includes(time)) {
          available = false;
        }

        // Check if service would overlap with any unavailable slots
        if (available && totalServiceTime > 0) {
          const startTime = new Date(`2024-01-01 ${time}`);
          const endTime = new Date(startTime.getTime() + totalServiceTime * 60000);

          // Check each 30-minute slot within the service duration
          for (let checkTime = new Date(startTime); checkTime < endTime; checkTime.setMinutes(checkTime.getMinutes() + 30)) {
            const checkTimeStr = `${checkTime.getHours().toString().padStart(2, '0')}:${checkTime.getMinutes().toString().padStart(2, '0')}`;
            if (detailerAvailability.unavailable.includes(checkTimeStr)) {
              available = false;
              break;
            }
          }

          // Don't allow bookings that would end after 6 PM
          if (endTime.getHours() >= 18) {
            available = false;
          }
        }

        slots.push({
          time,
          available,
          estimatedEnd: totalServiceTime > 0 ?
            new Date(new Date(`2024-01-01 ${time}`).getTime() + totalServiceTime * 60000)
              .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
            : null
        });
      }
    }
    return slots;
  };

  const days = getNext7Days();
  const timeSlots = getTimeSlots();

  // Fetch customer coins for this detailer
  const fetchCustomerCoins = async () => {
    try {
      const response = await fetch('/api/coins/balance?customerId=cust_1');
      if (response.ok) {
        const data = await response.json();
        const detailerCoins = data.balances.find((balance: any) =>
          balance.coin.provider.businessName === detailer.businessName
        );
        setCustomerCoins(detailerCoins ? detailerCoins.balance : 0);
      }
    } catch (error) {
      console.error('Error fetching customer coins:', error);
    }
  };

  // Calculate total price with mixed vehicle types and luxury options
  const calculatePrice = (service: Service) => {
    if (!service) return 0;

    let totalPrice = 0;
    const vehicleMultipliers = {
      car: 1.0,
      suv: 1.25,
      truck: 1.4,
      van: 1.5
    };

    // Calculate price for each wash item
    washItems.forEach(item => {
      let itemPrice = service.price;
      itemPrice *= vehicleMultipliers[item.vehicleType];

      if (item.isLuxury) {
        itemPrice *= 1.15; // 15% luxury upcharge
      }

      totalPrice += itemPrice;
    });

    return Math.round(totalPrice);
  };

  // Calculate price after coin discount
  const getFinalPrice = (service: Service) => {
    const basePrice = calculatePrice(service);
    const coinDiscount = coinsToUse * detailer.coin.redemptionValue;
    return Math.max(0, basePrice - coinDiscount);
  };

  // Load customer vehicles
  const fetchCustomerVehicles = () => {
    const customer = mockCustomers.find(c => c.id === "cust_1");
    if (customer) {
      setCustomerVehicles(customer.vehicles);
    }
  };

  // Update wash items when vehicle quantities change
  const updateWashItems = (newQuantities: typeof vehicleQuantities) => {
    const newWashItems: typeof washItems = [];
    let itemId = 1;

    Object.entries(newQuantities).forEach(([vehicleType, quantity]) => {
      for (let i = 0; i < quantity; i++) {
        newWashItems.push({
          id: `wash_${itemId++}`,
          vehicleType: vehicleType as 'car' | 'suv' | 'truck' | 'van',
          isLuxury: false
        });
      }
    });

    setWashItems(newWashItems);
  };

  // Handle vehicle quantity changes
  const updateVehicleQuantity = (vehicleType: 'car' | 'suv' | 'truck' | 'van', change: number) => {
    const newQuantities = {
      ...vehicleQuantities,
      [vehicleType]: Math.max(0, Math.min(10, vehicleQuantities[vehicleType] + change))
    };
    setVehicleQuantities(newQuantities);
    updateWashItems(newQuantities);
  };

  // Toggle luxury for specific wash item
  const toggleWashLuxury = (washId: string) => {
    setWashItems(prev => prev.map(item =>
      item.id === washId ? { ...item, isLuxury: !item.isLuxury } : item
    ));
  };

  // Add stored vehicle to wash items
  const addStoredVehicle = (vehicle: Vehicle) => {
    if (selectedStoredVehicles.includes(vehicle.id)) return;

    const newWashItem = {
      id: `wash_stored_${vehicle.id}`,
      vehicleType: vehicle.bodyType,
      isLuxury: vehicle.isLuxury,
      vehicleId: vehicle.id
    };

    setWashItems(prev => [...prev, newWashItem]);
    setSelectedStoredVehicles(prev => [...prev, vehicle.id]);
  };

  // Remove stored vehicle from wash items
  const removeStoredVehicle = (vehicleId: string) => {
    setWashItems(prev => prev.filter(item => item.vehicleId !== vehicleId));
    setSelectedStoredVehicles(prev => prev.filter(id => id !== vehicleId));
  };

  // Calculate total number of washes
  const getTotalWashes = () => {
    return Object.values(vehicleQuantities).reduce((sum, quantity) => sum + quantity, 0) + washItems.filter(item => item.vehicleId).length;
  };

  // Load customer coins and vehicles when component mounts or detailer changes
  useEffect(() => {
    fetchCustomerCoins();
    fetchCustomerVehicles();
  }, [detailer.id]);

  return (
    <div>
      <div
        className="absolute inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      <div
        className="absolute bottom-0 left-4 right-4 bg-white rounded-t-2xl border-t border-slate-200 z-50 shadow-2xl max-h-[70vh] mb-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white rounded-t-2xl flex-shrink-0">
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Detailer Details View */}
            {bookingStep === 'details' && (
              <div>
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
              </div>
            )}

            {/* Service Selection */}
            {bookingStep === 'service' && (
              <div>
                <h4 className="text-sm font-semibold mb-3 text-slate-900">Select a Service</h4>
                <div className="space-y-2 mb-4">
                  {detailer.services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        setBookingStep('vehicle');
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
              </div>
            )}

            {/* Vehicle & Options Selection */}
            {bookingStep === 'vehicle' && selectedService && (
              <div>
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <h5 className="text-sm font-medium text-slate-900">{selectedService.name}</h5>
                  <div className="text-xs text-slate-600">Base price: ${selectedService.price}</div>
                </div>

                <h4 className="text-sm font-semibold mb-2 text-slate-900">Select Vehicles</h4>

                {/* My Vehicles Section */}
                {customerVehicles.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-medium mb-1.5 text-slate-700">My Vehicles</h5>
                    <div className="grid grid-cols-2 gap-1.5">
                      {customerVehicles.map((vehicle) => (
                        <button
                          key={vehicle.id}
                          onClick={() => selectedStoredVehicles.includes(vehicle.id)
                            ? removeStoredVehicle(vehicle.id)
                            : addStoredVehicle(vehicle)}
                          className={`p-2 text-xs border rounded transition-all ${selectedStoredVehicles.includes(vehicle.id)
                              ? 'border-slate-400 bg-slate-100 text-slate-900'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                        >
                          <div className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                          <div className="flex items-center justify-between">
                            <span className="capitalize text-slate-500">{vehicle.bodyType}</span>
                            {vehicle.isLuxury && <Crown className="h-3 w-3 text-amber-500" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Add Vehicles */}
                <div className="mb-3">
                  <h5 className="text-xs font-medium mb-1.5 text-slate-700">Quick Add</h5>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['car', 'suv', 'truck', 'van'] as const).map((vehicleType) => (
                      <div key={vehicleType} className="text-center">
                        <div className="flex items-center justify-between bg-slate-50 rounded p-1 mb-1">
                          <button
                            onClick={() => updateVehicleQuantity(vehicleType, -1)}
                            disabled={vehicleQuantities[vehicleType] === 0}
                            className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-50"
                          >
                            <ChevronDown className="h-3 w-3 text-slate-600" />
                          </button>
                          <span className="text-xs font-medium text-slate-900 min-w-[1rem] text-center">
                            {vehicleQuantities[vehicleType]}
                          </span>
                          <button
                            onClick={() => updateVehicleQuantity(vehicleType, 1)}
                            disabled={vehicleQuantities[vehicleType] === 10}
                            className="p-0.5 hover:bg-slate-200 rounded disabled:opacity-50"
                          >
                            <ChevronUp className="h-3 w-3 text-slate-600" />
                          </button>
                        </div>
                        <div className="text-xs capitalize text-slate-700">{vehicleType}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wash Summary */}
                {washItems.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-medium mb-1.5 text-slate-700">Your Washes ({washItems.length})</h5>
                    <div className="grid grid-cols-5 gap-1.5">
                      {washItems.map((item, index) => {
                        const vehicle = item.vehicleId ? customerVehicles.find(v => v.id === item.vehicleId) : null;
                        return (
                          <button
                            key={item.id}
                            onClick={() => item.vehicleId ? removeStoredVehicle(item.vehicleId) : toggleWashLuxury(item.id)}
                            className={`p-1.5 rounded border text-center transition-all ${item.isLuxury
                                ? 'border-amber-300 bg-amber-50'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                          >
                            <Car className={`h-3 w-3 mx-auto ${item.isLuxury ? 'text-amber-600' : 'text-slate-500'
                              }`} />
                            <div className="text-xs capitalize mt-0.5">
                              {vehicle ? `${vehicle.make.slice(0, 3)}` : item.vehicleType.slice(0, 3)}
                            </div>
                            {item.isLuxury && (
                              <Crown className="h-2 w-2 mx-auto text-amber-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {washItems.some(item => !item.vehicleId) && (
                      <p className="text-xs text-slate-500 mt-1 text-center">
                        Tap to toggle luxury (+15%)
                      </p>
                    )}
                  </div>
                )}

                {/* Coins Info with Immediate Application */}
                {customerCoins > 0 && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs font-medium text-amber-900">
                          🪙 You have {customerCoins} {detailer.coin.name}
                        </div>
                        <div className="text-xs text-amber-700">
                          Worth ${(customerCoins * detailer.coin.redemptionValue).toFixed(2)} in discounts
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCoinInfo(!showCoinInfo)}
                        className="text-xs text-amber-800 underline hover:text-amber-900"
                      >
                        {showCoinInfo ? 'Hide' : 'Use coins'}
                      </button>
                    </div>
                    {showCoinInfo && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-amber-700">Use coins:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCoinsToUse(Math.max(0, coinsToUse - 10))}
                              disabled={coinsToUse === 0}
                              className="p-1 hover:bg-amber-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronDown className="h-3 w-3 text-amber-700" />
                            </button>
                            <span className="min-w-[2rem] text-center text-xs font-medium text-amber-900">
                              {coinsToUse}
                            </span>
                            <button
                              onClick={() => setCoinsToUse(Math.min(customerCoins, coinsToUse + 10))}
                              disabled={coinsToUse >= customerCoins}
                              className="p-1 hover:bg-amber-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronUp className="h-3 w-3 text-amber-700" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-amber-700">
                          Discount: ${(coinsToUse * detailer.coin.redemptionValue).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Summary */}
                {getTotalWashes() > 0 && selectedService && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs font-medium text-slate-900 mb-2">Price Breakdown</div>
                    <div className="space-y-1 text-xs text-slate-600">
                      {Object.entries(vehicleQuantities).map(([vehicleType, quantity]) => {
                        if (quantity === 0) return null;
                        const luxuryCount = washItems.filter(item =>
                          item.vehicleType === vehicleType && item.isLuxury
                        ).length;
                        const regularCount = quantity - luxuryCount;
                        const multiplier = vehicleType === 'car' ? 1 : vehicleType === 'suv' ? 1.25 : vehicleType === 'truck' ? 1.4 : 1.5;

                        return (
                          <div key={vehicleType}>
                            {regularCount > 0 && (
                              <div className="flex justify-between">
                                <span className="capitalize">{vehicleType} ({regularCount}x)</span>
                                <span>${(selectedService.price * multiplier * regularCount).toFixed(2)}</span>
                              </div>
                            )}
                            {luxuryCount > 0 && (
                              <div className="flex justify-between">
                                <span className="capitalize">{vehicleType} luxury ({luxuryCount}x)</span>
                                <span>${(selectedService.price * multiplier * 1.15 * luxuryCount).toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {coinsToUse > 0 && (
                        <div className="flex justify-between text-amber-600">
                          <span>Coin discount ({coinsToUse} coins)</span>
                          <span>-${(coinsToUse * detailer.coin.redemptionValue).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-slate-300 pt-1 flex justify-between font-medium text-slate-900">
                        <span>Total</span>
                        <span>${getFinalPrice(selectedService)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setBookingStep('datetime')}
                  disabled={getTotalWashes() === 0}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getTotalWashes() > 0 ? 'Continue to Date & Time' : 'Select Vehicle Washes to Continue'}
                </button>
              </div>
            )}

            {/* Date & Time Selection */}
            {bookingStep === 'datetime' && selectedService && (
              <div>
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
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${selectedDate === day.date
                            ? 'border-slate-400 bg-slate-100 text-slate-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                      >
                        <div className="font-medium">{day.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Duration Info */}
                {getTotalWashes() > 0 && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-800">
                      <span className="font-medium">Service Duration:</span> ~{calculateServiceDuration()} minutes
                      {calculateServiceDuration() > 0 && (
                        <span className="text-blue-600 ml-1">
                          ({getTotalWashes()} wash{getTotalWashes() > 1 ? 'es' : ''})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Time Selection */}
                {selectedDate && (
                  <div className="mb-4">
                    <h5 className="text-xs font-medium mb-2 text-slate-700">Available Time Slots</h5>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-2 rounded text-xs transition-all ${!slot.available
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : selectedTime === slot.time
                                ? 'bg-slate-900 text-white'
                                : 'border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          <div className="font-medium">{slot.time}</div>
                          {slot.available && slot.estimatedEnd && (
                            <div className="text-xs opacity-75">
                              → {slot.estimatedEnd}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Times shown include full service duration
                    </p>
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
              </div>
            )}

            {/* Payment */}
            {bookingStep === 'payment' && selectedService && (
              <div>
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <h5 className="text-sm font-medium text-slate-900">{selectedService.name}</h5>
                  <div className="text-xs text-slate-600">
                    {selectedDate} at {selectedTime} • ${getFinalPrice(selectedService)}
                  </div>
                </div>

                <Elements stripe={stripePromise}>
                  <PaymentForm
                    selectedService={selectedService}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    getFinalPrice={getFinalPrice}
                    onSuccess={() => setBookingStep('success')}
                  />
                </Elements>
              </div>
            )}

            {/* Success */}
            {bookingStep === 'success' && (
              <div
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}