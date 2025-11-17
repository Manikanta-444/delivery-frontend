import { orderServiceApi } from './api';

export interface Customer {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  address_id: string;
  customer_id: string;
  address_type: 'PICKUP' | 'DELIVERY';
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryItem {
  item_id: string;
  order_id: string;
  item_name: string;
  description?: string;
  quantity: number;
  weight: number;
  volume?: number;
  unit_price?: number;
  created_at: string;
}

export interface DeliveryOrder {
  order_id: string;
  customer_id: string;
  pickup_address_id?: string;
  delivery_address_id?: string;
  order_status: 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  priority_level: number;
  requested_delivery_time?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  total_weight?: number;
  total_volume?: number;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  pickup_address?: Address;
  delivery_address?: Address;
  items?: DeliveryItem[];
}

export interface Driver {
  driver_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  license_number: string;
  vehicle_type: string;
  vehicle_capacity_kg: number | string;
  is_available: boolean;
  current_latitude?: number | string;
  current_longitude?: number | string;
  created_at: string;
  updated_at: string;
}

// Customer API
export const customerApi = {
  getAll: () => orderServiceApi.get<Customer[]>('/customers'),
  getById: (id: string) => orderServiceApi.get<Customer>(`/customers/${id}`),
  create: (data: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>) =>
    orderServiceApi.post<Customer>('/customers', data),
  update: (id: string, data: Partial<Customer>) =>
    orderServiceApi.put<Customer>(`/customers/${id}`, data),
  delete: (id: string) => orderServiceApi.delete(`/customers/${id}`),
};

// Address API
export const addressApi = {
  getAll: () => orderServiceApi.get<Address[]>('/addresses'),
  getByCustomer: (customerId: string) =>
    orderServiceApi.get<Address[]>(`/addresses/customer/${customerId}`),
  getById: (id: string) => orderServiceApi.get<Address>(`/addresses/${id}`),
  create: (data: Omit<Address, 'address_id' | 'created_at' | 'updated_at'>) =>
    orderServiceApi.post<Address>('/addresses', data),
  update: (id: string, data: Partial<Address>) =>
    orderServiceApi.put<Address>(`/addresses/${id}`, data),
  delete: (id: string) => orderServiceApi.delete(`/addresses/${id}`),
};

// Order API
export const orderApi = {
  getAll: (params?: { skip?: number; limit?: number; status?: string }) =>
    orderServiceApi.get<DeliveryOrder[]>('/orders', { params }),
  getById: (id: string) => orderServiceApi.get<DeliveryOrder>(`/orders/${id}`),
  create: (data: Omit<DeliveryOrder, 'order_id' | 'created_at' | 'updated_at'> & { items: Omit<DeliveryItem, 'item_id' | 'order_id' | 'created_at'>[] }) =>
    orderServiceApi.post<DeliveryOrder>('/orders', data),
  update: (id: string, data: Partial<DeliveryOrder>) =>
    orderServiceApi.put<DeliveryOrder>(`/orders/${id}`, data),
  updateStatus: (id: string, status: string) =>
    orderServiceApi.put<DeliveryOrder>(`/orders/${id}/status`, { order_status: status }),
  delete: (id: string) => orderServiceApi.delete(`/orders/${id}`),
};

// Driver API
export const driverApi = {
  getAll: () => orderServiceApi.get<Driver[]>('/drivers'),
  getById: (id: string) => orderServiceApi.get<Driver>(`/drivers/${id}`),
  create: (data: Omit<Driver, 'driver_id' | 'created_at' | 'updated_at'>) =>
    orderServiceApi.post<Driver>('/drivers', data),
  update: (id: string, data: Partial<Driver>) =>
    orderServiceApi.put<Driver>(`/drivers/${id}`, data),
  updateLocation: (id: string, latitude: number, longitude: number) =>
    orderServiceApi.put<Driver>(`/drivers/${id}/location`, { latitude, longitude }),
  updateAvailability: (id: string, isAvailable: boolean) =>
    orderServiceApi.put<Driver>(`/drivers/${id}/availability`, { is_available: isAvailable }),
  delete: (id: string) => orderServiceApi.delete(`/drivers/${id}`),
};
