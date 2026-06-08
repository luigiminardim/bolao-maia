import {
  PoolSweepstake,
  SweepstakeItem,
  GroupListSweepstake,
  CupSweepstake,
} from "../entity/Sweepstake";
import {
  GroupListChampionshipRepository,
  FileGroupListChampionshipRepository,
} from "./GroupListChampionshipRepository";
import {
  CupChampionshipRepository,
  FileCupChampionshipRepository,
} from "./CupChampionshipRepository";
import { TeamRepository } from "./TeamRepository";
import {
  ScorePolicyBuilder,
  GroupListScorePolicy,
  CupScorePolicy,
  InverseProbabilityPositionScorePolicy,
  InverseProbabilityQualifiedPositionGroupListScorePolicy,
  WithLogarithm2GroupScorePolicy,
  WithLogarithm2CupScorePolicy,
} from "../entity/ScorePolicy";
import { JsonStorage } from "../infra/JsonStorage";

export interface CupSweepstakeDao {
  id: string;
  championship: string; // championship id
  scorePolicy: string; // score policy id
}

export interface GroupListSweepstakeDao {
  id: string;
  championship: string; // championship id
  scorePolicy: string; // score policy id
}

export type SweepstakeItemDao =
  | { kind: "group"; sweepstake: GroupListSweepstakeDao; factor: number }
  | { kind: "cup"; sweepstake: CupSweepstakeDao; factor: number };

export interface PoolSweepstakeDao {
  id: string;
  subSweepstakeList: SweepstakeItemDao[];
}

export interface PoolSweepstakeRepository {
  save(poolSweepstake: PoolSweepstake): Promise<void>;
  findById(id: string): Promise<PoolSweepstake | null>;
  findAll(): Promise<PoolSweepstake[]>;
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

export class FilePoolSweepstakeRepository implements PoolSweepstakeRepository {
  private readonly storage: JsonStorage;
  private readonly groupListChampionshipRepository: GroupListChampionshipRepository;
  private readonly cupChampionshipRepository: CupChampionshipRepository;

  constructor(
    storage: JsonStorage,
    groupListChampionshipRepository?: GroupListChampionshipRepository,
    cupChampionshipRepository?: CupChampionshipRepository,
  ) {
    this.storage = storage;
    this.groupListChampionshipRepository =
      groupListChampionshipRepository ||
      new FileGroupListChampionshipRepository(
        this.storage,
        new TeamRepository(),
      );
    this.cupChampionshipRepository =
      cupChampionshipRepository ||
      new FileCupChampionshipRepository(this.storage);
  }

  async save(poolSweepstake: PoolSweepstake): Promise<void> {
    const subSweepstakeDaoList: SweepstakeItemDao[] = [];

    for (const item of poolSweepstake.subSweepstakeList) {
      if (item.kind === "group") {
        const sweepstake = item.sweepstake;
        const groupDao: GroupListSweepstakeDao = {
          id: sweepstake.id,
          championship: sweepstake.championship.getId(),
          scorePolicy: serializeGroupListScorePolicy(sweepstake.scorePolicy),
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
          championship: sweepstake.championship.getId(),
          scorePolicy: serializeCupScorePolicy(sweepstake.scorePolicy),
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
            scorePolicy: "log2(inverse-probability-qualified-position)",
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

  async findAll(): Promise<PoolSweepstake[]> {
    const pool = await this.findById("2026-world-cup");
    return pool ? [pool] : [];
  }
}

export class MockPoolSweepstakeRepository implements PoolSweepstakeRepository {
  private readonly groupListChampionshipRepository: GroupListChampionshipRepository;
  private readonly cupChampionshipRepository: CupChampionshipRepository;

  constructor(
    groupListChampionshipRepository: GroupListChampionshipRepository,
    cupChampionshipRepository: CupChampionshipRepository,
  ) {
    this.groupListChampionshipRepository = groupListChampionshipRepository;
    this.cupChampionshipRepository = cupChampionshipRepository;
  }

  async save(_poolSweepstake: PoolSweepstake): Promise<void> {}

  async findById(id: string): Promise<PoolSweepstake | null> {
    if (id !== "test-subsweepstakes-all-status") return null;

    const subSweepstakeList: SweepstakeItem[] = [];
    const statuses = [
      "test-status-draft",
      "test-status-waiting",
      "test-status-running",
    ];

    for (const status of statuses) {
      // Group
      const groupChamp =
        await this.groupListChampionshipRepository.findById(status);
      if (groupChamp) {
        subSweepstakeList.push({
          kind: "group",
          sweepstake: new GroupListSweepstake(
            `group-${status}`,
            groupChamp,
            ScorePolicyBuilder.buildGroupListScorePolicyFromId(
              "log2(inverse-probability-qualified-position)",
            ),
          ),
          factor: 1,
        });
      }

      // Cup
      const cupChamp = await this.cupChampionshipRepository.findById(status);
      if (cupChamp) {
        subSweepstakeList.push({
          kind: "cup",
          sweepstake: new CupSweepstake(
            `cup-${status}`,
            cupChamp,
            ScorePolicyBuilder.buildCupScorePolicyFromId(
              "inverse-probability-position",
            ),
          ),
          factor: 1,
        });
      }
    }

    return new PoolSweepstake(id, subSweepstakeList);
  }

  async findAll(): Promise<PoolSweepstake[]> {
    const pool = await this.findById("test-subsweepstakes-all-status");
    return pool ? [pool] : [];
  }
}
