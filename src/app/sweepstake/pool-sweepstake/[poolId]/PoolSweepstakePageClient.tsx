"use client";

import { Button, Card, Chip, Tabs, Table, Avatar } from "@heroui/react";
import Link from "next/link";
import React from "react";
import { ExternalLinkIcon } from "lucide-react";
import {
  GroupListSweepstakeDto,
  PoolSweepstakeDto,
  PoolSweepstakeItemDto,
} from "../../../../usecase/dto/SweepstakeDto";
import {
  PoolGuessRankingDto,
  PoolGuessRankingListDto,
  PoolSubsweepstakeMetaDto,
} from "../../../../usecase/dto/GuessRankingDto";
import { UserDto } from "../../../../usecase/dto/UserDto";

interface PoolSweepstakePageClientProps {
  pool: PoolSweepstakeDto;
  currentUser: UserDto | null;
  poolRankingListDto: PoolGuessRankingListDto;
}

export function PoolSweepstakePageClient({
  pool,
  currentUser,
  poolRankingListDto,
}: PoolSweepstakePageClientProps) {
  const poolId = pool.id;

  return (
    <main className="container mx-auto px-4 py-10 flex-1 flex flex-col justify-start max-w-5xl">
      <BannerSection pool={pool} />

      <div className="flex-1 flex flex-col">
        <Tabs className="w-full flex flex-col gap-6" id="pool-dashboard-tabs">
          <Tabs.ListContainer className="border-b border-zinc-900">
            <Tabs.List
              aria-label="Abas do Bolão"
              className="flex gap-4 md:gap-8 overflow-x-auto pb-0.5 *:px-4 *:py-3 *:text-sm *:font-semibold *:transition-all *:relative *:outline-none"
            >
              <Tabs.Tab
                id="modalidades"
                className="text-zinc-400 data-[selected=true]:text-emerald-400"
              >
                <span>⚽ Modalidades</span>
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

          <Tabs.Panel id="modalidades" className="pt-2">
            <ModalidadesTabPanel pool={pool} poolId={poolId} />
          </Tabs.Panel>

          <Tabs.Panel id="leaderboard" className="pt-2">
            <PoolLeaderboard
              poolId={poolId}
              poolRankingListDto={poolRankingListDto}
              currentUser={currentUser}
            />
          </Tabs.Panel>
        </Tabs>
      </div>
    </main>
  );
}

// -----------------------------------------------------------------------------
// BANNER
// -----------------------------------------------------------------------------

function BannerSection({ pool }: { pool: PoolSweepstakeDto }) {
  return (
    <div className="relative overflow-hidden bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 md:p-12 mb-10 shadow-2xl">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Bolão Ativo
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          {pool.name}{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            {pool.subtitle}
          </span>
        </h1>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          {pool.description}
        </p>
        <Link
          href={`/sweepstake/pool-sweepstake/${pool.id}/score-policy`}
          className="inline-flex items-center gap-1.5 mt-4 text-md text-zinc-500 hover:text-emerald-400 transition-colors"
        >
          📋 Ver regras de pontuação
        </Link>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MODALIDADES TAB
// -----------------------------------------------------------------------------

function ModalidadesTabPanel({
  pool,
  poolId,
}: {
  pool: PoolSweepstakeDto;
  poolId: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-extrabold text-zinc-200 mb-6 tracking-tight">
        Modalidades do Bolão
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pool.subSweepstakeList.map((item) => (
          <SweepstakeCard
            key={`${item.kind} ${item.sweepstake.id}`}
            poolId={poolId}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}

type SweepstakeStatus = "draft" | "open" | "locked";

interface StatusConfig {
  cardClass: string;
  badgeText: React.ReactNode;
  badgeClass: string;
  buttonText: string;
  buttonClass: string;
  isDisabled: boolean;
}

function getSweepstakeStatusConfig(status: SweepstakeStatus): StatusConfig {
  switch (status) {
    case "draft":
      return {
        cardClass: "bg-zinc-900/20 border-zinc-900/40 opacity-60",
        badgeText: "Em Breve",
        badgeClass: "bg-zinc-800/80 text-zinc-400 border-zinc-700",
        buttonText: "Indisponível no momento",
        buttonClass: "bg-zinc-950 text-zinc-600 cursor-not-allowed",
        isDisabled: true,
      };
    case "open":
      return {
        cardClass: "bg-zinc-900/40 border-zinc-900/80 hover:border-zinc-800",
        badgeText: (
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Aberto para Palpites
          </span>
        ),
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        buttonText: "Palpitar e Participar",
        buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold",
        isDisabled: false,
      };
    case "locked":
      return {
        cardClass: "bg-zinc-900/40 border-zinc-900/80 hover:border-zinc-800",
        badgeText: "Em Andamento",
        badgeClass: "bg-zinc-800/80 text-zinc-400 border-zinc-700",
        buttonText: "Ver Resultados e Classificação",
        buttonClass:
          "bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 hover:border-zinc-700 font-bold",
        isDisabled: false,
      };
  }
}

function SweepstakeCard({
  poolId,
  item,
}: {
  poolId: string;
  item: PoolSweepstakeItemDto;
}) {
  if (item.kind === "group") {
    return (
      <GroupSweepstakeCard
        poolId={poolId}
        sweepstake={item.sweepstake}
        factor={item.factor}
      />
    );
  }

  return <KnockoutSweepstakeCard poolId={poolId} item={item} />;
}

function GroupSweepstakeCard({
  poolId,
  sweepstake,
  factor,
}: {
  poolId: string;
  sweepstake: GroupListSweepstakeDto;
  factor: number;
}) {
  const config = getSweepstakeStatusConfig(sweepstake.status);

  return (
    <Card
      className={`transition-all flex flex-col justify-between overflow-hidden group p-6 rounded-2xl shadow-xl border ${config.cardClass}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">⚽</span>
          <Chip
            size="sm"
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${config.badgeClass}`}
          >
            {config.badgeText}
          </Chip>
        </div>

        <h3 className="text-lg font-bold text-zinc-100 transition-colors">
          {sweepstake.name}
        </h3>
        <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
          {sweepstake.description}
        </p>

        <div className="mt-6 space-y-2 text-xs text-zinc-500 border-t border-zinc-900/60 pt-4">
          <SweepstakeInfoRow
            label="Início:"
            value={new Date(sweepstake.startDate).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <SweepstakeInfoRow
            label="Grupos:"
            value={`${sweepstake.groups.length} grupos`}
          />
          <SweepstakeInfoRow
            label="Multiplicador de Pontos:"
            value={`x${factor}`}
            valueClassName="text-emerald-400 font-bold"
          />
        </div>
      </div>

      <div className="mt-6 pt-2 space-y-2">
        {config.isDisabled ? (
          <Button
            isDisabled
            className={`w-full text-xs py-3 rounded-xl border transition-all ${config.buttonClass}`}
          >
            {config.buttonText}
          </Button>
        ) : (
          <Link
            href={`/sweepstake/pool-sweepstake/${poolId}/group-list/${sweepstake.id}`}
            className="block w-full"
          >
            <Button
              className={`w-full text-xs py-3 rounded-xl border transition-all ${config.buttonClass}`}
            >
              {config.buttonText}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}

function KnockoutSweepstakeCard({
  poolId,
  item,
}: {
  poolId: string;
  item: Extract<PoolSweepstakeItemDto, { kind: "cup" }>;
}) {
  const sweepstake = item.sweepstake;
  const config = getSweepstakeStatusConfig(sweepstake.status);

  return (
    <Card
      className={`transition-all flex flex-col justify-between overflow-hidden group p-6 rounded-2xl shadow-xl border ${config.cardClass}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">🏆</span>
          <Chip
            size="sm"
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${config.badgeClass}`}
          >
            {config.badgeText}
          </Chip>
        </div>
        <h3 className="text-lg font-bold text-zinc-100 transition-colors">
          {sweepstake.name}
        </h3>
        <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
          {sweepstake.description}
        </p>

        <div className="mt-6 space-y-2 text-xs text-zinc-500 border-t border-zinc-900/60 pt-4">
          <SweepstakeInfoRow
            label="Início:"
            value={new Date(sweepstake.startDate).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <SweepstakeInfoRow
            label="Multiplicador de Pontos:"
            value={`x${item.factor}`}
            valueClassName="text-emerald-400 font-bold"
          />
        </div>
      </div>
      <div className="mt-6 pt-2 space-y-2">
        {config.isDisabled ? (
          <Button
            isDisabled
            className={`w-full text-xs py-3 rounded-xl border transition-all ${config.buttonClass}`}
          >
            {config.buttonText}
          </Button>
        ) : (
          <Link
            href={`/sweepstake/pool-sweepstake/${poolId}/cup/${sweepstake.id}`}
            className="block w-full"
          >
            <Button
              className={`w-full text-xs py-3 rounded-xl border transition-all ${config.buttonClass}`}
            >
              {config.buttonText}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}

function SweepstakeInfoRow({
  label,
  value,
  valueClassName = "text-zinc-400 font-semibold",
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// LEADERBOARD TAB
// -----------------------------------------------------------------------------

function PoolLeaderboard({
  poolId,
  poolRankingListDto,
  currentUser,
}: {
  poolId: string;
  poolRankingListDto: PoolGuessRankingListDto;
  currentUser: UserDto | null;
}) {
  const { rankings, subsweepstakes } = poolRankingListDto;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-extrabold text-zinc-200 tracking-tight">
          Classificação Geral do Bolão
        </h3>
        <p className="text-zinc-500 text-xs mt-0.5">
          Pontuação total acumulada em todas as modalidades.
        </p>
      </div>

      <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden mt-2">
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Classificação Geral do Bolão"
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
                <Table.Column className="text-right py-3 sm:py-4 pr-4">
                  Total
                </Table.Column>
                {subsweepstakes.map((sub) => (
                  <Table.Column
                    key={sub.kind + sub.id}
                    className="text-center py-3 sm:py-4 px-2 min-w-[7rem]"
                  >
                    <SubsweepstakeHeaderLink poolId={poolId} sub={sub} />
                  </Table.Column>
                ))}
              </Table.Header>

              <Table.Body className="text-sm font-semibold text-zinc-200">
                {rankings.map((entry, index) => (
                  <PoolLeaderboardRow
                    key={entry.user.id}
                    poolId={poolId}
                    entry={entry}
                    subsweepstakes={subsweepstakes}
                    showPosition={
                      index === 0 ||
                      entry.position !== rankings[index - 1]?.position
                    }
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

function SubsweepstakeHeaderLink({
  poolId,
  sub,
}: {
  poolId: string;
  sub: PoolSubsweepstakeMetaDto;
}) {
  const href =
    sub.kind === "group"
      ? `/sweepstake/pool-sweepstake/${poolId}/group-list/${sub.id}`
      : `/sweepstake/pool-sweepstake/${poolId}/cup/${sub.id}`;

  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
    >
      <span>{sub.name}</span>
      <ExternalLinkIcon className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function PoolLeaderboardRow({
  poolId,
  entry,
  subsweepstakes,
  showPosition,
  isMe,
}: {
  poolId: string;
  entry: PoolGuessRankingDto;
  subsweepstakes: PoolSubsweepstakeMetaDto[];
  showPosition: boolean;
  isMe: boolean;
}) {
  return (
    <Table.Row
      className={`border-b border-zinc-900 transition-all ${
        isMe ? "bg-emerald-500/5 font-bold" : ""
      }`}
    >
      <Table.Cell className="pl-4 sm:pl-6 py-3 sm:py-4">
        <span
          className={`flex items-center justify-center size-6 rounded-full text-xs font-bold transition-opacity ${
            showPosition ? "opacity-100" : "opacity-0"
          } ${
            isMe
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-zinc-500"
          }`}
        >
          {entry.position}º
        </span>
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
            className={`line-clamp-2 ${
              isMe ? "text-emerald-400 font-extrabold" : "text-zinc-200"
            }`}
          >
            {entry.user.name}
          </span>
        </div>
      </Table.Cell>

      <Table.Cell className="text-right pr-4 py-3 sm:py-4 font-black">
        <span className={isMe ? "text-emerald-400" : "text-zinc-100"}>
          {entry.score !== null ? `${entry.score} pts` : "–"}
        </span>
      </Table.Cell>

      {subsweepstakes.map((sub) => {
        const subResult = entry.subResultList.find(
          (r) => r.sweepstakeId === sub.id && r.kind === sub.kind,
        );
        const guessHref =
          sub.kind === "group"
            ? `/sweepstake/pool-sweepstake/${poolId}/group-list/${sub.id}/guess/${entry.user.id}`
            : `/sweepstake/pool-sweepstake/${poolId}/cup/${sub.id}/guess/${entry.user.id}`;

        return (
          <Table.Cell
            key={sub.kind + sub.id}
            className="text-center px-2 py-3 sm:py-4"
          >
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-zinc-400 font-semibold text-sm">
                {subResult?.score !== null && subResult?.score !== undefined
                  ? `${subResult.score} pts`
                  : "–"}
              </span>
              <Link
                href={guessHref}
                className="text-zinc-600 hover:text-emerald-400 transition-colors"
                title="Ver palpite"
              >
                <ExternalLinkIcon className="size-3" />
              </Link>
            </div>
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
}
