import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTrafficIncidents, fetchTrafficFlow, fetchCacheStats, clearTrafficCache } from '../store/slices/trafficSlice';
import { TrafficIncident, TrafficFlowResponse } from '../services/trafficService';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  ClockIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const TrafficPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { trafficIncidents, trafficFlow, cacheStats, isLoading } = useAppSelector((state) => state.traffic);
  
  const [selectedLocation, setSelectedLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [showTrafficFlow, setShowTrafficFlow] = useState(false);

  // Try to take location from the device and update selectedLocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  }, []);

useEffect(() => {
  dispatch(fetchTrafficIncidents({
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
    radius: 1000,
  }));
  dispatch(fetchCacheStats());
}, [dispatch, selectedLocation.lat, selectedLocation.lng]);

  const handleGetTrafficFlow = async () => {
    try {
      await dispatch(fetchTrafficFlow({ 
        lat: selectedLocation.lat, 
        lng: selectedLocation.lng,
        radius: 1000 
      })).unwrap();
      setShowTrafficFlow(true);
    } catch (error) {
      toast.error('Failed to fetch traffic flow data');
    }
  };

  const handleClearCache = async () => {
    try {
      await dispatch(clearTrafficCache()).unwrap();
      toast.success('Cache cleared successfully');
      dispatch(fetchCacheStats());
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const severityColors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };

  const congestionColors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    SEVERE: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Traffic Monitoring</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Monitor real-time traffic conditions and incidents
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            className="btn-secondary inline-flex items-center"
            onClick={handleClearCache}
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Clear Cache
          </button>
          <button
            type="button"
            className="btn-primary inline-flex items-center"
            onClick={() => {
              dispatch(fetchTrafficIncidents({}));
              dispatch(fetchCacheStats());
            }}
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Traffic Flow Checker */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">Traffic Flow Checker</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Latitude</label>
              <input
                type="number"
                step="0.000001"
                className="input-field"
                value={selectedLocation.lat}
                onChange={(e) => setSelectedLocation({ ...selectedLocation, lat: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input
                type="number"
                step="0.000001"
                className="input-field"
                value={selectedLocation.lng}
                onChange={(e) => setSelectedLocation({ ...selectedLocation, lng: parseFloat(e.target.value) })}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                className="btn-primary w-full"
                onClick={handleGetTrafficFlow}
              >
                Check Traffic Flow
              </button>
            </div>
          </div>

          {showTrafficFlow && trafficFlow && (
            <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
              <h4 className="text-lg font-medium text-secondary-900 mb-3">Traffic Flow Data</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-secondary-600">Current Speed:</span>
                  <p className="text-lg font-semibold">{trafficFlow.current_speed_kmph} km/h</p>
                </div>
                <div>
                  <span className="text-sm text-secondary-600">Free Flow Speed:</span>
                  <p className="text-lg font-semibold">{trafficFlow.free_flow_speed_kmph} km/h</p>
                </div>
                <div>
                  <span className="text-sm text-secondary-600">Congestion Level:</span>
                  <span
                    className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      congestionColors[trafficFlow.congestion_level as keyof typeof congestionColors]
                    )}
                  >
                    {trafficFlow.congestion_level}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-secondary-600">Confidence:</span>
                  <p className="text-lg font-semibold">{Math.round(trafficFlow.confidence_level * 100)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cache Statistics */}
      {cacheStats && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-secondary-200">
            <h3 className="text-lg font-medium text-secondary-900">Cache Statistics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{cacheStats.total_keys}</p>
                <p className="text-sm text-secondary-600">Cached Items</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{cacheStats.memory_used_mb || 0} MB</p>
                <p className="text-sm text-secondary-600">Memory Used</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-secondary-900">
                  {cacheStats.redis_version || 'N/A'}
                </p>
                <p className="text-sm text-secondary-600">Redis Version</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-secondary-900">
                  {cacheStats.timestamp ? format(new Date(cacheStats.timestamp), 'MMM d, HH:mm') : 'N/A'}
                </p>
                <p className="text-sm text-secondary-600">Last Updated</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Incidents */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">Traffic Incidents</h3>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-secondary-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-secondary-200">
            {trafficIncidents.length === 0 ? (
              <div className="p-6 text-center">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-green-400" />
                <p className="mt-2 text-sm text-secondary-500">No traffic incidents reported</p>
              </div>
            ) : (
              trafficIncidents.map((incident) => (
                <div key={incident.incident_id} className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-6 w-6 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-secondary-900">
                          {incident.description}
                        </h4>
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            severityColors[incident.severity as keyof typeof severityColors]
                          )}
                        >
                          {incident.severity}
                        </span>
                        <span
                          className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            incident.status === 'ACTIVE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          )}
                        >
                          {incident.status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-secondary-600">
                        <div>
                          <span className="font-medium">Type:</span> {incident.incident_type}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                        </div>
                        <div>
                          <span className="font-medium">Started:</span> {format(new Date(incident.start_time), 'MMM d, HH:mm')}
                        </div>
                      </div>
                      {incident.affected_roads.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-secondary-600">Affected Roads:</span>
                          <p className="text-sm text-secondary-500">{incident.affected_roads.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
