import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Button, Result } from 'antd';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const err = error as Error;

  const isChunkLoadError =
    err?.name === 'ChunkLoadError' ||
    err?.message?.includes('Failed to fetch dynamically imported module') ||
    err?.message?.includes('Importing a module script failed') ||
    err?.message?.includes('dynamically imported module');

  // Handle chunk loading errors (e.g. from new deployments)
  if (isChunkLoadError) {
    const currentPath = window.location.pathname;
    const lastChunkErrorPath = window.sessionStorage.getItem('chunkErrorPath');

    if (lastChunkErrorPath !== currentPath) {
      window.sessionStorage.setItem('chunkErrorPath', currentPath);
      window.location.reload();
      return null;
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fdfaf7', padding: '20px' }}>
      <Result
        status="error"
        title="Đã có lỗi xảy ra"
        subTitle={err?.message || 'Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.'}
        extra={[
          <Button
            type="primary"
            key="reload"
            onClick={() => {
              window.sessionStorage.removeItem('chunkErrorPath');
              if (resetErrorBoundary) resetErrorBoundary();
              else window.location.reload();
            }}
            style={{ background: '#f4845f', borderColor: '#f4845f' }}
          >
            Tải lại trang
          </Button>,
          <Button key="home" onClick={() => (window.location.href = '/')}>
            Về trang chủ
          </Button>,
        ]}
      />
    </div>
  );
};

export default function MyErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('ErrorBoundary caught an error:', error, info);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
