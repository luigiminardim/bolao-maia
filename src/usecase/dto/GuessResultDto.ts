import {
  CupGuessResult,
  GroupListGroupGuessResult,
  GroupListGuessResult,
  GroupListTeamGuessResult,
  PoolGuessResult,
} from "../../entity/GuessResult";
import { UserDto, toUserDto } from "./UserDto";
import { TeamDto, toTeamDto } from "./TeamDto";
import {
  GroupListChampionship,
  GroupListGroupChampionship,
} from "@/entity/Championship";
import { CupSweepstake, GroupListSweepstake } from "@/entity/Sweepstake";
import { User } from "@/entity/User";

// PoolGuessResultDto

export interface PoolGuessResultDto {
  user: UserDto;
  score: number | null;
  subResultList: PoolGuessResultItemDto[];
}

export type PoolGuessResultItemDto =
  | {
      kind: "group";
      factor: number;
      group: {
        id: GroupListSweepstake["id"];
        score: GroupListGuessResult["score"];
      };
    }
  | {
      kind: "cup";
      factor: number;
      cup: { id: CupSweepstake["id"]; score: CupGuessResult["score"] };
    };

export function toPoolGuessResultDto(
  result: PoolGuessResult,
): PoolGuessResultDto {
  return {
    user: toUserDto(result.user),
    score: result.score,
    subResultList: result.subResultList.map(
      (subRes): PoolGuessResultItemDto => {
        if (subRes.kind === "group") {
          return {
            kind: "group" as const,
            factor: subRes.factor,
            group: {
              id: subRes.groupResult.sweepstakeId,
              score: subRes.groupResult.score,
            },
          };
        } else {
          return {
            kind: "cup" as const,
            factor: subRes.factor,
            cup: {
              id: subRes.cupResult.sweepstakeId,
              score: subRes.cupResult.score,
            },
          };
        }
      },
    ),
  };
}

// GroupListGuessResultDto

export interface GroupListGuessResultDto {
  user: UserDto;
  score: number | null;
  groupList: GroupListGroupGuessResultDto[];
}

export interface GroupListGroupGuessResultDto {
  group: {
    id: string;
  };
  score: number | null;
  classification: GroupListTeamGuessResultDto[];
}

export interface GroupListTeamGuessResultDto {
  team: TeamDto;
  score: number | null;
  guessPosition: number;
  guessQualified: boolean;
  guessExtraQualified: boolean;
  teamPosition: null | number;
  teamQualified: boolean;
  teamExtraQualified: boolean;
}

export function toGroupListGuessResultDto(
  result: GroupListGuessResult,
  groupListChampionship: GroupListChampionship,
  user: User,
): GroupListGuessResultDto {
  return {
    user: toUserDto(user),
    score: result.score,
    groupList: groupListChampionship.getGroups().map((group, index) => {
      const groupResult = result.groupList[index];
      if (!groupResult) {
        throw new Error("Group result not found");
      }
      return toGroupListGroupGuessResultDto(groupResult, group);
    }),
  };
}

function toGroupListGroupGuessResultDto(
  result: GroupListGroupGuessResult,
  group: GroupListGroupChampionship,
): GroupListGroupGuessResultDto {
  return {
    group: {
      id: group.getId(),
    },
    score: result.score,
    classification: result.classification.map(toGroupListTeamGuessResultDto),
  };
}

function toGroupListTeamGuessResultDto(
  result: GroupListTeamGuessResult,
): GroupListTeamGuessResultDto {
  return {
    team: toTeamDto(result.team),
    guessPosition: result.guessPosition,
    guessQualified: result.guessQualified,
    guessExtraQualified: result.guessExtraQualified,
    teamPosition: result.teamPosition,
    teamQualified: result.teamQualified,
    teamExtraQualified: result.teamExtraQualified,
    score: result.score,
  };
}

export interface CupGuessResultDto {
  score: number | null;
}
