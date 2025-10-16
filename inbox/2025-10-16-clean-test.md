---
type: intake
source: clean-test
intent: "Clean test after fixing duplicate code"
---

# Clean Test - Should Work Now

Testing after removing duplicate code.

---

## 1) Bug: Database Connection Pool Exhaustion

**Description**: Application runs out of database connections under load.

**Fix**: Increase pool size and implement connection timeout.

**Acceptance Criteria**:
- [ ] Pool size increased to 50
- [ ] Connection timeout set to 30s
- [ ] Monitoring added
- [ ] Load test passes

**Labels**: bug, database, performance, critical

---

## 2) Feature: User Avatar Support

**Description**: Allow users to upload and display profile pictures.

**Requirements**:
- Image upload (JPG, PNG, max 2MB)
- Automatic resizing and optimization
- Default avatars for new users

**Acceptance Criteria**:
- [ ] Upload UI implemented
- [ ] Image processing pipeline
- [ ] CDN integration
- [ ] Default avatar set

**Labels**: enhancement, frontend, user-profile
