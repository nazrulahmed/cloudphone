# White-Label Cloud Phone Platform – Frontend Prototype
## Project Vision
The goal is to develop a white-label cloud phone platform that allows for scalable, internet-based telecommunications. By leveraging a white-label model, the platform is designed to be rebranded and utilized by various clients or partners, providing them with a turnkey VoIP (Voice over IP) solution.

## Core Technical Architecture
The project is built on a modern tech stack designed for cross-platform compatibility and high performance:


A fully navigable frontend prototype demonstrating the complete customer journey from signup to a happy, active cloud-phone customer.

## 🎯 Purpose

This is a **frontend-only prototype** that simulates a complete cloud phone platform experience using:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- LocalStorage (for state management)
- Mock data

⚠️ **Note:** Backend, APIs, real authentication, billing, and telephony are out of scope. Everything is simulated using Next.js routing, localStorage, and mock data.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
/app
├── page.tsx                    # Landing Page
├── signup/
│   └── page.tsx                # Signup Form
├── verify/
│   └── page.tsx                # Email Verification (Mock)
├── onboarding/
│   ├── step-1/                 # Business Setup
│   ├── step-2/                 # Use Case Selection
│   ├── step-3/                 # Phone Number Selection
│   ├── step-4/                 # Team Setup
│   └── complete/               # Onboarding Complete
├── dashboard/
│   ├── page.tsx                # Main Dashboard
│   ├── softphone/              # Mock Softphone
│   ├── numbers/                # Number Management
│   ├── call-flows/             # Call Flow Configuration
│   ├── analytics/              # Analytics & Reports
│   ├── billing/                # Billing & Plans
│   └── support/                # Support Tickets
└── logout/
    └── page.tsx                # Logout Handler

/components
└── DashboardLayout.tsx          # Shared Dashboard Layout

/lib
└── storage.ts                  # LocalStorage Utilities
```

## 🗺️ User Journey

1. **Landing Page** (`/`) - Product overview and signup CTA
2. **Signup** (`/signup`) - Create account with company details
3. **Email Verification** (`/verify`) - Mock email verification
4. **Onboarding Wizard** (`/onboarding/step-1` through `step-4`)
   - Step 1: Business setup (timezone, hours, language)
   - Step 2: Use case selection (sales, support, mixed)
   - Step 3: Phone number selection
   - Step 4: Team setup
5. **Dashboard** (`/dashboard`) - Main dashboard with widgets
6. **Softphone** (`/dashboard/softphone`) - Mock dialer interface
7. **Numbers** (`/dashboard/numbers`) - Manage phone numbers
8. **Call Flows** (`/dashboard/call-flows`) - Configure IVR flows
9. **Analytics** (`/dashboard/analytics`) - View call statistics
10. **Billing** (`/dashboard/billing`) - Manage subscription plans
11. **Support** (`/dashboard/support`) - Create and view tickets
12. **Logout** (`/logout`) - Clear session and redirect

## 💾 State Management

All state is managed using **localStorage** with the following keys:
- `tenant` - Company/tenant information
- `user` - User account details
- `onboardingStep` - Current onboarding progress
- `subscription` - Subscription plan and trial info
- `numbers` - Purchased phone numbers
- `callFlows` - Configured call flows
- `usageStats` - Mock usage statistics
- `supportTickets` - Support ticket history

## 🎨 Features

- ✅ Complete user journey from signup to active customer
- ✅ Responsive design with Tailwind CSS
- ✅ Mock softphone with dial pad
- ✅ Visual call flow builder
- ✅ Analytics dashboard with charts (Recharts)
- ✅ Billing and subscription management
- ✅ Support ticket system
- ✅ Progress indicators in onboarding
- ✅ Empty states for better UX
- ✅ Navigation guards (route protection)

## 🔧 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **State:** LocalStorage (client-side only)

## 📝 Notes

- All data is stored in browser localStorage
- No backend or API calls are made
- Authentication is simulated
- Phone calls are mock/demo only
- Charts use mock data
- This is a **prototype/demo** for showcasing the user experience

## 🚀 Future Enhancements (Not in Scope)

- Replace localStorage with real API calls
- Integrate real telephony infrastructure
- Implement JWT authentication
- Connect to real CDR (Call Detail Records) data
- Add real payment processing
- Implement WebRTC for actual calling

## 📄 License

This is a prototype project for demonstration purposes.
