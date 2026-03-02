'use client';

import Link from 'next/link';
import { HiPhone, HiChartBar, HiCog } from 'react-icons/hi';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600">CloudPhone</div>
          <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
            Login
          </Link>
          <Link href="/signup" className="text-gray-700 hover:text-indigo-600">
            Sign Up
          </Link>
          <Link
            href="/signup"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>
    </header>

      {/* Hero Section */ }
  <main className="container mx-auto px-4 py-20">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        Professional Cloud Phone
        <br />
        <span className="text-indigo-600">For Your Business</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Make and receive calls from anywhere. Manage your team, track analytics,
        and provide exceptional customer service with our cloud-based phone system.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/signup"
          className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
        >
          Start Free Trial
        </Link>
        <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition">
          Watch Demo
        </button>
      </div>
    </div>

    {/* Features Grid */}
    <div className="mt-32 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-md">
        <div className="mb-4">
          <HiPhone className="w-12 h-12 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Crystal Clear Calls</h3>
        <p className="text-gray-600">
          HD voice quality with global coverage. Make calls from anywhere in the world.
        </p>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-md">
        <div className="mb-4">
          <HiChartBar className="w-12 h-12 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Real-Time Analytics</h3>
        <p className="text-gray-600">
          Track call volume, agent performance, and customer satisfaction metrics.
        </p>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-md">
        <div className="mb-4">
          <HiCog className="w-12 h-12 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Easy Setup</h3>
        <p className="text-gray-600">
          Get started in minutes. No hardware required. Configure call flows visually.
        </p>
      </div>
    </div>
  </main>

  {/* Footer */ }
  <footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-200">
    <div className="text-center text-gray-600">
      <p>&copy; 2024 CloudPhone. All rights reserved.</p>
    </div>
  </footer>
    </div >
  );
}
