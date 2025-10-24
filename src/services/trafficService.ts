import { trafficServiceApi } from './api';

export interface TrafficFlowRequest {
  lat: number;
  lng: number;
  radius: number;
}

export interface TrafficFlowResponse {
  cache_id: string;
  road_segment_id: string;
  start_latitude: number;
  start_longitude: number;
  end_latitude?: number;
  end_longitude?: number;
  current_speed_kmph: number;
  free_flow_speed_kmph: number;
  confidence_level: number;
  congestion_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  cached_at: string;
  expires_at: string;
}

export interface TrafficIncident {
  incident_id: string;
  incident_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  latitude: number;
  longitude: number;
  start_time: string;
  end_time?: string;
  affected_roads: string[];
  status: 'ACTIVE' | 'RESOLVED' | 'EXPIRED';
  created_at: string;
  updated_at: string;
}

export interface RouteTrafficRequest {
  waypoints: Array<{ lat: number; lng: number }>;
  departure_time?: string;
}

export interface RouteTrafficResponse {
  route_id: string;
  total_distance_km: number;
  total_duration_minutes: number;
  traffic_delay_minutes: number;
  route_segments: TrafficFlowResponse[];
  waypoints: Array<{ lat: number; lng: number }>;
  departure_time: string;
  arrival_time: string;
  confidence_level: number;
}

export interface ApiUsageLog {
  log_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  timestamp: string;
  user_id?: string;
  api_key?: string;
}

// Traffic API
export const trafficApi = {
  getTrafficFlow: (params: { lat: number; lng: number; radius?: number; force_refresh?: boolean }) =>
    trafficServiceApi.get<TrafficFlowResponse>('/traffic/flow', { params }),
  
  getRouteTraffic: (request: RouteTrafficRequest) =>
    trafficServiceApi.post<RouteTrafficResponse>('/traffic/route', request),
  
  getTrafficIncidents: (params?: { lat?: number; lng?: number; radius?: number; severity?: string }) =>
    trafficServiceApi.get<TrafficIncident[]>('/traffic/incidents', { params }),
  
  getIncidentById: (incidentId: string) =>
    trafficServiceApi.get<TrafficIncident>(`/traffic/incidents/${incidentId}`),
  
  getApiUsageLogs: (params?: { start_date?: string; end_date?: string; limit?: number }) =>
    trafficServiceApi.get<ApiUsageLog[]>('/traffic/usage-logs', { params }),
  
  getCacheStats: () =>
    trafficServiceApi.get<{
      status: string;
      total_keys: number;
      traffic_flow_keys: number;
      route_keys: number;
      memory_used_bytes: number;
      memory_used_mb: number;
      redis_version: string;
      uptime_seconds: number;
      connected_clients: number;
      used_memory_human: string;
      timestamp: string;
    }>('/traffic/cache-stats'),
  
  clearCache: () =>
    trafficServiceApi.delete('/traffic/cache'),
  
  getServiceHealth: () =>
    trafficServiceApi.get<{ status: string; service: string; here_api_status: string; cache_status: string }>('/health'),
};
