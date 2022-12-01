export const times = [
  { nome: "Brasil" },
  { nome: "Argentina" },
  { nome: "França" },
  { nome: "Polônia" },
  { nome: "Alemanha" },
] as const;

export type Time = typeof times[number];

export const timesNomes = times.map((time) => time.nome);
