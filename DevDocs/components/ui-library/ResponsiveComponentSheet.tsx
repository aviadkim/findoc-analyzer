import React from 'react';
import { useResponsive } from '@/lib/hooks/useResponsive';
import { 
  Container,
  Flex,
  Grid,
  ResponsiveStack,
  Hidden
} from './layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

/**
 * A component sheet that displays responsive design examples and code snippets
 */
export function ResponsiveComponentSheet() {
  const responsive = useResponsive();
  
  const codeSnippet = (code: string) => (
    <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap dark:bg-slate-800 dark:text-slate-300">
      <code>{code}</code>
    </pre>
  );
  
  return (
    <div className="space-y-10">
      {/* Current breakpoint indicator */}
      <div className="sticky top-[80px] z-10 bg-white/80 backdrop-blur-sm border-b pb-2 mb-8 dark:bg-slate-900/80 dark:border-slate-800">
        <Container>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Current Breakpoint: <Badge variant="outline" className="ml-2 text-lg">{responsive.breakpoint}</Badge></h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Window: {responsive.windowWidth}px × {responsive.windowHeight}px</span>
              <span className={`inline-block h-3 w-3 rounded-full ${responsive.isMobile ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              <span className="text-sm">Mobile</span>
              <span className={`inline-block h-3 w-3 rounded-full ${responsive.isTablet ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              <span className="text-sm">Tablet</span>
              <span className={`inline-block h-3 w-3 rounded-full ${responsive.isDesktop || responsive.isLargeDesktop ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              <span className="text-sm">Desktop</span>
            </div>
          </div>
        </Container>
      </div>

      {/* Container Examples */}
      <section>
        <Container>
          <h2 className="text-2xl font-bold mb-4">Containers</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Container</CardTitle>
                <CardDescription>The Container component provides consistent width and padding at each breakpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-dashed border-slate-300 rounded-md text-center bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  This Container has default responsive padding
                </div>
                {codeSnippet(`<Container>\n  Content here\n</Container>`)}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fluid Container</CardTitle>
                  <CardDescription>Full width at all screen sizes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Container fluid>
                    <div className="p-4 border border-dashed border-slate-300 rounded-md text-center bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                      Fluid container (100% width)
                    </div>
                  </Container>
                  {codeSnippet(`<Container fluid>\n  Full width content\n</Container>`)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Max Width Container</CardTitle>
                  <CardDescription>Specify a maximum width</CardDescription>
                </CardHeader>
                <CardContent>
                  <Container maxWidth="sm">
                    <div className="p-4 border border-dashed border-slate-300 rounded-md text-center bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                      Small max-width container
                    </div>
                  </Container>
                  {codeSnippet(`<Container maxWidth="sm">\n  Max-width sm content\n</Container>`)}
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Grid Examples */}
      <section>
        <Container>
          <h2 className="text-2xl font-bold mb-4">Responsive Grid</h2>
          <Card>
            <CardHeader>
              <CardTitle>Responsive Columns</CardTitle>
              <CardDescription>Changes columns based on screen size</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2">1 column on mobile, 2 on tablet, 3 on desktop, 4 on large desktop</p>
                <Grid cols={{ xs: 1, md: 2, lg: 3, xl: 4 }} gap={4}>
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="p-4 bg-slate-100 rounded text-center font-medium dark:bg-slate-800">
                      Grid Item {item}
                    </div>
                  ))}
                </Grid>
                {codeSnippet(`<Grid cols={{ xs: 1, md: 2, lg: 3, xl: 4 }} gap={4}>\n  <div>Grid Item 1</div>\n  <div>Grid Item 2</div>\n  <div>Grid Item 3</div>\n  <div>Grid Item 4</div>\n</Grid>`)}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Simple 2-column grid (constant across breakpoints)</p>
                <Grid cols={2} gap={4}>
                  <div className="p-4 bg-slate-100 rounded text-center font-medium dark:bg-slate-800">
                    Grid Item 1
                  </div>
                  <div className="p-4 bg-slate-100 rounded text-center font-medium dark:bg-slate-800">
                    Grid Item 2
                  </div>
                </Grid>
                {codeSnippet(`<Grid cols={2} gap={4}>\n  <div>Grid Item 1</div>\n  <div>Grid Item 2</div>\n</Grid>`)}
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Flex Examples */}
      <section>
        <Container>
          <h2 className="text-2xl font-bold mb-4">Responsive Flex</h2>
          <Card>
            <CardHeader>
              <CardTitle>Flex Direction Responsiveness</CardTitle>
              <CardDescription>Automatically changes layout based on screen size</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2">Column on mobile, row on desktop</p>
                <Flex 
                  direction={{ xs: 'col', md: 'row' }}
                  justify="between"
                  align="center"
                  gap={4}
                  className="border border-dashed border-slate-300 p-4 rounded-lg dark:border-slate-700"
                >
                  <div className="p-4 bg-slate-100 rounded text-center font-medium w-full md:w-auto dark:bg-slate-800">
                    Flex Item 1
                  </div>
                  <div className="p-4 bg-slate-100 rounded text-center font-medium w-full md:w-auto dark:bg-slate-800">
                    Flex Item 2
                  </div>
                  <div className="p-4 bg-slate-100 rounded text-center font-medium w-full md:w-auto dark:bg-slate-800">
                    Flex Item 3
                  </div>
                </Flex>
                {codeSnippet(`<Flex\n  direction={{ xs: 'col', md: 'row' }}\n  justify="between"\n  align="center"\n  gap={4}\n>\n  <div>Flex Item 1</div>\n  <div>Flex Item 2</div>\n  <div>Flex Item 3</div>\n</Flex>`)}
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* ResponsiveStack Examples */}
      <section>
        <Container>
          <h2 className="text-2xl font-bold mb-4">Responsive Stack</h2>
          <Card>
            <CardHeader>
              <CardTitle>Stacking Items</CardTitle>
              <CardDescription>A convenient way to handle the common pattern of stacking on mobile, side-by-side on desktop</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveStack 
                direction={{ xs: 'vertical', md: 'horizontal' }}
                spacing={4}
                align="stretch"
                className="border border-dashed border-slate-300 p-4 rounded-lg dark:border-slate-700"
              >
                <Card className="w-full md:w-1/3">
                  <CardHeader>
                    <CardTitle>Card 1</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>This card will be stacked vertically on mobile, horizontally on desktop.</p>
                  </CardContent>
                </Card>
                <Card className="w-full md:w-1/3">
                  <CardHeader>
                    <CardTitle>Card 2</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Resize your browser to see the responsive behavior.</p>
                  </CardContent>
                </Card>
                <Card className="w-full md:w-1/3">
                  <CardHeader>
                    <CardTitle>Card 3</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>ResponsiveStack simplifies this common UI pattern.</p>
                  </CardContent>
                </Card>
              </ResponsiveStack>
              {codeSnippet(`<ResponsiveStack\n  direction={{ xs: 'vertical', md: 'horizontal' }}\n  spacing={4}\n  align="stretch"\n>\n  <Card className="w-full md:w-1/3">...</Card>\n  <Card className="w-full md:w-1/3">...</Card>\n  <Card className="w-full md:w-1/3">...</Card>\n</ResponsiveStack>`)}
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Hidden Examples */}
      <section>
        <Container>
          <h2 className="text-2xl font-bold mb-4">Visibility Control</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Mobile Only</CardTitle>
                <CardDescription>Only visible on mobile</CardDescription>
              </CardHeader>
              <CardContent>
                <Hidden above="md">
                  <div className="p-4 bg-green-100 rounded text-center dark:bg-green-900">
                    This content is visible on mobile only
                  </div>
                </Hidden>
                <div className="p-4 bg-red-100 rounded text-center hidden md:block dark:bg-red-900">
                  Content hidden on mobile
                </div>
                {codeSnippet(`<Hidden above="md">\n  Mobile only content\n</Hidden>`)}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tablet Only</CardTitle>
                <CardDescription>Only visible on tablet</CardDescription>
              </CardHeader>
              <CardContent>
                <Hidden below="md" above="lg">
                  <div className="p-4 bg-green-100 rounded text-center dark:bg-green-900">
                    This content is visible on tablet only
                  </div>
                </Hidden>
                <div className="p-4 bg-red-100 rounded text-center md:hidden dark:bg-red-900">
                  Hidden on tablet (mobile view)
                </div>
                <div className="p-4 bg-red-100 rounded text-center hidden lg:block dark:bg-red-900">
                  Hidden on tablet (desktop view)
                </div>
                {codeSnippet(`<Hidden below="md" above="lg">\n  Tablet only content\n</Hidden>`)}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Desktop Only</CardTitle>
                <CardDescription>Only visible on desktop</CardDescription>
              </CardHeader>
              <CardContent>
                <Hidden below="lg">
                  <div className="p-4 bg-green-100 rounded text-center dark:bg-green-900">
                    This content is visible on desktop only
                  </div>
                </Hidden>
                <div className="p-4 bg-red-100 rounded text-center lg:hidden dark:bg-red-900">
                  Hidden on desktop (mobile/tablet view)
                </div>
                {codeSnippet(`<Hidden below="lg">\n  Desktop only content\n</Hidden>`)}
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Utility Classes */}
      <section>
        <Container>
          <h2 className="text-2xl font-bold mb-4">Utility Classes</h2>
          <div className="grid-responsive-3">
            <Card>
              <CardHeader>
                <CardTitle>Responsive Padding</CardTitle>
                <CardDescription>Padding that adapts to screen size</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-responsive border border-dashed border-slate-300 rounded-md text-center dark:border-slate-700">
                  This box uses p-responsive (p-4 md:p-6 lg:p-8)
                </div>
                {codeSnippet(`<div className="p-responsive">\n  Content with responsive padding\n</div>`)}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Responsive Text</CardTitle>
                <CardDescription>Text that scales with viewport</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-responsive border border-dashed border-slate-300 p-4 rounded-md dark:border-slate-700">
                  This text uses text-responsive (text-sm md:text-base lg:text-lg)
                </p>
                {codeSnippet(`<p className="text-responsive">\n  Text that adapts to screen size\n</p>`)}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Responsive Grid</CardTitle>
                <CardDescription>Pre-defined responsive grids</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid-responsive-2 border border-dashed border-slate-300 p-4 rounded-md dark:border-slate-700">
                  <div className="bg-slate-100 p-2 rounded dark:bg-slate-800">Item 1</div>
                  <div className="bg-slate-100 p-2 rounded dark:bg-slate-800">Item 2</div>
                </div>
                {codeSnippet(`<div className="grid-responsive-2">\n  <div>Item 1</div>\n  <div>Item 2</div>\n</div>`)}
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Responsive Form Example */}
      <section>
        <Container>
          <h2 className="text-2xl font-bold mb-4">Responsive Form Example</h2>
          <Card>
            <CardHeader>
              <CardTitle>Form Layout</CardTitle>
              <CardDescription>Demonstrates responsive form patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="form-responsive space-y-6">
                <div className="grid-responsive-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                    <Input id="firstName" name="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                    <Input id="lastName" name="lastName" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" name="email" type="email" placeholder="john.doe@example.com" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows={4} 
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                    placeholder="Enter your message here"
                  ></textarea>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
                  <Button variant="outline" type="button">Cancel</Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Testing Tools */}
      <section>
        <Container>
          <h2 className="text-2xl font-bold mb-4">Testing Responsiveness</h2>
          <Card>
            <CardHeader>
              <CardTitle>Responsive Testing Guide</CardTitle>
              <CardDescription>Tools and approaches to verify your responsive design</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Test by resizing your browser or using browser dev tools to simulate different device sizes.</p>
              
              <h3 className="text-lg font-semibold">Device Simulation</h3>
              <p>Open Chrome DevTools (F12) and click the "Toggle device toolbar" button to simulate different devices.</p>
              
              <h3 className="text-lg font-semibold">Recommended Test Sizes</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <th className="border p-2 text-left">Device Category</th>
                      <th className="border p-2 text-left">Width (px)</th>
                      <th className="border p-2 text-left">Height (px)</th>
                      <th className="border p-2 text-left">Example Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">Small Mobile</td>
                      <td className="border p-2">360px</td>
                      <td className="border p-2">640px</td>
                      <td className="border p-2">iPhone SE</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Large Mobile</td>
                      <td className="border p-2">390px</td>
                      <td className="border p-2">844px</td>
                      <td className="border p-2">iPhone 12/13/14</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Tablet</td>
                      <td className="border p-2">768px</td>
                      <td className="border p-2">1024px</td>
                      <td className="border p-2">iPad</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Laptop</td>
                      <td className="border p-2">1024px</td>
                      <td className="border p-2">768px</td>
                      <td className="border p-2">Laptop</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Desktop</td>
                      <td className="border p-2">1440px</td>
                      <td className="border p-2">900px</td>
                      <td className="border p-2">Desktop Monitor</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Large Desktop</td>
                      <td className="border p-2">1920px</td>
                      <td className="border p-2">1080px</td>
                      <td className="border p-2">Large Monitor</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>
    </div>
  );
}