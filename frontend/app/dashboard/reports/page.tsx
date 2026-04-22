'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { HiDocumentReport, HiPhoneIncoming, HiPhoneOutgoing, HiRefresh } from 'react-icons/hi';
import { fetchCdrs } from '@/lib/api';

export default function ReportsPage() {
    const [cdrs, setCdrs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchCdrs();
            setCdrs(data);
        } catch (err) {
            console.error("Failed to load CDRs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Helpful formatting function for timestamps
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor((seconds || 0) / 60);
        const s = (seconds || 0) % 60;
        return `${m}m ${s}s`;
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Call Logs & Reports</h1>
                    <p className="text-gray-500 mt-1">View detailed records of all inbound and outbound calls.</p>
                </div>

                <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition drop-shadow-sm disabled:opacity-50"
                >
                    <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
                    Refresh Data
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {loading && cdrs.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                        Loading records...
                    </div>
                ) : cdrs.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-indigo-50 p-4 rounded-full">
                                <HiDocumentReport className="w-12 h-12 text-indigo-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Call Records Found</h3>
                        <p className="text-gray-500">When you make or receive calls, they will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Direction / From</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">To</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {cdrs.map((cdr: any) => {
                                    const p = cdr.payload || {};
                                    // Basic heuristic for direction (if our system knows the numbers, we could be more accurate)
                                    // But for now we just show what Sysconfig sent
                                    const isOutbound = p.direction === 'outbound';

                                    return (
                                        <tr key={cdr.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(cdr.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {isOutbound ? (
                                                        <HiPhoneOutgoing className="w-5 h-5 text-indigo-500" />
                                                    ) : (
                                                        <HiPhoneIncoming className="w-5 h-5 text-green-500" />
                                                    )}
                                                    <span className="font-medium text-gray-900">{p.from || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                {p.to || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDuration(p.duration)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full
                          ${p.status === 'answered' ? 'bg-green-100 text-green-700' :
                                                        p.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                    {(p.status || 'unknown').toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
