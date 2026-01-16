'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobsAPI, organizationAPI } from '@/lib/api';
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
}

interface Organization {
  org_id: string;
  org_name: string;
  theme_color?: string;
  logo_url?: string;
  description?: string;
  website?: string;
}

export default function CareersPage() {
  const params = useParams();
  const orgId = params.org_id as string;
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const themeColor = organization?.theme_color || '#3B82F6';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, orgData] = await Promise.all([
          jobsAPI.getAll(orgId, { page, limit: 10 }),
          organizationAPI.getOne(orgId).catch(() => null),
        ]);
        setJobs(jobsResponse.data);
        setTotalPages(jobsResponse.totalPages);
        setOrganization(orgData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orgId, page]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        backgroundColor: organization?.theme_color ? `${themeColor}08` : '#F9FAFB',
      }}
    >
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Organization Header */}
          <div 
            className="bg-white shadow-lg rounded-lg p-6 mb-6"
            style={{
              borderTop: `4px solid ${themeColor}`,
            }}
          >
            <div className="flex items-center gap-4">
              {organization?.logo_url && (
                <img
                  src={organization.logo_url}
                  alt={`${organization.org_name} logo`}
                  className="h-16 w-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <h1 
                  className="text-3xl font-bold mb-2"
                  style={{ color: themeColor }}
                >
                  {organization?.org_name || 'Available Jobs'}
                </h1>
                {organization?.description && (
                  <p className="text-gray-600 mb-2">{organization.description}</p>
                )}
                {organization?.website && (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {organization.website}
                  </a>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Jobs</h2>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {jobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No jobs available</p>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.job_id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
                        </div>
                        <Link
                          href={`/${orgId}/careers/${job.job_id}/apply`}
                          className="ml-4 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: themeColor }}
                        >
                          Apply
                        </Link>
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
                    style={{
                      borderColor: themeColor,
                      color: page === 1 ? '#9CA3AF' : themeColor,
                    }}
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
                    style={{
                      borderColor: themeColor,
                      color: page === totalPages ? '#9CA3AF' : themeColor,
                    }}
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

