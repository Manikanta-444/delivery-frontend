import React from 'react';
import { Link } from 'react-router-dom';
import { OptimizationJob } from '../services/routeOptimizerService';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface OptimizationJobsProps {
  jobs: OptimizationJob[];
  isLoading: boolean;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

export const OptimizationJobs: React.FC<OptimizationJobsProps> = ({ jobs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Optimization Jobs</h3>
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
        <h3 className="text-lg font-medium text-secondary-900">Recent Optimization Jobs</h3>
        <Link
          to="/routes"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {jobs.length === 0 ? (
          <p className="text-secondary-500 text-sm">No optimization jobs found</p>
        ) : (
          jobs.map((job) => (
            <div key={job.job_id} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {job.job_name}
                </p>
                <p className="text-sm text-secondary-500">
                  {job.total_orders} orders • {job.optimization_criteria}
                </p>
                <p className="text-xs text-secondary-400">
                  {format(new Date(job.created_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
              <span
                className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  statusColors[job.job_status as keyof typeof statusColors]
                )}
              >
                {job.job_status.replace('_', ' ')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
