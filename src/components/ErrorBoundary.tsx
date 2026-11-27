import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('UI ErrorBoundary caught an error:', error, info);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-[#FFF9F1] flex items-center justify-center px-6 py-16 text-[#28231F]">
          <div className="max-w-md w-full rounded-3xl bg-white border border-[#EEE7DF] p-8 text-center space-y-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#F36B21]">
              7th Heaven Bakery &amp; Cafe
            </p>
            <h1 className="font-editorial text-3xl font-semibold">
              Something went wrong
            </h1>
            <p className="text-sm text-[#81766D] leading-relaxed">
              We hit an unexpected display issue. Please refresh the page to continue browsing our menu and cakes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-full bg-[#F36B21] hover:bg-[#C94E16] text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="px-6 py-2.5 rounded-full border border-[#28231F] text-[#28231F] hover:bg-[#28231F] hover:text-white text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
