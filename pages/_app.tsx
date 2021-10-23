import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { useApollo } from '../lib/apolloClient';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from '../firebase/AuthProvider';

function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState, pageProps.token);
  return (
    <AuthProvider>
      <ApolloProvider client={apolloClient}>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </ApolloProvider>
    </AuthProvider>
  );
}
export default MyApp;
