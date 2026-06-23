import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { UserRepository } from "../repository/UserRepository";
import { GroupListGuessResult } from "../entity/GuessResult";
import {
  GuessRankingListDto,
  toGuessRankingListDtoFromGroupListGuessResultList,
} from "./dto/GuessRankingDto";

export class GetGroupListGuessRankListFromPoolRankListUsecase {
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
  ): Promise<GuessRankingListDto | null> {
    const poolSweepstake = await this.poolSweepstakeRepository.findById(poolId);
    if (!poolSweepstake) {
      return null;
    }
    const groupListSweepstakeItem =
      poolSweepstake.getGroupListSweepstakeById(groupListId);
    if (!groupListSweepstakeItem) {
      return null;
    }
    const groupListSweepstake = groupListSweepstakeItem.sweepstake;
    const poolGuessList =
      await this.poolGuessRepository.findBySweepstake(poolId);
    const groupListGuessList = poolGuessList.flatMap((poolGuess) => {
      const groupListGuess = poolGuess.getGroupListGuess(groupListId);
      return groupListGuess === null ? [] : [groupListGuess];
    });
    const groupListGuessResultList = groupListGuessList.map(
      (groupListGuess) =>
        new GroupListGuessResult(
          groupListSweepstake,
          groupListGuess,
          groupListSweepstakeItem.factor,
        ),
    );
    return await toGuessRankingListDtoFromGroupListGuessResultList(
      groupListGuessResultList,
      this.userRepository,
    );
  }
}
