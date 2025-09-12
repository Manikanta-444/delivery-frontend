import React from 'react';
import { NavLink } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  MapIcon,
  TruckIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useAppSelector } from '../store/hooks';
import { RoleGuard } from './RoleGuard';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['CUSTOMER', 'DISPATCHER'] },
  { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon, roles: ['CUSTOMER', 'DISPATCHER'] },
  { name: 'Route Optimization', href: '/routes', icon: MapIcon, roles: ['DISPATCHER'] },
  { name: 'Traffic Monitoring', href: '/traffic', icon: TruckIcon, roles: ['DISPATCHER'] },
  { name: 'Customers', href: '/customers', icon: UserGroupIcon, roles: ['DISPATCHER'] },
  { name: 'Drivers', href: '/drivers', icon: UserIcon, roles: ['DISPATCHER'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAppSelector((state) => state.auth);
  
  const filteredNavigation = navigation.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-secondary-900/80" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white px-6 pb-4 pt-5 sm:max-w-sm sm:ring-1 sm:ring-secondary-900/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DA</span>
                </div>
                <span className="ml-2 text-lg font-semibold text-secondary-900">
                  Delivery App
                </span>
              </div>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-secondary-700"
                onClick={onClose}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-secondary-500/10">
                <div className="space-y-2 py-6">
                  {filteredNavigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
                        }`
                      }
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm">
          <div className="flex h-16 shrink-0 items-center">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DA</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-secondary-900">
              Delivery App
            </span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredNavigation.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                            isActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-50'
                          }`
                        }
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};
