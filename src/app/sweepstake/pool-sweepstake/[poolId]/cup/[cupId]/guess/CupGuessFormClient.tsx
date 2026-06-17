"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Button,
  Card,
  ProgressBar,
  Spinner,
  RadioGroup,
  Radio,
  Label,
} from "@heroui/react";
import { submitCupGuessAction } from "../../../../../../actions";
import { CupSweepstakeDto } from "@/usecase/dto/SweepstakeDto";
import { TeamDto } from "@/usecase/dto/TeamDto";
import { BinaryTreeDao } from "@/utils/BinaryTree";
import { getTeamFlagSvgUrl } from "../../../../../../utils/getTeamFlagSvgUrl";

// --- Helpers ---

function getTreeHeight<T>(node: BinaryTreeDao<T> | null): number {
  if (!node) return 0;
  const leftHeight = node.children[0] ? getTreeHeight(node.children[0]) : 0;
  const rightHeight = node.children[1] ? getTreeHeight(node.children[1]) : 0;
  return Math.max(leftHeight, rightHeight) + 1;
}

function getPhaseName(d: number): string {
  switch (d) {
    case 0:
      return "Final";
    case 1:
      return "Semi-Final";
    case 2:
      return "Quartas de Final";
    case 3:
      return "Oitavas de Final";
    case 4:
      return "16 avos de final";
    case 5:
      return "32 avos de final";
    case 6:
      return "64 avos de final";
    default:
      return `Fase ${d}`;
  }
}

function getNodesAtDepth<T>(
  node: BinaryTreeDao<T> | null,
  targetDepth: number,
  currentDepth: number = 0,
): { node: BinaryTreeDao<T>; path: number[] }[] {
  if (!node) return [];
  if (node.children[0] === null && node.children[1] === null) return [];

  if (currentDepth === targetDepth) {
    return [{ node, path: [] }];
  }
  const lefts = getNodesAtDepth(
    node.children[0],
    targetDepth,
    currentDepth + 1,
  ).map((x) => ({ node: x.node, path: [0, ...x.path] }));
  const rights = getNodesAtDepth(
    node.children[1],
    targetDepth,
    currentDepth + 1,
  ).map((x) => ({ node: x.node, path: [1, ...x.path] }));
  return [...lefts, ...rights];
}

function cloneTree<T>(node: BinaryTreeDao<T> | null): BinaryTreeDao<T> | null {
  if (!node) return null;
  return {
    elem: node.elem,
    children: [cloneTree(node.children[0]), cloneTree(node.children[1])],
  };
}

function applyUpdate(
  root: BinaryTreeDao<TeamDto | null>,
  path: number[],
  winner: TeamDto | null,
): BinaryTreeDao<TeamDto | null> | null {
  const newRoot = cloneTree(root);
  if (!newRoot) return null;

  let current = newRoot;
  for (const dir of path) {
    current.elem = null;
    const child = current.children[dir];
    if (!child) {
      throw new Error("Invalid path in tree update");
    }
    current = child;
  }
  current.elem = winner;
  return newRoot;
}

function getLoser(
  node: BinaryTreeDao<TeamDto | null> | null | undefined,
): TeamDto | null {
  if (!node || !node.elem) return null;
  const t1 = node.children[0]?.elem;
  const t2 = node.children[1]?.elem;
  if (t1 && t1.id === node.elem.id) return t2 ?? null;
  if (t2 && t2.id === node.elem.id) return t1 ?? null;
  return null;
}

function treeToIdTree(
  node: BinaryTreeDao<TeamDto | null> | null,
): BinaryTreeDao<string> {
  if (!node) throw new Error("Tree is incomplete");
  if (!node.elem) throw new Error("Missing team selection in tree");
  return {
    elem: node.elem.id,
    children: [
      node.children[0] ? treeToIdTree(node.children[0]) : null,
      node.children[1] ? treeToIdTree(node.children[1]) : null,
    ],
  };
}

// --- Components ---

function FormHeader({
  currentStep,
  totalSteps,
  stepLabel,
}: {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}) {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
        <span>
          {stepLabel} (Etapa {currentStep + 1} de {totalSteps})
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

function TeamRadioOption({ team }: { team: TeamDto }) {
  return (
    <Radio
      value={team.id}
      className="flex px-3 py-2.5 m-0 max-w-full w-full bg-zinc-950/60 border border-zinc-900 rounded-xl hover:border-zinc-700 transition-colors data-[selected=true]:border-emerald-500/50 data-[selected=true]:bg-emerald-500/10"
    >
      <Radio.Control>
        <Radio.Indicator />
      </Radio.Control>
      <Radio.Content>
        <Label className="flex items-center gap-3 ml-2 cursor-pointer">
          <Image
            src={getTeamFlagSvgUrl(team.id)}
            alt={team.name}
            width={24}
            height={16}
            className="w-6 h-4 object-cover rounded-[2px] shadow-sm"
          />
          <span className="font-bold text-sm text-zinc-200">{team.name}</span>
        </Label>
      </Radio.Content>
    </Radio>
  );
}

function MatchItem({
  team1,
  team2,
  selectedId,
  path,
  onSelectWinner,
}: {
  team1: TeamDto | null | undefined;
  team2: TeamDto | null | undefined;
  selectedId: string;
  path: number[];
  onSelectWinner: (path: number[], val: string) => void;
}) {
  if (!team1 || !team2) {
    return (
      <div className="flex flex-col items-center justify-center py-4 opacity-50">
        <p className="text-zinc-500 text-sm">Confronto Indefinido</p>
        <p className="text-zinc-600 text-xs">
          Termine a fase anterior primeiro.
        </p>
      </div>
    );
  }

  return (
    <div className="py-1">
      <RadioGroup
        value={selectedId}
        onChange={(val: string) => onSelectWinner(path, val)}
        className="w-full"
      >
        <div className="flex flex-col gap-1.5 relative">
          <TeamRadioOption team={team1} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <span className="text-[10px] font-black text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded-md border border-zinc-800 shadow-sm">
              X
            </span>
          </div>
          <TeamRadioOption team={team2} />
        </div>
      </RadioGroup>
    </div>
  );
}

function ThirdPlaceMatchCard({
  loser1,
  loser2,
  selectedId,
  onSelectThirdPlace,
}: {
  loser1: TeamDto | null;
  loser2: TeamDto | null;
  selectedId: string;
  onSelectThirdPlace: (val: string) => void;
}) {
  if (!loser1 || !loser2) {
    return (
      <Card className="bg-zinc-900/40 border border-zinc-900/50 backdrop-blur-md rounded-2xl p-6 shadow-md flex items-center justify-center opacity-50">
        <p className="text-zinc-500 text-sm">Confronto Indefinido</p>
        <p className="text-zinc-600 text-xs">Termine a Semi-Final primeiro.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/40 border border-zinc-900 backdrop-blur-md rounded-2xl p-6 shadow-xl">
      <RadioGroup
        value={selectedId}
        onChange={onSelectThirdPlace}
        className="w-full"
      >
        <div className="flex flex-col gap-1.5 relative">
          <TeamRadioOption team={loser1} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <span className="text-[10px] font-black text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded-md border border-zinc-800 shadow-sm">
              X
            </span>
          </div>
          <TeamRadioOption team={loser2} />
        </div>
      </RadioGroup>
    </Card>
  );
}

// --- Main Component ---

interface CupGuessFormClientProps {
  poolId: string;
  cupId: string;
  sweepstake: CupSweepstakeDto;
}

export function CupGuessFormClient({
  poolId,
  cupId,
  sweepstake,
}: CupGuessFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [rootGuess, setRootGuess] = useState<BinaryTreeDao<TeamDto | null>>(
    () => {
      const cloned = cloneTree(sweepstake.championship.root);
      if (!cloned) {
        throw new Error("Missing championship root tree");
      }
      return cloned;
    },
  );
  const [thirdPlace, setThirdPlace] = useState<TeamDto | null>(null);

  const treeHeight = getTreeHeight(rootGuess);
  const totalPhases = Math.max(1, treeHeight - 1);

  const [currentStep, setCurrentStep] = useState(0);

  const currentDepth = treeHeight - 2 - currentStep;
  const stepLabel = getPhaseName(currentDepth);

  const phaseNodes = getNodesAtDepth(rootGuess, currentDepth);

  const isPhaseComplete = phaseNodes.every((n) => n.node.elem !== null);
  const isLastStep = currentStep === totalPhases - 1;

  let canSubmit = isPhaseComplete;
  if (isLastStep && sweepstake.championship.hasThirdPlaceMatch) {
    if (!thirdPlace) canSubmit = false;
  }

  const handleSelectWinner = (path: number[], winnerId: string) => {
    const nodeInfo = phaseNodes.find((n) => n.path.join() === path.join());
    if (!nodeInfo) return;

    const t1 = nodeInfo.node.children[0]?.elem;
    const t2 = nodeInfo.node.children[1]?.elem;
    const winnerTeam =
      t1?.id === winnerId ? t1 : t2?.id === winnerId ? t2 : null;

    if (winnerTeam) {
      const newRoot = applyUpdate(rootGuess, path, winnerTeam);
      if (newRoot) {
        setRootGuess(newRoot);
        setThirdPlace(null);
      }
    }
  };

  const handleSelectThirdPlace = (winnerId: string) => {
    const semi1 = rootGuess?.children[0];
    const semi2 = rootGuess?.children[1];
    const loser1 = getLoser(semi1);
    const loser2 = getLoser(semi2);

    const winnerTeam =
      loser1?.id === winnerId
        ? loser1
        : loser2?.id === winnerId
          ? loser2
          : null;
    if (winnerTeam) {
      setThirdPlace(winnerTeam);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    startTransition(async () => {
      try {
        const rootIdTree = treeToIdTree(rootGuess);
        const params = {
          poolSweepstake: poolId,
          cupSweepstake: cupId,
          root: rootIdTree,
          thirdPlace: thirdPlace?.id ?? null,
        };

        const result = await submitCupGuessAction(params);
        if (result.success) {
          router.push(`/sweepstake/pool-sweepstake/${poolId}/cup/${cupId}`);
        } else {
          alert(`Erro ao enviar: ${result.error}`);
        }
      } catch (_err) {
        alert("O palpite está incompleto. Preencha todas as fases.");
      }
    });
  };

  const handlePreviousStep = () => {
    setCurrentStep((p) => p - 1);
  };

  const handleNextStep = () => {
    setCurrentStep((p) => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full pb-12">
      <FormHeader
        currentStep={currentStep}
        totalSteps={totalPhases}
        stepLabel={stepLabel}
      />

      <div className="flex flex-col gap-6 mt-4">
        <h2 className="text-xl font-black text-white">{stepLabel}</h2>
        <p className="text-zinc-500 text-xs -mt-4">
          Selecione as equipes que avançarão para a próxima fase.
        </p>

        <Card className="bg-zinc-900/40 border border-zinc-900 backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          {phaseNodes.map((nodeInfo, index) => {
            const team1 = nodeInfo.node.children[0]?.elem;
            const team2 = nodeInfo.node.children[1]?.elem;
            const selectedId = nodeInfo.node.elem?.id ?? "";
            const key =
              nodeInfo.path.length === 0 ? "root" : nodeInfo.path.join("-");

            return (
              <React.Fragment key={key}>
                {index > 0 && <div className="h-px bg-zinc-900 w-full" />}
                <MatchItem
                  team1={team1}
                  team2={team2}
                  selectedId={selectedId}
                  path={nodeInfo.path}
                  onSelectWinner={handleSelectWinner}
                />
              </React.Fragment>
            );
          })}
        </Card>

        {isLastStep && sweepstake.championship.hasThirdPlaceMatch && (
          <div className="mt-8 flex flex-col gap-6">
            <h2 className="text-xl font-black text-white">
              Disputa do 3º Lugar
            </h2>
            <p className="text-zinc-500 text-xs -mt-4">
              Selecione o vencedor da disputa pelo 3º lugar.
            </p>

            <ThirdPlaceMatchCard
              loser1={getLoser(rootGuess?.children[0])}
              loser2={getLoser(rootGuess?.children[1])}
              selectedId={thirdPlace?.id ?? ""}
              onSelectThirdPlace={handleSelectThirdPlace}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-8 border-t border-zinc-900/60 pt-6">
        <Button
          variant="outline"
          isDisabled={currentStep === 0}
          onPress={handlePreviousStep}
          className="border-zinc-800 hover:bg-zinc-950 text-zinc-400 font-bold rounded-xl text-xs px-5"
        >
          Anterior
        </Button>

        {!isLastStep ? (
          <Button
            onPress={handleNextStep}
            isDisabled={!isPhaseComplete}
            className="bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs px-6 hover:bg-emerald-400 disabled:opacity-40"
          >
            Próximo
          </Button>
        ) : (
          <Button
            onPress={handleSubmit}
            isDisabled={isPending || !canSubmit}
            className="bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs px-6 hover:bg-emerald-400 disabled:opacity-40"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" className="text-zinc-950" />
                <span>Enviando...</span>
              </div>
            ) : (
              "Confirmar Palpite"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
