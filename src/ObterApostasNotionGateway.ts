import { Client } from "@notionhq/client";
import { Aposta } from "./Aposta";
import { notionClient } from "./notionClient";
import { ObterApostasGateway } from "./ObterApostasUsecase";

export class ObterApostasNotionGateway implements ObterApostasGateway {
  private buidAposta(page: any): Aposta {
    const aposta: Aposta = {
      nome: page.properties.Nome.title[0].plain_text,
      palpite: {
        "1": page.properties["1"].rich_text[0].plain_text,
        "2": page.properties["2"].rich_text[0].plain_text,
        "3": page.properties["3"].rich_text[0].plain_text,
        "4": page.properties["4"].rich_text[0].plain_text,
      },
    };
    return aposta;
  }

  async execute(): Promise<Aposta[]> {
    const response = await notionClient.databases.query({
      database_id: "21836f376acb4364b91b9b238d799636",
    });
    const apostas = response.results.map((page) => this.buidAposta(page));
    return apostas;
  }
}
