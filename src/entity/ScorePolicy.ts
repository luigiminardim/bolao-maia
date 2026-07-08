export interface GroupListTeamScoreParam {
  teamPosition: number;
  guessPosition: number;
  teamQualified: boolean;
  guessQualified: boolean;
  groupNumTeams: number;
  groupNumQualified: number;
  championshipNumQualified: number;
  championshipNumTeams: number;
}

export interface CupTeamScoreParam {
  teamPosition: number;
  guessPosition: number;
  championshipNumTeams: number;
}

export interface ScorePolicy {
  getId(): string;
  groupListTeamScore(params: GroupListTeamScoreParam): number;
  cupTeamScore(params: CupTeamScoreParam): number;
}

export class ConstScorePolicy implements ScorePolicy {
  static readonly idPrefix: string = "const";
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  getId(): string {
    return `const(${this.value})`;
  }

  groupListTeamScore(_params: GroupListTeamScoreParam): number {
    return this.value;
  }

  cupTeamScore(_params: CupTeamScoreParam): number {
    return this.value;
  }
}

export class PositionInverseProbabilityScorePolicy implements ScorePolicy {
  static readonly idPrefix: string = "position-inverse-probability";

  MIN_SCORE = 1;

  private score(
    position: number,
    positionGuess: number,
    numTeams: number,
  ): number {
    const worstPosition = Math.max(position, positionGuess);
    return numTeams / worstPosition;
  }

  getId(): string {
    return PositionInverseProbabilityScorePolicy.idPrefix;
  }

  groupListTeamScore(params: GroupListTeamScoreParam): number {
    return this.score(
      params.teamPosition,
      params.guessPosition,
      params.groupNumTeams,
    );
  }

  cupTeamScore(params: CupTeamScoreParam): number {
    return this.score(
      params.teamPosition,
      params.guessPosition,
      params.championshipNumTeams,
    );
  }
}

export class QualifiedInverseProbabilityScorePolicy implements ScorePolicy {
  static readonly idPrefix: string = "qualified-inverse-probability";

  getId(): string {
    return QualifiedInverseProbabilityScorePolicy.idPrefix;
  }

  groupListTeamScore(params: GroupListTeamScoreParam): number {
    if (!params.guessQualified || !params.teamQualified) {
      return 1;
    }
    return params.championshipNumTeams / params.championshipNumQualified;
  }

  cupTeamScore(_params: CupTeamScoreParam): number {
    return 1;
  }
}

export class MaxScorePolicy implements ScorePolicy {
  static readonly idPrefix: string = "max";
  readonly param0: ScorePolicy;
  readonly param1: ScorePolicy;

  constructor(param0: ScorePolicy, param1: ScorePolicy) {
    this.param0 = param0;
    this.param1 = param1;
  }

  getId(): string {
    return `${MaxScorePolicy.idPrefix}(${this.param0.getId()}, ${this.param1.getId()})`;
  }

  groupListTeamScore(params: GroupListTeamScoreParam): number {
    return Math.max(
      this.param0.groupListTeamScore(params),
      this.param1.groupListTeamScore(params),
    );
  }

  cupTeamScore(params: CupTeamScoreParam): number {
    return Math.max(
      this.param0.cupTeamScore(params),
      this.param1.cupTeamScore(params),
    );
  }
}

export class FilterQualifiedScorePolicy implements ScorePolicy {
  static readonly idPrefix: string = "filter-qualified";
  readonly subPolicy: ScorePolicy;

  constructor(subPolicy: ScorePolicy) {
    this.subPolicy = subPolicy;
  }

  getId(): string {
    return `${FilterQualifiedScorePolicy.idPrefix}(${this.subPolicy.getId()})`;
  }

  groupListTeamScore(params: GroupListTeamScoreParam): number {
    if (!params.guessQualified || !params.teamQualified) {
      return 0;
    }
    return this.subPolicy.groupListTeamScore(params);
  }

  cupTeamScore(params: CupTeamScoreParam): number {
    return this.subPolicy.cupTeamScore(params);
  }
}

export class WithLogarithm2ScorePolicy implements ScorePolicy {
  static readonly idPrefix: string = "log2";
  readonly scorePolicy: ScorePolicy;

  constructor(scorePolicy: ScorePolicy) {
    this.scorePolicy = scorePolicy;
  }

  getId(): string {
    return `log2(${this.scorePolicy.getId()})`;
  }

  groupListTeamScore(params: GroupListTeamScoreParam): number {
    return Math.log2(this.scorePolicy.groupListTeamScore(params));
  }

  cupTeamScore(params: CupTeamScoreParam): number {
    return Math.log2(this.scorePolicy.cupTeamScore(params));
  }
}

export class MultScorePolicy implements ScorePolicy {
  static readonly idPrefix: string = "mult";
  readonly multiplier: number;
  readonly scorePolicy: ScorePolicy;

  constructor(multiplier: number, scorePolicy: ScorePolicy) {
    this.multiplier = multiplier;
    this.scorePolicy = scorePolicy;
  }

  getId(): string {
    return `mult(${this.multiplier}, ${this.scorePolicy.getId()})`;
  }

  groupListTeamScore(params: GroupListTeamScoreParam): number {
    return this.multiplier * this.scorePolicy.groupListTeamScore(params);
  }

  cupTeamScore(params: CupTeamScoreParam): number {
    return this.multiplier * this.scorePolicy.cupTeamScore(params);
  }
}

export class FloorScorePolicy implements ScorePolicy {
  static readonly idPrefix: string = "floor";
  readonly scorePolicy: ScorePolicy;

  constructor(scorePolicy: ScorePolicy) {
    this.scorePolicy = scorePolicy;
  }

  getId(): string {
    return `floor(${this.scorePolicy.getId()})`;
  }

  groupListTeamScore(params: GroupListTeamScoreParam): number {
    return Math.floor(this.scorePolicy.groupListTeamScore(params));
  }

  cupTeamScore(params: CupTeamScoreParam): number {
    return Math.floor(this.scorePolicy.cupTeamScore(params));
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

  static build(id: string): ScorePolicy {
    const { prefix, params } = this.parseScorePolicyId(id);

    switch (prefix) {
      case ConstScorePolicy.idPrefix: {
        const param0 = params[0];
        if (param0 === undefined)
          throw new Error(`Invalid params for const: ${id}`);
        const val = Number(param0);
        if (isNaN(val)) throw new Error(`Invalid value for const: ${id}`);
        return new ConstScorePolicy(val);
      }
      case PositionInverseProbabilityScorePolicy.idPrefix:
        return new PositionInverseProbabilityScorePolicy();
      case QualifiedInverseProbabilityScorePolicy.idPrefix:
        return new QualifiedInverseProbabilityScorePolicy();
      case MaxScorePolicy.idPrefix: {
        const param0 = params[0];
        const param1 = params[1];
        if (param0 === undefined || param1 === undefined)
          throw new Error(`Invalid params for max: ${id}`);
        return new MaxScorePolicy(this.build(param0), this.build(param1));
      }
      case FilterQualifiedScorePolicy.idPrefix: {
        const param0 = params[0];
        if (param0 === undefined)
          throw new Error(`Invalid params for filter-qualified: ${id}`);
        return new FilterQualifiedScorePolicy(this.build(param0));
      }
      case WithLogarithm2ScorePolicy.idPrefix: {
        const param0 = params[0];
        if (param0 === undefined)
          throw new Error(`Invalid params for log2: ${id}`);
        return new WithLogarithm2ScorePolicy(this.build(param0));
      }
      case MultScorePolicy.idPrefix: {
        const param0 = params[0];
        const param1 = params[1];
        if (param0 === undefined || param1 === undefined)
          throw new Error(`Invalid params for mult: ${id}`);
        const multiplier = Number(param0);
        if (isNaN(multiplier))
          throw new Error(`Invalid multiplier for mult: ${id}`);
        return new MultScorePolicy(multiplier, this.build(param1));
      }
      case FloorScorePolicy.idPrefix: {
        const param0 = params[0];
        if (param0 === undefined)
          throw new Error(`Invalid params for floor: ${id}`);
        return new FloorScorePolicy(this.build(param0));
      }
      default:
        throw new Error(`Unknown ScorePolicy ID: ${id}`);
    }
  }
}
