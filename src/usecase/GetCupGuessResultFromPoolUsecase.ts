import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { UserRepository } from "../repository/UserRepository";
import { CupGuessResult } from "../entity/GuessResult";
import { CupGuessResultDto, toCupGuessResultDto } from "./dto/GuessResultDto";

export class GetCupGuessResultFromPoolUsecase {
  private readonly poolSweepstakeRepository: PoolSweepstakeRepository;
  private readonly poolGuessRepository: PoolGuessRepository;
  private readonly userRepository: UserRepository;

  constructor(
    poolSweepstakeRepository: PoolSweepstakeRepository,
    poolGuessRepository: PoolGuessRepository,
    userRepository: UserRepository,
  ) {
    this.poolSweepstakeRepository = poolSweepstakeRepository;
    this.poolGuessRepository = poolGuessRepository;
    this.userRepository = userRepository;
  }

  async execute(
    poolSweepstakeId: string,
    cupSweepstakeId: string,
    userId: string,
    loggedUserId: null | string,
  ): Promise<CupGuessResultDto | null> {
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

    const status = cupSweepstake.getStatus();
    if ((status === "draft" || status === "open") && userId !== loggedUserId) {
      return null;
    }

    const poolGuess = await this.poolGuessRepository.findByUserAndSweepstake(
      userId,
      poolSweepstakeId,
    );
    if (!poolGuess) {
      return null;
    }
    const cupGuess = poolGuess.getCupGuess(cupSweepstakeId);
    if (!cupGuess) {
      return null;
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    const result = new CupGuessResult(
      cupSweepstake,
      cupGuess,
      cupSweepstakeItem.factor,
    );
    return toCupGuessResultDto(result, user);
  }
}
