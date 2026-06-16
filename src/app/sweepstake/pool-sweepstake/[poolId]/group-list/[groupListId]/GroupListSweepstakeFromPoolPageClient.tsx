"use client";

import { useRouter } from "next/navigation";
import { Button, Card, Tabs, Table, Alert, Avatar } from "@heroui/react";
import { UserDto } from "../../../../../../usecase/dto/UserDto";
import { GroupListSweepstakeDto } from "../../../../../../usecase/dto/SweepstakeDto";
import { GroupListGuessResultDto } from "../../../../../../usecase/dto/GuessResultDto";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { GroupListGuessResultSection } from "./components/GroupListGuessResultSection";
import { GroupListGuessSection } from "./components/GroupListGuessSection";
import { GuessRankingDto } from "@/usecase/dto/GuessRankingDto";
import { GroupListGuessDto } from "@/usecase/dto/GuessDto";

interface DashboardClientProps {
  poolId: string;
  groupListId: string;
  currentUser: UserDto | null;
  sweepstake: GroupListSweepstakeDto;
  guess: GroupListGuessDto | null;
  groupListGuessResult: null | GroupListGuessResultDto;
  rankList: GuessRankingDto[];
}

export function GroupListSweepstakeFromPoolPageClient({
  poolId,
  groupListId,
  currentUser,
  sweepstake,
  guess,
  rankList,
  groupListGuessResult,
}: DashboardClientProps) {
  const router = useRouter();

  const handleNavigateToGuess = () => {
    router.push(
      `/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}/guess`,
    );
  };

  const handleNavigateToLogin = () => {
    router.push(
      `/login?callbackUrl=/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}`,
    );
  };

  return (
    <>
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
                groupListGuessResult={groupListGuessResult}
                onNavigateToGuess={handleNavigateToGuess}
                onNavigateToLogin={handleNavigateToLogin}
              />
            </Tabs.Panel>

            <Tabs.Panel id="leaderboard" className="pt-2">
              <LeaderboardTabPanel
                guessRankList={rankList}
                currentUser={currentUser}
                poolId={poolId}
                groupListId={groupListId}
              />
            </Tabs.Panel>
          </Tabs>
        </div>
      </main>
    </>
  );
}

// -----------------------------------------------------------------------------
// MY GUESSES TAB
// -----------------------------------------------------------------------------

function MyGuessesTabPanel({
  sweepstake,
  guess,
  currentUser,
  groupListGuessResult,
  onNavigateToGuess,
  onNavigateToLogin,
}: {
  sweepstake: GroupListSweepstakeDto;
  guess: GroupListGuessDto | null;
  currentUser: UserDto | null;
  groupListGuessResult: null | GroupListGuessResultDto;
  onNavigateToGuess: () => void;
  onNavigateToLogin: () => void;
}) {
  if (!currentUser) {
    return <LoginCardView onNavigateToLogin={onNavigateToLogin} />;
  }

  if (
    guess &&
    (sweepstake.status === "open" || sweepstake.status === "draft")
  ) {
    return <ExistingGuessView sweepstake={sweepstake} guess={guess} />;
  }

  if (groupListGuessResult) {
    return (
      <ExistingGuessView
        sweepstake={sweepstake}
        groupListGuessResult={groupListGuessResult}
      />
    );
  }

  if (sweepstake.status === "open" || sweepstake.status === "draft") {
    return (
      <PendingGuessView
        sweepstakeStatus={sweepstake.status}
        groupsCount={sweepstake.groups.length}
        extraQualifiedLength={sweepstake.extraQualifiedLength}
        onNavigateToGuess={onNavigateToGuess}
      />
    );
  }

  return <EmptyGuessView />;
}

function LoginCardView({
  onNavigateToLogin,
}: {
  onNavigateToLogin: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
      <Card className="max-w-xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col items-center">
        <span className="text-5xl mb-4 opacity-50 grayscale">🔒</span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Faça Login para Participar / Acompanhar
        </h2>
        <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
          Você precisa estar logado para ver seus palpites ou participar do
          bolão.
        </p>
        <div className="mt-8 w-full">
          <Button
            onPress={onNavigateToLogin}
            className="w-full bg-emerald-500 text-zinc-950 font-bold py-3 hover:bg-emerald-400 transition-all rounded-xl text-sm"
          >
            Entrar
          </Button>
        </div>
      </Card>
    </div>
  );
}

function EmptyGuessView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
      <Card className="max-w-xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col items-center">
        <span className="text-5xl mb-4 opacity-50 grayscale">📭</span>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Nenhum palpite encontrado
        </h2>
        <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
          Você não fez um palpite a tempo para este campeonato.
        </p>
      </Card>
    </div>
  );
}

function PendingGuessView({
  sweepstakeStatus,
  groupsCount,
  extraQualifiedLength,
  onNavigateToGuess,
}: {
  sweepstakeStatus: string;
  groupsCount: number;
  extraQualifiedLength: number;
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
          Ordene os times de cada um dos {groupsCount} grupos do campeonato e
          indique quais serão os {extraQualifiedLength} melhores terceiros
          colocados que avançam de fase.
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
  groupListGuessResult,
}: {
  sweepstake: GroupListSweepstakeDto;
  guess?: GroupListGuessDto;
  groupListGuessResult?: GroupListGuessResultDto;
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
        {guess && <GroupListGuessSection guess={guess} header={header} />}
        {groupListGuessResult && (
          <GroupListGuessResultSection result={groupListGuessResult} />
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// LEADERBOARD TAB
// -----------------------------------------------------------------------------

function LeaderboardTabPanel({
  guessRankList,
  currentUser,
  poolId,
  groupListId,
}: {
  guessRankList: GuessRankingDto[];
  currentUser: UserDto | null;
  poolId: string;
  groupListId: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-extrabold text-zinc-200 tracking-tight">
          Classificação dos Participantes
        </h3>
        <p className="text-zinc-500 text-xs mt-0.5">
          Acompanhe o ranking e a pontuação dos participantes.
        </p>
      </div>

      <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden mt-2">
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Tabela de Ranking de Palpites"
              className="w-full"
            >
              <Table.Header className="bg-zinc-900/50 text-zinc-400 border-b border-zinc-850 text-xs font-bold uppercase tracking-wider">
                <Table.Column
                  isRowHeader
                  className="w-10 sm:w-20 pl-4 sm:pl-6 py-3 sm:py-4"
                >
                  {" "}
                </Table.Column>
                <Table.Column className="py-3 sm:py-4">Usuário</Table.Column>
                <Table.Column className="text-right pr-4 sm:pr-6 py-3 sm:py-4">
                  Pts.
                </Table.Column>
              </Table.Header>
              <Table.Body className="text-sm font-semibold text-zinc-200">
                {guessRankList.map((entry, index) => (
                  <LeaderboardTableRow
                    key={entry.user.id}
                    guessRank={entry}
                    index={index}
                    isMe={entry.user.id === currentUser?.id}
                    poolId={poolId!}
                    groupListId={groupListId!}
                  />
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </div>
  );
}

function LeaderboardTableRow({
  guessRank: entry,
  index,
  isMe,
  poolId,
  groupListId,
}: {
  guessRank: GuessRankingDto;
  index: number;
  isMe: boolean;
  poolId: string;
  groupListId: string;
}) {
  const rank = index + 1;
  return (
    <Table.Row
      className={`border-b border-zinc-900 transition-all ${
        isMe ? "bg-emerald-500/5 font-bold" : ""
      }`}
    >
      <Table.Cell className="pl-4 sm:pl-6 py-3 sm:py-4">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center justify-center size-6 rounded-full text-xs font-bold ${
              isMe
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-500"
            }`}
          >
            {rank}º
          </span>
        </div>
      </Table.Cell>
      <Table.Cell className="py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <Avatar
            size="sm"
            className={`size-8 font-bold ${isMe ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-zinc-300"}`}
          >
            <Avatar.Fallback>
              {entry.user.name.substring(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
          <Link
            href={`/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}/guess/${entry.user.id}`}
            className={`group flex items-center gap-1.5 transition-colors ${
              isMe
                ? "text-emerald-400 font-extrabold hover:text-emerald-300"
                : "text-zinc-200 hover:text-white"
            }`}
          >
            <span>{entry.user.name}</span>
            <ExternalLinkIcon className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </Table.Cell>
      <Table.Cell className="text-right pr-4 sm:pr-6 py-3 sm:py-4 font-black">
        <span className={isMe ? "text-emerald-400" : "text-zinc-100"}>
          {entry.score != null ? `${entry.score} pts` : "-"}
        </span>
      </Table.Cell>
    </Table.Row>
  );
}
