import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { SweepstakeDto, toPoolSweepstakeDto } from "./dto/SweepstakeDto";

export class GetSweepstakeListUsecase {
  constructor(private readonly repository: PoolSweepstakeRepository) {}

  async execute(): Promise<SweepstakeDto[]> {
    const pools = await this.repository.findAll();
    return pools.map((pool) => ({
      kind: "pool",
      pool: toPoolSweepstakeDto(pool),
    }));
  }
}
