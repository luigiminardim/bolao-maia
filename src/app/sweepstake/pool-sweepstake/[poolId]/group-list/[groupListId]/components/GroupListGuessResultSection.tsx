import { Card, Chip } from "@heroui/react";
import { GroupListSweepstakeDto } from "../../../../../../../usecase/dto/SweepstakeDto";
import {
  PoolGuessResultDto,
  GroupGuessResultDto,
  GroupListGuessResultDto,
} from "../../../../../../../usecase/dto/PoolGuessResultDto";
import { getTeamFlagSvgUrl } from "../../../../../../utils/getTeamFlagSvgUrl";

interface GroupListGuessResultSectionProps {
  sweepstake: GroupListSweepstakeDto;
  groupGuesses?: string[][];
  extraGuesses?: string[];
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
  } else if (groupGuesses && extraGuesses) {
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
  } else {
    // Fallback if neither are provided
    resultDto = {
      score: null,
      groupResultList: [],
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
