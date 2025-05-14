# FinDoc Analyzer UI Components Visual Demo

This document provides a visual demonstration of how the FinDoc Analyzer UI components appear in the application, specifically focusing on the PDF processing workflow and chatbot interaction.

## Upload Page with Process Button

When a user visits the upload page, they will see:

1. The standard file upload form
2. A new "Process Document" button next to the upload button
3. A chat button in the bottom-right corner

```
+------------------------------------------+
|                                          |
|  Upload Financial Document               |
|                                          |
|  [Select File] [Upload] [Process Doc]    |
|                                          |
|                                          |
|                                          |
|                                          |
|                                 [Chat]   |
+------------------------------------------+
```

## PDF Processing Flow

Once a document is uploaded and the "Process Document" button is clicked:

1. The UI shows a loading indicator
2. Processing status updates appear in real-time
3. When complete, user is redirected to document details page

```
+------------------------------------------+
|                                          |
|  Processing Document...                  |
|                                          |
|  [==============>    ] 65%               |
|                                          |
|  Status: Extracting tables from PDF      |
|                                          |
|                                          |
|                                 [Chat]   |
+------------------------------------------+
```

## Document Details Page

After processing, the document details page shows:

1. Document metadata and extracted information
2. A visualization of the detected tables
3. Financial data summary

```
+------------------------------------------+
|                                          |
|  Document: investment_report.pdf         |
|                                          |
|  Extracted Tables: 3                     |
|  ISIN Codes: 12                          |
|  Financial Entities: 7                   |
|                                          |
|  [Table 1: Portfolio Summary]            |
|  +------+------------+--------+          |
|  | ISIN | Security   | Value  |          |
|  +------+------------+--------+          |
|  | ...  | ...        | ...    |          |
|  +------+------------+--------+          |
|                                          |
|                                 [Chat]   |
+------------------------------------------+
```

## Chat Interface for Document Questions

When the Chat button is clicked:

1. A chat interface appears in the right side of the screen
2. User can ask questions about the document
3. AI responds with answers based on the document content

```
+------------------------------------------+
|                                          |
|  Document: investment_report.pdf         |  +--------------+
|                                          |  | Chat         |
|  [Table data shown here...]              |  |              |
|                                          |  | How many     |
|                                          |  | stocks are   |
|                                          |  | in this      |
|                                          |  | portfolio?   |
|                                          |  |              |
|                                          |  | The portfolio|
|                                          |  | contains 15  |
|                                          |  | stocks with  |
|                                          |  | a total value|
|                                          |  | of $1.2M     |
|                                          |  |              |
|                                          |  | [Type msg]   |
+------------------------------------------+  +--------------+
```

## Agent Cards Display

On test and dashboard pages, agent cards are displayed:

1. Cards show available AI agents
2. Each card has an icon, description, and status
3. Users can click to configure or use each agent

```
+------------------------------------------+
|                                          |
|  Available Agents                        |
|                                          |
|  +------------+  +------------+          |
|  | 📊         |  | 📝         |          |
|  | Financial  |  | Document   |          |
|  | Analyzer   |  | Comparator |          |
|  |            |  |            |          |
|  | [Configure]|  | [Configure]|          |
|  +------------+  +------------+          |
|                                          |
|  +------------+  +------------+          |
|  | 🔍         |  | 📋         |          |
|  | ISIN       |  | Table      |          |
|  | Extractor  |  | Detector   |          |
|  |            |  |            |          |
|  | [Configure]|  | [Configure]|          |
|  +------------+  +------------+          |
|                                          |
|                                 [Chat]   |
+------------------------------------------+
```

## Login Component

On the login page:

1. Clean, modern login form with Google login option
2. Remember me checkbox and forgot password link
3. Sign-up option for new users

```
+------------------------------------------+
|                                          |
|          FinDoc Analyzer Login           |
|                                          |
|  Email:    [                  ]          |
|  Password: [                  ]          |
|                                          |
|  [x] Remember me  [Forgot Password?]     |
|                                          |
|  [       Log In        ]                 |
|                                          |
|  [   Continue with Google   ]            |
|                                          |
|  Don't have an account? Sign Up          |
|                                          |
+------------------------------------------+
```

## How the Components Work Together

When using the application:

1. Users start by logging in with the enhanced Login Component
2. They navigate to the Upload page and see the Process Button Component
3. After uploading and processing, they view document details
4. They can click the Chat Button Component to ask questions about the document
5. On test pages, they see the Agent Cards Component showing available AI tools

This integrated experience provides a seamless workflow for document analysis with intuitive UI components guiding the user at each step.