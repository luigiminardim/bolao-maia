import { Aposta, calcularPontuacao, gerarTodasPossibilidades } from "./Aposta";
import { Time } from "./times";

export type ObterApostasGatewayReturnItem = {
  nome: string;
  palpite: {
    "1": Time["nome"];
    "2": Time["nome"];
    "3": Time["nome"];
    "4": Time["nome"];
  };
};
export interface ObterApostasGateway {
  execute(): Promise<ObterApostasGatewayReturnItem[]>;
}

export class ObterApostasUsecase {
  constructor(private gateway: ObterApostasGateway) {}

  public ehPeriodoDeObterApostas(): boolean {
    const agora = new Date();
    const inicio = new Date("2022-12-03T11:00:00-03:00"); // 11:00 do dia 03/12/2022
    return agora >= inicio;
  }

  async execute(): Promise<null | Aposta[]> {
    if (!this.ehPeriodoDeObterApostas()) {
      return null;
    }
    const todasPossibilidades = gerarTodasPossibilidades();
    const resultados = await this.gateway.execute();
    const apostas = resultados.map(({ nome, palpite }): Aposta => {
      const pontuacoes = todasPossibilidades.map((possibilidade) =>
        calcularPontuacao(possibilidade, palpite)
      );
      const minimoDePontos = Math.min(...pontuacoes);
      const maximoDePontos = Math.max(...pontuacoes);
      return {
        nome,
        palpite,
        minimoDePontos,
        maximoDePontos,
      };
    });
    return apostas.sort((a, b) =>
      b.minimoDePontos - a.minimoDePontos === 0
        ? b.maximoDePontos - a.maximoDePontos
        : b.minimoDePontos - a.minimoDePontos
    );
  }
}
