'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { jobsAPI, applicationsAPI, usersAPI } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface CandidateDetails {
  user_id: string;
  user_name: string;
  user_email: string;
  created_at?: string;
  role?: {
    role_name: string;
  };
  organization?: {
    organization_name: string;
  };
}

interface ApplicationWithCandidate {
  application_id: string;
  user_id: string;
  status: string;
  created_at: string;
  candidate?: CandidateDetails;
}

interface Job {
  job_id: string;
  title: string;
  job_description?: string;
}

export default function JobCandidatesPage() {
  const params = useParams();
  const orgId = params.org_id as string;
  const jobId = params.job_id as string;
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<ApplicationWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<{ candidate: CandidateDetails; application: ApplicationWithCandidate } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/org/login');
      return;
    }

    fetchJobAndCandidates();
  }, [orgId, jobId, isAuthenticated, router]);

  const fetchJobAndCandidates = async () => {
    try {
      // Fetch job details
      const jobData = await jobsAPI.getOne(jobId);
      setJob(jobData);

      // Fetch analytics for this specific job to get applications
      const analyticsData = await jobsAPI.getAnalytics(orgId);

      const jobAnalytics = analyticsData.find((j: any) => j.job_id === jobId);
      
      if (jobAnalytics && jobAnalytics.applications) {
        // Fetch candidate details for each application
        const applicationsWithCandidateData: ApplicationWithCandidate[] = await Promise.all(
          jobAnalytics.applications.map(async (app: any) => {
            try {
              const candidate = await usersAPI.getOne(app.user_id);
              return {
                ...app,
                candidate: candidate as CandidateDetails,
              };
            } catch (error) {
              console.error(`Error fetching candidate ${app.user_id}:`, error);
              return {
                ...app,
                candidate: undefined,
              };
            }
          })
        );
        
        setCandidates(applicationsWithCandidateData);
      }
    } catch (error) {
      console.error('Error fetching job and candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus);
      // Update local state
      setCandidates(prev =>
        prev.map(app =>
          app.application_id === applicationId
            ? { ...app, status: newStatus }
            : app
        )
      );
      // Update selected candidate if it's the same one
      if (selectedCandidate && selectedCandidate.application.application_id === applicationId) {
        setSelectedCandidate({
          ...selectedCandidate,
          application: { ...selectedCandidate.application, status: newStatus },
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update application status');
    }
  };

  const handleViewCandidate = (candidate: CandidateDetails, application: ApplicationWithCandidate) => {
    setSelectedCandidate({ candidate, application });
  };

  const closeCandidateModal = () => {
    setSelectedCandidate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            href={`/${orgId}/org/analytics`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Analytics
          </Link>
          
          {job && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-600">{job.job_description}</p>
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Candidates Applied ({candidates.length})
                </h2>
              </div>
              
              {candidates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No candidates have applied for this job yet.</p>
              ) : (
                <div className="space-y-4">
                  {candidates.map((app) => (
                    <div
                      key={app.application_id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h5 className="font-semibold text-gray-900">
                              {app.candidate?.user_name || 'Unknown Candidate'}
                            </h5>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                app.status,
                              )}`}
                            >
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Email:</span> {app.candidate?.user_email || app.user_id}
                          </p>
                          <p className="text-xs text-gray-400">
                            Applied: {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col items-end space-y-2">
                          <button
                            onClick={() => app.candidate && handleViewCandidate(app.candidate, app)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
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
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Candidate Details Modal */}
          {selectedCandidate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Candidate Details</h2>
                  <button
                    onClick={closeCandidateModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-lg text-gray-900 mt-1">{selectedCandidate.candidate.user_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg text-gray-900 mt-1">{selectedCandidate.candidate.user_email}</p>
                    </div>
                    {selectedCandidate.candidate.role && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Role</label>
                        <p className="text-lg text-gray-900 mt-1">{selectedCandidate.candidate.role.role_name}</p>
                      </div>
                    )}
                    {selectedCandidate.candidate.organization && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Organization</label>
                        <p className="text-lg text-gray-900 mt-1">{selectedCandidate.candidate.organization.organization_name}</p>
                      </div>
                    )}
                    {selectedCandidate.candidate.created_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Member Since</label>
                        <p className="text-lg text-gray-900 mt-1">
                          {new Date(selectedCandidate.candidate.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <label className="text-sm font-medium text-gray-500">Application Status</label>
                      <div className="mt-2 flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                            selectedCandidate.application.status,
                          )}`}
                        >
                          {selectedCandidate.application.status.charAt(0).toUpperCase() + selectedCandidate.application.status.slice(1)}
                        </span>
                        <select
                          value={selectedCandidate.application.status}
                          onChange={(e) => {
                            handleStatusUpdate(selectedCandidate.application.application_id, e.target.value);
                            setSelectedCandidate({
                              ...selectedCandidate,
                              application: { ...selectedCandidate.application, status: e.target.value },
                            });
                          }}
                          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white text-gray-900"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Applied Date</label>
                      <p className="text-lg text-gray-900 mt-1">
                        {new Date(selectedCandidate.application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                  <button
                    onClick={closeCandidateModal}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

