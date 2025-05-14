import React from 'react';
import {
  Typography,
  Heading1,
  Heading2,
  Heading3,
  Paragraph,
  Icon,
  Badge,
  DataCard,
  SearchFilter,
  FileUpload,
  DashboardLayout,
  DataTable,
  PortfolioSummary,
  AssetAllocation,
  SecuritiesTable,
  DocumentAnalytics,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui-library';

export default function UIComponentsPage() {
  // Example data for components
  const portfolioSummaryData = {
    totalValue: 125750.42,
    previousValue: 120500.10,
    totalGainLoss: 5250.32,
    totalGainLossPercent: 4.36,
    securitiesCount: 18,
    diversificationScore: 82,
    riskLevel: 45,
    riskAssessment: "Moderate",
    monthlyIncome: 425.50,
    annualYield: 4.12,
    performance: {
      daily: 0.28,
      weekly: 1.15,
      monthly: 2.73,
      quarterly: 5.21,
      yearly: 12.8,
      ytd: 8.45
    },
    allocation: {
      "Stocks": 65,
      "Bonds": 25,
      "Cash": 5,
      "Alternative": 5
    },
    currency: "USD",
    lastUpdated: "2025-05-12T15:30:00Z"
  };

  const assetAllocationData = {
    byAssetClass: [
      { name: "Stocks", value: 65 },
      { name: "Bonds", value: 25 },
      { name: "Cash", value: 5 },
      { name: "Alternative", value: 5 }
    ],
    bySector: [
      { name: "Technology", value: 30 },
      { name: "Healthcare", value: 15 },
      { name: "Financial", value: 12 },
      { name: "Consumer", value: 10 },
      { name: "Industrial", value: 8 },
      { name: "Other", value: 25 }
    ],
    byGeography: [
      { name: "US", value: 60 },
      { name: "Europe", value: 20 },
      { name: "Asia", value: 15 },
      { name: "Other", value: 5 }
    ]
  };

  const securitiesData = [
    {
      id: "1",
      name: "Apple Inc.",
      ticker: "AAPL",
      isin: "US0378331005",
      assetClass: "Equity",
      sector: "Technology",
      geography: "US",
      currency: "USD",
      quantity: 100,
      price: 180.75,
      value: 18075,
      weight: 15.2,
      gainLoss: 5200,
      gainLossPercent: 40.35,
      yield: 0.5,
      riskRating: "Medium"
    },
    {
      id: "2",
      name: "Microsoft Corporation",
      ticker: "MSFT",
      isin: "US5949181045",
      assetClass: "Equity",
      sector: "Technology",
      geography: "US",
      currency: "USD",
      quantity: 50,
      price: 340.25,
      value: 17012.50,
      weight: 14.3,
      gainLoss: 4250,
      gainLossPercent: 33.28,
      yield: 0.8,
      riskRating: "Medium"
    },
    {
      id: "3",
      name: "US Treasury Bond 2.5% 2030",
      isin: "US912810TL55",
      assetClass: "Fixed Income",
      sector: "Government",
      geography: "US",
      currency: "USD",
      quantity: 10000,
      price: 98.25,
      value: 9825,
      weight: 8.2,
      gainLoss: -175,
      gainLossPercent: -1.75,
      yield: 2.5,
      riskRating: "Low"
    }
  ];

  const documentAnalyticsData = {
    documentType: "Annual Report",
    summary: "The 2024 annual report shows strong performance with revenue growth of 12% and a 15% increase in net profit compared to the previous year. The company maintains a healthy balance sheet with increased cash reserves and reduced debt.",
    period: "FY 2024",
    financialFigures: [
      {
        name: "Revenue",
        value: 1250000000,
        currency: "USD",
        changePercent: 12,
        context: "Year-over-year growth of 12%"
      },
      {
        name: "Net Income",
        value: 320000000,
        currency: "USD",
        changePercent: 15,
        context: "Profit margin of 25.6%"
      }
    ],
    insights: [
      {
        topic: "Revenue Growth",
        insight: "The company's 12% revenue growth outperforms the industry average of 8%, driven primarily by expansion in the Asia-Pacific region and new product introductions.",
        importance: "high"
      },
      {
        topic: "Debt Reduction",
        insight: "The company reduced its long-term debt by 15%, improving its debt-to-equity ratio from 0.5 to 0.4.",
        importance: "medium"
      }
    ]
  };

  // Example columns for DataTable
  const columns = [
    {
      id: 'name',
      header: 'Security',
      accessor: (row: any) => row.name,
      cell: (value: any, row: any) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-muted-foreground">
            {row.ticker ? row.ticker : ''}{row.ticker && row.isin ? ' | ' : ''}{row.isin ? row.isin : ''}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: 'assetClass',
      header: 'Asset Class',
      accessor: (row: any) => row.assetClass || 'Unknown',
      sortable: true,
    },
    {
      id: 'value',
      header: 'Value',
      accessor: (row: any) => row.value,
      sortable: true,
      rightAlign: true,
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-12">
      <header className="space-y-4">
        <Heading1>FinDoc UI Component Library</Heading1>
        <Paragraph>
          This page showcases the components available in the FinDoc UI library.
          These components are designed to be reusable across the application and follow the FinDoc design system.
        </Paragraph>
      </header>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="atoms">Atoms</TabsTrigger>
          <TabsTrigger value="molecules">Molecules</TabsTrigger>
          <TabsTrigger value="organisms">Organisms</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Atoms Tab */}
        <TabsContent value="atoms" className="space-y-8 pt-6">
          <section className="space-y-4">
            <Heading2>Typography</Heading2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Heading1>Heading 1</Heading1>
                  <Heading2>Heading 2</Heading2>
                  <Heading3>Heading 3</Heading3>
                  <Typography variant="h4">Heading 4</Typography>
                  <Typography variant="h5">Heading 5</Typography>
                  <Typography variant="h6">Heading 6</Typography>
                </div>
                <div className="space-y-2">
                  <Paragraph>This is a paragraph text. This is a paragraph text. This is a paragraph text.</Paragraph>
                  <Typography variant="lead">This is a lead text. It's slightly larger than regular paragraph text.</Typography>
                  <Typography variant="large">This is large text.</Typography>
                  <Typography variant="small">This is small text.</Typography>
                  <Typography variant="muted">This is muted text, used for secondary information.</Typography>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading2>Icons</Heading2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="FileText" size={24} />
                    <Typography variant="small">FileText</Typography>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="PieChart" size={24} />
                    <Typography variant="small">PieChart</Typography>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="BarChart" size={24} />
                    <Typography variant="small">BarChart</Typography>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="TrendingUp" size={24} />
                    <Typography variant="small">TrendingUp</Typography>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="DollarSign" size={24} />
                    <Typography variant="small">DollarSign</Typography>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="AlertCircle" size={24} color="red" />
                    <Typography variant="small">AlertCircle</Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading2>Badges</Heading2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="secondary" icon={<Icon name="Info" size={12} />}>With Icon</Badge>
                  <Badge variant="destructive" dismissible>Dismissible</Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading2>Buttons</Heading2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button disabled>Disabled</Button>
                  <Button size="sm">Small</Button>
                  <Button size="lg">Large</Button>
                  <Button>
                    <Icon name="Download" className="mr-2 h-4 w-4" />
                    With Icon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        {/* Molecules Tab */}
        <TabsContent value="molecules" className="space-y-8 pt-6">
          <section className="space-y-4">
            <Heading2>Data Card</Heading2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DataCard
                title="Total Portfolio Value"
                value="$125,750.42"
                trend="positive"
                changePercentage={4.36}
                previousValue="$120,500.10"
                icon={<Icon name="DollarSign" className="h-4 w-4" />}
              />
              <DataCard
                title="Securities Count"
                value="18"
                icon={<Icon name="Briefcase" className="h-4 w-4" />}
              />
              <DataCard
                title="Annual Yield"
                value="4.12%"
                icon={<Icon name="TrendingUp" className="h-4 w-4" />}
                footer={<Badge variant="info">Above Average</Badge>}
              />
            </div>
          </section>

          <section className="space-y-4">
            <Heading2>Search Filter</Heading2>
            <Card>
              <CardContent className="pt-6">
                <SearchFilter
                  searchPlaceholder="Search securities..."
                  filterGroups={[
                    {
                      id: 'assetClass',
                      label: 'Asset Class',
                      options: [
                        { id: 'equity', label: 'Equity', value: 'Equity' },
                        { id: 'fixedIncome', label: 'Fixed Income', value: 'Fixed Income' },
                        { id: 'cash', label: 'Cash', value: 'Cash' },
                      ]
                    },
                    {
                      id: 'sector',
                      label: 'Sector',
                      options: [
                        { id: 'technology', label: 'Technology', value: 'Technology' },
                        { id: 'healthcare', label: 'Healthcare', value: 'Healthcare' },
                        { id: 'financial', label: 'Financial', value: 'Financial' },
                      ]
                    }
                  ]}
                />
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading2>File Upload</Heading2>
            <Card>
              <CardContent className="pt-6">
                <FileUpload
                  accept=".pdf,.csv,.xlsx"
                  maxSize={5 * 1024 * 1024}
                  placeholder="Upload financial documents here"
                  description="Supports PDF, CSV, and Excel files up to 5MB"
                />
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        {/* Organisms Tab */}
        <TabsContent value="organisms" className="space-y-8 pt-6">
          <section className="space-y-4">
            <Heading2>Data Table</Heading2>
            <Card>
              <CardContent className="pt-6">
                <DataTable
                  columns={columns}
                  data={securitiesData}
                  getRowKey={(row) => row.id}
                  pagination
                  defaultPageSize={10}
                  sortable
                  defaultSort={{ column: 'value', direction: 'desc' }}
                />
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <Heading2>Dashboard Layout</Heading2>
            <DashboardLayout
              title="Example Dashboard"
              summary="This is an example of the dashboard layout component"
              actions={
                <Button>
                  <Icon name="Download" className="mr-2 h-4 w-4" />
                  Export
                </Button>
              }
              sections={[
                {
                  id: "summary",
                  title: "Summary Section",
                  icon: <Icon name="BarChart" />,
                  content: <div className="h-40 bg-muted/50 rounded-md flex items-center justify-center">Summary Content</div>,
                  colSpan: 2,
                  priority: 10
                },
                {
                  id: "section1",
                  title: "Regular Section",
                  icon: <Icon name="PieChart" />,
                  content: <div className="h-40 bg-muted/50 rounded-md flex items-center justify-center">Section Content</div>,
                  collapsible: true
                },
                {
                  id: "section2",
                  title: "Another Section",
                  icon: <Icon name="LineChart" />,
                  content: <div className="h-40 bg-muted/50 rounded-md flex items-center justify-center">Section Content</div>,
                  collapsible: true
                }
              ]}
              sidebar={
                <Card>
                  <CardHeader>
                    <CardTitle>Sidebar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 bg-muted/50 rounded-md flex items-center justify-center">
                      Sidebar Content
                    </div>
                  </CardContent>
                </Card>
              }
            />
          </section>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-8 pt-6">
          <section className="space-y-4">
            <Heading2>Portfolio Summary</Heading2>
            <PortfolioSummary
              data={portfolioSummaryData}
              showRefresh
              onRefresh={() => console.log("Refreshing data...")}
              actions={
                <Button variant="outline" size="sm">
                  <Icon name="Download" className="mr-2 h-4 w-4" />
                  Export
                </Button>
              }
            />
          </section>

          <section className="space-y-4">
            <Heading2>Asset Allocation</Heading2>
            <AssetAllocation
              data={assetAllocationData}
              showRefresh
              onRefresh={() => console.log("Refreshing data...")}
              colorScheme="blue"
            />
          </section>

          <section className="space-y-4">
            <Heading2>Securities Table</Heading2>
            <SecuritiesTable
              securities={securitiesData}
              showRefresh
              onRefresh={() => console.log("Refreshing data...")}
              onSecurityClick={(security) => console.log("Clicked:", security)}
              enableExport
              onExport={(format) => console.log(`Exporting as ${format}...`)}
              footer={
                <div className="text-sm text-muted-foreground">
                  Total Holdings: {securitiesData.length} | Total Value: $44,912.50
                </div>
              }
            />
          </section>

          <section className="space-y-4">
            <Heading2>Document Analytics</Heading2>
            <DocumentAnalytics
              data={documentAnalyticsData}
              documentName="XYZ Corp Annual Report"
              showRefresh
              onRefresh={() => console.log("Refreshing analysis...")}
              onExport={() => console.log("Exporting analysis...")}
              onViewOriginal={() => console.log("Viewing original document...")}
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}