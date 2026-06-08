import { notFound } from "next/navigation";
import { getPoolSweepstakeUsecase } from "../../../../usecase/index";
import { getLoggedInUser } from "../../../actions";
import { Header } from "../../../components/Header";
import { Card, Chip, Button } from "@heroui/react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    poolId: string;
  }>;
}

export default async function PoolSweepstakePage({ params }: PageProps) {
  console.warn("pool", await params);
  const { poolId } = await params;
  const user = await getLoggedInUser();
  const pool = await getPoolSweepstakeUsecase.execute(poolId);

  if (!pool) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans antialiased">
      <Header currentUser={user} />

      <main className="container mx-auto px-4 py-10 flex-1 flex flex-col justify-start max-w-5xl">
        {/* Banner Section */}
        <div className="relative overflow-hidden bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 md:p-12 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Bolão Ativo
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Copa do Mundo{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Fifa World Cup 2026
              </span>
            </h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Dê seus palpites para o maior torneio de futebol do planeta.
              Complete a fase de grupos, ordene as classificações, defina os
              melhores terceiros colocados e dispute a liderança geral!
            </p>
            <Link
              href={`/sweepstake/pool-sweepstake/${poolId}/score-policy`}
              className="inline-flex items-center gap-1.5 mt-4 text-md text-zinc-500 hover:text-emerald-400 transition-colors"
            >
              📋 Ver regras de pontuação
            </Link>
          </div>
        </div>

        {/* Sweepstakes List */}
        <div>
          <h2 className="text-xl font-extrabold text-zinc-200 mb-6 tracking-tight">
            Modalidades do Bolão
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pool.subSweepstakeList.map((item) => {
              const hasStarted =
                new Date() >= new Date(item.sweepstake.startDate);

              if (item.kind === "group") {
                const groupSweepstake = item.sweepstake;
                return (
                  <Card
                    key={groupSweepstake.id}
                    className="bg-zinc-900/40 border border-zinc-900/80 hover:border-zinc-800 transition-all flex flex-col justify-between overflow-hidden group p-6 rounded-2xl shadow-xl"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl">⚽</span>
                        <Chip
                          color={hasStarted ? "default" : "success"}
                          size="sm"
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                            hasStarted
                              ? "bg-zinc-800/80 text-zinc-400 border-zinc-700"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {hasStarted ? "Em Andamento" : "Aberto para Palpites"}
                        </Chip>
                      </div>

                      <h3 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                        Fase de Grupos
                      </h3>
                      <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                        Ordene as posições dos times dos grupos A a L e
                        selecione os 8 melhores terceiros colocados que avançam
                        de fase.
                      </p>

                      <div className="mt-6 space-y-2 text-xs text-zinc-500 border-t border-zinc-900/60 pt-4">
                        <div className="flex justify-between">
                          <span>Início:</span>
                          <span className="text-zinc-400 font-semibold">
                            {new Date(
                              groupSweepstake.startDate,
                            ).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Grupos:</span>
                          <span className="text-zinc-400 font-semibold">
                            12 grupos (A ao L)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Multiplicador de Pontos:</span>
                          <span className="text-emerald-400 font-bold">
                            x{item.factor}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-2 space-y-2">
                      <Link
                        href={`/sweepstake/pool-sweepstake/${poolId}/group-list/${groupSweepstake.id}`}
                        className="block w-full"
                      >
                        <Button className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-200 font-bold text-xs py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
                          {hasStarted
                            ? "Ver Resultados e Classificação"
                            : "Palpitar e Participar"}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              }

              // Fallback for cup bracket sweepstakes if added in future
              return (
                <Card
                  key={item.sweepstake.id}
                  className="bg-zinc-900/20 border border-zinc-900/40 opacity-60 flex flex-col justify-between overflow-hidden p-6 rounded-2xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">🏆</span>
                      <Chip
                        color="default"
                        size="sm"
                        className="text-[10px] uppercase font-bold"
                      >
                        Em breve
                      </Chip>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-400">
                      Mata-Mata (Copa)
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">
                      Monte sua chave de mata-mata até a grande final e palpite
                      no campeão.
                    </p>
                  </div>
                  <div className="mt-6 pt-2">
                    <Button
                      isDisabled
                      className="w-full bg-zinc-950 text-zinc-600 text-xs py-3 rounded-xl cursor-not-allowed"
                    >
                      Indisponível no momento
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
