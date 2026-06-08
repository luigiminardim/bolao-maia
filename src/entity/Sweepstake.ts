import { CupChampionship, GroupListChampionship } from "./Championship";
import { CupScorePolicy, GroupListScorePolicy } from "./ScorePolicy";

export class GroupListSweepstake {
  id: string;
  championship: GroupListChampionship;
  scorePolicy: GroupListScorePolicy;

  constructor(
    id: string,
    championship: GroupListChampionship,
    scorePolicy: GroupListScorePolicy,
  ) {
    this.id = id;
    this.championship = championship;
    this.scorePolicy = scorePolicy;
  }

  getStatus(): "draft" | "open" | "locked" {
    const champStatus = this.championship.getStatus();
    if (champStatus === "draft") return "draft";
    if (champStatus === "waiting") return "open";
    return "locked";
  }
}

export class CupSweepstake {
  id: string;
  championship: CupChampionship;
  scorePolicy: CupScorePolicy;

  constructor(
    id: string,
    championship: CupChampionship,
    scorePolicy: CupScorePolicy,
  ) {
    this.id = id;
    this.championship = championship;
    this.scorePolicy = scorePolicy;
  }

  getStatus(): "draft" | "open" | "locked" {
    const champStatus = this.championship.getStatus();
    if (champStatus === "draft") return "draft";
    if (champStatus === "waiting") return "open";
    return "locked";
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
