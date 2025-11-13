import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('🚨 React Error Boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // TODO: Log to error tracking service (Sentry, etc.)
    // logErrorToService(error, errorInfo);

    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_12px_rgba(16,24,40,0.08)] border border-[#CFE0D8]">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-4 mb-6">
                <h1 
                  className="text-[#1A1A1A]"
                  style={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontSize: '22px', 
                    lineHeight: '30px', 
                    letterSpacing: '-0.44px', 
                    fontWeight: 600 
                  }}
                >
                  Algo salió mal
                </h1>
                <p 
                  className="text-[#4D6B59]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    fontSize: '16px', 
                    lineHeight: '24px' 
                  }}
                >
                  Ocurrió un error inesperado. Por favor recarga la página o intenta nuevamente.
                </p>

                {/* Error details in dev mode */}
                {import.meta.env.DEV && this.state.error && (
                  <details className="mt-4 text-left">
                    <summary 
                      className="cursor-pointer text-[#7BB97A] hover:text-[#6BA96A]"
                      style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      Detalles del error (solo visible en desarrollo)
                    </summary>
                    <div className="mt-2 p-3 bg-red-50 rounded-[8px] text-xs overflow-auto max-h-40">
                      <p className="font-mono text-red-900">{this.state.error.message}</p>
                      {this.state.error.stack && (
                        <pre className="mt-2 text-red-700 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full h-12 rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] text-white transition-all duration-200 shadow-[0_4px_12px_rgba(16,24,40,0.08)] hover:shadow-[0_6px_16px_rgba(16,24,40,0.12)]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    fontSize: '16px', 
                    lineHeight: '24px', 
                    fontWeight: 500 
                  }}
                >
                  Recargar página
                </button>

                <button
                  onClick={this.handleReset}
                  className="w-full h-12 rounded-[16px] bg-white text-[#2F3A33] border border-[#CFE0D8] hover:bg-[#F5FAF7] transition-all duration-200"
                  style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    fontSize: '16px', 
                    lineHeight: '24px', 
                    fontWeight: 500 
                  }}
                >
                  Intentar de nuevo
                </button>
              </div>

              {/* Support link */}
              <p 
                className="text-center mt-6 text-[#9FB3A8]"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  fontSize: '14px', 
                  lineHeight: '20px' 
                }}
              >
                Si el problema persiste, contacta a soporte
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
