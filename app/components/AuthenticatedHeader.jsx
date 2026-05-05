'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';

export default function AuthenticatedHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Folder CRUD
          </Link>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Folder CRUD
        </Link>

        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500">
              {user?.isVerified ? 'Verified' : 'Unverified'}
            </p>
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
            >
              <User className="w-6 h-6" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                </div>

                <div className="py-2">
                  <Link
                    href="/auth/profile"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>

                  <Link
                    href="/auth/settings"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
