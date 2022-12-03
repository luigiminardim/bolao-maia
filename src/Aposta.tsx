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
};

type Chaveamento = {
  time: null | Time["nome"];
  subChaveamentos?: [Chaveamento, Chaveamento];
};

const chaveamento: Chaveamento = {
  time: null,
  subChaveamentos: [
    {
      time: null,
      subChaveamentos: [
        {
          time: null,
          subChaveamentos: [
            {
              time: null,
              subChaveamentos: [{ time: "Holanda" }, { time: "Estado Unidos" }],
            },
            {
              time: null,
              subChaveamentos: [{ time: "Argentina" }, { time: "Austrália" }],
            },
          ],
        },
        {
          time: null,
          subChaveamentos: [
            {
              time: null,
              subChaveamentos: [{ time: "Japão" }, { time: "Croácia" }],
            },
            {
              time: null,
              subChaveamentos: [{ time: "Brasil" }, { time: "Coreia do Sul" }],
            },
          ],
        },
      ],
    },
    {
      time: null,
      subChaveamentos: [
        {
          time: null,
          subChaveamentos: [
            {
              time: null,
              subChaveamentos: [{ time: "Inglaterra" }, { time: "Senegal" }],
            },
            {
              time: null,
              subChaveamentos: [{ time: "França" }, { time: "Polônia" }],
            },
          ],
        },
        {
          time: null,
          subChaveamentos: [
            {
              time: null,
              subChaveamentos: [{ time: "Marrocos" }, { time: "Espanha" }],
            },
            {
              time: null,
              subChaveamentos: [{ time: "Portugal" }, { time: "Suíça" }],
            },
          ],
        },
      ],
    },
  ],
};

function getTimesDoChaveamento(chaveamento: Chaveamento): Time["nome"][] {
  if (chaveamento.time) return [chaveamento.time];
  if (!chaveamento.subChaveamentos) return [];
  return chaveamento.subChaveamentos.flatMap(getTimesDoChaveamento);
}

function permutator<T>(inputArr: T[]) {
  let result: T[][] = [];
  const permute = (arr: T[], m: T[] = []) => {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };
  permute(inputArr);
  return result;
}

export function gerarTodasPossibilidades(): Palpite[] {
  const _1 = chaveamento.time;
  const _3: null | Time["nome"] = null;
  const subchaveamento1 =
    chaveamento.subChaveamentos?.[0]?.subChaveamentos?.[0];
  const subchaveamento2 =
    chaveamento.subChaveamentos?.[0]?.subChaveamentos?.[1];
  const subchaveamento3 =
    chaveamento.subChaveamentos?.[1]?.subChaveamentos?.[0];
  const subchaveamento4 =
    chaveamento.subChaveamentos?.[1]?.subChaveamentos?.[1];
  const times1 = subchaveamento1 ? getTimesDoChaveamento(subchaveamento1) : [];
  const times2 = subchaveamento2 ? getTimesDoChaveamento(subchaveamento2) : [];
  const times3 = subchaveamento3 ? getTimesDoChaveamento(subchaveamento3) : [];
  const times4 = subchaveamento4 ? getTimesDoChaveamento(subchaveamento4) : [];
  const todasPossibilidades = times1
    .flatMap((time1) =>
      times2.flatMap((time2) =>
        times3.flatMap((time3) =>
          times4.flatMap((time4) => {
            const palpite = [time1, time2, time3, time4];
            return permutator(palpite);
          })
        )
      )
    )
    .map((possibilidade) => ({
      "1": possibilidade[0],
      "2": possibilidade[1],
      "3": possibilidade[2],
      "4": possibilidade[3],
    }))
    .filter((palpite) => (!!_1 ? palpite["1"] === _1 : true))
    .filter((palpite) => (!!_3 ? palpite["3"] === _3 : true));
  return todasPossibilidades;
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
