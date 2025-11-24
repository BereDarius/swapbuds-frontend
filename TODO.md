# SwapBuds Frontend - Launch Roadmap (16 Weeks)

**Target Launch:** March 17, 2026
**Current Status:** v0.7.0 (Core MVP ~60% Complete)
**Current Date:** November 24, 2025
**Working Schedule:** Part-time, 20-25 hours/week (evenings + weekends)

See **plans/LAUNCH_ROADMAP.md** for detailed week-by-week breakdown and timeline.

---

## 🎯 CURRENT PROGRESS SUMMARY

**Overall Completion:** ~60% of backend features implemented in frontend
**Timeline Status:** On track for Week 3, but Week 1-2 items need attention
**Critical Blockers:** Age verification, Review submission, Dispute system

### What's Working ✅

- Authentication (login, register, OAuth components)
- Items (browse, create, edit, delete, comments, likes)
- Trades (view, create, accept, reject, counter-offers)
- Messages (real-time chat, typing indicators, WebSocket)
- User Profiles (view, edit, stats, items, reviews display)
- Notifications (page, WebSocket, preferences)
- Settings (profile, account, privacy, notifications)
- Legal (TOS, Privacy, Guidelines, Cookies, consent banner)

### What's Missing ❌

- Age verification during registration (CRITICAL - Week 1-2)
- Review submission form (backend exists, no UI)
- Dispute creation and management (no UI)
- Support ticket system (no UI)
- Admin dashboard (no UI)
- Moderation tools (no UI)
- ID verification flow (no UI)
- Recommendations display

---

## Implementation Timeline

This roadmap aligns with the 16-week launch plan. All dates and priorities are based on **realistic solo developer timeline** working part-time.

### Phase 1: Core MVP Features (Weeks 1-6)

Focus on legal compliance first, then essential features needed for beta launch.

### Phase 2: Testing & Deployment (Weeks 7-10)

Deploy to free tier infrastructure, fix bugs, optimize performance.

### Phase 3: Beta Testing (Weeks 11-14)

100+ beta users test the platform, gather feedback, iterate quickly.

### Phase 4: Public Launch (Weeks 15-16)

Final polish, marketing preparation, public announcement.

---

## CURRENT IMPLEMENTATION STATUS

### v0.7.0 - Core Features Implemented ✅

**Completed Features:**

#### Authentication & Security ✅

- ✅ Authentication UI (login, register)
- ✅ JWT token management
- ✅ Protected routes
- ✅ OAuth components (Google, Facebook, Apple buttons)
- ✅ Error tracking (Sentry)
- ✅ Form validation (React Hook Form + Zod)
- ✅ State management (Zustand)
- ✅ Data fetching (TanStack Query)
- ✅ Toast notifications (Sonner)
- ✅ shadcn/ui components
- ✅ Responsive design
- ✅ Google reCAPTCHA v3 integration
- ✅ reCAPTCHA provider and hooks

#### Legal & GDPR ✅

- ✅ Cookie consent banner (GDPR compliant)
- ✅ Terms of Service page
- ✅ Privacy Policy page
- ✅ Cookie Policy page
- ✅ Community Guidelines page
- ✅ Legal document acceptance tracking
- ✅ Cookie preferences management
- ✅ Data export request UI
- ✅ Account deletion UI with confirmation
- ✅ Privacy settings page

#### Items Management ✅

- ✅ Items listing page with grid/list view toggle
- ✅ Item detail page with image gallery
- ✅ Create/edit item form with image upload
- ✅ Category and condition filters
- ✅ Search functionality with debouncing
- ✅ Pagination
- ✅ Item owner profile preview
- ✅ Image upload component
- ✅ Item deletion with confirmation modal
- ✅ Comments on items
- ✅ Like/unlike items functionality
- ✅ Item cards with hover effects

#### Trading System ✅

- ✅ Trade list page (sent/received/status filters)
- ✅ Trade detail page with information
- ✅ Trade proposal dialog
- ✅ Accept/reject/cancel trade actions
- ✅ Trade status indicators
- ✅ Trade cards with status badges
- ✅ Multi-item trade support in UI

#### Real-time Messaging ✅

- ✅ Conversations list page
- ✅ Chat window with message history
- ✅ Send messages with real-time delivery
- ✅ Typing indicators
- ✅ WebSocket integration (MessagesGateway)
- ✅ Message bubbles
- ✅ Unread message handling
- ✅ Message timestamps

#### User Profiles ✅

- ✅ User profile page with tabs
- ✅ Profile statistics display
- ✅ User's items display
- ✅ User's reviews display (view only)
- ✅ Edit profile functionality
- ✅ Avatar upload
- ✅ Bio and location fields
- ✅ Public profile view

#### Notifications ✅

- ✅ Notifications page
- ✅ Notification preferences page
- ✅ Real-time notifications with WebSocket
- ✅ Unread badge count
- ✅ Mark as read functionality
- ✅ WebSocket NotificationsGateway integration

#### Settings ✅

- ✅ Profile settings page
- ✅ Account settings page (GDPR features)
- ✅ Privacy settings page
- ✅ Notification preferences page

#### Socket System ✅

- ✅ Modular socket architecture
- ✅ Socket helper pattern (matching api.ts)
- ✅ MessagesGateway integration
- ✅ NotificationsGateway integration
- ✅ SupportGateway prepared (no UI)
- ✅ Logger integration (no console.log)
- ✅ Automatic reconnection
- ✅ Token management

#### API Clients ✅

- ✅ 16 API clients created and typed
- ✅ auth.ts, items.ts, trades.ts, messages.ts
- ✅ notifications.ts, users.ts, reviews.ts
- ✅ comments.ts, likes.ts, upload.ts
- ✅ legal.ts, disputes.ts, admin.ts
- ✅ moderation.ts, support.ts, verification.ts, gdpr.ts
- ✅ All using @/types for type imports
- ✅ Consistent error handling pattern

#### Type System ✅

- ✅ 15 type files in @/types folder
- ✅ auth.ts, item.ts, trade.ts, user.ts
- ✅ message.ts, notification.ts, review.ts
- ✅ comment.ts, dispute.ts, admin.ts
- ✅ moderation.ts, support.ts, verification.ts, gdpr.ts
- ✅ All type exports centralized
- ✅ No type re-exports from API files

---

---

## ⚠️ CRITICAL GAPS - IMMEDIATE ATTENTION REQUIRED

### 1. Age Verification (Week 1-2 OVERDUE) 🔴

**Status:** ❌ MISSING - Blocks public launch
**Backend:** ✅ Exists
**Frontend:** ❌ Not implemented
**Priority:** CRITICAL

**What's Missing:**

- [ ] Date of Birth field in registration form
- [ ] Real-time age validation (18+ requirement)
- [ ] "I confirm I am 18+" checkbox
- [ ] Block form submission if under 18
- [ ] Age verification error messages
- [ ] Age declaration stored with timestamp

### 2. Review Submission (Week 7 Coming Soon) 🟡

**Status:** ⚠️ PARTIAL - Can view, can't create
**Backend:** ✅ Full system exists
**Frontend:** ❌ No submission form
**Priority:** HIGH

**What's Missing:**

- [ ] `/trades/[id]/review` page
- [ ] Review submission form component
- [ ] Star rating input (1-5)
- [ ] Review categories (itemCondition, communication, delivery)
- [ ] "Leave Review" button after trade completion
- [ ] Review edit/delete functionality

### 3. Dispute System (User Protection) 🔴

**Status:** ❌ COMPLETELY MISSING
**Backend:** ✅ Full system exists
**Frontend:** ❌ Zero UI
**Priority:** CRITICAL

**What's Missing:**

- [ ] `/disputes` page - View user's disputes
- [ ] `/trades/[id]/dispute` - Create dispute
- [ ] Dispute creation dialog/form
- [ ] Dispute reason selection (ITEM_NOT_RECEIVED, etc.)
- [ ] Evidence upload functionality
- [ ] Dispute status tracking in trade detail
- [ ] Admin resolution display

### 4. Support Tickets (User Help) 🟡

**Status:** ❌ MISSING
**Backend:** ✅ Full system + WebSocket exists
**Frontend:** ❌ No UI
**Priority:** HIGH

**What's Missing:**

- [ ] `/support` page - View tickets
- [ ] `/support/new` - Create ticket form
- [ ] `/support/[id]` - Live chat with agent
- [ ] Support ticket categories (ACCOUNT, TRADE, etc.)
- [ ] Priority level selection
- [ ] Support WebSocket hooks
- [ ] Live chat component (different from messages)

### 5. Admin Dashboard (Platform Management) 🟠

**Status:** ❌ MISSING
**Backend:** ✅ Full system exists
**Frontend:** ❌ No UI
**Priority:** MEDIUM (Week 11)

**What's Missing:**

- [ ] `/admin/dashboard` - Platform statistics
- [ ] `/admin/users` - User management
- [ ] `/admin/items` - Review flagged items
- [ ] `/admin/trades` - Review problematic trades
- [ ] `/admin/audit-logs` - System audit trail
- [ ] User suspend/ban/role change UI
- [ ] Bulk action capabilities

### 6. Moderation Tools (Content Safety) 🟠

**Status:** ❌ MISSING
**Backend:** ✅ Full system exists
**Frontend:** ❌ No UI
**Priority:** MEDIUM (Week 11)

**What's Missing:**

- [ ] "Report Item" button on item pages
- [ ] "Report Trade" option in trade details
- [ ] Flag reason selection dialog
- [ ] `/moderation` dashboard for moderators
- [ ] Approve/reject flagged content
- [ ] Bulk moderation actions

### 7. ID Verification Flow 🟡

**Status:** ❌ MISSING
**Backend:** ✅ Full system exists
**Frontend:** ❌ No UI
**Priority:** MEDIUM

**What's Missing:**

- [ ] `/verification` page
- [ ] ID document upload form
- [ ] Document type selection (passport/ID/license)
- [ ] Selfie upload for verification
- [ ] Verification status display
- [ ] Verified badge on profiles

### 8. Recommendations Display 🟢

**Status:** ❌ NOT USED
**Backend:** ✅ Algorithm exists
**Frontend:** ❌ Not displaying
**Priority:** LOW

**What's Missing:**

- [ ] "Recommended for you" section on homepage
- [ ] "Similar items" on item detail page
- [ ] Interest-based suggestions
- [ ] Use GET `/items/recommendations` endpoint

---

## 🚨 IMMEDIATE ACTION ITEMS (Priority Order)

### 1. Age Verification (4 hours) 🔴 CRITICAL - BLOCKS LAUNCH

**Timeline:** Week 1-2 (OVERDUE)
**Why Critical:** Legal requirement, blocks public launch

**Tasks:**

- [ ] Add Date of Birth field to registration form
- [ ] Add age calculation function (must be 18+)
- [ ] Add "I confirm I am 18+" checkbox
- [ ] Add real-time validation (disable submit if under 18)
- [ ] Add age error message: "You must be at least 18 years old"
- [ ] Send dateOfBirth and selfDeclaredAge18 to backend
- [ ] Test age verification flow end-to-end

**Files to modify:**

- `src/app/(auth)/register/page.tsx` - Add DOB field
- `src/types/auth.ts` - Add dateOfBirth to RegisterData
- Backend already accepts these fields ✅

### 2. Review Submission (4 hours) 🟡 HIGH - Week 7 Feature

**Timeline:** Week 7 (Jan 13-19, 2026)
**Why Important:** Complete the reviews system (viewing works, creation doesn't)

**Tasks:**

- [ ] Create `/trades/[id]/review` page
- [ ] Create `ReviewForm` component with star rating
- [ ] Add rating categories (itemCondition, communication, delivery)
- [ ] Add "Leave Review" button in trade detail (if COMPLETED)
- [ ] Connect to existing `createReview` API function
- [ ] Add success/error handling
- [ ] Test review submission flow

**Files to create:**

- `src/app/(main)/trades/[id]/review/page.tsx`
- `src/components/reviews/review-form.tsx`
- `src/components/reviews/star-rating.tsx`

### 3. Dispute System (6 hours) 🔴 CRITICAL - User Protection

**Timeline:** Before beta launch (Week 11)
**Why Critical:** Users need way to report problems with trades

**Tasks:**

- [ ] Create `/disputes` page - List user's disputes
- [ ] Create `/trades/[id]/dispute` page - Create new dispute
- [ ] Create `DisputeForm` component
- [ ] Add dispute reason selection (ITEM_NOT_RECEIVED, ITEM_NOT_AS_DESCRIBED, etc.)
- [ ] Add evidence upload functionality
- [ ] Add "Report Problem" button in trade detail page
- [ ] Show dispute status in trade detail if exists
- [ ] Connect to existing `disputes.ts` API client

**Files to create:**

- `src/app/(main)/disputes/page.tsx`
- `src/app/(main)/trades/[id]/dispute/page.tsx`
- `src/components/disputes/dispute-form.tsx`

### 4. Support Ticket System (6 hours) 🟡 HIGH - User Help

**Timeline:** Before beta launch (Week 11)
**Why Important:** Users need help channel

**Tasks:**

- [ ] Create `/support` page - List user's tickets
- [ ] Create `/support/new` page - Create ticket form
- [ ] Create `/support/[id]` page - Live chat with agent
- [ ] Add support ticket categories (ACCOUNT, TRADE, PAYMENT, etc.)
- [ ] Add priority selection (LOW, MEDIUM, HIGH)
- [ ] Integrate SupportGateway WebSocket (already exists)
- [ ] Create support chat hooks (similar to messages)
- [ ] Connect to existing `support.ts` API client

**Files to create:**

- `src/app/(main)/support/page.tsx`
- `src/app/(main)/support/new/page.tsx`
- `src/app/(main)/support/[id]/page.tsx`
- `src/lib/socket/support.ts` (update existing)
- `src/hooks/use-support-chat.ts`

### 5. Moderation Tools (4 hours) 🟠 MEDIUM - Week 11

**Timeline:** Week 11 (Feb 10-16, 2026)
**Why Important:** Content safety and platform trust

**Tasks:**

- [ ] Add "Report Item" button on item detail page
- [ ] Add "Report Trade" option in trade detail page
- [ ] Create flag reason selection dialog
- [ ] Create `/moderation` dashboard (moderator role only)
- [ ] Show flagged content for moderators
- [ ] Add approve/reject actions
- [ ] Connect to existing `moderation.ts` API client

**Files to create:**

- `src/components/moderation/flag-dialog.tsx`
- `src/app/(main)/moderation/page.tsx` (role-protected)

### 6. Admin Dashboard (8 hours) 🟠 MEDIUM - Week 11

**Timeline:** Week 11 (Feb 10-16, 2026)
**Why Important:** Platform management after launch

**Tasks:**

- [ ] Create `/admin` route group (admin role only)
- [ ] Create `/admin/dashboard` - Platform statistics
- [ ] Create `/admin/users` - User management
- [ ] Create `/admin/items` - Review flagged items
- [ ] Create `/admin/trades` - Review problematic trades
- [ ] Create `/admin/audit-logs` - System audit trail
- [ ] Add user actions: suspend, ban, change role
- [ ] Connect to existing `admin.ts` API client

**Files to create:**

- `src/app/(main)/admin/layout.tsx` (role check)
- `src/app/(main)/admin/dashboard/page.tsx`
- `src/app/(main)/admin/users/page.tsx`
- `src/app/(main)/admin/items/page.tsx`
- `src/app/(main)/admin/trades/page.tsx`
- `src/app/(main)/admin/audit-logs/page.tsx`

### 7. ID Verification (4 hours) 🟡 MEDIUM - Optional for Launch

**Timeline:** After public launch
**Why Important:** Verified badge increases trust

**Tasks:**

- [ ] Create `/verification` page
- [ ] Create ID document upload form
- [ ] Add document type selection (passport/ID/license)
- [ ] Add selfie upload requirement
- [ ] Show verification status
- [ ] Add verified badge to profiles
- [ ] Connect to existing `verification.ts` API client

**Files to create:**

- `src/app/(main)/verification/page.tsx`
- `src/components/verification/id-verification-form.tsx`

---

## 📊 COMPLETION TRACKING

### By Feature Category:

**Authentication & Legal:** 95% ✅

- ✅ Login/Register
- ✅ Legal pages
- ✅ Cookie consent
- ✅ GDPR features
- ❌ Age verification (5% missing)

**Items:** 100% ✅

- ✅ Browse, create, edit, delete
- ✅ Comments, likes
- ✅ Image upload

**Trades:** 95% ✅

- ✅ Create, view, accept, reject
- ✅ Multi-item support
- ❌ No dispute creation (5% missing)

**Messages:** 90% ✅

- ✅ Real-time chat
- ✅ Typing indicators
- ❌ Read receipts partial

**Profiles:** 100% ✅

- ✅ View, edit
- ✅ Stats, items, reviews

**Notifications:** 90% ✅

- ✅ Page, preferences
- ✅ WebSocket
- ❌ No dropdown in header

**Reviews:** 40% ⚠️

- ✅ View on profiles
- ❌ Can't submit reviews

**Disputes:** 0% ❌

- ❌ No UI at all

**Support:** 0% ❌

- ❌ No UI at all

**Admin:** 0% ❌

- ❌ No UI at all

**Moderation:** 0% ❌

- ❌ No UI at all

**Verification:** 0% ❌

- ❌ No UI at all

**Overall Frontend Completion: ~60%**

---

## Week 1-2: Legal Compliance & Age Verification (CRITICAL)

**Version 0.2.1 - Legal Compliance & GDPR UI**

**Timeline:** Week 1-2 (Dec 2-15, 2025) - **NOW OVERDUE**
**Priority:** CRITICAL - Must be done first for legal compliance
**Estimated Time:** 15-20 hours

### Features Status

#### Legal & GDPR ✅ COMPLETE

- [x] **Google reCAPTCHA v3 (Invisible) Integration**
- [x] **Bot protection on registration and login forms**
- [x] **Automatic token generation on form submit**
- [x] **No user interaction required (completely invisible)**
- [x] **Graceful fallback if reCAPTCHA unavailable**
- [x] Cookie consent banner (GDPR compliant)
- [x] Terms of Service page (Romanian + English)
- [x] Privacy Policy page (Romanian + English)
- [x] Cookie Policy page
- [x] Community Guidelines page
- [x] TOS/Privacy acceptance during signup
- [x] Cookie preferences management
- [x] Data export request UI
- [x] Account deletion UI with confirmation
- [x] Legal document version tracking
- [x] **reCAPTCHA disclosure in Privacy Policy**

#### Age Verification ❌ MISSING - CRITICAL BLOCKER

- [ ] **Date of Birth field in registration form**
- [ ] **Real-time age validation (must be 18+)**
- [ ] **"I confirm I am 18+" checkbox**
- [ ] **Block form submission if under 18**
- [ ] **Age verification error messages**
- [ ] **Age declaration stored with timestamp**

### Technical Implementation

**reCAPTCHA v3 Integration:**

- [x] Install `react-google-recaptcha-v3` package
- [x] Add environment variable: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- [x] Create `Providers` component with `GoogleReCaptchaProvider`
- [x] Wrap app with reCAPTCHA provider in `layout.tsx`
- [x] Create `useRecaptcha` custom hook for token generation
- [x] Update `RegisterPage` to generate and send reCAPTCHA token
- [x] Update `LoginPage` to generate and send reCAPTCHA token
- [x] Add reCAPTCHA notice with Google policy links
- [x] Add error handling for failed token generation
- [x] Add loading states during token generation
- [x] E2E tests for reCAPTCHA integration
- [ ] Test with various browsers and ad blockers (needs manual testing)
- [ ] Document reCAPTCHA in Privacy Policy (backend content responsibility)
- [x] Add reCAPTCHA to security cookie consent category

**Legal Compliance UI:**

- [x] `CookieBanner` component with granular consent options
- [x] `LegalDocument` component for displaying TOS/Privacy
- [x] `CookiePreferences` modal for managing cookies
- [x] `DataExportRequest` component
- [x] `AccountDeletion` component with warnings
- [x] `ConsentCheckbox` component for signup flow
- [x] Cookie consent store with Zustand
- [x] API hooks: `useAcceptLegal`, `useDataExport`, `useDeleteAccount` (API client created)
- [x] LocalStorage for cookie preferences
- [x] Block non-essential cookies until consent given

### Pages & Routes

| Route               | Component           | Description               |
| ------------------- | ------------------- | ------------------------- |
| `/legal/terms`      | TermsOfServicePage  | TOS (RO/EN)               |
| `/legal/privacy`    | PrivacyPolicyPage   | Privacy Policy (RO/EN)    |
| `/legal/cookies`    | CookiePolicyPage    | Cookie Policy             |
| `/legal/guidelines` | CommunityGuidelines | Community rules           |
| `/settings/privacy` | PrivacySettingsPage | Cookie & data preferences |
| `/settings/data`    | DataManagementPage  | Export/delete data        |

### Cookie Consent Banner

**Must Include (GDPR ePrivacy Directive):**

- [ ] Show on first visit before tracking
- [ ] Granular consent options:
  - Essential cookies (always on, can't be disabled)
  - Functional cookies (optional)
  - Analytics cookies (optional)
  - Marketing cookies (optional - not used initially)
- [ ] "Accept All" button
- [ ] "Reject All" (except essential) button
- [ ] "Customize" button to manage preferences
- [ ] Link to Cookie Policy
- [ ] Remember choice for 12 months
- [ ] Easy to reopen from footer/settings

**Cookie Categories:**

```typescript
interface CookieConsent {
  essential: boolean; // Always true, can't be changed
  functional: boolean; // User preferences, language
  analytics: boolean; // Google Analytics, usage tracking
  marketing: boolean; // Ads (not used initially)
  timestamp: Date;
  version: string; // Policy version accepted
}
```

### Legal Documents Display

- [ ] Romanian version as primary (mandatory by law)
- [ ] English version toggle
- [ ] Display effective date and version number
- [ ] Table of contents with anchor links
- [ ] Print-friendly layout
- [ ] Last updated timestamp
- [ ] Highlight changes since last version (if user is logged in)

### Signup Flow Integration

**Registration Steps:**

1. User fills registration form with **Date of Birth field**
2. **Real-time age validation** (must be 18+ to continue)
3. Show TOS & Privacy Policy summary with links
4. Require checkboxes:
   - [ ] "I confirm I am at least 18 years old" (required - age declaration)
   - [ ] "I accept the Terms of Service" (required)
   - [ ] "I accept the Privacy Policy" (required)
   - [ ] "I consent to marketing emails" (optional)
5. Disable submit button if DOB shows under 18
6. Show error message if user is under 18: "You must be at least 18 years old to use SwapBuds"
7. Store consent with timestamp and IP
8. Proceed with registration

**Age Verification:**

```tsx
interface SignupForm {
  email: string;
  password: string;
  dateOfBirth: Date; // Required field
  selfDeclaredAge18: boolean; // Checkbox confirmation
  acceptTOS: boolean;
  acceptPrivacy: boolean;
  marketingConsent: boolean;
}

// Validation
const age = calculateAge(dateOfBirth);
if (age < 18) {
  throw new Error("You must be at least 18 years old to register");
}
```

### Data Management UI

**Data Export:**

- [ ] "Request Data Export" button in settings
- [ ] Show pending/processing status
- [ ] Email notification when ready
- [ ] Download button (available for 7 days)
- [ ] Rate limit: 1 request per 24 hours
- [ ] Progress indicator during processing

**Account Deletion:**

- [ ] "Delete Account" button in settings (danger zone)
- [ ] Multi-step confirmation:
  1. Warning modal explaining consequences
  2. Type "DELETE" to confirm
  3. Enter password for verification
  4. Final confirmation
- [ ] Explain 30-day grace period
- [ ] Option to cancel deletion during grace period
- [ ] Show scheduled deletion date
- [ ] List what will be deleted vs anonymized

### UI Components

**CookieBanner Component:**

```tsx
<CookieBanner
  onAcceptAll={() => acceptAll()}
  onRejectAll={() => rejectAll()}
  onCustomize={() => openPreferences()}
  language="ro" // or "en"
/>
```

**ConsentCheckbox Component:**

```tsx
<ConsentCheckbox
  type="terms" | "privacy" | "marketing"
  required={true/false}
  documentLink="/legal/terms"
  onChange={(accepted) => handleConsent(accepted)}
/>
```

### Styling & UX

- [ ] Cookie banner: Bottom of screen, non-intrusive but clear
- [ ] Banner shouldn't block critical UI
- [ ] Sticky on scroll until decision made
- [ ] Mobile-responsive (stack buttons vertically)
- [ ] Dark mode support
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Keyboard navigation support

### Analytics Integration

- [ ] Only initialize Google Analytics if user consents
- [ ] Only initialize Sentry performance monitoring if consented
- [ ] Disable tracking if consent withdrawn
- [ ] Respect DNT (Do Not Track) header

### Romanian Language

**Key Terms Translation:**

- Terms of Service = Termeni și Condiții
- Privacy Policy = Politica de Confidențialitate
- Cookie Policy = Politica de Cookie-uri
- I Accept = Accept
- I Agree = Sunt de acord
- Required = Obligatoriu
- Optional = Opțional
- Data Export = Export Date
- Delete Account = Șterge Contul

### Testing

- [x] Test cookie banner shows on first visit
- [x] Test cookie preferences persist
- [ ] Test blocking analytics without consent (requires backend integration)
- [x] Test signup with/without consent checkboxes
- [x] Test data export request flow
- [x] Test account deletion flow with confirmations
- [ ] Test Romanian/English language toggle (backend serves content)
- [x] E2E tests for legal acceptance flow
- [x] E2E tests for login flow with reCAPTCHA
- [x] E2E tests for registration flow
- [x] E2E tests for cookie consent

### Age Verification UI Components

**Date of Birth Input:**

- [x] DatePicker component (day/month/year dropdowns)
- [x] Client-side age calculation
- [x] Real-time validation (must be 18+)
- [x] Show error: "You must be at least 18 years old"
- [x] Visual indicator (red border) if under 18
- [x] Disable form submission if under 18

**Age Declaration Checkbox:**

- [x] Required checkbox: "I confirm I am at least 18 years old"
- [x] Link to age policy explanation
- [x] Cannot be unchecked once checked
- [x] Stored with timestamp on backend

**Post-Signup Age Verification Prompt:**

- [ ] Banner: "Verify your age with ID for verified badge"
- [ ] Link to ID verification flow
- [ ] Explain benefits (verified badge, increased trust)
- [ ] Can be dismissed but shows periodically

### Compliance Checklist

- [x] Cookie banner shows before any tracking
- [x] Non-essential cookies blocked until consent
- [x] Legal documents in Romanian (mandatory)
- [x] **Date of Birth field required on signup**
- [x] **Real-time age validation (18+ only)**
- [x] **Age declaration checkbox required**
- [x] **Form submission blocked if under 18**
- [ ] TOS and Privacy acceptance tracked with timestamp
- [ ] Data export feature functional
- [ ] Account deletion feature functional
- [ ] Cookie preferences easy to change
- [ ] All forms GDPR compliant

---

## Week 3: Item Browsing & Creation (HIGH PRIORITY)

**Version 0.3.0 - Item Management UI** ✅ COMPLETE

**Timeline:** Week 3 (Dec 16-22, 2025) - CURRENT WEEK
**Priority:** HIGH - Core feature for MVP
**Estimated Time:** 20-25 hours
**Status:** ✅ All features implemented

### Features Status

- [x] Items listing page with grid/list view toggle
- [x] Item detail page with image gallery
- [x] Create/edit item form with image upload
- [x] Category and condition filters
- [x] Search functionality with debouncing
- [x] Pagination
- [x] Item owner profile preview
- [x] Image upload component
- [x] Item deletion with confirmation modal
- [x] Comments on items
- [x] Like/unlike items

### Technical Implementation - COMPLETE ✅

- [x] `ItemsPage` component with TanStack Query
- [x] `ItemCard` component with hover effects
- [x] `ItemDetail` component with image gallery
- [x] `ItemForm` component
- [x] `ImageUpload` component
- [x] API hooks: `getItems`, `getItemById`, `createItem`, `updateItem`, `deleteItem`
- [x] Responsive image gallery
- [x] Skeleton loaders for items
- [x] Comment section component
- [x] Like button with optimistic updates

### Pages & Routes

| Route                | Component      | Description        |
| -------------------- | -------------- | ------------------ |
| `/items`             | ItemsPage      | Browse all items   |
| `/items/:id`         | ItemDetailPage | View item details  |
| `/items/new`         | CreateItemPage | Create new item    |
| `/items/:id/edit`    | EditItemPage   | Edit existing item |
| `/profile/:id/items` | UserItemsPage  | User's items       |

### UI/UX Guidelines

- Grid view: 3 columns desktop, 2 tablet, 1 mobile
- Item cards show: image, title, condition, category, owner avatar
- Image upload: Max 5 images, 5MB per image, show previews
- Filter sidebar: collapsible on mobile
- Search: real-time with min 3 characters
- Loading states: skeleton cards while fetching

---

## Week 4: User Profiles (HIGH PRIORITY)

**Version 0.4.0 - User Profiles** ✅ COMPLETE

**Timeline:** Week 4 (Dec 23-29, 2025)
**Priority:** HIGH - Basic profiles needed for trades
**Estimated Time:** 15-20 hours
**Status:** ✅ All features implemented

### Features Status

- [x] User profile page with stats
- [x] Edit profile form (avatar, bio, location)
- [x] User's items tab
- [x] User's reviews display (view only)
- [x] Like/unlike items functionality
- [x] Comment on items
- [x] User statistics display
- [x] Avatar upload
- [ ] Public vs private profile toggle (not yet implemented)

### Technical Implementation - COMPLETE ✅

- [x] `ProfilePage` component with tabs
- [x] Edit profile functionality
- [x] `LikeButton` component with optimistic updates
- [x] Comment section on items
- [x] API functions: `getUserProfile`, `updateUserProfile`, `likeItem`, `unlikeItem`, `getItemComments`, `createComment`
- [x] Avatar upload
- [x] User statistics display

### Pages & Routes

| Route                | Component       | Description        |
| -------------------- | --------------- | ------------------ |
| `/profile/:id`       | ProfilePage     | View user profile  |
| `/profile/edit`      | EditProfilePage | Edit own profile   |
| `/profile/:id/likes` | UserLikesPage   | User's liked items |

### UI/UX Guidelines

- Profile header: avatar, name, location, bio, stats
- Stats: items listed, trades completed, reputation score
- Tabs: Items, Likes, Reviews
- Like button: heart icon with count, red when liked
- Comments: timestamp, edit/delete for own comments
- Avatar cropper: square crop with preview

---

## Week 5-6: Trading System (CRITICAL)

**Version 0.5.0 - Trading System UI** ✅ COMPLETE

**Timeline:** Week 5-6 (Dec 30, 2025 - Jan 12, 2026)
**Priority:** CRITICAL - Core MVP feature
**Estimated Time:** 30-35 hours
**Status:** ✅ All core features implemented

### Features Status

- [x] Create trade proposal UI
- [x] Trade list page (sent/received/status filters)
- [x] Trade detail page with information
- [x] Accept/reject/cancel trade actions
- [x] Trade status indicators
- [x] Trade notifications integration (via WebSocket)
- [x] Trade history filtering (by direction and status)
- [x] Multi-item trade support

### Technical Implementation - COMPLETE ✅

- [x] `TradeProposalDialog` component with item selection
- [x] `TradesPage` component with tabs
- [x] `TradeCard` component with status badge
- [x] `TradeDetail` page component
- [x] Trade action buttons (accept/reject/cancel)
- [x] API functions: `getTrades`, `getTradeById`, `createTrade`, `acceptTrade`, `rejectTrade`, `cancelTrade`, `completeTrade`
- [x] Trade status filters
- [x] Direction filters (sent/received)

### Pages & Routes

| Route                 | Component       | Description        |
| --------------------- | --------------- | ------------------ |
| `/trades`             | TradesPage      | List all trades    |
| `/trades/:id`         | TradeDetailPage | View trade details |
| `/trades/new/:itemId` | CreateTradePage | Propose new trade  |

### UI/UX Guidelines

- Trade status colors: Pending (yellow), Accepted (green), Rejected (red), Cancelled (gray), Completed (blue)
- Status timeline: vertical progress indicator
- Trade cards: show both sides, items, status, date
- Action buttons: prominent, disabled states
- Confirmation modals for destructive actions
- Filter by: All, Pending, Active, Completed

---

## Week 7: Notifications System (HIGH PRIORITY)

**Version 0.6.0 - Notifications System UI** ✅ COMPLETE

**Timeline:** Week 7 (Jan 13-19, 2026)
**Priority:** HIGH - Important for user engagement
**Estimated Time:** 15-20 hours
**Status:** ✅ Core features implemented

### Features Status

- [x] Notification list page
- [x] Notification preferences page
- [x] Real-time notifications with WebSocket
- [x] Unread badge count
- [x] Mark as read functionality
- [x] Notification types (trade, message, review, etc.)
- [ ] Notifications dropdown in header (page exists, no dropdown)
- [ ] Notification sound toggle
- [ ] Group notifications by type
- [ ] Delete notifications

### Technical Implementation - MOSTLY COMPLETE ✅

- [x] `NotificationsPage` component
- [x] `NotificationPreferences` component
- [x] API functions: `getNotifications`, `markAsRead`, `markAllAsRead`, `getNotificationPreferences`, `updateNotificationPreferences`
- [x] WebSocket NotificationsGateway integration
- [x] Real-time notification updates
- [x] Notification hooks in socket system
- [ ] Notification dropdown component (not yet created)
- [ ] Browser notification API integration
- [ ] Notification sound effects

### Pages & Routes

| Route                     | Component               | Description           |
| ------------------------- | ----------------------- | --------------------- |
| `/notifications`          | NotificationsPage       | All notifications     |
| `/settings/notifications` | NotificationPreferences | Notification settings |

### UI/UX Guidelines

- Badge: red dot with count on header bell icon
- Dropdown: max 5 recent notifications, "View All" link
- Notification types: icons for trade, message, like, comment, review
- Unread: bold text, background highlight
- Click notification: mark as read and navigate to related page
- Preferences: toggle for each notification type (email + push)

---

## Week 8-9: Real-time Messaging (CRITICAL)

**Version 0.7.0 - Real-time Messaging UI** ✅ COMPLETE

**Timeline:** Week 8-9 (Jan 20 - Feb 2, 2026)
**Priority:** CRITICAL - Essential for trades
**Estimated Time:** 25-30 hours
**Status:** ✅ All core features implemented

### Features Status

- [x] Chat/conversations list page
- [x] Chat window with message history
- [x] Send messages with real-time delivery
- [x] Typing indicators
- [x] Unread message handling
- [x] Message timestamps
- [x] WebSocket MessagesGateway integration
- [ ] Message read receipts (partial)
- [ ] Delete messages
- [ ] Emoji picker
- [ ] Link preview for URLs

### Technical Implementation - COMPLETE ✅

- [x] `ConversationsPage` component (MessagesPage)
- [x] Chat window component
- [x] `MessageBubble` component
- [x] Message input component
- [x] API functions: `getConversations`, `getConversationMessages`, `sendMessage`, `markAsRead`
- [x] WebSocket integration for real-time messaging
- [x] useMessages hook for WebSocket
- [x] Auto-scroll to bottom on new messages
- [x] Typing indicator support
- [x] Real-time message delivery

### Pages & Routes

| Route           | Component    | Description        |
| --------------- | ------------ | ------------------ |
| `/messages`     | MessagesPage | Conversations list |
| `/messages/:id` | ChatPage     | Chat conversation  |

### UI/UX Guidelines

- Layout: sidebar with conversations, main chat window
- Message bubbles: different colors for sent/received
- Timestamps: show time, "Today", "Yesterday", dates
- Typing indicator: "User is typing..." with animated dots
- Read receipts: checkmarks (single = delivered, double = read)
- Unread badges: count on conversation items
- Mobile: show conversations or chat, not both
- Emoji picker: floating panel above input

---

## Week 10: Reviews System (HIGH PRIORITY)

**Version 0.8.0 - Reviews System UI** ⚠️ PARTIAL

**Timeline:** Week 10 (Feb 3-9, 2026)
**Priority:** HIGH - Trust & reputation feature
**Estimated Time:** 15-20 hours
**Status:** ⚠️ VIEWING WORKS, CREATION MISSING

### Features Status

- [ ] **Leave review after completed trade** ❌ MISSING - CRITICAL
- [x] View user reviews on profile ✅
- [ ] **Review form with rating (1-5 stars)** ❌ MISSING
- [ ] **Review submission page** ❌ MISSING
- [x] Review display on profiles ✅
- [x] Reputation score display ✅
- [x] Review statistics (avg rating, count) ✅
- [ ] Edit/delete own reviews ❌

### Technical Implementation - PARTIAL ⚠️

- [ ] `ReviewForm` component with star rating ❌ NOT CREATED
- [x] `ReviewCard` component ✅ EXISTS
- [x] Review display in profile ✅
- [ ] `ReviewSubmissionPage` component ❌ NOT CREATED
- [x] API functions: `getUserReviews`, `getTradeReviews` ✅
- [ ] API functions: `createReview`, `updateReview`, `deleteReview` ✅ EXIST BUT NOT USED
- [ ] Star rating input component ❌
- [ ] `/trades/[id]/review` route ❌ MISSING

### CRITICAL MISSING FEATURES:

1. **No way to submit reviews** - Backend ready, no frontend UI
2. **No review form component**
3. **No review submission page**
4. **No "Leave Review" button after trade completion**

### Pages & Routes

| Route                  | Component        | Description    |
| ---------------------- | ---------------- | -------------- |
| `/profile/:id/reviews` | ReviewsPage      | User's reviews |
| `/trades/:id/review`   | CreateReviewPage | Leave review   |

### UI/UX Guidelines

- Star rating: interactive, hover states, half-stars
- Review card: avatar, name, rating, comment, date
- Reputation: aggregate score, total reviews
- Badge colors: green (4.5+), yellow (3-4.5), red (<3)
- Only show review option for completed trades
- Max review length: 500 characters

---

## Week 11: Multi-Item Trades & Counter-Offers (MEDIUM PRIORITY)

**Version 0.9.0 - Multi-Item Trades & Counter-Offers UI**

**Timeline:** Week 11 (Feb 10-16, 2026)
**Priority:** MEDIUM - Nice-to-have for MVP
**Estimated Time:** 20-25 hours

### Features

- [ ] Select multiple items for trade
- [ ] Counter-offer UI in trade detail
- [ ] Propose alternative items
- [ ] Accept/reject counter-offers
- [ ] Counter-offer history timeline
- [ ] Multi-item selection interface

### Technical Implementation

- [ ] `MultiItemSelector` component
- [ ] `CounterOfferForm` component
- [ ] `CounterOfferCard` component
- [ ] `CounterOfferHistory` component
- [ ] API hooks: `useCreateCounterOffer`, `useCounterOffers`, `useAcceptCounterOffer`, `useRejectCounterOffer`
- [ ] Update trade UI to support multiple items
- [ ] Counter-offer store with Zustand

### UI/UX Guidelines

- Multi-item selector: checkbox list with previews
- Counter-offer: "Suggest Different Items" button
- History: timeline showing all counter-offers
- Each counter-offer: status, items, date, action buttons
- Visual comparison: "Original Offer vs Counter-Offer"
- Max 5 items per side

---

## Week 12-13: Beta Testing & Polish (HIGH PRIORITY)

**Version 0.10.0 - Dashboard & Remaining Features**

**Timeline:** Week 12-13 (Feb 17 - Mar 2, 2026)
**Priority:** HIGH - Beta testing preparation
**Estimated Time:** 25-30 hours

### Focus Areas

- [ ] User dashboard with basic stats
- [ ] Settings & preferences UI
- [ ] Search enhancements
- [ ] Bug fixes from testing
- [ ] Performance optimization
- [ ] Mobile responsiveness polish
- [ ] User statistics dashboard
- [ ] Trade filtering interface
- [ ] Advanced search filters
- [ ] Trade success rate visualization
- [ ] Response time metrics
- [ ] Trade history charts
- [ ] Export trade history

### Technical Implementation

- [ ] `StatsDashboard` component with charts
- [ ] `TradeFilters` component
- [ ] `AdvancedSearch` component
- [ ] `StatsCard` component
- [ ] API hooks: `useUserStats`, `useFilteredTrades`, `useExportHistory`
- [ ] Chart library integration (recharts or chart.js)
- [ ] Date range picker
- [ ] CSV export functionality

### Pages & Routes

| Route            | Component          | Description            |
| ---------------- | ------------------ | ---------------------- |
| `/dashboard`     | DashboardPage      | User stats overview    |
| `/trades/search` | AdvancedSearchPage | Advanced trade filters |

### UI/UX Guidelines

- Stats cards: total trades, success rate, avg response time, completion rate
- Charts: line chart for trades over time, pie chart for categories
- Filters: status, date range, user, item category
- Responsive charts: stack on mobile
- Export: CSV download with all trade data

---

## Week 14-16: Final Polish & Launch Prep (CRITICAL)

**Version 1.0.0 - Public Launch**

**Timeline:** Week 14-16 (Mar 3-17, 2026)
**Priority:** CRITICAL - Launch preparation
**Estimated Time:** 30-35 hours

### Launch Requirements

- [ ] All critical bugs fixed
- [ ] Performance optimized (Lighthouse score 90+)
- [ ] SEO optimization complete
- [ ] Analytics setup verified
- [ ] Error tracking validated
- [ ] Mobile app (PWA) tested
- [ ] Legal pages finalized
- [ ] Marketing landing page ready

---

## POST-LAUNCH ROADMAP (After March 2026)

These features are for Year 1 growth phase, after successful public launch.

---

## Version 1.1.0 - Advanced Features (Year 1, Q2)

**Timeline:** 3-6 months after launch
**Priority:** MEDIUM

### Features

- [ ] Advanced dashboard & analytics
- [ ] Dispute resolution UI
- [ ] Admin moderation panel
- [ ] Enhanced search & discovery

---

## Version 1.2.0 - Social Features (Year 1, Q3)

**Timeline:** 6-9 months after launch
**Priority:** LOW

### Features

- [ ] Follow system UI
- [ ] Activity feed
- [ ] Social sharing
- [ ] Community features

---

## Version 1.3.0 - Premium Features (Year 1, Q4)

**Timeline:** 9-12 months after launch
**Priority:** LOW - Monetization

### Features

- [ ] Subscription management UI
- [ ] Featured listings UI
- [ ] Analytics dashboard (premium)
- [ ] Priority support chat UI

---

## APPENDIX: Detailed Feature Specifications

Below are detailed specifications for features in the timeline. These serve as blueprints when ready to implement.

### Dispute Resolution UI (v1.1.0)

**Timeline:** Post-launch

### Features

- [ ] File dispute form
- [ ] View disputes list
- [ ] Dispute detail page
- [ ] Add messages to disputes
- [ ] Dispute status tracking
- [ ] Admin dispute management UI
- [ ] Dispute resolution notifications

### Technical Implementation

- [ ] `DisputeForm` component
- [ ] `DisputeCard` component
- [ ] `DisputeDetail` component
- [ ] `DisputeMessages` component
- [ ] `AdminDisputePanel` component (admin only)
- [ ] API hooks: `useDisputes`, `useDisputeDetail`, `useCreateDispute`, `useDisputeMessages`, `useAddDisputeMessage`, `useResolveDispute` (admin)
- [ ] Dispute filters (status, reason)

### Pages & Routes

| Route                 | Component         | Description              |
| --------------------- | ----------------- | ------------------------ |
| `/disputes`           | DisputesPage      | User's disputes          |
| `/disputes/:id`       | DisputeDetailPage | Dispute details          |
| `/trades/:id/dispute` | CreateDisputePage | File dispute             |
| `/admin/disputes`     | AdminDisputesPage | Admin dispute management |

### UI/UX Guidelines

- Dispute reasons: dropdown with predefined options
- Status indicators: Open (yellow), Under Review (blue), Resolved (green), Closed (gray)
- Evidence upload: support images, documents
- Admin actions: resolve, close, escalate buttons
- Timeline: all messages and status changes
- Severity: low, medium, high badges

### User Settings & Preferences UI (v0.10.0)

**Included in Week 12-13**

### Features

- [ ] Settings page with tabs
- [ ] Privacy settings
- [ ] Notification preferences
- [ ] Display preferences (theme, language)
- [ ] Account settings (email, password)
- [ ] Location settings
- [ ] Delete account flow
- [ ] Session management

### Technical Implementation

- [ ] `SettingsPage` component with tabs
- [ ] `PrivacySettings` component
- [ ] `DisplaySettings` component
- [ ] `AccountSettings` component
- [ ] `LocationSettings` component
- [ ] `DeleteAccountModal` component
- [ ] API hooks: `useSettings`, `useUpdateSettings`, `useChangePassword`, `useDeleteAccount`
- [ ] Settings store with Zustand
- [ ] Dark mode toggle
- [ ] Language selector

### Pages & Routes

| Route                     | Component            | Description        |
| ------------------------- | -------------------- | ------------------ |
| `/settings`               | SettingsPage         | User settings      |
| `/settings/privacy`       | PrivacySettings      | Privacy controls   |
| `/settings/account`       | AccountSettings      | Account management |
| `/settings/notifications` | NotificationSettings | Notification prefs |

### UI/UX Guidelines

- Tabs: Account, Privacy, Notifications, Display, Location
- Toggle switches for boolean settings
- Save indicators: "Saved" message on update
- Dangerous actions: require password confirmation
- Delete account: multi-step confirmation
- Form validation: inline error messages

### Search & Discovery Enhancement (v0.10.0)

**Included in Week 12-13**

### Features

- [ ] Global search with autocomplete
- [ ] Search history
- [ ] Popular searches
- [ ] Trending items section
- [ ] Recently viewed items
- [ ] Location-based filtering
- [ ] Sort options (newest, most popular, distance)

### Technical Implementation

- [ ] `GlobalSearch` component with dropdown
- [ ] `SearchResults` component
- [ ] `TrendingItems` component
- [ ] `RecentlyViewed` component
- [ ] API hooks: `useSearch`, `useSearchSuggestions`, `useTrendingItems`, `useRecentlyViewed`
- [ ] Search store with Zustand (history)
- [ ] Debounced search input
- [ ] Search analytics tracking

### Pages & Routes

| Route       | Component    | Description    |
| ----------- | ------------ | -------------- |
| `/search`   | SearchPage   | Search results |
| `/trending` | TrendingPage | Trending items |

### UI/UX Guidelines

- Search bar: header, autocomplete dropdown with suggestions
- Search results: same grid as items page
- Trending: "🔥 Trending Now" section on homepage
- Recently viewed: carousel at bottom of item detail pages
- Sort dropdown: Newest First, Most Popular, Most Liked, Closest to Me
- No results: helpful message with search tips

### Performance & Polish (v1.0.0)

**Included in Week 14-16 (Launch Prep)**

### Features

- [ ] Image optimization and lazy loading
- [ ] Code splitting and route-based chunking
- [ ] Service worker for offline support
- [ ] Performance monitoring
- [ ] SEO optimization (meta tags, Open Graph)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Loading states polish
- [ ] Error boundary improvements
- [ ] 404 and error pages

### Technical Implementation

- [ ] Next.js Image component throughout
- [ ] Dynamic imports for heavy components
- [ ] Service worker registration
- [ ] Lighthouse CI integration
- [ ] Meta component for SEO
- [ ] ARIA labels and keyboard navigation
- [ ] Custom error pages
- [ ] Performance budgets
- [ ] Bundle size analysis

### UI/UX Guidelines

- Skeleton loaders: consistent across all pages
- Images: blur placeholder while loading
- Offline message: banner when no connection
- Error pages: 404, 500, network error
- Loading: show progress for long operations
- Keyboard nav: all interactive elements reachable
- Focus indicators: visible, clear

### UI/UX Improvements (v1.0.0)

**Included in Week 14-16 (Launch Prep)**

### Features

- [ ] Dark mode / Light mode theme switcher
- [ ] Custom theme customization (colors, fonts)
- [ ] Layout improvements and consistency
- [ ] Animation and micro-interactions
- [ ] Improved navigation and breadcrumbs
- [ ] Better empty states and placeholders
- [ ] Enhanced loading animations
- [ ] Improved form designs and feedback
- [ ] Better mobile experience and gestures
- [ ] Accessibility improvements (ARIA, focus management)
- [ ] Consistent spacing and typography
- [ ] Icon library standardization
- [ ] Illustration and imagery updates
- [ ] Brand identity refinement

### Technical Implementation

- [ ] Theme provider with CSS variables
- [ ] Dark mode toggle with system preference detection
- [ ] Framer Motion for animations
- [ ] Custom theme builder component
- [ ] Navigation breadcrumb component
- [ ] Empty state components library
- [ ] Loading spinner variations
- [ ] Form styling system
- [ ] Mobile gesture library (swipe, pull-to-refresh)
- [ ] ARIA attributes and roles
- [ ] Typography scale system
- [ ] Icon component with unified library
- [ ] Image optimization and placeholders

### Theme System

**Color Palette:**

- Primary: Customizable brand color
- Secondary: Accent color
- Success, Warning, Error, Info states
- Neutral grays (light to dark)
- Dark mode variants for all colors

**Typography:**

- Heading hierarchy (H1-H6)
- Body text (regular, medium, bold)
- Font sizes: xs, sm, base, lg, xl, 2xl, 3xl, 4xl
- Line heights and letter spacing
- Font families: Display, Body, Mono

**Spacing:**

- Consistent spacing scale (4px base)
- Padding and margin utilities
- Component spacing guidelines

### UI/UX Guidelines

**Dark Mode:**

- Toggle in header (sun/moon icon)
- Respects system preference by default
- Smooth transition between modes
- High contrast mode option
- Color adjustments for readability

**Animations:**

- Page transitions: fade, slide
- Hover effects: scale, shadow, color
- Loading states: skeleton, spinner, progress
- Success/error feedback: checkmark, shake
- Duration: 150ms (fast), 300ms (normal), 500ms (slow)
- Easing: ease-in-out, spring

**Navigation:**

- Breadcrumbs on deep pages
- Back button behavior
- Active state indicators
- Sticky navigation on scroll
- Mobile hamburger menu with smooth slide-in

**Empty States:**

- Helpful illustrations
- Clear call-to-action
- Contextual suggestions
- Search/filter tips when no results

**Forms:**

- Floating labels or placeholder transitions
- Real-time validation feedback
- Success/error icons in inputs
- Progress indicators for multi-step forms
- Disabled state clarity
- Helper text and tooltips

**Mobile Experience:**

- Swipe gestures for navigation
- Pull-to-refresh on lists
- Bottom sheets for actions
- Touch-friendly button sizes (44x44px min)
- Haptic feedback for actions
- Safe area insets for notched devices

**Accessibility:**

- Keyboard navigation for all interactions
- Focus indicators on all focusable elements
- Skip to content link
- ARIA labels for icon buttons
- Screen reader announcements for state changes
- Color contrast ratio > 4.5:1 (WCAG AA)
- Text resize support up to 200%

**Consistency:**

- Button styles (primary, secondary, ghost, outline)
- Card elevations and shadows
- Border radius standards
- Input field heights
- Icon sizes (sm: 16px, md: 20px, lg: 24px)
- Avatar sizes (xs, sm, md, lg, xl)

### Design Tokens

```typescript
// theme.config.ts
export const theme = {
  colors: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      // ... up to 900
    },
    // ... other colors
  },
  spacing: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    // ... up to 96
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    DEFAULT: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },
};
```

### Component Library Enhancements

- [ ] Button variants with loading states
- [ ] Input components with validation states
- [ ] Card components with different styles
- [ ] Modal/Dialog improvements
- [ ] Dropdown menu enhancements
- [ ] Tooltip improvements
- [ ] Badge and tag components
- [ ] Avatar component with fallbacks
- [ ] Progress bars and indicators
- [ ] Tabs with smooth transitions
- [ ] Accordion/Collapse components
- [ ] Alert/Banner components
- [ ] Chip/Pill components
- [ ] Divider components

### Marketing Landing Page (v1.0.0)

**Included in Week 14-16 (Launch Prep)**

### Features

- [ ] Comprehensive E2E tests
- [ ] User onboarding flow
- [ ] Help center / FAQ
- [ ] Terms of service and privacy policy pages
- [ ] Contact form
- [ ] About page
- [ ] Landing page redesign
- [ ] Marketing website integration
- [ ] Feature flags system
- [ ] Analytics integration (Google Analytics / Mixpanel)
- [ ] Cookie consent banner
- [ ] Rate limiting UI feedback

### Technical Implementation

- [ ] Playwright E2E tests for critical flows
- [ ] Onboarding wizard component
- [ ] CMS integration for help articles
- [ ] Feature flags service
- [ ] Analytics tracking hooks
- [ ] Cookie consent modal
- [ ] Rate limit error handling
- [ ] Production deployment configuration
- [ ] CI/CD pipeline for frontend
- [ ] Staging environment

### Pages & Routes

| Route         | Component      | Description         |
| ------------- | -------------- | ------------------- |
| `/`           | LandingPage    | Marketing homepage  |
| `/about`      | AboutPage      | About SwapBuds      |
| `/help`       | HelpCenter     | FAQ and guides      |
| `/terms`      | TermsPage      | Terms of service    |
| `/privacy`    | PrivacyPage    | Privacy policy      |
| `/contact`    | ContactPage    | Contact form        |
| `/onboarding` | OnboardingPage | New user onboarding |

### UI/UX Guidelines

- Onboarding: 3-step wizard (profile, preferences, first item)
- Help center: searchable, categorized articles
- Legal pages: readable, table of contents
- Contact: form with file upload for support tickets
- Landing page: hero, features, testimonials, CTA
- Cookie banner: GDPR compliant, granular controls
- Feature flags: graceful degradation if feature disabled

### Testing Strategy

**Unit Tests:**

- All custom hooks
- Utility functions
- Component logic

**Integration Tests:**

- Form submissions
- API interactions
- Store updates

**E2E Tests:**

- User registration flow
- Item creation and editing
- Trade proposal and acceptance
- Messaging between users
- Review submission
- Dispute filing
- Settings updates

### Performance Targets

- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 250KB (initial)
- **Code Coverage**: > 80%

---

## APPENDIX CONTINUED: Additional Feature Blueprints

### Admin & Support Tools UI (v1.1.0 - Post-Launch)

### v1.1.0 - Admin & Support Tools UI

- Admin dashboard
- User management interface
- Content moderation panel
- Live support chat UI for users
- Support agent dashboard

### v1.2.0 - Organizations UI

- Organization profile pages
- Team member management
- Organization settings
- Bulk item operations

### v1.3.0 - OAuth Integration

- Social login buttons
- Account linking UI
- OAuth provider badges

### v1.4.0 - Email Digests

- Digest preview page
- Digest preferences UI

### v1.5.0 - Follow System UI

- Follow/unfollow buttons
- Followers/following lists
- Follow activity feed

### v1.6.0 - Activity Feed UI

- Personalized feed page
- Activity cards
- Feed filters and sorting

### v1.7.0 - Subscription UI

- Subscription plans page
- Payment form
- Billing history
- Subscription management

### v1.8.0 - Premium Features UI

- Featured items badges
- Analytics dashboard
- Advanced search interface
- Premium badge and benefits

### v1.9.0 - Payments UI

- Payment methods management
- Invoice viewing
- Tip/donation interface
- Featured item promotion flow

### v1.10.0 - Recommendations UI

- Personalized recommendations section
- "Similar items" carousel
- Trade match suggestions
- Trending algorithm visualizations

---

## Development Guidelines

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component naming: PascalCase
- Hooks naming: use\* prefix
- File naming: kebab-case

### Component Structure

```
components/
  ├── ui/              # shadcn/ui components
  ├── forms/           # Form components
  ├── layouts/         # Layout components
  ├── features/        # Feature-specific components
  └── shared/          # Shared/common components
```

### State Management

- Local state: useState
- Server state: TanStack Query
- Global state: Zustand
- Form state: React Hook Form

### Testing

- Unit tests: Vitest
- E2E tests: Playwright
- Coverage: > 80%
- Run before commit: pre-commit hook

### Performance

- Use Next.js Image component
- Lazy load heavy components
- Virtualize long lists
- Debounce search inputs
- Memoize expensive calculations
- Monitor bundle size

### Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus indicators
- Screen reader testing

---

## Known Issues & Improvements Needed

### Messages System

- **WebSocket event listeners not firing in navbar**: The navbar sets up listeners for `onMessage`, `onMessageRead`, `onConversationRead`, and `onMessageDeleted` events to update the unread message count badge in real-time, but these events are not being triggered when messages are sent/read. Currently relying on 5-second polling as a workaround.
  - **Impact**: Unread message badge doesn't update instantly when new messages arrive
  - **Current workaround**: useQuery refetchInterval set to 5000ms (5 seconds)
  - **Root cause**: Likely socket event registration timing or event name mismatch between frontend listeners and backend emits
  - **Suggested fix**: Debug WebSocket event flow, verify event names match between frontend socket.tsx listeners and backend messages.gateway.ts emits, ensure socket is connected before registering listeners

---

## END OF FRONTEND TODO

---

## Success Criteria for v1.0.0 Launch (March 17, 2026)

✅ All backend API endpoints have corresponding UI
✅ 484 backend tests passing, 100+ frontend E2E tests passing
✅ Lighthouse scores > 90 across all metrics
✅ Mobile-responsive on iOS and Android
✅ WCAG 2.1 AA accessibility compliance
✅ < 3s load time on 3G connection
✅ Zero critical bugs in production
✅ User onboarding completion rate > 70%
✅ < 5% error rate in Sentry
✅ All features documented in help center
