'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { storage } from '@/lib/storage';
import { HiMail } from 'react-icons/hi';

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is signed up
    const user = storage.getUser();
    if (!user) {
      router.push('/signup');
    }
  }, [router]);

  const handleVerify = () => {
    const tenant = storage.getTenant();
    if (tenant) {
      storage.setTenant({ ...tenant, status: 'verified' });
    }
    storage.setOnboardingStep('1');
    router.push('/onboarding/step-3');
  };

  const user = storage.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mb-4 flex justify-center">
            <HiMail className="w-16 h-16 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a verification email to
            <br />
            <span className="font-semibold text-indigo-600">{user?.email}</span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This is a demo. In production, you would receive a real email
            with a verification link. For now, click the button below to continue.
          </p>
        </div>

        <button
          onClick={handleVerify}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Verify Now
        </button>

        <p className="mt-6 text-sm text-gray-600">
          Didn't receive the email?{' '}
          <button className="text-indigo-600 hover:underline">Resend</button>
        </p>
      </div>
    </div>
  );
}

