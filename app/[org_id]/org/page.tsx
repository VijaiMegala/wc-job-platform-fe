'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI, applicationsAPI } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Job {
  job_id: string;
  title: string;
  job_description?: string;
  location?: string;
  created_at: string;
}

interface Application {
  application_id: string;
  job: Job;
  status: string;
  created_at: string;
}

export default function OrgDashboardPage() {
  const params = useParams();
  const orgId = params.org_id as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for AuthContext to finish loading before checking auth
    if (authLoading) {
      return;
    }

    // Double-check localStorage directly as fallback
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const hasToken = !!token;
    
    if (!isAuthenticated && !hasToken) {
      router.push('/org/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [jobsData, appsData] = await Promise.all([
          jobsAPI.getAll(orgId, { page: 1, limit: 5 }),
          applicationsAPI.getAll(orgId, { page: 1, limit: 5 }),
        ]);
        setJobs(jobsData.data);
        setApplications(appsData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orgId, isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
                      <dd className="text-lg font-medium text-gray-900">{jobs.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    href={`/${orgId}/org/jobs`}
                    className="font-medium text-blue-700 hover:text-blue-900"
                  >
                    View all jobs
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                      <dd className="text-lg font-medium text-gray-900">{applications.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    href={`/${orgId}/org/applications`}
                    className="font-medium text-green-700 hover:text-green-900"
                  >
                    View all applications
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Link
                  href={`/${orgId}/org/create-job`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Job
                </Link>
                <Link
                  href={`/${orgId}/org/jobs`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  List Jobs
                </Link>
                <Link
                  href={`/${orgId}/org/analytics`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Analytics
                </Link>
                <Link
                  href={`/${orgId}/org/settings`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Jobs</h3>
                <div className="space-y-4">
                  {jobs.length === 0 ? (
                    <p className="text-gray-500">No jobs yet</p>
                  ) : (
                    jobs.map((job) => (
                      <div key={job.job_id} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        {job.location && (
                          <p className="text-sm text-gray-500">{job.location}</p>
                        )}
                        <Link
                          href={`/${orgId}/org/jobs/${job.job_id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View details →
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Applications</h3>
                <div className="space-y-4">
                  {applications.length === 0 ? (
                    <p className="text-gray-500">No applications yet</p>
                  ) : (
                    applications.map((app) => (
                      <div key={app.application_id} className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium text-gray-900">{app.job.title}</h4>
                        <p className="text-sm text-gray-500">
                          Status: <span className="font-medium">{app.status}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

