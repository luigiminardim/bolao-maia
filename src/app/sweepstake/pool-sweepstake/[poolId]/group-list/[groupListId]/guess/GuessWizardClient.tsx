"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  ProgressBar,
  Spinner,
  Switch,
  Chip,
  Label,
} from "@heroui/react";
import { submitGuessAction } from "../../../../../../actions";
import { GroupListSweepstakeDto } from "../../../../../../../usecase/dto/SweepstakeDto";
import { GroupListGuessDto } from "../../../../../../../usecase/dto/GuessDto";

import { getTeamFlagSvgUrl } from "../../../../../../utils/getTeamFlagSvgUrl";

interface GuessWizardClientProps {
  poolId: string;
  groupListId: string;
  sweepstake: GroupListSweepstakeDto;
  existingGuess: GroupListGuessDto | null;
}

export function GuessWizardClient({
  poolId,
  groupListId,
  sweepstake,
  existingGuess,
}: GuessWizardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStep, setCurrentStep] = useState(0); // 0 to sweepstake.groups.length - 1

  // 3. User's local reordering state
  const [groupGuesses, setGroupGuesses] = useState<string[][]>(() => {
    if (existingGuess) {
      return existingGuess.groupGuesses.map((g) =>
        g.classification.map((t) => t.id),
      );
    }
    return sweepstake.groups.map((g) =>
      g.classification.map((t) => t?.id || ""),
    );
  });

  // 4. User's local extra qualified state
  const [extraGuesses, setExtraGuesses] = useState<string[]>(() => {
    if (existingGuess) {
      return existingGuess.extraQualifiedListGuess.map((t) => t.id);
    }
    return [];
  });

  // Drag and drop local state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Validate extra guesses based on position
  const validateExtraGuesses = (newGroupGuesses: string[][]) => {
    // If an extra qualified team is no longer in maxRegularQualifiedPosition, remove it
    let changed = false;
    const newExtraGuesses = extraGuesses.filter((teamId) => {
      // Find which group this team is in
      let groupIdx = -1;
      let posInGroup = -1;
      for (let i = 0; i < newGroupGuesses.length; i++) {
        const idx = newGroupGuesses[i].indexOf(teamId);
        if (idx !== -1) {
          groupIdx = i;
          posInGroup = idx;
          break;
        }
      }

      if (
        groupIdx !== -1 &&
        posInGroup !== sweepstake.maxRegularQualifiedPosition
      ) {
        changed = true;
        return false; // Remove it
      }
      return true; // Keep it
    });

    if (changed) {
      setExtraGuesses(newExtraGuesses);
    }
  };

  // Help functions for reordering
  const swapTeams = (groupIndex: number, idxA: number, idxB: number) => {
    const list = [...groupGuesses[groupIndex]];
    const temp = list[idxA];
    list[idxA] = list[idxB];
    list[idxB] = temp;

    const newGuesses = [...groupGuesses];
    newGuesses[groupIndex] = list;
    setGroupGuesses(newGuesses);
    validateExtraGuesses(newGuesses);
  };

  const handleMoveUp = (groupIndex: number, teamIdx: number) => {
    if (teamIdx > 0) swapTeams(groupIndex, teamIdx, teamIdx - 1);
  };

  const handleMoveDown = (groupIndex: number, teamIdx: number) => {
    const listLength = groupGuesses[groupIndex].length;
    if (teamIdx < listLength - 1) swapTeams(groupIndex, teamIdx, teamIdx + 1);
  };

  // Drag & drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (groupIndex: number, dropIdx: number) => {
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    swapTeams(groupIndex, draggedIdx, dropIdx);
    setDraggedIdx(null);
  };

  const handleToggleExtraQualified = (teamId: string, isSelected: boolean) => {
    if (!isSelected) {
      setExtraGuesses(extraGuesses.filter((id) => id !== teamId));
    } else {
      if (extraGuesses.length < sweepstake.extraQualifiedLength) {
        setExtraGuesses([...extraGuesses, teamId]);
      }
    }
  };

  // Handles wizard submission
  const handleSubmitGuess = () => {
    if (extraGuesses.length !== sweepstake.extraQualifiedLength) return;

    startTransition(async () => {
      const params = {
        poolSweepstake: poolId,
        groupListSweepstake: groupListId,
        groupGuesses: groupGuesses.map((classification) => ({
          classification,
        })),
        extraQualifiedListGuess: extraGuesses,
      };

      const result = await submitGuessAction(params);
      if (result.success) {
        // Redirect back to dashboard
        router.push(
          `/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}`,
        );
      } else {
        alert("Erro ao enviar: " + result.error);
      }
    });
  };

  const currentGroupIndex = currentStep;
  const isLastStep = currentStep === sweepstake.groups.length - 1;

  return (
    <main className="container mx-auto px-4 py-8 flex-1 flex flex-col justify-start max-w-5xl">
      <div className="mb-6">
        <Button
          size="sm"
          variant="ghost"
          onPress={() =>
            router.push(
              `/sweepstake/pool-sweepstake/${poolId}/group-list/${groupListId}`,
            )
          }
          className="text-zinc-400 hover:text-zinc-100 rounded-xl text-xs pl-0"
        >
          ← Voltar para o Ranking
        </Button>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        {/* Steps indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
            <span>
              Grupo {sweepstake.groups[currentGroupIndex].id} (Etapa{" "}
              {currentGroupIndex + 1} de {sweepstake.groups.length})
            </span>
            <span>
              {Math.round(((currentStep + 1) / sweepstake.groups.length) * 100)}
              % concluído
            </span>
          </div>
          <ProgressBar
            aria-label="Progresso do palpite"
            value={Math.round(
              ((currentStep + 1) / sweepstake.groups.length) * 100,
            )}
          >
            <ProgressBar.Track className="bg-zinc-900 h-2 rounded-full overflow-hidden">
              <ProgressBar.Fill className="bg-emerald-500 h-full rounded-full transition-all duration-300" />
            </ProgressBar.Track>
          </ProgressBar>
        </div>

        {/* Sticky Counter for Extra Qualified */}
        <div className="mb-6 bg-zinc-900/40 p-4 border border-zinc-900 rounded-2xl flex items-center justify-between sticky top-4 z-10 backdrop-blur-md shadow-md">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-200">
              Seleção de Melhores Terceiros
            </span>
            <span className="text-[10px] text-zinc-500">
              Marque as equipes na 3ª posição que irão avançar
            </span>
          </div>
          <Chip
            color={
              extraGuesses.length === sweepstake.extraQualifiedLength
                ? "success"
                : "warning"
            }
            className="font-bold text-xs"
            variant="soft"
          >
            {extraGuesses.length} de {sweepstake.extraQualifiedLength}{" "}
            selecionados
          </Chip>
        </div>

        {/* Wizard Panel Content */}
        <Card className="bg-zinc-900/40 border border-zinc-900 backdrop-blur-md rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-between">
          <div>
            {/* STEP: GROUP REORDERING */}
            <div className="mb-4">
              <h2 className="text-xl font-black text-white">
                Ordenar Grupo {sweepstake.groups[currentGroupIndex].id}
              </h2>
              <p className="text-zinc-500 text-xs mt-1">
                Arraste os times para a posição correta ou use as setas.
              </p>
            </div>

            {/* List of teams in the group */}
            <div className="space-y-3 mt-6">
              {groupGuesses[currentGroupIndex].map((teamId, idx) => {
                const teamObj = sweepstake.groups[
                  currentGroupIndex
                ].classification.find((t) => t?.id === teamId);

                // Badges classes
                let positionBadgeColor = "bg-zinc-850 text-zinc-400";
                let positionLabel = `${idx + 1}º`;

                const isExtraEligiblePosition =
                  idx === sweepstake.maxRegularQualifiedPosition;

                if (idx < sweepstake.maxRegularQualifiedPosition) {
                  positionBadgeColor =
                    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
                  positionLabel += " - Classificado";
                } else if (isExtraEligiblePosition) {
                  positionBadgeColor =
                    "bg-blue-500/10 text-blue-400 border border-blue-500/25";
                  positionLabel += " - Terceiro lugar";
                } else {
                  positionBadgeColor =
                    "bg-zinc-950/80 text-zinc-500 border border-zinc-900";
                  positionLabel += " - Eliminado";
                }

                const isChecked = extraGuesses.includes(teamId);
                const canCheckMore =
                  extraGuesses.length < sweepstake.extraQualifiedLength;

                return (
                  <div
                    key={teamId}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(currentGroupIndex, idx)}
                    className={`flex items-center justify-between p-4 bg-zinc-950/60 border hover:border-zinc-800 rounded-2xl cursor-grab active:cursor-grabbing group transition-all ${
                      isChecked
                        ? "border-blue-500/50 shadow-md shadow-blue-500/5"
                        : "border-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Position pill */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase ${positionBadgeColor}`}
                      >
                        {positionLabel}
                      </span>

                      {/* Team detail */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getTeamFlagSvgUrl(teamId)}
                        alt={teamObj?.name || "TBD"}
                        className="w-6 h-4 object-cover rounded-[2px] shadow-sm"
                      />
                      <span className="font-bold text-sm text-zinc-200">
                        {teamObj?.name || "TBD"}
                      </span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                      {/* Checkbox for extra qualified */}
                      {isExtraEligiblePosition && (
                        <div
                          className="flex items-center"
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <Switch
                            isSelected={isChecked}
                            onChange={(isSelected: boolean) =>
                              handleToggleExtraQualified(teamId, isSelected)
                            }
                            isDisabled={!isChecked && !canCheckMore}
                            size="sm"
                            className="mr-2"
                            aria-label="Avança de fase"
                          >
                            <Switch.Content>
                              <Label className="text-[14px] font-bold text-zinc-400 cursor-pointer">
                                Classificado
                              </Label>
                            </Switch.Content>
                            <Switch.Control>
                              <Switch.Thumb />
                            </Switch.Control>
                          </Switch>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          isDisabled={idx === 0}
                          onPress={() => handleMoveUp(currentGroupIndex, idx)}
                          className="text-zinc-500 hover:text-zinc-100 disabled:opacity-30 rounded-xl"
                        >
                          ▲
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          isDisabled={
                            idx === groupGuesses[currentGroupIndex].length - 1
                          }
                          onPress={() => handleMoveDown(currentGroupIndex, idx)}
                          className="text-zinc-500 hover:text-zinc-100 disabled:opacity-30 rounded-xl"
                        >
                          ▼
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wizard actions */}
          <div className="flex items-center justify-between mt-8 border-t border-zinc-900/60 pt-6">
            <Button
              variant="outline"
              isDisabled={currentStep === 0}
              onPress={() => {
                if (currentStep > 0) {
                  setCurrentStep(currentStep - 1);
                }
              }}
              className="border-zinc-800 hover:bg-zinc-950 text-zinc-400 font-bold rounded-xl text-xs px-5"
            >
              Anterior
            </Button>

            {!isLastStep ? (
              <Button
                onPress={() => setCurrentStep(currentStep + 1)}
                className="bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs px-6 hover:bg-emerald-400"
              >
                Próximo
              </Button>
            ) : (
              <Button
                onPress={handleSubmitGuess}
                isDisabled={
                  isPending ||
                  extraGuesses.length !== sweepstake.extraQualifiedLength
                }
                className="bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs px-6 hover:bg-emerald-400 disabled:opacity-40"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" className="text-zinc-950" />
                    <span>Enviando...</span>
                  </div>
                ) : extraGuesses.length < sweepstake.extraQualifiedLength ? (
                  <span>
                    Falta selecionar{" "}
                    {sweepstake.extraQualifiedLength - extraGuesses.length}{" "}
                    melhor
                    {sweepstake.extraQualifiedLength - extraGuesses.length > 1
                      ? "es"
                      : ""}{" "}
                    terceiro
                    {sweepstake.extraQualifiedLength - extraGuesses.length > 1
                      ? "s"
                      : ""}
                  </span>
                ) : (
                  "Confirmar e Enviar Palpite"
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
