'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { applicationsAPI } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Application {
  application_id: string;
  user: {
    user_id: string;
    user_name: string;
    user_email: string;
  };
  job: {
    job_id: string;
    title: string;
  };
  status: string;
  created_at: string;
}

export default function ApplicationsPage() {
  const params = useParams();
  const orgId = params.org_id as string;
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/org/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await applicationsAPI.getAll(orgId, { page, limit: 10 });
        setApplications(response.data);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [orgId, page, isAuthenticated, router]);

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus);
      // Refresh applications
      const response = await applicationsAPI.getAll(orgId, { page, limit: 10 });
      setApplications(response.data);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Applications</h1>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {applications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No applications found</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.application_id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {app.job.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Candidate:</span> {app.user.user_name} ({app.user.user_email})
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Applied: {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col items-end space-y-2">
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                              app.status,
                            )}`}
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          <div className="flex space-x-2">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusUpdate(app.application_id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-900"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
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

