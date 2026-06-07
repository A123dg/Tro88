import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { App as AntdApp, ConfigProvider as AntdConfigProvider } from 'antd'
import { StyleProvider, px2remTransformer } from '@ant-design/cssinjs'
import { QueryClientProvider } from 'react-query'
import { queryClient } from './queryClient'
import { router } from './route'
import MyErrorBoundary from './components/shared/ErrorBoundary'
import 'antd/dist/reset.css'
import './styles.css'

const PX_2_REM = px2remTransformer({ rootValue: 16 });
const CHUNK_ERROR_STORAGE_KEY = 'chunkErrorPath';

const isDynamicImportError = (error: unknown): error is Error => {
  if (!(error instanceof Error)) return false;

  return (
    error.name === 'ChunkLoadError' ||
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed') ||
    error.message.includes('dynamically imported module')
  );
};

const reloadForChunkError = () => {
  const currentPath = window.location.pathname + window.location.search;
  const lastChunkErrorPath = window.sessionStorage.getItem(CHUNK_ERROR_STORAGE_KEY);

  if (lastChunkErrorPath === currentPath) return;

  window.sessionStorage.setItem(CHUNK_ERROR_STORAGE_KEY, currentPath);
  window.location.reload();
};

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  reloadForChunkError();
});

window.addEventListener('unhandledrejection', (event) => {
  if (!isDynamicImportError(event.reason)) return;

  event.preventDefault();
  reloadForChunkError();
});

window.sessionStorage.removeItem(CHUNK_ERROR_STORAGE_KEY);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AntdConfigProvider
        theme={{
          token: {
            colorPrimary: '#f4845f',
          },
        }}
      >
        <AntdApp>
          <StyleProvider transformers={[PX_2_REM]}>
            <MyErrorBoundary>
              <RouterProvider router={router} />
            </MyErrorBoundary>
          </StyleProvider>
        </AntdApp>
      </AntdConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
