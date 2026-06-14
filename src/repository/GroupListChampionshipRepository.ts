import {
  GroupChampionship,
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

export const GROUP_LIST_MOCK_DAO: GroupListChampionshipDao = {
  name: "Copa do Mundo FIFA 2026",
  groups: [
    {
      id: "A",
      classification: ["mexico", "south-korea", "czechia", "south-africa"],
    },
    {
      id: "B",
      classification: ["switzerland", "canada", "qatar", "bosnia-herzegovina"],
    },
    {
      id: "C",
      classification: ["scotland", "morocco", "brazil", "haiti"],
    },
    {
      id: "D",
      classification: ["usa", "australia", "turkiye", "paraguay"],
    },
    {
      id: "E",
      classification: ["germany", "ecuador", "ivory-coast", "curacao"],
    },
    {
      id: "F",
      classification: ["netherlands", "japan", "tunisia", "sweden"],
    },
    {
      id: "G",
      classification: ["belgium", "egypt", "iran", "new-zealand"],
    },
    {
      id: "H",
      classification: ["spain", "cape-verde", "saudi-arabia", "uruguay"],
    },
    {
      id: "I",
      classification: ["france", "senegal", "iraq", "norway"],
    },
    {
      id: "J",
      classification: ["argentina", "algeria", "austria", "jordan"],
    },
    {
      id: "K",
      classification: ["portugal", "dr-congo", "uzbekistan", "colombia"],
    },
    {
      id: "L",
      classification: ["england", "croatia", "ghana", "panama"],
    },
  ],
  extraQualifiedList: Array(8).fill(null),
  maxRegularQualifiedPosition: 2,
  startDate: "2026-06-11T19:00:00Z",
};

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
    if (id !== "2026-world-cup") {
      return null;
    }
    const dao = GROUP_LIST_MOCK_DAO;

    return await mapGroupListChampionshipDaoToEntity(
      dao,
      id,
      this.teamRepository,
    );
  }
}

export class MockGroupListChampionshipRepository implements GroupListChampionshipRepository {
  private readonly teamRepository: TeamRepository;

  constructor(teamRepository: TeamRepository) {
    this.teamRepository = teamRepository;
  }

  async save(_id: string, _championship: GroupListChampionship): Promise<void> {
    // Mock save does nothing
  }

  async findById(id: string): Promise<GroupListChampionship | null> {
    const dao = structuredClone(GROUP_LIST_MOCK_DAO);
    if (id === "test-status-draft") {
      const group = dao.groups[0];
      if (!group) throw new Error("Mock group A not found");
      group.classification[0] = null; // simulate missing team
      dao.startDate = new Date(Date.now() + 1000000000).toISOString();
      dao.name = "Test Draft Status of Group List";
    } else if (id === "test-status-waiting") {
      dao.startDate = new Date(Date.now() + 1000000000).toISOString();
      dao.name = "Test Waiting Status of Group List";
    } else if (id === "test-status-running") {
      dao.startDate = new Date(Date.now() - 1000000000).toISOString();
      dao.name = "Test Running Status of Group List";
    } else {
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
  const groups: GroupChampionship[] = [];
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
    groups.push(new GroupChampionship(groupDao.id, classification));
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
