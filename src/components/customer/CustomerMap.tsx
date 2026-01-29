"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { mockDetailers } from "@/lib/mockData";
import { Star, Phone, Clock, X, MapPin, Shuffle } from "lucide-react";

// Mapbox access token - in production, use environment variables
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

export function CustomerMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedDetailer, setSelectedDetailer] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selected = selectedDetailer ? mockDetailers.find(d => d.id === selectedDetailer) : null;

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ];
          setUserLocation(coords);
          if (map.current) {
            map.current.flyTo({
              center: coords,
              zoom: 14,
              duration: 2000
            });
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to Los Angeles
          const fallback: [number, number] = [-118.2437, 34.0522];
          setUserLocation(fallback);
          if (map.current) {
            map.current.flyTo({
              center: fallback,
              zoom: 12,
              duration: 1000
            });
          }
        }
      );
    } else {
      // Fallback to Los Angeles
      const fallback: [number, number] = [-118.2437, 34.0522];
      setUserLocation(fallback);
    }
  };

  // Scramble location (demo feature)
  const scrambleLocation = () => {
    const randomLat = 34.0522 + (Math.random() - 0.5) * 0.2; // ±0.1 degrees around LA
    const randomLng = -118.2437 + (Math.random() - 0.5) * 0.2;
    const newLocation: [number, number] = [randomLng, randomLat];
    
    setUserLocation(newLocation);
    if (map.current) {
      map.current.flyTo({
        center: newLocation,
        zoom: 14,
        duration: 1500
      });
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-118.2437, 34.0522], // Los Angeles
      zoom: 12,
      pitch: 0,
      bearing: 0
    });

    map.current.on('load', () => {
      setIsLoading(false);
      getCurrentLocation();
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Add/update markers when detailers change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each detailer
    mockDetailers.forEach((detailer) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMzQwMSAyIDUgNS4xMzQwMSA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTM0MDEgMTUuODY2IDIgMTIgMloiIGZpbGw9IiMxNEI4QTYiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iOSIgcj0iMyIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K)';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundSize = '100%';
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => setSelectedDetailer(detailer.id));

      const marker = new mapboxgl.Marker(el)
        .setLngLat([detailer.location.lng, detailer.location.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, []);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Create user location marker
    const userEl = document.createElement('div');
    userEl.className = 'user-marker';
    userEl.style.backgroundColor = '#3B82F6';
    userEl.style.border = '3px solid white';
    userEl.style.borderRadius = '50%';
    userEl.style.width = '16px';
    userEl.style.height = '16px';
    userEl.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.3)';

    new mapboxgl.Marker(userEl)
      .setLngLat(userLocation)
      .addTo(map.current);
  }, [userLocation]);

  return (
    <div className="relative h-[calc(100vh-8rem)] bg-gray-100 rounded-xl overflow-hidden">
      {/* Mapbox GL CSS */}
      <style jsx global>{`
        @import url('https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css');
        .marker {
          display: block;
          border: none;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        {/* Find My Location Button */}
        <button 
          onClick={getCurrentLocation}
          className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors group"
          title="Find my location"
        >
          <MapPin className="h-5 w-5 text-gray-600 group-hover:text-teal-600" />
        </button>
        
        {/* Location Scrambler Button */}
        <button 
          onClick={scrambleLocation}
          className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors group"
          title="Scramble location (demo)"
        >
          <Shuffle className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-24 z-30">
        <div className="bg-white rounded-lg shadow-lg">
          <input
            type="text"
            placeholder="Search area or service..."
            className="w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Bottom Sheet */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t border-gray-200 p-4 z-30 max-h-[60%] overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{selected.businessName}</h3>
              <p className="text-gray-600">{selected.name}</p>
            </div>
            <button 
              onClick={() => setSelectedDetailer(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium">{selected.rating}</span>
              <span className="text-sm text-gray-500">({selected.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{selected.hours}</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-gray-900">Popular Services</h4>
            {selected.services.slice(0, 3).map((service) => (
              <div key={service.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-600">{service.description}</div>
                  <div className="text-xs text-gray-500">{service.duration} min</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-teal-600">${service.price}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-600 transition-colors">
              Book Service
            </button>
            <button className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Phone className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}