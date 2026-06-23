import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { CupSweepstakeDto, toCupSweepstakeDto } from "./dto/SweepstakeDto";

export class GetCupSweepstakeFromPoolUsecase {
  constructor(private poolSweepstakeRepository: PoolSweepstakeRepository) {}

  async execute(
    poolSweepstakeId: string,
    cupSweepstakeId: string,
  ): Promise<null | CupSweepstakeDto> {
    const poolSweepstake =
      await this.poolSweepstakeRepository.findById(poolSweepstakeId);
    if (!poolSweepstake) {
      return null;
    }

    const cupSweepstakeItem =
      poolSweepstake.getCupSweepstakeById(cupSweepstakeId);
    if (!cupSweepstakeItem) {
      return null;
    }
    const cupSweepstake = cupSweepstakeItem.sweepstake;

    return toCupSweepstakeDto(cupSweepstake);
  }
}
