import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { 
  UserIcon, 
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon 
} from '@heroicons/react/24/outline';

type UserType = 'customer' | 'dispatcher';

interface UserTypeOption {
  id: UserType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  demoCredentials: {
    email: string;
    password: string;
  };
}

const userTypes: UserTypeOption[] = [
  {
    id: 'customer',
    name: 'Customer',
    description: 'Place and track delivery orders',
    icon: UserIcon,
    demoCredentials: {
      email: '',
      password: ''
    }
  },
  {
    id: 'dispatcher',
    name: 'Dispatcher',
    description: 'Manage orders, routes, and system operations',
    icon: ShieldCheckIcon,
    demoCredentials: {
      email: '',
      password: ''
    }
  }
];

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [selectedUserType, setSelectedUserType] = useState<UserType>('dispatcher');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUserTypeChange = (userType: UserType) => {
    setSelectedUserType(userType);
    // Clear form when switching user types
    setFormData({
      email: '',
      password: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await dispatch(login(formData)).unwrap();
      toast.success('Login successful!');
      
      // Redirect to the page they were trying to access, or dashboard
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error as string);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">DA</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
            Welcome to Delivery App
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Choose your role and sign in to access the system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Type Selection */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-secondary-900">Select Your Role</h3>
            <div className="space-y-3">
              {userTypes.map((userType) => {
                const Icon = userType.icon;
                return (
                  <button
                    key={userType.id}
                    type="button"
                    onClick={() => handleUserTypeChange(userType.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedUserType === userType.id
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-secondary-200 bg-white hover:border-primary-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedUserType === userType.id
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-secondary-100 text-secondary-600'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-secondary-900">{userType.name}</h4>
                        <p className="text-sm text-secondary-600">{userType.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-lg font-medium text-secondary-900 mb-6">
              Sign In as {userTypes.find(type => type.id === selectedUserType)?.name}
            </h3>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input-field pr-10"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-secondary-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-secondary-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-base font-medium"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
              <h4 className="text-sm font-medium text-secondary-900 mb-2">Need Help?</h4>
              <div className="text-sm text-secondary-600 space-y-1">
                <p>Contact your system administrator for login credentials.</p>
                <p>Make sure your delivery-order-service is running on port 8000.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
