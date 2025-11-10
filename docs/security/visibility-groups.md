# Visibility Groups

## Overview

Visibility Groups in SimpleCRM provide fine-grained control over data access, allowing organizations to restrict which users can view specific deals, contacts, and companies. This feature complements the role-based access control system by enabling horizontal data segmentation based on teams, territories, business units, or custom criteria.

## Purpose

Visibility Groups solve several business needs:
- **Data Privacy**: Ensure sensitive deals or accounts are only visible to authorized personnel
- **Territory Management**: Restrict sales reps to their assigned geographic or industry territories
- **Team Isolation**: Prevent different teams from seeing each other's pipeline data
- **Compliance**: Meet regulatory requirements for data access restrictions
- **Performance**: Reduce data clutter by showing users only relevant information

## Key Concepts

### Visibility Group

A named collection of users that defines who can access specific data records. Each group has:
- **Name**: Descriptive identifier (e.g., "North America Sales Team", "Enterprise Accounts")
- **Members**: List of users who belong to the group
- **Access Level**: What group members can do with the data (view, edit, delete)
- **Type**: Automatic vs. Manual membership

### Visibility Rules

Rules determine which records are visible to which groups:
- **Owner-Based**: Record is visible to the owner and their visibility groups
- **Shared-With**: Record is explicitly shared with specific groups
- **Hierarchical**: Managers inherit visibility of their team members' records
- **Public**: Record is visible to all users (no restrictions)

### Access Levels

When a record is shared with a visibility group, members can have different access levels:
- **View Only**: Can see the record but cannot edit or delete
- **Edit**: Can view and modify the record
- **Full**: Can view, edit, delete, and share the record

## Use Cases

### 1. Geographic Territory Management

**Scenario**: Sales organization divided by regions (North America, EMEA, APAC)

**Implementation**:
- Create visibility groups: "North America Sales", "EMEA Sales", "APAC Sales"
- Assign sales reps to their respective regional groups
- Set rule: Deals/Contacts automatically assigned to owner's region group
- Result: Sales reps only see opportunities in their territory

### 2. Account Segmentation

**Scenario**: Separate teams handling SMB vs. Enterprise accounts

**Implementation**:
- Create visibility groups: "SMB Team", "Enterprise Team"
- Define automatic rule: Companies with >500 employees → Enterprise Team visibility
- Define automatic rule: Companies with ≤500 employees → SMB Team visibility
- Result: Each team focuses on their account segment without cross-contamination

### 3. Confidential Deals

**Scenario**: High-value or sensitive deals need restricted access

**Implementation**:
- Create visibility group: "Strategic Accounts Team"
- Mark sensitive deals as private (default visibility: owner only)
- Manually share with "Strategic Accounts Team" (view only for analysts, full for managers)
- Result: Only need-to-know personnel can access sensitive information

### 4. Project-Based Teams

**Scenario**: Cross-functional team working on a major account

**Implementation**:
- Create temporary visibility group: "Project Phoenix Team"
- Add members from sales, marketing, and support
- Share related deals, contacts, and companies with the group (edit access)
- After project completion, archive the group
- Result: Seamless collaboration across departments for project duration

### 5. Management Hierarchy

**Scenario**: Managers need visibility into their team's activities

**Implementation**:
- Create visibility groups per team: "Team Alpha", "Team Beta"
- Enable hierarchical visibility: Managers automatically see all team member records
- Set rule: Direct reports' records automatically visible to their manager
- Result: Managers have full oversight while maintaining peer isolation

## Implementation Architecture

### Database Schema

```sql
-- Visibility Groups table
CREATE TABLE visibility_groups (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('manual', 'automatic') DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true
);

-- Group Membership table
CREATE TABLE group_members (
    id UUID PRIMARY KEY,
    group_id UUID REFERENCES visibility_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    added_by UUID REFERENCES users(id),
    UNIQUE(group_id, user_id)
);

-- Record Visibility table (for deals, contacts, companies)
CREATE TABLE record_visibility (
    id UUID PRIMARY KEY,
    record_type ENUM('deal', 'contact', 'company', 'activity'),
    record_id UUID NOT NULL,
    group_id UUID REFERENCES visibility_groups(id) ON DELETE CASCADE,
    access_level ENUM('view', 'edit', 'full') DEFAULT 'view',
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    INDEX idx_record_lookup (record_type, record_id),
    INDEX idx_group_lookup (group_id),
    UNIQUE(record_type, record_id, group_id)
);

-- Automatic Visibility Rules table
CREATE TABLE visibility_rules (
    id UUID PRIMARY KEY,
    group_id UUID REFERENCES visibility_groups(id) ON DELETE CASCADE,
    record_type ENUM('deal', 'contact', 'company'),
    condition_field VARCHAR(100),
    condition_operator ENUM('equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in_list'),
    condition_value TEXT,
    access_level ENUM('view', 'edit', 'full') DEFAULT 'view',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

#### Group Management

```
POST   /api/v1/visibility-groups              Create new group
GET    /api/v1/visibility-groups              List all groups
GET    /api/v1/visibility-groups/:id          Get group details
PUT    /api/v1/visibility-groups/:id          Update group
DELETE /api/v1/visibility-groups/:id          Delete group (Admin only)
```

#### Group Membership

```
POST   /api/v1/visibility-groups/:id/members  Add member to group
DELETE /api/v1/visibility-groups/:id/members/:userId  Remove member
GET    /api/v1/visibility-groups/:id/members  List group members
```

#### Record Sharing

```
POST   /api/v1/records/:type/:id/share        Share record with group
DELETE /api/v1/records/:type/:id/share/:groupId  Revoke group access
GET    /api/v1/records/:type/:id/visibility   Get record visibility settings
```

### Query Authorization

All data queries must filter by visibility. Example for fetching deals:

```sql
-- Pseudo-SQL for authorized deal query
SELECT d.* FROM deals d
WHERE 
    -- User is the owner
    d.owner_id = :current_user_id
    OR
    -- User's groups have access
    EXISTS (
        SELECT 1 FROM record_visibility rv
        INNER JOIN group_members gm ON rv.group_id = gm.group_id
        WHERE rv.record_type = 'deal'
          AND rv.record_id = d.id
          AND gm.user_id = :current_user_id
    )
    OR
    -- Hierarchical visibility (manager sees team deals)
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = d.owner_id
          AND u.manager_id = :current_user_id
    )
    OR
    -- Deal is marked as public
    d.visibility = 'public'
```

### Performance Optimization

1. **Indexed Lookups**: Create composite indexes on (record_type, record_id, group_id)
2. **Cached Group Membership**: Cache user's group memberships in session/JWT
3. **Materialized Views**: For frequently accessed queries, use materialized views
4. **Lazy Loading**: Only check visibility when accessing sensitive fields
5. **Bulk Operations**: Batch visibility checks when loading lists

## Configuration

### Admin Settings

Admins can configure global visibility behavior:

```json
{
  "default_visibility": "private",
  "hierarchical_visibility_enabled": true,
  "allow_user_sharing": true,
  "max_groups_per_user": 10,
  "require_group_for_new_records": false,
  "audit_visibility_changes": true
}
```

### User Preferences

Users can set personal visibility defaults:

```json
{
  "default_deal_visibility": "private",
  "default_contact_visibility": "team",
  "auto_share_with_groups": ["My Sales Team"],
  "notification_on_share": true
}
```

## User Interface

### Group Management UI

Admin interface for creating and managing groups:
- **Group List**: Table showing all groups with member counts and activity status
- **Group Editor**: Form to create/edit group name, description, type
- **Member Management**: Add/remove users, view member list with roles
- **Rule Builder**: Visual interface to create automatic visibility rules

### Sharing UI

User interface for sharing records:
- **Share Button**: On deal/contact/company detail page
- **Share Dialog**: 
  - Search/select visibility groups
  - Set access level (view/edit/full)
  - Add optional note about why sharing
  - Preview who will gain access
- **Visibility Indicator**: Badge showing which groups can access the record
- **Access Log**: History of who shared with whom and when

### List Filtering

Filter records by visibility:
- **My Records**: Only owned by me
- **Shared with Me**: Explicitly shared via groups
- **Team Records**: Visible through team/hierarchical visibility
- **All Accessible**: Everything I can see (combined view)

## Security Considerations

### Access Control

1. **Authorization Layer**: All database queries must go through visibility filter
2. **API Security**: Every endpoint must verify user has permission to access data
3. **No Direct IDs**: Never expose raw database IDs in URLs without auth check
4. **Group Privacy**: Users can only see groups they're members of (except Admins)

### Audit Logging

Log all visibility-related events:
- Group creation/modification/deletion
- Member additions/removals
- Record sharing grants/revocations
- Access level changes
- Visibility rule modifications

### Compliance

1. **Data Segregation**: Ensure complete isolation between visibility groups
2. **Access Reviews**: Quarterly review of group memberships and record sharing
3. **Principle of Least Privilege**: Default to most restrictive visibility
4. **Right to Deletion**: Ensure record deletion removes all visibility grants
5. **Data Export**: Include visibility metadata in compliance exports

## Best Practices

### For Administrators

1. **Start Restrictive**: Begin with private-by-default, gradually open as needed
2. **Review Regularly**: Audit group memberships quarterly
3. **Clean Up**: Archive inactive groups and remove ex-employees
4. **Document Groups**: Maintain clear descriptions of each group's purpose
5. **Monitor Performance**: Track query performance impact of visibility checks

### For Managers

1. **Minimal Groups**: Create only necessary groups to avoid complexity
2. **Clear Naming**: Use descriptive names that indicate purpose
3. **Review Sharing**: Periodically review what's shared with your groups
4. **Educate Team**: Ensure team understands visibility and sharing protocols
5. **Temporary Access**: Use temporary groups for projects, archive when done

### For Users

1. **Default Private**: Keep deals private unless collaboration needed
2. **Share Judiciously**: Only share with groups that need access
3. **Check Before Sharing**: Verify who's in a group before sharing
4. **Set Access Levels**: Use view-only when editing isn't required
5. **Remove Sharing**: Revoke group access when no longer needed

## Testing Requirements

### Functional Tests

1. Test that users can only see records they should have access to
2. Test hierarchical visibility (managers seeing team records)
3. Test automatic rule assignment to visibility groups
4. Test access level enforcement (view vs. edit vs. full)
5. Test sharing and unsharing workflows

### Security Tests

1. Attempt to access records outside visibility scope (should fail)
2. Try to enumerate records via ID brute force (should fail)
3. Test privilege escalation attempts via group manipulation
4. Verify API endpoints respect visibility constraints
5. Test SQL injection resistance in visibility queries

### Performance Tests

1. Measure query time with visibility filters on large datasets
2. Test pagination performance with visibility constraints
3. Benchmark group membership lookup caching
4. Load test concurrent visibility rule evaluation
5. Profile memory usage of visibility checking layer

## Migration Strategy

### Phase 1: Foundation (Weeks 1-2)
- Deploy database schema
- Implement core visibility group CRUD operations
- Build admin UI for group management
- Create default groups based on existing teams

### Phase 2: Integration (Weeks 3-4)
- Add visibility filters to all data queries
- Implement sharing UI for deals, contacts, companies
- Deploy hierarchical visibility for managers
- Train administrators on group management

### Phase 3: Automation (Weeks 5-6)
- Build automatic visibility rules engine
- Create rule templates for common scenarios
- Implement performance optimizations (caching, indexes)
- Monitor and tune query performance

### Phase 4: Rollout (Weeks 7-8)
- Enable visibility groups for pilot teams
- Gather feedback and adjust configurations
- Full rollout to all users
- Conduct post-deployment security audit

## Troubleshooting

### Common Issues

**Issue**: User can't see records they should have access to
- **Check**: Verify user is member of correct visibility groups
- **Check**: Confirm record is shared with user's groups
- **Check**: Ensure hierarchical visibility is enabled if expecting manager access

**Issue**: Query performance degradation after visibility implementation
- **Solution**: Add database indexes on visibility tables
- **Solution**: Enable group membership caching
- **Solution**: Use materialized views for complex visibility queries

**Issue**: Visibility groups not updating in real-time
- **Solution**: Clear application cache
- **Solution**: Verify cache invalidation on group membership changes
- **Solution**: Check database replication lag

## Future Enhancements

1. **Dynamic Groups**: Auto-add users based on criteria (e.g., all users in Sales role)
2. **Time-Limited Sharing**: Automatic expiration of group access
3. **Share Approval Workflow**: Require manager approval for certain sharing
4. **Visibility Analytics**: Track which groups access which records
5. **Cross-Organization Visibility**: Share with external partners/customers
6. **Field-Level Visibility**: Hide sensitive fields based on group membership
7. **Smart Suggestions**: AI-powered recommendations for sharing
