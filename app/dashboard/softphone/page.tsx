'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  HiPhone,
  HiPhoneIncoming,
  HiCheckCircle,
  HiPhoneMissedCall,
} from 'react-icons/hi';

type CallStatus = 'idle' | 'calling' | 'connected' | 'ended';

export default function SoftphonePage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callDuration, setCallDuration] = useState(0);

  const handleDial = (digit: string) => {
    if (callStatus === 'idle') {
      setPhoneNumber((prev) => prev + digit);
    }
  };

  const handleCall = () => {
    if (!phoneNumber) return;
    setCallStatus('calling');
    setTimeout(() => {
      setCallStatus('connected');
      // Start timer
      let duration = 0;
      const interval = setInterval(() => {
        duration++;
        setCallDuration(duration);
      }, 1000);
      // Auto-end after 30 seconds for demo
      setTimeout(() => {
        clearInterval(interval);
        setCallStatus('ended');
      }, 30000);
    }, 2000);
  };

  const handleEndCall = () => {
    setCallStatus('idle');
    setPhoneNumber('');
    setCallDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Softphone</h1>

        <div className="max-w-md mx-auto">
          {/* Call Display */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center mb-6">
              <div className="mb-4 flex justify-center">
                {callStatus === 'idle' && <HiPhone className="w-16 h-16 text-indigo-600" />}
                {callStatus === 'calling' && (
                  <HiPhoneIncoming className="w-16 h-16 text-indigo-600 animate-pulse" />
                )}
                {callStatus === 'connected' && (
                  <HiCheckCircle className="w-16 h-16 text-green-600" />
                )}
                {callStatus === 'ended' && (
                  <HiPhoneMissedCall className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <div className="text-2xl font-mono font-semibold text-gray-900 mb-2">
                {phoneNumber || 'Enter number'}
              </div>
              {callStatus === 'connected' && (
                <div className="text-lg text-gray-600">{formatDuration(callDuration)}</div>
              )}
              {callStatus === 'calling' && (
                <div className="text-lg text-indigo-600 animate-pulse">Calling...</div>
              )}
              {callStatus === 'ended' && (
                <div className="text-lg text-gray-500">Call ended</div>
              )}
            </div>

            {/* Dial Pad */}
            {callStatus === 'idle' && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleDial(digit.toString())}
                    className="aspect-square bg-gray-100 hover:bg-gray-200 rounded-lg text-2xl font-semibold text-gray-900 transition"
                  >
                    {digit}
                  </button>
                ))}
              </div>
            )}

            {/* Call Controls */}
            <div className="flex gap-4 justify-center">
              {callStatus === 'idle' && (
                <button
                  onClick={handleCall}
                  disabled={!phoneNumber}
                  className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <HiPhone className="w-5 h-5" />
                  <span>Call</span>
                </button>
              )}
              {(callStatus === 'calling' || callStatus === 'connected') && (
                <button
                  onClick={handleEndCall}
                  className="flex-1 bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <HiPhoneMissedCall className="w-5 h-5" />
                  <span>End Call</span>
                </button>
              )}
              {callStatus === 'ended' && (
                <button
                  onClick={handleEndCall}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  New Call
                </button>
              )}
              {callStatus === 'idle' && phoneNumber && (
                <button
                  onClick={() => setPhoneNumber('')}
                  className="px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a mock softphone for demonstration purposes. In
              production, this would connect to real telephony infrastructure.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

