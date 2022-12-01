import { Time, times } from "./times";
import * as Yup from "yup";

export interface CriarApostaGateway {
  execute(param: CriarApostaParam): Promise<void>;
}

export type CriarApostaParam = {
  nome: string;
  "1": Time["nome"];
  "2": Time["nome"];
  "3": Time["nome"];
  "4": Time["nome"];
};

const timeSchema = Yup.mixed<Time["nome"]>()
  .required("A escolha de todos os times é obrigatória")
  .oneOf(times.map((time) => time.nome));

export class CriarApostaUsecase {
  constructor(private gateway: CriarApostaGateway) {}

  validationSchema: Yup.SchemaOf<CriarApostaParam> = Yup.object({
    nome: Yup.string()
      .required("Nome é obrigatório")
      .min(3, "Nome muito curto"),
    "1": timeSchema,
    "2": timeSchema,
    "3": timeSchema,
    "4": timeSchema,
  });

  async execute(param: CriarApostaParam): Promise<void> {
    await this.gateway.execute(param);
  }
}
