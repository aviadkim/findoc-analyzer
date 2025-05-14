# FinDoc Analyzer Component Usage Patterns

This document provides practical examples of how to use the FinDoc Analyzer design system components in various contexts and layouts.

## Table of Contents

1. [Page Layout Patterns](#page-layout-patterns)
2. [Dashboard Patterns](#dashboard-patterns)
3. [Form Patterns](#form-patterns)
4. [Financial Data Display Patterns](#financial-data-display-patterns)
5. [Document Processing Patterns](#document-processing-patterns)
6. [Navigation Patterns](#navigation-patterns)

## Page Layout Patterns

### Standard Page Layout

```tsx
import { PageHeader, PageTitle, PageDescription } from "@/design-system/components/layout"

export default function DocumentsPage() {
  return (
    <div className="layout">
      <PageHeader>
        <PageTitle>Documents</PageTitle>
        <PageDescription>
          View and manage your financial documents
        </PageDescription>
      </PageHeader>
      
      <main>
        {/* Page content goes here */}
      </main>
    </div>
  )
}
```

### Two-Column Layout

```tsx
import { PageHeader, PageTitle, PageDescription } from "@/design-system/components/layout"
import { Card } from "@/design-system/components/ui"

export default function AnalysisPage() {
  return (
    <div className="layout">
      <PageHeader>
        <PageTitle>Document Analysis</PageTitle>
        <PageDescription>
          Detailed analysis of your financial document
        </PageDescription>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content area - 2/3 width on desktop */}
        <div className="md:col-span-2">
          <Card>
            {/* Main content */}
          </Card>
        </div>
        
        {/* Sidebar area - 1/3 width on desktop */}
        <div>
          <Card>
            {/* Sidebar content */}
          </Card>
        </div>
      </div>
    </div>
  )
}
```

## Dashboard Patterns

### Dashboard with KPI Cards

```tsx
import { PageHeader, PageTitle } from "@/design-system/components/layout"
import { FinancialCard } from "@/design-system/components/ui"
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="layout">
      <PageHeader>
        <PageTitle>Dashboard</PageTitle>
      </PageHeader>
      
      <div className="dashboard-grid">
        <FinancialCard
          value="$45,231.89"
          trend="up"
          changePercent="+20.1%"
          icon={<DollarSign />}
        >
          Total Assets
        </FinancialCard>
        
        <FinancialCard
          value="$12,543.67"
          trend="down"
          changePercent="-4.5%"
          icon={<TrendingUp />}
        >
          Portfolio Performance
        </FinancialCard>
        
        <FinancialCard
          value="24"
          trend="up"
          changeValue="+3"
          icon={<Users />}
        >
          Active Investments
        </FinancialCard>
        
        <FinancialCard
          value="$1,243.93"
          trend="neutral"
          icon={<CreditCard />}
        >
          Monthly Dividends
        </FinancialCard>
      </div>
      
      {/* Additional dashboard sections */}
    </div>
  )
}
```

### Charts Section

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/design-system/components/ui"
import { Chart } from "@/design-system/components/charts"
import { getChartColors } from "@/design-system/utils"
import { useTheme } from "next-themes"

export function AssetAllocationSection() {
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'
  const chartColors = getChartColors(5, isDarkMode)

  const assetAllocationData = {
    labels: ['Stocks', 'Bonds', 'Real Estate', 'Cash', 'Commodities'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: chartColors,
      },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Chart type="pie" data={assetAllocationData} />
        </div>
      </CardContent>
    </Card>
  )
}
```

## Form Patterns

### Standard Form

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button, 
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/design-system/components/ui"

export function UserProfileForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your account preferences and information</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="form-grid">
          <div className="form-group">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your full name" />
          </div>
          
          <div className="form-group">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Your email address" />
          </div>
          
          <div className="form-group">
            <Label htmlFor="company">Company</Label>
            <Input id="company" placeholder="Company name" />
          </div>
          
          <div className="form-group">
            <Label htmlFor="role">Role</Label>
            <Select>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="user">Regular User</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </CardContent>
      <CardFooter className="form-actions">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
```

### Financial Data Input Form

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter,
  Button, 
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/design-system/components/ui"
import { formatCurrency } from "@/design-system/utils"

export function InvestmentEntryForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Investment</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="form-grid">
          <div className="form-group">
            <Label htmlFor="securityType">Security Type</Label>
            <Select>
              <SelectTrigger id="securityType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="bond">Bond</SelectItem>
                <SelectItem value="etf">ETF</SelectItem>
                <SelectItem value="mutualFund">Mutual Fund</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="form-group">
            <Label htmlFor="ticker">Ticker Symbol</Label>
            <Input id="ticker" placeholder="e.g. AAPL" className="uppercase" />
          </div>
          
          <div className="form-group">
            <Label htmlFor="name">Security Name</Label>
            <Input id="name" placeholder="e.g. Apple Inc." />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" min="0" step="0.01" placeholder="0.00" className="financial-nums" />
            </div>
            
            <div className="form-group">
              <Label htmlFor="price">Purchase Price</Label>
              <Input 
                id="price" 
                type="number" 
                min="0" 
                step="0.01" 
                placeholder={formatCurrency(0)} 
                className="financial-nums" 
              />
            </div>
          </div>
          
          <div className="form-group">
            <Label htmlFor="date">Purchase Date</Label>
            <Input id="date" type="date" />
          </div>
        </form>
      </CardContent>
      <CardFooter className="form-actions">
        <Button variant="outline">Cancel</Button>
        <Button>Add Investment</Button>
      </CardFooter>
    </Card>
  )
}
```

## Financial Data Display Patterns

### Financial Data Table

```tsx
import { 
  FinancialDataTable 
} from "@/design-system/components/ui"
import { formatCurrency, formatPercentage, getFinancialValueClass } from "@/design-system/utils"

export function PortfolioTable() {
  // Sample data
  const data = [
    { 
      id: 1, 
      ticker: "AAPL", 
      name: "Apple Inc.", 
      quantity: 50, 
      price: 175.84, 
      value: 8792, 
      change: 2.5,
      sector: "Technology"
    },
    // More rows...
  ]
  
  // Define columns
  const columns = [
    {
      accessorKey: "ticker",
      header: "Ticker",
      cell: ({ row }) => <span className="font-medium">{row.getValue("ticker")}</span>,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "sector",
      header: "Sector",
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => <span className="tabular-nums">{row.getValue("quantity")}</span>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => formatCurrency(row.getValue("price")),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => formatCurrency(row.getValue("value")),
      sortingFn: "basic",
    },
    {
      accessorKey: "change",
      header: "24h Change",
      cell: ({ row }) => {
        const change = row.getValue("change")
        return (
          <span className={getFinancialValueClass(change)}>
            {formatPercentage(change / 100)}
          </span>
        )
      },
    },
  ]
  
  return (
    <FinancialDataTable 
      columns={columns} 
      data={data} 
      searchPlaceholder="Search securities..." 
      searchColumn="ticker"
      defaultSorting={[{ id: "value", desc: true }]}
    />
  )
}
```

### Financial Summary Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardDivider } from "@/design-system/components/ui"
import { formatCurrency, formatPercentage } from "@/design-system/utils"

export function PortfolioSummaryCard({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Value</span>
            <span className="text-xl font-bold financial-nums">
              {formatCurrency(data.totalValue)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Cash Balance</span>
            <span className="financial-nums">
              {formatCurrency(data.cashBalance)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Securities Value</span>
            <span className="financial-nums">
              {formatCurrency(data.securitiesValue)}
            </span>
          </div>
          
          <CardDivider />
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">YTD Return</span>
            <span className={data.ytdReturn >= 0 ? "financial-positive" : "financial-negative"}>
              {formatPercentage(data.ytdReturn / 100)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Return</span>
            <span className={data.totalReturn >= 0 ? "financial-positive" : "financial-negative"}>
              {formatPercentage(data.totalReturn / 100)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Document Processing Patterns

### Document Upload

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Button 
} from "@/design-system/components/ui"
import { useState } from "react"

export function DocumentUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }
  
  const handleDragLeave = () => {
    setIsDragging(false)
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload a financial document for analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-12 w-12 text-primary">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setFile(null)}>
                  Change
                </Button>
                <Button>Process Document</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-12 w-12 text-muted-foreground">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium">Drag & drop file here</p>
                <p className="text-sm text-muted-foreground">
                  Support for PDF, Excel, and CSV files
                </p>
              </div>
              <div>
                <label htmlFor="file-upload">
                  <Button
                    component="span"
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Browse Files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.xls,.xlsx,.csv"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Document Processing State

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Progress 
} from "@/design-system/components/ui"

export function DocumentProcessingState({ status, progress, filename }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6 text-primary">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium">{filename}</p>
              <p className="text-sm text-muted-foreground">{status}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 mr-2 text-success">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Text extraction complete</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 mr-2 text-success">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Table detection complete</span>
            </div>
            <div className="flex items-center">
              {progress < 70 ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 mr-2 animate-spin text-primary">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 mr-2 text-success">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              <span>Entity extraction {progress < 70 ? "in progress" : "complete"}</span>
            </div>
            <div className="flex items-center">
              {progress < 90 ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 mr-2 text-muted-foreground">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 mr-2 animate-spin text-primary">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              )}
              <span>Analysis generation {progress < 90 ? "pending" : "in progress"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Navigation Patterns

### Breadcrumb Navigation

```tsx
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {index === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link 
              href={item.href} 
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

// Usage
function DocumentPage() {
  const breadcrumbItems = [
    { href: "/", label: "Home" },
    { href: "/documents", label: "Documents" },
    { href: "/documents/123", label: "Financial Report Q2" },
  ]
  
  return (
    <div className="layout">
      <Breadcrumbs items={breadcrumbItems} />
      {/* Rest of the page */}
    </div>
  )
}
```

### Document Tabs Navigation

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system/components/ui"

export function DocumentTabs({ documentId }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tables">Tables</TabsTrigger>
        <TabsTrigger value="entities">Entities</TabsTrigger>
        <TabsTrigger value="chat">Ask Questions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        {/* Overview content */}
      </TabsContent>
      
      <TabsContent value="tables">
        {/* Tables content */}
      </TabsContent>
      
      <TabsContent value="entities">
        {/* Entities content */}
      </TabsContent>
      
      <TabsContent value="chat">
        {/* Chat interface */}
      </TabsContent>
    </Tabs>
  )
}
```