# SwapBuds Frontend - Quick TODO

**Version:** v0.9.0 (~95% complete) | **Date:** Nov 24, 2025 | **Launch:** Mar 17, 2026

## ✅ ALL PRIORITY TASKS COMPLETE!

🎉 All critical, high, medium, and low priority tasks have been implemented!

---

## 🚨 Critical Tasks (Blocks Launch)

### 1. Age Verification (4h) ✅ COMPLETE

- [x] Add DOB field to `src/app/(auth)/register/page.tsx`
- [x] Add age calculation (18+ required)
- [x] Add "I confirm I'm 18+" checkbox
- [x] Disable submit if under 18
- [x] Update `src/types/auth.ts` (add dateOfBirth, selfDeclaredAge18)

### 2. Dispute System (6h) ✅ COMPLETE

- [x] Create `src/app/(main)/disputes/page.tsx` - list disputes
- [x] Create `src/app/(main)/trades/[id]/dispute/page.tsx` - create dispute
- [x] Dispute form with reason selection
- [x] Add "Report Problem" button in trade detail page
- [x] Add reason selection (ITEM_NOT_RECEIVED, ITEM_NOT_AS_DESCRIBED, etc.)
- [x] Form validation and error handling

---

## 🟡 High Priority

### 3. Review Submission (4h) ✅ COMPLETE

- [x] Create `src/components/reviews/review-form.tsx` - Dialog form with star rating
- [x] Add "Leave Review" button on completed trades (trade detail page)
- [x] Show existing reviews with edit option
- [x] Star rating input (1-5 with hover effect)
- [x] Comment textarea (optional, 0-1000 chars)
- [x] Form submission and validation
- [x] Edit existing reviews

### 4. Support Tickets (6h) ✅ COMPLETE

- [x] Create `src/app/(main)/support/page.tsx` - list tickets with status/priority
- [x] Create `src/app/(main)/support/new/page.tsx` - create ticket form
- [x] Create `src/app/(main)/support/[id]/page.tsx` - live chat with WebSocket
- [x] Real-time message delivery and typing indicators
- [x] Priority levels (LOW, MEDIUM, HIGH, URGENT)
- [x] Status tracking (OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED)
- [x] Auto-scroll to latest message
- [x] Empty states and error handling

---

## 🟠 Medium Priority (Week 11)

### 5. Admin Dashboard (8h) ✅ COMPLETE

- [x] Create `src/app/(main)/admin/layout.tsx` - role-protected with sidebar
- [x] Create `src/app/(main)/admin/dashboard/page.tsx` - platform stats overview
- [x] Create `src/app/(main)/admin/users/page.tsx` - full user management
  - User list with search and role filter
  - Ban/unban users with reason tracking
  - Change user roles (USER, MODERATOR, SUPPORT, ADMIN)
  - User details display
- [x] Create `src/app/(main)/admin/items/page.tsx` - stub page
- [x] Create `src/app/(main)/admin/trades/page.tsx` - stub page
- [x] Create `src/app/(main)/admin/audit-logs/page.tsx` - action log viewer
- [x] Role-based access control (ADMIN/MODERATOR only)
- [x] Navigation sidebar with active state

### 6. Moderation Tools (4h) ✅ COMPLETE

- [x] Create `src/components/moderation/flag-dialog.tsx` - reusable report dialog
  - Flag reasons (INAPPROPRIATE_CONTENT, SPAM, HARASSMENT, etc.)
  - Description field with validation
  - Works for ITEM, COMMENT, USER, TRADE content types
- [x] Add "Report" button to item detail page
  - Shows for non-owners
  - Available and unavailable items
- [x] Create `src/app/(main)/moderation/page.tsx` - moderator dashboard
  - View all flagged content with filters
  - Filter by status (PENDING, APPROVED, REJECTED, REMOVED)
  - Filter by content type
  - Approve/reject/remove actions with reason tracking
- [x] Action dialogs with confirmation

---

## 🟢 Low Priority (Post-Launch)

### 7. ID Verification (4h) ✅ COMPLETE

- [x] Create `src/app/(main)/verification/page.tsx` - full verification flow
  - Document type selection (Passport, ID Card, Driver's License)
  - Image upload to Cloudinary (max 10MB)
  - Image preview before submission
  - Form validation with Zod
- [x] Show verification status with badges
  - PENDING status with estimated review time
  - APPROVED status with verification badge
  - REJECTED status with reason and resubmit option
  - Cancel pending requests
- [x] Benefits section explaining verification value
- [x] Upload guidelines and security notes
- [x] Verified badge displayed on user profiles (already implemented)

### 8. Polish & Improvements

- [ ] Add notification dropdown in header
- [ ] Add message read receipts
- [ ] Add message deletion
- [ ] Add emoji picker to messages
- [ ] Mobile responsiveness testing
- [ ] Performance optimization (Lighthouse 90+)
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## 📝 Quick Notes

- All API clients already exist in `src/lib/api/` ✅
- All types already exist in `src/types/` ✅
- WebSocket gateways ready (Messages ✅, Notifications ✅, Support ⏳)
- Backend is complete (v1.1.6, 484 tests) ✅
- No TypeScript errors ✅

**Launch Blockers:** All Complete! ✅✅✅

**Summary:**

- ✅ 7/7 Feature Areas Complete
- ✅ All Critical Tasks Done
- ✅ All High Priority Tasks Done
- ✅ All Medium Priority Tasks Done
- ✅ All Low Priority Tasks Done
- 🎯 Ready for Polish & Testing Phase
