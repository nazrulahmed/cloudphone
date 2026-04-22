'use client';

import { SoftphoneProvider } from '@/contexts/SoftphoneContext';

export default function SoftphoneClientProvider({ children }: { children: React.ReactNode }) {
    return <SoftphoneProvider>{children}</SoftphoneProvider>;
}
