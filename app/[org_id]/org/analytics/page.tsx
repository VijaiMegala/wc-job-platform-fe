'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface AnalyticsData {
  job_id: string;
  title: string;
  work_policy?: string;
  job_type?: string;
  location?: string;
  total_applications: number;
  applications: Array<{
    application_id: string;
    user_id: string;
    status: string;
    created_at: string;
  }>;
}

export default function AnalyticsPage() {
  const params = useParams();
  const orgId = params.org_id as string;
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    jobName: '',
    jobType: '',
    workPolicy: '',
    location: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/org/login');
      return;
    }

    fetchAnalytics();
  }, [orgId, isAuthenticated, router, filters]);

  const fetchAnalytics = async () => {
    try {
      const data = await jobsAPI.getAnalytics(orgId, {
        jobName: filters.jobName || undefined,
        jobType: filters.jobType || undefined,
        workPolicy: filters.workPolicy || undefined,
        location: filters.location || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId: string) => {
    router.push(`/${orgId}/org/analytics/${jobId}/candidates`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const totalApplications = analytics.reduce(
    (sum, job) => sum + job.total_applications,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link
            href={`/${orgId}/org`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Analytics</h1>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Name
                </label>
                <input
                  type="text"
                  placeholder="Search by job name..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  value={filters.jobName}
                  onChange={(e) => setFilters({ ...filters, jobName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <input
                  type="text"
                  placeholder="Search by job type..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  value={filters.jobType}
                  onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Policy
                </label>
                <input
                  type="text"
                  placeholder="Search by work policy..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  value={filters.workPolicy}
                  onChange={(e) => setFilters({ ...filters, workPolicy: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Search by location..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Job Details</h2>
              {analytics.length === 0 ? (
                <p className="text-gray-500">No data available</p>
              ) : (
                <div className="space-y-4">
                  {analytics.map((job) => (
                    <div
                      key={job.job_id}
                      className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all"
                      onClick={() => handleJobClick(job.job_id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            {job.work_policy && (
                              <span className="flex items-center">
                                <span className="font-medium mr-1">Work Policy:</span>
                                {job.work_policy}
                              </span>
                            )}
                            {job.job_type && (
                              <span className="flex items-center">
                                <span className="font-medium mr-1">Job Type:</span>
                                {job.job_type}
                              </span>
                            )}
                            {job.location && (
                              <span className="flex items-center">
                                <span className="font-medium mr-1">Location:</span>
                                {job.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {job.total_applications} applications
                          </span>
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

