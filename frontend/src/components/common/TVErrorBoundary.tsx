import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  focusedButton: 'retry' | 'home';
}

export class TVErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      focusedButton: 'retry'
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Netflix TV ErrorBoundary caught an error]:', error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (!this.state.hasError) return;

    if (e.key === 'ArrowLeft' || e.key === 'Left') {
      e.preventDefault();
      this.setState({ focusedButton: 'retry' });
    } else if (e.key === 'ArrowRight' || e.key === 'Right') {
      e.preventDefault();
      this.setState({ focusedButton: 'home' });
    } else if (e.key === 'Enter' || e.key === 'Select') {
      e.preventDefault();
      if (this.state.focusedButton === 'retry') {
        this.handleRetry();
      } else {
        this.handleHome();
      }
    } else if (e.key === 'Back' || e.key === 'Escape') {
      e.preventDefault();
      this.handleHome();
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleHome = () => {
    window.location.hash = '';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { focusedButton } = this.state;
      return (
        <div className="fixed inset-0 z-[9999] bg-[#141414] text-white flex flex-col items-center justify-center p-8 select-none">
          {/* Netflix Logo */}
          <div className="mb-6 flex items-center space-x-2">
            <svg viewBox="0 0 100 160" width="32" height="48" className="w-8 h-12 filter drop-shadow">
              <path d="M0 0h34v160H0z" fill="#B81D24" />
              <path d="M66 0h34v160H66z" fill="#B81D24" />
              <path d="M0 0h34l66 160H66z" fill="#E50914" />
            </svg>
            <span className="text-2xl font-black tracking-tight text-[#E50914] font-sans">
              NETFLIX
            </span>
          </div>

          <div className="max-w-lg text-center space-y-4 bg-zinc-900/90 border border-zinc-800 p-8 rounded-xl shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-[#E50914] mx-auto mb-2" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              We're having trouble loading this screen
            </h1>
            <p className="text-sm text-zinc-400">
              Please try again or return to the Netflix home screen.
            </p>
            <p className="text-[11px] font-mono text-zinc-500">
              Code: tvq-st-106 ({this.state.error?.message?.slice(0, 60) || 'Unknown error'})
            </p>

            <div className="flex items-center justify-center space-x-4 pt-4">
              <button
                onClick={this.handleRetry}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded font-bold text-sm transition-all ${
                  focusedButton === 'retry'
                    ? 'bg-white text-black shadow-lg scale-105 ring-2 ring-white'
                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleHome}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded font-bold text-sm transition-all ${
                  focusedButton === 'home'
                    ? 'bg-white text-black shadow-lg scale-105 ring-2 ring-white'
                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Netflix Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
