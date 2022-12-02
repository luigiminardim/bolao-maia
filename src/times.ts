import holandaSrc from "../public/Holanda.png";
import senegalSrc from "../public/Senegal.png";
import inglaterraSrc from "../public/Inglaterra.png";
import estadosUnidosSrc from "../public/EstadosUnidos.png";
import argentinaSrc from "../public/Argentina.png";
import poloniaSrc from "../public/Polônia.png";
import francaSrc from "../public/França.png";
import australiaSrc from "../public/Austrália.png";
import japaoSrc from "../public/Japão.png";
import espanhaSrc from "../public/Espanha.png";
import marrocosSrc from "../public/Marrocos.png";
import croaciaSrc from "../public/Croácia.png";
import brasilSrc from "../public/Brasil.png";
import suicaSrc from "../public/Suíça.png";
import portugalSrc from "../public/Portugal.png";
import coreiaDoSulSrc from "../public/Coreia do Sul.png";

export const times = [
  { nome: "Holanda", bandeira: holandaSrc },
  { nome: "Senegal", bandeira: senegalSrc },
  { nome: "Inglaterra", bandeira: inglaterraSrc },
  { nome: "Estado Unidos", bandeira: estadosUnidosSrc },
  { nome: "Argentina", bandeira: argentinaSrc },
  { nome: "Polônia", bandeira: poloniaSrc },
  { nome: "França", bandeira: francaSrc },
  { nome: "Austrália", bandeira: australiaSrc },
  { nome: "Japão", bandeira: japaoSrc },
  { nome: "Espanha", bandeira: espanhaSrc },
  { nome: "Marrocos", bandeira: marrocosSrc },
  { nome: "Croácia", bandeira: croaciaSrc },
  { nome: "Brasil", bandeira: brasilSrc },
  { nome: "Suíça", bandeira: suicaSrc },
  { nome: "Portugal", bandeira: portugalSrc },
  { nome: "Coreia do Sul", bandeira: coreiaDoSulSrc },
] as const;

export type Time = typeof times[number];

export const timesNomes = times.map((time) => time.nome);
