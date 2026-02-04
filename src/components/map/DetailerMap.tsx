"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapControls } from './MapControls';
import { TodaysRoutePanel } from './TodaysRoutePanel';
import { useAppStore } from '@/lib/store';
import { Navigation } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import './tumaroMap.css';

interface DetailerMapProps {
  className?: string;
}

const DEFAULT_VIEWPORT = {
  longitude: -118.2437,
  latitude: 34.0522,
  zoom: 12
};

export function DetailerMap({ className = '' }: DetailerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const detailerMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const etaMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const { userLocation, setUserLocation, mapViewState, setMapViewState, activeDetailerId } = useAppStore();

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapboxStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLocationPermissionDenied, setIsLocationPermissionDenied] = useState(false);
  const [isLocationShuffled, setIsLocationShuffled] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState<number[]>([]);

  // Track client mount to avoid hydration mismatch
  useEffect(() => { setIsMounted(true); }, []);

  // Get today's appointments for the active detailer (only on client)
  const todaysAppointments = isMounted
    ? useAppStore.getState().getTodaysAppointments(activeDetailerId)
    : [];

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken || '';

    const initialCenter = userLocation || mapViewState?.center || [DEFAULT_VIEWPORT.longitude, DEFAULT_VIEWPORT.latitude];
    const initialZoom = userLocation ? 16 : (mapViewState?.zoom || DEFAULT_VIEWPORT.zoom);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxStyle || 'mapbox://styles/mapbox/dark-v11',
      center: initialCenter,
      zoom: initialZoom,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    map.current.on('load', () => {
      const mapInstance = map.current;
      if (mapInstance) {
        // Hide ALL traffic layers
        const style = mapInstance.getStyle();
        if (style && style.layers) {
          style.layers.forEach((layer: any) => {
            if (layer.id && layer.id.toLowerCase().includes('traffic')) {
              try {
                mapInstance.setLayoutProperty(layer.id, 'visibility', 'none');
              } catch (e) { /* ignore */ }
            }
          });
        }
      }

      setIsLoaded(true);

      if (userLocation && map.current) {
        map.current.flyTo({ center: userLocation, zoom: 16, duration: 1000 });
      }

      setTimeout(() => {
        map.current?.resize();
        if (userLocation) {
          map.current?.flyTo({ center: userLocation, zoom: 16, duration: 500 });
        }
      }, 100);
    });

    map.current.on('error', (error) => {
      console.error('Map Error:', error);
    });

    const handleResize = () => {
      if (map.current) {
        map.current.resize();
        if (userLocation) {
          setTimeout(() => {
            map.current?.flyTo({ center: userLocation, zoom: 16, duration: 800 });
          }, 200);
        }
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (map.current) {
        const center = map.current.getCenter();
        const zoom = map.current.getZoom();
        if (!userLocation ||
          (Math.abs(center.lng - userLocation[0]) > 0.001 ||
            Math.abs(center.lat - userLocation[1]) > 0.001)) {
          setMapViewState({ center: [center.lng, center.lat], zoom });
        }
        map.current.remove();
      }
    };
  }, [setMapViewState, userLocation]);

  // GPS location
  const requestLocation = useCallback((forceRefresh = false) => {
    if (userLocation && !forceRefresh) {
      if (map.current) {
        map.current.flyTo({ center: userLocation, zoom: 16, duration: 1500 });
      }
      return;
    }
    if (!('geolocation' in navigator)) {
      setUserLocation([-118.2437, 34.0522]);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setUserLocation(coords);
        if (map.current) {
          map.current.flyTo({ center: coords, zoom: 16, duration: 2000 });
        }
        setIsLocationPermissionDenied(false);
      },
      () => {
        const fallback: [number, number] = [-118.2437, 34.0522];
        setUserLocation(fallback);
        setIsLocationPermissionDenied(true);
        if (map.current) {
          map.current.flyTo({ center: fallback, zoom: 12, duration: 1000 });
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  }, [userLocation, setUserLocation]);

  const scrambleLocation = useCallback(() => {
    if (!userLocation) return;
    const scrambled: [number, number] = [
      userLocation[0] + (Math.random() - 0.5) * 0.007,
      userLocation[1] + (Math.random() - 0.5) * 0.007
    ];
    setUserLocation(scrambled);
    setIsLocationShuffled(!isLocationShuffled);
    if (map.current) {
      map.current.flyTo({ center: scrambled, zoom: 16, duration: 1500 });
    }
  }, [userLocation, setUserLocation, isLocationShuffled]);

  const centerOnUser = useCallback(() => {
    if (!userLocation) { requestLocation(true); return; }
    if (map.current) {
      map.current.flyTo({ center: userLocation, zoom: 16, duration: 1500 });
    }
  }, [userLocation, requestLocation]);

  // Detailer's own location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;
    if (detailerMarkerRef.current) detailerMarkerRef.current.remove();

    const el = document.createElement('div');
    el.style.backgroundColor = '#ffffff';
    el.style.width = '16px';
    el.style.height = '16px';
    el.style.borderRadius = '50%';
    el.style.border = '4px solid #14B8A6';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

    detailerMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat(userLocation)
      .addTo(map.current);

    return () => { detailerMarkerRef.current?.remove(); };
  }, [userLocation]);

  // Request location on first load
  useEffect(() => {
    if (!userLocation && isLoaded) requestLocation();
  }, [userLocation, isLoaded, requestLocation]);

  // -- Today's Route logic --

  const clearRouteFromMap = useCallback(() => {
    const m = map.current;
    if (!m) return;
    // Remove layers and sources
    ['route-line-glow', 'route-line', 'job-markers', 'job-markers-label'].forEach(id => {
      try { if (m.getLayer(id)) m.removeLayer(id); } catch (e) { /* */ }
    });
    try { if (m.getSource('route')) m.removeSource('route'); } catch (e) { /* */ }
    try { if (m.getSource('jobs')) m.removeSource('jobs'); } catch (e) { /* */ }
    // Remove popups
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
    // Remove ETA markers
    etaMarkersRef.current.forEach(marker => marker.remove());
    etaMarkersRef.current = [];
  }, []);

  const activateRoute = useCallback(async () => {
    if (!map.current || !isLoaded || todaysAppointments.length === 0) return;

    const m = map.current;
    clearRouteFromMap();

    // Build GeoJSON for job markers
    const jobFeatures = todaysAppointments.map((apt, i) => ({
      type: 'Feature' as const,
      properties: {
        id: apt.id,
        index: i + 1,
        serviceName: apt.serviceName,
        customerName: apt.customerName || 'Customer',
        scheduledTime: apt.scheduledTime,
        scheduledDate: apt.scheduledDate,
        address: apt.address,
        price: apt.price,
        notes: apt.notes || '',
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [apt.longitude, apt.latitude]
      }
    }));

    // Add job markers source + layers
    m.addSource('jobs', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: jobFeatures }
    });

    m.addLayer({
      id: 'job-markers',
      type: 'circle',
      source: 'jobs',
      paint: {
        'circle-color': '#FFEE8C',
        'circle-radius': 10,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#D4A017',
        'circle-opacity': 0.95
      }
    });

    m.addLayer({
      id: 'job-markers-label',
      type: 'symbol',
      source: 'jobs',
      layout: {
        'text-field': ['get', 'index'],
        'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
        'text-size': 11,
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': '#333333'
      }
    });

    // Click handler for job markers
    m.on('click', 'job-markers', (e) => {
      const feature = e.features?.[0];
      if (!feature || !feature.properties) return;
      const props = feature.properties;
      const coords = (feature.geometry as any).coordinates.slice();

      // Time remaining
      const aptTime = new Date(`${props.scheduledDate} ${props.scheduledTime}`);
      const diffMs = aptTime.getTime() - Date.now();
      let timeRemaining = 'Now';
      if (diffMs > 0) {
        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        timeRemaining = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
      }

      if (popupRef.current) popupRef.current.remove();
      popupRef.current = new mapboxgl.Popup({ offset: 15, closeButton: true, maxWidth: '240px' })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family: system-ui, sans-serif; padding: 4px 0;">
            <div style="font-weight: 700; font-size: 14px; color: #111;">${props.serviceName}</div>
            <div style="font-size: 12px; color: #555; margin-top: 2px;">${props.customerName}</div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px;">
              <span style="font-size: 12px; color: #333; font-weight: 600;">${props.scheduledTime}</span>
              <span style="font-size: 12px; color: #EA580C; font-weight: 600;">in ${timeRemaining}</span>
            </div>
            <div style="font-size: 11px; color: #777; margin-top: 4px;">${props.address}</div>
            ${props.notes ? `<div style="font-size: 11px; color: #D97706; margin-top: 4px; background: #FFFBEB; padding: 4px 6px; border-radius: 4px;">${props.notes}</div>` : ''}
          </div>
        `)
        .addTo(m);
    });

    // Hover cursor
    m.on('mouseenter', 'job-markers', () => { m.getCanvas().style.cursor = 'pointer'; });
    m.on('mouseleave', 'job-markers', () => { m.getCanvas().style.cursor = ''; });

    // Fit bounds to all jobs
    const bounds = new mapboxgl.LngLatBounds();
    todaysAppointments.forEach(apt => bounds.extend([apt.longitude, apt.latitude]));
    if (userLocation) bounds.extend(userLocation);
    m.fitBounds(bounds, { padding: { top: 80, bottom: 80, left: 400, right: 80 }, maxZoom: 14, duration: 1500 });

    // Fetch route from Mapbox Directions API
    // Need at least 2 waypoints: user location + 1 appointment, or 2+ appointments
    const hasEnoughWaypoints = todaysAppointments.length >= 2 || (todaysAppointments.length >= 1 && userLocation);
    if (hasEnoughWaypoints) {
      const waypoints = todaysAppointments.map(apt => `${apt.longitude},${apt.latitude}`);
      // Prepend user location as starting point
      if (userLocation) {
        waypoints.unshift(`${userLocation[0]},${userLocation[1]}`);
      }
      const coordsStr = waypoints.join(';');

      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsStr}?geometries=geojson&overview=full&access_token=${mapboxToken}`
        );
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];

          // Add route line source
          m.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          });

          // Glow layer (outer)
          m.addLayer({
            id: 'route-line-glow',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#32CD32',
              'line-width': 10,
              'line-opacity': 0.25,
              'line-blur': 4
            }
          }, 'job-markers'); // Insert below markers

          // Inner line
          m.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#32CD32',
              'line-width': 4,
              'line-opacity': 0.9
            }
          }, 'job-markers');

          // Parse ETAs from legs
          const legs = route.legs || [];
          // If we prepended user location, first leg is user -> first job
          const startIndex = userLocation ? 1 : 0;
          const etas: number[] = [];
          for (let i = startIndex; i < legs.length; i++) {
            etas.push(Math.round(legs[i].duration / 60));
          }
          setEtaMinutes(etas);

          // Add ETA markers between jobs on the map
          for (let i = 0; i < etas.length; i++) {
            const fromApt = todaysAppointments[i];
            const toApt = todaysAppointments[i + 1];
            if (!fromApt || !toApt) continue;

            const midLng = (fromApt.longitude + toApt.longitude) / 2;
            const midLat = (fromApt.latitude + toApt.latitude) / 2;

            const el = document.createElement('div');
            el.style.cssText = `
              background: white;
              border: 2px solid #32CD32;
              border-radius: 12px;
              padding: 2px 8px;
              font-size: 11px;
              font-weight: 600;
              color: #228B22;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
              pointer-events: none;
            `;
            el.textContent = `${etas[i]} min`;

            const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
              .setLngLat([midLng, midLat])
              .addTo(m);
            etaMarkersRef.current.push(marker);
          }
        }
      } catch (err) {
        console.error('Failed to fetch route:', err);
      }
    }

    setShowRoute(true);
  }, [isLoaded, todaysAppointments, userLocation, mapboxToken, clearRouteFromMap]);

  const fitAllMarkers = useCallback(() => {
    if (!map.current || todaysAppointments.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    todaysAppointments.forEach(apt => bounds.extend([apt.longitude, apt.latitude]));
    if (userLocation) bounds.extend(userLocation);
    map.current.fitBounds(bounds, { padding: { top: 80, bottom: 80, left: 400, right: 80 }, maxZoom: 14, duration: 1500 });
  }, [todaysAppointments, userLocation]);

  const deactivateRoute = useCallback(() => {
    clearRouteFromMap();
    setShowRoute(false);
    setEtaMinutes([]);

    // Fly back to user location
    if (map.current && userLocation) {
      map.current.flyTo({ center: userLocation, zoom: 16, duration: 1500 });
    }
  }, [clearRouteFromMap, userLocation]);

  const handleJobClick = useCallback((apt: typeof todaysAppointments[0]) => {
    if (!map.current) return;
    map.current.flyTo({
      center: [apt.longitude, apt.latitude],
      zoom: 15,
      duration: 1000
    });

    // Show popup
    if (popupRef.current) popupRef.current.remove();
    const aptTime = new Date(`${apt.scheduledDate} ${apt.scheduledTime}`);
    const diffMs = aptTime.getTime() - Date.now();
    let timeRemaining = 'Now';
    if (diffMs > 0) {
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      timeRemaining = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    }

    popupRef.current = new mapboxgl.Popup({ offset: 15, closeButton: true, maxWidth: '240px' })
      .setLngLat([apt.longitude, apt.latitude])
      .setHTML(`
        <div style="font-family: system-ui, sans-serif; padding: 4px 0;">
          <div style="font-weight: 700; font-size: 14px; color: #111;">${apt.serviceName}</div>
          <div style="font-size: 12px; color: #555; margin-top: 2px;">${apt.customerName || 'Customer'}</div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px;">
            <span style="font-size: 12px; color: #333; font-weight: 600;">${apt.scheduledTime}</span>
            <span style="font-size: 12px; color: #EA580C; font-weight: 600;">in ${timeRemaining}</span>
          </div>
          <div style="font-size: 11px; color: #777; margin-top: 4px;">${apt.address}</div>
        </div>
      `)
      .addTo(map.current);
  }, [todaysAppointments]);

  // Missing env check
  if (!mapboxToken || !mapboxStyle) {
    return (
      <div className={`relative h-full ${className} flex items-center justify-center bg-gray-900`}>
        <div className="text-center text-white p-8">
          <h3 className="text-xl font-semibold mb-4">Map Configuration Error</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p>Token: {mapboxToken ? 'Found' : 'Missing NEXT_PUBLIC_MAPBOX_TOKEN'}</p>
            <p>Style: {mapboxStyle ? 'Found' : 'Missing NEXT_PUBLIC_MAPBOX_STYLE'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map container */}
      <div
        ref={mapContainer}
        className="absolute inset-0"
      />

      {/* Map Controls */}
      <MapControls
        onZoomIn={() => map.current?.zoomIn()}
        onZoomOut={() => map.current?.zoomOut()}
        onCenterOnUser={centerOnUser}
        onScrambleLocation={scrambleLocation}
        hasUserLocation={!!userLocation}
        isLocationDenied={isLocationPermissionDenied}
        isLocationShuffled={isLocationShuffled}
      />

      {/* Today's Route Button */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={showRoute ? deactivateRoute : activateRoute}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg font-semibold text-sm transition-all ${
            showRoute
              ? 'text-gray-800 hover:opacity-90'
              : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200'
          }`}
          style={showRoute ? { backgroundColor: '#B7E892' } : undefined}
        >
          <Navigation className={`h-4 w-4 ${showRoute ? 'text-gray-800' : 'text-gray-600'}`} style={!showRoute ? { color: '#B7E892' } : undefined} />
          {showRoute ? 'Close Route' : "Today's Route"}
          {!showRoute && todaysAppointments.length > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full text-gray-800 text-xs flex items-center justify-center" style={{ backgroundColor: '#B7E892' }}>
              {todaysAppointments.length}
            </span>
          )}
        </button>
      </div>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto"></div>
            <p className="mt-2 text-gray-300">Loading map...</p>
          </div>
        </div>
      )}

      {/* Today's Route Panel */}
      <TodaysRoutePanel
        isOpen={showRoute}
        onClose={deactivateRoute}
        appointments={todaysAppointments}
        etaMinutes={etaMinutes}
        onJobClick={handleJobClick}
        onFitAllMarkers={fitAllMarkers}
      />
    </div>
  );
}
