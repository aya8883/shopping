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
  if (networkError) {
    console.warn('[Network]', networkError.message);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink as unknown as ApolloLink, httpLink]),
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
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
