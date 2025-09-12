import React from 'react';
import { Link } from 'react-router-dom';
import { DeliveryOrder } from '../services/orderService';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface RecentOrdersProps {
  orders: DeliveryOrder[];
  isLoading: boolean;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-secondary-900">Recent Orders</h3>
        <Link
          to="/orders"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-secondary-500 text-sm">No orders found</p>
        ) : (
          orders.map((order) => (
            <div key={order.order_id} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  Order #{order.order_id.slice(-8)}
                </p>
                <p className="text-sm text-secondary-500">
                  {order.customer?.first_name} {order.customer?.last_name}
                </p>
                <p className="text-xs text-secondary-400">
                  {format(new Date(order.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <span
                className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  statusColors[order.order_status as keyof typeof statusColors]
                )}
              >
                {order.order_status.replace('_', ' ')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
