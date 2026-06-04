import {
  PoolSweepstake,
  SweepstakeItem,
  GroupListSweepstake,
  CupSweepstake,
} from "../entity/Sweepstake";
import { GroupListChampionshipRepository } from "./GroupListChampionshipRepository";
import { CupChampionshipRepository } from "./CupChampionshipRepository";
import {
  ScorePolicyBuilder,
  GroupListScorePolicy,
  CupScorePolicy,
  InverseProbabilityPositionScorePolicy,
  InverseProbabilityQualifiedPositionGroupListScorePolicy,
  WithLogarithm2GroupScorePolicy,
  WithLogarithm2CupScorePolicy,
} from "../entity/ScorePolicy";
import { JsonFileStorage } from "../infra/JsonFileStorage";

export interface CupSweepstakeDao {
  id: string;
  championship: string; // championship id
  scorePolicy: string; // score policy id
  startTime: string; // ISO
  endTime: string; // ISO
}

export interface GroupListSweepstakeDao {
  id: string;
  championship: string; // championship id
  scorePolicy: string; // score policy id
  startTime: string; // ISO
  endTime: string; // ISO
}

export type SweepstakeItemDao =
  | { kind: "group"; sweepstake: GroupListSweepstakeDao; factor: number }
  | { kind: "cup"; sweepstake: CupSweepstakeDao; factor: number };

export interface PoolSweepstakeDao {
  id: string;
  subSweepstakeList: SweepstakeItemDao[];
}

function serializeGroupListScorePolicy(policy: GroupListScorePolicy): string {
  if (policy instanceof InverseProbabilityPositionScorePolicy) {
    return InverseProbabilityPositionScorePolicy.idPrefix;
  }
  if (
    policy instanceof InverseProbabilityQualifiedPositionGroupListScorePolicy
  ) {
    return InverseProbabilityQualifiedPositionGroupListScorePolicy.idPrefix;
  }
  if (policy instanceof WithLogarithm2GroupScorePolicy) {
    return `log2(${serializeGroupListScorePolicy(policy.scorePolicy)})`;
  }
  throw new Error(
    `Unknown GroupListScorePolicy type: ${policy.constructor.name}`,
  );
}

function serializeCupScorePolicy(policy: CupScorePolicy): string {
  if (policy instanceof InverseProbabilityPositionScorePolicy) {
    return InverseProbabilityPositionScorePolicy.idPrefix;
  }
  if (policy instanceof WithLogarithm2CupScorePolicy) {
    return `log2(${serializeCupScorePolicy(policy.scorePolicy)})`;
  }
  throw new Error(`Unknown CupScorePolicy type: ${policy.constructor.name}`);
}

export class PoolSweepstakeRepository {
  private readonly storage: JsonFileStorage;
  private readonly groupListChampionshipRepository: GroupListChampionshipRepository;
  private readonly cupChampionshipRepository: CupChampionshipRepository;

  constructor(
    storage: JsonFileStorage,
    groupListChampionshipRepository?: GroupListChampionshipRepository,
    cupChampionshipRepository?: CupChampionshipRepository,
  ) {
    this.storage = storage;
    this.groupListChampionshipRepository =
      groupListChampionshipRepository ||
      new GroupListChampionshipRepository(this.storage);
    this.cupChampionshipRepository =
      cupChampionshipRepository || new CupChampionshipRepository(this.storage);
  }

  async save(poolSweepstake: PoolSweepstake): Promise<void> {
    const subSweepstakeDaoList: SweepstakeItemDao[] = [];

    for (const item of poolSweepstake.subSweepstakeList) {
      if (item.kind === "group") {
        const sweepstake = item.sweepstake;
        const groupDao: GroupListSweepstakeDao = {
          id: sweepstake.id,
          championship: sweepstake.championship.id,
          scorePolicy: serializeGroupListScorePolicy(sweepstake.scorePolicy),
          startTime: sweepstake.startTime.toISOString(),
          endTime: sweepstake.endTime.toISOString(),
        };
        subSweepstakeDaoList.push({
          kind: "group",
          sweepstake: groupDao,
          factor: item.factor,
        });
      } else if (item.kind === "cup") {
        const sweepstake = item.sweepstake;
        const cupDao: CupSweepstakeDao = {
          id: sweepstake.id,
          championship: sweepstake.championship.id,
          scorePolicy: serializeCupScorePolicy(sweepstake.scorePolicy),
          startTime: sweepstake.startTime.toISOString(),
          endTime: sweepstake.endTime.toISOString(),
        };
        subSweepstakeDaoList.push({
          kind: "cup",
          sweepstake: cupDao,
          factor: item.factor,
        });
      }
    }

    const dao: PoolSweepstakeDao = {
      id: poolSweepstake.id,
      subSweepstakeList: subSweepstakeDaoList,
    };

    await this.storage.save<PoolSweepstakeDao>(
      `/sweepstake/PoolSweepstake/${poolSweepstake.id}`,
      dao,
    );
  }

  async findById(id: string): Promise<PoolSweepstake | null> {
    if (id !== "2026-world-cup") {
      return null;
    }

    const dao: PoolSweepstakeDao = {
      id: "2026-world-cup",
      subSweepstakeList: [
        {
          kind: "group",
          sweepstake: {
            id: "2026-world-cup",
            championship: "2026-world-cup",
            scorePolicy: "inverse-probability-qualified-position",
            startTime: "2026-06-11T12:00:00.000Z",
            endTime: "2026-07-19T20:00:00.000Z",
          },
          factor: 1,
        },
      ],
    };

    const subSweepstakeList: SweepstakeItem[] = [];

    for (const item of dao.subSweepstakeList) {
      if (item.kind === "group") {
        const groupDao = item.sweepstake;
        const championship =
          await this.groupListChampionshipRepository.findById(
            groupDao.championship,
          );
        if (!championship) {
          throw new Error(
            `GroupListChampionship not found: ${groupDao.championship}`,
          );
        }
        const scorePolicy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
          groupDao.scorePolicy,
        );
        const groupSweepstake = new GroupListSweepstake(
          groupDao.id,
          championship,
          scorePolicy,
          new Date(groupDao.startTime),
          new Date(groupDao.endTime),
        );
        subSweepstakeList.push({
          kind: "group",
          sweepstake: groupSweepstake,
          factor: item.factor,
        });
      } else if (item.kind === "cup") {
        const cupDao = item.sweepstake;
        const championship = await this.cupChampionshipRepository.findById(
          cupDao.championship,
        );
        if (!championship) {
          throw new Error(`CupChampionship not found: ${cupDao.championship}`);
        }
        const scorePolicy = ScorePolicyBuilder.buildCupScorePolicyFromId(
          cupDao.scorePolicy,
        );
        const cupSweepstake = new CupSweepstake(
          cupDao.id,
          championship,
          scorePolicy,
          new Date(cupDao.startTime),
          new Date(cupDao.endTime),
        );
        subSweepstakeList.push({
          kind: "cup",
          sweepstake: cupSweepstake,
          factor: item.factor,
        });
      }
    }

    return new PoolSweepstake(dao.id, subSweepstakeList);
  }
}
