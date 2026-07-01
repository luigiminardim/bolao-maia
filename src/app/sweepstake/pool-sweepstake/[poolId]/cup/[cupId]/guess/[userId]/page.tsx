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
        header={
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 mb-2">
            <div>
              <h3 className="font-extrabold text-lg text-zinc-200">
                Resultados do Campeonato
              </h3>
              <p className="text-zinc-500 text-xs mt-0.5">
                Confira a pontuação obtida em cada palpite.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl shadow-inner">
                <span className="text-xs text-emerald-400 font-bold">
                  Total:
                </span>
                <span className="text-lg text-white font-black">
                  {cupGuessResult.score != null
                    ? `${cupGuessResult.score} pts`
                    : "--"}
                </span>
              </div>
            </div>
          </div>
        }
      />
    </main>
  );
}
