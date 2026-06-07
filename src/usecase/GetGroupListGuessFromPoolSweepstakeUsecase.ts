import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { GroupListGuessDto, toGroupListGuessDto } from "./dto/GuessDto";

export class GetGroupListGuessFromPoolSweepstakeUsecase {
  private readonly poolGuessRepository: PoolGuessRepository;

  constructor(poolGuessRepository: PoolGuessRepository) {
    this.poolGuessRepository = poolGuessRepository;
  }

  async execute(
    userId: string,
    poolId: string,
    groupListId: string,
  ): Promise<GroupListGuessDto | null> {
    const poolGuess = await this.poolGuessRepository.findByUserAndSweepstake(
      userId,
      poolId,
    );
    if (!poolGuess) return null;

    const subGuess = poolGuess.subGuesses.find(
      (sub) =>
        sub.kind === "group" && sub.groupGuess.sweepstakeId === groupListId,
    );
    if (subGuess && subGuess.kind === "group") {
      return toGroupListGuessDto(subGuess.groupGuess);
    }
    return null;
  }
}
