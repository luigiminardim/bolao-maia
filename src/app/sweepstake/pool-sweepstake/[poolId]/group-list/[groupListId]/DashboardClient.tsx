"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Tabs,
  Chip,
  Table,
  Modal,
  Alert,
  Avatar,
} from "@heroui/react";
import { Header } from "../../../../../components/Header";
import { UserDto } from "../../../../../../usecase/dto/UserDto";
import { GroupListSweepstakeDto } from "../../../../../../usecase/dto/SweepstakeDto";
import { GroupListGuessDto } from "../../../../../../usecase/dto/GuessDto";
import { PoolGuessResultDto } from "../../../../../../usecase/dto/PoolGuessResultDto";
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

  // 1. Time Simulation Sandbox State
  const officialHasStarted = new Date() >= new Date(sweepstake.startDate);
  const [simulatedStarted, _setSimulatedStarted] =
    useState<boolean>(officialHasStarted);

  // 2. Selected participant detail modal state
  const [selectedLeaderboardUser, setSelectedLeaderboardUser] =
    useState<PoolGuessResultDto | null>(null);

  // Retrieve user points details from the leaderboard data
  const userLeaderboardEntry = leaderboard.find(
    (entry) => entry.user.id === currentUser?.id,
  );

  // Derive existing group guesses to display if user has already guessed
  const groupGuesses = existingGuess
    ? existingGuess.groupGuesses.map((g) => g.classification.map((t) => t.id))
    : sweepstake.groups.map((g) => g.classification.map((t) => t?.id || ""));

  const extraGuesses = existingGuess
    ? existingGuess.extraQualifiedListGuess.map((t) => t.id)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* 1. HEADER */}
      <Header currentUser={currentUser} />

      {/* 2. SIMULATION & DEVELOPER PANEL */}
      {/* <div className="bg-zinc-900/40 border-b border-zinc-900 p-3">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="text-emerald-500">⚙️</span>
            <span className="font-bold">Modo de Testes:</span>
            <span>Simule os estados do bolão alternando abaixo</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] text-zinc-500 font-medium">
              Estado do campeonato:
            </span>
            <button
              onClick={() => {
                setSimulatedStarted(false);
              }}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                !simulatedStarted
                  ? "bg-emerald-500 text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Antes do Início
            </button>
            <button
              onClick={() => {
                setSimulatedStarted(true);
              }}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                simulatedStarted
                  ? "bg-emerald-500 text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Em Andamento / Finalizado
            </button>
          </div>
        </div>
      </div> */}

      <main className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-start max-w-5xl">
        {/* Main Navigation back button */}
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

        {/* ---------------- BEFORE START VIEW ---------------- */}
        {!simulatedStarted && (
          <div className="flex-1 flex flex-col">
            {/* If has no guess */}
            {!existingGuess && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <Card className="max-w-xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col items-center">
                  <span className="text-5xl mb-4 animate-pulse">📝</span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Você ainda não salvou seu palpite!
                  </h2>
                  <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
                    Ordene os times de cada um dos 12 grupos do campeonato e
                    indique quais serão os {sweepstake.extraQualifiedLength}{" "}
                    melhores terceiros colocados que avançam de fase.
                  </p>

                  <div className="mt-8 w-full">
                    {currentUser ? (
                      <Button
                        onPress={() => {
                          router.push(
                            `/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}/guess`,
                          );
                        }}
                        className="w-full bg-emerald-500 text-zinc-950 font-bold py-3 hover:bg-emerald-400 transition-all rounded-xl text-sm shadow-lg shadow-emerald-500/10"
                      >
                        Fazer Palpite
                      </Button>
                    ) : (
                      <Button
                        onPress={() =>
                          router.push(
                            `/login?callbackUrl=/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}`,
                          )
                        }
                        className="w-full bg-emerald-500 text-zinc-950 font-bold py-3 hover:bg-emerald-400 transition-all rounded-xl text-sm"
                      >
                        Faça Login para Palpitar
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* If has ALREADY GUESSED */}
            {existingGuess && (
              <div className="flex-1 flex flex-col gap-6">
                {/* Banner notice */}
                <Alert
                  status="success"
                  className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400"
                >
                  <p className="font-bold text-emerald-400 mb-1">
                    Palpite Confirmado!
                  </p>
                  Seu palpite foi salvo com sucesso. Quando o campeonato
                  começar, os resultados oficiais e o ranking serão liberados em
                  tempo real.
                </Alert>

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: grid of groups guesses */}
                  <div className="flex-1">
                    <h3 className="text-lg font-extrabold text-zinc-200 mb-4 tracking-tight">
                      Sua Classificação Prevista
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sweepstake.groups.map((group, gIdx) => {
                        const userClassification = groupGuesses[gIdx];
                        return (
                          <Card
                            key={group.id}
                            className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl shadow-md"
                          >
                            <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-zinc-950">
                              <h4 className="font-extrabold text-sm text-zinc-300">
                                Grupo {group.id}
                              </h4>
                            </div>
                            <div className="space-y-2">
                              {userClassification.map((teamId, idx) => {
                                const teamObj = group.classification.find(
                                  (t) => t?.id === teamId,
                                )!;
                                let markerColor = "bg-zinc-950 text-zinc-500";
                                if (
                                  idx < sweepstake.maxRegularQualifiedPosition
                                ) {
                                  markerColor =
                                    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                                } else if (idx === 2) {
                                  markerColor =
                                    "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                                }
                                return (
                                  <div
                                    key={teamId}
                                    className="flex items-center justify-between text-xs font-semibold py-1.5 px-2.5 bg-zinc-950/40 border border-zinc-900/60 rounded-xl"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${markerColor}`}
                                      >
                                        {idx + 1}º
                                      </span>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={getTeamFlagSvgUrl(teamId)}
                                        alt={teamObj.name}
                                        className="w-4 h-3 object-cover rounded-[2px]"
                                      />
                                      <span className="text-zinc-300 font-bold">
                                        {teamObj.name}
                                      </span>
                                    </div>
                                    {extraGuesses.includes(teamId) && (
                                      <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md font-bold uppercase">
                                        Melhor 3º
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Selected Best 3rd places */}
                  <div className="w-full lg:w-80 shrink-0">
                    <Card className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl shadow-md sticky top-24">
                      <h3 className="text-sm font-extrabold text-zinc-300 mb-4 pb-2 border-b border-zinc-950 uppercase tracking-wider">
                        Seus Melhores Terceiros
                      </h3>

                      <div className="space-y-3">
                        {extraGuesses.map((teamId) => {
                          const groupLetter =
                            sweepstake.groups.find((g) =>
                              g.classification.some((t) => t?.id === teamId),
                            )?.id || "?";
                          const teamObj = sweepstake.groups
                            .flatMap((g) => g.classification)
                            .find((t) => t?.id === teamId)!;

                          return (
                            <div
                              key={teamId}
                              className="flex items-center gap-2 p-3 bg-zinc-950/60 border border-zinc-900/80 rounded-xl border-l-4 border-l-blue-500"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getTeamFlagSvgUrl(teamId)}
                                alt={teamObj.name}
                                className="w-5 h-3.5 object-cover rounded-[2px]"
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-xs text-zinc-200">
                                  {teamObj.name}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-semibold">
                                  Grupo {groupLetter}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {extraGuesses.length === 0 && (
                          <div className="text-center py-4 text-xs text-zinc-500">
                            Nenhum time selecionado
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- DURING / AFTER START VIEW ---------------- */}
        {simulatedStarted && (
          <div className="flex-1 flex flex-col">
            <Tabs className="w-full flex flex-col gap-6" id="started-tabs">
              {/* Tab Navigation header */}
              <Tabs.ListContainer className="border-b border-zinc-900">
                <Tabs.List
                  aria-label="Abas do Campeonato iniciado"
                  className="flex gap-4 md:gap-8 overflow-x-auto pb-0.5 *:px-4 *:py-3 *:text-sm *:font-semibold *:transition-all *:relative *:outline-none"
                >
                  <Tabs.Tab
                    id="live-standings"
                    className="text-zinc-400 data-[selected=true]:text-emerald-400"
                  >
                    <span>📊 Classificação Oficial</span>
                    <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  </Tabs.Tab>

                  <Tabs.Tab
                    id="my-points"
                    className="text-zinc-400 data-[selected=true]:text-emerald-400"
                  >
                    <span>⚽ Meus Palpites</span>
                    <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  </Tabs.Tab>

                  <Tabs.Tab
                    id="leaderboard"
                    className="text-zinc-400 data-[selected=true]:text-emerald-400"
                  >
                    <span>🏆 Ranking Geral</span>
                    <Tabs.Indicator className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              {/* TAB 1: OFFICIAL STANDINGS */}
              <Tabs.Panel id="live-standings" className="pt-2">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Live groups grid */}
                  <div className="flex-1">
                    <h3 className="text-lg font-extrabold text-zinc-200 mb-4 tracking-tight">
                      Classificação Atual dos Grupos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sweepstake.groups.map((group) => (
                        <Card
                          key={group.id}
                          className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl shadow-md"
                        >
                          <h4 className="font-extrabold text-sm text-zinc-300 mb-3 pb-1.5 border-b border-zinc-950">
                            Grupo {group.id}
                          </h4>
                          <div className="space-y-2">
                            {group.classification.map((team, idx) => {
                              const isRegular =
                                idx < sweepstake.maxRegularQualifiedPosition;
                              const isExtra =
                                sweepstake.extraQualifiedList.some(
                                  (x) => x?.id === team?.id,
                                );

                              let markerColor = "bg-zinc-950 text-zinc-500";
                              if (isRegular) {
                                markerColor =
                                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                              } else if (isExtra) {
                                markerColor =
                                  "bg-blue-500/10 text-blue-400 border border-blue-500/20";
                              }

                              return (
                                <div
                                  key={team?.id || `missing-${idx}`}
                                  className="flex items-center justify-between text-xs font-semibold py-1.5 px-2.5 bg-zinc-950/40 border border-zinc-900/60 rounded-xl"
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${markerColor}`}
                                    >
                                      {idx + 1}º
                                    </span>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={getTeamFlagSvgUrl(team?.id || "")}
                                      alt={team?.name || "TBD"}
                                      className="w-4 h-3 object-cover rounded-[2px]"
                                    />
                                    <span className="text-zinc-300 font-bold">
                                      {team?.name || "TBD"}
                                    </span>
                                  </div>

                                  {/* Qualification pill */}
                                  {(isRegular || isExtra) && (
                                    <span
                                      className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                                        isRegular
                                          ? "bg-emerald-500/10 text-emerald-400"
                                          : "bg-blue-500/10 text-blue-400"
                                      }`}
                                    >
                                      {isRegular
                                        ? "Classificado"
                                        : "Melhor Terceiro"}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Official Extra Qualified list */}
                  <div className="w-full lg:w-80 shrink-0">
                    <Card className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl shadow-md sticky top-24">
                      <h3 className="text-sm font-extrabold text-zinc-300 mb-4 pb-2 border-b border-zinc-950 uppercase tracking-wider">
                        Terceiros Qualificados
                      </h3>
                      <div className="space-y-3">
                        {sweepstake.extraQualifiedList.map((team, idx) => {
                          if (!team) {
                            return (
                              <div
                                key={`empty-${idx}`}
                                className="flex items-center gap-2 p-3 bg-zinc-950/20 border border-zinc-900/30 border-dashed rounded-xl opacity-40"
                              >
                                <span className="text-xl">⚽</span>
                                <span className="text-xs text-zinc-500 font-bold">
                                  Vaga {idx + 1} em aberto
                                </span>
                              </div>
                            );
                          }
                          const groupLetter =
                            sweepstake.groups.find((g) =>
                              g.classification.some((t) => t?.id === team?.id),
                            )?.id || "?";
                          return (
                            <div
                              key={team.id}
                              className="flex items-center gap-2 p-3 bg-zinc-950/60 border border-zinc-900/80 rounded-xl border-l-4 border-l-blue-500"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getTeamFlagSvgUrl(team.id)}
                                alt={team.name}
                                className="w-5 h-3.5 object-cover rounded-[2px]"
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-xs text-zinc-200">
                                  {team.name}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-semibold">
                                  Grupo {groupLetter}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                </div>
              </Tabs.Panel>

              {/* TAB 2: MY PALPITES / SCORES BREAKDOWN */}
              <Tabs.Panel id="my-points" className="pt-2">
                {!existingGuess ? (
                  <div className="text-center py-10">
                    <Card className="bg-zinc-900/30 border border-zinc-900 p-8 rounded-2xl max-w-md mx-auto">
                      <span className="text-4xl mb-2">😢</span>
                      <h3 className="font-bold text-zinc-300 text-lg">
                        Sem palpites salvos
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Você não registrou um palpite antes do início do
                        campeonato.
                      </p>
                    </Card>
                  </div>
                ) : (
                  <div>
                    <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="font-extrabold text-lg text-zinc-200">
                          Pontuação dos Seus Palpites
                        </h3>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          Confira a pontuação obtida em cada palpite conforme a
                          tabela de classificação.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl shadow-inner">
                        <span className="text-xs text-emerald-400 font-bold">
                          Pontos Totais:
                        </span>
                        <span className="text-lg text-white font-black">
                          {userLeaderboardEntry?.score.toFixed(2) || "0.00"} pts
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sweepstake.groups.map((group, gIdx) => {
                        // User guess for this group
                        const userClassification = groupGuesses[gIdx];
                        // Points breakdown from leaderboard if matching
                        const userGroupSubResult =
                          userLeaderboardEntry?.subResultList.find(
                            (sub) => sub.kind === "group",
                          );
                        const groupResult =
                          userGroupSubResult?.kind === "group"
                            ? userGroupSubResult.groupResult.groupResultList[
                                gIdx
                              ]
                            : null;

                        return (
                          <Card
                            key={group.id}
                            className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl shadow-md"
                          >
                            <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-zinc-950">
                              <h4 className="font-extrabold text-sm text-zinc-300">
                                Grupo {group.id}
                              </h4>
                              {groupResult && (
                                <Chip
                                  size="sm"
                                  color="success"
                                  className="text-[10px] font-bold"
                                >
                                  +
                                  {groupResult.classification
                                    .reduce((acc, c) => acc + (c.score || 0), 0)
                                    .toFixed(2)}{" "}
                                  pts
                                </Chip>
                              )}
                            </div>

                            <div className="space-y-3">
                              {userClassification.map((teamId, idx) => {
                                const teamObj = group.classification.find(
                                  (t) => t?.id === teamId,
                                )!;
                                // Find official rank of this team
                                const officialRank =
                                  group.classification.findIndex(
                                    (t) => t?.id === teamId,
                                  ) + 1;
                                // Points won for this specific team prediction
                                const teamPoints =
                                  groupResult?.classification.find(
                                    (c) => c.team?.id === teamId,
                                  )?.score || 0;

                                return (
                                  <div
                                    key={teamId}
                                    className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-900/80 rounded-xl"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex flex-col text-center justify-center min-w-10">
                                        <span className="text-[10px] font-bold text-zinc-200">
                                          Palpite: {idx + 1}º
                                        </span>
                                        <span className="text-[9px] text-zinc-500">
                                          Oficial: {officialRank}º
                                        </span>
                                      </div>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={getTeamFlagSvgUrl(teamId)}
                                        alt={teamObj.name}
                                        className="w-5 h-3.5 object-cover rounded-[2px]"
                                      />
                                      <span className="font-bold text-xs text-zinc-300">
                                        {teamObj.name}
                                      </span>
                                    </div>

                                    {teamPoints > 0 ? (
                                      <span className="text-emerald-400 font-extrabold text-xs">
                                        +{teamPoints.toFixed(2)} pts
                                      </span>
                                    ) : (
                                      <span className="text-zinc-600 font-bold text-xs">
                                        0.00 pts
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Tabs.Panel>

              {/* TAB 3: LEADERBOARD */}
              <Tabs.Panel id="leaderboard" className="pt-2">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-zinc-200 tracking-tight">
                      Classificação dos Participantes
                    </h3>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      Clique em qualquer participante para abrir os palpites
                      detalhados dele.
                    </p>
                  </div>

                  <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden mt-2">
                    <Table>
                      <Table.ScrollContainer>
                        <Table.Content
                          aria-label="Tabela de Ranking de Palpites"
                          className="min-w-[500px]"
                        >
                          <Table.Header className="bg-zinc-900/50 text-zinc-400 border-b border-zinc-850 text-xs font-bold uppercase tracking-wider">
                            <Table.Column
                              isRowHeader
                              className="w-20 pl-6 py-4"
                            >
                              Posição
                            </Table.Column>
                            <Table.Column className="py-4">
                              Usuário
                            </Table.Column>
                            <Table.Column className="text-right pr-6 py-4">
                              Pontuação Total
                            </Table.Column>
                          </Table.Header>
                          <Table.Body className="text-sm font-semibold text-zinc-200">
                            {leaderboard.map((entry, index) => {
                              const isMe = entry.user.id === currentUser?.id;
                              const rank = index + 1;
                              return (
                                <Table.Row
                                  key={entry.user.id}
                                  onClick={() =>
                                    setSelectedLeaderboardUser(entry)
                                  }
                                  className={`border-b border-zinc-900 hover:bg-zinc-900/40 transition-all cursor-pointer ${
                                    isMe
                                      ? "bg-emerald-500/5 hover:bg-emerald-500/10 font-bold"
                                      : ""
                                  }`}
                                >
                                  <Table.Cell className="pl-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`flex items-center justify-center size-6 rounded-full text-xs font-bold ${
                                          rank === 1
                                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                            : rank === 2
                                              ? "bg-zinc-400/20 text-zinc-300 border border-zinc-400/30"
                                              : rank === 3
                                                ? "bg-amber-600/20 text-amber-500 border border-amber-600/30"
                                                : "text-zinc-500"
                                        }`}
                                      >
                                        {rank}º
                                      </span>
                                    </div>
                                  </Table.Cell>
                                  <Table.Cell className="py-4">
                                    <div className="flex items-center gap-3">
                                      <Avatar
                                        size="sm"
                                        className={`size-8 font-bold ${isMe ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-zinc-300"}`}
                                      >
                                        <Avatar.Fallback>
                                          {entry.user.name
                                            .substring(0, 2)
                                            .toUpperCase()}
                                        </Avatar.Fallback>
                                      </Avatar>
                                      <span
                                        className={
                                          isMe
                                            ? "text-emerald-400 font-extrabold"
                                            : "text-zinc-200"
                                        }
                                      >
                                        {entry.user.name}
                                        {isMe && (
                                          <Chip
                                            size="sm"
                                            className="ml-2 h-4 px-1 text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-bold uppercase"
                                          >
                                            Você
                                          </Chip>
                                        )}
                                      </span>
                                    </div>
                                  </Table.Cell>
                                  <Table.Cell className="text-right pr-6 py-4 font-black">
                                    <span
                                      className={
                                        isMe
                                          ? "text-emerald-400"
                                          : "text-zinc-100"
                                      }
                                    >
                                      {entry.score.toFixed(2)} pts
                                    </span>
                                  </Table.Cell>
                                </Table.Row>
                              );
                            })}
                          </Table.Body>
                        </Table.Content>
                      </Table.ScrollContainer>
                    </Table>
                  </div>
                </div>
              </Tabs.Panel>
            </Tabs>
          </div>
        )}
      </main>

      {/* 6. MODAL: PARTICIPANT DETAIL VIEW */}
      <Modal.Backdrop
        isOpen={!!selectedLeaderboardUser}
        onOpenChange={(open) => {
          if (!open) setSelectedLeaderboardUser(null);
        }}
      >
        <Modal.Container>
          <Modal.Dialog className="bg-zinc-950 border border-zinc-900 rounded-3xl sm:max-w-[600px] p-6">
            <Modal.CloseTrigger />
            {selectedLeaderboardUser && (
              <>
                <Modal.Header className="flex flex-col gap-1 pb-4 border-b border-zinc-900">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="md"
                      className="font-bold bg-zinc-800 text-zinc-300"
                    >
                      <Avatar.Fallback>
                        {selectedLeaderboardUser.user.name
                          .substring(0, 2)
                          .toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar>
                    <div>
                      <Modal.Heading className="text-lg font-extrabold text-zinc-100">
                        Palpites de {selectedLeaderboardUser.user.name}
                      </Modal.Heading>
                      <p className="text-xs text-zinc-500">
                        Pontuação Total:{" "}
                        <span className="text-emerald-400 font-extrabold">
                          {selectedLeaderboardUser.score.toFixed(2)} pts
                        </span>
                      </p>
                    </div>
                  </div>
                </Modal.Header>
                <Modal.Body className="py-6 max-h-[50vh] overflow-y-auto">
                  {!selectedLeaderboardUser.subResultList.some(
                    (sub) => sub.kind === "group",
                  ) ? (
                    <p className="text-xs text-zinc-500 text-center py-6">
                      Este usuário não possui palpites salvos.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLeaderboardUser.subResultList
                        .filter((sub) => sub.kind === "group")
                        .flatMap((sub) =>
                          (sub.kind === "group"
                            ? sub.groupResult.groupResultList
                            : []
                          ).map((gr, idx) => {
                            const officialGroup = sweepstake.groups[idx];
                            return (
                              <Card
                                key={officialGroup.id}
                                className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl"
                              >
                                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-zinc-950">
                                  <span className="font-extrabold text-xs text-zinc-300">
                                    Grupo {officialGroup.id}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-400">
                                    +
                                    {gr.classification
                                      .reduce(
                                        (acc, c) => acc + (c.score || 0),
                                        0,
                                      )
                                      .toFixed(2)}{" "}
                                    pts
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  {gr.classification.map((teamGuess, tIdx) => {
                                    if (!teamGuess.team) return null;
                                    const officialRank =
                                        officialGroup.classification.findIndex(
                                          (t) => t?.id === teamGuess.team?.id,
                                        ) + 1;
                                    return (
                                      <div
                                        key={teamGuess.team.id}
                                        className="flex items-center justify-between text-[11px] py-1 px-2 bg-zinc-950/30 border border-zinc-900/40 rounded-lg"
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-zinc-500 text-[9px] font-semibold min-w-10">
                                            {tIdx + 1}º (Of: {officialRank}º)
                                          </span>
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={getTeamFlagSvgUrl(
                                              teamGuess.team.id,
                                            )}
                                            alt={teamGuess.team.name}
                                            className="w-4 h-3 object-cover rounded-[2px]"
                                          />
                                          <span className="text-zinc-300 truncate max-w-28 font-bold">
                                            {teamGuess.team.name}
                                          </span>
                                        </div>
                                        {(teamGuess.score || 0) > 0 && (
                                          <span className="text-emerald-400 font-extrabold text-[10px]">
                                            +{(teamGuess.score || 0).toFixed(2)}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </Card>
                            );
                          }),
                        )}
                    </div>
                  )}
                </Modal.Body>
                <Modal.Footer className="border-t border-zinc-900 pt-4">
                  <Button
                    size="sm"
                    slot="close"
                    className="bg-zinc-900 text-zinc-300 font-bold px-4 py-2 hover:bg-zinc-800 rounded-xl text-xs border border-zinc-800"
                  >
                    Fechar
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
