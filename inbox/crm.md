# **SimpleCRM – Business Requirements Document (BRD)**

*Version 2.0 | Prepared for Internal Use*

## **1. Purpose**

The goal of SimpleCRM is to create a user-friendly, sales-driven customer relationship management tool that enables our sales and marketing teams to manage contacts, leads, deals and activities efficiently — with minimal technical complexity. The emphasis is on visual clarity, automation of repetitive tasks, and easy collaboration across teams.

---

## **2. Key Objectives**

1. Provide a **visual sales pipeline** where deals can be moved through stages easily.
2. Automate repetitive workflows to reduce manual work and free sales team to focus on selling.
3. Centralise all customer and lead data — contacts, companies, deals, activities — in one place.
4. Offer **customisable dashboards and reports** so management can monitor performance and forecast revenues.
5. Provide **seamless integrations** with email, calendar, and other business tools to avoid duplication of work.
6. Enable **lead generation & qualification** from website and other channels (forms, chats) to feed the pipeline.
7. Maintain solid **data security and user permissions** to protect sensitive information.
8. Support mobile or remote access so team members can update and review on the go.

---

## **3. Target Users**

* **Sales Representatives** – use the CRM day-to-day, update deals, follow up on contacts, use templates, get reminders.
* **Sales Managers** – monitor pipeline health, set team goals, review dashboards and forecasts.
* **Marketing Team** – use the CRM to capture leads from website forms/chat, review where leads come from, feed into pipeline.
* **Executives / Leadership** – view high-level metrics, forecast future revenue, understand sales bottlenecks.

---

## **4. Functional Requirements**

### **4.1. Contact, Lead & Company Management**

* Ability to add, edit, delete contacts and companies; store key fields such as name, title, company, email, phone, address, status.
* Ability to convert leads into contacts/deals; track lead source.
* Associate multiple contacts with a company.
* Quick search, filter and view of contacts/companies by status, owner, custom fields.
* Custom fields for contacts, companies and leads to reflect our business needs (e.g., industry, region, lead channel).

### **4.2. Deals / Opportunities / Pipeline Management**

* Visual pipeline (kanban-style) of deals: each deal shown in a stage and can be dragged/moved to next stage. ([TechRepublic][1])
* For each deal capture: deal value, expected close date, deal owner (sales rep), associated contact/company, deal stage.
* Ability for “rotten deal” alerts if a deal has stalled in a stage for too long. ([TechHarry - Software That Helps!][2])
* Ability to customise pipeline stages to match our sales process. ([TechHarry - Software That Helps!][2])
* Ability to set deal probability or scoring (optional) to prioritise deals.

### **4.3. Activities, Tasks & Reminders**

* Ability to schedule calls, meetings, emails, follow-ups; link activity to contact and/or deal.
* Reminders/notifications for upcoming activities.
* Sync with calendar (e.g., Outlook, Google) and email accounts. ([Pipedrive][3])
* Mark activity as completed; track overdue items.

### **4.4. Email & Communication Integration**

* Two-way email sync: send, receive, log emails within the system. ([Pipedrive][3])
* Use email templates and personalized email messaging to speed up sales outreach. ([TechHarry - Software That Helps!][2])
* Track when recipients open emails or click links (i.e., engagement tracking) — if feasible.
* Record communication history at the contact and deal level for visibility.

### **4.5. Lead Capture & Generation**

* Website web-forms or chat widgets to capture inbound leads; automatically feed into CRM. ([Pipedrive Support][4])
* Integration/usage of tools for lead prospecting (outbound lead lists) and web visitor tracking. ([Pipedrive][5])
* Ability to quickly assign new leads to appropriate sales reps based on defined rules (e.g., geography, product line).

### **4.6. Automation & Workflow**

* Define workflow automations: e.g., when a deal moves stage, then schedule activity, send email, update field. ([Pipedrive][6])
* Automate reminders, follow-ups, lead assignment, status changes to reduce manual tasks.
* Ability to select from pre-built workflow templates or build custom flows. ([Pipedrive][6])

### **4.7. Dashboards, Reporting & Forecasting**

* Visual dashboards showing pipeline value, deal count by stage, conversion rates, sales rep performance, winning/losing deals. ([TechRepublic][1])
* Forecasting of revenue based on weighted deals, expected close dates. ([Pipedrive][3])
* Export options (CSV/Excel) for further analysis in other tools.
* Ability for managers to set team goals and monitor progress against them.

### **4.8. Customisation & Integrations**

* Custom fields for contacts, deals, companies to match our business specifics. ([Pipedrive][7])
* Customisable pipelines, stages, activity types, views. ([TechHarry - Software That Helps!][2])
* Integration/Marketplace support with other tools: email (Gmail/Outlook), calendar, Slack/Teams, accounting, project management, etc. ([Pipedrive][5])
* Ability to import/export data (CSV) during setup/migration.

### **4.9. Permissions, Roles & Security**

* Define user roles (Admin, Manager, Sales Rep, Marketing) with appropriate access levels.
* Visibility groups: restrict which deals, contacts, or companies a user/team can view. ([Pipedrive][7])
* Two-factor authentication (2FA) and secure login. ([Pipedrive][3])
* Compliance with common standards (e.g., SOC 2) and encrypted data storage (e.g., AES-256). ([Pipedrive][3])

### **4.10. Mobile & Accessibility**

* Mobile app or mobile-optimised web access so sales team can use on the go. ([Pipedrive][3])
* Same access to pipeline/deals/contacts/activities as desktop version.

**📱 See detailed mobile implementation plans:**
- [Mobile Access Specification](../docs/mobile-access-specification.md) - Complete mobile strategy and features
- [Mobile Implementation Guide](../docs/mobile-implementation-guide.md) - Technical implementation details
- [Mobile Access Checklist](../docs/mobile-access-checklist.md) - Implementation progress tracking

---

## **5. Non-Functional Requirements**

* **Ease of Use**: Interface must be intuitive enough for non-technical users to adopt quickly; minimal training.
* **Performance**: Pages and operations should respond within ~2 seconds for typical usage.
* **Scalability**: Must support our anticipated user base (initially say up to 50 users, scalable to 200).
* **Availability & Reliability**: Target at least 99% uptime; appropriate backup and disaster recovery.
* **Security & Privacy**: Meet industry standards for data protection; encrypted at rest & in transit.
* **Customisability & Extendibility**: The system must be configurable without heavy coding.
* **Localization & Multi-Currency**: At minimum English; ability to support other languages or currencies may be required in future.
* **Integration readiness**: Should support via APIs or marketplace to link with our other systems.

---

## **6. Success Metrics**

* At least 75% of sales reps log into SimpleCRM daily and update at least one deal each day.
* Reduction in missed follow-ups by the sales team by 30% within 6 months of rollout.
* Manager dashboards provide actionable insights such that decision time for pipeline review reduces by 50%.
* Lead response time (from capture to first contact) decreases by 20%.
* User satisfaction score for the tool (survey) of ≥ 4.0 / 5 after 3 months of use.

---

## **7. Future Enhancements (Phase 2+)**

* AI-based suggestions (e.g., which deals to prioritise, next best actions) — similar to Pipedrive’s “Sales Assistant”. ([Pipedrive][5])
* Built-in marketing campaign automation (email drip campaigns, segmentation).
* Project management module linked to deals (post-sales servicing).
* Lead scoring models based on behaviour/engagement.
* Chatbot/live chat embedded on website to feed leads into CRM.
* API layer for deeper custom integrations and in-house development.

---

## **8. Assumptions & Constraints**

* The system will be cloud-hosted (Software as a Service) for ease of deployment and maintenance.
* Initial user count is moderate (under 100), but we plan growth.
* Data migration from existing spreadsheets/CRM will be required and must be planned.
* Budget constraints: must choose core features for initial release; some advanced features may be add-ons or later phases.
* Stakeholders are non-technical; so the interface and workflows must be highly intuitive.

---

## **9. Stakeholder Roles**

* **Business Owner / Sponsor**: Ensures alignment with business strategy and approves budgets.
* **Sales Manager**: Defines sales process, pipeline stages, KPIs; provides user feedback.
* **Marketing Manager**: Defines lead capture process, source tracking, analytics.
* **IT/Operations**: Oversees integration, security, deployment, user provisioning.
* **End-users (Sales Reps)**: Provide daily usage and feedback on workflows, usability.

---

## **10. Timeline & Phases (High Level)**

* **Phase 1 (0-3 months)**: Core CRM: contacts/companies, deals, visual pipeline, activities, basic dashboards, email sync, mobile access.
* **Phase 2 (3-6 months)**: Lead capture (forms/chat), workflow automations, customisations, integrations.
* **Phase 3 (6-12 months)**: Advanced reporting/forecasting, AI suggestions, marketing automation, post-sales/project module.
