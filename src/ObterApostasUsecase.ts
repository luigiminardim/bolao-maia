import {
  Aposta,
  calcularPontuacao,
  gerarTodasPossibilidades,
  Palpite,
} from "./Aposta";
import { Time } from "./times";

export type NotionAposta = {
  nome: string;
  palpite: {
    "1": Time["nome"];
    "2": Time["nome"];
    "3": Time["nome"];
    "4": Time["nome"];
  };
};
export interface ObterApostasGateway {
  execute(): Promise<NotionAposta[]>;
}

type TabelaDePontuação = {
  possibilidade: Palpite;
  resultados: { notionAposta: NotionAposta; pontuação: number }[];
  vencedores: string[];
}[];

export class ObterApostasUsecase {
  constructor(private gateway: ObterApostasGateway) {}

  public ehPeriodoDeObterApostas(): boolean {
    const agora = new Date();
    const inicio = new Date("2022-12-03T11:00:00-03:00"); // 11:00 do dia 03/12/2022
    return agora >= inicio;
  }

  private gerarTabelaDePontuação(
    todasPossibilidades: Palpite[],
    notionApostas: NotionAposta[]
  ): TabelaDePontuação {
    const tabela = todasPossibilidades.map((possibilidade) => {
      const resultados = notionApostas.map((notionAposta) => {
        const pontuação = calcularPontuacao(
          possibilidade,
          notionAposta.palpite
        );
        return { notionAposta, pontuação };
      });
      const { vencedores, maxPontuação } = resultados.reduce(
        ({ vencedores, maxPontuação }, { pontuação, notionAposta }) => {
          if (pontuação > maxPontuação) {
            return { vencedores: [notionAposta.nome], maxPontuação: pontuação };
          }
          if (pontuação === maxPontuação) {
            return {
              vencedores: [...vencedores, notionAposta.nome],
              maxPontuação: pontuação,
            };
          }
          return { vencedores, maxPontuação };
        },
        { vencedores: [] as string[], maxPontuação: 0 }
      );
      return { possibilidade, vencedores, resultados };
    });
    return tabela;
  }

  private gerarApostas(
    tabelaDePontuação: TabelaDePontuação,
    notionApostas: NotionAposta[]
  ): Aposta[] {
    const apostas = notionApostas.map(({ nome, palpite }): Aposta => {
      const pontuaçãoesPossíveis = tabelaDePontuação.map(
        ({ resultados }) =>
          resultados.find(({ notionAposta }) => notionAposta.nome === nome)
            ?.pontuação ?? -1
      );
      const minimoDePontos = Math.min(...pontuaçãoesPossíveis);
      const maximoDePontos = Math.max(...pontuaçãoesPossíveis);
      const nPossibilidades = tabelaDePontuação.filter(({ vencedores }) =>
        vencedores.some((vencedor) => vencedor === nome)
      ).length;
      return {
        nome,
        palpite,
        minimoDePontos,
        maximoDePontos,
        nPossibilidades,
      };
    });
    return apostas;
  }

  async execute(): Promise<null | {
    apostas: Aposta[];
    nPossibilidades: number;
  }> {
    if (!this.ehPeriodoDeObterApostas()) {
      return null;
    }
    const todasPossibilidades = gerarTodasPossibilidades();
    const notionApostas = await this.gateway.execute();
    const tabelaDePontuação = this.gerarTabelaDePontuação(
      todasPossibilidades,
      notionApostas
    );
    const apostas = this.gerarApostas(tabelaDePontuação, notionApostas);
    const apostasOrdenadas = apostas.sort((a, b) =>
      b.nPossibilidades - a.nPossibilidades !== 0
        ? b.nPossibilidades - a.nPossibilidades
        : b.minimoDePontos - a.minimoDePontos !== 0
        ? b.minimoDePontos - a.minimoDePontos
        : b.maximoDePontos - a.maximoDePontos
    );
    return {
      apostas: apostasOrdenadas,
      nPossibilidades: todasPossibilidades.length,
    };
  }
}
