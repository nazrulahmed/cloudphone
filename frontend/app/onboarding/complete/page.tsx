'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { HiSparkles, HiCheckCircle } from 'react-icons/hi';

export default function OnboardingComplete() {
  const router = useRouter();

  useEffect(() => {
    const step = storage.getOnboardingStep();
    if (step !== 'complete') {
      router.push('/onboarding/step-1');
      return;
    }

    // Activate tenant and set trial subscription
    const tenant = storage.getTenant();
    if (tenant) {
      storage.setTenant({ ...tenant, status: 'active' });
    }

    storage.setSubscription({
      plan: 'trial',
      daysLeft: 14,
    });

    // Initialize mock usage stats
    const mockStats = {
      callsPerDay: [
        { date: '2024-01-01', count: 12 },
        { date: '2024-01-02', count: 18 },
        { date: '2024-01-03', count: 15 },
        { date: '2024-01-04', count: 22 },
        { date: '2024-01-05', count: 19 },
      ],
      missedCalls: 3,
      agentPerformance: [
        { name: 'John Doe', calls: 45, avgDuration: 4.5 },
        { name: 'Jane Smith', calls: 38, avgDuration: 5.2 },
      ],
    };
    storage.setUsageStats(mockStats);
  }, [router]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mb-4 flex justify-center">
            <HiSparkles className="w-16 h-16 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Complete!</h1>
          <p className="text-gray-600">
            Your CloudPhone account is ready to use
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center gap-2 mb-2">
            <HiCheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Trial Activated</span>
          </div>
          <p className="text-sm text-green-700">
            You have <strong>14 days</strong> to explore all features. No credit card required.
          </p>
        </div>

        <div className="space-y-2 mb-6 text-left">
          <div className="flex items-center gap-2 text-sm">
            <HiCheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Account verified</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <HiCheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Phone number assigned</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <HiCheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Call flow configured</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <HiCheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Team setup complete</span>
          </div>
        </div>

        <button
          onClick={handleGoToDashboard}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

