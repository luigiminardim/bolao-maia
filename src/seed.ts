import { Team } from "./entity/Team";
import {
  GroupListGroupChampionship,
  GroupListChampionship,
  CupChampionship,
} from "./entity/Championship";
import { BinaryTree } from "./utils/BinaryTree";
import {
  CupSweepstake,
  GroupListSweepstake,
  PoolSweepstake,
} from "./entity/Sweepstake";
import { ScorePolicyBuilder } from "./entity/ScorePolicy";
import {
  teamRepository,
  groupListChampionshipRepository,
  cupChampionshipRepository,
  poolSweepstakeRepository,
} from "./usecase/index";

async function seed() {
  console.log("Seeding started...");

  const mexico = new Team("mexico", "México");
  const southKorea = new Team("south-korea", "Coreia do Sul");
  const southAfrica = new Team("south-africa", "África do Sul");
  const czechia = new Team("czechia", "Tchéquia");
  const canada = new Team("canada", "Canadá");
  const switzerland = new Team("switzerland", "Suíça");
  const qatar = new Team("qatar", "Catar");
  const bosniaHerzegovina = new Team(
    "bosnia-herzegovina",
    "Bósnia e Herzegovina",
  );
  const brazil = new Team("brazil", "Brasil");
  const morocco = new Team("morocco", "Marrocos");
  const scotland = new Team("scotland", "Escócia");
  const haiti = new Team("haiti", "Haiti");
  const usa = new Team("usa", "Estados Unidos");
  const paraguay = new Team("paraguay", "Paraguai");
  const australia = new Team("australia", "Austrália");
  const turkiye = new Team("turkiye", "Turquia");
  const germany = new Team("germany", "Alemanha");
  const ecuador = new Team("ecuador", "Equador");
  const ivoryCoast = new Team("ivory-coast", "Costa do Marfim");
  const curacao = new Team("curacao", "Curaçao");
  const netherlands = new Team("netherlands", "Holanda");
  const japan = new Team("japan", "Japão");
  const tunisia = new Team("tunisia", "Tunísia");
  const sweden = new Team("sweden", "Suécia");
  const belgium = new Team("belgium", "Bélgica");
  const iran = new Team("iran", "Irã");
  const egypt = new Team("egypt", "Egito");
  const newZealand = new Team("new-zealand", "Nova Zelândia");
  const spain = new Team("spain", "Espanha");
  const uruguay = new Team("uruguay", "Uruguai");
  const saudiArabia = new Team("saudi-arabia", "Arábia Saudita");
  const capeVerde = new Team("cape-verde", "Cabo Verde");
  const france = new Team("france", "França");
  const senegal = new Team("senegal", "Senegal");
  const norway = new Team("norway", "Noruega");
  const iraq = new Team("iraq", "Iraque");
  const argentina = new Team("argentina", "Argentina");
  const austria = new Team("austria", "Áustria");
  const algeria = new Team("algeria", "Argélia");
  const jordan = new Team("jordan", "Jordânia");
  const portugal = new Team("portugal", "Portugal");
  const colombia = new Team("colombia", "Colômbia");
  const uzbekistan = new Team("uzbekistan", "Uzbequistão");
  const drCongo = new Team("dr-congo", "RD Congo");
  const england = new Team("england", "Inglaterra");
  const croatia = new Team("croatia", "Croácia");
  const panama = new Team("panama", "Panamá");
  const ghana = new Team("ghana", "Gana");

  const teams = [
    mexico,
    southKorea,
    southAfrica,
    czechia,
    canada,
    switzerland,
    qatar,
    bosniaHerzegovina,
    brazil,
    morocco,
    scotland,
    haiti,
    usa,
    paraguay,
    australia,
    turkiye,
    germany,
    ecuador,
    ivoryCoast,
    curacao,
    netherlands,
    japan,
    tunisia,
    sweden,
    belgium,
    iran,
    egypt,
    newZealand,
    spain,
    uruguay,
    saudiArabia,
    capeVerde,
    france,
    senegal,
    norway,
    iraq,
    argentina,
    austria,
    algeria,
    jordan,
    portugal,
    colombia,
    uzbekistan,
    drCongo,
    england,
    croatia,
    panama,
    ghana,
  ];

  for (const team of teams) {
    await teamRepository.save(team);
  }

  // GroupListChampionship
  const worldCup2026GroupList = new GroupListChampionship(
    "2026-world-cup",
    "Copa do Mundo FIFA 2026",
    [
      new GroupListGroupChampionship("A", [
        mexico,
        southKorea,
        czechia,
        southAfrica,
      ]),
      new GroupListGroupChampionship("B", [
        canada,
        switzerland,
        bosniaHerzegovina,
        qatar,
      ]),
      new GroupListGroupChampionship("C", [
        brazil,
        morocco,
        scotland,
        haiti,
      ]),
      new GroupListGroupChampionship("D", [
        usa,
        australia,
        paraguay,
        turkiye,
      ]),
      new GroupListGroupChampionship("E", [
        germany,
        ivoryCoast,
        ecuador,
        curacao,
      ]),
      new GroupListGroupChampionship("F", [
        sweden,
        japan,
        netherlands,
        tunisia,
      ]),
      new GroupListGroupChampionship("G", [
        newZealand,
        iran,
        belgium,
        egypt,
      ]),
      new GroupListGroupChampionship("H", [
        uruguay,
        saudiArabia,
        spain,
        capeVerde,
      ]),
      new GroupListGroupChampionship("I", [
        norway,
        france,
        senegal,
        iraq,
      ]),
      new GroupListGroupChampionship("J", [
        argentina,
        austria,
        jordan,
        algeria,
      ]),
      new GroupListGroupChampionship("K", [
        colombia,
        drCongo,
        portugal,
        uzbekistan,
      ]),
      new GroupListGroupChampionship("L", [
        england, 
        ghana, 
        panama, 
        croatia,
      ]),
    ],
    [scotland, paraguay, netherlands, belgium, portugal, spain, czechia, bosniaHerzegovina],
    2,
    new Date("2026-06-11T19:00:00Z"),
  );

  await groupListChampionshipRepository.save(
    "2026-world-cup",
    worldCup2026GroupList,
  );

  // CupChampionship
  const worldCup2026Cup = new CupChampionship(
    "2026-world-cup",
    "Copa do Mundo FIFA 2026",
    new BinaryTree(null, [
      new BinaryTree(null, [
        new BinaryTree(null, [
          new BinaryTree(null, [
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
          ]),
          new BinaryTree(null, [
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
          ]),
        ]),
        new BinaryTree(null, [
          new BinaryTree(null, [
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
          ]),
          new BinaryTree(null, [
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
          ]),
        ]),
      ]),
      new BinaryTree(null, [
        new BinaryTree(null, [
          new BinaryTree(null, [
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
          ]),
          new BinaryTree(null, [
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
          ]),
        ]),
        new BinaryTree(null, [
          new BinaryTree(null, [
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
          ]),
          new BinaryTree(null, [
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
            new BinaryTree(null, [new BinaryTree(null), new BinaryTree(null)]),
          ]),
        ]),
      ]),
    ]),
    true,
    null,
    new Date("2026-06-28T19:00:00Z"),
  );

  await cupChampionshipRepository.save(worldCup2026Cup);

  const worldCup2026groupListSweepstake = new GroupListSweepstake(
    "2026-world-cup",
    "Fase de Grupos",
    "Ordene as posições dos times dos grupos A a L e selecione os 8 melhores terceiros colocados que avançam de fase.",
    worldCup2026GroupList,
    ScorePolicyBuilder.buildGroupListScorePolicyFromId(
      "scaled(10, log2(inverse-probability-qualified-position))",
    ),
  );

  const worldCup2026CupSweepstake = new CupSweepstake(
    "2026-world-cup",
    "Mata-Mata",
    "Defina os vencedores de cada confronto eliminatório até a grande final.",
    worldCup2026Cup,
    ScorePolicyBuilder.buildCupScorePolicyFromId(
      "scaled(10, log2(inverse-probability-position))",
    ),
  );

  const worldCupSweepstake = new PoolSweepstake(
    "2026-world-cup",
    "Copa do Mundo",
    "Fifa World Cup 2026",
    "Dê seus palpites para o maior torneio de futebol do planeta. Complete a fase de grupos, ordene as classificações, defina os melhores terceiros colocados e dispute a liderança geral!",
    [
      {
        kind: "group",
        sweepstake: worldCup2026groupListSweepstake,
        factor: 1,
      },
      {
        kind: "cup",
        sweepstake: worldCup2026CupSweepstake,
        factor: 3,
      },
    ],
  );

  await poolSweepstakeRepository.save(worldCupSweepstake);

  console.log("Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
