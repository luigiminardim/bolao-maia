import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { UserRepository } from "../repository/UserRepository";
import { CupGuessResult } from "../entity/GuessResult";
import {
  GuessRankingListDto,
  toGuessRankingListDtoFromCupGuessResultList,
} from "./dto/GuessRankingDto";

export class GetCupGuessRankListFromPoolRankListUsecase {
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
    poolId: string,
    cupId: string,
  ): Promise<GuessRankingListDto | null> {
    const poolSweepstake = await this.poolSweepstakeRepository.findById(poolId);
    if (!poolSweepstake) {
      return null;
    }
    const cupSweepstakeItem = poolSweepstake.getCupSweepstakeById(cupId);
    if (!cupSweepstakeItem) {
      return null;
    }
    const cupSweepstake = cupSweepstakeItem.sweepstake;
    const poolGuessList =
      await this.poolGuessRepository.findBySweepstake(poolId);
    const cupGuessList = poolGuessList.flatMap((poolGuess) => {
      const cupGuess = poolGuess.getCupGuess(cupId);
      return cupGuess === null ? [] : [cupGuess];
    });
    const cupGuessResultList = cupGuessList.map(
      (cupGuess) =>
        new CupGuessResult(cupSweepstake, cupGuess, cupSweepstakeItem.factor),
    );
    return await toGuessRankingListDtoFromCupGuessResultList(
      cupGuessResultList,
      this.userRepository,
    );
  }
}
