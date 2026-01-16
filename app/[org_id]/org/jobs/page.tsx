'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Job {
  job_id: string;
  title: string;
  job_description?: string;
  location?: string;
  work_policy?: string;
  department?: string;
  employment_type?: string;
  experience_level?: string;
  job_type?: string;
  salary_range?: string;
  job_slug?: string;
  created_at: string;
  closed_at: string | null;
}

export default function JobsPage() {
  const params = useParams();
  const orgId = params.org_id as string;
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/org/login');
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await jobsAPI.getAll(orgId, { page, limit: 10 });
        setJobs(response.data);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [orgId, page, isAuthenticated, router]);

  if (loading) {
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
          <Link
            href={`/${orgId}/org`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <Link
              href={`/${orgId}/org/create-job`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Job
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {jobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No jobs found</p>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.job_id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          {job.job_description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {job.job_description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                            {job.work_policy && (
                              <span>🏠 {job.work_policy}</span>
                            )}
                            {job.location && (
                              <span>📍 {job.location}</span>
                            )}
                            {job.department && (
                              <span>• {job.department}</span>
                            )}
                            {job.employment_type && (
                              <span>• {job.employment_type}</span>
                            )}
                            {job.experience_level && (
                              <span>• {job.experience_level}</span>
                            )}
                            {job.job_type && <span>• {job.job_type}</span>}
                            {job.salary_range && (
                              <span>• {job.salary_range}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Created: {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4 flex space-x-2">
                          <Link
                            href={`/${orgId}/org/jobs/${job.job_id}`}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            View
                          </Link>
                          <Link
                            href={`/${orgId}/org/jobs/${job.job_id}/edit`}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

