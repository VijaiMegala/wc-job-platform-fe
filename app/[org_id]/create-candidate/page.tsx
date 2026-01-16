'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usersAPI, authAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function CreateCandidatePage() {
  const params = useParams();
  const orgId = params.org_id as string;
  const router = useRouter();
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await usersAPI.createCandidate({
        ...formData,
        org_id: orgId,
      });
      // Redirect to candidate login
      router.push(`/${orgId}/candidate/login`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create Candidate Account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="user_name"
                  name="user_name"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.user_name}
                  onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="user_email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="user_email"
                  name="user_email"
                  type="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.user_email}
                  onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="user_password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="user_password"
                  name="user_password"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.user_password}
                  onChange={(e) => setFormData({ ...formData, user_password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <a
                href={`/${orgId}/candidate/login`}
                className="text-blue-600 hover:text-blue-500"
              >
                Already have an account? Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

