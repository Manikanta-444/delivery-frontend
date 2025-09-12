import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderServiceApi } from '../../services/api';

interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'CUSTOMER' | 'DISPATCHER';
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: false, // Start as false, will be set to true after successful login
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Convert to form data format expected by OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', credentials.email); // Backend uses username field
      formData.append('password', credentials.password);
      
      const response = await orderServiceApi.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log(response.data);
      
      const { access_token, token_type } = response.data;
      
      // Since backend doesn't have /auth/me, we'll create a basic user object
      // In a real implementation, you might want to add a /auth/me endpoint to the backend
      const user = {
        user_id: 'temp_id', // This would come from the backend
        email: credentials.email,
        first_name: credentials.email.split('@')[0], // Extract name from email
        last_name: '',
        role: 'DISPATCHER' as const, // Default role, should come from backend
        is_active: true,
      };
      
      
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token: access_token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }, { rejectWithValue }) => {
    try {
      const response = await orderServiceApi.post('/auth/register', userData);
      const { access_token, user } = response.data;
      
      localStorage.setItem('authToken', access_token);
      return { token: access_token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Registration failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderServiceApi.get('/auth/me');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to get user info');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout endpoint if available
      try {
        await orderServiceApi.post('/auth/logout');
      } catch (apiError) {
        // Continue with logout even if API call fails
        console.warn('Logout API call failed:', apiError);
      }
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    } catch (error: any) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        return { token, user };
      }
      
      return null;
    } catch (error: any) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('authToken', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload as string;
      })
      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('authToken');
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Initialize auth
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
