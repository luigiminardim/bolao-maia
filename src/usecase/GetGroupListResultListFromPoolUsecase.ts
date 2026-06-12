import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { UserRepository } from "../repository/UserRepository";
import { PoolGuessResult } from "../entity/GuessResult";
import {
  PoolGuessResultDto,
  toPoolGuessResultDto,
} from "./dto/PoolGuessResultDto";

export class GetGroupListResultListFromPoolUsecase {
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

  async execute(poolId: string): Promise<PoolGuessResultDto[] | null> {
    const sweepstake = await this.poolSweepstakeRepository.findById(poolId);
    if (!sweepstake) {
      return null;
    }

    const guesses = await this.poolGuessRepository.findBySweepstake(poolId);

    const results: PoolGuessResult[] = [];
    for (const guess of guesses) {
      const user = await this.userRepository.findById(guess.userId);
      if (user) {
        results.push(new PoolGuessResult(sweepstake, guess, user));
      }
    }

    results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return results.map(toPoolGuessResultDto);
  }
}
