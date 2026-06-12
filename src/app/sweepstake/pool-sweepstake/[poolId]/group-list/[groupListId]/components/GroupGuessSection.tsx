"use client";

import React from "react";
import { Card, Chip } from "@heroui/react";
import { GroupListSweepstakeDto } from "../../../../../../../usecase/dto/SweepstakeDto";
import { GroupGuessResultDto } from "../../../../../../../usecase/dto/PoolGuessResultDto";
import { getTeamFlagSvgUrl } from "../../../../../../utils/getTeamFlagSvgUrl";

export interface GroupGuessSectionProps {
  group: GroupListSweepstakeDto["groups"][number];
  groupGuess: string[];
  extraGuesses: string[];
  maxRegularQualifiedPosition: number;
  groupResult?: GroupGuessResultDto | null;
  sweepstakeStatus?: "draft" | "open" | "locked";
}

export function GroupGuessSection({
  group,
  groupGuess,
  extraGuesses,
  maxRegularQualifiedPosition,
  groupResult,
  sweepstakeStatus,
}: GroupGuessSectionProps) {
  const groupScore =
    groupResult?.classification.reduce((acc, c) => acc + (c.score ?? 0), 0) ??
    0;

  return (
    <Card className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl shadow-md">
      <div>
        <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-zinc-950">
          <h4 className="font-extrabold text-sm text-zinc-300">
            Grupo {group.id}
          </h4>
          {groupResult?.score != null && (
            <Chip size="sm" color="success" className="text-[10px] font-bold">
              +{groupScore.toFixed(2)} pts
            </Chip>
          )}
        </div>

        <div className="space-y-3">
          {groupGuess.map((teamId, idx) => {
            const teamObj = group.classification.find((t) => t?.id === teamId);
            if (!teamObj) return null;

            const isExtraEligiblePosition = idx === maxRegularQualifiedPosition;
            const isChecked = extraGuesses.includes(teamId);
            const isQualified =
              idx < maxRegularQualifiedPosition ||
              (isExtraEligiblePosition && isChecked);

            return (
              <ReadonlyTeamRow
                key={teamId}
                teamId={teamId}
                teamName={teamObj.name}
                index={idx}
                isQualified={isQualified}
                isExtraEligiblePosition={isExtraEligiblePosition}
                isChecked={isChecked}
                group={group}
                groupResult={groupResult}
                sweepstakeStatus={sweepstakeStatus}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}

interface ReadonlyTeamRowProps {
  teamId: string;
  teamName: string;
  index: number;
  isQualified: boolean;
  isExtraEligiblePosition: boolean;
  isChecked: boolean;
  group: GroupListSweepstakeDto["groups"][number];
  groupResult?: GroupGuessResultDto | null;
  sweepstakeStatus?: "draft" | "open" | "locked";
}

function ReadonlyTeamRow({
  teamId,
  teamName,
  index,
  isQualified,
  isExtraEligiblePosition,
  isChecked,
  group,
  groupResult,
  sweepstakeStatus,
}: ReadonlyTeamRowProps) {
  const officialRank =
    group.classification.findIndex((t) => t?.id === teamId) + 1;
  const teamPoints = groupResult?.classification.find(
    (c) => c.team?.id === teamId,
  )?.score;

  return (
    <div className="flex flex-col gap-1 p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="flex flex-col text-center justify-center min-w-[40px]">
          <span className="text-[10px] font-bold text-zinc-200">
            Palpite: {index + 1}º
          </span>
          {sweepstakeStatus === "locked" && (
            <span className="text-[9px] text-zinc-500">
              Oficial: {officialRank > 0 ? `${officialRank}º` : "-"}
            </span>
          )}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getTeamFlagSvgUrl(teamId)}
          alt={teamName}
          className="w-6 h-4 object-cover rounded-[2px] shadow-sm"
        />
        <span className="font-bold text-xs text-zinc-300">{teamName}</span>
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-zinc-900/40 pt-1 mt-1">
        <div className="flex items-center">
          {isChecked && isExtraEligiblePosition && (
            <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md font-bold uppercase">
              Melhor 3º
            </span>
          )}
          {isQualified && !isExtraEligiblePosition && (
            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-bold uppercase">
              Classificado
            </span>
          )}
        </div>
        {teamPoints != null ? (
          teamPoints > 0 ? (
            <span className="text-emerald-400 font-extrabold text-xs">
              +{teamPoints} pts
            </span>
          ) : (
            <span className="text-zinc-600 font-bold text-xs">0.00 pts</span>
          )
        ) : (
          <span className="text-zinc-500 font-bold text-xs">-</span>
        )}
      </div>
    </div>
  );
}
