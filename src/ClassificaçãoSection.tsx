import {
  Heading,
  HStack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import { Aposta } from "./Aposta";
import { Time, times } from "./times";

export type ApostasTableProps = {
  apostas: Aposta[];
  nPossibilidades: number;
};

function getBandeira(time: Time["nome"]) {
  return times.find((t) => t.nome === time)?.bandeira;
}

function formatarNome(nome: string) {
  const [primeiroNome, ...resto] = nome
    .trim()
    .split(" ")
    .filter((n) => !!n)
    .map((x) => x.toLowerCase())
    .map((x) => x[0].toUpperCase() + x.slice(1));
  const nomeFormatado = [primeiroNome, resto[resto.length - 1]].join(" ");
  return nomeFormatado;
}

export function ClassificaçãoSection({
  apostas,
  nPossibilidades,
}: ApostasTableProps) {
  return (
    <VStack as="section" spacing={4} align="stretch">
      <Heading as="h2" size="lg">
        Classificação
      </Heading>
      <TableContainer>
        <Table variant={"striped"}>
          <TableCaption>
            Total de possibilidades: {nPossibilidades}
          </TableCaption>
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>Palpite</Th>
            </Tr>
          </Thead>
          <Tbody>
            {apostas.map((aposta) => (
              <Tr key={aposta.nome}>
                <Td>
                  <VStack align={"stretch"}>
                    <Text as="b">{formatarNome(aposta.nome)}</Text>
                    <Text as="p">
                      <b>{aposta.nPossibilidades}</b> possibilidades (
                      {(
                        (aposta.nPossibilidades / nPossibilidades) *
                        100
                      ).toFixed(0)}
                      %)
                    </Text>
                    <Text as="p">
                      <Text as="span">{aposta.minimoDePontos} </Text> a{" "}
                      <Text as="span">{aposta.maximoDePontos} </Text>
                      pontos
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <VStack align="stretch">
                    {(["1", "2", "3", "4"] as const).map((position) => {
                      const bandeira = getBandeira(aposta.palpite[position]);
                      return (
                        <HStack key={position}>
                          {bandeira && (
                            <Image
                              src={bandeira}
                              alt={aposta.palpite[position]}
                              width={32}
                              height={24}
                            />
                          )}
                          <Text as="span">{aposta.palpite[position]}</Text>
                        </HStack>
                      );
                    })}
                  </VStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
}
