import {
  ChakraProvider,
  extendTheme,
  theme as chakraTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import faviconSrc from "../public/favicon.png";

const customTheme = extendTheme(
  {
    colors: {
      primary: chakraTheme.colors.green,
    },
  },
  withDefaultColorScheme({
    colorScheme: "primary",
  })
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={customTheme}>
      <Head>
        <link rel="shortcut icon" href="/favicon.png" />
        <title>Bolão dos Maia</title>
        <meta
          name="description"
          content="Participe do Bolão da Copa da Família Maia"
        />
        <meta name="keywords" content="Bolão, Família Maia" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
