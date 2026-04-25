# Expert Invests — Platform Features & Architecture Documentation

This document serves as a comprehensive, professional overview of the core features and operational logic of the Expert Invests platform. It details the user journey from onboarding to wealth generation, highlighting the underlying systems that power the application.

---

## 1. User Authentication & Onboarding (Sign Up & Login)

The platform provides a frictionless, secure, and intuitive onboarding experience designed to minimize drop-off rates while maintaining high security.

- **Frictionless Registration:** Users provide essential information (Full Name, Email, Password). 
- **Smart Localization:** The system automatically detects and pre-fills the user's country based on their browser's timezone, streamlining the signup process.
- **Automated Communication:** Upon successful account creation, an automated welcome email is dispatched asynchronously (non-blocking) to ensure a smooth user experience.
- **Secure Access:** Authentication is handled securely via Supabase Auth, employing robust password hashing and session management, and restricting access to the dashboard until the user is fully authenticated.

## 2. Dashboard & Profile Management

The dashboard acts as the central command center for investors, featuring a premium, dynamic UI with real-time financial metrics.

- **Financial Overview:** Users are greeted with an aggregated view of their portfolio, including **Total Balance**, **Total Invested**, and **Live Profit**. These metrics update dynamically.
- **Profile Identity:** The profile section displays user details (Email, Country, Member Since) and automatically generates an elegant avatar based on their initials.
- **Verification Status:** Users receive visual cues (e.g., "Account Verified" badges) to build trust and confirm account standing.
- **Custom ROI Tracking:** The profile can track and display custom ROI bonuses awarded to specific users.

## 3. Wallet Funding (Deposit System)

The deposit architecture is designed to securely route user funds into the platform's ecosystem.

- **Initiation:** Users access the deposit flow directly from the dashboard via a dedicated modal.
- **Processing:** The system records the deposit intent. Depending on the payment method configured, this transitions into an admin-review phase or processes automatically.
- **Balance Update:** Once a deposit is confirmed, it atomically updates the user's `balance` field in their profile, making the funds instantly available for investment subscriptions.

## 4. Investment Subscription Architecture

The investment engine is the core of the platform. It features a highly granular, robust tracking system allowing users to compound wealth effectively.

- **Independent Subscriptions:** Users can hold multiple, independent investment plans simultaneously (e.g., a Platinum plan at 12% daily and a Silver plan at 7% daily). 
- **Granular Reward Tracking:** Each active subscription operates on its own timeline. It tracks its own start date, end date, and 24-hour reward distribution interval. 
- **Dynamic Profit Calculation:** The system calculates live profits down to the millisecond based on the elapsed time and the plan's specific Daily ROI percentage.
- **Visual Progression:** The dashboard UI renders beautiful, real-time progress bars for each active investment, displaying exact earnings, the percentage of completion, and the current day within the duration.
- **Reinvestment:** Users can seamlessly reinvest their accrued balances to take advantage of compounding returns.

## 5. Affiliate Tracking (Referral System)

A robust, automated referral infrastructure incentivizes user growth and community building.

- **Automated Commission:** The platform automatically tracks user lineages. When a referred user makes their **first investment subscription**, the system automatically triggers a reward mechanism.
- **5% First-Subscription Bonus:** The referrer is instantly credited with a 5% commission based on the monetary value of that first subscription.
- **Atomic Updates:** The referral reward is processed as an atomic database transaction to prevent race conditions and ensure the referrer's balance is updated flawlessly.
- **Admin Visibility:** The admin dashboard accurately reflects these referral counts and earnings for oversight.

## 6. Payouts (Withdrawal System)

The withdrawal system allows users to securely extract their initial capital or generated profits.

- **Eligibility Windows:** Withdrawals are subject to specific platform rules, such as a 15-day withdrawal eligibility window for certain investment returns, ensuring platform liquidity and adherence to plan terms.
- **Request Flow:** Users initiate withdrawal requests specifying the desired amount through a secure modal.
- **Balance Verification:** The system checks the user's available balance to prevent overdrawing before logging the request for final processing and payout.

---
*Documented for architecture review, administrative reference, and future development alignment.*
