import { notFound } from "next/navigation";
import {
  getCupGuessRankListFromPoolRankListUsecase,
  getCupGuessResultFromPoolUsecase,
  getCupSweepstakeFromPoolUsecase,
  getCupGuessFromPoolUsecase,
} from "../../../../../../usecase/index";
import { getLoggedInUser } from "../../../../../actions";
import { CupSweepstakeFromPoolPageClient } from "./CupSweepstakeFromPoolPageClient";

interface PageProps {
  params: Promise<{
    poolId: string;
    cupId: string;
  }>;
}

export default async function CupSweepstakePage({ params }: PageProps) {
  const { poolId, cupId } = await params;
  const user = await getLoggedInUser();
  const cupSweepstake = await getCupSweepstakeFromPoolUsecase.execute(
    poolId,
    cupId,
  );

  if (!cupSweepstake) {
    return notFound();
  }

  const cupGuess = !!user
    ? await getCupGuessFromPoolUsecase.execute(poolId, cupId, user.id, user?.id)
    : null;

  const cupGuessResult = !!user
    ? await getCupGuessResultFromPoolUsecase.execute(
        poolId,
        cupId,
        user.id,
        user.id,
      )
    : null;

  const rankingList =
    (await getCupGuessRankListFromPoolRankListUsecase.execute(poolId, cupId)) ??
    [];

  return (
    <CupSweepstakeFromPoolPageClient
      poolId={poolId}
      cupId={cupId}
      currentUser={user}
      sweepstake={cupSweepstake}
      guess={cupGuess}
      rankList={rankingList}
      cupGuessResult={cupGuessResult}
    />
  );
}
