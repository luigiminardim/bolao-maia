import { GroupListChampionship } from "../../entity/Championship";
import { CupGuess, GroupListGuess, PoolGuessItem } from "../../entity/Guess";
import { BinaryTree, BinaryTreeDao } from "../../utils/BinaryTree";
import { TeamDto, toTeamDto } from "./TeamDto";

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
          const isExtraQualified = groupListGuess.extraQualifiedListGuess.some(
            (et) => et.id === team.id,
          );
          const guessQualified =
            guessPosition <= championship.maxRegularQualifiedPosition ||
            isExtraQualified;

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

export function toPoolGuessItemDto(
  item: PoolGuessItem,
  championships: { groupList?: GroupListChampionship },
): PoolGuessItemDto {
  if (item.kind === "group" && championships.groupList) {
    return {
      kind: "group",
      groupGuess: toGroupListGuessDto(item.groupGuess, championships.groupList),
    };
  }
  if (item.kind === "cup") {
    return {
      kind: "cup",
      cupGuess: toCupGuessDto(item.cupGuess),
    };
  }
  throw new Error("Invalid guess item or missing championship context");
}
