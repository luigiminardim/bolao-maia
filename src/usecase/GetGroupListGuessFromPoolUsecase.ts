import { PoolSweepstakeRepository } from "@/repository/PoolSweepstakeRepository";
import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { GroupListGuessDto, toGroupListGuessDto } from "./dto/GuessDto";

export class GetGroupListGuessFromPoolUsecase {
  constructor(
    private poolSweepstakeRepository: PoolSweepstakeRepository,
    private readonly poolGuessRepository: PoolGuessRepository,
  ) {}

  async execute(
    poolId: string,
    groupListId: string,
    userId: string,
    loggedUserId: string,
  ): Promise<GroupListGuessDto | null> {
    const poolSweepstake = await this.poolSweepstakeRepository.findById(poolId);
    if (!poolSweepstake) return null;
    const groupListSweepstakeItem =
      poolSweepstake?.getGroupListSweepstakeById(groupListId);
    if (!groupListSweepstakeItem) return null;
    const groupListSweepstake = groupListSweepstakeItem.sweepstake;

    const status = groupListSweepstake.getStatus();
    if (status === "draft" || (status === "open" && userId !== loggedUserId))
      return null;

    const poolGuess = await this.poolGuessRepository.findByUserAndSweepstake(
      userId,
      poolId,
    );
    if (!poolGuess) return null;
    const groupListGuess = poolGuess.getGroupListGuess(groupListId);
    if (!groupListGuess) return null;
    return toGroupListGuessDto(
      groupListGuess,
      groupListSweepstake.championship,
    );
  }
}
