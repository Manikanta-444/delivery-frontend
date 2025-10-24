import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOptimizationJobs, fetchRoutes, optimizeRoutes } from '../store/slices/routesSlice';
import { fetchOrders } from '../store/slices/ordersSlice';
import { OptimizationJob, OptimizedRoute, OptimizationRequest } from '../services/routeOptimizerService';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { PlayIcon, EyeIcon, MapIcon, ClockIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import RouteMap from '../components/RouteMap';

export const RouteOptimizationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, routes, isLoading } = useAppSelector((state) => state.routes);
  const { orders } = useAppSelector((state) => state.orders);
  
  const [showOptimizationForm, setShowOptimizationForm] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [optimizationParams, setOptimizationParams] = useState({
    job_name: '',
    max_vehicles: 3,
    vehicle_capacity_kg: 500,
    optimization_criteria: 'MINIMIZE_DISTANCE' as const,
    use_traffic_data: true,
  });
  
  // Depot location state
  const [depotLocation, setDepotLocation] = useState<{
    latitude: string;
    longitude: string;
    useDeviceLocation: boolean;
    isDetecting: boolean;
  }>({
    latitude: '',
    longitude: '',
    useDeviceLocation: false,
    isDetecting: false,
  });

  useEffect(() => {
    dispatch(fetchOptimizationJobs({}));
    dispatch(fetchRoutes({}));
    dispatch(fetchOrders({}));
  }, [dispatch]);

  // Get device location
  const handleGetDeviceLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setDepotLocation(prev => ({ ...prev, isDetecting: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDepotLocation({
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          useDeviceLocation: true,
          isDetecting: false,
        });
        toast.success('📍 Location detected successfully!');
      },
      (error) => {
        setDepotLocation(prev => ({ ...prev, isDetecting: false }));
        toast.error(`Failed to get location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleStartOptimization = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select at least one order');
      return;
    }

    // Build constraints with optional depot location
    const constraints: any = {
      max_stops_per_route: 10,
      max_route_duration_minutes: 480,
      max_vehicles: optimizationParams.max_vehicles,
      vehicle_capacity_kg: optimizationParams.vehicle_capacity_kg,
      optimization_criteria: optimizationParams.optimization_criteria,
      working_hours_start: '08:00',
      working_hours_end: '18:00',
    };

    // Add depot location if provided
    if (depotLocation.latitude && depotLocation.longitude) {
      constraints.depot_latitude = parseFloat(depotLocation.latitude);
      constraints.depot_longitude = parseFloat(depotLocation.longitude);
    }

    const request: OptimizationRequest = {
      order_ids: selectedOrders,
      job_name: optimizationParams.job_name || `Optimization_${new Date().toISOString()}`,
      constraints,
      use_traffic_data: optimizationParams.use_traffic_data,
    };

    try {
      await dispatch(optimizeRoutes(request)).unwrap();
      toast.success('Optimization job started successfully!');
      setShowOptimizationForm(false);
      setSelectedOrders([]);
      dispatch(fetchOptimizationJobs({}));
    } catch (error) {
      toast.error(error as string);
    }
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  const routeStatusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const [mapRoute, setMapRoute] = useState<OptimizedRoute | null>(null);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Route Optimization</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Optimize delivery routes using VRP algorithms with real-time traffic data
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="btn-primary inline-flex items-center"
            onClick={() => setShowOptimizationForm(true)}
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Start Optimization
          </button>
        </div>
      </div>

      {/* Optimization Form Modal */}
      {showOptimizationForm && (
        <div className="fixed inset-0 bg-secondary-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">
              Start Route Optimization
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Job Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={optimizationParams.job_name}
                  onChange={(e) => setOptimizationParams({ ...optimizationParams, job_name: e.target.value })}
                  placeholder="Enter job name (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Max Vehicles</label>
                  <input
                    type="number"
                    className="input-field"
                    value={optimizationParams.max_vehicles}
                    onChange={(e) => setOptimizationParams({ ...optimizationParams, max_vehicles: parseInt(e.target.value) })}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="label">Vehicle Capacity (kg)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={optimizationParams.vehicle_capacity_kg}
                    onChange={(e) => setOptimizationParams({ ...optimizationParams, vehicle_capacity_kg: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="label">Optimization Criteria</label>
                <select
                  className="input-field"
                  value={optimizationParams.optimization_criteria}
                  onChange={(e) => setOptimizationParams({ ...optimizationParams, optimization_criteria: e.target.value as any })}
                >
                  <option value="MINIMIZE_DISTANCE">Minimize Distance</option>
                  <option value="MINIMIZE_TIME">Minimize Time</option>
                  <option value="MINIMIZE_COST">Minimize Cost</option>
                </select>
              </div>

              {/* Depot Location Section */}
              <div className="border-t border-secondary-200 pt-4 mt-4">
                <label className="label flex items-center justify-between">
                  <span>Depot/Starting Location (Optional)</span>
                  <button
                    type="button"
                    onClick={handleGetDeviceLocation}
                    disabled={depotLocation.isDetecting}
                    className="text-sm text-primary-600 hover:text-primary-800 disabled:text-secondary-400 flex items-center"
                  >
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {depotLocation.isDetecting ? 'Detecting...' : 'Use My Location'}
                  </button>
                </label>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-xs text-secondary-600">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      className="input-field text-sm"
                      value={depotLocation.latitude}
                      onChange={(e) => setDepotLocation({ ...depotLocation, latitude: e.target.value, useDeviceLocation: false })}
                      placeholder="e.g., 28.6139"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-secondary-600">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      className="input-field text-sm"
                      value={depotLocation.longitude}
                      onChange={(e) => setDepotLocation({ ...depotLocation, longitude: e.target.value, useDeviceLocation: false })}
                      placeholder="e.g., 77.2090"
                    />
                  </div>
                </div>
                
                {depotLocation.useDeviceLocation && (
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    Using device location
                  </div>
                )}
                
                {!depotLocation.latitude && !depotLocation.longitude && (
                  <p className="mt-2 text-xs text-secondary-500">
                    Leave empty to use default depot location from settings
                  </p>
                )}
              </div>

              <div>
                <label className="label">Select Orders</label>
                <div className="max-h-40 overflow-y-auto border border-secondary-300 rounded-lg p-2">
                  {orders.filter(order => order.order_status === 'PENDING' || order.order_status === 'CONFIRMED').map((order) => (
                    <label key={order.order_id} className="flex items-center space-x-2 p-2 hover:bg-secondary-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.order_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order.order_id]);
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order.order_id));
                          }
                        }}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm">
                        #{order.order_id.slice(-8)} - {order.customer?.first_name} {order.customer?.last_name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="use_traffic_data"
                  checked={optimizationParams.use_traffic_data}
                  onChange={(e) => setOptimizationParams({ ...optimizationParams, use_traffic_data: e.target.checked })}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="use_traffic_data" className="ml-2 text-sm text-secondary-700">
                  Use real-time traffic data
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowOptimizationForm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleStartOptimization}
              >
                Start Optimization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Jobs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">Optimization Jobs</h3>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-secondary-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-secondary-200">
            {jobs.map((job) => (
              <div key={job.job_id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-secondary-900">
                        {job.job_name}
                      </h4>
                      <span
                        className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          statusColors[job.job_status as keyof typeof statusColors]
                        )}
                      >
                        {job.job_status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-secondary-600">
                      <div>
                        <span className="font-medium">Orders:</span> {job.total_orders}
                      </div>
                      <div>
                        <span className="font-medium">Vehicles:</span> {job.max_vehicles}
                      </div>
                      <div>
                        <span className="font-medium">Criteria:</span> {job.optimization_criteria.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {format(new Date(job.created_at), 'MMM d, HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-primary-600 hover:text-primary-900">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optimized Routes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">Optimized Routes</h3>
        </div>
        
        <div className="divide-y divide-secondary-200">
          {routes.map((route) => (
            <div key={route.route_id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <MapIcon className="h-5 w-5 text-primary-600" />
                    <h4 className="text-lg font-medium text-secondary-900">
                      {route.route_name}
                    </h4>
                    <span
                      className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        routeStatusColors[route.route_status as keyof typeof routeStatusColors]
                      )}
                    >
                      {route.route_status}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-secondary-600">
                    <div>
                      <span className="font-medium">Distance:</span> {route.total_distance_km.toFixed(1)} km
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {route.total_duration_minutes} min
                    </div>
                    <div>
                      <span className="font-medium">Stops:</span> {route.total_stops}
                    </div>
                    <div>
                      <span className="font-medium">Weight:</span> {route.total_weight_kg.toFixed(1)} kg
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="text-primary-600 hover:text-primary-900"
                    onClick={() => setMapRoute(route)}
                    title="View route on map"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {mapRoute && mapRoute.stops && mapRoute.stops.length > 0 && (
        <div className="fixed inset-0 bg-secondary-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-5xl mx-4 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <h3 className="text-lg font-medium text-secondary-900">
                {mapRoute.route_name || 'Route'} — Map
              </h3>
              <button className="text-secondary-500 hover:text-secondary-700" onClick={() => setMapRoute(null)}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <RouteMap route={mapRoute} height={520} />
            </div>
          </div>
        </div>
      )}
      
      {mapRoute && (!mapRoute.stops || mapRoute.stops.length === 0) && (
        <div className="fixed inset-0 bg-secondary-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No Route Data</h3>
              <p className="text-secondary-600 mb-4">This route has no stops to display on the map.</p>
              <button
                className="btn-primary"
                onClick={() => setMapRoute(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
