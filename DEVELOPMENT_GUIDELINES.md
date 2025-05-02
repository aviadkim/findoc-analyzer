# FinDoc Analyzer Development Guidelines

## Overview

This document outlines the development guidelines and best practices for the FinDoc Analyzer project. Following these guidelines will ensure consistency, maintainability, and quality across the codebase.

## UI/UX Guidelines

### Design System

1. **Always use the modern UI framework** - All new UI components must follow the modern design system with the dark sidebar, card-based layout, and consistent styling.
2. **Never revert to old designs** - Once a page has been updated to the modern UI, it should never be reverted to the old design.
3. **Maintain consistency** - Use the same components, colors, and spacing across all pages to ensure a consistent user experience.
4. **Mobile-first approach** - Design for mobile first, then scale up to larger screens.

### Component Structure

1. **Use card-based layouts** - Organize content in cards with proper headers and consistent padding.
2. **Follow the sidebar navigation pattern** - All pages should include the dark sidebar with the same navigation structure.
3. **Use tabs for related content** - When displaying related content, use tabs instead of separate pages.
4. **Implement proper loading states** - Always show loading indicators when fetching data or processing documents.

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

## Tool Usage Guidelines

### GitHub

**Purpose**: Source code management, version control, pull requests, code reviews, and CI/CD integration.

**Usage**:
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

### Linear

**Purpose**: Issue tracking and project management (tasks, bugs, features).

**Usage**:
- Create tickets for all tasks, bugs, and features
- Update ticket status as work progresses
- Link tickets to GitHub pull requests
- Use labels for categorization

**Example Commands**:
- "Create a Linear ticket for this bug"
- "Show my assigned Linear issues"
- "Update the status of this ticket to 'In Progress'"

### Jira

**Purpose**: Advanced issue tracking, sprint planning, and project management for complex workflows.

**Usage**:
- Track detailed tasks and project status
- Manage sprints and releases
- Link tickets to GitHub pull requests
- Use for complex workflows and dependencies

**Example Commands**:
- "Show me all my assigned Jira tickets"
- "Create a Jira ticket for this bug"
- "Update the status of PROJ-123 to 'In Progress'"

### Notion

**Purpose**: Team documentation, meeting notes, specs, and knowledge base.

**Usage**:
- Store project documentation and specifications
- Document meeting notes and decisions
- Create and share knowledge base articles
- Reference documentation in code comments

**Example Commands**:
- "Find Notion pages about our API documentation"
- "Show me the technical specs for the payment system"

### Confluence

**Purpose**: Collaborative documentation and knowledge management.

**Usage**:
- Store comprehensive project documentation
- Document processes and procedures
- Share knowledge across teams
- Keep documentation up to date

**Example Commands**:
- "Summarize our Confluence page on microservice architecture"
- "Find information about our release process in Confluence"
- "Update our onboarding docs to explain how we use the system"

### Supabase

**Purpose**: Backend as a service—database, authentication, and real-time APIs.

**Usage**:
- Store and retrieve application data
- Implement user authentication and authorization
- Create and manage database schemas
- Implement real-time features

**Example Commands**:
- "Query the Supabase database for user data"
- "Update the user profile in Supabase"
- "Show me the schema for the orders table"

## Best Practices for Reducing Mistakes

1. **Always sync and index the latest codebase** before making changes
2. **Request summaries or explanations** before applying large changes
3. **Use task tracking tools** (Linear/Jira) for all bugs, features, and TODOs
4. **Retrieve documentation** from Notion/Confluence before coding new features or fixing bugs
5. **Leverage GitHub** for code reviews and version control
6. **Use Supabase queries** for data operations, not manual database edits

## Development Workflow

1. **Create a ticket** in Linear or Jira for the task
2. **Create a branch** in GitHub for the task
3. **Implement the changes** following the guidelines
4. **Write tests** for the changes
5. **Open a pull request** for code review
6. **Address review comments** and update the PR
7. **Merge the PR** once approved
8. **Update the ticket** status in Linear or Jira

## Deployment Process

1. **Merge changes** to the main branch
2. **Run tests** to ensure everything works
3. **Build the application** for production
4. **Deploy to staging** for final testing
5. **Deploy to production** once verified

## Conclusion

Following these guidelines will ensure a consistent, maintainable, and high-quality codebase for the FinDoc Analyzer project. If you have any questions or suggestions, please discuss them with the team.
