import "@/styles/globals.css";
import { AuthProvider } from "../context/authContext";
import Head from "next/head";

<Head>
  <link rel="manifest" href="/manifest.json" />
  <link rel="icon" href="/icons/icon-192.png" />
  <meta name="theme-color" content="#4f46e5" />
</Head>


function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;

