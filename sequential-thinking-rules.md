# Sequential Thinking Development Rules

## Core Principle
All complex development tasks must be approached using the Sequential Thinking methodology to ensure thorough analysis, proper planning, and high-quality implementation.

## Required Steps for Every Development Task

1. **Initial Problem Analysis**
   - Break down the problem into clear, manageable components
   - Identify dependencies and relationships between components
   - Document assumptions and constraints

2. **Sequential Planning**
   - Create numbered thought steps that build upon each other
   - Estimate the total number of thoughts needed
   - Revise the plan as understanding deepens

3. **Implementation Strategy**
   - For each component, create a detailed implementation plan
   - Identify potential issues and fallback strategies
   - Document decision points and rationale

4. **Testing Approach**
   - Define test cases for each component
   - Plan for integration testing between components
   - Establish success criteria for each test

5. **Documentation**
   - Document the sequential thinking process
   - Capture key insights and decision points
   - Create guidelines for future maintenance

## Document Processing Workflow Rules

1. **OCR and Document Analysis**
   - All document processing must use the enhanced OCR capabilities
   - Table extraction must use the established pipeline (Camelot, Table Transformer)
   - Metadata extraction must follow the standardized approach

2. **UI Consistency**
   - All new pages must follow the dashboard UI design pattern
   - Use the same color scheme, typography, and component styles
   - Maintain consistent navigation and user flow

3. **Agent Integration**
   - Document processing must integrate with all relevant agents
   - Agents must have access to processed document data
   - Agent responses must be properly formatted and displayed

## Implementation Example

```
Thought 1: First, I need to understand the document processing requirements.
Thought 2: The document processing workflow involves OCR, table extraction, and metadata extraction.
Thought 3: I need to ensure the UI is consistent with the dashboard design.
Thought 4: The agents need to be integrated with the document processing workflow.
Thought 5: I need to test the entire workflow to ensure it works as expected.
```

## Enforcement

- All pull requests must include documentation of the sequential thinking process
- Code reviews must verify that the sequential thinking approach was followed
- Regular team meetings will include discussion of sequential thinking best practices

## Benefits

- More thorough problem analysis
- Better planning and implementation
- Reduced bugs and issues
- Improved code quality and maintainability
- Consistent approach across the team
