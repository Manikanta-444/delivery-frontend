import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderApi, customerApi, driverApi, DeliveryOrder, Customer, Driver, Address } from '../../services/orderService';

interface OrdersState {
  orders: DeliveryOrder[];
  customers: Customer[];
  drivers: Driver[];
  addresses: Address[];
  selectedOrder: DeliveryOrder | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    customer_id?: string;
    date_range?: { start: string; end: string };
  };
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };
}

const initialState: OrdersState = {
  orders: [],
  customers: [],
  drivers: [],
  addresses: [],
  selectedOrder: null,
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
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: { skip?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await orderApi.getAll(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await orderApi.getById(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch order');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await orderApi.create(orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create order');
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ orderId, orderData }: { orderId: string; orderData: any }, { rejectWithValue }) => {
    try {
      const response = await orderApi.update(orderId, orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }: { orderId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await orderApi.updateStatus(orderId, status);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update order status');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      await orderApi.delete(orderId);
      return orderId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete order');
    }
  }
);

export const fetchCustomers = createAsyncThunk(
  'orders/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerApi.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch customers');
    }
  }
);

export const fetchDrivers = createAsyncThunk(
  'orders/fetchDrivers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await driverApi.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch drivers');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<DeliveryOrder | null>) => {
      state.selectedOrder = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<OrdersState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPagination: (state, action: PayloadAction<Partial<OrdersState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch order by ID
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
      })
      // Create order
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })
      // Update order
      .addCase(updateOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.order_id === action.payload.order_id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?.order_id === action.payload.order_id) {
          state.selectedOrder = action.payload;
        }
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.order_id === action.payload.order_id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?.order_id === action.payload.order_id) {
          state.selectedOrder = action.payload;
        }
      })
      // Delete order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(order => order.order_id !== action.payload);
        if (state.selectedOrder?.order_id === action.payload) {
          state.selectedOrder = null;
        }
      })
      // Fetch customers
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })
      // Fetch drivers
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.drivers = action.payload;
      });
  },
});

export const {
  setSelectedOrder,
  setFilters,
  clearFilters,
  setPagination,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;
