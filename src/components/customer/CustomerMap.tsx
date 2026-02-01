"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { mockDetailers } from "@/lib/mockData";
import { Star, Phone, Clock, X, MapPin, Shuffle, Search, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DetailerBottomSheet } from "@/components/map/DetailerBottomSheet";

// Mapbox access token - in production, use environment variables
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

export function CustomerMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedDetailer, setSelectedDetailer] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

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
      style: 'mapbox://styles/mapbox/dark-v11', // Dark mode map style
      center: [-118.2437, 34.0522], // Los Angeles
      zoom: 12,
      pitch: 0,
      bearing: 0
    });

    map.current.on('load', () => {
      setIsLoading(false);
      getCurrentLocation();
      // Show bottom sheet after a short delay
      setTimeout(() => setShowBottomSheet(true), 1500);
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
      // Custom SVG marker for dark mode
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#38bdf8" stroke="white" stroke-width="2" width="32" height="32">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
      `;
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedDetailer(detailer.id);
      });

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
    userEl.innerHTML = '<div style="width: 16px; height: 16px; background-color: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4);"></div>';

    new mapboxgl.Marker(userEl)
      .setLngLat(userLocation)
      .addTo(map.current);
  }, [userLocation]);

  return (
    <div className="relative h-[calc(100vh-8rem)] bg-brand-900 rounded-3xl overflow-hidden border border-brand-800 shadow-2xl">
      {/* Mapbox GL CSS */}
      <style jsx global>{`
        @import url('https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css');
        .mapboxgl-ctrl-group {
            background-color: #1e293b !important; /* brand-800 */
            border: 1px solid #334155 !important;
        }
        .mapboxgl-ctrl-icon {
            filter: invert(1);
        }
      `}</style>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-950/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-DEFAULT mx-auto mb-4"></div>
              <p className="text-brand-300 font-medium tracking-wide">Initializing Map...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
        {/* Find My Location Button */}
        <button
          onClick={getCurrentLocation}
          className="bg-brand-800/90 backdrop-blur border border-brand-700 p-3 rounded-xl shadow-lg hover:bg-brand-700 transition-colors group text-brand-300 hover:text-white"
          title="Find my location"
        >
          <Navigation className="h-5 w-5" />
        </button>

        {/* Location Scrambler Button */}
        <button
          onClick={scrambleLocation}
          className="bg-brand-800/90 backdrop-blur border border-brand-700 p-3 rounded-xl shadow-lg hover:bg-brand-700 transition-colors group text-brand-300 hover:text-white"
          title="Scramble location (demo)"
        >
          <Shuffle className="h-5 w-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="absolute top-6 left-6 right-20 z-30 max-w-md">
        <div className="bg-brand-800/90 backdrop-blur border border-brand-700 rounded-xl shadow-lg flex items-center px-4">
          <Search className="h-5 w-5 text-brand-400" />
          <input
            type="text"
            placeholder="Search area or service..."
            className="w-full bg-transparent border-0 px-4 py-3.5 text-white placeholder-brand-500 focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Detailer Bottom Sheet */}
      <DetailerBottomSheet 
        isVisible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        userLocation={userLocation}
      />
    </div>
  );
}