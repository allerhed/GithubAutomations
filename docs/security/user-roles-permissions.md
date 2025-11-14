# User Roles and Permissions

## Overview

SimpleCRM implements a robust role-based access control (RBAC) system to ensure data security and proper authorization across the platform. This document defines the user roles, their permissions, and implementation guidelines.

## User Roles

### 1. Admin

**Description**: Full system access with administrative privileges.

**Permissions**:
- **User Management**: Create, edit, delete users; assign roles; manage permissions
- **System Configuration**: Configure system settings, integrations, custom fields, pipelines
- **Data Access**: Full access to all contacts, companies, deals, and activities across all teams
- **Security Settings**: Configure 2FA policies, session timeouts, IP restrictions
- **Audit Logs**: View all system audit logs and user activity
- **Reports**: Access to all reports and dashboards, including system-wide analytics
- **Billing & Subscription**: Manage subscription, billing, and license allocation
- **Data Management**: Import/export data, manage data retention policies
- **Visibility Groups**: Create and manage visibility groups and access restrictions

**Use Cases**:
- System administrators responsible for overall CRM configuration
- IT personnel managing integrations and security
- Business owners requiring full system oversight

### 2. Manager

**Description**: Supervisory role with access to team data and management tools.

**Permissions**:
- **Team Management**: View and manage team members' data (limited to assigned teams)
- **Data Access**: Full access to all deals, contacts, and companies owned by team members
- **Pipeline Management**: View and manage team pipeline, move deals between stages
- **Goal Setting**: Set and monitor team sales goals and targets
- **Reports & Dashboards**: Access to team performance reports, forecasting, and analytics
- **Activities**: View team activities, tasks, and calendar
- **Lead Assignment**: Assign leads to team members
- **Templates**: Create and manage email templates for team use
- **Workflow Automation**: Create and manage workflows for team processes
- **Custom Fields**: Request custom fields (subject to Admin approval)

**Restrictions**:
- Cannot access deals/contacts/companies outside assigned team visibility
- Cannot modify system-wide settings or user roles
- Cannot access admin-level audit logs or billing information

**Use Cases**:
- Sales managers overseeing sales representatives
- Team leads responsible for pipeline health and team performance
- Department heads monitoring team metrics

### 3. Sales Rep

**Description**: Individual contributor role focused on sales activities.

**Permissions**:
- **Personal Data Access**: Full access to own deals, contacts, and companies
- **Shared Data**: View shared contacts and companies (based on visibility settings)
- **Deal Management**: Create, edit, and manage own deals; move through pipeline stages
- **Contact Management**: Add, edit, and manage contacts and companies
- **Activities**: Schedule, manage, and complete own activities and tasks
- **Email Integration**: Send/receive emails, use templates, track engagement
- **Calendar Sync**: Sync calendar and schedule meetings
- **Mobile Access**: Full mobile app access to own data
- **Lead Capture**: Create leads from web forms, convert to opportunities
- **Personal Dashboard**: View personal performance metrics and pipeline
- **Collaboration**: Comment on shared deals, tag team members

**Restrictions**:
- Cannot view other sales reps' private deals (unless explicitly shared)
- Cannot access team-wide reports or other users' performance data
- Cannot modify system settings, workflows, or templates
- Cannot manage users or assign roles
- Limited to personal and shared visibility groups

**Use Cases**:
- Individual sales representatives managing their pipeline
- Account executives handling specific territories or accounts
- Business development representatives qualifying and converting leads

### 4. Marketing

**Description**: Marketing team role focused on lead generation and campaign management.

**Permissions**:
- **Lead Management**: Create, edit, and manage leads from campaigns
- **Lead Source Tracking**: View and analyze lead sources and conversion data
- **Campaign Analytics**: Access to marketing campaign reports and ROI metrics
- **Contact Database**: View contacts and companies for campaign targeting
- **Lead Assignment**: Assign qualified leads to sales representatives
- **Form & Chat Management**: Create and manage web forms and chat widgets
- **Email Templates**: Create marketing email templates
- **List Segmentation**: Create and manage contact lists for campaigns
- **Integration Access**: Access to marketing tool integrations (email marketing, ads, etc.)
- **Lead Scoring**: View and configure lead scoring models (if implemented)

**Restrictions**:
- Limited access to active deals and pipeline (read-only for lead handoff verification)
- Cannot modify deal stages or values
- Cannot access sales rep performance data
- Cannot modify system-wide settings or user management
- Limited to marketing-specific reports

**Use Cases**:
- Marketing managers running lead generation campaigns
- Marketing operations personnel managing lead flow
- Content marketers tracking campaign effectiveness

## Permission Matrix

| Feature | Admin | Manager | Sales Rep | Marketing |
|---------|-------|---------|-----------|-----------|
| User Management | Full | View Team | View Self | View Self |
| System Settings | Full | None | None | None |
| All Deals | Full | Team Only | Own + Shared | Read-Only |
| All Contacts | Full | Team Only | Own + Shared | Read + Campaign |
| Pipeline Config | Full | View | None | None |
| Team Reports | Full | Team Only | None | None |
| Personal Reports | Full | Full | Own Only | Own Only |
| Goal Setting | Full | Team Only | View Own | View Own |
| Lead Assignment | Full | Team Only | None | Full |
| Workflows | Full | Team Only | View | View |
| Audit Logs | Full | Team Only | None | None |
| 2FA Settings | Full | View Own | View Own | View Own |
| Import/Export | Full | Team Data | Own Data | Lead Data |
| Visibility Groups | Manage | View | View | View |

## Implementation Guidelines

### Role Assignment

1. **Default Role**: New users should be assigned the most restrictive role (Sales Rep) by default
2. **Role Changes**: Only Admins can modify user roles
3. **Multiple Roles**: Users should have only one primary role to avoid permission conflicts
4. **Service Accounts**: API integrations should use dedicated service accounts with minimal required permissions

### Permission Checks

1. **Server-Side Enforcement**: All permissions must be enforced on the backend/API level
2. **UI Restrictions**: Frontend should hide/disable features based on user role for better UX
3. **API Responses**: Filter data returned by APIs based on user permissions
4. **Real-Time Updates**: Permission changes should take effect immediately (no cache invalidation delay)

### Best Practices

1. **Principle of Least Privilege**: Grant minimum permissions necessary for job function
2. **Regular Audits**: Review user roles and permissions quarterly
3. **Offboarding**: Immediately revoke access when users leave the organization
4. **Temporary Access**: Use visibility groups for temporary project-based access
5. **Documentation**: Maintain up-to-date documentation of custom permission configurations

## Security Considerations

1. **Session Management**: Enforce role-based session timeouts (shorter for Admin roles)
2. **Password Policies**: Apply stronger password requirements for Admin and Manager roles
3. **2FA Requirement**: Consider mandatory 2FA for Admin and Manager roles
4. **Audit Logging**: Log all permission changes and role assignments
5. **Privilege Escalation**: Monitor for unusual access patterns indicating privilege escalation attempts

## Testing Requirements

1. **Unit Tests**: Test permission checks for each role and feature combination
2. **Integration Tests**: Verify API endpoints respect role-based access controls
3. **UI Tests**: Ensure unauthorized features are properly hidden/disabled
4. **Security Tests**: Attempt unauthorized access to verify proper denial
5. **Performance Tests**: Ensure permission checks don't significantly impact response times

## Future Enhancements

1. **Custom Roles**: Allow admins to create custom roles with granular permissions
2. **Permission Inheritance**: Implement role hierarchies with inherited permissions
3. **Temporary Permissions**: Time-limited access grants for specific scenarios
4. **Delegation**: Allow managers to temporarily delegate permissions to team members
5. **Multi-Team Access**: Support users belonging to multiple teams with different roles
