import { Team } from "../entity/Team";

export class TeamRepository {
  private static readonly TEAMS: Team[] = [
    new Team("mexico", "México"),
    new Team("south-korea", "Coreia do Sul"),
    new Team("south-africa", "África do Sul"),
    new Team("czechia", "Tchéquia"),
    new Team("canada", "Canadá"),
    new Team("switzerland", "Suíça"),
    new Team("qatar", "Catar"),
    new Team("bosnia-herzegovina", "Bósnia e Herzegovina"),
    new Team("brazil", "Brasil"),
    new Team("morocco", "Marrocos"),
    new Team("scotland", "Escócia"),
    new Team("haiti", "Haiti"),
    new Team("usa", "Estados Unidos"),
    new Team("paraguay", "Paraguai"),
    new Team("australia", "Austrália"),
    new Team("turkiye", "Turquia"),
    new Team("germany", "Alemanha"),
    new Team("ecuador", "Equador"),
    new Team("ivory-coast", "Costa do Marfim"),
    new Team("curacao", "Curaçao"),
    new Team("netherlands", "Holanda"),
    new Team("japan", "Japão"),
    new Team("tunisia", "Tunísia"),
    new Team("sweden", "Suécia"),
    new Team("belgium", "Bélgica"),
    new Team("iran", "Irã"),
    new Team("egypt", "Egito"),
    new Team("new-zealand", "Nova Zelândia"),
    new Team("spain", "Espanha"),
    new Team("uruguay", "Uruguai"),
    new Team("saudi-arabia", "Arábia Saudita"),
    new Team("cape-verde", "Cabo Verde"),
    new Team("france", "França"),
    new Team("senegal", "Senegal"),
    new Team("norway", "Noruega"),
    new Team("iraq", "Iraque"),
    new Team("argentina", "Argentina"),
    new Team("austria", "Áustria"),
    new Team("algeria", "Argélia"),
    new Team("jordan", "Jordânia"),
    new Team("portugal", "Portugal"),
    new Team("colombia", "Colômbia"),
    new Team("uzbekistan", "Uzbequistão"),
    new Team("dr-congo", "RD Congo"),
    new Team("england", "Inglaterra"),
    new Team("croatia", "Croácia"),
    new Team("panama", "Panamá"),
    new Team("ghana", "Gana"),
  ];

  async findAll(): Promise<Team[]> {
    return TeamRepository.TEAMS.map((t) => new Team(t.id, t.name));
  }

  async findById(id: string): Promise<Team | null> {
    const team = TeamRepository.TEAMS.find(
      (t) => t.id.toLowerCase() === id.toLowerCase(),
    );
    if (!team) {
      return null;
    }
    return new Team(team.id, team.name);
  }
}
