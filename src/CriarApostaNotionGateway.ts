import { CriarApostaGateway, CriarApostaParam } from "./CriarApostaUsecase";
import { Client } from "@notionhq/client";

const notionClient = new Client({ auth: process.env.NOTION_TOKEN });

export class CriarApostaNotionGateway implements CriarApostaGateway {
  async execute(param: CriarApostaParam): Promise<void> {
    const result = await notionClient.pages.create({
      parent: { database_id: "21836f376acb4364b91b9b238d799636" },
      properties: {
        Nome: {
          title: [{ text: { content: param.nome } }],
        },
        "1": {
          type: "rich_text",
          rich_text: [{ type: "text", text: { content: param["1"] } }],
        },
        "2": {
          type: "rich_text",
          rich_text: [{ type: "text", text: { content: param["2"] } }],
        },
        "3": {
          type: "rich_text",
          rich_text: [{ type: "text", text: { content: param["3"] } }],
        },
        "4": {
          type: "rich_text",
          rich_text: [{ type: "text", text: { content: param["4"] } }],
        },
      },
    });
    console.log(result)
  }
}
