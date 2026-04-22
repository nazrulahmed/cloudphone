'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { storage } from '@/lib/storage';
import { useState } from 'react';
import { HiQuestionMarkCircle } from 'react-icons/hi';

export default function SupportPage() {
  const tickets = storage.getSupportTickets();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '' });


  const handleCreateTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const ticket = {
      id: `ticket-${Date.now()}`,
      subject: newTicket.subject,
      description: newTicket.description,
      status: 'open' as const,
      createdAt: new Date().toISOString(),
    };


    storage.setSupportTickets([...tickets, ticket]);
    setNewTicket({ subject: '', description: '' });
    setShowCreateForm(false);
    alert('Ticket created successfully!');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.open
          }`}
      >
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + Create Ticket
          </button>
        </div>

        {/* Create Ticket Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Support Ticket</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Provide details about your issue..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateTicket}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Submit Ticket
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewTicket({ subject: '', description: '' });
                  }}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="mb-4 flex justify-center">
              <HiQuestionMarkCircle className="w-16 h-16 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Support Tickets</h2>
            <p className="text-gray-600 mb-6">
              Create a ticket if you need help or have questions about your account.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Create Your First Ticket
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{ticket.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(ticket.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Ticket Details Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Ticket Details</h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Subject</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{selectedTicket.subject}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status</h3>
                    <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Description</h3>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div>Ticket ID: <span className="font-mono">{selectedTicket.id}</span></div>
                  <div>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}

