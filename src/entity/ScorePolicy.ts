import { CupChampionship, GroupListChampionship } from "./Championship";
import { Team } from "./Team";

export interface GroupListScorePolicy {
  getId(): string;
  groupListTeamScore(
    team: Team,
    championship: GroupListChampionship,
    positionGuess: number,
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
    positionGuess: number,
    _extraQualifiedListGuess: Team[],
  ): number {
    const position = championship.teamPosition(team);
    const group = championship.getTeamGroup(team);
    if (position === null || group === null) {
      return this.MIN_SCORE;
    }
    return this.score(position, positionGuess, group.numTeams());
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
    positionGuess: number,
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

export class ScaledScorePolicy implements GroupListScorePolicy, CupScorePolicy {
  static readonly idPrefix: string = "scaled";
  readonly scale: number;
  readonly scorePolicy: GroupListScorePolicy | CupScorePolicy;

  constructor(
    scale: number,
    scorePolicy: GroupListScorePolicy | CupScorePolicy,
  ) {
    this.scale = scale;
    this.scorePolicy = scorePolicy;
  }

  getId(): string {
    return `scaled(${this.scale}, ${this.scorePolicy.getId()})`;
  }

  groupListTeamScore(
    team: Team,
    championship: GroupListChampionship,
    positionGuess: number,
    extraQualifiedListGuess: Team[],
  ): number {
    if (!("groupListTeamScore" in this.scorePolicy)) {
      throw new Error("Wrapped policy does not implement GroupListScorePolicy");
    }
    const score = this.scorePolicy.groupListTeamScore(
      team,
      championship,
      positionGuess,
      extraQualifiedListGuess,
    );
    return Math.floor(score * this.scale);
  }

  cupTeamScore(
    team: Team,
    championship: CupChampionship,
    positionGuess: number,
  ): number {
    if (!("cupTeamScore" in this.scorePolicy)) {
      throw new Error("Wrapped policy does not implement CupScorePolicy");
    }
    const score = this.scorePolicy.cupTeamScore(
      team,
      championship,
      positionGuess,
    );
    return Math.floor(score * this.scale);
  }
}

export class ScorePolicyBuilder {
  private static parseScorePolicyId(id: string): {
    prefix: string;
    params: string[];
  } {
    const match = id.trim().match(/^([a-zA-Z0-9-]+)(?:\((.*)\))?$/);
    if (!match) throw new Error(`Invalid ScorePolicy ID format: ${id}`);
    const prefix = match[1];
    if (prefix === undefined)
      throw new Error(`Invalid ScorePolicy ID format: ${id}`);
    const paramsStr = match[2];

    if (!paramsStr) {
      return { prefix, params: [] };
    }

    const params: string[] = [];
    let currentParam = "";
    let depth = 0;
    for (let i = 0; i < paramsStr.length; i++) {
      const char = paramsStr[i];
      if (char === "(") depth++;
      if (char === ")") depth--;

      if (char === "," && depth === 0) {
        params.push(currentParam.trim());
        currentParam = "";
      } else {
        currentParam += char;
      }
    }
    params.push(currentParam.trim());
    return { prefix, params };
  }

  static buildGroupListScorePolicyFromId(id: string): GroupListScorePolicy {
    const { prefix, params } = this.parseScorePolicyId(id);

    switch (prefix) {
      case InverseProbabilityPositionScorePolicy.idPrefix:
        return new InverseProbabilityPositionScorePolicy();
      case InverseProbabilityQualifiedPositionGroupListScorePolicy.idPrefix:
        return new InverseProbabilityQualifiedPositionGroupListScorePolicy();
      case WithLogarithm2GroupScorePolicy.idPrefix: {
        const param0 = params[0];
        if (param0 === undefined)
          throw new Error(`Invalid params for log2: ${id}`);
        return new WithLogarithm2GroupScorePolicy(
          this.buildGroupListScorePolicyFromId(param0),
        );
      }
      case ScaledScorePolicy.idPrefix: {
        const param0 = params[0];
        const param1 = params[1];
        if (param0 === undefined || param1 === undefined)
          throw new Error(`Invalid params for scaled: ${id}`);
        const scale = Number(param0);
        if (isNaN(scale)) throw new Error(`Invalid scale for scaled: ${id}`);
        return new ScaledScorePolicy(
          scale,
          this.buildGroupListScorePolicyFromId(param1),
        );
      }
      default:
        throw new Error(`Unknown GroupListScorePolicy ID: ${id}`);
    }
  }

  static buildCupScorePolicyFromId(id: string): CupScorePolicy {
    const { prefix, params } = this.parseScorePolicyId(id);

    switch (prefix) {
      case InverseProbabilityPositionScorePolicy.idPrefix:
        return new InverseProbabilityPositionScorePolicy();
      case WithLogarithm2CupScorePolicy.idPrefix: {
        const param0 = params[0];
        if (param0 === undefined)
          throw new Error(`Invalid params for log2: ${id}`);
        return new WithLogarithm2CupScorePolicy(
          this.buildCupScorePolicyFromId(param0),
        );
      }
      case ScaledScorePolicy.idPrefix: {
        const param0 = params[0];
        const param1 = params[1];
        if (param0 === undefined || param1 === undefined)
          throw new Error(`Invalid params for scaled: ${id}`);
        const scale = Number(param0);
        if (isNaN(scale)) throw new Error(`Invalid scale for scaled: ${id}`);
        return new ScaledScorePolicy(
          scale,
          this.buildCupScorePolicyFromId(param1),
        );
      }
      default:
        throw new Error(`Unknown CupScorePolicy ID: ${id}`);
    }
  }
}
