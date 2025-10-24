import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { routeOptimizerApiService, OptimizationJob, OptimizedRoute, OptimizationRequest } from '../../services/routeOptimizerService';

interface RoutesState {
  jobs: OptimizationJob[];
  routes: OptimizedRoute[];
  selectedJob: OptimizationJob | null;
  selectedRoute: OptimizedRoute | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    job_id?: string;
    date_range?: { start: string; end: string };
  };
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };
}

const initialState: RoutesState = {
  jobs: [],
  routes: [],
  selectedJob: null,
  selectedRoute: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    skip: 0,
    limit: 20,
    total: 0,
  },
};

// Async thunks
export const optimizeRoutes = createAsyncThunk(
  'routes/optimizeRoutes',
  async (request: OptimizationRequest, { rejectWithValue }) => {
    try {
      const response = await routeOptimizerApiService.optimizeRoutes(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to start optimization');
    }
  }
);

export const fetchOptimizationJobs = createAsyncThunk(
  'routes/fetchOptimizationJobs',
  async (params: { skip?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await routeOptimizerApiService.getAllJobs(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch optimization jobs');
    }
  }
);

export const fetchOptimizationJob = createAsyncThunk(
  'routes/fetchOptimizationJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await routeOptimizerApiService.getOptimizationJob(jobId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch optimization job');
    }
  }
);

export const fetchRoutes = createAsyncThunk(
  'routes/fetchRoutes',
  async (params: { job_id?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await routeOptimizerApiService.getAllRoutes(params);
      
      // Transform data to fix field name mismatch between backend and frontend
      const transformedRoutes = response.data.map((route: any) => ({
        ...route,
        stops: route.stops?.map((stop: any) => ({
          ...stop,
          // Backend returns address_latitude/address_longitude, frontend expects latitude/longitude
          latitude: stop.address_latitude || stop.latitude,
          longitude: stop.address_longitude || stop.longitude,
        })) || []
      }));
      
      return transformedRoutes;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch routes');
    }
  }
);

export const fetchRoute = createAsyncThunk(
  'routes/fetchRoute',
  async (routeId: string, { rejectWithValue }) => {
    try {
      const response = await routeOptimizerApiService.getRoute(routeId);
      
      // Transform data to fix field name mismatch
      const transformedRoute = {
        ...response.data,
        stops: response.data.stops?.map((stop: any) => ({
          ...stop,
          latitude: stop.address_latitude || stop.latitude,
          longitude: stop.address_longitude || stop.longitude,
        })) || []
      };
      
      return transformedRoute;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch route');
    }
  }
);

export const updateRouteStatus = createAsyncThunk(
  'routes/updateRouteStatus',
  async ({ routeId, status }: { routeId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await routeOptimizerApiService.updateRouteStatus(routeId, status);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update route status');
    }
  }
);

export const assignDriver = createAsyncThunk(
  'routes/assignDriver',
  async ({ routeId, driverId }: { routeId: string; driverId: string }, { rejectWithValue }) => {
    try {
      const response = await routeOptimizerApiService.assignDriver(routeId, driverId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to assign driver');
    }
  }
);

export const fetchPerformanceMetrics = createAsyncThunk(
  'routes/fetchPerformanceMetrics',
  async (params: { start_date?: string; end_date?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await routeOptimizerApiService.getPerformanceMetrics(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch performance metrics');
    }
  }
);

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setSelectedJob: (state, action: PayloadAction<OptimizationJob | null>) => {
      state.selectedJob = action.payload;
    },
    setSelectedRoute: (state, action: PayloadAction<OptimizedRoute | null>) => {
      state.selectedRoute = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<RoutesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPagination: (state, action: PayloadAction<Partial<RoutesState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Optimize routes
      .addCase(optimizeRoutes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(optimizeRoutes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(optimizeRoutes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch optimization jobs
      .addCase(fetchOptimizationJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOptimizationJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
        state.error = null;
      })
      .addCase(fetchOptimizationJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch optimization job
      .addCase(fetchOptimizationJob.fulfilled, (state, action) => {
        state.selectedJob = action.payload as OptimizationJob;
        if (action.payload.routes) {
          state.routes = action.payload.routes;
        }
      })
      // Fetch routes
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.routes = action.payload;
      })
      // Fetch route
      .addCase(fetchRoute.fulfilled, (state, action) => {
        state.selectedRoute = action.payload;
      })
      // Update route status
      .addCase(updateRouteStatus.fulfilled, (state, action) => {
        const index = state.routes.findIndex(route => route.route_id === action.payload.route_id);
        if (index !== -1) {
          state.routes[index] = action.payload;
        }
        if (state.selectedRoute?.route_id === action.payload.route_id) {
          state.selectedRoute = action.payload;
        }
      })
      // Assign driver
      .addCase(assignDriver.fulfilled, (state, action) => {
        const index = state.routes.findIndex(route => route.route_id === action.payload.route_id);
        if (index !== -1) {
          state.routes[index] = action.payload;
        }
        if (state.selectedRoute?.route_id === action.payload.route_id) {
          state.selectedRoute = action.payload;
        }
      });
  },
});

export const {
  setSelectedJob,
  setSelectedRoute,
  setFilters,
  clearFilters,
  setPagination,
  clearError,
} = routesSlice.actions;

export default routesSlice.reducer;
