import React from 'react';
import { Link } from 'react-router-dom';
import { TrafficIncident } from '../services/trafficService';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface TrafficAlertsProps {
  incidents: TrafficIncident[];
  isLoading: boolean;
}

const severityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export const TrafficAlerts: React.FC<TrafficAlertsProps> = ({ incidents, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Traffic Alerts</h3>
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

  // Ensure incidents is an array before filtering
  const safeIncidents = Array.isArray(incidents) ? incidents : [];
  const activeIncidents = safeIncidents.filter(incident => incident.status === 'ACTIVE');

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-secondary-900">Traffic Alerts</h3>
        <Link
          to="/traffic"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {activeIncidents.length === 0 ? (
          <div className="text-center py-4">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-green-400" />
            <p className="mt-2 text-sm text-secondary-500">No active traffic incidents</p>
          </div>
        ) : (
          activeIncidents.map((incident) => (
            <div key={incident.incident_id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900">
                  {incident.description}
                </p>
                <p className="text-sm text-secondary-500">
                  {incident.incident_type} • {incident.affected_roads.join(', ')}
                </p>
                <p className="text-xs text-secondary-400">
                  Started {format(new Date(incident.start_time), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
              <span
                className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  severityColors[incident.severity as keyof typeof severityColors]
                )}
              >
                {incident.severity}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
