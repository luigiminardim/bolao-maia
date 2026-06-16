import { Team } from "../entity/Team";

import { JsonStorage } from "../infra/JsonStorage";

interface TeamDao {
  id: string;
  name: string;
}

export class TeamRepository {
  private readonly storage: JsonStorage;

  constructor(storage: JsonStorage) {
    this.storage = storage;
  }

  async save(team: Team): Promise<void> {
    const dao: TeamDao = { id: team.id, name: team.name };
    await this.storage.save<TeamDao>(`/sweepstake/Team/${team.id}`, dao);
  }

  async findAll(): Promise<Team[]> {
    const ids = await this.storage.listIds("/sweepstake/Team");
    const teams: Team[] = [];
    for (const fullId of ids) {
      const teamId = fullId.split("/").pop();
      if (!teamId) continue;
      const team = await this.findById(teamId);
      if (team) {
        teams.push(team);
      }
    }
    return teams;
  }

  async findById(id: string): Promise<Team | null> {
    const dao = await this.storage.load<TeamDao>(`/sweepstake/Team/${id}`);
    if (!dao) {
      return null;
    }
    return new Team(dao.id, dao.name);
  }
}
