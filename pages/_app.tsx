import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { useApollo } from '../lib/apolloClient';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from '../firebase/AuthProvider';
import { ProtectRoute } from '@atoms/ProtectRoute';

function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState, pageProps.token);
  return (
    <AuthProvider>
      <ApolloProvider client={apolloClient}>
        <ChakraProvider>
          <ProtectRoute>
            <Component {...pageProps} />
          </ProtectRoute>
        </ChakraProvider>
      </ApolloProvider>
    </AuthProvider>
  );
}
export default MyApp;
