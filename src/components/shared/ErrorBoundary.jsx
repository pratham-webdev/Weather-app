import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", maxWidth: "500px", margin: "80px auto" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
            <h2 style={{ marginBottom: "8px" }}>Something went wrong</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "0.9rem" }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button className="btn btn-accent" onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}>
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
