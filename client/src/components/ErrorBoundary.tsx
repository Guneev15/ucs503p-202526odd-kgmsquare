import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-950">
          <div className="max-w-md p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">⚠️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Something Went Wrong
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  An error occurred in the application
                </p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-300 font-mono break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
