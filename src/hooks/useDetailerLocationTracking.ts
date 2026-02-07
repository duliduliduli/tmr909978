"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore, type Appointment } from '@/lib/store';
import { isWithinArrivalRadius, APPOINTMENT_CONFIG } from '@/lib/utils';

interface UseDetailerLocationTrackingOptions {
  appointments: Appointment[];
  enabled: boolean;
}

interface UseDetailerLocationTrackingReturn {
  isTracking: boolean;
  currentLocation: [number, number] | null;
  locationError: string | null;
  startTracking: () => void;
  stopTracking: () => void;
}

export function useDetailerLocationTracking({
  appointments,
  enabled,
}: UseDetailerLocationTrackingOptions): UseDetailerLocationTrackingReturn {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { markAppointmentArrived, setUserLocation } = useAppStore();

  // Check proximity to all active appointments
  const checkProximityToAppointments = useCallback((lat: number, lng: number) => {
    for (const apt of appointments) {
      // Only check appointments that haven't been arrived at yet
      if (!apt.isArrived && apt.status !== 'completed' && apt.status !== 'cancelled') {
        if (isWithinArrivalRadius(lat, lng, apt.latitude, apt.longitude)) {
          console.log(`[Location Tracking] Arrived at appointment ${apt.id}`);
          markAppointmentArrived(apt.id);
        }
      }
    }
  }, [appointments, markAppointmentArrived]);

  const handlePositionSuccess = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const newLocation: [number, number] = [longitude, latitude];

    setCurrentLocation(newLocation);
    setUserLocation(newLocation);
    setLocationError(null);

    // Check proximity to appointments
    checkProximityToAppointments(latitude, longitude);
  }, [setUserLocation, checkProximityToAppointments]);

  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    console.error('[Location Tracking] Error:', error.message);
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationError('Location permission denied');
        break;
      case error.POSITION_UNAVAILABLE:
        setLocationError('Location unavailable');
        break;
      case error.TIMEOUT:
        setLocationError('Location request timed out');
        break;
      default:
        setLocationError('Unknown location error');
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    if (watchIdRef.current !== null) {
      return; // Already tracking
    }

    setIsTracking(true);
    setLocationError(null);

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );

    // Also set up periodic proximity checks
    checkIntervalRef.current = setInterval(() => {
      if (currentLocation) {
        checkProximityToAppointments(currentLocation[1], currentLocation[0]);
      }
    }, APPOINTMENT_CONFIG.LOCATION_UPDATE_INTERVAL);

    console.log('[Location Tracking] Started');
  }, [handlePositionSuccess, handlePositionError, currentLocation, checkProximityToAppointments]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (checkIntervalRef.current !== null) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    setIsTracking(false);
    console.log('[Location Tracking] Stopped');
  }, []);

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled && appointments.length > 0) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [enabled, appointments.length, startTracking, stopTracking]);

  return {
    isTracking,
    currentLocation,
    locationError,
    startTracking,
    stopTracking,
  };
}
