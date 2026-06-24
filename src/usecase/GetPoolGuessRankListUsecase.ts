import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { UserRepository } from "../repository/UserRepository";
import { PoolGuessResult } from "../entity/GuessResult";
import {
  PoolGuessRankingListDto,
  toPoolGuessRankingListDto,
} from "./dto/GuessRankingDto";

export class GetPoolGuessRankListUsecase {
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

  async execute(poolId: string): Promise<PoolGuessRankingListDto | null> {
    const poolSweepstake = await this.poolSweepstakeRepository.findById(poolId);
    if (!poolSweepstake) {
      return null;
    }

    const poolGuessList =
      await this.poolGuessRepository.findBySweepstake(poolId);

    const users = await Promise.all(
      poolGuessList.map((poolGuess) =>
        this.userRepository.findById(poolGuess.userId),
      ),
    );

    const guessResultList: PoolGuessResult[] = poolGuessList.flatMap(
      (poolGuess, index) => {
        const user = users[index];
        if (!user) return [];
        return [new PoolGuessResult(poolSweepstake, poolGuess, user)];
      },
    );

    return toPoolGuessRankingListDto(
      poolSweepstake,
      guessResultList,
      this.userRepository,
    );
  }
}
