"use client";

import { Plus, Minus, MapPin, Shuffle } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnUser: () => void;
  onScrambleLocation: () => void;
  hasUserLocation: boolean;
  isLocationDenied: boolean;
  isLocationShuffled: boolean;
}

export function MapControls({ 
  onZoomIn, 
  onZoomOut, 
  onCenterOnUser,
  onScrambleLocation,
  hasUserLocation, 
  isLocationDenied,
  isLocationShuffled
}: MapControlsProps) {
  return (
    <div className="absolute bottom-24 right-4 z-30 flex flex-col gap-2 lg:bottom-8 lg:right-6">
      {/* Control pill */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Zoom In */}
        <button
          onClick={onZoomIn}
          className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 transition-colors border-b border-gray-200"
          title="Zoom in"
        >
          <Plus className="h-5 w-5 text-gray-700" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={onZoomOut}
          className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 transition-colors border-b border-gray-200"
          title="Zoom out"
        >
          <Minus className="h-5 w-5 text-gray-700" />
        </button>

        {/* Center on User */}
        <button
          onClick={onCenterOnUser}
          className={`flex items-center justify-center w-12 h-12 transition-colors border-b border-gray-200 ${
            hasUserLocation
              ? 'hover:bg-gray-50 text-teal-600'
              : isLocationDenied
              ? 'hover:bg-gray-50 text-gray-400'
              : 'hover:bg-gray-50 text-gray-700'
          }`}
          title={
            hasUserLocation
              ? 'Center on my location'
              : isLocationDenied
              ? 'Location access denied'
              : 'Get my location'
          }
        >
          <MapPin className="h-5 w-5" />
        </button>

        {/* Location Scrambler */}
        <button
          onClick={onScrambleLocation}
          disabled={!hasUserLocation}
          className={`flex items-center justify-center w-12 h-12 transition-colors ${
            !hasUserLocation
              ? 'text-gray-400 cursor-not-allowed'
              : isLocationShuffled
              ? 'bg-purple-100 hover:bg-purple-200 text-purple-700'
              : 'hover:bg-gray-50 text-purple-600'
          }`}
          title={
            !hasUserLocation 
              ? 'Need location first' 
              : isLocationShuffled 
              ? 'Return to original location' 
              : 'Shuffle location (demo)'
          }
        >
          <Shuffle className={`h-5 w-5 transition-transform ${isLocationShuffled ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}