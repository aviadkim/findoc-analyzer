import React from 'react';
// Removing Chakra UI dependencies
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });

    // You could also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const { fallback } = this.props;

      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback(error, errorInfo, this.handleReset);
      }

      // Default error UI with plain HTML/CSS
      return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-6 mb-6 flex flex-col items-center text-center">
            <div className="text-3xl mb-2">
              <FiAlertTriangle />
            </div>
            <h2 className="mt-4 mb-1 text-lg font-bold">
              Something went wrong
            </h2>
            <p className="max-w-sm">
              We've encountered an unexpected error. Please try again or contact support if the problem persists.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold mb-2">Error Details</h3>
              <p className="text-red-500 font-medium">
                {error && error.toString()}
              </p>
            </div>

            {errorInfo && (
              <div>
                <h3 className="text-lg font-bold mb-2">Component Stack</h3>
                <div
                  className="bg-gray-50 p-3 rounded-md max-h-[200px] overflow-y-auto text-sm font-mono"
                >
                  <pre className="whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              </div>
            )}

            <hr className="my-2 border-gray-200" />

            <div>
              <button
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md mr-3 hover:bg-blue-600"
                onClick={this.handleReload}
              >
                <FiRefreshCw className="mr-2" />
                Reload Page
              </button>
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                onClick={this.handleReset}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
