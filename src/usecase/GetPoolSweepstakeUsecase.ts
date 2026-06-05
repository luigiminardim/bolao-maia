import { PoolSweepstake } from "../entity/Sweepstake";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";

export class GetPoolSweepstakeUsecase {
  private readonly poolSweepstakeRepository: PoolSweepstakeRepository;

  constructor(poolSweepstakeRepository: PoolSweepstakeRepository) {
    this.poolSweepstakeRepository = poolSweepstakeRepository;
  }

  async execute(poolId: string): Promise<PoolSweepstake | null> {
    return this.poolSweepstakeRepository.findById(poolId);
  }
}
