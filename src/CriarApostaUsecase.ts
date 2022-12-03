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

  public ehPeriodoDeCriarAposta(): boolean {
    const agora = new Date();
    const fim = new Date("2022-12-03T11:00:00-03:00"); // 11:00 do dia 03/12/2022
    return agora <= fim;
  }

  async execute(param: CriarApostaParam): Promise<void> {
    if (!this.ehPeriodoDeCriarAposta()) {
      throw new Error("Fora do período de criação de apostas");
    }
    await this.gateway.execute(param);
  }
}
