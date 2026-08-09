import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** Optional label shown in the fallback message. */
  label?: string;
  /** Called when the user dismisses/resets the failed subtree. */
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  private reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center space-y-3">
        <AlertTriangle className="h-6 w-6 mx-auto text-destructive" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">
            {this.props.label ?? "Something went wrong"}
          </p>
          <p className="text-sm text-muted-foreground">
            {error.message || "An unexpected error occurred."}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={this.reset}>
          Try again
        </Button>
      </div>
    );
  }
}
