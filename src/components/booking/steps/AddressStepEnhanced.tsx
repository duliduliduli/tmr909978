"use client";

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Home, Building, Plus, Check, Star } from 'lucide-react';
import { BookingData } from '../BookingWizard';
import { AddressAutocomplete } from '@/components/shared/AddressAutocomplete';
import { useAppStore } from '@/lib/store';
import { formatAddress } from '@/lib/utils';

interface AddressStepProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface SelectedAddress {
  id?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
}

export function AddressStepEnhanced({
  bookingData,
  updateBookingData,
  onNext,
  onPrev,
  isLoading,
  setIsLoading,
  setError
}: AddressStepProps) {
  const { 
    activeCustomerId,
    savedAddresses,
    getSavedAddressesByCustomer,
    addSavedAddress,
    updateAddressLastUsed,
    setDefaultAddress
  } = useAppStore();
  
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  
  const customerAddresses = getSavedAddressesByCustomer(activeCustomerId);

  useEffect(() => {
    // If booking already has an address, use it
    if (bookingData.serviceAddress) {
      setSelectedAddress({
        street: bookingData.serviceAddress.street,
        city: bookingData.serviceAddress.city,
        state: bookingData.serviceAddress.state,
        postalCode: bookingData.serviceAddress.postalCode,
        latitude: bookingData.serviceAddress.latitude || 0,
        longitude: bookingData.serviceAddress.longitude || 0,
        fullAddress: formatAddress(bookingData.serviceAddress)
      });
      setAddressInput(formatAddress(bookingData.serviceAddress));
    }
  }, [bookingData.serviceAddress]);

  const handleAddressSelect = (address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    fullAddress: string;
  }) => {
    setSelectedAddress(address);
    updateBookingData({
      serviceAddress: {
        ...address
      }
    });
    setError(null);
  };

  const handleSavedAddressSelect = (addressId: string) => {
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      setSelectedAddress({
        id: address.id,
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        latitude: address.latitude,
        longitude: address.longitude,
        fullAddress: address.fullAddress
      });
      setAddressInput(address.fullAddress);
      updateBookingData({
        serviceAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          latitude: address.latitude,
          longitude: address.longitude
        }
      });
      // Update last used
      updateAddressLastUsed(address.id);
    }
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
          
          // Reverse geocode using Mapbox
          const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
            `access_token=${MAPBOX_TOKEN}&` +
            `types=address&` +
            `limit=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              const feature = data.features[0];
              const parts = feature.place_name.split(',').map((p: string) => p.trim());
              const context = feature.context || [];
              
              const cityContext = context.find((c: any) => c.id.startsWith('place.'));
              const stateContext = context.find((c: any) => c.id.startsWith('region.'));
              const postalContext = context.find((c: any) => c.id.startsWith('postcode.'));
              
              const address = {
                street: feature.properties?.address || parts[0] || '',
                city: cityContext?.text || parts[1] || '',
                state: stateContext?.short_code?.replace('US-', '') || stateContext?.text || parts[2] || '',
                postalCode: postalContext?.text || parts[3] || '',
                latitude,
                longitude,
                fullAddress: feature.place_name
              };
              
              handleAddressSelect(address);
              setAddressInput(address.fullAddress);
            }
          }
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

  const handleContinue = async () => {
    if (!selectedAddress) {
      setError('Please select or enter an address');
      return;
    }

    // Save new address if requested
    if (saveAsNew && !selectedAddress.id) {
      addSavedAddress({
        customerId: activeCustomerId,
        label: addressLabel || undefined,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
        fullAddress: selectedAddress.fullAddress,
        isDefault: makeDefault
      });
      
      // If making default, update it
      if (makeDefault) {
        const newAddresses = useAppStore.getState().savedAddresses;
        const newAddress = newAddresses[newAddresses.length - 1];
        if (newAddress) {
          setDefaultAddress(newAddress.id);
        }
      }
    }

    onNext();
  };

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
      {customerAddresses.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Saved Addresses</h4>
          <div className="space-y-2">
            {customerAddresses.map((address) => (
              <button
                key={address.id}
                onClick={() => handleSavedAddressSelect(address.id)}
                className={`w-full text-left p-3 border rounded-lg transition-colors ${
                  selectedAddress?.id === address.id 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {address.label === 'Home' ? (
                      <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                    ) : address.label === 'Work' ? (
                      <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                    ) : (
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {address.label || address.street}
                        </p>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Star className="h-3 w-3 mr-0.5" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.street}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                    </div>
                  </div>
                  {selectedAddress?.id === address.id && (
                    <Check className="h-5 w-5 text-blue-500 mt-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New Address Entry */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Enter New Address</h4>
        <AddressAutocomplete
          value={addressInput}
          onChange={setAddressInput}
          onAddressSelect={handleAddressSelect}
          placeholder="Start typing your address..."
          disabled={isLoading}
        />
        
        {/* Save Address Options */}
        {selectedAddress && !selectedAddress.id && (
          <div className="mt-4 space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={saveAsNew}
                onChange={(e) => setSaveAsNew(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-900">Save this address for future use</span>
            </label>
            
            {saveAsNew && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Label (optional)
                  </label>
                  <input
                    type="text"
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    placeholder="e.g., Home, Work, Mom's House"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={makeDefault}
                    onChange={(e) => setMakeDefault(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-900">Set as default address</span>
                </label>
              </>
            )}
          </div>
        )}
      </div>

      {/* Address Validation Status */}
      {selectedAddress && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Address verified and ready</span>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="pt-4">
        <button
          onClick={handleContinue}
          disabled={!selectedAddress || isLoading}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            !selectedAddress || isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}