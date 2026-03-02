'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { fetchAvailableNumbers, purchaseNumber, type PhoneNumber } from '@/lib/api';

export default function OnboardingStep3() {
  const router = useRouter();
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [availableNumbers, setAvailableNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const step = storage.getOnboardingStep();
    if (step !== '1') {
      router.push('/verify');
      return;
    }

    // Fetch available UK numbers from Sysconfig API
    const loadNumbers = async () => {
      try {
        setLoading(true);
        setError(null);
        const numbers = await fetchAvailableNumbers('UK');
        setAvailableNumbers(numbers);
      } catch (err) {
        console.error('Failed to load phone numbers:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load phone numbers. Please try again later.'
        );
        // Fallback to empty array - you could also show a retry button
      } finally {
        setLoading(false);
      }
    };

    loadNumbers();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNumber) {
      alert('Please select a phone number');
      return;
    }

    try {
      setSubmitting(true);

      // Find the selected number object to get its ID/UUID
      const numberObj = availableNumbers.find(n => n.number === selectedNumber);
      const numberId = (numberObj as any)?.id;

      // Purchase the number via Sysconfig API
      await purchaseNumber(selectedNumber, numberId);

      // Save selected number to localStorage
      const numbers = storage.getNumbers();
      const newNumber = {
        number: selectedNumber,
        status: 'active' as const,
      };
      storage.setNumbers([...numbers, newNumber]);


      // Create default call flow for UK
      const defaultFlow = {
        id: 'default-flow',
        name: 'UK Default Flow',
        type: 'ivr' as const,
        config: {
          useCase: 'mixed',
          greeting: 'Welcome to our support line',
        },
      };
      const existingFlows = storage.getCallFlows();
      if (existingFlows.length === 0) {
        storage.setCallFlows([defaultFlow]);
      }

      storage.setOnboardingStep('2');
      router.push('/onboarding/step-4');
    } catch (err) {
      console.error('Failed to purchase number:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to purchase phone number. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Phone Numbers</h1>
            <span className="text-sm text-gray-500">Step 1 of 2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select a phone number for your business
            </label>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-sm text-gray-600">Loading available numbers...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && availableNumbers.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-sm text-yellow-800">
                  No phone numbers available at the moment. Please try again later.
                </p>
              </div>
            )}

            {!loading && !error && availableNumbers.length > 0 && (
              <div className="space-y-2">
                {availableNumbers.map((item) => (
                  <button
                    key={item.number}
                    type="button"
                    onClick={() => setSelectedNumber(item.number)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition ${selectedNumber === item.number
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    <div className="font-semibold text-gray-900">{item.number}</div>
                    <div className="text-sm text-gray-600">
                      {item.location || `${item.area || ''} ${item.country || 'UK'}`.trim()}
                    </div>
                  </button>
                ))}
              </div>
            )}
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
              disabled={!selectedNumber || loading || submitting}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


