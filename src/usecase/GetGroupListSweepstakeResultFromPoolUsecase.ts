import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { UserRepository } from "../repository/UserRepository";
import { PoolGuessResult } from "../entity/GuessResult";
import {
  PoolGuessResultDto,
  toPoolGuessResultDto,
} from "./dto/PoolGuessResultDto";

export class GetGroupListSweepstakeResultFromPoolUsecase {
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
    groupListId: string,
    targetUserId: string,
    requesterUserId?: string,
  ): Promise<PoolGuessResultDto | null> {
    const sweepstake = await this.poolSweepstakeRepository.findById(poolId);
    if (!sweepstake) {
      return null;
    }

    const subSweepstake = sweepstake.subSweepstakeList.find(
      (sub) => sub.kind === "group" && sub.sweepstake.id === groupListId,
    );

    if (!subSweepstake) {
      return null;
    }

    const status = subSweepstake.sweepstake.getStatus();

    if (
      (status === "draft" || status === "open") &&
      targetUserId !== requesterUserId
    ) {
      return null;
    }

    const guess = await this.poolGuessRepository.findByUserAndSweepstake(
      targetUserId,
      poolId,
    );

    if (!guess) {
      return null;
    }

    const user = await this.userRepository.findById(targetUserId);
    if (!user) {
      return null;
    }

    const result = new PoolGuessResult(sweepstake, guess, user);
    return toPoolGuessResultDto(result);
  }
}
