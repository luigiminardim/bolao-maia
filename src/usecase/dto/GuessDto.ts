import { GroupListGuess } from "../../entity/Guess";
import { TeamDto, toTeamDto } from "./TeamDto";

export interface GroupGuessDto {
  classification: TeamDto[];
}

export interface GroupListGuessDto {
  groupGuesses: GroupGuessDto[];
  extraQualifiedListGuess: TeamDto[];
}

export function toGroupListGuessDto(
  groupListGuess: GroupListGuess,
): GroupListGuessDto {
  return {
    groupGuesses: groupListGuess.groupGuesses.map((g) => ({
      classification: g.classification.map(toTeamDto),
    })),
    extraQualifiedListGuess:
      groupListGuess.extraQualifiedListGuess.map(toTeamDto),
  };
}
