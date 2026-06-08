import {
  GroupChampionship,
  GroupListChampionship,
} from "../entity/Championship";
import { TeamRepository } from "./TeamRepository";
import { JsonStorage } from "../infra/JsonStorage";

export interface GroupChampionshipDao {
  id: string;
  classification: string[]; // team IDs
}

export type GroupDao = GroupChampionshipDao;

export interface GroupListChampionshipDao {
  groups: GroupDao[];
  extraqualifiedList: (null | string)[]; // team IDs
  maxRegularQualifiedPosition: number;
}

export class GroupListChampionshipRepository {
  private static GROUP_LIST_MOCK: GroupListChampionshipDao = {
    groups: [
      {
        id: "A",
        classification: ["mexico", "south-africa", "south-korea", "czechia"],
      },
      {
        id: "B",
        classification: [
          "canada",
          "bosnia-herzegovina",
          "qatar",
          "switzerland",
        ],
      },
      {
        id: "C",
        classification: ["brazil", "morocco", "haiti", "scotland"],
      },
      {
        id: "D",
        classification: ["usa", "paraguay", "australia", "turkiye"],
      },
      {
        id: "E",
        classification: ["germany", "curacao", "ivory-coast", "ecuador"],
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
    extraqualifiedList: Array(8).fill(null),
    maxRegularQualifiedPosition: 2,
  };

  private readonly storage: JsonStorage;
  private readonly teamRepository: TeamRepository;

  constructor(storage: JsonStorage, teamRepository: TeamRepository) {
    this.storage = storage;
    this.teamRepository = teamRepository;
  }

  async save(id: string, championship: GroupListChampionship): Promise<void> {
    const dao: GroupListChampionshipDao = {
      groups: championship.getGroups().map((group) => ({
        id: group.id,
        classification: group.classification.map((team) => team.id),
      })),
      extraqualifiedList: championship
        .getExtraQualifiedList()
        .map((team) => (team ? team.id : null)),
      maxRegularQualifiedPosition: championship.maxRegularQualifiedPosition,
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
    const dao = GroupListChampionshipRepository.GROUP_LIST_MOCK;

    const groups: GroupChampionship[] = [];
    for (const groupDao of dao.groups) {
      const classification = [];
      for (const teamId of groupDao.classification) {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
          throw new Error(`Team not found: ${teamId}`);
        }
        classification.push(team);
      }
      groups.push(new GroupChampionship(groupDao.id, classification));
    }

    const extraQualifiedList = [];
    for (const teamId of dao.extraqualifiedList) {
      if (teamId === null) {
        extraQualifiedList.push(null);
      } else {
        const team = await this.teamRepository.findById(teamId);
        if (!team) {
          throw new Error(`Team not found: ${teamId}`);
        }
        extraQualifiedList.push(team);
      }
    }

    return new GroupListChampionship(
      id,
      groups,
      extraQualifiedList,
      dao.maxRegularQualifiedPosition,
    );
  }
}
