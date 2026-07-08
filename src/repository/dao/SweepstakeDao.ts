import {
  PoolSweepstake,
  SweepstakeItem,
  GroupListSweepstake,
  CupSweepstake,
} from "../../entity/Sweepstake";
import { GroupListChampionshipRepository } from "../GroupListChampionshipRepository";
import { CupChampionshipRepository } from "../CupChampionshipRepository";
import { ScorePolicyBuilder } from "../../entity/ScorePolicy";

export interface CupSweepstakeDao {
  id: string;
  name: string;
  description: string;
  championship: string; // championship id
  scorePolicy: string; // score policy id
}

export interface GroupListSweepstakeDao {
  id: string;
  name: string;
  description: string;
  championship: string; // championship id
  scorePolicy: string; // score policy id
}

export type SweepstakeItemDao =
  | { kind: "group"; sweepstake: GroupListSweepstakeDao; factor: number }
  | { kind: "cup"; sweepstake: CupSweepstakeDao; factor: number };

export interface PoolSweepstakeDao {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  subSweepstakeList: SweepstakeItemDao[];
}

export class SweepstakeDaoBuilder {
  private mapGroupListSweepstakeToDao(
    item: Extract<SweepstakeItem, { kind: "group" }>,
  ): SweepstakeItemDao {
    const groupDao: GroupListSweepstakeDao = {
      id: item.sweepstake.id,
      name: item.sweepstake.name,
      description: item.sweepstake.description,
      championship: item.sweepstake.championship.getId(),
      scorePolicy: item.sweepstake.scorePolicy.getId(),
    };
    return { kind: "group", sweepstake: groupDao, factor: item.factor };
  }

  private mapCupSweepstakeToDao(
    item: Extract<SweepstakeItem, { kind: "cup" }>,
  ): SweepstakeItemDao {
    const cupDao: CupSweepstakeDao = {
      id: item.sweepstake.id,
      name: item.sweepstake.name,
      description: item.sweepstake.description,
      championship: item.sweepstake.championship.getId(),
      scorePolicy: item.sweepstake.scorePolicy.getId(),
    };
    return { kind: "cup", sweepstake: cupDao, factor: item.factor };
  }

  private mapSweepstakeItemToDao(item: SweepstakeItem): SweepstakeItemDao {
    if (item.kind === "group") {
      return this.mapGroupListSweepstakeToDao(item);
    }
    return this.mapCupSweepstakeToDao(item);
  }

  toDao(poolSweepstake: PoolSweepstake): PoolSweepstakeDao {
    const subSweepstakeDaoList = poolSweepstake.subSweepstakeList.map((item) =>
      this.mapSweepstakeItemToDao(item),
    );

    return {
      id: poolSweepstake.id,
      name: poolSweepstake.name,
      subtitle: poolSweepstake.getSubtitle(),
      description: poolSweepstake.description,
      subSweepstakeList: subSweepstakeDaoList,
    };
  }

  private async buildGroupListSweepstakeItem(
    itemDao: Extract<SweepstakeItemDao, { kind: "group" }>,
    groupListChampionshipRepository: GroupListChampionshipRepository,
  ): Promise<SweepstakeItem> {
    const groupDao = itemDao.sweepstake;
    const championship = await groupListChampionshipRepository.findById(
      groupDao.championship,
    );
    if (!championship) {
      throw new Error(
        `GroupListChampionship not found: ${groupDao.championship}`,
      );
    }
    const scorePolicy = ScorePolicyBuilder.build(groupDao.scorePolicy);
    return {
      kind: "group",
      sweepstake: new GroupListSweepstake(
        groupDao.id,
        groupDao.name ?? "Fase de Grupos",
        groupDao.description ??
          "Ordene as posições dos times dos grupos A a L e selecione os 8 melhores terceiros colocados que avançam de fase.",
        championship,
        scorePolicy,
      ),
      factor: itemDao.factor,
    };
  }

  private async buildCupSweepstakeItem(
    itemDao: Extract<SweepstakeItemDao, { kind: "cup" }>,
    cupChampionshipRepository: CupChampionshipRepository,
  ): Promise<SweepstakeItem> {
    const cupDao = itemDao.sweepstake;
    const championship = await cupChampionshipRepository.findById(
      cupDao.championship,
    );
    if (!championship) {
      throw new Error(`CupChampionship not found: ${cupDao.championship}`);
    }
    const scorePolicy = ScorePolicyBuilder.build(cupDao.scorePolicy);
    return {
      kind: "cup",
      sweepstake: new CupSweepstake(
        cupDao.id,
        cupDao.name ?? "Mata-Mata (Copa)",
        cupDao.description ??
          "Monte sua chave de mata-mata até a grande final e palpite no campeão.",
        championship,
        scorePolicy,
      ),
      factor: itemDao.factor,
    };
  }

  private async buildSweepstakeItemFromDao(
    itemDao: SweepstakeItemDao,
    groupListChampionshipRepository: GroupListChampionshipRepository,
    cupChampionshipRepository: CupChampionshipRepository,
  ): Promise<SweepstakeItem> {
    if (itemDao.kind === "group") {
      return this.buildGroupListSweepstakeItem(
        itemDao,
        groupListChampionshipRepository,
      );
    }
    return this.buildCupSweepstakeItem(itemDao, cupChampionshipRepository);
  }

  async toPoolSweepstake(
    dao: PoolSweepstakeDao,
    groupListChampionshipRepository: GroupListChampionshipRepository,
    cupChampionshipRepository: CupChampionshipRepository,
  ): Promise<PoolSweepstake> {
    const subSweepstakeList: SweepstakeItem[] = await Promise.all(
      dao.subSweepstakeList.map((itemDao) =>
        this.buildSweepstakeItemFromDao(
          itemDao,
          groupListChampionshipRepository,
          cupChampionshipRepository,
        ),
      ),
    );

    return new PoolSweepstake(
      dao.id,
      dao.name,
      dao.subtitle,
      dao.description,
      subSweepstakeList,
    );
  }
}
