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

export default function JobDetailPage() {
  const params = useParams();
  const orgId = params.org_id as string;
  const jobId = params.job_id as string;
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/org/login');
      return;
    }

    const fetchJob = async () => {
      try {
        const jobData = await jobsAPI.getOne(jobId);
        setJob(jobData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch job');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, isAuthenticated, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await jobsAPI.delete(jobId);
      router.push(`/${orgId}/org/jobs`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete job');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <Link
              href={`/${orgId}/org`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link
            href={`/${orgId}/org`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </Link>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex space-x-2">
                <Link
                  href={`/${orgId}/org/jobs/${jobId}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {job.job_description && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{job.job_description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                {job.work_policy && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Work Policy</span>
                    <p className="text-gray-900">🏠 {job.work_policy}</p>
                  </div>
                )}
                {job.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Location</span>
                    <p className="text-gray-900">📍 {job.location}</p>
                  </div>
                )}
                {job.department && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Department</span>
                    <p className="text-gray-900">{job.department}</p>
                  </div>
                )}
                {job.employment_type && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Employment Type</span>
                    <p className="text-gray-900">{job.employment_type}</p>
                  </div>
                )}
                {job.experience_level && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Experience Level</span>
                    <p className="text-gray-900">{job.experience_level}</p>
                  </div>
                )}
                {job.job_type && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Job Type</span>
                    <p className="text-gray-900">{job.job_type}</p>
                  </div>
                )}
                {job.salary_range && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Salary Range</span>
                    <p className="text-gray-900">{job.salary_range}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Created</span>
                  <p className="text-gray-900">
                    {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                {job.closed_at && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Closing Date</span>
                    <p className="text-gray-900">
                      {new Date(job.closed_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

