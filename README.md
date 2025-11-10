# GithubAutomations

Automation tools for managing GitHub issues and pull requests, with comprehensive API integration support for CRM systems.

## Overview

This repository contains automation scripts and tools for streamlining GitHub workflow management, including:

- Automated PR reporting and tracking
- Issue management utilities
- GitHub API integrations
- Rate limit monitoring
- **CRM API Integration**: Complete API support for data import/export and third-party integrations

## Features

- **PR Reports**: Generate comprehensive pull request reports with automated tracking
- **Documentation**: Detailed setup guides and API documentation
- **Utilities**: Helper functions for version management and GitHub operations
- **API Integration**: RESTful API for CRM data management and third-party tool integrations
  - Data import/export (contacts, companies, deals)
  - Email integration (Gmail, Outlook, Exchange)
  - Calendar sync (Google Calendar, Outlook Calendar)
  - Accounting software integration (QuickBooks, Xero, FreshBooks)
  - Project management tools (Asana, Trello, Jira, Monday.com)

## Project Structure

```
/config         - Configuration files (rate limits, API settings)
/docs           - Documentation and setup guides
/examples       - Integration code examples
/inbox          - Incoming requirements and specifications
/reports        - Generated PR reports
/src            - Source code and utilities
  /api          - API endpoints and types
    /endpoints  - Data and integration endpoints
```

## Getting Started

See [PR Report Setup](docs/pr-report-setup.md) for configuration and usage instructions.

For API integration, see the [API Integration Guide](docs/api/integration-guide.md).

## API Documentation

- **[API Integration Guide](docs/api/integration-guide.md)** - Complete guide to using the CRM API
- **[API Reference](docs/api/reference.md)** - Detailed endpoint documentation
- [API Rate Limits](docs/api/rate-limits.md) - Rate limiting information
- [PR Report Setup](docs/pr-report-setup.md) - PR automation setup

## Quick Start - API Integration

```typescript
import { importData, configureEmailIntegration } from './src/api';

// Import contacts
const result = await importData({
  type: 'contacts',
  data: [
    {
      id: 'c1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'lead',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]
});

// Configure email integration
await configureEmailIntegration({
  provider: 'gmail',
  enabled: true,
  syncEnabled: true,
});
```

See [examples/integrations.ts](examples/integrations.ts) for more examples.
