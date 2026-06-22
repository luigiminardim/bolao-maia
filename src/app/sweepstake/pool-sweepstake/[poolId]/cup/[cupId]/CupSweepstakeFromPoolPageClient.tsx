"use client";

import { useRouter } from "next/navigation";
import { Button, Card, Tabs, Alert } from "@heroui/react";
import { UserDto } from "@/usecase/dto/UserDto";
import { CupSweepstakeDto } from "@/usecase/dto/SweepstakeDto";
import { CupGuessResultDto } from "@/usecase/dto/GuessResultDto";
import { GuessRankingListDto } from "@/usecase/dto/GuessRankingDto";
import { CupGuessDto } from "@/usecase/dto/GuessDto";
import { LoginCard } from "../../../../components/LoginCard";
import { EmptyGuessCard } from "../../../../components/EmptyGuessCard";
import { SweepstakeLeaderboard } from "../../../../components/SweepstakeLeaderboard";
import { CupGuessSection } from "./components/CupGuessSection";
import { CupGuessResultSection } from "./components/CupGuessResultSection";

interface DashboardClientProps {
  poolId: string;
  cupId: string;
  currentUser: UserDto | null;
  sweepstake: CupSweepstakeDto;
  guess: CupGuessDto | null;
  cupGuessResult: null | CupGuessResultDto;
  rankingListDto: GuessRankingListDto;
}

export function CupSweepstakeFromPoolPageClient({
  poolId,
  cupId,
  currentUser,
  sweepstake,
  guess,
  rankingListDto,
  cupGuessResult,
}: DashboardClientProps) {
  const router = useRouter();

  const handleNavigateToGuess = () => {
    router.push(`/sweepstake/pool-sweepstake/${poolId}/cup/${cupId}/guess`);
  };

  const loginHref = `/login?callbackUrl=/sweepstake/pool-sweepstake/${poolId}/cup/${cupId}`;

  return (
    <main className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-start max-w-5xl">
      <div className="mb-6">
        <Button
          size="sm"
          variant="ghost"
          onPress={() => router.push(`/sweepstake/pool-sweepstake/${poolId}`)}
          className="text-zinc-400 hover:text-zinc-100 rounded-xl text-xs pl-0"
        >
          ← Voltar para Modalidades
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        <Tabs className="w-full flex flex-col gap-6" id="dashboard-tabs">
          <Tabs.ListContainer className="border-b border-zinc-900">
            <Tabs.List
              aria-label="Abas do Bolão"
              className="flex gap-4 md:gap-8 overflow-x-auto pb-0.5 *:px-4 *:py-3 *:text-sm *:font-semibold *:transition-all *:relative *:outline-none"
            >
              <Tabs.Tab
                id="my-guesses"
                className="text-zinc-400 data-[selected=true]:text-emerald-400"
              >
                <span>⚽ Meu Palpite</span>
                <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
              </Tabs.Tab>

              <Tabs.Tab
                id="leaderboard"
                className="text-zinc-400 data-[selected=true]:text-emerald-400"
              >
                <span>🏆 Classificação</span>
                <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          <Tabs.Panel id="my-guesses" className="pt-2">
            <MyGuessesTabPanel
              sweepstake={sweepstake}
              guess={guess}
              currentUser={currentUser}
              cupGuessResult={cupGuessResult}
              onNavigateToGuess={handleNavigateToGuess}
              loginHref={loginHref}
            />
          </Tabs.Panel>

          <Tabs.Panel id="leaderboard" className="pt-2">
            <SweepstakeLeaderboard
              guessRankListDto={rankingListDto}
              currentUser={currentUser}
              getUserGuessLink={(userId) =>
                `/sweepstake/pool-sweepstake/${poolId}/cup/${cupId}/guess/${userId}`
              }
            />
          </Tabs.Panel>
        </Tabs>
      </div>
    </main>
  );
}

// -----------------------------------------------------------------------------
// MY GUESSES TAB
// -----------------------------------------------------------------------------

function MyGuessesTabPanel({
  sweepstake,
  guess,
  currentUser,
  cupGuessResult,
  onNavigateToGuess,
  loginHref,
}: {
  sweepstake: CupSweepstakeDto;
  guess: CupGuessDto | null;
  currentUser: UserDto | null;
  cupGuessResult: null | CupGuessResultDto;
  onNavigateToGuess: () => void;
  loginHref: string;
}) {
  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
        <LoginCard loginHref={loginHref} />
      </div>
    );
  }

  if (
    guess &&
    (sweepstake.status === "open" || sweepstake.status === "draft")
  ) {
    return <ExistingGuessView sweepstake={sweepstake} guess={guess} />;
  }

  if (cupGuessResult) {
    return (
      <ExistingGuessView
        sweepstake={sweepstake}
        cupGuessResult={cupGuessResult}
      />
    );
  }

  if (sweepstake.status === "open" || sweepstake.status === "draft") {
    return (
      <PendingGuessView
        sweepstakeStatus={sweepstake.status}
        onNavigateToGuess={onNavigateToGuess}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
      <EmptyGuessCard />
    </div>
  );
}

function PendingGuessView({
  sweepstakeStatus,
  onNavigateToGuess,
}: {
  sweepstakeStatus: string;
  onNavigateToGuess: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
      <Card className="max-w-xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col items-center">
        <span className="text-5xl mb-4 animate-pulse">📝</span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Você ainda não salvou seu palpite!
        </h2>
        <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
          Preencha o chaveamento do campeonato indicando os vencedores de cada
          confronto até a grande final.
        </p>

        <div className="mt-8 w-full">
          <Button
            onPress={onNavigateToGuess}
            isDisabled={sweepstakeStatus === "draft"}
            className="w-full bg-emerald-500 text-zinc-950 font-bold py-3 hover:bg-emerald-400 transition-all rounded-xl text-sm shadow-lg shadow-emerald-500/10"
          >
            {sweepstakeStatus === "draft"
              ? "Aguardando Sorteio"
              : "Fazer Palpite"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ExistingGuessView({
  sweepstake,
  guess,
  cupGuessResult,
}: {
  sweepstake: CupSweepstakeDto;
  guess?: CupGuessDto;
  cupGuessResult?: CupGuessResultDto;
}) {
  const header =
    sweepstake.status === "open" ? (
      <Alert
        status="success"
        className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 mb-2"
      >
        <p className="font-bold text-emerald-400 mb-1">Palpite Confirmado!</p>
        Seu palpite foi salvo com sucesso. Quando o campeonato começar, os
        resultados oficiais e o ranking serão liberados em tempo real.
      </Alert>
    ) : null;

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        {guess && <CupGuessSection guess={guess} header={header} />}
        {cupGuessResult && (
          <CupGuessResultSection
            result={cupGuessResult}
            sweepstake={sweepstake}
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
        )}
      </div>
    </div>
  );
}
