'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      setProfile(user);
      setLoading(false);
    }
  }, [user, isAuthenticated, authLoading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Profile not found</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Back home
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          {/* Content */}
          <div className="px-8 py-8 relative">
            {/* Avatar */}
            <div className="flex justify-center -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-blue-600">
                  {profile.email?.[0]?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.email}</h1>
              <div className="flex items-center justify-center gap-2">
                {profile.isVerified ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-semibold">Email Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-600 font-semibold">Email Not Verified</span>
                  </>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Email */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <label className="text-sm font-semibold text-gray-600">Email Address</label>
                </div>
                <p className="text-gray-900 text-lg">{profile.email}</p>
              </div>

              {/* Mobile */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <label className="text-sm font-semibold text-gray-600">Mobile Number</label>
                </div>
                <p className="text-gray-900 text-lg">
                  {profile.mobile || 'Not provided'}
                </p>
              </div>

              {/* Account Status */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <label className="text-sm font-semibold text-gray-600">Account Status</label>
                </div>
                <p className="text-gray-900 text-lg">
                  {profile.isVerified ? 'Active' : 'Pending Verification'}
                </p>
              </div>

              {/* Member Since */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <label className="text-sm font-semibold text-gray-600">Member Since</label>
                </div>
                <p className="text-gray-900 text-lg">
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-8 flex gap-4">
              <Link
                href="/auth/settings"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition text-center"
              >
                Edit Profile
              </Link>
              <Link
                href="/"
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition text-center"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Account Information</h2>
          <ul className="text-blue-800 space-y-2">
            <li>✓ Your account is secure and password-protected</li>
            <li>✓ Email verification adds an extra layer of security</li>
            <li>✓ You can log in using email + password or OTP</li>
            <li>✓ Your data is stored securely in MongoDB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
