import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCustomers } from '../store/slices/ordersSlice';
import { Customer } from '../services/orderService';
import { format } from 'date-fns';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

export const CustomersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { customers, isLoading } = useAppSelector((state) => state.orders);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const filteredCustomers = customers.filter(customer =>
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Customers</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage customer information and delivery addresses
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customers grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">
            Customers ({filteredCustomers.length})
          </h3>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-secondary-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCustomers.map((customer) => (
                <div key={customer.customer_id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-secondary-900 truncate">
                        {customer.first_name} {customer.last_name}
                      </h4>
                      <p className="text-sm text-secondary-500">Customer ID: #{customer.customer_id.slice(-8)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-secondary-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-secondary-400" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-secondary-600">
                      <PhoneIcon className="h-4 w-4 mr-2 text-secondary-400" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-secondary-200">
                    <p className="text-xs text-secondary-500">
                      Member since {format(new Date(customer.created_at), 'MMM yyyy')}
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
              ))}
            </div>
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-secondary-400" />
                <h3 className="mt-2 text-sm font-medium text-secondary-900">No customers found</h3>
                <p className="mt-1 text-sm text-secondary-500">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new customer.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
