"use client";

import { useRouter } from "next/navigation";
import { Button, Card, Tabs, Chip, Table, Alert, Avatar } from "@heroui/react";
import { UserDto } from "../../../../../../usecase/dto/UserDto";
import { GroupListSweepstakeDto } from "../../../../../../usecase/dto/SweepstakeDto";
import { GroupListGuessDto } from "../../../../../../usecase/dto/GuessDto";
import {
  PoolGuessResultDto,
  GroupGuessResultDto,
  GroupListGuessResultDto,
} from "../../../../../../usecase/dto/PoolGuessResultDto";
import { getTeamFlagSvgUrl } from "../../../../../utils/getTeamFlagSvgUrl";

interface DashboardClientProps {
  poolId: string;
  groupListId: string;
  currentUser: UserDto | null;
  sweepstake: GroupListSweepstakeDto;
  existingGuess: GroupListGuessDto | null;
  leaderboard: PoolGuessResultDto[];
}

export function DashboardClient({
  poolId,
  groupListId,
  currentUser,
  sweepstake,
  existingGuess,
  leaderboard,
}: DashboardClientProps) {
  const router = useRouter();

  const userLeaderboardEntry = leaderboard.find(
    (entry) => entry.user.id === currentUser?.id,
  );

  const groupGuesses = existingGuess
    ? existingGuess.groupGuesses.map((g) => g.classification.map((t) => t.id))
    : sweepstake.groups.map((g) => g.classification.map((t) => t?.id ?? ""));

  const extraGuesses = existingGuess
    ? existingGuess.extraQualifiedListGuess.map((t) => t.id)
    : [];

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
                existingGuess={existingGuess}
                currentUser={currentUser}
                userLeaderboardEntry={userLeaderboardEntry}
                groupGuesses={groupGuesses}
                extraGuesses={extraGuesses}
                onNavigateToGuess={handleNavigateToGuess}
                onNavigateToLogin={handleNavigateToLogin}
              />
            </Tabs.Panel>

            <Tabs.Panel id="leaderboard" className="pt-2">
              <LeaderboardTabPanel
                leaderboard={leaderboard}
                currentUser={currentUser}
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
  existingGuess,
  currentUser,
  userLeaderboardEntry,
  groupGuesses,
  extraGuesses,
  onNavigateToGuess,
  onNavigateToLogin,
}: {
  sweepstake: GroupListSweepstakeDto;
  existingGuess: GroupListGuessDto | null;
  currentUser: UserDto | null;
  userLeaderboardEntry?: PoolGuessResultDto;
  groupGuesses: string[][];
  extraGuesses: string[];
  onNavigateToGuess: () => void;
  onNavigateToLogin: () => void;
}) {
  if (!currentUser) {
    return <LoginCardView onNavigateToLogin={onNavigateToLogin} />;
  }

  if (!existingGuess) {
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

  return (
    <ExistingGuessView
      sweepstake={sweepstake}
      userLeaderboardEntry={userLeaderboardEntry}
      groupGuesses={groupGuesses}
      extraGuesses={extraGuesses}
    />
  );
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
  userLeaderboardEntry,
  groupGuesses,
  extraGuesses,
}: {
  sweepstake: GroupListSweepstakeDto;
  userLeaderboardEntry?: PoolGuessResultDto;
  groupGuesses: string[][];
  extraGuesses: string[];
}) {
  return (
    <div className="flex-1 flex flex-col gap-6">
      {sweepstake.status === "open" && (
        <Alert
          status="success"
          className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400"
        >
          <p className="font-bold text-emerald-400 mb-1">Palpite Confirmado!</p>
          Seu palpite foi salvo com sucesso. Quando o campeonato começar, os
          resultados oficiais e o ranking serão liberados em tempo real.
        </Alert>
      )}

      <div className="flex flex-col gap-6">
        {sweepstake.status === "open" || sweepstake.status === "draft" ? (
          <GroupListGuessSection
            sweepstake={sweepstake}
            groupGuesses={groupGuesses}
            extraGuesses={extraGuesses}
          />
        ) : (
          <GroupListGuessResultSection
            sweepstake={sweepstake}
            groupGuesses={groupGuesses}
            extraGuesses={extraGuesses}
            userLeaderboardEntry={userLeaderboardEntry}
          />
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// LEADERBOARD TAB
// -----------------------------------------------------------------------------

function LeaderboardTabPanel({
  leaderboard,
  currentUser,
}: {
  leaderboard: PoolGuessResultDto[];
  currentUser: UserDto | null;
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
                {leaderboard.map((entry, index) => (
                  <LeaderboardTableRow
                    key={entry.user.id}
                    entry={entry}
                    index={index}
                    isMe={entry.user.id === currentUser?.id}
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
  entry,
  index,
  isMe,
}: {
  entry: PoolGuessResultDto;
  index: number;
  isMe: boolean;
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
          <span
            className={
              isMe ? "text-emerald-400 font-extrabold" : "text-zinc-200"
            }
          >
            {entry.user.name}
          </span>
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

// -----------------------------------------------------------------------------
// GROUP GUESS SECTION COMPONENTS
// -----------------------------------------------------------------------------

interface GroupListGuessSectionProps {
  sweepstake: GroupListSweepstakeDto;
  groupGuesses: string[][];
  extraGuesses: string[];
}

export function GroupListGuessSection({
  sweepstake,
  groupGuesses,
  extraGuesses,
}: GroupListGuessSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 mb-2">
        <div>
          <h3 className="font-extrabold text-lg text-zinc-200">Seu Palpite</h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            Confira como você ordenou as equipes para a fase de grupos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sweepstake.groups.map((group, gIdx) => {
          const userClassification = groupGuesses[gIdx] ?? [];
          return (
            <GroupGuessList
              key={group.id}
              group={group}
              userClassification={userClassification}
              extraGuesses={extraGuesses}
              sweepstake={sweepstake}
            />
          );
        })}
      </div>
    </div>
  );
}

function GroupGuessList({
  group,
  userClassification,
  extraGuesses,
  sweepstake,
}: {
  group: GroupListSweepstakeDto["groups"][number];
  userClassification: string[];
  extraGuesses: string[];
  sweepstake: GroupListSweepstakeDto;
}) {
  return (
    <Card className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl shadow-md">
      <div>
        <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-zinc-950">
          <h4 className="font-extrabold text-sm text-zinc-300">
            Grupo {group.id}
          </h4>
        </div>

        <div className="space-y-3">
          {userClassification.map((teamId, displayRank0Based) => {
            const team = group.classification.find((t) => t?.id === teamId);
            if (!team) return null;

            const displayRank = displayRank0Based + 1;

            const isExtraEligiblePosition =
              displayRank - 1 === sweepstake.maxRegularQualifiedPosition;

            const isQualified =
              displayRank - 1 < sweepstake.maxRegularQualifiedPosition ||
              (isExtraEligiblePosition && extraGuesses.includes(teamId));

            return (
              <GroupGuessListItem
                key={teamId}
                teamId={teamId}
                teamName={team.name}
                displayRank={displayRank}
                isQualified={isQualified}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function GroupGuessListItem({
  teamId,
  teamName,
  displayRank,
  isQualified,
}: {
  teamId: string;
  teamName: string;
  displayRank: number;
  isQualified: boolean;
}) {
  const positionBadgeColor = isQualified
    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
    : "bg-zinc-950/80 text-zinc-500 border border-zinc-900";

  return (
    <div className="flex flex-col gap-1 p-4 bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 rounded-2xl group transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-xl ${positionBadgeColor}`}
        >
          {displayRank}º
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getTeamFlagSvgUrl(teamId)}
          alt={teamName}
          className="shrink-0 w-6 h-4 object-cover rounded-[2px] shadow-sm"
        />
        <span className="truncate font-bold text-sm text-zinc-200">
          {teamName}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-zinc-900/40 pt-1 mt-1">
        <div className="flex items-center">
          {isQualified ? (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Classificado
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-zinc-800/50 text-zinc-500 border border-zinc-800">
              Eliminado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// GROUP GUESS RESULT SECTION COMPONENTS
// -----------------------------------------------------------------------------

interface GroupListGuessResultSectionProps {
  sweepstake: GroupListSweepstakeDto;
  groupGuesses: string[][];
  extraGuesses: string[];
  userLeaderboardEntry?: PoolGuessResultDto;
}

export function GroupListGuessResultSection({
  sweepstake,
  groupGuesses,
  extraGuesses,
  userLeaderboardEntry,
}: GroupListGuessResultSectionProps) {
  let resultDto: GroupListGuessResultDto;

  if (userLeaderboardEntry) {
    const groupSubResult = userLeaderboardEntry.subResultList.find(
      (sub) => sub.kind === "group",
    );
    // clone it so we can safely sort
    resultDto = {
      score: groupSubResult?.groupResult?.score ?? null,
      groupResultList:
        groupSubResult?.groupResult?.groupResultList.map((gr) => ({
          score: gr.score,
          classification: [...gr.classification],
        })) ?? [],
    };
  } else {
    // Manually construct the DTO from guesses
    resultDto = {
      score: null,
      groupResultList: sweepstake.groups.map((group, gIdx) => {
        const userClassification = groupGuesses[gIdx] ?? [];
        return {
          score: null,
          classification: group.classification.map((team) => {
            const guessRank = team
              ? userClassification.indexOf(team.id) + 1
              : null;
            return {
              team,
              positionGuess: guessRank,
              extraQualifiedGuess: team
                ? extraGuesses.includes(team.id)
                : false,
              score: null,
            };
          }),
        };
      }),
    };
  }

  return (
    <GroupListResultSection sweepstake={sweepstake} resultDto={resultDto} />
  );
}

interface GroupListResultSectionProps {
  sweepstake: GroupListSweepstakeDto;
  resultDto: GroupListGuessResultDto;
}

export function GroupListResultSection({
  sweepstake,
  resultDto,
}: GroupListResultSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 mb-2">
        <div>
          <h3 className="font-extrabold text-lg text-zinc-200">
            Resultados dos Grupos
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            Confira a pontuação obtida em cada palpite da fase de grupos.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl shadow-inner">
          <span className="text-xs text-emerald-400 font-bold">Total:</span>
          <span className="text-lg text-white font-black">
            {resultDto.score != null ? `${resultDto.score} pts` : "--"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sweepstake.groups.map((group, gIdx) => {
          const groupResult = resultDto.groupResultList[gIdx];
          if (!groupResult) return null;

          return (
            <GroupResultList
              key={group.id}
              group={group}
              groupResult={groupResult}
              sweepstake={sweepstake}
            />
          );
        })}
      </div>
    </div>
  );
}

interface GroupResultListProps {
  group: GroupListSweepstakeDto["groups"][number];
  groupResult: GroupGuessResultDto;
  sweepstake: GroupListSweepstakeDto;
}

function GroupResultList({
  group,
  groupResult,
  sweepstake,
}: GroupResultListProps) {
  const groupScore =
    groupResult.classification.reduce((acc, c) => acc + (c.score ?? 0), 0) ?? 0;

  return (
    <Card className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl shadow-md">
      <div>
        <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-zinc-950">
          <h4 className="font-extrabold text-sm text-zinc-300">
            Grupo {group.id}
          </h4>
          {groupResult.score != null && (
            <Chip size="sm" color="success" className="text-[10px] font-bold">
              +{groupScore} pts
            </Chip>
          )}
        </div>

        <div className="space-y-3">
          {groupResult.classification.map((node, displayRank0Based) => {
            if (!node.team) return null;
            const teamId = node.team.id;

            const displayRank = displayRank0Based + 1;
            const isGuessExtra =
              node.positionGuess ===
                sweepstake.maxRegularQualifiedPosition + 1 &&
              node.extraQualifiedGuess;

            const isExtraEligiblePosition =
              displayRank - 1 === sweepstake.maxRegularQualifiedPosition;

            const isQualified =
              displayRank - 1 < sweepstake.maxRegularQualifiedPosition ||
              (isExtraEligiblePosition &&
                (sweepstake.status === "open"
                  ? node.extraQualifiedGuess
                  : (sweepstake.extraQualifiedList?.some(
                      (t) => t?.id === teamId,
                    ) ?? false)));

            return (
              <GroupResultListItem
                key={teamId}
                teamId={teamId}
                teamName={node.team.name}
                displayRank={displayRank}
                guessRank={node.positionGuess ?? displayRank}
                isQualified={isQualified}
                isGuessExtra={isGuessExtra}
                teamPoints={node.score}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}

interface GroupResultListItemProps {
  teamId: string;
  teamName: string;
  displayRank: number;
  guessRank: number;
  isQualified: boolean;
  isGuessExtra: boolean;
  teamPoints?: number | null;
}

function GroupResultListItem({
  teamId,
  teamName,
  displayRank,
  guessRank,
  isQualified,
  isGuessExtra,
  teamPoints,
}: GroupResultListItemProps) {
  const positionBadgeColor = isQualified
    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
    : "bg-zinc-950/80 text-zinc-500 border border-zinc-900";

  return (
    <div className="flex flex-col gap-1 p-4 bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 rounded-2xl group transition-all">
      {/* Row 1: Position + Flag + Team Name + Team Score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-xl ${positionBadgeColor}`}
          >
            {displayRank}º
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getTeamFlagSvgUrl(teamId)}
            alt={teamName}
            className="shrink-0 w-6 h-4 object-cover rounded-[2px] shadow-sm"
          />
          <span className="truncate font-bold text-sm text-zinc-200">
            {teamName}
          </span>
        </div>

        <div className="shrink-0">
          {teamPoints != null ? (
            teamPoints > 0 ? (
              <span className="text-emerald-400 font-extrabold text-xs">
                +{teamPoints} pts
              </span>
            ) : (
              <span className="text-zinc-600 font-bold text-xs">0 pts</span>
            )
          ) : (
            <span className="text-zinc-500 font-bold text-xs">-</span>
          )}
        </div>
      </div>

      {/* Row 2: Status Badge + Guess Info */}
      <div className="flex items-center justify-between border-t border-dashed border-zinc-900/40 pt-1 mt-1">
        <div className="flex items-center">
          {isQualified ? (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Classificado
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-zinc-800/50 text-zinc-500 border border-zinc-800">
              Eliminado
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold text-zinc-500">
            Palpite: {guessRank}º {isGuessExtra ? "classificado" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
