// LocalStorage utilities for state management

export interface Tenant {
  company: string;
  country: string;
  status: 'pending' | 'verified' | 'active';
  timezone?: string;
  businessHours?: { start: string; end: string };
  language?: string;
}

export interface User {
  email: string;
  role: 'admin' | 'user';
  name?: string;
}

export interface Subscription {
  plan: 'trial' | 'starter' | 'business' | 'enterprise';
  daysLeft?: number;
}

export interface PhoneNumber {
  number: string;
  status: 'active' | 'inactive';
  assignedTo?: string;
}

export interface CallFlow {
  id: string;
  name: string;
  type: 'ivr' | 'queue' | 'voicemail';
  config: any;
}

export interface UsageStats {
  callsPerDay: { date: string; count: number }[];
  missedCalls: number;
  agentPerformance: { name: string; calls: number; avgDuration: number }[];
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
}


const STORAGE_KEYS = {
  tenant: 'tenant',
  user: 'user',
  onboardingStep: 'onboardingStep',
  subscription: 'subscription',
  numbers: 'numbers',
  callFlows: 'callFlows',
  usageStats: 'usageStats',
  supportTickets: 'supportTickets',
} as const;

export const storage = {
  // Tenant
  getTenant: (): Tenant | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.tenant);
    return data ? JSON.parse(data) : null;
  },
  setTenant: (tenant: Tenant) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.tenant, JSON.stringify(tenant));
  },

  // User
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.user);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  },

  // Onboarding
  getOnboardingStep: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.onboardingStep);
  },
  setOnboardingStep: (step: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.onboardingStep, step);
  },

  // Subscription
  getSubscription: (): Subscription | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.subscription);
    return data ? JSON.parse(data) : null;
  },
  setSubscription: (subscription: Subscription) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.subscription, JSON.stringify(subscription));
  },

  // Numbers
  getNumbers: (): PhoneNumber[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.numbers);
    return data ? JSON.parse(data) : [];
  },
  setNumbers: (numbers: PhoneNumber[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.numbers, JSON.stringify(numbers));
  },

  // Call Flows
  getCallFlows: (): CallFlow[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.callFlows);
    return data ? JSON.parse(data) : [];
  },
  setCallFlows: (flows: CallFlow[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.callFlows, JSON.stringify(flows));
  },

  // Usage Stats
  getUsageStats: (): UsageStats | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.usageStats);
    return data ? JSON.parse(data) : null;
  },
  setUsageStats: (stats: UsageStats) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.usageStats, JSON.stringify(stats));
  },

  // Support Tickets
  getSupportTickets: (): SupportTicket[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.supportTickets);
    return data ? JSON.parse(data) : [];
  },
  setSupportTickets: (tickets: SupportTicket[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.supportTickets, JSON.stringify(tickets));
  },

  // Clear all
  clearAll: () => {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};


