import { Team } from "../entity/Team";

export class TeamRepository {
  private static readonly TEAMS: Team[] = [
    // Hosts
    new Team("united-states", "United States"),
    new Team("mexico", "Mexico"),
    new Team("canada", "Canada"),

    // UEFA (Europe)
    new Team("england", "England"),
    new Team("france", "France"),
    new Team("germany", "Germany"),
    new Team("spain", "Spain"),
    new Team("portugal", "Portugal"),
    new Team("netherlands", "Netherlands"),
    new Team("italy", "Italy"),
    new Team("belgium", "Belgium"),
    new Team("croatia", "Croatia"),
    new Team("denmark", "Denmark"),
    new Team("switzerland", "Switzerland"),
    new Team("poland", "Poland"),
    new Team("austria", "Austria"),
    new Team("sweden", "Sweden"),
    new Team("scotland", "Scotland"),
    new Team("wales", "Wales"),

    // CONMEBOL (South America)
    new Team("argentina", "Argentina"),
    new Team("brazil", "Brazil"),
    new Team("uruguay", "Uruguay"),
    new Team("colombia", "Colombia"),
    new Team("ecuador", "Ecuador"),
    new Team("paraguay", "Paraguay"),

    // CAF (Africa)
    new Team("morocco", "Morocco"),
    new Team("senegal", "Senegal"),
    new Team("egypt", "Egypt"),
    new Team("nigeria", "Nigeria"),
    new Team("cameroon", "Cameroon"),
    new Team("tunisia", "Tunisia"),
    new Team("algeria", "Algeria"),
    new Team("ghana", "Ghana"),
    new Team("ivory-coast", "Ivory Coast"),

    // AFC (Asia)
    new Team("japan", "Japan"),
    new Team("south-korea", "South Korea"),
    new Team("iran", "Iran"),
    new Team("australia", "Australia"),
    new Team("saudi-arabia", "Saudi Arabia"),
    new Team("qatar", "Qatar"),
    new Team("uzbekistan", "Uzbekistan"),
    new Team("jordan", "Jordan"),

    // CONCACAF (North/Central America & Caribbean - excluding hosts)
    new Team("costa-rica", "Costa Rica"),
    new Team("jamaica", "Jamaica"),
    new Team("panama", "Panama"),

    // OFC (Oceania)
    new Team("new-zealand", "New Zealand"),

    // Play-offs / Debutants / Others
    new Team("curacao", "Curaçao"),
    new Team("cape-verde", "Cape Verde"),
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
