import { CriarApostaGateway, CriarApostaParam } from "./CriarApostaUsecase";

export class CriarApostaApiGateway implements CriarApostaGateway {
  async execute(param: CriarApostaParam): Promise<void> {
    const response = await fetch("/api/criarAposta", {
      method: "POST",
      body: JSON.stringify(param),
    });
    if (response.status !== 200) {
      const result = await response.text();
      throw new Error(result);
    }
  }
}
