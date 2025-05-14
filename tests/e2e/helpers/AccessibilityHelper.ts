import { Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

/**
 * Helper class for running accessibility tests with axe-core
 */
export class AccessibilityHelper {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Run accessibility analysis on the current page
   * @param options Optional configuration options
   * @returns Accessibility scan results
   */
  async analyze(options: { 
    includedImpacts?: ('minor' | 'moderate' | 'serious' | 'critical')[], 
    excludeRules?: string[],
    includeRules?: string[],
    selector?: string
  } = {}) {
    let axeBuilder = new AxeBuilder({ page: this.page });
    
    // Apply options if provided
    if (options.includedImpacts) {
      axeBuilder = axeBuilder.withTags(options.includedImpacts);
    }
    
    if (options.excludeRules) {
      axeBuilder = axeBuilder.disableRules(options.excludeRules);
    }
    
    if (options.includeRules) {
      axeBuilder = axeBuilder.withRules(options.includeRules);
    }
    
    if (options.selector) {
      axeBuilder = axeBuilder.include(options.selector);
    }
    
    return await axeBuilder.analyze();
  }

  /**
   * Check if the current page has any critical or serious accessibility violations
   * @returns True if the page has no critical or serious violations
   */
  async hasCriticalViolations() {
    const results = await this.analyze({ 
      includedImpacts: ['critical', 'serious'] 
    });
    
    return results.violations.length > 0;
  }

  /**
   * Get all accessibility violations with formatted details
   * @returns Array of formatted violation objects
   */
  async getFormattedViolations() {
    const results = await this.analyze();
    
    return results.violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map(node => ({
        html: node.html,
        failureSummary: node.failureSummary
      }))
    }));
  }

  /**
   * Save accessibility test results to a JSON file
   * @param filePath File path to save results
   */
  async saveResults(filePath: string) {
    const results = await this.analyze();
    const fs = require('fs');
    
    // Create directory if it doesn't exist
    const path = require('path');
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    fs.writeFileSync(
      filePath,
      JSON.stringify(results, null, 2)
    );
  }

  /**
   * Check specific accessibility rules
   * @param rules Array of rule IDs to check
   * @returns Results for the specified rules
   */
  async checkSpecificRules(rules: string[]) {
    return await this.analyze({ includeRules: rules });
  }

  /**
   * Generate a simple summary of violations by impact level
   * @returns Object with counts by impact level
   */
  async getViolationSummary() {
    const results = await this.analyze();
    
    const summary = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      total: results.violations.length
    };
    
    results.violations.forEach(violation => {
      if (violation.impact) {
        summary[violation.impact as keyof typeof summary] += 1;
      }
    });
    
    return summary;
  }
}