import { ApolloClient, from, HttpLink, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { setContext } from '@apollo/client/link/context';
import fetch from 'isomorphic-fetch';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import nookies from 'nookies';
// import { auth } from '../firebase/firebaseClient';
// import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { InMemoryCache, NormalizedCacheObject } from '@apollo/client/cache';
import { useMemo } from 'react';

const createHttpLink = () =>
  new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1/graphql',
    credentials: 'include',
    fetch,
  });

const createWSLink = () =>
  new WebSocketLink(
    new SubscriptionClient(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/v1/graphql', {
      reconnect: true,
      lazy: true,
    })
  );

// let initialToken: string;

const getAuthLink = (initialToken: string) =>
  setContext((_req, { header }) => {
    const token = initialToken || nookies.get(null)?.token;

    if (token) {
      return {
        headers: {
          ...header,
          authorization: `Bearer ${token}`,
          'x-hasura-user-role': 'user',
          'x-hasura-admin-secret': 'mysecret',
        },
      };
    }

    return {
      headers: {
        ...header,
      },
    };
  });

// const getNewAccessToken = async () => {
//   const user = auth.currentUser;

//   if (user) {
//     console.info('Refreshing token from expiration failure!');
//     const d = await user.getIdTokenResult(true);
//     nookies.set(null, 'token', d.token);
//     return d.token;
//   }
// };

// const errorLink = onError(({ graphQLErrors, networkError: _, operation, forward }) => {
//   if (graphQLErrors) {
//     for (const err of graphQLErrors) {
//       switch (err.extensions?.code) {
//         case 'invalid-jwt':
//           if (typeof window !== 'undefined') {
//             return fromPromise(
//               getNewAccessToken().catch((error) => {
//                 // Handle token refresh errors e.g clear stored tokens, redirect to login
//                 console.error(error);
//                 nookies.destroy(null, 'token');
//                 localStorage.removeItem('refreshToken');
//                 return;
//               })
//             )
//               .filter((value) => Boolean(value))
//               .flatMap((accessToken) => {
//                 const oldHeaders = operation.getContext().headers;
//                 // modify the operation context with a new token
//                 operation.setContext({
//                   headers: {
//                     ...oldHeaders,
//                     authorization: `Bearer ${accessToken || nookies.get(null)?.token}`,
//                   },
//                 });

//                 if (nookies.get(null)?.token || accessToken) {
//                   // retry the request, returning the new observable
//                   return forward(operation);
//                 }
//               });
//           }
//       }
//     }
//   }
// });

let apolloClient: ApolloClient<NormalizedCacheObject>;

export const createApolloClient = (token: string) => {
  const ssrMode = typeof window === 'undefined';

  const l = !ssrMode
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
          );
        },
        createWSLink(),
        createHttpLink()
      )
    : createHttpLink();

  const link = from([getAuthLink(token), l]);

  return new ApolloClient({ ssrMode, link, cache: new InMemoryCache() });
};

export function initializeApollo(initialState = {}, token: string) {
  const _token = token ?? nookies.get(null)?.token;
  const _apolloClient = apolloClient ?? createApolloClient(_token);

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Restore the cache using the data passed from
    // getStaticProps/getServerSideProps combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;
  return _apolloClient;
}

export function useApollo(initialState: any, token: string) {
  const store = useMemo(() => initializeApollo(initialState, token), [initialState, token]);
  return store;
}
