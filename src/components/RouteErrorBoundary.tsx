import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("[RouteErrorBoundary]", error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
        <h2 className="font-display text-lg font-bold text-foreground">Terjadi kendala di halaman ini</h2>
        <p className="text-sm text-muted-foreground">
          Kami sudah mencatat error-nya. Coba muat ulang atau kembali ke Beranda.
        </p>
        <p className="text-[11px] text-muted-foreground font-mono break-all">
          {this.state.error.message}
        </p>
        <div className="flex justify-center gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={this.reset}>
            Coba lagi
          </Button>
          <Button size="sm" onClick={() => (window.location.href = "/")}>Beranda</Button>
        </div>
      </div>
    );
  }
}

export default RouteErrorBoundary;
