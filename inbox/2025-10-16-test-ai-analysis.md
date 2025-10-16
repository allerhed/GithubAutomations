---
type: intake
source: test-ai-model
intent: "Test GitHub Models AI analysis with multiple items"
---

# AI Model Analysis Test - Multi-Item Intake

This document contains various types of work items to test the AI-powered issue generation.

---

## 1) Bug: Memory Leak in WebSocket Handler

**Environment**
- Production, Node.js 22.x
- WebSocket library: ws v8.14.2
- Observed on Linux containers

**Issue**
Memory usage grows continuously when WebSocket connections are established and closed rapidly. Heap snapshots show retained event listeners.

**Steps to Reproduce**
1. Start the application
2. Open 100 WebSocket connections
3. Close all connections
4. Repeat 10 times
5. Check memory usage - it grows by ~50MB each cycle

**Expected Behavior**
Memory should be released when connections close. Usage should remain stable.

**Root Cause (suspected)**
Event listeners not properly cleaned up in `src/websocket/handler.ts`

**Acceptance Criteria**
- [ ] Memory leak fixed - no growth after connection cycles
- [ ] Add test that verifies listener cleanup
- [ ] Update error handling to ensure cleanup on exceptions
- [ ] Document cleanup pattern in CONTRIBUTING.md

**Labels**: bug, critical, performance, backend

---

## 2) Feature: Dark Mode Support

**Context**
Users have requested a dark mode option for the dashboard. Analytics show 40% of users access the app during evening hours.

**Requirements**
- System preference detection (prefers-color-scheme)
- Manual toggle in user settings
- Persist preference per user
- Smooth transition animation (200ms)
- Support for both light/dark themes across all components

**Design Notes**
- Use CSS custom properties for theme colors
- Color palette provided by design team in Figma
- Ensure WCAG AA contrast ratios in both modes

**Acceptance Criteria**
- [ ] Theme toggle in user settings menu
- [ ] Respects OS/browser dark mode preference
- [ ] All pages and components support both themes
- [ ] User preference saved to database
- [ ] Smooth 200ms transition between themes
- [ ] Unit tests for theme logic
- [ ] Visual regression tests for key pages

**Labels**: enhancement, frontend, ui, user-request

---

## 3) Feature: Email Notification Preferences

**Context**
Users report receiving too many notifications. We need granular control over email preferences.

**Proposed Solution**
Add notification preferences page where users can control:
- Daily digest vs real-time
- Event types (mentions, replies, updates, system alerts)
- Frequency limits (max emails per day)
- Quiet hours (no emails during specified time range)

**Technical Notes**
- Store preferences in `user_notification_prefs` table
- Update email service to check preferences before sending
- Add queue throttling based on frequency limits
- Respect time zones for quiet hours

**Acceptance Criteria**
- [ ] New preferences page at `/settings/notifications`
- [ ] Backend API for CRUD operations on preferences
- [ ] Email service respects all preference settings
- [ ] Default preferences applied for new users
- [ ] Migration script for existing users
- [ ] E2E tests for notification delivery

**Labels**: enhancement, backend, email, user-experience

---

## 4) Documentation: API Authentication Guide

**Issue**
Our API authentication documentation is outdated and missing examples for OAuth2 flows.

**Required Updates**
1. Update authentication overview
2. Add OAuth2 authorization code flow examples
3. Add OAuth2 client credentials flow examples
4. Document rate limiting per auth method
5. Add troubleshooting section for common errors
6. Include example requests with curl and multiple languages (Python, JavaScript, Go)

**Acceptance Criteria**
- [ ] Updated `docs/api/authentication.md` with all sections
- [ ] Code examples tested and working
- [ ] Screenshots of OAuth consent screen
- [ ] Link from main README
- [ ] Review by API team

**Labels**: documentation, api

---

## 5) Bug: Race Condition in Order Processing

**Severity**: High
**Affected Service**: Payment processor

**Description**
When two webhooks arrive simultaneously for the same order, the system sometimes processes payment twice, resulting in duplicate charges.

**Technical Details**
- Race condition in `services/orders/processor.ts`
- Missing transaction isolation
- No idempotency key validation

**Reproduction**
Difficult to reproduce consistently, but happens ~1% of the time in production under high load.

**Proposed Fix**
- Add database-level locking using `SELECT ... FOR UPDATE`
- Implement idempotency key tracking
- Add retry logic with exponential backoff

**Acceptance Criteria**
- [ ] Transaction isolation implemented
- [ ] Idempotency key system added
- [ ] Load test confirms no duplicates under high concurrency
- [ ] Monitoring alert for duplicate detection
- [ ] Incident playbook updated

**Labels**: bug, critical, payments, backend

---

## 6) Chore: Upgrade Dependencies

**Context**
Multiple dependencies are outdated and have security vulnerabilities flagged by Dependabot.

**Items to Upgrade**
- Express: 4.18.2 → 4.19.2
- React: 18.2.0 → 18.3.1
- TypeScript: 5.2.2 → 5.6.2
- Jest: 29.5.0 → 29.7.0
- ESLint: 8.50.0 → 9.10.0

**Acceptance Criteria**
- [ ] All dependencies upgraded
- [ ] All tests pass
- [ ] No breaking changes or migrations needed
- [ ] Update CHANGELOG.md
- [ ] Security scan shows no high/critical vulnerabilities

**Labels**: maintenance, dependencies, security
