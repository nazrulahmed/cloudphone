'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { storage } from '@/lib/storage';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchExtensions } from '@/lib/api';
import {
  HiHashtag,
  HiClock,
  HiPhone,
  HiStar,
  HiCheckCircle,
  HiRefresh,
} from 'react-icons/hi';

export default function DashboardPage() {
  const tenant = storage.getTenant();
  const subscription = storage.getSubscription();
  const usageStats = storage.getUsageStats();

  const [activeNumbers, setActiveNumbers] = useState(0);
  const totalCalls = usageStats?.callsPerDay.reduce((sum, day) => sum + day.count, 0) || 0;
  const callQuality = 4.8; // Mock score

  useEffect(() => {
    // Fetch live active numbers from Sysconfig
    const loadData = async () => {
      try {
        const exts = await fetchExtensions();
        // Count extensions that have a dedicated number assigned
        const count = exts.filter((e: any) => e.numberrange_detail_number_cli && !e.extension_uuid.startsWith('flow-')).length;
        setActiveNumbers(count);
      } catch (err) {
        console.error('Failed to fetch extensions metric', err);
      }
    };
    loadData();
  }, []);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Active Numbers</span>
              <HiHashtag className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{activeNumbers}</div>
            <Link
              href="/dashboard/numbers"
              className="text-sm text-indigo-600 hover:underline mt-2 inline-block"
            >
              Manage →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Trial Days Left</span>
              <HiClock className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {subscription?.daysLeft || 0}
            </div>
            <Link
              href="/dashboard/billing"
              className="text-sm text-indigo-600 hover:underline mt-2 inline-block"
            >
              Upgrade →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Call Volume</span>
              <HiPhone className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalCalls}</div>
            <p className="text-xs text-gray-500 mt-2">This week</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Call Quality</span>
              <HiStar className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{callQuality}</div>
            <p className="text-xs text-gray-500 mt-2">Out of 5.0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/softphone"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition text-center"
            >
              <div className="mb-2 flex justify-center">
                <HiPhone className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="font-semibold text-gray-900">Make a Call</div>
              <div className="text-sm text-gray-600">Open softphone</div>
            </Link>
            <Link
              href="/dashboard/numbers"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition text-center"
            >
              <div className="mb-2 flex justify-center">
                <HiHashtag className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="font-semibold text-gray-900">Manage Numbers</div>
              <div className="text-sm text-gray-600">View and assign</div>
            </Link>
            <Link
              href="/dashboard/call-flows"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition text-center"
            >
              <div className="mb-2 flex justify-center">
                <HiRefresh className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="font-semibold text-gray-900">Configure Flows</div>
              <div className="text-sm text-gray-600">Set up IVR</div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <HiCheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Onboarding completed</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <HiPhone className="w-5 h-5 text-indigo-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Phone number activated</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <HiRefresh className="w-5 h-5 text-indigo-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Call flow configured</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

