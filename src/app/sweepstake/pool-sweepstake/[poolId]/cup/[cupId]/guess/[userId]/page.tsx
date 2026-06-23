import { CupGuessResultSection } from "../../components/CupGuessResultSection";
import { getLoggedInUser } from "@/app/actions";
import {
  getCupGuessResultFromPoolUsecase,
  getCupSweepstakeFromPoolUsecase,
} from "@/usecase";
import { GuessResultEmptyState } from "@/app/sweepstake/pool-sweepstake/components/GuessResultEmptyState";
import { GuessResultHeader } from "@/app/sweepstake/pool-sweepstake/components/GuessResultHeader";

interface PageProps {
  params: Promise<{
    poolId: string;
    cupId: string;
    userId: string;
  }>;
}

export default async function CupGuessResultFromPoolPage({
  params,
}: PageProps) {
  const { poolId, cupId, userId } = await params;
  const loggedUser = await getLoggedInUser();

  const [cupSweepstake, cupGuessResult] = await Promise.all([
    getCupSweepstakeFromPoolUsecase.execute(poolId, cupId),
    getCupGuessResultFromPoolUsecase.execute(
      poolId,
      cupId,
      userId,
      loggedUser?.id ?? null,
    ),
  ]);

  const backLink = `/sweepstake/pool-sweepstake/${poolId}/cup/${cupId}`;

  if (!cupSweepstake || !cupGuessResult) {
    return (
      <GuessResultEmptyState
        backLink={backLink}
        backText="Voltar para o Bolão"
      />
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-start max-w-5xl">
      <GuessResultHeader
        backLink={backLink}
        userName={cupGuessResult.user.name}
        subtitle="Confira o palpite deste participante."
      />

      <CupGuessResultSection
        result={cupGuessResult}
        sweepstake={cupSweepstake}
      />
    </main>
  );
}
