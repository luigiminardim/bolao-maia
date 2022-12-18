import { Time } from "./times";

export type Palpite = {
  "1": Time["nome"];
  "2": Time["nome"];
  "3": Time["nome"];
  "4": Time["nome"];
};

export type Aposta = {
  nome: string;
  palpite: Palpite;
  minimoDePontos: number;
  maximoDePontos: number;
  nPossibilidades: number;
};

type Chaveamento = {
  time: null | Time["nome"];
  subChaveamentos?: [Chaveamento, Chaveamento];
};

const terceiroColocado: null | Time["nome"] = "Croácia";
const chaveamento: Chaveamento = {
  time: "Argentina",
  subChaveamentos: [
    {
      time: "Argentina",
      subChaveamentos: [
        {
          time: "Argentina",
          subChaveamentos: [
            {
              time: "Holanda",
              subChaveamentos: [{ time: "Holanda" }, { time: "Estado Unidos" }],
            },
            {
              time: "Argentina",
              subChaveamentos: [{ time: "Argentina" }, { time: "Austrália" }],
            },
          ],
        },
        {
          time: "Croácia",
          subChaveamentos: [
            {
              time: "Croácia",
              subChaveamentos: [{ time: "Japão" }, { time: "Croácia" }],
            },
            {
              time: "Brasil",
              subChaveamentos: [{ time: "Brasil" }, { time: "Coreia do Sul" }],
            },
          ],
        },
      ],
    },
    {
      time: "França",
      subChaveamentos: [
        {
          time: "França",
          subChaveamentos: [
            {
              time: "Inglaterra",
              subChaveamentos: [{ time: "Inglaterra" }, { time: "Senegal" }],
            },
            {
              time: "França",
              subChaveamentos: [{ time: "França" }, { time: "Polônia" }],
            },
          ],
        },
        {
          time: "Marrocos",
          subChaveamentos: [
            {
              time: "Marrocos",
              subChaveamentos: [{ time: "Marrocos" }, { time: "Espanha" }],
            },
            {
              time: "Portugal",
              subChaveamentos: [{ time: "Portugal" }, { time: "Suíça" }],
            },
          ],
        },
      ],
    },
  ],
};

export function gerarTodosChaveamentosFinaisPossíveis(
  chaveamento: Chaveamento
): Chaveamento[] {
  if (!!chaveamento.time) return [chaveamento];
  if (!chaveamento.subChaveamentos) return [];
  const subchaveamentos0 = gerarTodosChaveamentosFinaisPossíveis(
    chaveamento.subChaveamentos[0]
  );
  const subchaveamentos1 = gerarTodosChaveamentosFinaisPossíveis(
    chaveamento.subChaveamentos[1]
  );
  const chaveamentosFinaisPossíveis: Chaveamento[] = [];
  for (const subchaveamento0 of subchaveamentos0) {
    for (const subchaveamento1 of subchaveamentos1) {
      for (const time of [subchaveamento0.time, subchaveamento1.time]) {
        if (!time) continue;
        chaveamentosFinaisPossíveis.push({
          time,
          subChaveamentos: [subchaveamento0, subchaveamento1],
        });
      }
    }
  }
  return chaveamentosFinaisPossíveis;
}

function convChaveamentoParaPalpites(chaveamento: Chaveamento): Palpite[] {
  const semifinalistas = [
    chaveamento.subChaveamentos?.[0].subChaveamentos?.[0].time,
    chaveamento.subChaveamentos?.[0].subChaveamentos?.[1].time,
    chaveamento.subChaveamentos?.[1].subChaveamentos?.[0].time,
    chaveamento.subChaveamentos?.[1].subChaveamentos?.[1].time,
  ];
  const finalistas = [
    chaveamento.subChaveamentos?.[0].time,
    chaveamento.subChaveamentos?.[1].time,
  ];
  const _1 = chaveamento.time;
  const _2 = finalistas.filter((finalista) => finalista !== _1)[0];
  const [_3_a, _3_b] = semifinalistas.filter(
    (semifinalista) => semifinalista !== _1 && semifinalista !== _2
  );
  if (!_1 || !_2 || !_3_a || !_3_b) return [];
  return [
    { "1": _1, "2": _2, "3": _3_a, "4": _3_b },
    { "1": _1, "2": _2, "3": _3_b, "4": _3_a },
  ].filter((palpite) =>
    terceiroColocado ? palpite["3"] === terceiroColocado : true
  );
}

export function gerarTodasPossibilidades(): Palpite[] {
  const chaveamentosFinaisPossíveis =
    gerarTodosChaveamentosFinaisPossíveis(chaveamento);
  const palpitesPossíveis = chaveamentosFinaisPossíveis.flatMap(
    convChaveamentoParaPalpites
  );
  return palpitesPossíveis;
}

export function calcularPontuacao(resultado: Palpite, palpite: Palpite) {
  const pontuacao1 = resultado["1"] === palpite["1"] ? 50 : 0;
  const pontuacao2 = resultado["2"] === palpite["2"] ? 30 : 0;
  const pontuacao3 = resultado["3"] === palpite["3"] ? 20 : 0;
  const pontuacao4 = resultado["4"] === palpite["4"] ? 10 : 0;
  const pontuacaoFinalistas = [resultado["1"], resultado["2"]].reduce(
    (acc, finalista) =>
      [palpite["1"], palpite["2"]].includes(finalista) ? acc + 10 : acc,
    0
  );
  const pontuacaoSemifinalistas = [
    resultado["1"],
    resultado["2"],
    resultado["3"],
    resultado["4"],
  ].reduce(
    (acc, semifinalista) =>
      [palpite["1"], palpite["2"], palpite["3"], palpite["4"]].includes(
        semifinalista
      )
        ? acc + 5
        : acc,
    0
  );
  return (
    pontuacao1 +
    pontuacao2 +
    pontuacao3 +
    pontuacao4 +
    pontuacaoFinalistas +
    pontuacaoSemifinalistas
  );
}
