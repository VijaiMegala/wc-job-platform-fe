'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { organizationAPI } from '@/lib/api';

export default function CareersLandingPage() {
  const [orgId, setOrgId] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (orgId.trim()) {
      router.push(`/${orgId}/careers`);
      return;
    }

    if (orgName.trim()) {
      setLoading(true);
      try {
        // Try to find organization by name
        const orgs = await organizationAPI.getAll();
        const org = orgs.find(
          (o: any) => o.org_name.toLowerCase() === orgName.toLowerCase()
        );
        
        if (org) {
          router.push(`/${org.org_id}/careers`);
        } else {
          setError('Organization not found. Please enter a valid organization ID or name.');
        }
      } catch (err: any) {
        setError('Unable to find organization. Please enter organization ID directly.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please enter either organization ID or organization name');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Browse Jobs
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your organization ID or name to view available jobs
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="orgId" className="block text-sm font-medium text-gray-700">
                  Organization ID
                </label>
                <input
                  id="orgId"
                  name="orgId"
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter organization ID (UUID)"
                  value={orgId}
                  onChange={(e) => {
                    setOrgId(e.target.value);
                    setOrgName('');
                  }}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">OR</span>
                </div>
              </div>
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
                  Organization Name
                </label>
                <input
                  id="orgName"
                  name="orgName"
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter organization name"
                  value={orgName}
                  onChange={(e) => {
                    setOrgName(e.target.value);
                    setOrgId('');
                  }}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'View Jobs'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

