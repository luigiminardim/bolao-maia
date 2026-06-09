import { PoolSweepstake } from "../entity/Sweepstake";
import { GroupListChampionshipRepository } from "./GroupListChampionshipRepository";
import { CupChampionshipRepository } from "./CupChampionshipRepository";
import { JsonStorage } from "../infra/JsonStorage";

import { PoolSweepstakeDao, SweepstakeDaoBuilder } from "./dao/SweepstakeDao";

export interface PoolSweepstakeRepository {
  save(poolSweepstake: PoolSweepstake): Promise<void>;
  findById(id: string): Promise<PoolSweepstake | null>;
  findAll(): Promise<PoolSweepstake[]>;
}

export class FilePoolSweepstakeRepository implements PoolSweepstakeRepository {
  private readonly storage: JsonStorage;
  private readonly groupListChampionshipRepository: GroupListChampionshipRepository;
  private readonly cupChampionshipRepository: CupChampionshipRepository;

  private static readonly POOL_SWEEPSTAKE_DAO_LIST: PoolSweepstakeDao[] = [
    {
      id: "2026-world-cup",
      name: "Copa do Mundo",
      subtitle: "Fifa World Cup 2026",
      description:
        "Dê seus palpites para o maior torneio de futebol do planeta. Complete a fase de grupos, ordene as classificações, defina os melhores terceiros colocados e dispute a liderança geral!",
      subSweepstakeList: [
        {
          kind: "group",
          sweepstake: {
            id: "2026-world-cup",
            name: "Fase de Grupos",
            description:
              "Ordene as posições dos times dos grupos A a L e selecione os 8 melhores terceiros colocados que avançam de fase.",
            championship: "2026-world-cup",
            scorePolicy: "log2(inverse-probability-qualified-position)",
          },
          factor: 1,
        },
      ],
    },
  ];

  constructor(
    storage: JsonStorage,
    groupListChampionshipRepository: GroupListChampionshipRepository,
    cupChampionshipRepository: CupChampionshipRepository,
  ) {
    this.storage = storage;
    this.groupListChampionshipRepository = groupListChampionshipRepository;
    this.cupChampionshipRepository = cupChampionshipRepository;
  }

  async save(poolSweepstake: PoolSweepstake): Promise<void> {
    const dao = new SweepstakeDaoBuilder().toDao(poolSweepstake);

    await this.storage.save<PoolSweepstakeDao>(
      `/sweepstake/PoolSweepstake/${poolSweepstake.id}`,
      dao,
    );
  }

  async findById(id: string): Promise<PoolSweepstake | null> {
    const dao = FilePoolSweepstakeRepository.POOL_SWEEPSTAKE_DAO_LIST.find(
      (dao) => dao.id === id,
    );
    if (!dao) {
      return null;
    }

    return new SweepstakeDaoBuilder().toPoolSweepstake(
      dao,
      this.groupListChampionshipRepository,
      this.cupChampionshipRepository,
    );
  }

  async findAll(): Promise<PoolSweepstake[]> {
    const poolSweepstakeList: PoolSweepstake[] = [];
    for (const dao of FilePoolSweepstakeRepository.POOL_SWEEPSTAKE_DAO_LIST) {
      const pool = await this.findById(dao.id);
      if (pool) {
        poolSweepstakeList.push(pool);
      }
    }
    return poolSweepstakeList;
  }
}

export class MockPoolSweepstakeRepository implements PoolSweepstakeRepository {
  private static readonly POOL_SWEEPSTAKE_DAO_LIST: PoolSweepstakeDao[] = [
    {
      id: "test-subsweepstakes-all-status",
      name: "Test Pool Sweepstake",
      subtitle: "All Sweepstake Status",
      description:
        "Guess in all sweepstakes, order the groups, define the best third placed teams and guess the cup winner.",
      subSweepstakeList: [
        {
          kind: "group",
          sweepstake: {
            id: "test-status-draft",
            name: "Test Status Draft of Group",
            description:
              "Order the positions of the teams in the groups A to L and select the 8 best third placed teams that advance to the next round.",
            championship: "test-status-draft",
            scorePolicy: "log2(inverse-probability-qualified-position)",
          },
          factor: 1,
        },
        {
          kind: "group",
          sweepstake: {
            id: "test-status-waiting",
            name: "Test Status Waiting of Group",
            description:
              "Order the positions of the teams in the groups A to L and select the 8 best third placed teams that advance to the next round.",
            championship: "test-status-waiting",
            scorePolicy: "log2(inverse-probability-qualified-position)",
          },
          factor: 1,
        },
        {
          kind: "group",
          sweepstake: {
            id: "test-status-running",
            name: "Test Status Running of Group",
            description:
              "Order the positions of the teams in the groups A to L and select the 8 best third placed teams that advance to the next round.",
            championship: "test-status-running",
            scorePolicy: "log2(inverse-probability-qualified-position)",
          },
          factor: 1,
        },
        {
          kind: "cup",
          sweepstake: {
            id: "test-status-draft",
            name: "Test Status Draft of Cup",
            description:
              "Define the path of the teams in the cup to the final. Guess the third place.",
            championship: "test-status-draft",
            scorePolicy: "log2(inverse-probability-position)",
          },
          factor: 1,
        },
        {
          kind: "cup",
          sweepstake: {
            id: "test-status-waiting",
            name: "Test Status Waiting of Cup",
            description:
              "Define the path of the teams in the cup to the final. Guess the third place.",
            championship: "test-status-waiting",
            scorePolicy: "log2(inverse-probability-position)",
          },
          factor: 1,
        },
        {
          kind: "cup",
          sweepstake: {
            id: "test-status-running",
            name: "Test Status Running of Cup",
            description:
              "Define the path of the teams in the cup to the final. Guess the third place.",
            championship: "test-status-running",
            scorePolicy: "log2(inverse-probability-position)",
          },
          factor: 1,
        },
      ],
    },
  ];

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
    const dao = MockPoolSweepstakeRepository.POOL_SWEEPSTAKE_DAO_LIST.find(
      (dao) => dao.id === id,
    );
    if (!dao) return null;
    return new SweepstakeDaoBuilder().toPoolSweepstake(
      dao,
      this.groupListChampionshipRepository,
      this.cupChampionshipRepository,
    );
  }

  async findAll(): Promise<PoolSweepstake[]> {
    const pool = await this.findById("test-subsweepstakes-all-status");
    return pool ? [pool] : [];
  }
}
