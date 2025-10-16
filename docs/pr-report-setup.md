# PR Report Workflow Setup

The PR Report workflow scans all your repositories for open pull requests and generates a detailed markdown report.

## Setup Instructions

By default, the workflow only has access to this repository. To scan **all 46 of your repositories**, you need to provide a Personal Access Token (PAT):

### 1. Create a Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "PR Report Scanner"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### 2. Add the Token as a Repository Secret

1. Go to your repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `PAT_TOKEN`
4. Value: Paste the token you copied
5. Click "Add secret"

### 3. Run the Workflow

1. Go to the Actions tab
2. Select "Generate PR Report"
3. Click "Run workflow"
4. Optionally enable "Include draft PRs"
5. The report will be saved in the `reports/` folder

## What Gets Scanned

With the PAT token configured, the workflow will scan:
- All repositories you own
- All repositories where you're a collaborator
- All repositories in organizations you're a member of

## Report Contents

For each PR found, the report includes:
- Title, number, and URL
- Author
- Creation and update dates
- Description (first 500 characters)
- Code changes (+additions / -deletions)
- Labels
- Review status
- List of changed files (collapsible)
- Draft PR indicator

## Troubleshooting

**"Only 1 repository scanned"**: You need to add the PAT_TOKEN secret (see above)

**"No repositories found"**: Check that your PAT has the `repo` scope

**"No PRs found"**: Make sure "Include draft PRs" is enabled if you have draft PRs
