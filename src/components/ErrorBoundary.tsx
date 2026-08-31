import { Component, type ErrorInfo, type ReactNode } from "react";
import { IconLogo } from "./icons";

interface State {
  hasError: boolean;
  message?: string;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this is where you'd ship to Sentry / LogRocket.
    console.error("[wearly] render failure:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-10 max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-rose2/12 blur-3xl" />
          <div className="relative">
            <span className="inline-block mb-5 text-rose2">
              <IconLogo size={44} />
            </span>
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-rose2 mb-3">
              Hull breach // render fault
            </p>
            <h1 className="font-display text-3xl font-bold text-white">
              Something went sideways in this timeline.
            </h1>
            {this.state.message && (
              <p className="font-mono text-xs text-mist mt-3 break-words">{this.state.message}</p>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.hash = "#/";
              }}
              className="mt-7 inline-flex items-center gap-2 px-6 py-3 font-display font-semibold text-sm clip-notch bg-gradient-to-r from-neon to-viol text-void hover:shadow-[0_0_36px_-8px_rgba(45,226,255,0.7)] transition-shadow"
            >
              Return to base
            </button>
          </div>
        </div>
      </div>
    );
  }
}
