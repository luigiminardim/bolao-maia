import {
  GroupListGroupChampionship,
  GroupListChampionship,
} from "../entity/Championship";
import { TeamRepository } from "./TeamRepository";
import { JsonStorage } from "../infra/JsonStorage";

export interface GroupChampionshipDao {
  id: string;
  classification: (string | null)[]; // team IDs
}

export type GroupDao = GroupChampionshipDao;

export interface GroupListChampionshipDao {
  name: string;
  groups: GroupDao[];
  extraQualifiedList: (null | string)[]; // team IDs
  maxRegularQualifiedPosition: number;
  startDate: string; // ISO
}

export interface GroupListChampionshipRepository {
  save(id: string, championship: GroupListChampionship): Promise<void>;
  findById(id: string): Promise<GroupListChampionship | null>;
}

export class FileGroupListChampionshipRepository implements GroupListChampionshipRepository {
  private readonly storage: JsonStorage;
  private readonly teamRepository: TeamRepository;

  constructor(storage: JsonStorage, teamRepository: TeamRepository) {
    this.storage = storage;
    this.teamRepository = teamRepository;
  }

  async save(id: string, championship: GroupListChampionship): Promise<void> {
    const dao: GroupListChampionshipDao = {
      name: championship.getName(),
      groups: championship.getGroups().map((group) => ({
        id: group.getId(),
        classification: group.classification.map((team) =>
          team ? team.id : null,
        ),
      })),
      extraQualifiedList: championship
        .getExtraQualifiedList()
        .map((team) => (team ? team.id : null)),
      maxRegularQualifiedPosition: championship.maxRegularQualifiedPosition,
      startDate: championship.getStartDate().toISOString(),
    };
    await this.storage.save<GroupListChampionshipDao>(
      `/sweepstake/GroupListChampionship/${id}`,
      dao,
    );
  }

  async findById(id: string): Promise<GroupListChampionship | null> {
    const dao = await this.storage.load<GroupListChampionshipDao>(
      `/sweepstake/GroupListChampionship/${id}`,
    );
    if (!dao) {
      return null;
    }

    return await mapGroupListChampionshipDaoToEntity(
      dao,
      id,
      this.teamRepository,
    );
  }
}

async function mapGroupListChampionshipDaoToEntity(
  dao: GroupListChampionshipDao,
  id: string,
  teamRepository: TeamRepository,
): Promise<GroupListChampionship> {
  const groups: GroupListGroupChampionship[] = [];
  for (const groupDao of dao.groups) {
    const classification = [];
    for (const teamId of groupDao.classification) {
      if (teamId === null) {
        classification.push(null);
      } else {
        const team = await teamRepository.findById(teamId);
        if (!team) {
          throw new Error(`Team not found: ${teamId}`);
        }
        classification.push(team);
      }
    }
    groups.push(new GroupListGroupChampionship(groupDao.id, classification));
  }

  const extraQualifiedList = [];
  for (const teamId of dao.extraQualifiedList) {
    if (teamId === null) {
      extraQualifiedList.push(null);
    } else {
      const team = await teamRepository.findById(teamId);
      if (!team) {
        throw new Error(`Team not found: ${teamId}`);
      }
      extraQualifiedList.push(team);
    }
  }

  return new GroupListChampionship(
    id,
    dao.name,
    groups,
    extraQualifiedList,
    dao.maxRegularQualifiedPosition,
    new Date(dao.startDate),
  );
}
