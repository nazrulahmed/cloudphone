'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { HiUserGroup, HiPlus } from 'react-icons/hi';
import { fetchExtensions, createTeam, fetchInventory } from '@/lib/api';
import Link from 'next/link';

export default function TeamsPage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [numbers, setNumbers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', extension: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [extensionsData, inventoryData] = await Promise.all([
                fetchExtensions(),
                fetchInventory()
            ]);
            setTeams(extensionsData);
            setNumbers(inventoryData);
        } catch (err) {
            console.error('Failed to load teams data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.extension) return;

        setIsSubmitting(true);
        try {
            const result = await createTeam(formData.name, formData.extension);
            if (result) {
                setIsModalOpen(false);
                setFormData({ name: '', extension: '' });
                loadData();
                alert('Agent added successfully!');
            }
        } catch (err: any) {
            console.error('Create team error:', err);
            alert(err.message || 'Failed to create agent');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                        <HiPlus className="w-5 h-5" />
                        Add Agent
                    </button>
                </div>

                {loading && teams.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : teams.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-16 text-center border-2 border-dashed border-gray-100 max-w-2xl mx-auto">
                        <div className="mb-6 flex justify-center">
                            <div className="bg-indigo-50 p-6 rounded-full">
                                <HiUserGroup className="w-16 h-16 text-indigo-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Build Your Team</h2>
                        {numbers.length === 0 ? (
                            <>
                                <p className="text-gray-600 mb-10 max-w-sm mx-auto leading-relaxed">
                                    To create your first team member, you'll first need a
                                    <Link href="/dashboard/numbers" className="text-indigo-600 font-semibold hover:underline px-1 whitespace-nowrap">phone number</Link>
                                    assigned to your account to use as their Caller ID.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href="/dashboard/numbers"
                                        className="bg-white border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition shadow-sm"
                                    >
                                        Get a Number First
                                    </Link>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition"
                                    >
                                        Add Agent Anyway
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-600 mb-10 max-w-sm mx-auto leading-relaxed">
                                    You have {numbers.length} number{numbers.length > 1 ? 's' : ''} ready. Now add agents to start making and receiving calls.
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition"
                                >
                                    Add Your First Agent
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map((agent) => (
                            <div key={agent.extension_uuid} className="bg-white rounded-xl shadow-md p-6 border border-transparent hover:border-indigo-200 transition">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-indigo-100 p-3 rounded-lg">
                                        <HiUserGroup className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                                        Active
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{agent.name || `Extension ${agent.extension}`}</h3>
                                <p className="text-sm text-gray-500 mb-4">Internal Ext: <span className="font-mono text-indigo-600 font-bold">{agent.extension}</span></p>
                                <div className="pt-4 border-t border-gray-100 flex justify-between gap-2">
                                    <div className="text-xs text-gray-400">SIP User ID: {agent.extension}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Agent Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Add New Agent</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Internal Extension</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 101"
                                            value={formData.extension}
                                            onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                        />
                                        <p className="text-xs text-gray-500 mt-1 uppercase">3-digit numerical extension recommended</p>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Creating...' : 'Create Agent'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
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
