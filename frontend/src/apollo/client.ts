import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import Session from 'supertokens-auth-react/recipe/session';
import { appConfig } from '../config/app';
import { mockLink } from './mockLink';

const useMockData =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
  import.meta.env.VITE_USE_MOCK_DATA === '1';

const httpLink = createHttpLink({
  uri: appConfig.hasuraGraphqlUrl,
});

const authLink = setContext(async (_, { headers }) => {
  let token: string | undefined;
  try {
    if (await Session.doesSessionExist()) {
      token = (await Session.getAccessToken()) ?? undefined;
    }
  } catch {
    token = undefined;
  }

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.warn('[GraphQL]', err.message, err.extensions);
    }
  }
  if (networkError && !useMockData) {
    console.warn(
      '[Network]',
      networkError.message,
      '— Start Hasura (Docker) or set VITE_USE_MOCK_DATA=true in frontend/.env',
    );
  }
});

if (useMockData) {
  console.info('[apollo] Using local mock GraphQL data (Hasura not required)');
}

export const apolloClient = new ApolloClient({
  link: useMockData
    ? from([errorLink, mockLink])
    : from([errorLink, authLink as unknown as ApolloLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['where', 'order_by'],
            merge(existing = [], incoming) {
              return incoming ?? existing;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: useMockData ? 'cache-first' : 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
