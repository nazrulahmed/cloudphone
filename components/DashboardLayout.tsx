'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import {
  HiHome,
  HiPhone,
  HiHashtag,
  HiRefresh,
  HiChartBar,
  HiCreditCard,
  HiQuestionMarkCircle,
} from 'react-icons/hi';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const tenant = storage.getTenant();
    if (!tenant || tenant.status !== 'active') {
      router.push('/signup');
    }
  }, [router]);

  const tenant = storage.getTenant();
  const user = storage.getUser();
  const subscription = storage.getSubscription();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HiHome },
    { href: '/dashboard/softphone', label: 'Softphone', icon: HiPhone },
    { href: '/dashboard/numbers', label: 'Numbers', icon: HiHashtag },
    { href: '/dashboard/call-flows', label: 'Call Flows', icon: HiRefresh },
    { href: '/dashboard/analytics', label: 'Analytics', icon: HiChartBar },
    { href: '/dashboard/billing', label: 'Billing', icon: HiCreditCard },
    { href: '/dashboard/support', label: 'Support', icon: HiQuestionMarkCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-indigo-600">CloudPhone</h1>
          <p className="text-sm text-gray-600 mt-1">{tenant?.company}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{subscription?.plan || 'trial'}</p>
          </div>
          <Link
            href="/logout"
            className="block w-full text-center text-sm text-red-600 hover:bg-red-50 py-2 rounded-lg transition"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

