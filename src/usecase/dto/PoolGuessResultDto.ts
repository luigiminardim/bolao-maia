import { PoolGuessResult } from "../../entity/GuessResult";
import { UserDto, toUserDto } from "./UserDto";
import { TeamDto, toTeamDto } from "./TeamDto";

export interface PoolGuessResultDto {
  user: UserDto;
  score: number | null;
  subResultList: PoolItemResultDto[];
}

export type PoolItemResultDto =
  | { kind: "group"; factor: number; groupResult: GroupListGuessResultDto }
  | { kind: "cup"; factor: number; cupResult: CupGuessResultDto };

export interface GroupListGuessResultDto {
  score: number | null;
  groupResultList: GroupGuessResultDto[];
}

export interface GroupGuessResultDto {
  score: number | null;
  classification: GroupGuessNodeInfoDto[];
}

export interface GroupGuessNodeInfoDto {
  team: TeamDto | null;
  positionGuess: number | null;
  extraQualifiedGuess: boolean;
  score: number | null;
}

export interface CupGuessResultDto {
  score: number | null;
}

export function toPoolGuessResultDto(
  result: PoolGuessResult,
): PoolGuessResultDto {
  return {
    user: toUserDto(result.user),
    score: result.score,
    subResultList: result.subResultList.map((subRes) => {
      if (subRes.kind === "group") {
        return {
          kind: "group" as const,
          factor: subRes.factor,
          groupResult: {
            score: subRes.groupResult.score,
            groupResultList: subRes.groupResult.groups.map((gRes) => ({
              score: gRes.score,
              classification: gRes.classification.map((node) => ({
                team: node.team ? toTeamDto(node.team) : null,
                positionGuess: node.positionGuess,
                extraQualifiedGuess: node.extraQualifiedGuess,
                score: node.score,
              })),
            })),
          },
        };
      } else {
        return {
          kind: "cup" as const,
          factor: subRes.factor,
          cupResult: {
            score: subRes.cupResult.score,
          },
        };
      }
    }),
  };
}
