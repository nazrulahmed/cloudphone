'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { storage } from '@/lib/storage';

interface TeamMember {
  name: string;
  role: string;
}

export default function OnboardingStep4() {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: '', role: 'agent' },
  ]);

  useEffect(() => {
    const step = storage.getOnboardingStep();
    if (step !== '2') {
      router.push('/onboarding/step-3');
    }
  }, [router]);

  const addMember = () => {
    setTeamMembers([...teamMembers, { name: '', role: 'agent' }]);
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const removeMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save team members (in a real app, this would be sent to API)
    // For now, we'll just mark onboarding as complete
    storage.setOnboardingStep('complete');
    router.push('/onboarding/complete');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Team Setup</h1>
            <span className="text-sm text-gray-500">Step 2 of 2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Add team members (optional)
            </label>
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <select
                    value={member.role}
                    onChange={(e) => updateMember(index, 'role', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  {teamMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="px-3 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMember}
              className="mt-2 text-sm text-indigo-600 hover:underline"
            >
              + Add another member
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href="/onboarding/step-3"
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
            >
              Back
            </Link>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Complete Setup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


