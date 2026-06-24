import { notFound } from "next/navigation";
import {
  getPoolSweepstakeUsecase,
  getPoolGuessRankListUsecase,
} from "../../../../usecase/index";
import { getLoggedInUser } from "../../../actions";
import { PoolSweepstakePageClient } from "./PoolSweepstakePageClient";

interface PageProps {
  params: Promise<{
    poolId: string;
  }>;
}

export default async function PoolSweepstakePage({ params }: PageProps) {
  const { poolId } = await params;
  const [pool, currentUser] = await Promise.all([
    getPoolSweepstakeUsecase.execute(poolId),
    getLoggedInUser(),
  ]);

  if (!pool) {
    notFound();
  }

  const poolRankingListDto = (await getPoolGuessRankListUsecase.execute(
    poolId,
  )) ?? {
    rankings: [],
    subsweepstakes: [],
  };

  return (
    <PoolSweepstakePageClient
      pool={pool}
      currentUser={currentUser}
      poolRankingListDto={poolRankingListDto}
    />
  );
}
