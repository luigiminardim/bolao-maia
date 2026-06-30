import { BinaryTree, BinaryTreeDao } from "../../utils/BinaryTree";
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

export interface CupGuessTeamResultListItemDto {
  team: TeamDto;
  teamPosition: number;
  guessPosition: number;
  score: number | null;
}

export interface CupGuessTeamResultDto {
  team: TeamDto;
  info: null | {
    teamPosition: number;
    guessPosition: number;
    score: number | null;
  };
}

export interface CupGuessResultDto {
  user: UserDto;
  score: number | null;
  root: BinaryTreeDao<CupGuessTeamResultDto>;
  thirdPlace: CupGuessTeamResultDto | null;
  list: CupGuessTeamResultListItemDto[];
}

export function toCupGuessResultDto(
  result: CupGuessResult,
  user: User,
): CupGuessResultDto {
  const root: BinaryTreeDao<CupGuessTeamResultDto> = BinaryTree.toDto(
    result.root,
    (node) => ({
      team: toTeamDto(node.team),
      info: !!node.info
        ? {
            teamPosition: node.info.teamPosition,
            guessPosition: node.info.guessPosition,
            score: node.info.score,
          }
        : null,
    }),
  );
  const thirdPlace: CupGuessTeamResultDto | null = result.thirdPlace
    ? {
        team: toTeamDto(result.thirdPlace.team),
        info: !!result.thirdPlace.info
          ? {
              teamPosition: result.thirdPlace.info.teamPosition,
              guessPosition: result.thirdPlace.info.guessPosition,
              score: result.thirdPlace.info.score,
            }
          : null,
      }
    : null;

  const list: CupGuessTeamResultListItemDto[] = result.toList().map((item) => ({
    team: toTeamDto(item.team),
    teamPosition: item.teamPosition,
    guessPosition: item.guessPosition,
    score: item.score,
  }));

  return {
    user: toUserDto(user),
    score: result.score,
    root,
    thirdPlace,
    list,
  };
}
