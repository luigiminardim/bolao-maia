import {
  Heading,
  HStack,
  Table,
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

export function ApostasTable({ apostas }: ApostasTableProps) {
  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2">Classificação</Heading>
      <TableContainer>
        <Table variant={"striped"}>
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
