import fs from 'fs';
import path from 'path';

/**
 * Helper class for managing test data
 */
export class TestDataHelper {
  private static instance: TestDataHelper;
  private testData: any;
  private readonly testDataPath: string;

  private constructor() {
    this.testDataPath = path.resolve(process.cwd(), 'test-data/sample-test-data.json');
    this.loadTestData();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TestDataHelper {
    if (!TestDataHelper.instance) {
      TestDataHelper.instance = new TestDataHelper();
    }
    return TestDataHelper.instance;
  }

  /**
   * Load test data from file
   */
  private loadTestData(): void {
    try {
      const data = fs.readFileSync(this.testDataPath, 'utf8');
      this.testData = JSON.parse(data);
    } catch (error) {
      console.error('Failed to load test data:', error);
      this.testData = {};
    }
  }

  /**
   * Get test file path
   * @param fileType Type of file (pdf, image, etc.)
   * @param fileName Name of the file
   * @returns Absolute path to the test file
   */
  public getTestFilePath(fileType: string, fileName: string): string {
    try {
      const relativePath = this.testData.testFiles[fileType][fileName];
      return path.resolve(process.cwd(), relativePath.startsWith('/') ? relativePath.substring(1) : relativePath);
    } catch (error) {
      throw new Error(`Could not find test file: ${fileType}.${fileName}`);
    }
  }

  /**
   * Get mock securities data
   * @returns Array of mock securities data
   */
  public getMockSecurities(): any[] {
    return this.testData.mockData.securities || [];
  }

  /**
   * Get mock portfolios data
   * @returns Array of mock portfolios data
   */
  public getMockPortfolios(): any[] {
    return this.testData.mockData.portfolios || [];
  }

  /**
   * Get environment configuration
   * @param environment Name of environment (local, development, staging, production)
   * @returns Environment configuration
   */
  public getEnvironmentConfig(environment: string = 'local'): any {
    return this.testData.testEnvironments[environment] || this.testData.testEnvironments.local;
  }

  /**
   * Get base URL for current test environment
   * @returns Base URL
   */
  public getBaseUrl(): string {
    const env = process.env.TEST_ENV || 'local';
    return this.getEnvironmentConfig(env).baseUrl;
  }

  /**
   * Get API URL for current test environment
   * @returns API URL
   */
  public getApiUrl(): string {
    const env = process.env.TEST_ENV || 'local';
    return this.getEnvironmentConfig(env).apiUrl;
  }
}
