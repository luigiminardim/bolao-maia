import { CupChampionship, GroupListChampionship } from "./Championship";
import { Team } from "./Team";

export interface GroupListScorePolicy {
  getId(): string;
  groupListTeamScore(
    team: Team,
    championship: GroupListChampionship,
    positionGuess: number | null,
    extraQualifiedListGuess: Team[],
  ): number;
}

export interface CupScorePolicy {
  getId(): string;
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

  getId(): string {
    return InverseProbabilityPositionScorePolicy.idPrefix;
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

  getId(): string {
    return InverseProbabilityQualifiedPositionGroupListScorePolicy.idPrefix;
  }

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
  readonly scorePolicy: GroupListScorePolicy;

  constructor(scorePolicy: GroupListScorePolicy) {
    this.scorePolicy = scorePolicy;
  }

  getId(): string {
    return `log2(${this.scorePolicy.getId()})`;
  }

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
  readonly scorePolicy: CupScorePolicy;

  constructor(scorePolicy: CupScorePolicy) {
    this.scorePolicy = scorePolicy;
  }

  getId(): string {
    return `log2(${this.scorePolicy.getId()})`;
  }

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

export class ScorePolicyBuilder {
  static buildGroupListScorePolicyFromId(id: string): GroupListScorePolicy {
    const trimmedId = id.trim();
    if (trimmedId === InverseProbabilityPositionScorePolicy.idPrefix) {
      return new InverseProbabilityPositionScorePolicy();
    }
    if (
      trimmedId ===
      InverseProbabilityQualifiedPositionGroupListScorePolicy.idPrefix
    ) {
      return new InverseProbabilityQualifiedPositionGroupListScorePolicy();
    }
    const log2Match = trimmedId.match(/^log2\((.*?)\)?$/);
    if (log2Match) {
      return new WithLogarithm2GroupScorePolicy(
        this.buildGroupListScorePolicyFromId(log2Match[1]),
      );
    }
    throw new Error(`Unknown GroupListScorePolicy ID: ${id}`);
  }

  static buildCupScorePolicyFromId(id: string): CupScorePolicy {
    const trimmedId = id.trim();
    if (trimmedId === InverseProbabilityPositionScorePolicy.idPrefix) {
      return new InverseProbabilityPositionScorePolicy();
    }
    const log2Match = trimmedId.match(/^log2\((.*?)\)?$/);
    if (log2Match) {
      return new WithLogarithm2CupScorePolicy(
        this.buildCupScorePolicyFromId(log2Match[1]),
      );
    }
    throw new Error(`Unknown CupScorePolicy ID: ${id}`);
  }
}
