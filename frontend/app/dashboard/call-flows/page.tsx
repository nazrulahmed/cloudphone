'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { storage } from '@/lib/storage';
import { useState, useEffect } from 'react';
import { fetchRealCallFlows, createCallFlow, updateCallFlow, deleteCallFlow } from '@/lib/api';
import {
  HiRefresh,
  HiPhone,
  HiPhoneIncoming,
  HiUsers,
  HiMail,
  HiMusicNote,
} from 'react-icons/hi';

export default function CallFlowsPage() {
  const [flows, setFlows] = useState<any[]>([]);
  const [newFlowName, setNewFlowName] = useState('');
  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<any>(null);

  // Create / Edit Form State
  const [flowName, setFlowName] = useState('');
  const [flowType, setFlowType] = useState('ivr');
  const [flowGreeting, setFlowGreeting] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    setIsLoading(true);
    const data = await fetchRealCallFlows();
    setFlows(data);
    setIsLoading(false);
  };

  const openEditor = (flow?: any) => {
    if (flow) {
      setEditingFlow(flow);
      setFlowName(flow.name);
      setFlowType(flow.type);
      setFlowGreeting(flow.config?.greeting || '');
    } else {
      setEditingFlow(null);
      setFlowName(newFlowName.trim() || 'New Call Flow');
      setFlowType('ivr');
      setFlowGreeting('Welcome to our support line');
    }
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingFlow(null);
    setFlowName('');
    setFlowGreeting('');
  };

  const handleSaveFlow = async () => {
    if (!flowName.trim()) {
      alert('Please enter a flow name');
      return;
    }
    setIsSaving(true);
    const config = {
      greeting: flowGreeting,
      options: [],
    };

    if (editingFlow) {
      // Update
      const updatedFlow = await updateCallFlow(editingFlow.uuid, flowName, flowType, config);
      if (updatedFlow) {
        setFlows(flows.map(f => f.uuid === updatedFlow.uuid ? updatedFlow : f));
        closeEditor();
      } else {
        alert('Failed to update flow.');
      }
    } else {
      // Create
      const newFlow = await createCallFlow(flowName, flowType, config);
      if (newFlow) {
        setFlows([newFlow, ...flows]);
        setNewFlowName('');
        closeEditor();
      } else {
        alert('Failed to create flow.');
      }
    }
    setIsSaving(false);
  };

  const handleDeleteFlow = async (uuid: string) => {
    if (confirm('Are you sure you want to delete this call flow?')) {
      const success = await deleteCallFlow(uuid);
      if (success) {
        setFlows(flows.filter((f) => f.uuid !== uuid));
      } else {
        alert('Failed to delete call flow');
      }
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
              onKeyPress={(e) => e.key === 'Enter' && openEditor()}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={() => openEditor()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Create Flow
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : flows.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="mb-4 flex justify-center">
              <HiRefresh className="w-16 h-16 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Call Flows</h2>
            <p className="text-gray-600 mb-6">
              Create a call flow to route incoming calls to the right destination.
            </p>
            <button
              onClick={() => { setNewFlowName('Default Flow'); openEditor(); }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Create Your First Flow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map((flow) => (
              <div
                key={flow.uuid || flow.id}
                className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 hover:border-indigo-300 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{flow.name}</h3>
                    <span className="text-xs text-gray-500 capitalize">{flow.type}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteFlow(flow.uuid)}
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

                <button
                  onClick={() => openEditor(flow)}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Edit Flow
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Editor Modal */}
        {isEditorOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingFlow ? 'Edit Call Flow' : 'Create Call Flow'}
                </h2>
                <button onClick={closeEditor} className="text-gray-400 hover:text-gray-600">×</button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flow Name</label>
                  <input
                    type="text"
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Sales Team IVR"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flow Type</label>
                  <select
                    value={flowType}
                    onChange={(e) => setFlowType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ivr">IVR Menu</option>
                    <option value="queue">Call Queue</option>
                    <option value="voicemail">Voicemail</option>
                  </select>
                </div>

                {flowType === 'ivr' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Greeting Message</label>
                    <textarea
                      value={flowGreeting}
                      onChange={(e) => setFlowGreeting(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24"
                      placeholder="e.g. Thanks for calling. Press 1 for Sales, 2 for Support."
                    />
                  </div>
                )}

                {flowType === 'queue' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hold Music Style</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option>Default (Classical)</option>
                      <option>Pop</option>
                      <option>Jazz</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button
                  onClick={closeEditor}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFlow}
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center min-w-[120px]"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save Flow'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

