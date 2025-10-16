---
type: intake
source: final-test
intent: "Final validation of GitHub Models AI workflow"
---

# Final Test - GitHub Models Integration

Small focused test to validate the corrected API integration.

---

## 1) Bug: Login Cookie Expiration

**Severity**: Medium

**Issue**: User sessions expire after 1 hour instead of the configured 24 hours, forcing frequent re-authentication.

**Root Cause**: Cookie `max-age` set incorrectly in auth middleware.

**Acceptance Criteria**:
- [ ] Session cookies persist for 24 hours
- [ ] Sliding expiration on activity
- [ ] Test covers session lifecycle

**Labels**: bug, authentication, backend

---

## 2) Feature: Bulk User Import

**Request**: Administrators need to import multiple users from CSV.

**Requirements**:
- CSV upload with validation
- Preview before import
- Error handling for duplicates
- Email notifications to new users

**Acceptance Criteria**:
- [ ] CSV parser with validation
- [ ] Preview UI shows parsed data
- [ ] Duplicate detection and handling
- [ ] Batch email sending
- [ ] Import history log

**Labels**: enhancement, admin, import
