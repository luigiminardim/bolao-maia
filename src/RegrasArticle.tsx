import {
  Heading,
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

export function RulesArticle() {
  return (
    <VStack as="article" spacing={4} align="stretch">
      <Heading as="h2" size="lg">
        Regras
      </Heading>
      <Text as="p">
        Cada participante deverá paga R$50,00 para o PIX 572.748.436-72 (CPF do
        Irineu Luiz Maia) até o dia 10/12/2022.
      </Text>
      <Text as="p">
        O total arrecadado será dividido igualmente entre os participantes que
        fizerem a maior quantidade de pontos. Sendo assim, observe que não há
        critérios de desempate.
      </Text>
      <Text as="p">
        As apostas serão liberadas dia 02/12/2022 às 19h, logo depois do último
        jogo da primeira fase. E adata limite para adesão e envio dos palpites é
        às 11h do dia 03/12/2022.
      </Text>
      <TableContainer>
        <Table variant="striped" size={"sm"}>
          <Thead>
            <Tr>
              <Th>Acerto</Th>
              <Th isNumeric>Pontuação</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>1ª colocada</Td>
              <Td isNumeric>50</Td>
            </Tr>
            <Tr>
              <Td>2ª colocada</Td>
              <Td isNumeric>30</Td>
            </Tr>
            <Tr>
              <Td>3ª colocada</Td>
              <Td isNumeric>20</Td>
            </Tr>
            <Tr>
              <Td>4ª colocada</Td>
              <Td isNumeric>10</Td>
            </Tr>
            <Tr>
              <Td>Cada finalista</Td>
              <Td isNumeric>10</Td>
            </Tr>
            <Tr>
              <Td>Cada semi-finalista</Td>
              <Td isNumeric>5</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
}
