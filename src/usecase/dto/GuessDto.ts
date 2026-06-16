import { GroupListChampionship } from "../../entity/Championship";
import { GroupListGuess } from "../../entity/Guess";
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
