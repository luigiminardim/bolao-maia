import { GroupListChampionship } from "../../entity/Championship";
import {
  CupGuess,
  GroupListGuess,
  PoolGuess,
  getIsTeamClassified,
} from "../../entity/Guess";
import { PoolSweepstake } from "../../entity/Sweepstake";
import { User } from "../../entity/User";
import { BinaryTree, BinaryTreeDao } from "../../utils/BinaryTree";
import { TeamDto, toTeamDto } from "./TeamDto";
import { UserDto, toUserDto } from "./UserDto";

export interface GroupListTeamGuessDto {
  team: TeamDto;
  guessPosition: number;
  guessQualified: boolean;
}

export interface GroupListGroupGuessDto {
  id: string;
  classification: GroupListTeamGuessDto[];
}

export interface GroupListGuessDto {
  groupGuesses: GroupListGroupGuessDto[];
  extraQualifiedListGuess: TeamDto[];
}

export function toGroupListGuessDto(
  groupListGuess: GroupListGuess,
  championship: GroupListChampionship,
): GroupListGuessDto {
  return {
    groupGuesses: groupListGuess.groupGuesses.map((g, index) => {
      const groupChampionship = championship.getGroups()[index];
      return {
        id: groupChampionship?.getId() ?? "",
        classification: g.classification.map((team, tIndex) => {
          const guessPosition = tIndex + 1;
          const guessQualified = getIsTeamClassified(
            groupListGuess,
            championship,
            team,
          );

          return {
            team: toTeamDto(team),
            guessPosition,
            guessQualified,
          };
        }),
      };
    }),
    extraQualifiedListGuess:
      groupListGuess.extraQualifiedListGuess.map(toTeamDto),
  };
}

export interface CupGuessDto {
  root: BinaryTreeDao<TeamDto>;
  thirdPlace: TeamDto | null;
}

export function toCupGuessDto(cupGuess: CupGuess): CupGuessDto {
  return {
    root: BinaryTree.toDto(cupGuess.root, toTeamDto),
    thirdPlace: cupGuess.thirdPlace ? toTeamDto(cupGuess.thirdPlace) : null,
  };
}

export type PoolGuessItemDto =
  | { kind: "group"; groupGuess: GroupListGuessDto }
  | { kind: "cup"; cupGuess: CupGuessDto };

export interface PoolGuessDto {
  user: UserDto;
  sweepstakeId: string;
  subGuesses: PoolGuessItemDto[];
}

export function toPoolGuessDto(
  poolGuess: PoolGuess,
  user: User,
  poolSweepstake: PoolSweepstake,
): PoolGuessDto {
  return {
    user: toUserDto(user),
    sweepstakeId: poolGuess.sweepstakeId,
    subGuesses: poolGuess.subGuesses.map((sub): PoolGuessItemDto => {
      switch (sub.kind) {
        case "group": {
          const championship = poolSweepstake.getGroupListSweepstakeById(
            sub.groupGuess.sweepstakeId,
          )?.sweepstake.championship;
          if (!championship) {
            throw new Error("Missing championship context for group guess");
          }
          return {
            kind: "group",
            groupGuess: toGroupListGuessDto(sub.groupGuess, championship),
          };
        }
        case "cup":
          return {
            kind: "cup",
            cupGuess: toCupGuessDto(sub.cupGuess),
          };
      }
    }),
  };
}
