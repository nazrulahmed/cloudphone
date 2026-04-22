'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { HiShieldCheck, HiOutlineDocumentAdd, HiCheckCircle, HiClock, HiOutlineDocumentText } from 'react-icons/hi';
import { fetchKycDocuments, uploadKycDocument } from '@/lib/api';

export default function CompliancePage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('passport');
    const [error, setError] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchKycDocuments();
            setDocuments(data);
        } catch (err) {
            console.error("Failed to load KYC documents", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const result = await uploadKycDocument(docType, selectedFile);
            if (result) {
                // Clear form and reload data
                setSelectedFile(null);
                setDocType('passport');
                // Reset file input element visually
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';

                await loadData();
            } else {
                setError('Failed to upload document. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during upload.');
        } finally {
            setUploading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><HiCheckCircle className="w-4 h-4" /> Verified</span>;
            case 'rejected':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><HiClock className="w-4 h-4" /> Pending Review</span>;
        }
    };

    const formatDocType = (type: string) => {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <HiShieldCheck className="w-8 h-8 text-indigo-600" />
                    Compliance & Identity
                </h1>
                <p className="text-gray-500 mt-2">
                    To comply with international telecom regulations, we require verification of your identity and business.
                    Please upload the requested documents below.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <HiOutlineDocumentAdd className="w-6 h-6 text-indigo-500" />
                            Upload Document
                        </h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                                <select
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="passport">Passport</option>
                                    <option value="national_id">National ID Card</option>
                                    <option value="driver_license">Driver's License</option>
                                    <option value="utility_bill">Utility Bill (Proof of Address)</option>
                                    <option value="business_registration">Business Registration</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">File (JPG, PNG, PDF)</label>
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition
                  ${uploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                `}
                            >
                                {uploading ? 'Uploading...' : 'Submit Document'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                                Loading documents...
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="bg-gray-50 p-4 rounded-full">
                                        <HiOutlineDocumentText className="w-12 h-12 text-gray-400" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No Documents Uploaded</h3>
                                <p className="text-gray-500">Upload your first compliance document to get started.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {documents.map((doc: any) => (
                                    <li key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-indigo-50 p-3 rounded-lg">
                                                    <HiOutlineDocumentText className="w-6 h-6 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{formatDocType(doc.document_type)}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Uploaded on {new Date(doc.uploaded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {getStatusBadge(doc.status)}
                                                {doc.file_path && (
                                                    <a
                                                        href={`http://localhost:8000${doc.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        View File
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
