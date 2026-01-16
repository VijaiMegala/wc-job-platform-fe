'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function CreateJobPage() {
  const params = useParams();
  const orgId = params.org_id as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    job_description: '',
    work_policy: '',
    location: '',
    department: '',
    employment_type: '',
    experience_level: '',
    job_type: '',
    salary_range: '',
    job_slug: '',
    closed_at: '',
  });

  // Wait for auth to load
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Check authentication - also verify token exists in localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!isAuthenticated && !token) {
    router.push('/org/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Double-check token exists before making request
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!currentToken) {
        setError('Authentication token is missing. Please login again.');
        router.push('/org/login');
        return;
      }

      await jobsAPI.create({
        org_id: orgId,
        ...formData,
      });
      router.push(`/${orgId}/org/jobs`);
    } catch (err: any) {
      // Check if it's an auth error
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        // Don't clear token here - let the interceptor handle it
      } else {
        setError(err.response?.data?.message || 'Failed to create job');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Job</h1>

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="job_description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="job_description"
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                value={formData.job_description}
                onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="work_policy" className="block text-sm font-medium text-gray-700">
                  Work Policy
                </label>
                <input
                  type="text"
                  id="work_policy"
                  placeholder="e.g., Remote, On-site, Hybrid"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                  value={formData.work_policy}
                  onChange={(e) => setFormData({ ...formData, work_policy: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  placeholder="e.g., Berlin, Germany"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  placeholder="e.g., Product, Engineering"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700">
                  Employment Type
                </label>
                <input
                  type="text"
                  id="employment_type"
                  placeholder="e.g., Full time, Part time"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700">
                  Experience Level
                </label>
                <input
                  type="text"
                  id="experience_level"
                  placeholder="e.g., Senior, Junior"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                  value={formData.experience_level}
                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="job_type" className="block text-sm font-medium text-gray-700">
                  Job Type
                </label>
                <input
                  type="text"
                  id="job_type"
                  placeholder="e.g., Temporary, Permanent"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">
                  Salary Range
                </label>
                <input
                  type="text"
                  id="salary_range"
                  placeholder="e.g., AED 8K–12K / month"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="job_slug" className="block text-sm font-medium text-gray-700">
                  Job Slug
                </label>
                <input
                  type="text"
                  id="job_slug"
                  placeholder="e.g., full-stack-engineer-berlin"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                  value={formData.job_slug}
                  onChange={(e) => setFormData({ ...formData, job_slug: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="closed_at" className="block text-sm font-medium text-gray-700">
                Close Date (Optional)
              </label>
              <input
                type="date"
                id="closed_at"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 text-gray-900 bg-white"
                value={formData.closed_at}
                onChange={(e) => setFormData({ ...formData, closed_at: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

