import React from 'react';
import { clsx } from 'clsx';

interface StatsCardProps {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  name,
  value,
  change,
  changeType,
  icon: Icon,
}) => {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-primary-600" aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-secondary-500 truncate">
              {name}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-secondary-900">
                {value}
              </div>
              <div
                className={clsx(
                  'ml-2 flex items-baseline text-sm font-semibold',
                  {
                    'text-green-600': changeType === 'positive',
                    'text-red-600': changeType === 'negative',
                    'text-secondary-500': changeType === 'neutral',
                  }
                )}
              >
                {change}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};
