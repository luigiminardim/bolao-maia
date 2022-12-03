import {
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
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
              <Th>1º</Th>
              <Th>2º</Th>
              <Th>3º</Th>
              <Th>4º</Th>
            </Tr>
          </Thead>
          <Tbody>
            {apostas.map((aposta) => (
              <Tr key={aposta.nome}>
                <Td>{formatarNome(aposta.nome)}</Td>
                {(["1", "2", "3", "4"] as const).map((position) => {
                  const bandeira = getBandeira(aposta.palpite[position]);
                  return (
                    <Td key={position} padding={4}>
                      {bandeira && (
                        <Image
                          src={bandeira}
                          alt={aposta.palpite[position]}
                          style={{ width: "max-content" }}
                        />
                      )}
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
}
