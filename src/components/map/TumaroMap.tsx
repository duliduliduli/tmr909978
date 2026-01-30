"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  Map,
  Source, 
  Layer, 
  type MapRef, 
  type ViewState,
  type MapMouseEvent as MapEvent,
  type LayerProps 
} from 'react-map-gl/mapbox';
import type { FeatureCollection, Feature, Point } from 'geojson';
import { MapControls } from './MapControls';
import { DetailerDrawer } from './DetailerDrawer';
import { BookingSlider } from './BookingSlider';
import { DetailerListView } from './DetailerListView';

interface TumaroMapProps {
  className?: string;
}

export function TumaroMap({ className = '' }: TumaroMapProps) {
  const mapRef = useRef<MapRef>(null);
  
  // Map state - NO default viewport, wait for user location
  const [viewState, setViewState] = useState<Partial<ViewState>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  
  // Data state
  const [detailers, setDetailers] = useState<FeatureCollection<Point> | null>(null);
  const [customerLocation, setCustomerLocation] = useState<[number, number] | null>(null);
  const [originalLocation, setOriginalLocation] = useState<[number, number] | null>(null);
  
  // UI state
  const [selectedDetailerId, setSelectedDetailerId] = useState<string | null>(null);
  const [isLocationPermissionDenied, setIsLocationPermissionDenied] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isLocationShuffled, setIsLocationShuffled] = useState(false);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get selected detailer data with distance
  const selectedDetailer = selectedDetailerId && detailers 
    ? (() => {
        const feature = detailers.features.find(f => f.properties?.id === selectedDetailerId);
        if (!feature || !customerLocation) return feature?.properties || null;
        
        const [lng, lat] = feature.geometry.coordinates;
        const distance = calculateDistance(customerLocation[1], customerLocation[0], lat, lng);
        
        return {
          ...feature.properties,
          distance
        };
      })()
    : null;

  // Transform detailer data for list view
  const detailersForList = detailers && customerLocation ? 
    detailers.features
      .filter(f => f.properties && f.geometry.type === 'Point')
      .map(feature => {
        const [lng, lat] = feature.geometry.coordinates;
        const distance = calculateDistance(customerLocation[1], customerLocation[0], lat, lng);
        
        // Only include detailers within 25 miles
        if (distance > 25) return null;
        
        return {
          ...feature.properties,
          distance,
          estimatedArrival: `${Math.round(distance * 2 + 10)}-${Math.round(distance * 2 + 20)} min`,
          isAvailable: Math.random() > 0.3 // Random availability for demo
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
    : [];

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

  // High-accuracy GPS location request with immediate map initialization
  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      const fallback: [number, number] = [-118.2437, 34.0522]; // Los Angeles
      setCustomerLocation(fallback);
      // Initialize map immediately with fallback location
      setViewState({
        longitude: fallback[0],
        latitude: fallback[1],
        zoom: 12
      });
      setIsMapInitialized(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 Location accuracy: ${Math.round(accuracy)}m`);
        
        const coords: [number, number] = [longitude, latitude];
        setCustomerLocation(coords);
        // Store original location if this is the first time setting it
        if (!originalLocation) {
          setOriginalLocation(coords);
        }
        
        // Initialize map immediately with user's actual location
        if (!isMapInitialized) {
          setViewState({
            longitude: coords[0],
            latitude: coords[1],
            zoom: 16 // High zoom for precise location
          });
          setIsMapInitialized(true);
        } else if (mapRef.current) {
          // If map already initialized, fly to location
          mapRef.current.flyTo({
            center: coords,
            zoom: 16,
            duration: 2000
          });
        }
        setIsLocationPermissionDenied(false);
      },
      (error) => {
        console.error('Geolocation error:', error.message);
        const fallback: [number, number] = [-118.2437, 34.0522]; // Los Angeles
        setCustomerLocation(fallback);
        // Store original location if this is the first time setting it
        if (!originalLocation) {
          setOriginalLocation(fallback);
        }
        setIsLocationPermissionDenied(true);
        
        // Initialize map with fallback if not already initialized
        if (!isMapInitialized) {
          setViewState({
            longitude: fallback[0],
            latitude: fallback[1],
            zoom: 12
          });
          setIsMapInitialized(true);
        } else if (mapRef.current) {
          mapRef.current.flyTo({
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
  }, [isMapInitialized]);

  // Toggle scramble location
  const toggleScrambleLocation = useCallback(() => {
    if (!customerLocation || !originalLocation) return;
    
    if (isLocationShuffled) {
      // Return to original location
      setCustomerLocation(originalLocation);
      setIsLocationShuffled(false);
      
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: originalLocation,
          zoom: 16,
          duration: 1500
        });
      }
    } else {
      // Scramble to new random location
      const latOffset = (Math.random() - 0.5) * 0.007; // ~400m at latitude
      const lngOffset = (Math.random() - 0.5) * 0.007;
      
      const scrambledLocation: [number, number] = [
        originalLocation[0] + lngOffset,
        originalLocation[1] + latOffset
      ];
      
      setCustomerLocation(scrambledLocation);
      setIsLocationShuffled(true);
      
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: scrambledLocation,
          zoom: 16,
          duration: 1500
        });
      }
    }
  }, [customerLocation, originalLocation, isLocationShuffled]);

  // Center map on user location
  const centerOnUser = useCallback(() => {
    if (!customerLocation) {
      requestLocation();
      return;
    }
    
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: customerLocation,
        zoom: 16,
        duration: 1500
      });
    }
  }, [customerLocation, requestLocation]);

  // Handle map click
  const handleMapClick = useCallback((event: MapEvent) => {
    const features = event.features;
    if (!features || features.length === 0) {
      setSelectedDetailerId(null);
      return;
    }

    const feature = features[0];
    
    // Handle cluster clicks - zoom in
    if (feature.properties?.cluster) {
      const clusterId = feature.properties.cluster_id;
      const source = mapRef.current?.getMap().getSource('detailers') as any;
      
      if (source && source.getClusterExpansionZoom) {
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err || !feature.geometry || feature.geometry.type !== 'Point') return;
          
          mapRef.current?.flyTo({
            center: feature.geometry.coordinates as [number, number],
            zoom: zoom,
            duration: 500
          });
        });
      }
    } else {
      // Handle point clicks - select detailer
      const detailerId = feature.properties?.id;
      if (detailerId) {
        setSelectedDetailerId(detailerId);
      }
    }
  }, []);

  // Initialize on mount - request location FIRST, then fetch detailers
  useEffect(() => {
    // Request location immediately on component mount
    requestLocation();
    // Fetch detailers after a brief delay to let location load
    const timer = setTimeout(() => {
      fetchDetailers();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Simple static detailer layers (animation removed to fix errors)
  const detailerBackgroundLayer: LayerProps = {
    id: 'detailer-background',
    type: 'circle',
    source: 'detailers',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-radius': 25,
      'circle-color': '#14B8A6',
      'circle-opacity': 0.2
    }
  };

  const unclusteredPointLayer: LayerProps = {
    id: 'unclustered-point',
    type: 'circle',
    source: 'detailers',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'case',
        ['==', ['get', 'id'], selectedDetailerId || ''],
        '#10B981', // Brighter green when selected
        '#14B8A6'  // Teal when unselected
      ],
      'circle-radius': [
        'case',
        ['==', ['get', 'id'], selectedDetailerId || ''],
        20, // Bigger when selected
        14  // Default larger than before
      ],
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff', // White rim for pop on dark map
      'circle-opacity': 0.95
    }
  };

  // Enhanced cluster layers for dark theme
  const clusterLayer: LayerProps = {
    id: 'clusters',
    type: 'circle',
    source: 'detailers',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#14B8A6', // teal for small clusters
        10, '#F59E0B', // amber for medium clusters  
        30, '#EF4444'  // red for large clusters
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        25, // Larger base radius for dark theme
        10, 35,
        30, 45
      ],
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.9
    }
  };

  const clusterCountLayer: LayerProps = {
    id: 'cluster-count',
    type: 'symbol',
    source: 'detailers',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 16 // Larger text for dark theme
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000000',
      'text-halo-width': 1
    }
  };

  // 🌟 ENHANCED CUSTOMER LOCATION WITH WHITE PUCK + TEAL GLOW
  const customerLocationSource: FeatureCollection<Point> | null = customerLocation ? {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: customerLocation
      }
    }]
  } : null;

  // Simple static customer location layers (animation removed to fix errors)
  const customerBackgroundLayer: LayerProps = {
    id: 'customer-background',
    type: 'circle',
    source: 'customer-location',
    paint: {
      'circle-color': '#14B8A6',
      'circle-radius': 30,
      'circle-opacity': 0.3
    }
  };

  const customerPuckLayer: LayerProps = {
    id: 'customer-puck',
    type: 'circle',
    source: 'customer-location',
    paint: {
      'circle-color': '#ffffff',     // White puck like Uber
      'circle-radius': 14,
      'circle-stroke-width': 4,
      'circle-stroke-color': '#14B8A6', // Teal border
      'circle-opacity': 0.95
    }
  };


  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* View Toggle */}
      <div className="absolute top-4 left-4 z-30 flex bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => setViewMode('map')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'map'
              ? 'bg-teal-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Map View
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'list'
              ? 'bg-teal-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          List View ({detailersForList.length})
        </button>
      </div>

      {/* List View */}
      {viewMode === 'list' ? (
        <DetailerListView
          detailers={detailersForList}
          onDetailerSelect={(detailer) => {
            setSelectedDetailerId(detailer.id);
            setViewMode('map'); // Switch back to map view
          }}
          onBookService={() => {}}
          userLocation={customerLocation}
        />
      ) : (
        <>
          {/* Only render map once we have a location-based viewport */}
          {isMapInitialized && (
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onLoad={() => setIsLoaded(true)}
          mapStyle={process.env.NEXT_PUBLIC_MAPBOX_STYLE}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          onClick={handleMapClick}
          interactiveLayerIds={['clusters', 'unclustered-point']}
          cursor="default"
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        >
        {/* Detailers source with animated pulsating layers */}
        {detailers && (
          <Source 
            id="detailers"
            type="geojson"
            data={detailers}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            {/* Background and point layers */}
            <Layer {...detailerBackgroundLayer} />
            <Layer {...unclusteredPointLayer} />
            
            {/* Enhanced cluster layers */}
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
          </Source>
        )}

        {/* Customer location */}
        {customerLocationSource && (
          <Source id="customer-location" type="geojson" data={customerLocationSource}>
            <Layer {...customerBackgroundLayer} />
            <Layer {...customerPuckLayer} />
          </Source>
        )}
        </Map>
      )}

      {/* Custom Controls */}
      <MapControls
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onCenterOnUser={centerOnUser}
        onScrambleLocation={toggleScrambleLocation}
        hasUserLocation={!!customerLocation}
        isLocationDenied={isLocationPermissionDenied}
        isLocationShuffled={isLocationShuffled}
      />

      {/* Detailer Selection Drawer */}
      {selectedDetailer && (
        <DetailerDrawer
          detailer={selectedDetailer}
          onClose={() => setSelectedDetailerId(null)}
          onBookService={() => {}} // Not needed anymore as booking is integrated
        />
      )}

      {/* Loading indicator - show until map is initialized with location */}
      {!isMapInitialized && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto"></div>
            <p className="mt-2 text-gray-300">Getting your location...</p>
            <p className="mt-1 text-xs text-gray-400">Please allow location access for the best experience</p>
          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
}