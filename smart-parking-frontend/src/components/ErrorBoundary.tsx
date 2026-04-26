import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      const { error } = this.state;
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 overflow-auto">
          <div className="max-w-lg w-full rounded-2xl border border-destructive/30 bg-card p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold">
                !
              </div>
              <div>
                <h2 className="font-semibold text-base">Render error</h2>
                <p className="text-xs text-muted-foreground">
                  Something crashed while drawing the page.
                </p>
              </div>
            </div>
            <pre className="mt-2 max-h-60 overflow-auto rounded-md bg-muted p-3 text-left font-mono text-xs text-destructive whitespace-pre-wrap break-words">
              {error.message}
              {error.stack ? `\n\n${error.stack}` : ""}
            </pre>
            <div className="mt-4 flex gap-2">
              <button
                onClick={this.reset}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
