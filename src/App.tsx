import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppDispatch } from './store/hooks';
import { initializeAuth } from './store/slices/authSlice';
import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { PublicRoute } from './components/PublicRoute';
import { Dashboard } from './pages/Dashboard';
import { OrdersPage } from './pages/OrdersPage';
import { RouteOptimizationPage } from './pages/RouteOptimizationPage';
import { TrafficPage } from './pages/TrafficPage';
import { CustomersPage } from './pages/CustomersPage';
import { DriversPage } from './pages/DriversPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize authentication state on app start
    dispatch(initializeAuth());
  }, [dispatch]);
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <AuthGuard>
            <Layout />
          </AuthGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="routes" element={<RouteOptimizationPage />} />
        <Route path="traffic" element={<TrafficPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="drivers" element={<DriversPage />} />
      </Route>
    </Routes>
  );
}

export default App;
