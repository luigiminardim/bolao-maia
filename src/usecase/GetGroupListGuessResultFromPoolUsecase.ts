import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { UserRepository } from "../repository/UserRepository";
import { GroupListGuessResult } from "../entity/GuessResult";
import {
  GroupListGuessResultDto,
  toGroupListGuessResultDto,
} from "./dto/GuessResultDto";

export class GetGroupListGuessResultFromPoolUsecase {
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
    groupListSweepstakeId: string,
    userId: string,
    loggedUserId: null | string,
  ): Promise<GroupListGuessResultDto | null> {
    const poolSweepstake =
      await this.poolSweepstakeRepository.findById(poolSweepstakeId);
    if (!poolSweepstake) {
      return null;
    }
    const groupListSweepstakeItem = poolSweepstake.getGroupListSweepstakeById(
      groupListSweepstakeId,
    );
    if (!groupListSweepstakeItem) {
      return null;
    }
    const groupListSweepstake = groupListSweepstakeItem.sweepstake;

    const status = groupListSweepstake.getStatus();
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
    const groupListGuess = poolGuess.getGroupListGuess(groupListSweepstakeId);
    if (!groupListGuess) {
      return null;
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    const result = new GroupListGuessResult(
      groupListSweepstake,
      groupListGuess,
      groupListSweepstakeItem.factor,
    );
    return toGroupListGuessResultDto(
      result,
      groupListSweepstake.championship,
      user,
    );
  }
}
