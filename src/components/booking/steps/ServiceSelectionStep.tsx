"use client";

import { useState, useEffect } from 'react';
import { Star, Clock, DollarSign, Plus, Minus } from 'lucide-react';
import { BookingData } from '../BookingWizard';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  priceType: string;
  estimatedDuration: number;
  requiresWater: boolean;
  requiresPower: boolean;
}

interface Provider {
  id: string;
  businessName: string;
  avgRating: number;
  totalBookings: number;
  responseTime: number;
}

interface ServiceSelectionStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function ServiceSelectionStep({
  bookingData,
  updateBookingData,
  onNext,
  isLoading,
  setIsLoading,
  setError
}: ServiceSelectionStepProps) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [addOns, setAddOns] = useState<string[]>([]);

  useEffect(() => {
    if (bookingData.providerId) {
      fetchProviderAndServices();
    }
  }, [bookingData.providerId]);

  useEffect(() => {
    if (bookingData.serviceId) {
      const service = services.find(s => s.id === bookingData.serviceId);
      if (service) {
        setSelectedService(service);
      }
    }
  }, [bookingData.serviceId, services]);

  const fetchProviderAndServices = async () => {
    setIsLoading(true);
    try {
      // Fetch provider info
      const providerResponse = await fetch(`/api/providers/${bookingData.providerId}`);
      if (!providerResponse.ok) throw new Error('Failed to fetch provider');
      const providerData = await providerResponse.json();
      setProvider(providerData.provider);

      // Fetch services
      const servicesResponse = await fetch(`/api/providers/${bookingData.providerId}/services`);
      if (!servicesResponse.ok) throw new Error('Failed to fetch services');
      const servicesData = await servicesResponse.json();
      setServices(servicesData.services);

    } catch (error: any) {
      setError(error.message || 'Failed to load provider information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    updateBookingData({ 
      serviceId: service.id,
      addOnServices: []
    });
    setAddOns([]);
  };

  const handleAddOnToggle = (addOnId: string) => {
    const newAddOns = addOns.includes(addOnId)
      ? addOns.filter(id => id !== addOnId)
      : [...addOns, addOnId];
    
    setAddOns(newAddOns);
    updateBookingData({ addOnServices: newAddOns });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Provider Info */}
      {provider && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{provider.businessName}</h3>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{provider.avgRating?.toFixed(1) || 'New'}</span>
                  <span className="ml-1">({provider.totalBookings} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                  <span>~{provider.responseTime || 15}min response</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Selection */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Choose a Service</h4>
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedService?.id === service.id
                  ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleServiceSelect(service)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h5 className="font-medium text-gray-900">{service.name}</h5>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {service.category.replace('_', ' ')}
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>
                        {service.priceType === 'FIXED' 
                          ? formatPrice(service.basePrice)
                          : `From ${formatPrice(service.basePrice)}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatDuration(service.estimatedDuration)}</span>
                    </div>
                  </div>
                  {(service.requiresWater || service.requiresPower) && (
                    <div className="flex items-center space-x-2 mt-2">
                      {service.requiresWater && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Water Required
                        </span>
                      )}
                      {service.requiresPower && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Power Required
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedService?.id === service.id
                      ? 'border-teal-500 bg-teal-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedService?.id === service.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add-Ons Section */}
      {selectedService && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Add-On Services (Optional)</h4>
          <div className="space-y-3">
            {ADD_ON_OPTIONS.map((addOn) => (
              <div
                key={addOn.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h6 className="text-sm font-medium text-gray-900">{addOn.name}</h6>
                    <span className="text-sm text-gray-600">+{formatPrice(addOn.price)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{addOn.description}</p>
                </div>
                <button
                  onClick={() => handleAddOnToggle(addOn.id)}
                  className={`p-1 rounded-full transition-colors ${
                    addOns.includes(addOn.id)
                      ? 'text-teal-600 bg-teal-100 hover:bg-teal-200'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {addOns.includes(addOn.id) ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {selectedService && (
        <div className="pt-4">
          <button
            onClick={onNext}
            className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Continue to Scheduling
          </button>
        </div>
      )}
    </div>
  );
}

// Mock add-on options - in real app, fetch from API
const ADD_ON_OPTIONS = [
  {
    id: 'interior-detail',
    name: 'Interior Deep Clean',
    description: 'Vacuum, steam clean seats, dashboard treatment',
    price: 2500 // $25.00
  },
  {
    id: 'tire-shine',
    name: 'Tire Shine Treatment',
    description: 'Professional tire cleaning and shine application',
    price: 1500 // $15.00
  },
  {
    id: 'engine-bay',
    name: 'Engine Bay Cleaning',
    description: 'Safe engine compartment cleaning and detailing',
    price: 3000 // $30.00
  },
  {
    id: 'headlight-restoration',
    name: 'Headlight Restoration',
    description: 'Remove oxidation and restore clarity',
    price: 4000 // $40.00
  }
];