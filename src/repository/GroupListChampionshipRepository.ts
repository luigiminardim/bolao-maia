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
    let dao = await this.storage.load<GroupListChampionshipDao>(
      `/sweepstake/GroupListChampionship/${id}`,
    );
    if (!dao) {
      if (id === "2026-world-cup") {
        dao = this.getMockedWorldCup2026();
      } else {
        return null;
      }
    }

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

  private getMockedWorldCup2026(): GroupListChampionshipDao {
    return {
      groups: [
        {
          id: "A",
          classification: ["united-states", "morocco", "japan", "wales"],
        },
        {
          id: "B",
          classification: ["canada", "switzerland", "qatar", "jamaica"],
        },
        {
          id: "C",
          classification: ["mexico", "senegal", "south-korea", "panama"],
        },
        {
          id: "D",
          classification: ["argentina", "denmark", "iran", "costa-rica"],
        },
        {
          id: "E",
          classification: ["brazil", "croatia", "australia", "cape-verde"],
        },
        {
          id: "F",
          classification: ["france", "poland", "saudi-arabia", "curacao"],
        },
        {
          id: "G",
          classification: ["spain", "austria", "uzbekistan", "new-zealand"],
        },
        { id: "H", classification: ["england", "sweden", "jordan", "ecuador"] },
        {
          id: "I",
          classification: ["portugal", "scotland", "egypt", "paraguay"],
        },
        {
          id: "J",
          classification: ["germany", "belgium", "nigeria", "colombia"],
        },
        {
          id: "K",
          classification: ["netherlands", "italy", "cameroon", "tunisia"],
        },
        {
          id: "L",
          classification: ["algeria", "ghana", "ivory-coast", "uruguay"],
        },
      ],
      extraqualifiedList: Array(8).fill(null),
      maxRegularQualifiedPosition: 2,
    };
  }
}
