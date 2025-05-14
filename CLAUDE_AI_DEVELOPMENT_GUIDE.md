# FinDoc Analyzer - Claude AI Development Guide

## Introduction

This guide provides comprehensive instructions for using Claude's MCPs (Multi-Capability Processors) to accelerate development of the FinDoc Analyzer project. Claude's advanced AI capabilities combined with these specialized tools allow for streamlined development, testing, and deployment.

## Available MCPs & Capabilities

### Research & Information MCPs
1. **Web Search & Fetch MCPs**
   - **Web Search**: Performs internet searches for real-time information
   - **Web Fetch**: Retrieves full content from specific URLs
   - **Brave Web Search (2 tools)**: Alternative search engine with different indexing
   - **Brave Local Search**: Location-based search for businesses and services

2. **Google Drive MCPs**
   - **Google Drive Search**: Searches content across user's Drive files
   - **Google Drive Fetch**: Directly retrieves content from specific documents

3. **Gmail MCPs**
   - **Read Gmail Profile**: Gets user email profile information
   - **Search Gmail Messages**: Finds relevant emails with search options
   - **Read Gmail Thread**: Views complete email conversations

4. **Google Calendar MCPs**
   - **List GCal Calendars**: Shows available calendars
   - **List GCal Events**: Retrieves calendar events with filtering
   - **Fetch GCal Event**: Gets details of specific events
   - **Find Free Time**: Identifies available time slots across calendars

### Development & Coding MCPs
5. **Code Execution MCPs**
   - **Execute Python**: Runs Python code with full standard library
   - **REPL (Analysis Tool)**: JavaScript execution environment
   - **Artifacts**: Creates and manages code artifacts, charts, and documents

6. **GitHub MCPs (26 tools)**
   - **Search Repositories/Code/Issues/Users**: Find resources in GitHub
   - **Repository Management**: Create/fork repositories and manage branches
   - **File Operations**: Get/create/update files in repositories
   - **Issue & PR Management**: Create/update issues and pull requests
   - **Review & Merge**: Manage PR reviews and merges

7. **Desktop Commander MCPs (18 tools)**
   - **File Operations**: Read/write/list/search/move files on local system
   - **Directory Management**: Create/list directories
   - **Command Execution**: Run terminal commands
   - **Process Management**: List/terminate running processes
   - **Configuration Management**: Get/set system configurations

8. **Playwright MCPs (@automatalabs-mcp-server-playwright - 10 tools)**
   - **Browser Automation**: Advanced browser control and testing
   - **Element Interaction**: Programmatic control of web interfaces
   - **Screenshot Capture**: Visual documentation of web interfaces
   - **Testing**: Automated testing of web applications

### Project Management MCPs
9. **Linear MCPs (19 tools)**
   - **Issues Management**: Create/update/list issues
   - **Projects Management**: Create/update/list projects
   - **Comments Management**: Add/list comments on issues
   - **Teams & Users**: List team members and user information
   - **Documentation Search**: Search Linear documentation

10. **Atlassian MCPs (25 tools)**
    - **Jira**: Create/edit/search issues, manage transitions, add comments
    - **Confluence**: Create/edit pages, manage spaces, add comments
    - **User Management**: User lookup and account identification

11. **Asana MCP**
    - **Task Management**: Create/update/list tasks
    - **Project Management**: Manage projects and timelines
    - **Team Collaboration**: Manage team workflows

12. **Notion MCP**
    - **Document Management**: Create/edit documents and databases
    - **Knowledge Base**: Maintain structured documentation
    - **Collaboration**: Team knowledge sharing and documentation

13. **Riza MCP (1 tool)**
    - **Custom Integration**: Specialized tool for specific workflows

14. **Git MCP (4 tools)**
    - **Version Control**: Additional git implementation
    - **Code Management**: Repository management and code handling

15. **BackV2 MCP (4 tools)**
    - **Project-Specific Tools**: Custom tools for FinDoc Analyzer development
    - **Integration Points**: Direct connection to project components

### Monitoring & Analysis MCPs
16. **Sentry MCPs (16 tools, 1 resource, 1 prompt)**
    - **Organization Management**: List organizations and teams
    - **Project Management**: List projects and releases
    - **Issue Tracking**: List/summarize/detail issues
    - **Error & Transaction Search**: Find and analyze errors and transactions
    - **Fix Generation**: Analyze and fix issues with AI

17. **Cloudflare MCPs (13 tools + 7 debug tools + 1 additional tool)**
    - **Account Management**: List/manage Cloudflare accounts
    - **Integration Analysis**: Manage Cloudflare One integrations
    - **Asset Management**: Search/list/manage assets and categories
    - **DNS Management**: Analyze DNS reports and settings
    - **Zone Management**: List/get details for Cloudflare zones
    - **Web Tools**: Get HTML content, screenshots, and Markdown conversions

### Browser Automation MCPs
18. **Browser Cloudflare MCPs (5 tools)**
   - **Navigation**: Browse to URLs
   - **Interaction**: Click elements, fill forms, select options, hover
   - **Element Selection**: Target elements by CSS selectors or text content
   - **JavaScript Execution**: Run custom scripts in browser
   - **Screenshot Capture**: Take full or element-specific screenshots
   - **URL Fetching**: Retrieve content from websites with options

19. **Fetcher MCPs (2 tools)**
   - **Web Content Retrieval**: Fetch content from web resources
   - **URL Processing**: Process and extract data from URLs

### Additional MCPs
20. **Intercom MCP**
    - **Customer Messaging**: Manage customer communication
    - **Support Tickets**: Handle support requests

21. **Plaid MCP**
    - **Financial Data**: Access financial account information
    - **Transaction Data**: Process financial transactions

22. **Brightdata MCP**
    - **Web Data Collection**: Advanced web scraping
    - **Data Processing**: Processing collected web data

23. **Zapier MCP**
    - **Workflow Automation**: Connect with various web services
    - **Integration**: Automate workflows across tools

## Core Development Philosophy

When developing with Claude and its MCPs, we follow these core principles:
1. **Task Specialization**: Use the right MCP for the specific development task
2. **Automation First**: Automate repetitive processes whenever possible
3. **Documentation Driven**: Maintain comprehensive documentation alongside code
4. **Incremental Improvement**: Build and test in small, meaningful increments
5. **Test Throughout**: Integrate testing at every stage of development

## MCP Usage Strategy

### 1. Research & Planning Phase

#### Web Research Tools
Use web search/fetch MCPs to:
- Research latest financial document processing techniques
- Find existing libraries for OCR, table detection, and financial analysis
- Stay updated on regulatory requirements for financial data handling
- Explore UI/UX best practices for financial applications

**Example Workflow:**
```
1. Use Web Search: "latest OCR techniques financial documents 2025"
2. Fetch detailed content from relevant results
3. Document findings in project documentation
4. Use findings to inform development priorities
```

#### Atlassian Integration
Use Atlassian MCPs to:
- Document project specifications in Confluence
- Create task tickets in Jira for new features
- Track development progress across sprints
- Create technical documentation for team reference

**Example Workflow:**
```
1. Create new Confluence page for feature specification
2. Document requirements, mockups, and acceptance criteria
3. Create corresponding Jira tickets with appropriate epics and stories
4. Link Jira tickets to Confluence documentation
```

#### Linear Project Management
Use Linear MCPs for:
- Agile development workflow management
- Feature prioritization and roadmap development
- Bug tracking and issue management
- Milestone tracking for release management

**Example Workflow:**
```
1. Create new issues for each component of a feature
2. Assign issues to appropriate team members
3. Track progress through development stages
4. Document completion criteria and testing requirements
```

### 2. Code Development Phase

#### GitHub Code Management
Use GitHub MCPs to:
- Search existing code for reference implementations
- Create and manage feature branches
- Commit and push code changes
- Review and merge pull requests

**Example Workflow:**
```
1. Create new branch for feature development
2. Search existing code for similar patterns
3. Commit incremental changes with clear messages
4. Create PR with detailed description of changes
5. Review and merge code after testing
```

#### Python/JavaScript Execution
Use Code Execution MCPs to:
- Test financial algorithms before implementation
- Prototype data extraction techniques
- Validate document processing logic
- Benchmark performance of different approaches

**Example Workflow:**
```
1. Prototype new ISIN extraction algorithm
2. Test against sample data
3. Compare accuracy with existing implementation
4. Refine algorithm based on results
5. Document final approach for implementation
```

#### Local File System Integration
Use Desktop Commander MCPs to:
- Manage local development files
- Execute build and test scripts
- Search across codebase for specific implementations
- Analyze log files for debugging

**Example Workflow:**
```
1. Search for implementation patterns across codebase
2. Execute test scripts with direct command access
3. Analyze test output logs for errors
4. Modify files based on findings
```

### 3. Testing & Quality Assurance Phase

#### Sentry Error Monitoring
Use Sentry MCPs to:
- Track errors in development and production
- Analyze performance bottlenecks
- Prioritize bug fixes based on impact
- Generate automatic fix suggestions

**Example Workflow:**
```
1. Monitor Sentry for new issues during testing
2. Analyze issue details and context
3. Use issue fix generation for suggested solutions
4. Implement and verify fixes
```

#### Browser Automation
Use Browser MCPs (Playwright/Cloudflare Browser) to:
- Automate UI testing of web application
- Capture screenshots for documentation
- Validate user flows and interactions
- Test form submissions and document uploads

**Example Workflow:**
```
1. Navigate to document upload page
2. Fill form fields with test data
3. Submit form and capture response
4. Verify processing completion
5. Capture screenshots of results for documentation
```

#### Analysis Tools
Use REPL/Analysis MCPs to:
- Analyze complex financial data
- Generate test data sets
- Validate document processing results
- Create data visualizations for reports

**Example Workflow:**
```
1. Load test financial document data
2. Extract key metrics and validate against expected values
3. Generate visualization of extraction accuracy
4. Document findings for improvement
```

### 4. Documentation & Knowledge Management Phase

#### Document Management
Use Google Drive MCPs to:
- Store and retrieve project documentation
- Collaborate on specification documents
- Track project timelines and milestones
- Share test results and analysis

**Example Workflow:**
```
1. Search for existing documentation on similar features
2. Fetch documents for reference
3. Create new documentation based on implementation
4. Share documentation with team for feedback
```

#### Email Communication
Use Gmail MCPs to:
- Track project communications
- Find relevant discussions about features
- Document decision-making processes
- Ensure team alignment on objectives

**Example Workflow:**
```
1. Search for emails regarding feature requirements
2. Retrieve full thread of discussions
3. Document key decisions from communications
4. Update project documentation accordingly
```

### 5. Deployment & Monitoring Phase

#### Cloudflare Integration
Use Cloudflare MCPs to:
- Configure DNS for application deployment
- Monitor website performance
- Manage security settings
- Track asset dependencies

**Example Workflow:**
```
1. Check DNS settings for deployment
2. Analyze asset categories for application
3. Monitor deployment performance
4. Verify security configurations
```

## MCP Integration Patterns for FinDoc Analyzer

### 1. Document Processing Pipeline

Implement a comprehensive document processing pipeline using these MCPs:
1. **Desktop Commander**: Handle local file operations for document processing
2. **Python Execution**: Run OCR and table extraction algorithms
3. **Sentry**: Track processing errors and exceptions
4. **Browser**: Test document upload and processing UI
5. **GitHub**: Manage code for processing algorithms

**Integration Pattern:**
```
User Upload → Browser Automation Test → 
Python Processing → Error Tracking with Sentry → 
Results Validation → Documentation Update
```

### 2. Financial Analysis Workflow

Implement financial analysis capabilities using:
1. **REPL/Analysis**: Prototype and test financial algorithms
2. **GitHub**: Manage analysis code components
3. **Linear**: Track development of analysis features
4. **Browser**: Test financial visualization components
5. **Sentry**: Monitor performance of analysis algorithms

**Integration Pattern:**
```
Analysis Requirement (Linear) → Algorithm Prototyping (REPL) → 
Implementation (GitHub) → UI Testing (Browser) → 
Performance Monitoring (Sentry)
```

### 3. Documentation & Knowledge System

Create a comprehensive documentation system using:
1. **Atlassian**: Create and maintain technical documentation
2. **Google Drive**: Store working documents and specifications
3. **GitHub**: Document code with proper comments and README files
4. **Browser**: Capture screenshots for visual documentation
5. **Gmail**: Track discussion threads for reference

**Integration Pattern:**
```
Research (Web Search) → Specification (Google Drive) → 
Technical Documentation (Confluence) → 
Code Documentation (GitHub) → Visual Guides (Browser)
```

### 4. Testing & Quality Assurance

Implement a robust QA system using:
1. **Browser Automation**: UI testing
2. **Desktop Commander**: File-based testing
3. **Python/JavaScript Execution**: Unit and integration testing
4. **Sentry**: Error tracking and analysis
5. **Linear**: Bug tracking and management

**Integration Pattern:**
```
Test Planning (Linear) → Automated Testing (Browser/Python) → 
Error Analysis (Sentry) → Bug Documentation (Linear) → 
Fix Verification (Browser/Python)
```

## Feature-Specific MCP Implementation Guidelines

### 1. Enhanced Analytics Visualizations

To implement drill-down functionality and comparative visualizations:

**MCPs to Use:**
- **REPL/Analysis**: Prototype visualization algorithms
- **Browser**: Test visualization rendering and interactions
- **GitHub**: Manage visualization component code
- **Python Execution**: Generate test data for visualizations
- **Brave Web Search**: Research visualization best practices

**Implementation Steps:**
1. Research visualization libraries using Brave Web Search
2. Prototype visualization components using REPL/Analysis
3. Implement components in codebase using GitHub
4. Test interactive elements using Browser Automation
5. Document usage patterns in Confluence

### 2. Document Comparison Feature

To implement side-by-side comparison with diff highlighting:

**MCPs to Use:**
- **Python Execution**: Test diff algorithms
- **Browser**: Test comparison UI
- **Desktop Commander**: Handle test documents
- **GitHub**: Manage comparison code
- **Linear**: Track feature development

**Implementation Steps:**
1. Create feature tickets in Linear
2. Test diff algorithms using Python Execution
3. Implement comparison UI components
4. Test with sample documents using Browser Automation
5. Document the comparison feature in Confluence

### 3. Advanced Security Extraction

To enhance ISIN detection and implement security pricing lookups:

**MCPs to Use:**
- **Python Execution**: Test extraction algorithms
- **Web Search/Fetch**: Research security identifiers
- **Sentry**: Monitor extraction accuracy
- **GitHub**: Manage extraction code
- **Linear**: Track development progress

**Implementation Steps:**
1. Research ISIN formats using Web Search
2. Prototype extraction algorithm with Python Execution
3. Test algorithm against sample documents
4. Implement and deploy extraction code
5. Monitor accuracy using Sentry

### 4. User Documentation

To create comprehensive guides and tutorials:

**MCPs to Use:**
- **Atlassian**: Create documentation structure
- **Browser**: Capture screenshots and workflows
- **Google Drive**: Store documentation drafts
- **Linear**: Track documentation tasks
- **Web Search**: Research documentation best practices

**Implementation Steps:**
1. Create documentation plan in Confluence
2. Capture application workflows with Browser Automation
3. Draft user guides with screenshots
4. Implement in-app help features
5. Publish documentation through appropriate channels

## MCP Selection Decision Tree

Use this decision tree to determine which MCP to use for specific tasks:

```
1. Are you researching information?
   → Use Web Search, Web Fetch, or Brave Search

2. Are you working with code?
   → If Python: Use Python Execution
   → If JavaScript: Use REPL/Analysis
   → If managing code: Use GitHub MCPs
   → If working locally: Use Desktop Commander

3. Are you managing tasks?
   → If agile workflow: Use Linear
   → If documentation: Use Atlassian
   → If email communication: Use Gmail

4. Are you testing?
   → If UI testing: Use Browser/Playwright
   → If algorithm testing: Use Python/JavaScript Execution
   → If monitoring errors: Use Sentry

5. Are you deploying?
   → If web configuration: Use Cloudflare
   → If monitoring: Use Sentry
```

## FinDoc Analyzer Specific MCP Applications

### BackV2 Custom Integration (4 tools)

The BackV2 MCP is specifically designed for the FinDoc Analyzer project and provides:

1. **Documentation Search**: Find relevant documentation within the project files
2. **Code Search**: Locate specific implementations in the codebase
3. **URL Content Fetching**: Retrieve external references mentioned in documentation
4. **GitHub Repository Search**: Search within the aviadkim/backv2-main repository

Use BackV2 MCP as the primary starting point for any development work on FinDoc Analyzer. It provides context-aware assistance specifically for this project.

**Usage Guidelines:**
- Always start new features by searching for similar implementations with BackV2
- Reference documentation using BackV2 before writing new code
- Use BackV2 to understand project architecture and coding patterns
- Prioritize BackV2 MCP over generic search when looking for project-specific information

### FinDoc-Specific Desktop Commander Usage

When working with the FinDoc Analyzer repository structure:

1. **Document Processing Files**:
   - Use Desktop Commander to examine document test files
   - Analyze OCR results in output directories
   - Modify processing parameters for better results

2. **Frontend Component Testing**:
   - Examine component structure with file listing
   - Modify UI components for testing
   - Search for pattern implementations across components

3. **Backend Agent Development**:
   - Analyze agent implementations
   - Test agent scripts directly
   - Modify agent parameters for optimization

**Example Command Workflow for Agent Development:**
```
1. Search for existing agent implementations
2. Read agent code to understand patterns
3. Execute test scripts for existing agents
4. Modify agent parameters for testing
5. Write updated agent implementation
6. Run integration tests with new agent
```

## Best Practices for Claude AI Development

### Code Development
1. **Specification First**: Always clearly define what you're building before writing code
2. **Incremental Development**: Build and test in small chunks
3. **Consistent Patterns**: Use consistent design patterns across the codebase
4. **Thorough Documentation**: Document code as it's developed
5. **Automated Testing**: Create tests alongside feature development

### Documentation
1. **Structured Documentation**: Organize by feature/component
2. **Visual Elements**: Include screenshots and diagrams
3. **Code Examples**: Provide usage examples for components
4. **Version Tracking**: Maintain documentation versions alongside code
5. **Accessibility**: Ensure documentation is accessible to all team members

### Testing
1. **Test Plan**: Create a test plan before implementation
2. **Coverage**: Test all critical paths and edge cases
3. **Automation**: Automate repetitive tests
4. **Documentation**: Document test cases and results
5. **Regression**: Perform regression testing after changes

### Communication
1. **Clear Tasks**: Define clear, actionable tasks
2. **Regular Updates**: Provide regular progress updates
3. **Technical Details**: Include relevant technical details
4. **Blockers**: Communicate blockers promptly
5. **Documentation**: Document decisions and rationales

## MCP Authentication & Security

### API Key Management
1. Store API keys securely, never in code repositories
2. Use environment variables for local development
3. Use GitHub secrets for CI/CD pipelines
4. Rotate keys regularly according to security policy
5. Limit API key permissions to only what's needed

### Access Control
1. Follow principle of least privilege for all integrations
2. Document access requirements for each MCP
3. Regularly audit access permissions
4. Remove unused integrations promptly
5. Maintain a registry of active integrations

## Troubleshooting Guide

### Common MCP Issues

1. **Authentication Failures**
   - Verify API keys are correct and not expired
   - Check access permissions for the specific operation
   - Verify service is available and not experiencing downtime

2. **Rate Limiting**
   - Implement exponential backoff for retries
   - Batch operations when possible to reduce API calls
   - Cache results when appropriate to avoid redundant calls

3. **Data Format Issues**
   - Validate input data before sending to APIs
   - Handle unexpected response formats gracefully
   - Document expected data formats for each integration

4. **Integration Timeouts**
   - Set appropriate timeout values for each operation
   - Implement circuit breakers for failing services
   - Create fallback mechanisms for critical operations

## FinDoc Analyzer Development Workflows

### 1. New Feature Development

**Step 1: Planning**
- Create Linear issue for feature (Linear MCP)
- Research similar implementations (Brave Search MCP)
- Document requirements in Confluence (Atlassian MCP)

**Step 2: Implementation**
- Create feature branch (GitHub MCP)
- Develop component implementation (Desktop Commander MCP)
- Test locally (Python/JavaScript Execution MCP)

**Step 3: Testing**
- Create automated tests (Playwright MCP)
- Verify all test cases pass (Desktop Commander MCP)
- Monitor for errors (Sentry MCP)

**Step 4: Documentation**
- Create user documentation (Atlassian MCP)
- Capture screenshots of feature (Browser MCP)
- Document code with clear comments (GitHub MCP)

**Step 5: Deployment**
- Create pull request (GitHub MCP)
- Review and approve changes (GitHub MCP)
- Monitor deployment (Sentry/Cloudflare MCPs)

### 2. Bug Fix Workflow

**Step 1: Identification**
- Locate error reports (Sentry MCP)
- Create bug ticket (Linear MCP)
- Document reproduction steps (Atlassian MCP)

**Step 2: Investigation**
- Search for relevant code (GitHub/BackV2 MCPs)
- Analyze error contexts (Sentry MCP)
- Test reproduction locally (Desktop Commander MCP)

**Step 3: Resolution**
- Create fix branch (GitHub MCP)
- Implement fix (Desktop Commander MCP)
- Verify fix locally (Python/JavaScript Execution MCP)

**Step 4: Testing**
- Create automated test for regression (Playwright MCP)
- Verify fix resolves issue (Browser MCP)
- Document fix approach (Atlassian MCP)

**Step 5: Deployment**
- Create pull request with fix (GitHub MCP)
- Review and approve changes (GitHub MCP)
- Monitor fixed functionality (Sentry MCP)

### 3. Document Processing Enhancement

**Step 1: Research**
- Investigate OCR techniques (Brave Search MCP)
- Analyze current performance (Desktop Commander MCP)
- Document improvement approach (Atlassian MCP)

**Step 2: Prototyping**
- Create prototype algorithm (Python Execution MCP)
- Test with sample documents (Desktop Commander MCP)
- Benchmark against current implementation (REPL MCP)

**Step 3: Implementation**
- Implement enhanced algorithm (GitHub MCP)
- Create test suite for validation (Desktop Commander MCP)
- Integrate with existing pipeline (GitHub MCP)

**Step 4: Validation**
- Test with diverse document set (Desktop Commander MCP)
- Measure accuracy improvements (Python Execution MCP)
- Document performance metrics (Atlassian MCP)

**Step 5: Deployment**
- Create pull request with enhancement (GitHub MCP)
- Review performance metrics (GitHub MCP)
- Monitor production performance (Sentry MCP)

## Conclusion

This comprehensive guide provides a structured approach to leveraging Claude AI and its MCPs for developing the FinDoc Analyzer project. By following these guidelines, development teams can maximize productivity, maintain high code quality, and deliver a robust financial document analysis platform.

Remember that MCP usage should always align with project objectives and development best practices. Regularly review and update these guidelines as new MCPs become available and as project requirements evolve.
