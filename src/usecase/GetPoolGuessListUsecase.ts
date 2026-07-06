import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { UserRepository } from "../repository/UserRepository";
import { PoolGuessDto, toPoolGuessDto } from "./dto/GuessDto";

export class GetPoolGuessListUsecase {
  constructor(
    private readonly poolSweepstakeRepository: PoolSweepstakeRepository,
    private readonly poolGuessRepository: PoolGuessRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(poolId: string): Promise<PoolGuessDto[] | null> {
    const poolSweepstake = await this.poolSweepstakeRepository.findById(poolId);
    if (!poolSweepstake) return null;

    const guesses = await this.poolGuessRepository.findBySweepstake(poolId);
    if (guesses.length === 0) return [];

    const guessList: PoolGuessDto[] = [];
    for (const guess of guesses) {
      const user = await this.userRepository.findById(guess.userId);
      if (user) {
        guessList.push(toPoolGuessDto(guess, user, poolSweepstake));
      }
    }

    return guessList;
  }
}
