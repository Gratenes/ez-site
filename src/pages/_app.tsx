import { AlertProvider } from '@/components/alert';
import type { AppProps } from 'next/app'
import '@/styles/globals.css'
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AlertProvider>
      <Head>
        <link rel="icon" href="/svg/Ezfill.svg" />
        <title>Ez Embed</title>

        <meta name="title" content="Ez Embed" />
      </Head>
      <Component {...pageProps} />
    </AlertProvider>
  );
}
