"use client";

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Home, Building } from 'lucide-react';
import { BookingData } from '../BookingWizard';

interface AddressStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export function AddressStep({
  bookingData,
  updateBookingData,
  onNext,
  onPrev,
  isLoading,
  setIsLoading,
  setError
}: AddressStepProps) {
  const [address, setAddress] = useState<Address>({
    street: bookingData.serviceAddress?.street || '',
    city: bookingData.serviceAddress?.city || '',
    state: bookingData.serviceAddress?.state || '',
    postalCode: bookingData.serviceAddress?.postalCode || ''
  });
  
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);

  useEffect(() => {
    // Load saved addresses (mock data)
    setSavedAddresses([
      {
        street: '123 Main Street',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98101',
        latitude: 47.6062,
        longitude: -122.3321
      },
      {
        street: '456 Oak Avenue',
        city: 'Seattle',
        state: 'WA', 
        postalCode: '98102',
        latitude: 47.6205,
        longitude: -122.3212
      }
    ]);
  }, []);

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setUseCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get address
          const geocodedAddress = await reverseGeocode(latitude, longitude);
          
          setAddress(geocodedAddress);
          updateBookingData({
            serviceAddress: {
              ...geocodedAddress,
              latitude,
              longitude
            }
          });
        } catch (error: any) {
          setError('Failed to get address from location');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setError('Failed to get your location. Please enter address manually.');
        setUseCurrentLocation(false);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<Address> => {
    // Mock reverse geocoding - in real app, use Google Maps or similar
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          street: '789 Current Location St',
          city: 'Seattle',
          state: 'WA',
          postalCode: '98103',
          latitude: lat,
          longitude: lng
        });
      }, 1000);
    });
  };

  const validateAndGeocodeAddress = async () => {
    if (!address.street || !address.city || !address.state || !address.postalCode) {
      setError('Please fill in all required fields');
      return false;
    }

    setIsValidatingAddress(true);
    try {
      // Mock address validation and geocoding
      const coordinates = await geocodeAddress(address);
      
      // Check if address is in service area
      const isInServiceArea = await checkServiceArea(coordinates, bookingData.providerId!);
      
      if (!isInServiceArea) {
        setError('This address is outside the provider\'s service area');
        return false;
      }

      updateBookingData({
        serviceAddress: {
          ...address,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        }
      });
      
      return true;
    } catch (error: any) {
      setError('Invalid address. Please check and try again.');
      return false;
    } finally {
      setIsValidatingAddress(false);
    }
  };

  const geocodeAddress = async (addr: Address): Promise<{ latitude: number; longitude: number }> => {
    // Mock geocoding - in real app, use Google Maps Geocoding API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful geocoding
        if (addr.street && addr.city) {
          resolve({
            latitude: 47.6062 + (Math.random() - 0.5) * 0.1,
            longitude: -122.3321 + (Math.random() - 0.5) * 0.1
          });
        } else {
          reject(new Error('Invalid address'));
        }
      }, 1500);
    });
  };

  const checkServiceArea = async (coords: { latitude: number; longitude: number }, providerId: string): Promise<boolean> => {
    // Mock service area check
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate service area validation
        resolve(true); // For demo, always return true
      }, 500);
    });
  };

  const handleSavedAddressSelect = (savedAddress: Address) => {
    setAddress(savedAddress);
    updateBookingData({
      serviceAddress: {
        ...savedAddress,
        latitude: savedAddress.latitude!,
        longitude: savedAddress.longitude!
      }
    });
  };

  const handleContinue = async () => {
    if (bookingData.serviceAddress?.latitude && bookingData.serviceAddress?.longitude) {
      onNext();
      return;
    }

    const isValid = await validateAndGeocodeAddress();
    if (isValid) {
      onNext();
    }
  };

  const isFormComplete = address.street && address.city && address.state && address.postalCode;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Service Address</h3>
        <p className="text-sm text-gray-600">
          Where would you like us to provide the service?
        </p>
      </div>

      {/* Current Location Option */}
      <div className="border rounded-lg p-4">
        <button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Navigation className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">
            {isLoading ? 'Getting location...' : 'Use Current Location'}
          </span>
        </button>
      </div>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && !useCurrentLocation && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Saved Addresses</h4>
          <div className="space-y-2">
            {savedAddresses.map((savedAddr, index) => (
              <button
                key={index}
                onClick={() => handleSavedAddressSelect(savedAddr)}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{savedAddr.street}</p>
                    <p className="text-sm text-gray-600">
                      {savedAddr.city}, {savedAddr.state} {savedAddr.postalCode}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual Address Entry */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Enter Address Manually</h4>
        <div className="space-y-4">
          {/* Street Address */}
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              id="street"
              value={address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder="123 Main Street"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                id="city"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="Seattle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <select
                id="state"
                value={address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              >
                <option value="">Select State</option>
                <option value="WA">Washington</option>
                <option value="CA">California</option>
                <option value="OR">Oregon</option>
                <option value="TX">Texas</option>
                <option value="NY">New York</option>
                {/* Add more states as needed */}
              </select>
            </div>
            
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                id="postalCode"
                value={address.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                placeholder="98101"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address Validation Status */}
      {bookingData.serviceAddress?.latitude && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Address verified</span>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="pt-4">
        <button
          onClick={handleContinue}
          disabled={!isFormComplete || isValidatingAddress}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            !isFormComplete || isValidatingAddress
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {isValidatingAddress ? 'Validating Address...' : 'Continue to Vehicle Info'}
        </button>
      </div>
    </div>
  );
}