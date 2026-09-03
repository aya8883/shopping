import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { SuperTokensWrapper } from 'supertokens-auth-react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { ThemeProvider, CssBaseline } from '@mui/material';
import './i18n';
import './index.css';
import { initSuperTokens } from './auth/initSuperTokens';
import { apolloClient } from './apollo/client';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { BasketProvider } from './contexts/BasketContext';
import { createAppTheme } from './theme';
import App from './App';

const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

initSuperTokens();

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const ltrCache = createCache({
  key: 'muiltr',
  stylisPlugins: [prefixer],
});

function ThemedApp() {
  const { locale, direction } = useAppContext();
  const theme = createAppTheme(locale);
  const cache = direction === 'rtl' ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </CacheProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SuperTokensWrapper>
      <BrowserRouter
        basename={routerBasename}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ApolloProvider client={apolloClient}>
          <AppProvider>
            <BasketProvider>
              <ThemedApp />
            </BasketProvider>
          </AppProvider>
        </ApolloProvider>
      </BrowserRouter>
    </SuperTokensWrapper>
  </React.StrictMode>,
);
