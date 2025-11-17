import { routeOptimizerApi } from './api';

export interface OptimizationConstraints {
  max_stops_per_route: number;
  max_route_duration_minutes: number;
  max_vehicles: number;
  vehicle_capacity_kg: number;
  optimization_criteria: 'MINIMIZE_DISTANCE' | 'MINIMIZE_TIME' | 'MINIMIZE_COST';
  depot_latitude?: number;
  depot_longitude?: number;
  working_hours_start: string;
  working_hours_end: string;
}

export interface OptimizationRequest {
  order_ids: string[];
  job_name?: string;
  constraints: OptimizationConstraints;
  use_traffic_data: boolean;
}

export interface OptimizationJob {
  job_id: string;
  job_name: string;
  job_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  total_orders: number;
  optimization_criteria: string;
  max_vehicles: number;
  vehicle_capacity_kg: number;
  depot_latitude: number;
  depot_longitude: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface RouteStop {
  stop_id: string;
  route_id: string;
  order_id: string;
  stop_sequence: number;
  stop_type: 'PICKUP' | 'DELIVERY';
  latitude: number;
  longitude: number;
  estimated_arrival_time: string;
  estimated_departure_time: string;
  actual_arrival_time?: string;
  actual_departure_time?: string;
  stop_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  created_at: string;
  updated_at: string;
}

export interface OptimizedRoute {
  route_id: string;
  job_id: string;
  vehicle_id: string;
  driver_id?: string;
  route_name: string;
  total_distance_km: number;
  total_duration_minutes: number;
  total_stops: number;
  total_weight_kg: number;
  route_status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  stops?: RouteStop[];
}

export interface OptimizationJobResponse {
  job_id: string;
  job_name: string;
  job_status: string;
  total_orders: number;
  optimization_criteria: string;
  max_vehicles: number;
  vehicle_capacity_kg: number;
  depot_latitude: number;
  depot_longitude: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
  routes?: OptimizedRoute[];
  summary?: OptimizationSummary;
}

export interface OptimizationSummary {
  total_routes: number;
  total_distance_km: number;
  total_duration_minutes: number;
  total_orders_optimized: number;
  average_distance_per_route: number;
  average_duration_per_route: number;
  optimization_savings_percentage: number;
  fuel_cost_estimate: number;
  time_savings_minutes: number;
}

// Route Optimization API
export const routeOptimizerApiService = {
  optimizeRoutes: (request: OptimizationRequest) =>
    routeOptimizerApi.post<{ job_id: string; status: string; message: string; estimated_completion_time: string }>('/routes/optimize', request),
  
  getOptimizationJob: (jobId: string) =>
    routeOptimizerApi.get<OptimizationJobResponse>(`/routes/jobs/${jobId}`),
  
  getAllJobs: (params?: { skip?: number; limit?: number; status?: string }) =>
    routeOptimizerApi.get<OptimizationJob[]>('/routes/jobs', { params }),
  
  deleteJob: (jobId: string) =>
    routeOptimizerApi.delete<{ status: string; message?: string }>(`/routes/jobs/${jobId}`),
  
  getRoute: (routeId: string) =>
    routeOptimizerApi.get<OptimizedRoute>(`/routes/${routeId}`),
  
  getAllRoutes: (params?: { job_id?: string; status?: string }) =>
    routeOptimizerApi.get<OptimizedRoute[]>('/routes', { params }),
  
  updateRouteStatus: (routeId: string, status: string) =>
    routeOptimizerApi.put<OptimizedRoute>(`/routes/${routeId}/status`, { route_status: status }),
  
  assignDriver: (routeId: string, driverId: string) =>
    routeOptimizerApi.put<OptimizedRoute>(`/routes/${routeId}/assign`, { driver_id: driverId }),
  
  getPerformanceMetrics: (params?: { start_date?: string; end_date?: string }) =>
    routeOptimizerApi.get<OptimizationSummary>('/routes/metrics', { params }),
};
