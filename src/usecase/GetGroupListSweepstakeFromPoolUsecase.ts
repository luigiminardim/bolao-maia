import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import {
  GroupListSweepstakeDto,
  toGroupListSweepstakeDto,
} from "./dto/SweepstakeDto";

export class GetGroupListSweepstakeFromPoolUsecase {
  constructor(private poolSweepstakeRepository: PoolSweepstakeRepository) {}

  async execute(
    poolSweepstakeId: string,
    groupListSweepstakeId: string,
  ): Promise<null | GroupListSweepstakeDto> {
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

    return toGroupListSweepstakeDto(groupListSweepstake);
  }
}
