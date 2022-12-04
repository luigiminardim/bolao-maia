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

export function QuadroDeVencedoresSection() {
  return (
    <VStack as="section" align={"stretch"} spacing={4}>
      <Heading as="h2">Quadro de Vencedores</Heading>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Ano</Th>
              <Th>Vencedor</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>2002</Td>
              <Td>Adílson Silva</Td>
            </Tr>
            <Tr>
              <Td>2006</Td>
              <Td>Wendel Maia</Td>
            </Tr>
            <Tr>
              <Td>2010</Td>
              <Td>Wendel Maia</Td>
            </Tr>
            <Tr>
              <Td>2014</Td>
              <Td>César Maia</Td>
            </Tr>
            <Tr>
              <Td>2018</Td>
              <Td>Luigi Maia</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
}
