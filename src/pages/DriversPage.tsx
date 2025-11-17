import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDrivers } from '../store/slices/ordersSlice';
import { Driver } from '../services/orderService';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const formatCoordinate = (value?: number | string, fractionDigits = 4): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const numericValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return numericValue.toFixed(fractionDigits);
};

export const DriversPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { drivers, isLoading } = useAppSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = `${driver.first_name} ${driver.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.license_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'available' && driver.is_available) ||
      (statusFilter === 'unavailable' && !driver.is_available);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Drivers</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage driver profiles and vehicle information
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Driver
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Drivers</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">
            Drivers ({filteredDrivers.length})
          </h3>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-40 bg-secondary-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrivers.map((driver) => {
                const formattedLatitude = formatCoordinate(driver.current_latitude);
                const formattedLongitude = formatCoordinate(driver.current_longitude);

                return (
                  <div key={driver.driver_id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <TruckIcon className="h-6 w-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-secondary-900 truncate">
                            {driver.first_name} {driver.last_name}
                          </h4>
                          <p className="text-sm text-secondary-500">License: {driver.license_number}</p>
                        </div>
                      </div>
                      <span
                        className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          driver.is_available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        )}
                      >
                        {driver.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-secondary-600">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-secondary-400" />
                        <span className="truncate">{driver.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-secondary-600">
                        <PhoneIcon className="h-4 w-4 mr-2 text-secondary-400" />
                        <span>{driver.phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-secondary-600">
                        <TruckIcon className="h-4 w-4 mr-2 text-secondary-400" />
                        <span>{driver.vehicle_type} • {driver.vehicle_capacity_kg}kg capacity</span>
                      </div>
                      {formattedLatitude && formattedLongitude && (
                        <div className="flex items-center text-sm text-secondary-600">
                          <MapPinIcon className="h-4 w-4 mr-2 text-secondary-400" />
                          <span>Location: {formattedLatitude}, {formattedLongitude}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-secondary-200">
                      <p className="text-xs text-secondary-500">
                        Driver since {format(new Date(driver.created_at), 'MMM yyyy')}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 text-sm font-medium text-primary-600 hover:text-primary-500">
                        View Details
                      </button>
                      <button className="flex-1 text-sm font-medium text-secondary-600 hover:text-secondary-500">
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredDrivers.length === 0 && (
              <div className="text-center py-12">
                <TruckIcon className="mx-auto h-12 w-12 text-secondary-400" />
                <h3 className="mt-2 text-sm font-medium text-secondary-900">No drivers found</h3>
                <p className="mt-1 text-sm text-secondary-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search terms or filters.' 
                    : 'Get started by adding a new driver.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
