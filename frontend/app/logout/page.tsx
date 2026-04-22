'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { HiLogout } from 'react-icons/hi';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all localStorage including JWT token
    storage.clearAll();
    localStorage.removeItem('auth_token');

    // Redirect to login page
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <HiLogout className="w-12 h-12 text-indigo-600 animate-pulse" />
        </div>
        <p className="text-lg text-gray-700">Logging out...</p>
      </div>
    </div>
  );
}


