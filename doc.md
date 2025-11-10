# Workflow Documentation: `on-push.yml`

## Overview

The `on-push.yml` workflow provides automated AI-powered analysis of intake documents and converts them into actionable GitHub issues. It monitors the `inbox/` directory for new files and uses GitHub Models (GPT-4o) to extract features, bugs, and tasks from documents.

## Workflow Name

**Inbox → AI Analysis & Issue Creation**

## Triggers

The workflow activates on three events:

1. **Push events** - When files are added to the `inbox/**` path
2. **Issues opened** - When new issues are manually created (for auto-assignment)
3. **Pull requests opened** - When new PRs are created (for auto-assignment)

## Permissions

The workflow requires the following permissions:
- `contents: write` - To checkout and read repository files
- `issues: write` - To create and modify issues
- `pull-requests: write` - To modify pull requests
- `models: read` - To access GitHub Models API

## Jobs

### 1. `intake` Job

**Trigger**: Only runs on `push` events

**Purpose**: Analyzes newly added files in the `inbox/` directory and creates GitHub issues from the content.

**Steps**:

#### Step 1: List newly-added inbox files
- Compares the current commit with the previous commit
- Identifies files that were newly added (not modified) under `inbox/**`
- Outputs the count and list of added files

#### Step 2: Install gh-models extension
- Installs the GitHub Models CLI extension
- Only runs if new files were detected
- Enables AI analysis using GPT-4o

#### Step 3: Analyze inbox files and create issues

For each newly added file:

1. **File Reading**
   - Reads the file content (truncates if larger than 100KB)
   - Prepares content for AI analysis

2. **AI Analysis**
   - Uses GitHub Models (GPT-4o) with a specialized system prompt
   - Instructs the AI to act as a software project manager
   - Extracts actionable items (features, bugs, documentation tasks)
   - Returns structured JSON with title, body, and labels

3. **JSON Processing**
   - Handles responses wrapped in markdown code blocks
   - Validates and parses JSON output
   - Extracts issue metadata (title, body, labels)

4. **Issue Creation**
   - Creates GitHub issues with extracted information
   - Adds reference to the source file in the issue body
   - **Auto-assigns Copilot agent** to each created issue
   - Attempts to add suggested labels (skips non-existent labels)

5. **Error Handling**
   - Continues processing if API calls fail
   - Logs detailed debug information
   - Gracefully handles invalid responses

## AI Prompt Strategy

**System Prompt**:
- Role: Expert software project manager
- Task: Parse intake documents and extract actionable items
- Output format: JSON array with structured issue objects
- Required fields: title, body (with summary and acceptance criteria), labels

**User Prompt**:
- Simple instruction to analyze the document
- Extracts all actionable items as separate GitHub issues

## Issue Format

Created issues include:
- **Title**: Descriptive title from AI analysis
- **Body**: 
  - Summary section
  - Acceptance criteria (as checklist)
  - Context information
  - Reference to source file
- **Labels**: Automatically suggested (e.g., "enhancement", "bug", "documentation", "backend", "frontend")
- **Assignee**: Copilot agent (automatically assigned)

## Key Features

1. **Automatic Detection**: Only processes newly added files (not modifications)
2. **AI-Powered Analysis**: Uses GPT-4o to understand document structure and intent
3. **Structured Output**: Creates well-formatted issues with acceptance criteria
4. **Copilot Integration**: Automatically assigns Copilot agent to work on issues
5. **Robust Error Handling**: Continues processing if individual files fail
6. **Label Management**: Adds suggested labels, ignores non-existent ones
7. **File Truncation**: Handles large files by truncating to 100KB

## Workflow Behavior

- **Skips empty files**: Files with no content are ignored
- **No duplicate issues**: Only runs on newly added files, not modifications
- **Fail-safe**: Continues processing remaining files if one fails
- **Verbose logging**: Provides detailed debug output for troubleshooting

## Use Case

This workflow is ideal for teams that:
- Receive feature requests or bug reports as documents
- Want to automate issue triage and creation
- Need structured formatting of requirements
- Want AI assistance in breaking down large documents into actionable tasks
- Use GitHub Copilot for issue resolution

## Example Workflow

1. Product manager adds `inbox/feature-requirements.md` to the repository
2. Push triggers the workflow
3. GPT-4o analyzes the document
4. Extracts 5 features and 2 bugs
5. Creates 7 separate GitHub issues with:
   - Clear titles
   - Structured summaries
   - Acceptance criteria checklists
   - Appropriate labels
6. Copilot agent is assigned to all 7 issues
7. Team can immediately start working on prioritized issues
