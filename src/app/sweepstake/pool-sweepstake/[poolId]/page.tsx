import { notFound } from "next/navigation";
import { getPoolSweepstakeUsecase } from "../../../../usecase/index";
import { Card, Chip, Button } from "@heroui/react";
import Link from "next/link";
import React from "react";
import {
  GroupListSweepstakeDto,
  PoolSweepstakeItemDto,
  PoolSweepstakeDto,
} from "../../../../usecase/dto/SweepstakeDto";

interface PageProps {
  params: Promise<{
    poolId: string;
  }>;
}

export default async function PoolSweepstakePage({ params }: PageProps) {
  const { poolId } = await params;
  const pool = await getPoolSweepstakeUsecase.execute(poolId);

  if (!pool) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-10 flex-1 flex flex-col justify-start max-w-5xl">
      <BannerSection pool={pool} />

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
    </main>
  );
}

interface BannerSectionProps {
  pool: PoolSweepstakeDto;
}

function BannerSection({ pool }: BannerSectionProps) {
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

interface SweepstakeCardProps {
  poolId: string;
  item: PoolSweepstakeItemDto;
}

function SweepstakeCard({ poolId, item }: SweepstakeCardProps) {
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

interface GroupSweepstakeCardProps {
  poolId: string;
  sweepstake: GroupListSweepstakeDto;
  factor: number;
}

function GroupSweepstakeCard({
  poolId,
  sweepstake,
  factor,
}: GroupSweepstakeCardProps) {
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

interface KnockoutSweepstakeCardProps {
  poolId: string;
  item: Extract<PoolSweepstakeItemDto, { kind: "cup" }>;
}

function KnockoutSweepstakeCard({ poolId, item }: KnockoutSweepstakeCardProps) {
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

interface SweepstakeInfoRowProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

function SweepstakeInfoRow({
  label,
  value,
  valueClassName = "text-zinc-400 font-semibold",
}: SweepstakeInfoRowProps) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}
