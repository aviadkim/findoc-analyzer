# FinDoc Analyzer - Connected Tools Guidelines

## Overview

This document outlines the guidelines for using the connected tools in the FinDoc Analyzer project. Following these guidelines will ensure consistency, maintainability, and quality across the codebase.

## Connected Tools

### GitHub

**Purpose**: Source code management, version control, pull requests, code reviews, and CI/CD integration.

**Usage Guidelines**:
- Create a new branch for each feature or bug fix
- Open pull requests for code reviews
- Use meaningful commit messages
- Keep branches up to date with the main branch
- Use GitHub Actions for CI/CD

**Example Commands**:
- "Create a new branch for this feature"
- "Open a pull request for the latest changes"
- "Show me the recent commits"
- "Generate a commit message for these changes"
- "Sync the code with GitHub"
- "Review the code in this pull request"
- "Check for merge conflicts"
- "Deploy the code using GitHub Actions"

### Linear

**Purpose**: Issue tracking and project management (tasks, bugs, features).

**Usage Guidelines**:
- Create tickets for all tasks, bugs, and features
- Update ticket status as work progresses
- Link tickets to GitHub pull requests
- Use labels for categorization

**Example Commands**:
- "Fix TES-1"
- "Create Linear tickets for these TODOs"
- "Help me triage these new bug reports"
- "Show my assigned Linear issues"

### Jira

**Purpose**: Advanced issue tracking, sprint planning, and project management for complex workflows.

**Usage Guidelines**:
- Track detailed tasks and project status
- Manage sprints and releases
- Link tickets to GitHub pull requests
- Use for complex workflows and dependencies

**Example Commands**:
- "Show me all my assigned Jira tickets"
- "Create a Jira ticket for this bug"
- "Update the status of PROJ-123 to 'In Progress'"
- "Create a PR to fix SOF-123"

### Notion

**Purpose**: Team documentation, meeting notes, specs, and knowledge base.

**Usage Guidelines**:
- Store project documentation and specifications
- Document meeting notes and decisions
- Create and share knowledge base articles
- Reference documentation in code comments

**Example Commands**:
- "Find Notion pages about our API documentation"
- "Show me the technical specs for the payment system"
- "What outstanding tasks are left from yesterday's team meeting?"

### Confluence

**Purpose**: Collaborative documentation and knowledge management.

**Usage Guidelines**:
- Store comprehensive project documentation
- Document processes and procedures
- Share knowledge across teams
- Keep documentation up to date

**Example Commands**:
- "Summarize our Confluence page on microservice architecture"
- "Find information about our release process in Confluence"
- "Update our onboarding docs to explain how we use Bazel"

### Supabase

**Purpose**: Backend as a service—database, authentication, and real-time APIs.

**Usage Guidelines**:
- Store and retrieve application data
- Implement user authentication and authorization
- Create and manage database schemas
- Implement real-time features

**Example Commands**:
- "Query the Supabase database for user data"
- "Update the user profile in Supabase"
- "Show me the schema for the orders table"

## Best Practices for Reducing Mistakes and Managing Memory

1. **Always sync and index the latest codebase** before making changes
   - "Sync with GitHub and update my workspace"

2. **Request summaries or explanations** before applying large changes
   - "Summarize what will change if you refactor this module"

3. **Use task tracking tools** (Linear/Jira) for all bugs, features, and TODOs
   - "Create a Linear ticket for this TODO"
   - "Log this bug in Jira"

4. **Retrieve documentation** from Notion/Confluence before coding new features or fixing bugs
   - "Find Confluence docs on authentication best practices"

5. **Leverage GitHub** for code reviews and version control
   - "Open a pull request and request review from the team"

6. **Use Supabase queries** for data operations, not manual database edits
   - "Query the Supabase database for user data"

## UI/UX Guidelines

1. **Always use the modern UI framework** - All new UI components must follow the modern design system with the dark sidebar, card-based layout, and consistent styling.
2. **Never revert to old designs** - Once a page has been updated to the modern UI, it should never be reverted to the old design.
3. **Maintain consistency** - Use the same components, colors, and spacing across all pages to ensure a consistent user experience.
4. **Mobile-first approach** - Design for mobile first, then scale up to larger screens.

## Code Organization

### Frontend

1. **Separate concerns** - Keep HTML, CSS, and JavaScript in separate files.
2. **Use modular JavaScript** - Create reusable classes and functions for common functionality.
3. **Follow naming conventions** - Use consistent naming for files, classes, and functions.
4. **Document code** - Add comments to explain complex logic and document functions.

### Backend

1. **Use RESTful API design** - Follow REST principles for API endpoints.
2. **Implement proper error handling** - Return appropriate error codes and messages.
3. **Validate input data** - Always validate and sanitize input data.
4. **Use async/await** - Use async/await for asynchronous operations instead of callbacks.

## Handling Large Code Files

When dealing with large code files or complex implementations, follow these guidelines:

1. **Split into smaller modules** - Break down large files into smaller, more manageable modules.
2. **Use incremental implementation** - Implement features incrementally, one step at a time.
3. **Document dependencies** - Clearly document dependencies between modules.
4. **Use MCP for large inputs** - Use Model Context Protocol (MCP) to handle large inputs or complex processing.

## Summary Table

| Tool | Main Use | Example Command |
|------|----------|----------------|
| GitHub | Code, version control, CI/CD | "Create a PR for this branch" |
| Linear | Task/issue tracking | "Show my assigned Linear issues" |
| Jira | Advanced issue/project tracking | "Create a Jira ticket for this bug" |
| Notion | Read-only docs/notes/specs | "Find Notion pages about our API documentation" |
| Confluence | Read/write docs, team knowledge | "Summarize our Confluence page on microservice architecture" |
| Supabase | Database, auth, backend services | "Query the Supabase database for user data" |

By telling the agent to use each tool for its intended purpose—code in GitHub, tasks in Linear/Jira, docs in Notion/Confluence, and data in Supabase—you ensure that your workflow is organized, memory is managed, and mistakes are minimized. Always clarify which tool to use for each request, and leverage the agent's ability to cross-reference and automate across these platforms for maximum efficiency.
