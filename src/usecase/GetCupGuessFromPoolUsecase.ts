import { PoolSweepstakeRepository } from "@/repository/PoolSweepstakeRepository";
import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { CupGuessDto, toCupGuessDto } from "./dto/GuessDto";

export class GetCupGuessFromPoolUsecase {
  constructor(
    private poolSweepstakeRepository: PoolSweepstakeRepository,
    private readonly poolGuessRepository: PoolGuessRepository,
  ) {}

  async execute(
    poolId: string,
    cupId: string,
    userId: string,
    loggedUserId: string,
  ): Promise<CupGuessDto | null> {
    const poolSweepstake = await this.poolSweepstakeRepository.findById(poolId);
    if (!poolSweepstake) return null;
    const cupSweepstakeItem = poolSweepstake.getCupSweepstakeById(cupId);
    if (!cupSweepstakeItem) return null;
    const cupSweepstake = cupSweepstakeItem.sweepstake;

    const status = cupSweepstake.getStatus();
    if (status === "draft" || (status === "open" && userId !== loggedUserId))
      return null;

    const poolGuess = await this.poolGuessRepository.findByUserAndSweepstake(
      userId,
      poolId,
    );
    if (!poolGuess) return null;
    const cupGuess = poolGuess.getCupGuess(cupId);
    if (!cupGuess) return null;
    return toCupGuessDto(cupGuess);
  }
}
