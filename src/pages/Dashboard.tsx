import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrders } from '../store/slices/ordersSlice';
import { fetchOptimizationJobs } from '../store/slices/routesSlice';
import { fetchTrafficIncidents, fetchCacheStats } from '../store/slices/trafficSlice';
import { StatsCard } from '../components/StatsCard';
import { RecentOrders } from '../components/RecentOrders';
import { OptimizationJobs } from '../components/OptimizationJobs';
import { TrafficAlerts } from '../components/TrafficAlerts';
import {
  ClipboardDocumentListIcon,
  MapIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading: ordersLoading } = useAppSelector((state) => state.orders);
  const { jobs, isLoading: jobsLoading } = useAppSelector((state) => state.routes);
  const { trafficIncidents, cacheStats, isLoading: trafficLoading } = useAppSelector((state) => state.traffic);

  useEffect(() => {
    dispatch(fetchOrders({ limit: 10 }));
    dispatch(fetchOptimizationJobs({ limit: 5 }));
    dispatch(fetchTrafficIncidents({}));
    dispatch(fetchCacheStats());
  }, [dispatch]);

  const stats = [
    {
      name: 'Total Orders',
      value: orders.length.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: ClipboardDocumentListIcon,
    },
    {
      name: 'Active Routes',
      value: jobs.filter(job => job.job_status === 'IN_PROGRESS').length.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: MapIcon,
    },
    {
      name: 'Traffic Incidents',
      value: trafficIncidents.filter(incident => incident.status === 'ACTIVE').length.toString(),
      change: '-2',
      changeType: 'negative' as const,
      icon: ExclamationTriangleIcon,
    },
    {
      name: 'Cache Hit Rate',
      value: cacheStats ? `${Math.round(cacheStats.cache_hit_rate * 100)}%` : '0%',
      change: '+5%',
      changeType: 'positive' as const,
      icon: ClockIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="mt-1 text-sm text-secondary-600">
          Overview of your delivery operations
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="lg:col-span-1">
          <RecentOrders orders={orders.slice(0, 5)} isLoading={ordersLoading} />
        </div>

        {/* Optimization Jobs */}
        <div className="lg:col-span-1">
          <OptimizationJobs jobs={jobs.slice(0, 5)} isLoading={jobsLoading} />
        </div>
      </div>

      {/* Traffic Alerts */}
      <div className="lg:col-span-2">
        <TrafficAlerts incidents={trafficIncidents.slice(0, 5)} isLoading={trafficLoading} />
      </div>
    </div>
  );
};
