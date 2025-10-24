import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { trafficApi, TrafficFlowResponse, TrafficIncident, RouteTrafficResponse, ApiUsageLog } from '../../services/trafficService';

interface TrafficState {
  trafficFlow: TrafficFlowResponse | null;
  trafficIncidents: TrafficIncident[];
  routeTraffic: RouteTrafficResponse | null;
  apiUsageLogs: ApiUsageLog[];
  cacheStats: {
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
  } | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    severity?: string;
    date_range?: { start: string; end: string };
  };
}

const initialState: TrafficState = {
  trafficFlow: null,
  trafficIncidents: [],
  routeTraffic: null,
  apiUsageLogs: [],
  cacheStats: null,
  isLoading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchTrafficFlow = createAsyncThunk(
  'traffic/fetchTrafficFlow',
  async (params: { lat: number; lng: number; radius?: number; force_refresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await trafficApi.getTrafficFlow(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch traffic flow');
    }
  }
);

export const fetchTrafficIncidents = createAsyncThunk(
  'traffic/fetchTrafficIncidents',
  async (params: { lat?: number; lng?: number; radius?: number; severity?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await trafficApi.getTrafficIncidents(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch traffic incidents');
    }
  }
);

export const fetchRouteTraffic = createAsyncThunk(
  'traffic/fetchRouteTraffic',
  async (request: { waypoints: Array<{ lat: number; lng: number }>; departure_time?: string }, { rejectWithValue }) => {
    try {
      const response = await trafficApi.getRouteTraffic(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch route traffic');
    }
  }
);

export const fetchApiUsageLogs = createAsyncThunk(
  'traffic/fetchApiUsageLogs',
  async (params: { start_date?: string; end_date?: string; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await trafficApi.getApiUsageLogs(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch API usage logs');
    }
  }
);

export const fetchCacheStats = createAsyncThunk(
  'traffic/fetchCacheStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await trafficApi.getCacheStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch cache stats');
    }
  }
);

export const clearTrafficCache = createAsyncThunk(
  'traffic/clearTrafficCache',
  async (_, { rejectWithValue }) => {
    try {
      await trafficApi.clearCache();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to clear cache');
    }
  }
);

export const fetchServiceHealth = createAsyncThunk(
  'traffic/fetchServiceHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await trafficApi.getServiceHealth();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch service health');
    }
  }
);

const trafficSlice = createSlice({
  name: 'traffic',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TrafficState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearTrafficFlow: (state) => {
      state.trafficFlow = null;
    },
    clearRouteTraffic: (state) => {
      state.routeTraffic = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch traffic flow
      .addCase(fetchTrafficFlow.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrafficFlow.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trafficFlow = action.payload;
        state.error = null;
      })
      .addCase(fetchTrafficFlow.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch traffic incidents
      .addCase(fetchTrafficIncidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrafficIncidents.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure trafficIncidents is always an array
        state.trafficIncidents = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchTrafficIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Ensure trafficIncidents remains an array even on error
        state.trafficIncidents = [];
      })
      // Fetch route traffic
      .addCase(fetchRouteTraffic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRouteTraffic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.routeTraffic = action.payload;
        state.error = null;
      })
      .addCase(fetchRouteTraffic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch API usage logs
      .addCase(fetchApiUsageLogs.fulfilled, (state, action) => {
        state.apiUsageLogs = action.payload;
      })
      // Fetch cache stats
      .addCase(fetchCacheStats.fulfilled, (state, action) => {
        state.cacheStats = action.payload;
      })
      // Clear cache
      .addCase(clearTrafficCache.fulfilled, (state) => {
        state.cacheStats = null;
        state.trafficFlow = null;
        state.routeTraffic = null;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearError,
  clearTrafficFlow,
  clearRouteTraffic,
} = trafficSlice.actions;

export default trafficSlice.reducer;
