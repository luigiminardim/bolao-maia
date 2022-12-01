import {
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { CriarApostaForm } from "../src/CriarApostaForm";

export default function Home() {
  return (
    <Flex height={"100vh"} flexDirection="column">
      <Container as="header" maxWidth={"container.md"}>
        <HStack flexShrink={0} paddingY={4}>
          <Heading as="h1" size={"md"}>
            Bolão dos Maia
          </Heading>
        </HStack>
      </Container>
      <Container
        as="main"
        padding={{ base: 0, md: 4 }}
        maxWidth={"container.md"}
        flexGrow={1}
        display="flex"
        flexDirection="column"
        justifyContent={"center"}
      >
        <SimpleGrid shadow={"base"} padding={{ base: 4, lg: 8 }}>
          <CriarApostaForm/>
        </SimpleGrid>
      </Container>
    </Flex>
  );
}
