import { CupChampionship } from "../entity/Championship";
import { TeamRepository } from "./TeamRepository";
import { JsonStorage } from "../infra/JsonStorage";
import {
  CupChampionshipDao,
  CupChampionshipDaoBuilder,
} from "./dao/CupChampionshipDao";

export interface CupChampionshipRepository {
  save(championship: CupChampionship): Promise<void>;
  findById(id: string): Promise<CupChampionship | null>;
}

export class FileCupChampionshipRepository implements CupChampionshipRepository {
  private readonly storage: JsonStorage;
  private readonly teamRepository: TeamRepository;

  constructor(storage: JsonStorage, teamRepository: TeamRepository) {
    this.storage = storage;
    this.teamRepository = teamRepository;
  }

  async save(championship: CupChampionship): Promise<void> {
    const dao = new CupChampionshipDaoBuilder().toDao(championship);
    await this.storage.save<CupChampionshipDao>(
      `/sweepstake/CupChampionship/${championship.getId()}`,
      dao,
    );
  }

  async findById(id: string): Promise<CupChampionship | null> {
    const dao = await this.storage.load<CupChampionshipDao>(
      `/sweepstake/CupChampionship/${id}`,
    );
    if (!dao) {
      return null;
    }

    return new CupChampionshipDaoBuilder().toCupChampionship(
      dao,
      this.teamRepository,
    );
  }
}
