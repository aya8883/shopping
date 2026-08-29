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
import { createAppTheme } from './theme';
import App from './App';

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
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <AppProvider>
            <ThemedApp />
          </AppProvider>
        </ApolloProvider>
      </BrowserRouter>
    </SuperTokensWrapper>
  </React.StrictMode>,
);
