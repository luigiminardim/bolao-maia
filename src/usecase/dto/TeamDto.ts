import { Team } from "../../entity/Team";

export interface TeamDto {
  id: string;
  name: string;
}

export function toTeamDto(team: Team): TeamDto {
  return {
    id: team.id,
    name: team.name,
  };
}
