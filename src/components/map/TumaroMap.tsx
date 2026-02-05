"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection, Feature, Point } from 'geojson';
import { MapControls } from './MapControls';
import { DetailerBottomSheet } from './DetailerBottomSheet';
import { useAppStore } from '@/lib/store';
import 'mapbox-gl/dist/mapbox-gl.css';
import './tumaroMap.css';

interface TumaroMapProps {
  className?: string;
}

// Default viewport (Los Angeles for testing)
const DEFAULT_VIEWPORT = {
  longitude: -118.2437,
  latitude: 34.0522,
  zoom: 12
};

export function TumaroMap({ className = '' }: TumaroMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const customerMarkerRef = useRef<mapboxgl.Marker | null>(null);
  
  // Global store for location persistence
  const { userLocation, setUserLocation, mapViewState, setMapViewState } = useAppStore();
  
  // Debug environment variables
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapboxStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE;
  
  console.log('🗺️ TumaroMap Debug:', {
    mapboxToken: mapboxToken ? `${mapboxToken.substring(0, 20)}...` : 'NOT_FOUND',
    mapboxStyle,
    env: process.env.NODE_ENV
  });
  
  // State
  const [isLoaded, setIsLoaded] = useState(false);
  const [detailers, setDetailers] = useState<FeatureCollection<Point> | null>(null);
  const [selectedDetailerId, setSelectedDetailerId] = useState<string | null>(null);
  const [isLocationPermissionDenied, setIsLocationPermissionDenied] = useState(false);
  const [isLocationShuffled, setIsLocationShuffled] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(true);

  // Get selected detailer data
  const selectedDetailer = selectedDetailerId && detailers 
    ? detailers.features.find(f => f.properties?.id === selectedDetailerId)?.properties
    : null;

  // Convert map detailer data to bottom sheet format
  const convertToBottomSheetDetailer = (mapDetailer: any) => {
    if (!mapDetailer) return null;

    return {
      id: mapDetailer.id,
      name: mapDetailer.businessName || mapDetailer.name,
      rating: mapDetailer.rating || 4.8,
      reviewCount: mapDetailer.reviewCount || 89,
      distance: mapDetailer.distance || 2.1,
      profileImage: mapDetailer.image || '/api/placeholder/60/60',
      specialties: mapDetailer.services || ['Premium Wash', 'Ceramic Coating'],
      price: mapDetailer.priceRange || '$$$',
      availability: mapDetailer.status === 'available' ? 'available' as const : 
                   mapDetailer.status === 'busy' ? 'busy' as const : 'offline' as const,
      phone: mapDetailer.phone || '+1234567890',
      isFavorite: false,
      popularity: mapDetailer.popularity || 85,
      latitude: mapDetailer.latitude || 0,
      longitude: mapDetailer.longitude || 0
    };
  };

  const bottomSheetDetailer = selectedDetailer ? convertToBottomSheetDetailer(selectedDetailer) : null;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    mapboxgl.accessToken = mapboxToken || '';
    
    // Use stored user location first, then map view state, otherwise default
    const initialCenter = userLocation || mapViewState?.center || [DEFAULT_VIEWPORT.longitude, DEFAULT_VIEWPORT.latitude];
    const initialZoom = userLocation ? 16 : (mapViewState?.zoom || DEFAULT_VIEWPORT.zoom);
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxStyle || 'mapbox://styles/mapbox/dark-v11',
      center: initialCenter,
      zoom: initialZoom,
      pitch: 0,
      bearing: 0,
      attributionControl: false, // Remove Mapbox logo
      logoPosition: 'bottom-right' // Move logo if it still appears
    });
    
    map.current.on('load', () => {
      console.log('🗺️ Map loaded successfully');
      
      // Apply matte styling after map loads
      const mapInstance = map.current;
      if (mapInstance) {
        // Hide ALL traffic layers for clean matte look
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
        
        console.log('🎨 Matte styling applied - traffic layers hidden');
      }
      
      setIsLoaded(true);
      
      // Fetch detailers after map is loaded
      fetchDetailers();
      
      // Set max bounds to prevent showing empty areas (Los Angeles region)
      const bounds = new mapboxgl.LngLatBounds(
        [-118.9448, 33.7037], // Southwest coordinates
        [-117.6461, 34.3373]  // Northeast coordinates
      );
      map.current?.setMaxBounds(bounds);
      
      // If we have a stored user location, restore view to that location
      if (userLocation && map.current) {
        console.log('🎯 Restoring map view to user location:', userLocation);
        map.current.flyTo({
          center: userLocation,
          zoom: 16,
          duration: 1000
        });
      }
      
      // Force resize to ensure map fills container properly
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
          // Re-center on user location after resize if available
          if (userLocation) {
            map.current.flyTo({
              center: userLocation,
              zoom: 16,
              duration: 500
            });
          }
        }
      }, 100);
      
      // Additional resize after a delay for proper initialization
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
          // Final re-center on user location
          if (userLocation) {
            map.current.flyTo({
              center: userLocation,
              zoom: 16,
              duration: 300
            });
          }
        }
      }, 500);
    });
    
    map.current.on('error', (error) => {
      console.error('🚨 Map Error:', error);
    });

    // Add resize handler to ensure map fills container and maintains user focus
    const handleResize = () => {
      if (map.current) {
        map.current.resize();
        // Always return to user location after resize to prevent zoom out
        if (userLocation) {
          setTimeout(() => {
            if (map.current) {
              map.current.flyTo({
                center: userLocation,
                zoom: 16,
                duration: 800
              });
            }
          }, 200);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Save current map state before unmounting only if not at user location
      if (map.current) {
        const center = map.current.getCenter();
        const zoom = map.current.getZoom();
        
        // Only save map state if we're not currently focused on user location
        // This prevents overriding user location with other positions
        if (!userLocation || 
            (Math.abs(center.lng - userLocation[0]) > 0.001 || 
             Math.abs(center.lat - userLocation[1]) > 0.001)) {
          setMapViewState({
            center: [center.lng, center.lat],
            zoom: zoom
          });
        }
        map.current.remove();
      }
    };
  }, [setMapViewState, userLocation]);

  // Fetch detailers from API
  const fetchDetailers = useCallback(async () => {
    try {
      const response = await fetch('/api/map/detailers');
      if (!response.ok) throw new Error('Failed to fetch detailers');
      const data: FeatureCollection<Point> = await response.json();
      setDetailers(data);
    } catch (error) {
      console.error('Error fetching detailers:', error);
    }
  }, []);

  // High-accuracy GPS location request
  const requestLocation = useCallback((forceRefresh = false) => {
    // Use stored location if available and not forcing refresh
    if (userLocation && !forceRefresh) {
      console.log('📍 Using stored location:', userLocation);
      if (map.current) {
        map.current.flyTo({
          center: userLocation,
          zoom: 16,
          duration: 1500
        });
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      const fallback: [number, number] = [-118.2437, 34.0522]; // Los Angeles
      setUserLocation(fallback);
      return;
    }

    console.log('📍 Requesting fresh GPS location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 Location accuracy: ${Math.round(accuracy)}m`);
        
        const coords: [number, number] = [longitude, latitude];
        setUserLocation(coords); // Store in global state
        
        if (map.current) {
          map.current.flyTo({
            center: coords,
            zoom: 16, // Higher zoom for meter-level precision
            duration: 2000
          });
        }
        setIsLocationPermissionDenied(false);
      },
      (error) => {
        console.error('Geolocation error:', error.message);
        const fallback: [number, number] = [-118.2437, 34.0522]; // Los Angeles
        setUserLocation(fallback);
        setIsLocationPermissionDenied(true);
        
        if (map.current) {
          map.current.flyTo({
            center: fallback,
            zoom: 12,
            duration: 1000
          });
        }
      },
      {
        enableHighAccuracy: true,  // 🎯 Forces GPS usage
        timeout: 30000,            // Wait longer for accurate fix  
        maximumAge: 0              // No cached location
      }
    );
  }, [userLocation, setUserLocation]);

  // Scramble location (demo feature)
  const scrambleLocation = useCallback(() => {
    if (!userLocation) return;
    
    // Add random offset of 100-400 meters
    const latOffset = (Math.random() - 0.5) * 0.007; // ~400m at latitude
    const lngOffset = (Math.random() - 0.5) * 0.007;
    
    const scrambledLocation: [number, number] = [
      userLocation[0] + lngOffset,
      userLocation[1] + latOffset
    ];
    
    setUserLocation(scrambledLocation);
    setIsLocationShuffled(!isLocationShuffled);
    
    if (map.current) {
      map.current.flyTo({
        center: scrambledLocation,
        zoom: 16,
        duration: 1500
      });
    }
  }, [userLocation, setUserLocation, isLocationShuffled]);

  // Center map on user location
  const centerOnUser = useCallback(() => {
    if (!userLocation) {
      requestLocation(true); // Force refresh if no location
      return;
    }
    
    if (map.current) {
      map.current.flyTo({
        center: userLocation,
        zoom: 16,
        duration: 1500
      });
    }
  }, [userLocation, requestLocation]);


  // Add GPU layers when detailers data changes (ClawdBot requirement: GPU layers, not DOM markers)
  useEffect(() => {
    if (!map.current || !detailers || !isLoaded) return;
    
    const mapInstance = map.current;
    
    // Remove existing source and layers if they exist
    if (mapInstance.getSource('detailers')) {
      // Remove layers in reverse order they were added
      if (mapInstance.getLayer('cluster-count')) {
        mapInstance.removeLayer('cluster-count');
      }
      if (mapInstance.getLayer('clusters')) {
        mapInstance.removeLayer('clusters');
      }
      if (mapInstance.getLayer('detailers-layer')) {
        mapInstance.removeLayer('detailers-layer');
      }
      mapInstance.removeSource('detailers');
    }
    
    // Add GeoJSON source with detailers data
    mapInstance.addSource('detailers', {
      type: 'geojson',
      data: detailers,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });
    
    // Add circle layer for individual detailers
    mapInstance.addLayer({
      id: 'detailers-layer',
      type: 'circle',
      source: 'detailers',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#00FF66',
        'circle-radius': 10,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 1
      }
    });
    
    // Add cluster circles
    mapInstance.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'detailers',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#00FF66',
          10, '#00DD55',
          20, '#00BB44'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          15,
          10, 20,
          20, 25,
          30, 30
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });
    
    // Add cluster count labels
    mapInstance.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'detailers',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });
    
    // Handle clicks on detailer points
    mapInstance.on('click', 'detailers-layer', (e) => {
      const features = e.features;
      if (features && features.length > 0) {
        const detailerId = features[0].properties?.id;
        setSelectedDetailerId(detailerId);
      }
    });
    
    // Handle clicks on clusters
    mapInstance.on('click', 'clusters', (e) => {
      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties?.cluster_id;
      const source = mapInstance.getSource('detailers') as mapboxgl.GeoJSONSource;
      
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        mapInstance.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom
        });
      });
    });
    
    // Change cursor on hover
    mapInstance.on('mouseenter', 'detailers-layer', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    
    mapInstance.on('mouseleave', 'detailers-layer', () => {
      mapInstance.getCanvas().style.cursor = '';
    });
    
    mapInstance.on('mouseenter', 'clusters', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    
    mapInstance.on('mouseleave', 'clusters', () => {
      mapInstance.getCanvas().style.cursor = '';
    });
    
    // Cleanup function to remove event listeners and layers
    return () => {
      if (mapInstance && mapInstance.getStyle && mapInstance.getSource) {
        try {
          // Check if source exists before cleanup
          const detailersSource = mapInstance.getSource('detailers');
          if (detailersSource) {
            // Remove event listeners
            mapInstance.off('click', 'detailers-layer');
            mapInstance.off('click', 'clusters');
            mapInstance.off('mouseenter', 'detailers-layer');
            mapInstance.off('mouseleave', 'detailers-layer');
            mapInstance.off('mouseenter', 'clusters');
            mapInstance.off('mouseleave', 'clusters');
            
            // Remove layers in reverse order
            try {
              if (mapInstance.getLayer('cluster-count')) {
                mapInstance.removeLayer('cluster-count');
              }
            } catch (e) { /* Layer already removed */ }
            
            try {
              if (mapInstance.getLayer('clusters')) {
                mapInstance.removeLayer('clusters');
              }
            } catch (e) { /* Layer already removed */ }
            
            try {
              if (mapInstance.getLayer('detailers-layer')) {
                mapInstance.removeLayer('detailers-layer');
              }
            } catch (e) { /* Layer already removed */ }
            
            try {
              mapInstance.removeSource('detailers');
            } catch (e) { /* Source already removed */ }
          }
        } catch (error) {
          console.log('Map cleanup completed with expected cleanup variations');
        }
      }
    };
  }, [detailers, isLoaded]);
  
  // Add customer location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;
    
    // Remove existing customer marker
    if (customerMarkerRef.current) {
      customerMarkerRef.current.remove();
    }
    
    const el = document.createElement('div');
    el.className = 'customer-marker';
    el.style.backgroundColor = '#ffffff';
    el.style.width = '16px';
    el.style.height = '16px';
    el.style.borderRadius = '50%';
    el.style.border = '4px solid #00FF66';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    
    customerMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat(userLocation)
      .addTo(map.current);
      
    return () => {
      if (customerMarkerRef.current) {
        customerMarkerRef.current.remove();
      }
    };
  }, [userLocation]);

  // Initialize on mount - just run once
  useEffect(() => {
    // Removed fetchDetailers from here since it's now called in map.on('load')
    // This prevents the dependency array issue
  }, []); // Only run once on mount

  // Handle location request separately - only when needed
  useEffect(() => {
    // Only request location if we don't have one stored AND map is loaded
    if (!userLocation && isLoaded) {
      console.log('🔄 No stored location found, requesting fresh GPS...');
      requestLocation();
    }
  }, [userLocation, isLoaded, requestLocation]);

  // Check for missing environment variables
  if (!mapboxToken || !mapboxStyle) {
    return (
      <div className={`relative h-full ${className} flex items-center justify-center bg-gray-900`}>
        <div className="text-center text-white p-8">
          <h3 className="text-xl font-semibold mb-4">⚠️ Map Configuration Error</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p>Missing Mapbox configuration:</p>
            <p>Token: {mapboxToken ? '✅ Found' : '❌ Missing NEXT_PUBLIC_MAPBOX_TOKEN'}</p>
            <p>Style: {mapboxStyle ? '✅ Found' : '❌ Missing NEXT_PUBLIC_MAPBOX_STYLE'}</p>
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

      {/* Custom Controls */}
      <MapControls
        onZoomIn={() => map.current?.zoomIn()}
        onZoomOut={() => map.current?.zoomOut()}
        onCenterOnUser={centerOnUser}
        onScrambleLocation={scrambleLocation}
        hasUserLocation={!!userLocation}
        isLocationDenied={isLocationPermissionDenied}
        isLocationShuffled={isLocationShuffled}
      />

      {/* Note: Detailer selection now handled by bottom sheet */}

      {/* Loading overlay — dims the map until fully loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm z-10 flex items-center justify-center transition-opacity duration-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white/80 mx-auto"></div>
            <p className="mt-3 text-sm text-white/70 font-medium">Loading map...</p>
          </div>
        </div>
      )}

      {/* Detailer Bottom Sheet */}
      <DetailerBottomSheet
        isVisible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        userLocation={userLocation}
        selectedDetailerFromMap={bottomSheetDetailer}
        onClearMapSelection={() => setSelectedDetailerId(null)}
      />

    </div>
  );
}