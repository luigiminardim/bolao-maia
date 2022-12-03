import { Aposta } from "./Aposta";

export interface ObterApostasGateway {
  execute(): Promise<Aposta[]>;
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
    return await this.gateway.execute();
  }
}
