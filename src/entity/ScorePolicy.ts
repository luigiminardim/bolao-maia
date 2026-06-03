import { CupChampionship, GroupListChampionship } from "./Championship";
import { Team } from "./Team";

export interface GroupListScorePolicy {
  groupListTeamScore(
    team: Team,
    championship: GroupListChampionship,
    positionGuess: number | null,
    extraQualifiedListGuess: Team[],
  ): number;
}

export interface CupScorePolicy {
  cupTeamScore(
    team: Team,
    championship: CupChampionship,
    positionGuess: number,
  ): number;
}

export class InverseProbabilityPositionScorePolicy
  implements GroupListScorePolicy, CupScorePolicy
{
  static readonly idPrefix: string = "inverse-probability-position";

  /**
   * The inverse probability is at least 1.
   */
  MIN_SCORE = 1;

  private score(
    position: number,
    positionGuess: number,
    numTeams: number,
  ): number {
    const worstPostion = Math.max(position, positionGuess);
    return numTeams / worstPostion;
  }

  groupListTeamScore(
    team: Team,
    championship: GroupListChampionship,
    positionGuess: number | null,
    _extraQualifiedListGuess: Team[],
  ): number {
    const position = championship.teamPosition(team);
    if (position === null || positionGuess === null) {
      return 0;
    }
    return this.score(position, positionGuess, championship.numTeams());
  }

  cupTeamScore(
    team: Team,
    championship: CupChampionship,
    positionGuess: number,
  ): number {
    const position = championship.teamPosition(team);
    if (position === null) {
      return 0;
    }
    return this.score(position, positionGuess, championship.numTeams());
  }
}

export class InverseProbabilityQualifiedPositionGroupListScorePolicy implements GroupListScorePolicy {
  static readonly idPrefix: string = "inverse-probability-qualified-position";

  private inverseProbabilityScorePolicy: InverseProbabilityPositionScorePolicy =
    new InverseProbabilityPositionScorePolicy();

  groupListTeamScore(
    team: Team,
    championship: GroupListChampionship,
    positionGuess: number,
    extraQualifiedListGuess: Team[],
  ): number {
    const position = championship.teamPosition(team);
    if (position === null) return this.inverseProbabilityScorePolicy.MIN_SCORE;
    const guessQualified =
      championship.positionIsRegularQualified(positionGuess) ||
      extraQualifiedListGuess.find((x) => x.id === team.id) !== undefined;
    if (!guessQualified || !championship.teamIsQualified(team))
      return this.inverseProbabilityScorePolicy.MIN_SCORE;
    const worstPosition = Math.max(position, positionGuess);
    const useRegularQualifiedScore =
      championship.positionIsRegularQualified(worstPosition);
    if (useRegularQualifiedScore) {
      return this.inverseProbabilityScorePolicy.groupListTeamScore(
        team,
        championship,
        positionGuess,
        extraQualifiedListGuess,
      );
    } else {
      return championship.numTeams() / championship.numQualifiedTeams();
    }
  }
}

export class WithLogarithm2GroupScorePolicy implements GroupListScorePolicy {
  static readonly idPrefix: string = "log2";

  constructor(private scorePolicy: GroupListScorePolicy) {}

  groupListTeamScore(
    team: Team,
    championship: GroupListChampionship,
    positionGuess: number | null,
    extraQualifiedListGuess: Team[],
  ): number {
    const score = this.scorePolicy.groupListTeamScore(
      team,
      championship,
      positionGuess,
      extraQualifiedListGuess,
    );
    return Math.log2(score);
  }
}

export class WithLogarithm2CupScorePolicy implements CupScorePolicy {
  static readonly idPrefix: string = "log2";

  constructor(private scorePolicy: CupScorePolicy) {}

  cupTeamScore(
    team: Team,
    championship: CupChampionship,
    positionGuess: number,
  ): number {
    const score = this.scorePolicy.cupTeamScore(
      team,
      championship,
      positionGuess,
    );
    return Math.log2(score);
  }
}
