import { AlertProvider } from '@/components/alert';
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <AlertProvider>
    <Component {...pageProps} />
  </AlertProvider>
}
