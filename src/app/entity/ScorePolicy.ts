import {
  CupChampionship,
  GroupAndCupChampionship,
  LeagueChampionship,
} from "./Championship";
import { Team } from "./Team";

export interface LeagueScorePolicy {
  teamScoreFromLeague(
    league: LeagueChampionship,
    extraQualifiedTeams: (Team | null)[],
    team: Team,
    guessPosition: number,
    guessAsExtraQualified: boolean,
  ): number;
}

export class InverseProbabilityQualifiedPositionLeagueScorePolicy implements LeagueScorePolicy {
  static readonly id: string = "league:inverse-probability-qualified-position";

  private readonly totalQualifiedTeams: number;
  private readonly totalTeams: number;

  private constructor(totalQualifiedTeams: number, totalTeams: number) {
    this.totalQualifiedTeams = totalQualifiedTeams;
    this.totalTeams = totalTeams;
  }

  static fromGroupsAndLeagueChampionShip(
    championship: GroupAndCupChampionship,
  ): InverseProbabilityQualifiedPositionLeagueScorePolicy {
    const numExtraGroupsQualifiers = championship.extraQualifiedList.length;
    const totalQualifiedTeams = championship.groups.reduce(
      (acc, group) => acc + group.maxQualifiedPosition,
      numExtraGroupsQualifiers,
    );
    const totalTeams = championship.groups.reduce(
      (acc, group) => acc + group.numTeams(),
      0,
    );
    return new InverseProbabilityQualifiedPositionLeagueScorePolicy(
      totalQualifiedTeams,
      totalTeams,
    );
  }

  teamScoreFromLeague(
    league: LeagueChampionship,
    extraQualifiedTeams: Team[],
    team: Team,
    guessPosition: number,
    guessExtraQualified: boolean,
  ): number {
    const teamPosition = league.teamPosition(team);
    if (teamPosition === null) return 0;
    const isRegularQualified = teamPosition <= league.maxQualifiedPosition;
    const isExtraQualified = extraQualifiedTeams.some(
      (element) => element.id === team.id,
    );
    const isQualified = isRegularQualified || isExtraQualified;
    const guessRegularQualified = guessPosition <= league.maxQualifiedPosition;
    const guessQualified = guessRegularQualified || guessExtraQualified;
    if (!isQualified || !guessQualified) return 0;
    if (isExtraQualified || guessExtraQualified) {
      return this.totalTeams / this.totalQualifiedTeams;
    }
    if (guessPosition <= teamPosition) {
      return league.numTeams() / teamPosition;
    }
    if (teamPosition <= guessPosition) {
      return league.numTeams() / guessPosition;
    }
    return 0; // Should never happen
  }
}

export interface CupScorePolicy {
  teamScoreFromCup(
    cup: CupChampionship,
    team: Team,
    guessPosition: number,
  ): number;
}

export class InverseProbabilityPositionCupScorePolicy implements CupScorePolicy {
  static readonly id: string = "cup:inverse-probability-position";

  private numTeams: number;
  private constructor(numTeams: number) {
    this.numTeams = numTeams;
  }

  static fromCupAndCupChampionship(
    championship: GroupAndCupChampionship,
  ): InverseProbabilityPositionCupScorePolicy {
    const numTeams = championship.cup.numTeams();
    return new InverseProbabilityPositionCupScorePolicy(numTeams);
  }

  teamScoreFromCup(
    cup: CupChampionship,
    team: Team,
    guessPosition: number,
  ): number {
    const teamPosition = cup.teamPosition(team);
    if (teamPosition === null) return 0;
    if (guessPosition <= teamPosition) {
      return this.numTeams / teamPosition;
    }
    if (teamPosition <= guessPosition) {
      return this.numTeams / guessPosition;
    }
    return 0; // Should never happen
  }
}
