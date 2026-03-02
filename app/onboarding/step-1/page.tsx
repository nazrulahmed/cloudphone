'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';

export default function OnboardingStep1() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    timezone: 'UTC',
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    language: 'en',
  });

  useEffect(() => {
    const tenant = storage.getTenant();
    if (!tenant || tenant.status !== 'verified') {
      router.push('/signup');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = storage.getTenant();
    if (tenant) {
      storage.setTenant({
        ...tenant,
        timezone: formData.timezone,
        businessHours: {
          start: formData.businessHoursStart,
          end: formData.businessHoursEnd,
        },
        language: formData.language,
      });
    }
    storage.setOnboardingStep('2');
    router.push('/onboarding/step-3');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Business Setup</h1>
            <span className="text-sm text-gray-500">Step 1 of 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '33.33%' }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              id="timezone"
              required
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (US)</option>
              <option value="America/Chicago">Central Time (US)</option>
              <option value="America/Los_Angeles">Pacific Time (US)</option>
              <option value="Europe/London">London (UK)</option>
              <option value="Europe/Berlin">Berlin (Germany)</option>
              <option value="Australia/Sydney">Sydney (Australia)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Hours
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                required
                value={formData.businessHoursStart}
                onChange={(e) => setFormData({ ...formData, businessHoursStart: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="time"
                required
                value={formData.businessHoursEnd}
                onChange={(e) => setFormData({ ...formData, businessHoursEnd: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              required
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/verify"
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
            >
              Back
            </Link>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


