'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI, applicationsAPI, usersAPI, organizationAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';

interface Job {
  job_id: string;
  title: string;
  job_description?: string;
  location?: string;
}

interface Organization {
  org_id: string;
  org_name: string;
  theme_color?: string;
  logo_url?: string;
  description?: string;
  website?: string;
}

export default function ApplyJobPage() {
  const params = useParams();
  const orgId = params.org_id as string;
  const jobId = params.job_id as string;
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
  });
  const themeColor = organization?.theme_color || '#3B82F6';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, orgData] = await Promise.all([
          jobsAPI.getOne(jobId),
          organizationAPI.getOne(orgId).catch(() => null),
        ]);
        setJob(jobData);
        setOrganization(orgData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, orgId]);

  const handleApply = async () => {
    if (!isAuthenticated || !user) {
      setShowRegister(true);
      return;
    }

    setError('');
    setApplying(true);

    try {
      await applicationsAPI.create({
        user_id: user.user_id,
        org_id: orgId,
        job_id: jobId,
      });
      router.push(`/${orgId}/candidate`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setApplying(true);

    try {
      await usersAPI.createCandidate({
        ...registerData,
        org_id: orgId,
      });
      // After registration, login and apply
      // For simplicity, we'll redirect to login
      router.push(`/${orgId}/candidate/login?jobId=${jobId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Job not found</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: organization?.theme_color ? `${themeColor}08` : '#F9FAFB',
      }}
    >
      <Navbar />
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Organization Header */}
          {organization && (
            <div 
              className="bg-white shadow-lg rounded-lg p-4 mb-6"
              style={{
                borderTop: `4px solid ${themeColor}`,
              }}
            >
              <div className="flex items-center gap-3">
                {organization.logo_url && (
                  <img
                    src={organization.logo_url}
                    alt={`${organization.org_name} logo`}
                    className="h-12 w-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h3 
                    className="text-lg font-bold"
                    style={{ color: themeColor }}
                  >
                    {organization.org_name}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div 
            className="bg-white shadow rounded-lg p-6 mb-6"
            style={{
              borderLeft: `4px solid ${themeColor}`,
            }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
            {job.location && (
              <p className="text-gray-600 mb-4">📍 {job.location}</p>
            )}
            {job.job_description && (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.job_description}</p>
              </div>
            )}
          </div>

          {!showRegister ? (
            <div className="bg-white shadow rounded-lg p-6">
              {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {isAuthenticated ? (
                <div>
                  <p className="text-gray-700 mb-4">
                    You are logged in as {user?.user_name}. Click below to apply for this job.
                  </p>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: themeColor }}
                  >
                    {applying ? 'Applying...' : 'Apply for this Job'}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 mb-4">
                    You need to create an account to apply for this job.
                  </p>
                  <button
                    onClick={() => setShowRegister(true)}
                    className="w-full px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: themeColor }}
                  >
                    Create Account & Apply
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create Account</h2>
              {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                    value={registerData.user_name}
                    onChange={(e) => setRegisterData({ ...registerData, user_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                    value={registerData.user_email}
                    onChange={(e) => setRegisterData({ ...registerData, user_email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400"
                    value={registerData.user_password}
                    onChange={(e) => setRegisterData({ ...registerData, user_password: e.target.value })}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowRegister(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: themeColor }}
                  >
                    {applying ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

