import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { OptimizedRoute, RouteStop } from '../services/routeOptimizerService';
import axios from 'axios';
import { decode } from '@here/flexpolyline';
import 'leaflet-polylinedecorator';

// Configure default marker icon for Leaflet when using bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Green marker for start point
const StartIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Red marker for end point
const EndIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Orange marker for intermediate stops
const StopIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Decode HERE API Flexible Polyline Format using official library
const decodeHEREPolyline = (encoded: string): LatLngExpression[] => {
  console.log('Decoding polyline with official HERE decoder, first 20 chars:', encoded.substring(0, 20));
  
  try {
    // Official decoder returns { polyline: [[lat, lng, ...], [lat, lng, ...], ...] }
    const decoded = decode(encoded);
    console.log('Decoded result:', decoded);
    
    // Extract just lat/lng pairs
    const coords: LatLngExpression[] = decoded.polyline.map((point: number[]) => {
      return [point[0], point[1]] as [number, number];
    });
    
    console.log('First decoded coordinate:', coords[0]);
    console.log('Last decoded coordinate:', coords[coords.length - 1]);
    console.log('Total coordinates:', coords.length);
    
    return coords;
  } catch (error) {
    console.error('Failed to decode polyline:', error);
    return [];
  }
};

interface RouteMapProps {
  route: OptimizedRoute;
  height?: number;
}

const FitBounds: React.FC<{ points: LatLngExpression[] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points as [number, number][]);
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [map, points]);
  return null;
};

// Component to add arrow decorations to polylines
const PolylineWithArrows: React.FC<{ positions: LatLngExpression[] }> = ({ positions }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length < 2) return;
    
    // Create the base polyline
    const polyline = L.polyline(positions as [number, number][], {
      color: '#2563eb',
      weight: 6,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    
    // Add arrow decorations
    const decorator = (L as any).polylineDecorator(polyline, {
      patterns: [
        {
          offset: 25,
          repeat: 100,
          symbol: (L as any).Symbol.arrowHead({
            pixelSize: 12,
            polygon: false,
            pathOptions: {
              stroke: true,
              color: '#1e40af',
              weight: 2,
              opacity: 0.9
            }
          })
        }
      ]
    }).addTo(map);
    
    // Cleanup on unmount
    return () => {
      map.removeLayer(polyline);
      map.removeLayer(decorator);
    };
  }, [map, positions]);
  
  return null;
};

export const RouteMap: React.FC<RouteMapProps> = ({ route, height = 420 }) => {
  const [currentPosition, setCurrentPosition] = useState<LatLngExpression | null>(null);
  const [routePolylines, setRoutePolylines] = useState<LatLngExpression[][]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // All hooks must be called before any early returns
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    return () => {
      if (typeof watcher === 'number') navigator.geolocation.clearWatch(watcher);
    };
  }, []);

  // Fetch actual road routes from traffic service
  useEffect(() => {
    const fetchRoadRoutes = async () => {
      if (!route.stops || route.stops.length < 2) return;

      setIsLoadingRoutes(true);
      try {
        const sortedStops = [...route.stops].sort((a, b) => a.stop_sequence - b.stop_sequence);
        const waypoints = sortedStops
          .filter((s) => s.latitude != null && s.longitude != null)
          .map((s) => ({ lat: s.latitude, lng: s.longitude }));

        if (waypoints.length < 2) {
          setIsLoadingRoutes(false);
          return;
        }

        console.log('Fetching road routes for waypoints:', waypoints);
        console.log('Waypoints detailed:', JSON.stringify(waypoints, null, 2));

        // Call traffic service to get actual route with road network
        const response = await axios.post('http://localhost:8002/api/v1/traffic/route', {
          waypoints: waypoints,
          departure_time: new Date().toISOString()
        });

        console.log('Route response:', response.data);

        // Check different possible response formats
        if (response.data && response.data.route) {
          const route = response.data.route;
          const allPoints: LatLngExpression[] = [];
          
          // Check if route has sections array (multi-segment route)
          if (route.sections && Array.isArray(route.sections) && route.sections.length > 0) {
            console.log('Decoding', route.sections.length, 'route sections');
            route.sections.forEach((sectionPolyline: string, index: number) => {
              if (sectionPolyline) {
                console.log(`Decoding section ${index + 1}:`, sectionPolyline.substring(0, 30) + '...');
                const decoded = decodeHEREPolyline(sectionPolyline);
                console.log(`Section ${index + 1} has ${decoded.length} points`);
                allPoints.push(...decoded);
              }
            });
            
            if (allPoints.length > 0) {
              console.log('Total decoded points:', allPoints.length);
              console.log('Setting routePolylines state with array containing', allPoints.length, 'points');
              setRoutePolylines([allPoints]);
              console.log('State should now have 1 polyline with', allPoints.length, 'points');
              return;
            }
          }
          
          // Fallback: single polyline
          if (route.polyline) {
            console.log('Decoding single polyline:', route.polyline.substring(0, 50) + '...');
            const decodedPolyline = decodeHEREPolyline(route.polyline);
            console.log('Decoded points:', decodedPolyline.length);
            setRoutePolylines([decodedPolyline]);
            return;
          }
          
          console.warn('No polyline or sections found in response');
        } else {
          console.warn('No route data in response');
        }
      } catch (error: any) {
        console.error('Failed to fetch road routes:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Fallback to straight lines if routing fails
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    fetchRoadRoutes();
  }, [route.stops]);

  const stopPoints: LatLngExpression[] = useMemo(() => {
    // Create a copy of the array before sorting to avoid mutating Redux state
    const stops: RouteStop[] = [...(route.stops || [])].sort((a, b) => a.stop_sequence - b.stop_sequence);
    // Filter out any stops with invalid coordinates
    return stops
      .filter((s) => s.latitude != null && s.longitude != null && !isNaN(s.latitude) && !isNaN(s.longitude))
      .map((s) => [s.latitude, s.longitude]);
  }, [route.stops]);

  // Don't include current position in the route - only show delivery stops
  const polylinePoints: LatLngExpression[] = useMemo(() => {
    return [...stopPoints];
  }, [stopPoints]);

  // Use first valid stop point as center, or default to Bangalore coordinates
  const center: LatLngExpression = stopPoints.length > 0 ? stopPoints[0] : [12.9716, 77.5946];

  // Generate Google Maps URL for navigation
  const getGoogleMapsUrl = (): string => {
    if (stopPoints.length < 2) return '';
    
    const firstPoint = stopPoints[0] as [number, number];
    const lastPoint = stopPoints[stopPoints.length - 1] as [number, number];
    
    const origin = `${firstPoint[0]},${firstPoint[1]}`;
    const destination = `${lastPoint[0]},${lastPoint[1]}`;
    
    // Add intermediate waypoints (if any)
    let waypointsParam = '';
    if (stopPoints.length > 2) {
      const waypoints = stopPoints.slice(1, -1)
        .map(point => {
          const p = point as [number, number];
          return `${p[0]},${p[1]}`;
        })
        .join('|');
      waypointsParam = `&waypoints=${waypoints}`;
    }
    
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointsParam}&travelmode=driving`;
  };

  const handleOpenInGoogleMaps = () => {
    const url = getGoogleMapsUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Safety check AFTER all hooks: ensure route and stops exist
  if (!route || !route.stops || route.stops.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <div className="text-center text-secondary-500">
          <p>No route data available</p>
        </div>
      </div>
    );
  }

  // Debug log before rendering
  console.log('🗺️ Rendering map with:');
  console.log('  - routePolylines.length:', routePolylines.length);
  console.log('  - stopPoints.length:', stopPoints.length);
  console.log('  - isLoadingRoutes:', isLoadingRoutes);
  if (routePolylines.length > 0) {
    console.log('  - First polyline has', routePolylines[0].length, 'points');
    console.log('  - First 3 coordinates:', routePolylines[0].slice(0, 3));
    console.log('  - Sample coordinate format:', routePolylines[0][0]);
  }

  return (
    <div className="w-full relative" style={{ height }}>
      {/* Google Maps Navigation Button */}
      {stopPoints.length >= 2 && (
        <button
          onClick={handleOpenInGoogleMaps}
          className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-50 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200 hover:shadow-xl"
          title="Open in Google Maps for turn-by-turn navigation"
        >
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
              fill="#4285F4"
            />
          </svg>
          <span>Navigate in Google Maps</span>
        </button>
      )}
      
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Show current position as a separate marker with blue icon */}
        {currentPosition && (
          <Marker 
            position={currentPosition}
            icon={L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium text-blue-600">📍 Your Current Location</div>
                <div className="text-xs text-secondary-600">This is not part of the delivery route</div>
              </div>
            </Popup>
          </Marker>
        )}
        {[...(route.stops || [])]
          .sort((a, b) => a.stop_sequence - b.stop_sequence)
          .filter((stop) => stop.latitude != null && stop.longitude != null && !isNaN(stop.latitude) && !isNaN(stop.longitude))
          .map((stop, index, arr) => {
            // Determine marker icon based on position
            let markerIcon = StopIcon; // Default orange for intermediate
            let markerLabel = '🟠';
            
            if (index === 0) {
              markerIcon = StartIcon; // Green for start
              markerLabel = '🟢 START';
            } else if (index === arr.length - 1) {
              markerIcon = EndIcon; // Red for end
              markerLabel = '🔴 END';
            }
            
            return (
              <Marker 
                key={stop.stop_id} 
                position={[stop.latitude, stop.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium">{markerLabel} - {stop.stop_type} #{stop.stop_sequence}</div>
                    <div>Order: {stop.order_id || 'N/A'}</div>
                    <div>ETA: {stop.estimated_arrival_time || 'N/A'}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        
        {/* Show actual road routes if available, otherwise show straight lines */}
        {isLoadingRoutes && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow-lg z-[1000]">
            Loading route...
          </div>
        )}
        
        {routePolylines.length > 0 ? (
          // Render actual road routes from HERE API with directional arrows
          <>
            {console.log('✅ Rendering', routePolylines.length, 'road route polylines with arrows')}
            {routePolylines.map((polyline, index) => {
              console.log(`  Polyline ${index + 1}: ${polyline.length} points, first point:`, polyline[0]);
              return (
                <PolylineWithArrows 
                  key={`road-route-${index}`}
                  positions={polyline}
                />
              );
            })}
          </>
        ) : (
          // Fallback: show straight lines if road routes not available
          <>
            {console.log('⚠️ No road routes - showing fallback straight lines')}
            {polylinePoints.length >= 2 && (
              <Polyline 
                positions={polylinePoints} 
                pathOptions={{ color: '#94a3b8', weight: 3, opacity: 0.5, dashArray: '10, 10' }} 
              />
            )}
          </>
        )}
        <FitBounds points={polylinePoints.length ? polylinePoints : stopPoints} />
      </MapContainer>
    </div>
  );
};

export default RouteMap;

