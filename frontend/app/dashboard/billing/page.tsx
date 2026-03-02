'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { storage } from '@/lib/storage';
import { useState } from 'react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: 'month',
    features: ['Up to 5 users', '1 phone number', '1000 minutes/month', 'Basic analytics'],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$79',
    period: 'month',
    features: [
      'Up to 20 users',
      '5 phone numbers',
      '5000 minutes/month',
      'Advanced analytics',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited users',
      'Unlimited numbers',
      'Unlimited minutes',
      'Custom integrations',
      'Dedicated support',
    ],
  },
];

export default function BillingPage() {
  const subscription = storage.getSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const handleUpgrade = (planId: string) => {
    if (planId === 'enterprise') {
      alert('Please contact sales for Enterprise pricing');
      return;
    }
    storage.setSubscription({
      plan: planId as 'starter' | 'business',
      daysLeft: undefined,
    });
    setSelectedPlan(planId);
    alert(`Successfully upgraded to ${PLANS.find((p) => p.id === planId)?.name} plan!`);
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Plans</h1>

        {/* Current Plan */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 capitalize mb-1">
                {subscription?.plan || 'Trial'}
              </div>
              {subscription?.plan === 'trial' && subscription?.daysLeft !== undefined && (
                <div className="text-sm text-gray-600">
                  {subscription.daysLeft} days remaining
                </div>
              )}
            </div>
            {subscription?.plan === 'trial' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Upgrade now</strong> to continue using CloudPhone after your trial ends.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrentPlan = subscription?.plan === plan.id;
            const isTrial = subscription?.plan === 'trial';

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-md p-6 border-2 ${
                  plan.popular ? 'border-indigo-600' : 'border-gray-200'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-600">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    isCurrentPlan
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {isCurrentPlan
                    ? 'Current Plan'
                    : isTrial
                    ? 'Upgrade Now'
                    : 'Switch Plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              {subscription?.plan === 'trial'
                ? 'No payment method on file. Add a payment method to continue after your trial ends.'
                : 'Payment method on file. Update your billing information in settings.'}
            </p>
            <button className="mt-4 text-sm text-indigo-600 hover:underline">
              {subscription?.plan === 'trial' ? 'Add Payment Method' : 'Update Payment Method'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


