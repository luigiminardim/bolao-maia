import { notFound } from "next/navigation";
import {
  getGroupListGuessRankListFromPoolRankListUsecase,
  getGroupListGuessResultFromPoolUsecase,
  getGroupListSweepstakeFromPoolUsecase,
  getGroupListGuessFromPoolUsecase,
} from "../../../../../../usecase/index";
import { getLoggedInUser } from "../../../../../actions";
import { GroupListSweepstakeFromPoolPageClient } from "./GroupListSweepstakeFromPoolPageClient";

interface PageProps {
  params: Promise<{
    poolId: string;
    groupListId: string;
  }>;
}

export default async function GroupListSweepstakePage({ params }: PageProps) {
  const { poolId, groupListId } = await params;
  const user = await getLoggedInUser();
  const groupListSweepstake =
    await getGroupListSweepstakeFromPoolUsecase.execute(poolId, groupListId);

  if (!groupListSweepstake) {
    return notFound();
  }

  const groupListGuess = !!user
    ? await getGroupListGuessFromPoolUsecase.execute(
        poolId,
        groupListId,
        user.id,
        user?.id,
      )
    : null;

  const groupListGuessResult = !!user
    ? await getGroupListGuessResultFromPoolUsecase.execute(
        poolId,
        groupListId,
        user.id,
        user.id,
      )
    : null;

  const rankingListDto =
    (await getGroupListGuessRankListFromPoolRankListUsecase.execute(
      poolId,
      groupListId,
    )) ?? { rankings: [] };

  return (
    <GroupListSweepstakeFromPoolPageClient
      poolId={poolId}
      groupListId={groupListId}
      currentUser={user}
      sweepstake={groupListSweepstake}
      guess={groupListGuess}
      rankingListDto={rankingListDto}
      groupListGuessResult={groupListGuessResult}
    />
  );
}
