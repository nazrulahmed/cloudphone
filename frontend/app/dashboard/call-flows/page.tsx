'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { storage } from '@/lib/storage';
import { useState } from 'react';
import {
  HiRefresh,
  HiPhone,
  HiPhoneIncoming,
  HiUsers,
  HiMail,
  HiMusicNote,
} from 'react-icons/hi';

export default function CallFlowsPage() {
  const flows = storage.getCallFlows();
  const [newFlowName, setNewFlowName] = useState('');

  const handleCreateFlow = () => {
    if (!newFlowName.trim()) return;
    const newFlow = {
      id: `flow-${Date.now()}`,
      name: newFlowName,
      type: 'ivr' as const,
      config: {
        greeting: 'Welcome to our support line',
        options: [],
      },
    };
    storage.setCallFlows([...flows, newFlow]);
    setNewFlowName('');
  };

  const handleDeleteFlow = (id: string) => {
    if (confirm('Are you sure you want to delete this call flow?')) {
      storage.setCallFlows(flows.filter((f) => f.id !== id));
    }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Call Flows</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Flow name"
              value={newFlowName}
              onChange={(e) => setNewFlowName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFlow()}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleCreateFlow}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Create Flow
            </button>
          </div>
        </div>

        {flows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="mb-4 flex justify-center">
              <HiRefresh className="w-16 h-16 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Call Flows</h2>
            <p className="text-gray-600 mb-6">
              Create a call flow to route incoming calls to the right destination.
            </p>
            <button
              onClick={() => setNewFlowName('Default Flow')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Create Your First Flow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 hover:border-indigo-300 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{flow.name}</h3>
                    <span className="text-xs text-gray-500 capitalize">{flow.type}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteFlow(flow.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>

                {/* Visual Flow Blocks */}
                <div className="space-y-2 mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <div className="font-medium text-blue-900 mb-1 flex items-center gap-2">
                      <HiPhoneIncoming className="w-4 h-4" />
                      Incoming Call
                    </div>
                    <div className="text-blue-700 text-xs">→</div>
                  </div>
                  {flow.type === 'ivr' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
                      <div className="font-medium text-purple-900 mb-1 flex items-center gap-2">
                        <HiMusicNote className="w-4 h-4" />
                        IVR Menu
                      </div>
                      <div className="text-purple-700 text-xs">{flow.config.greeting}</div>
                    </div>
                  )}
                  {flow.type === 'queue' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                      <div className="font-medium text-green-900 mb-1 flex items-center gap-2">
                        <HiUsers className="w-4 h-4" />
                        Queue
                      </div>
                      <div className="text-green-700 text-xs">Waiting for agent</div>
                    </div>
                  )}
                  {flow.type === 'voicemail' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                      <div className="font-medium text-yellow-900 mb-1 flex items-center gap-2">
                        <HiMail className="w-4 h-4" />
                        Voicemail
                      </div>
                      <div className="text-yellow-700 text-xs">Record message</div>
                    </div>
                  )}
                </div>

                <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                  Edit Flow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

