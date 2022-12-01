import {
  ChakraProvider,
  extendTheme,
  theme as chakraTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";
import type { AppProps } from "next/app";

const customTheme = extendTheme(
  {
    colors: {
      primary: chakraTheme.colors.green,
    },
  },
  withDefaultColorScheme({
    colorScheme: 'primary'
  })
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={customTheme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
