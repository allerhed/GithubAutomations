# GithubAutomations

Automation tools for managing GitHub issues and pull requests.

## Overview

This repository contains automation scripts and tools for streamlining GitHub workflow management, including:

- Automated PR reporting and tracking
- Issue management utilities
- GitHub API integrations
- Rate limit monitoring
- **Workflow Automation System**: Advanced CRM workflow automation for SimpleCRM

## Features

- **PR Reports**: Generate comprehensive pull request reports with automated tracking
- **Documentation**: Detailed setup guides and API documentation
- **Utilities**: Helper functions for version management and GitHub operations
- **Workflow Automations**: Complete workflow automation system with 8 pre-built templates, custom builder API, and comprehensive trigger/action system for automating repetitive sales tasks

## Project Structure

```
/docs           - Documentation and setup guides
/inbox          - Incoming requirements and specifications
/reports        - Generated PR reports
/src            - Source code and utilities
  /utils        - Utility functions
  /workflows    - Workflow automation system
```

## Getting Started

See [PR Report Setup](docs/pr-report-setup.md) for configuration and usage instructions.

## Documentation

- [API Rate Limits](docs/api/rate-limits.md)
- [PR Report Setup](docs/pr-report-setup.md)
- **[Workflow Automation Guide](docs/workflow-automation.md)** - Complete guide to workflow automation
- **[Workflow Automation Quick Start](docs/workflow-automation-quickstart.md)** - Get started in 5 minutes

## Workflow Automation

The Workflow Automation system enables automated task execution for CRM operations:

### Quick Start

```typescript
import { workflowManager } from './src/workflows';

// Use a pre-built template
const workflow = workflowManager.createFromTemplate(
  'template_deal_won_followup',
  'user123'
);
```

### Features
- 8 pre-built templates for common scenarios
- Custom workflow builder with fluent API
- 8+ trigger types (deal changes, new contacts, time-based, etc.)
- 7 action types (schedule activities, send emails, update fields, etc.)
- Conditional logic for precise control
- Execution tracking and statistics

### Available Templates
1. Deal Won Follow-up
2. Deal Stage Progression
3. New Lead Auto-Assignment
4. Stale Deal Alert
5. Proposal Sent Follow-up
6. Meeting Preparation
7. Lost Deal Analysis
8. High-Value Deal Monitoring

See the [full documentation](docs/workflow-automation.md) for detailed usage instructions.
