import { CupChampionship, GroupListChampionship } from "./Championship";
import { CupScorePolicy, GroupListScorePolicy } from "./ScorePolicy";

export class GroupListSweepstake {
  id: string;
  championship: GroupListChampionship;
  scorePolicy: GroupListScorePolicy;
  startTime: Date;

  constructor(
    id: string,
    championship: GroupListChampionship,
    scorePolicy: GroupListScorePolicy,
    startDate: Date,
  ) {
    this.id = id;
    this.championship = championship;
    this.scorePolicy = scorePolicy;
    this.startTime = startDate;
  }
}

export class CupSweepstake {
  id: string;
  championship: CupChampionship;
  scorePolicy: CupScorePolicy;
  startTime: Date;

  constructor(
    id: string,
    championship: CupChampionship,
    scorePolicy: CupScorePolicy,
    startDate: Date,
  ) {
    this.id = id;
    this.championship = championship;
    this.scorePolicy = scorePolicy;
    this.startTime = startDate;
  }
}

export type SweepstakeItem =
  | { kind: "group"; sweepstake: GroupListSweepstake; factor: number }
  | { kind: "cup"; sweepstake: CupSweepstake; factor: number };

export class PoolSweepstake {
  id: string;
  subSweepstakeList: SweepstakeItem[];

  constructor(id: string, subSweepstakeList: SweepstakeItem[]) {
    this.id = id;
    this.subSweepstakeList = subSweepstakeList;
  }
}
