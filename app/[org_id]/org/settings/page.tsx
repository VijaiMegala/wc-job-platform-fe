'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { organizationAPI, cloudinaryAPI } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Organization {
  org_id: string;
  org_name: string;
  theme_color?: string;
  logo_url?: string;
  description?: string;
  website?: string;
}

const COLOR_PALETTE = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Amber', value: '#F59E0B' },
];

export default function SettingsPage() {
  const params = useParams();
  const orgId = params.org_id as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    theme_color: '',
    logo_url: '',
    description: '',
    website: '',
  });

  useEffect(() => {
    if (authLoading) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!isAuthenticated && !token) {
      router.push('/org/login');
      return;
    }

    const fetchOrganization = async () => {
      try {
        const org = await organizationAPI.getOne(orgId);
        setOrganization(org);
        setFormData({
          theme_color: org.theme_color || '',
          logo_url: org.logo_url || '',
          description: org.description || '',
          website: org.website || '',
        });
        setLogoPreview(org.logo_url || null);
      } catch (error) {
        console.error('Error fetching organization:', error);
        setError('Failed to load organization data');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [orgId, isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updateData: any = {};
      if (formData.theme_color) updateData.theme_color = formData.theme_color;
      if (formData.logo_url) updateData.logo_url = formData.logo_url;
      if (formData.description) updateData.description = formData.description;
      if (formData.website) updateData.website = formData.website;

      await organizationAPI.update(orgId, updateData);
      setSuccess('Settings updated successfully!');
      
      // Refresh organization data
      const updatedOrg = await organizationAPI.getOne(orgId);
      setOrganization(updatedOrg);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData({ ...formData, theme_color: color });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
        setError('Please select a valid image file (JPG, PNG, GIF, or WEBP)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!selectedFile) {
      setError('Please select an image file first');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const result = await cloudinaryAPI.uploadImage(selectedFile);
      setFormData({ ...formData, logo_url: result.url });
      setSuccess('Logo uploaded successfully!');
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!formData.logo_url) return;

    setError('');
    setSaving(true);

    try {
      // If it's a Cloudinary URL, delete it from Cloudinary
      if (formData.logo_url.includes('cloudinary.com')) {
        try {
          await cloudinaryAPI.deleteImage(formData.logo_url);
        } catch (err) {
          console.error('Error deleting from Cloudinary:', err);
          // Continue even if deletion fails
        }
      }

      // Update organization to remove logo
      await organizationAPI.update(orgId, { logo_url: '' });
      setFormData({ ...formData, logo_url: '' });
      setLogoPreview(null);
      setSelectedFile(null);
      setSuccess('Logo removed successfully!');
      
      // Refresh organization data
      const updatedOrg = await organizationAPI.getOne(orgId);
      setOrganization(updatedOrg);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove logo');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link
            href={`/${orgId}/org`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Organization Settings</h1>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}

                {/* Theme Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme Color
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select a color to customize your career page theme
                  </p>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-3 mb-3">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorSelect(color.value)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          formData.theme_color === color.value
                            ? 'border-gray-900 scale-110 shadow-lg'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={formData.theme_color}
                      onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                      placeholder="#3B82F6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                    />
                    {formData.theme_color && (
                      <div
                        className="w-12 h-12 rounded-lg border border-gray-300"
                        style={{ backgroundColor: formData.theme_color }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a hex color code (e.g., #3B82F6) or select from palette above
                  </p>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Logo
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Upload your organization logo (JPG, PNG, GIF, or WEBP - Max 5MB)
                  </p>
                  
                  {/* Current Logo Preview */}
                  {(logoPreview || formData.logo_url) && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                      <div className="flex items-center gap-4">
                        <img
                          src={logoPreview || formData.logo_url}
                          alt="Logo preview"
                          className="h-24 w-24 object-contain border border-gray-200 rounded p-2 bg-gray-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          disabled={saving}
                          className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
                        >
                          {saving ? 'Removing...' : 'Remove Logo'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="logo-upload"
                    />
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="logo-upload"
                        className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700"
                      >
                        {selectedFile ? 'Change File' : 'Choose File'}
                      </label>
                      {selectedFile && (
                        <>
                          <span className="text-sm text-gray-600">
                            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={handleUploadLogo}
                            disabled={uploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                          >
                            {uploading ? 'Uploading...' : 'Upload'}
                          </button>
                        </>
                      )}
                    </div>
                    {selectedFile && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Preview: Click "Upload" to upload the image to Cloudinary
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    Add a description about your organization
                  </p>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell candidates about your organization..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                  />
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    Your organization's website URL
                  </p>
                  <input
                    type="url"
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400"
                  />
                </div>

                {/* Preview Section */}
                {(formData.theme_color || logoPreview || formData.logo_url || formData.description) && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                    <div
                      className="p-6 rounded-lg border-2 border-dashed border-gray-300"
                      style={{
                        backgroundColor: formData.theme_color
                          ? `${formData.theme_color}15`
                          : '#F9FAFB',
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {(logoPreview || formData.logo_url) && (
                          <img
                            src={logoPreview || formData.logo_url}
                            alt="Organization logo"
                            className="h-16 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <h4 className="text-xl font-bold" style={{ color: formData.theme_color || '#1F2937' }}>
                            {organization?.org_name}
                          </h4>
                          {formData.website && (
                            <a
                              href={formData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {formData.website}
                            </a>
                          )}
                        </div>
                      </div>
                      {formData.description && (
                        <p className="text-gray-700 mb-4">{formData.description}</p>
                      )}
                      <button
                        type="button"
                        className="px-4 py-2 text-white rounded-lg font-medium"
                        style={{
                          backgroundColor: formData.theme_color || '#3B82F6',
                        }}
                      >
                        View Jobs
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link
                    href={`/${orgId}/org`}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

