"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Chip,
  Label,
  ProgressBar,
  Spinner,
  Switch,
} from "@heroui/react";
import { submitGuessAction } from "../../../../../../actions";
import { GroupListSweepstakeDto } from "../../../../../../../usecase/dto/SweepstakeDto";
import { GroupListGuessDto } from "../../../../../../../usecase/dto/GuessDto";
import { getTeamFlagSvgUrl } from "../../../../../../utils/getTeamFlagSvgUrl";

// --- Custom Hook ---

interface UseGroupListGuessFormProps {
  sweepstake: GroupListSweepstakeDto;
  existingGuess: GroupListGuessDto | null;
}

function useGroupListGuessForm({
  sweepstake,
  existingGuess,
}: UseGroupListGuessFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const [groupGuesses, setGroupGuesses] = useState<string[][]>(() => {
    if (existingGuess) {
      return existingGuess.groupGuesses.map((g) =>
        g.classification.map((t) => t.id),
      );
    }
    return sweepstake.groups.map((g) =>
      g.classification.map((t) => t?.id ?? ""),
    );
  });

  const [extraGuesses, setExtraGuesses] = useState<string[]>(() => {
    if (existingGuess) {
      return existingGuess.extraQualifiedListGuess.map((t) => t.id);
    }
    return [];
  });

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const validateExtraGuesses = (newGroupGuesses: string[][]) => {
    let changed = false;
    const newExtraGuesses = extraGuesses.filter((teamId) => {
      let posInGroup = -1;
      for (let i = 0; i < newGroupGuesses.length; i++) {
        const idx = newGroupGuesses[i].indexOf(teamId);
        if (idx !== -1) {
          posInGroup = idx;
          break;
        }
      }

      if (
        posInGroup !== -1 &&
        posInGroup !== sweepstake.maxRegularQualifiedPosition
      ) {
        changed = true;
        return false;
      }
      return true;
    });

    if (changed) {
      setExtraGuesses(newExtraGuesses);
    }
  };

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
    } else if (extraGuesses.length < sweepstake.extraQualifiedLength) {
      setExtraGuesses([...extraGuesses, teamId]);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    groupGuesses,
    extraGuesses,
    handleMoveUp,
    handleMoveDown,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleToggleExtraQualified,
  };
}

// --- Sub-components ---

interface FormHeaderProps {
  currentGroupIndex: number;
  totalGroups: number;
  groupId: string;
}

function FormHeader({
  currentGroupIndex,
  totalGroups,
  groupId,
}: FormHeaderProps) {
  const progressPercent = Math.round(
    ((currentGroupIndex + 1) / totalGroups) * 100,
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
        <span>
          Grupo {groupId} (Etapa {currentGroupIndex + 1} de {totalGroups})
        </span>
        <span>{progressPercent}% concluído</span>
      </div>
      <ProgressBar aria-label="Progresso do palpite" value={progressPercent}>
        <ProgressBar.Track className="bg-zinc-900 h-2 rounded-full overflow-hidden">
          <ProgressBar.Fill className="bg-emerald-500 h-full rounded-full transition-all duration-300" />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  );
}

interface ExtraQualifiedCounterProps {
  currentCount: number;
  requiredCount: number;
}

function ExtraQualifiedCounter({
  currentCount,
  requiredCount,
}: ExtraQualifiedCounterProps) {
  return (
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
        color={currentCount === requiredCount ? "success" : "warning"}
        className="font-bold text-xs"
        variant="soft"
      >
        {currentCount} de {requiredCount} selecionados
      </Chip>
    </div>
  );
}

interface TeamItemProps {
  teamId: string;
  teamName: string;
  index: number;
  maxRegularQualifiedPosition: number;
  isExtraEligiblePosition: boolean;
  isChecked: boolean;
  canCheckMore: boolean;
  isFirst: boolean;
  isLast: boolean;
  onDragStart: (idx: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (idx: number) => void;
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
  onToggleExtraQualified: (teamId: string, isSelected: boolean) => void;
}

function TeamItem({
  teamId,
  teamName,
  index,
  maxRegularQualifiedPosition,
  isExtraEligiblePosition,
  isChecked,
  canCheckMore,
  isFirst,
  isLast,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
  onToggleExtraQualified,
}: TeamItemProps) {
  let positionBadgeColor = "bg-zinc-850 text-zinc-400";
  let positionLabel = `${index + 1}º`;

  if (index < maxRegularQualifiedPosition) {
    positionBadgeColor =
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
    positionLabel += " - Classificado";
  } else if (isExtraEligiblePosition) {
    positionBadgeColor =
      "bg-blue-500/10 text-blue-400 border border-blue-500/25";
    positionLabel += " - Terceiro lugar";
  } else {
    positionBadgeColor = "bg-zinc-950/80 text-zinc-500 border border-zinc-900";
    positionLabel += " - Eliminado";
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(index)}
      className={`flex items-center justify-between p-4 bg-zinc-950/60 border hover:border-zinc-800 rounded-2xl cursor-grab active:cursor-grabbing group transition-all ${
        isChecked
          ? "border-blue-500/50 shadow-md shadow-blue-500/5"
          : "border-zinc-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase ${positionBadgeColor}`}
        >
          {positionLabel}
        </span>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getTeamFlagSvgUrl(teamId)}
          alt={teamName}
          className="w-6 h-4 object-cover rounded-[2px] shadow-sm"
        />
        <span className="font-bold text-sm text-zinc-200">{teamName}</span>
      </div>

      <div className="flex items-center gap-3">
        {isExtraEligiblePosition && (
          <div
            className="flex items-center"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Switch
              isSelected={isChecked}
              onChange={(isSelected: boolean) =>
                onToggleExtraQualified(teamId, isSelected)
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
            isDisabled={isFirst}
            onPress={() => onMoveUp(index)}
            className="text-zinc-500 hover:text-zinc-100 disabled:opacity-30 rounded-xl"
          >
            ▲
          </Button>
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            isDisabled={isLast}
            onPress={() => onMoveDown(index)}
            className="text-zinc-500 hover:text-zinc-100 disabled:opacity-30 rounded-xl"
          >
            ▼
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FormActionsProps {
  currentStep: number;
  isLastStep: boolean;
  isPending: boolean;
  extraGuessesCount: number;
  requiredExtraGuesses: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

function FormActions({
  currentStep,
  isLastStep,
  isPending,
  extraGuessesCount,
  requiredExtraGuesses,
  onPrevious,
  onNext,
  onSubmit,
}: FormActionsProps) {
  const remaining = requiredExtraGuesses - extraGuessesCount;

  return (
    <div className="flex items-center justify-between mt-8 border-t border-zinc-900/60 pt-6">
      <Button
        variant="outline"
        isDisabled={currentStep === 0}
        onPress={onPrevious}
        className="border-zinc-800 hover:bg-zinc-950 text-zinc-400 font-bold rounded-xl text-xs px-5"
      >
        Anterior
      </Button>

      {!isLastStep ? (
        <Button
          onPress={onNext}
          className="bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs px-6 hover:bg-emerald-400"
        >
          Próximo
        </Button>
      ) : (
        <Button
          onPress={onSubmit}
          isDisabled={isPending || extraGuessesCount !== requiredExtraGuesses}
          className="bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs px-6 hover:bg-emerald-400 disabled:opacity-40"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" className="text-zinc-950" />
              <span>Enviando...</span>
            </div>
          ) : remaining > 0 ? (
            <span>
              Falta selecionar {remaining} melhor
              {remaining > 1 ? "es" : ""} terceiro
              {remaining > 1 ? "s" : ""}
            </span>
          ) : (
            "Confirmar e Enviar Palpite"
          )}
        </Button>
      )}
    </div>
  );
}

// --- Main Component ---

interface GroupListGuessFormClientProps {
  poolId: string;
  groupListId: string;
  sweepstake: GroupListSweepstakeDto;
  existingGuess: GroupListGuessDto | null;
}

export function GroupListGuessFormClient({
  poolId,
  groupListId,
  sweepstake,
  existingGuess,
}: GroupListGuessFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    currentStep,
    setCurrentStep,
    groupGuesses,
    extraGuesses,
    handleMoveUp,
    handleMoveDown,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleToggleExtraQualified,
  } = useGroupListGuessForm({ sweepstake, existingGuess });

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
  const currentGroup = sweepstake.groups[currentGroupIndex];

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
      <FormHeader
        currentGroupIndex={currentGroupIndex}
        totalGroups={sweepstake.groups.length}
        groupId={currentGroup.id}
      />

      <ExtraQualifiedCounter
        currentCount={extraGuesses.length}
        requiredCount={sweepstake.extraQualifiedLength}
      />

      <Card className="bg-zinc-900/40 border border-zinc-900 backdrop-blur-md rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-black text-white">
              Ordenar Grupo {currentGroup.id}
            </h2>
            <p className="text-zinc-500 text-xs mt-1">
              Arraste os times para a posição correta ou use as setas.
            </p>
          </div>

          <div className="space-y-3 mt-6">
            {groupGuesses[currentGroupIndex].map((teamId, idx) => {
              const teamObj = currentGroup.classification.find(
                (t) => t?.id === teamId,
              );

              const isExtraEligiblePosition =
                idx === sweepstake.maxRegularQualifiedPosition;
              const isChecked = extraGuesses.includes(teamId);
              const canCheckMore =
                extraGuesses.length < sweepstake.extraQualifiedLength;

              return (
                <TeamItem
                  key={teamId}
                  teamId={teamId}
                  teamName={teamObj?.name ?? "TBD"}
                  index={idx}
                  maxRegularQualifiedPosition={
                    sweepstake.maxRegularQualifiedPosition
                  }
                  isExtraEligiblePosition={isExtraEligiblePosition}
                  isChecked={isChecked}
                  canCheckMore={canCheckMore}
                  isFirst={idx === 0}
                  isLast={idx === groupGuesses[currentGroupIndex].length - 1}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={(dropIdx) => handleDrop(currentGroupIndex, dropIdx)}
                  onMoveUp={(moveIdx) =>
                    handleMoveUp(currentGroupIndex, moveIdx)
                  }
                  onMoveDown={(moveIdx) =>
                    handleMoveDown(currentGroupIndex, moveIdx)
                  }
                  onToggleExtraQualified={handleToggleExtraQualified}
                />
              );
            })}
          </div>
        </div>

        <FormActions
          currentStep={currentStep}
          isLastStep={isLastStep}
          isPending={isPending}
          extraGuessesCount={extraGuesses.length}
          requiredExtraGuesses={sweepstake.extraQualifiedLength}
          onPrevious={() => {
            if (currentStep > 0) setCurrentStep(currentStep - 1);
          }}
          onNext={() => setCurrentStep(currentStep + 1)}
          onSubmit={handleSubmitGuess}
        />
      </Card>
    </div>
  );
}
