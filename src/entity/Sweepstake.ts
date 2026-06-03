import { CupChampionship, GroupListChampionship } from "./Championship";
import { CupScorePolicy, GroupListScorePolicy } from "./ScorePolicy";

export class GroupListSweepstake {
  id: string;
  championship: GroupListChampionship;
  scorePolicy: GroupListScorePolicy;
  startDate: Date;
  endDate: Date;

  constructor(
    id: string,
    championship: GroupListChampionship,
    scorePolicy: GroupListScorePolicy,
    startDate: Date,
    endDate: Date,
  ) {
    this.id = id;
    this.championship = championship;
    this.scorePolicy = scorePolicy;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

export class CupSweepstake {
  id: string;
  championship: CupChampionship;
  scorePolicy: CupScorePolicy;
  startDate: Date;
  endDate: Date;

  constructor(
    id: string,
    championship: CupChampionship,
    scorePolicy: CupScorePolicy,
    startDate: Date,
    endDate: Date,
  ) {
    this.id = id;
    this.championship = championship;
    this.scorePolicy = scorePolicy;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

export type SweepstakeItem =
  | { kind: "group"; sweepstake: GroupListSweepstake; factor: number }
  | { kind: "cup"; sweepstake: CupSweepstake; factor: number };

export class PoolSweepstake {
  id: string;
  subSweepstakes: SweepstakeItem[];

  constructor(id: string, subSweepstakes: SweepstakeItem[]) {
    this.id = id;
    this.subSweepstakes = subSweepstakes;
  }
}
