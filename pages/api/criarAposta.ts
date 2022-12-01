import { CriarApostaApiGateway } from "./../../src/CriarApostaApiGateway";
import {
  CriarApostaParam,
  CriarApostaUsecase,
} from "./../../src/CriarApostaUsecase";
import { endpoint, error, success } from "@luigiminardim/next-endpoint";
import { CriarApostaNotionGateway } from "../../src/CriarApostaNotionGateway";

const criarApostaUsecase = new CriarApostaUsecase(
  new CriarApostaNotionGateway()
);

export default endpoint({
  post: {
    async handler(query, body) {
      const param = criarApostaUsecase.validationSchema.cast(
        body
      ) as CriarApostaParam;
      if (!criarApostaUsecase.validationSchema.isValidSync(param))
        return error(404, "Parâmetro inválido");
      try {
        await criarApostaUsecase.execute(param);
        return success("Aposta criada com sucesso", 200);
      } catch (e) {
        return error(500, (e as Error).message);
      }
    },
  },
});
