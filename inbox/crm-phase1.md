# SimpleCRM – Phase 1 Kickoff

*Based on SimpleCRM BRD v2.1*

## Scope

Phase 1 focuses on delivering the core CRM functionality within the first 3 months:

### Features

1. **Contact & Company Management** – Add, edit, delete contacts and companies with custom fields (name, email, phone, company, status, industry, region).
2. **Visual Sales Pipeline** – Kanban-style deal board with draggable stages, deal value, expected close date, and deal owner.
3. **Activity Tracking** – Schedule calls, meetings, and follow-ups linked to contacts/deals with reminders and overdue alerts.
4. **Basic Dashboards** – Pipeline value by stage, deal count, conversion rates, and sales rep performance.
5. **Email Sync** – Two-way email integration with Outlook/Gmail; log emails against contacts and deals.
6. **Mobile Access** – Responsive web UI for on-the-go usage.

### Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: OAuth 2.0 / OIDC
- **Hosting**: Azure App Service

### Acceptance Criteria

- [ ] Users can create, edit, and search contacts and companies
- [ ] Deals can be created and moved through pipeline stages via drag-and-drop
- [ ] Activities can be scheduled with calendar sync
- [ ] Dashboard shows real-time pipeline metrics
- [ ] Emails are synced and visible on contact/deal records
- [ ] UI is usable on mobile devices
