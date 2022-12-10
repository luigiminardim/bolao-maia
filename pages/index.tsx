import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { GetStaticProps } from "next";
import { Aposta } from "../src/Aposta";
import { ClassificaçãoSection } from "../src/ClassificaçãoSection";
import { BallIcon } from "../src/BallIcon";
import { CriarApostaForm, criarApostaUsecase } from "../src/CriarApostaForm";
import { ObterApostasNotionGateway } from "../src/ObterApostasNotionGateway";
import { ObterApostasUsecase } from "../src/ObterApostasUsecase";
import { RulesArticle } from "../src/RegrasArticle";
import { QuadroDeVencedoresSection } from "../src/QuadroDeVencedoresSection";

const obterApostasUsecase = new ObterApostasUsecase(
  new ObterApostasNotionGateway()
);

type HomeProps = {
  resultadoObterApostas: null | { apostas: Aposta[]; nPossibilidades: number };
  ehParaMostrarForm: boolean;
};

export default function Home({
  resultadoObterApostas,
  ehParaMostrarForm,
}: HomeProps) {
  return (
    <Flex position={"relative"} height={"100vh"} flexDirection="column">
      <Box position={"absolute"} top={0} left={0} right={0} zIndex={-1}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 320"
          style={{ width: "100%", height: "100%" }}
        >
          <path
            fill="#2F855A"
            fillOpacity="1"
            d="M0,128L60,133.3C120,139,240,149,360,170.7C480,192,600,224,720,224C840,224,960,192,1080,165.3C1200,139,1320,117,1380,106.7L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          ></path>
        </svg>
      </Box>
      <Container as="header" maxWidth={"container.lg"}>
        <HStack flexShrink={0} paddingY={6} spacing={4} color="white">
          <BallIcon />
          <Heading as="h1" size={"md"}>
            Bolão dos Maia
          </Heading>
          <Spacer />
          <Link href="#CriarApostaForm" display={{ lg: "none" }}>
            Fazer Palpite
          </Link>
        </HStack>
      </Container>
      <Container
        as="main"
        paddingX={{ base: 0, md: 4 }}
        maxWidth={"container.lg"}
        flexGrow={1}
        display="flex"
        flexDirection="column"
        justifyContent={"center"}
      >
        <SimpleGrid
          shadow={"base"}
          background="white"
          borderRadius={"lg"}
          columnGap={16}
          rowGap={16}
          padding={{ base: 4, lg: 8 }}
          columns={{ base: 1, lg: 2 }}
        >
          <VStack align={"stretch"} spacing={16}>
            <RulesArticle />
            <QuadroDeVencedoresSection />
          </VStack>
          {ehParaMostrarForm && <CriarApostaForm />}
          {!!resultadoObterApostas && (
            <ClassificaçãoSection
              apostas={resultadoObterApostas.apostas}
              nPossibilidades={resultadoObterApostas.nPossibilidades}
            />
          )}
        </SimpleGrid>
      </Container>
    </Flex>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const resultadoObterApostas = await obterApostasUsecase.execute();
  const ehParaMostrarForm = criarApostaUsecase.ehPeriodoDeCriarAposta();
  return {
    revalidate: 10 * 60, // 10 minutes
    props: {
      resultadoObterApostas: resultadoObterApostas,
      ehParaMostrarForm,
    },
  };
};
