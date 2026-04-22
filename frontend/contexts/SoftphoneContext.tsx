'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Web, SessionState } from 'sip.js';

interface SoftphoneContextType {
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    registerState: 'unregistered' | 'registered';
    callState: 'idle' | 'calling' | 'ringing' | 'connected';
    error: string | null;
    sipUsername: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    makeCall: (destination: string) => Promise<void>;
    hangup: () => void;
}

const SoftphoneContext = createContext<SoftphoneContextType | null>(null);

export function SoftphoneProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
    const [registerState, setRegisterState] = useState<'unregistered' | 'registered'>('unregistered');
    const [callState, setCallState] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [sipUsername, setSipUsername] = useState<string | null>(null);

    const simpleUserRef = useRef<Web.SimpleUser | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create hidden audio element for WebRTC media streams
        const audio = new Audio();
        audio.autoplay = true;
        audioRef.current = audio;
    }, []);

    const connect = async () => {
        if (status === 'connected' || status === 'connecting') return;

        try {
            setStatus('connecting');
            setError(null);

            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://localhost:8000/api/numbers/sip-credentials', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch SIP credentials');
            const { data } = await res.json();

            setSipUsername(data.username);

            const server = data.wssServer;
            const aor = `sip:${data.username}@${data.domain}`;
            const password = data.password;

            const simpleUser = new Web.SimpleUser(server, {
                aor: aor,
                media: {
                    constraints: { audio: true, video: false },
                    remote: {
                        audio: audioRef.current || undefined
                    }
                }
            });

            simpleUser.delegate = {
                onRegistered: () => {
                    console.log('SIP Registered!');
                    setRegisterState('registered');
                },
                onUnregistered: () => {
                    console.log('SIP Unregistered');
                    setRegisterState('unregistered');
                },
                onServerDisconnect: (e) => {
                    console.warn('WSS Disconnected', e);
                    setStatus('disconnected');
                    setRegisterState('unregistered');
                },
                onCallCreated: () => {
                    console.log('Call created');
                    setCallState('calling');
                },
                onCallAnswered: () => {
                    console.log('Call answered');
                    setCallState('connected');
                },
                onCallHangup: () => {
                    console.log('Call hung up');
                    setCallState('idle');
                }
            };

            // Ensure user agent options has credentials
            // Ignore typescript complaining about options being private, sip.js allows this workaround
            // @ts-ignore
            simpleUser.options.userAgentOptions = {
                authorizationUsername: data.username,
                authorizationPassword: data.password,
                // @ts-ignore
                ...simpleUser.options.userAgentOptions
            };

            simpleUserRef.current = simpleUser;

            await simpleUser.connect();
            setStatus('connected');

            await simpleUser.register();

        } catch (err: any) {
            console.error('Failed to initialize Softphone', err);
            setError(err.message || 'Initialization failed');
            setStatus('error');
        }
    };

    const disconnect = () => {
        if (simpleUserRef.current) {
            simpleUserRef.current.unregister().catch(console.error);
            simpleUserRef.current.disconnect().catch(console.error);
            simpleUserRef.current = null;
        }
        setStatus('disconnected');
        setRegisterState('unregistered');
        setCallState('idle');
    };

    const makeCall = async (destination: string) => {
        // @ts-ignore
        if (!simpleUserRef.current || registerState !== 'registered') {
            setError('Softphone is not registered. Please connect first.');
            return;
        }
        try {
            setCallState('calling');
            // @ts-ignore
            const domain = simpleUserRef.current.options?.aor?.split('@')[1] || 'ordere.pbxtrunk.sysconfig.co.uk';
            const target = `sip:${destination}@${domain}`;
            await simpleUserRef.current.call(target);
        } catch (err: any) {
            console.error('Failed to make call', err);
            setError('Failed to make call: ' + err.message);
            setCallState('idle');
        }
    };

    const hangup = () => {
        if (simpleUserRef.current) {
            simpleUserRef.current.hangup().catch(console.error);
        }
        setCallState('idle');
    };

    return (
        <SoftphoneContext.Provider value={{ status, registerState, callState, error, sipUsername, connect, disconnect, makeCall, hangup }}>
            {children}
        </SoftphoneContext.Provider>
    );
}

export const useSoftphone = () => {
    const context = useContext(SoftphoneContext);
    if (!context) {
        throw new Error('useSoftphone must be used within a SoftphoneProvider');
    }
    return context;
};
