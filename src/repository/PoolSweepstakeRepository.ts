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
    const dao = await this.storage.load<PoolSweepstakeDao>(
      `/sweepstake/PoolSweepstake/${id}`,
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
    const ids = await this.storage.listIds("/sweepstake/PoolSweepstake");

    for (const fullId of ids) {
      const id = fullId.split("/").pop();
      if (!id) continue;
      const pool = await this.findById(id);
      if (pool) {
        poolSweepstakeList.push(pool);
      }
    }
    return poolSweepstakeList;
  }
}
