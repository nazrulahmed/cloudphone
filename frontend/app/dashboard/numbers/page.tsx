'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { storage } from '@/lib/storage';
import { useState, useEffect } from 'react';
import { HiHashtag } from 'react-icons/hi';
import { fetchExtensions, fetchRealCallFlows, assignNumber, fetchExtensionDetails, updateExtensionConfig, fetchAvailableNumbers, purchaseNumber, fetchInventory } from '@/lib/api';

export default function NumbersPage() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<any>(null);
  const [assignmentType, setAssignmentType] = useState<'user' | 'flow'>('user');
  const [assignmentTargetUuid, setAssignmentTargetUuid] = useState('');
  const [realExtensions, setRealExtensions] = useState<any[]>([]);
  const [realFlows, setRealFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingFlow, setIsCreatingFlow] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowType, setNewFlowType] = useState<'ivr' | 'queue' | 'voicemail'>('ivr');

  // Configuration Modal state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [configData, setConfigData] = useState<any>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Purchase Modal state
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseSubmitting, setPurchaseSubmitting] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [selectedNewNumber, setSelectedNewNumber] = useState<string>('');


  useEffect(() => {
    setIsMounted(true);

    const loadData = async () => {
      setLoading(true);
      try {
        const [invData, extData, flowData] = await Promise.all([
          fetchInventory(),
          fetchExtensions(),
          fetchRealCallFlows()
        ]);
        setNumbers(invData);
        setRealExtensions(extData);
        setRealFlows(flowData);
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (!isMounted) return <DashboardLayout><div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div></DashboardLayout>;


  const handleAssign = async () => {
    if (!selectedNumber || !assignmentTargetUuid) return;

    setLoading(true);
    try {
      const success = await assignNumber(selectedNumber.number, assignmentTargetUuid);

      if (success) {
        // Find the display name for the storage
        let displayName = '';
        if (assignmentType === 'user') {
          const ext = realExtensions.find(e => e.extension_uuid === assignmentTargetUuid);
          displayName = ext ? `${ext.display_name} (${ext.extension})` : 'Agent';
        } else {
          const flow = realFlows.find(f => f.uuid === assignmentTargetUuid);
          displayName = flow ? `${flow.name} (${flow.type.toUpperCase()})` : 'Call Flow';
        }

        const updated = numbers.map((n) =>
          n.number === selectedNumber.number
            ? { ...n, assignedTo: displayName, assignmentTargetUuid: assignmentTargetUuid }
            : n
        );
        storage.setNumbers(updated);
        setIsModalOpen(false);
        setAssignmentTargetUuid('');
        setSelectedNumber(null);
        alert('Number routed successfully in Sysconfig!');
      } else {
        alert('Failed to route number in Sysconfig. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while routing.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreateFlow = () => {
    if (!newFlowName.trim()) return;

    const newFlow = {
      id: `flow-${Date.now()}`,
      name: newFlowName,
      type: newFlowType,
      config: { greeting: 'Welcome', options: [] },
    };

    const currentFlows = storage.getCallFlows();
    storage.setCallFlows([...currentFlows, newFlow]);

    // Update local state to show it in the list
    setRealFlows(prev => [...prev, { uuid: newFlow.id, name: newFlow.name, type: newFlow.type }]);

    setAssignmentTargetUuid(newFlow.id);
    setNewFlowName('');
    setIsCreatingFlow(false);
  };

  const handleOpenConfig = async (numberObj: any) => {
    // Find the extension UUID for this number if it's assigned to an agent
    // For now, we assume the user is configuring the extension the number is assigned to
    const extension = realExtensions.find(ext => ext.extension_uuid === numberObj.assignmentTargetUuid);

    if (!extension) {
      alert("Configuration is currently only available for numbers assigned to Agents.");
      return;
    }

    setSelectedNumber(numberObj);
    setIsConfigModalOpen(true);
    setConfigLoading(true);
    setConfigError(null);

    try {
      const details = await fetchExtensionDetails(extension.extension_uuid);
      if (details) {
        setConfigData({
          display_name: details.display_name,
          display_name_external: details.display_name_external || '',
          call_timeout: details.call_timeout || 30,
          voicemail_enabled: details.voicemail_enabled === 'true' || details.voicemail_enabled === true,
          voicemail_mail_to: details.voicemail_mail_to || ''
        });
      } else {
        setConfigError("Could not load settings from Sysconfig.");
      }
    } catch (err) {
      setConfigError("Failed to fetch extension configuration.");
    } finally {
      setConfigLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedNumber || !configData) return;

    setLoading(true);
    try {
      const success = await updateExtensionConfig(selectedNumber.assignmentTargetUuid, configData);
      if (success) {
        alert("Configuration updated successfully!");
        setIsConfigModalOpen(false);
      } else {
        alert("Failed to update configuration.");
      }
    } catch (err) {
      alert("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPurchaseModal = async () => {
    setIsPurchaseModalOpen(true);
    setPurchaseLoading(true);
    setPurchaseError(null);
    setSelectedNewNumber('');
    try {
      const numbers = await fetchAvailableNumbers('UK');
      setAvailableNumbers(numbers);
    } catch (err: any) {
      setPurchaseError(err.message || "Failed to load available numbers");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handlePurchaseNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewNumber) return;

    setPurchaseSubmitting(true);
    try {
      const numberObj = availableNumbers.find(n => n.number === selectedNewNumber);
      const numberId = numberObj?.id;

      await purchaseNumber(selectedNewNumber, numberId);

      // Add to local state and storage
      const newNum = { number: selectedNewNumber, status: 'active' as const };
      const updated = [...numbers, newNum];
      storage.setNumbers(updated);
      setNumbers(updated);

      setIsPurchaseModalOpen(false);
      alert('Number purchased successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to purchase number.');
    } finally {
      setPurchaseSubmitting(false);
    }
  };



  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Phone Numbers</h1>
          <button
            onClick={handleOpenPurchaseModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + Purchase Number
          </button>
        </div>

        {numbers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="mb-4 flex justify-center">
              <HiHashtag className="w-16 h-16 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Numbers Yet</h2>
            <p className="text-gray-600 mb-6">
              Purchase a phone number to start making and receiving calls.
            </p>
            <button
              onClick={handleOpenPurchaseModal}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Purchase Your First Number
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {numbers.map((number) => (
                  <tr key={number.number} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{number.number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${number.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {number.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {number.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedNumber(number);
                          setIsModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Assign
                      </button>

                      <button
                        onClick={() => handleOpenConfig(number)}
                        className="text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Assignment Modal */}
        {isModalOpen && selectedNumber && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Route Number</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    Where should calls to <span className="font-semibold text-gray-900">{selectedNumber.number}</span> be directed?
                  </p>

                  <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                    <button
                      onClick={() => {
                        setAssignmentType('user');
                        setAssignmentTargetUuid('');
                      }}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition ${assignmentType === 'user' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Agent
                    </button>
                    <button
                      onClick={() => {
                        setAssignmentType('flow');
                        setAssignmentTargetUuid('');
                      }}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition ${assignmentType === 'flow' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Call Flow
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Select {assignmentType === 'user' ? 'Agent' : 'Call Flow'}
                      </label>
                      {assignmentType === 'flow' && !isCreatingFlow && (
                        <button
                          onClick={() => setIsCreatingFlow(true)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          + Create New
                        </button>
                      )}
                    </div>

                    {isCreatingFlow && assignmentType === 'flow' ? (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                        <input
                          type="text"
                          placeholder="Flow Name (e.g. Sales IVR)"
                          value={newFlowName}
                          onChange={(e) => setNewFlowName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <select
                          value={newFlowType}
                          onChange={(e) => setNewFlowType(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        >
                          <option value="ivr">IVR Menu</option>
                          <option value="queue">Call Queue</option>
                          <option value="voicemail">Voicemail Box</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={handleQuickCreateFlow}
                            className="flex-1 bg-indigo-600 text-white py-1.5 rounded text-xs font-semibold"
                          >
                            Create
                          </button>
                          <button
                            onClick={() => setIsCreatingFlow(false)}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 py-1.5 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={assignmentTargetUuid}
                        onChange={(e) => setAssignmentTargetUuid(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white font-medium"
                      >
                        <option value="">Choose a destination...</option>
                        {assignmentType === 'user' ? (
                          <>
                            {realExtensions.length > 0 ? (
                              realExtensions.map(ext => (
                                <option key={ext.extension_uuid} value={ext.extension_uuid}>
                                  {ext.display_name} ({ext.extension})
                                </option>
                              ))
                            ) : (
                              <option disabled>No extensions found in Sysconfig</option>
                            )}
                          </>
                        ) : (
                          <>
                            {realFlows.length > 0 ? (
                              realFlows.map(flow => (
                                <option key={flow.uuid} value={flow.uuid}>
                                  {flow.name} ({flow.type.toUpperCase()})
                                </option>
                              ))
                            ) : (
                              <option disabled>No call flows found in Sysconfig</option>
                            )}
                          </>
                        )}
                      </select>
                    )}
                  </div>

                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAssign}
                    disabled={!assignmentTargetUuid || loading}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Routing...' : 'Save Routing'}
                  </button>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Configuration Modal */}
        {isConfigModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-indigo-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Configure Number</h3>
                  <button onClick={() => setIsConfigModalOpen(false)} className="text-white/80 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-indigo-100 text-sm mt-1">{selectedNumber?.number}</p>
              </div>

              <div className="p-6">
                {configLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-500 text-sm">Fetching settings from Sysconfig...</p>
                  </div>
                ) : configError ? (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center">
                    {configError}
                  </div>
                ) : configData ? (
                  <div className="space-y-6">
                    {/* Caller ID */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Caller ID (External Display Name)</label>
                      <input
                        type="text"
                        value={configData.display_name_external}
                        onChange={(e) => setConfigData({ ...configData, display_name_external: e.target.value })}
                        placeholder="e.g. Sales Dept"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <p className="text-xs text-gray-500">The name shown when you call others.</p>
                    </div>

                    {/* Timeout */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Ring Timeout (Seconds)</label>
                      <input
                        type="number"
                        value={configData.call_timeout}
                        onChange={(e) => setConfigData({ ...configData, call_timeout: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    {/* Voicemail */}
                    <div className="space-y-4 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700">Enable Voicemail</label>
                          <p className="text-xs text-gray-500">Allow callers to leave a message.</p>
                        </div>
                        <button
                          onClick={() => setConfigData({ ...configData, voicemail_enabled: !configData.voicemail_enabled })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${configData.voicemail_enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${configData.voicemail_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      {configData.voicemail_enabled && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Email</label>
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={configData.voicemail_mail_to}
                            onChange={(e) => setConfigData({ ...configData, voicemail_mail_to: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveConfig}
                        disabled={loading}
                        className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Configuration'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Purchase Number Modal */}
        {isPurchaseModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Purchase a Phone Number</h2>
                <button
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handlePurchaseNumber} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select a phone number for your business
                    </label>

                    {purchaseLoading && (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading available numbers...</p>
                      </div>
                    )}

                    {purchaseError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-800">{purchaseError}</p>
                      </div>
                    )}

                    {!purchaseLoading && !purchaseError && availableNumbers.length === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-yellow-800">
                          No phone numbers available at the moment. Please try again later.
                        </p>
                      </div>
                    )}

                    {!purchaseLoading && !purchaseError && availableNumbers.length > 0 && (
                      <div className="h-64 overflow-y-auto space-y-2 pr-2">
                        {availableNumbers.map((item) => (
                          <button
                            key={item.number}
                            type="button"
                            onClick={() => setSelectedNewNumber(item.number)}
                            className={`w-full p-4 border-2 rounded-lg text-left transition ${selectedNewNumber === item.number
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <div className="font-semibold text-gray-900">{item.number}</div>
                            <div className="text-sm text-gray-500">
                              {item.location || `${item.area || ''} ${item.country || 'UK'}`.trim()}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={!selectedNewNumber || purchaseSubmitting}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchaseSubmitting ? 'Purchasing...' : 'Purchase Number'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPurchaseModalOpen(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>

    </DashboardLayout>
  );
}
