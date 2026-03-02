'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { HiPhone, HiQuestionMarkCircle, HiRefresh } from 'react-icons/hi';

export default function OnboardingStep2() {
  const router = useRouter();
  const [useCase, setUseCase] = useState<'sales' | 'support' | 'mixed'>('mixed');

  useEffect(() => {
    const step = storage.getOnboardingStep();
    if (step !== '2') {
      router.push('/onboarding/step-1');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save default call flow template based on use case
    const defaultFlow = {
      id: 'default-flow',
      name: `${useCase.charAt(0).toUpperCase() + useCase.slice(1)} Flow`,
      type: 'ivr' as const,
      config: {
        useCase,
        greeting: `Welcome to our ${useCase} line`,
      },
    };

    const existingFlows = storage.getCallFlows();
    storage.setCallFlows([...existingFlows, defaultFlow]);

    storage.setOnboardingStep('3');
    router.push('/onboarding/step-3');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Use Case</h1>
            <span className="text-sm text-gray-500">Step 2 of 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How will you use CloudPhone?
            </label>
            
            <button
              type="button"
              onClick={() => setUseCase('sales')}
              className={`w-full p-4 border-2 rounded-lg text-left transition ${
                useCase === 'sales'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <HiPhone className="w-5 h-5 text-indigo-600" />
                Sales
              </div>
              <div className="text-sm text-gray-600">
                Handle inbound leads, make outbound calls, track conversions
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUseCase('support')}
              className={`w-full p-4 border-2 rounded-lg text-left transition ${
                useCase === 'support'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <HiQuestionMarkCircle className="w-5 h-5 text-indigo-600" />
                Support
              </div>
              <div className="text-sm text-gray-600">
                Customer service, help desk, technical support
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUseCase('mixed')}
              className={`w-full p-4 border-2 rounded-lg text-left transition ${
                useCase === 'mixed'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <HiRefresh className="w-5 h-5 text-indigo-600" />
                Mixed
              </div>
              <div className="text-sm text-gray-600">
                Both sales and support, flexible routing
              </div>
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/onboarding/step-1"
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

