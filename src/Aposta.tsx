import { Time } from "./times";

export type Palpite = {
  '1': Time['nome'];
  '2': Time['nome'];
  '3': Time['nome'];
  '4': Time['nome'];
}

export type Aposta = {
  nome: string;
  palpite: Palpite;
}
