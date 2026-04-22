'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useSoftphone } from '@/contexts/SoftphoneContext';
import {
  HiPhone,
  HiPhoneIncoming,
  HiCheckCircle,
  HiPhoneMissedCall,
} from 'react-icons/hi';

export default function SoftphonePage() {
  const { status, registerState, callState, error, sipUsername, connect, disconnect, makeCall, hangup } = useSoftphone();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  // Handle call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const handleDial = (digit: string) => {
    if (callState === 'idle') {
      setPhoneNumber((prev) => prev + digit);
    }
  };

  const handleCall = async () => {
    if (!phoneNumber) return;
    await makeCall(phoneNumber);
  };

  const handleEndCall = () => {
    hangup();
    setPhoneNumber('');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Softphone</h1>
          <div className="flex items-center gap-4">
            {error && <span className="text-red-600 text-sm font-medium">{error}</span>}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <div className={`w-3 h-3 rounded-full ${registerState === 'registered' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
              <span className="text-sm font-semibold text-gray-700">
                {registerState === 'registered' ? `Ext: ${sipUsername} (Online)` : 'Offline'}
              </span>
            </div>
            {status === 'disconnected' ? (
              <button onClick={connect} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Connect PBX</button>
            ) : (
              <button onClick={disconnect} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition">Disconnect</button>
            )}
          </div>
        </div>

        <div className="max-w-md mx-auto">
          {/* Call Display */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center mb-6">
              <div className="mb-4 flex justify-center">
                {callState === 'idle' && <HiPhone className="w-16 h-16 text-indigo-600" />}
                {callState === 'calling' && (
                  <HiPhoneIncoming className="w-16 h-16 text-indigo-600 animate-pulse" />
                )}
                {callState === 'connected' && (
                  <HiCheckCircle className="w-16 h-16 text-green-600" />
                )}
              </div>
              <div className="text-2xl font-mono font-semibold text-gray-900 mb-2">
                {phoneNumber || 'Enter number'}
              </div>
              {callState === 'connected' && (
                <div className="text-lg text-gray-600">{formatDuration(callDuration)}</div>
              )}
              {callState === 'calling' && (
                <div className="text-lg text-indigo-600 animate-pulse">Calling...</div>
              )}
            </div>

            {/* Dial Pad */}
            {callState === 'idle' && (
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
              {callState === 'idle' && (
                <button
                  onClick={handleCall}
                  disabled={!phoneNumber}
                  className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <HiPhone className="w-5 h-5" />
                  <span>Call</span>
                </button>
              )}
              {(callState === 'calling' || callState === 'connected') && (
                <button
                  onClick={handleEndCall}
                  className="flex-1 bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <HiPhoneMissedCall className="w-5 h-5" />
                  <span>End Call</span>
                </button>
              )}
              {callState === 'idle' && phoneNumber && (
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

