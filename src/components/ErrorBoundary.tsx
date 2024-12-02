import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen ocean-bg flex items-center justify-center">
          <div className="rpg-panel p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-4">哎呀！出了点小问题</h2>
            <p className="text-blue-200 mb-4">别担心，刷新页面就能修复</p>
            <button
              onClick={() => window.location.reload()}
              className="rpg-button px-4 py-2 rounded"
            >
              重新开始
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}