'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Falls back to 2D if the GLB fails to load (e.g. not added yet → 404) or WebGL
 * errors at runtime. Keeps "drop any GLB later" friction-free: until the asset
 * exists, the tour shows the 2D Arvi.
 */
export class MascotErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
