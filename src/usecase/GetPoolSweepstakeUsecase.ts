import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { PoolSweepstakeDto, toPoolSweepstakeDto } from "./dto/SweepstakeDto";

export class GetPoolSweepstakeUsecase {
  private readonly poolSweepstakeRepository: PoolSweepstakeRepository;

  constructor(poolSweepstakeRepository: PoolSweepstakeRepository) {
    this.poolSweepstakeRepository = poolSweepstakeRepository;
  }

  async execute(poolId: string): Promise<PoolSweepstakeDto | null> {
    const pool = await this.poolSweepstakeRepository.findById(poolId);
    return pool ? toPoolSweepstakeDto(pool) : null;
  }
}
