import { CupChampionship, GroupListChampionship } from "./Championship";
import { CupScorePolicy, GroupListScorePolicy } from "./ScorePolicy";

export class GroupListSweepstake {
  id: string;
  name: string;
  description: string;
  championship: GroupListChampionship;
  scorePolicy: GroupListScorePolicy;

  constructor(
    id: string,
    name: string,
    description: string,
    championship: GroupListChampionship,
    scorePolicy: GroupListScorePolicy,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.championship = championship;
    this.scorePolicy = scorePolicy;
  }

  getStatus(): "draft" | "open" | "locked" {
    const champStatus = this.championship.getStatus();
    if (champStatus === "draft") return "draft";
    if (champStatus === "waiting") return "open";
    return "locked";
  }

  getSubtitle(): string {
    return this.championship.getName();
  }
}

export class CupSweepstake {
  id: string;
  name: string;
  description: string;
  championship: CupChampionship;
  scorePolicy: CupScorePolicy;

  constructor(
    id: string,
    name: string,
    description: string,
    championship: CupChampionship,
    scorePolicy: CupScorePolicy,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.championship = championship;
    this.scorePolicy = scorePolicy;
  }

  getStatus(): "draft" | "open" | "locked" {
    const champStatus = this.championship.getStatus();
    if (champStatus === "draft") return "draft";
    if (champStatus === "waiting") return "open";
    return "locked";
  }

  getSubtitle(): string {
    return this.championship.getName();
  }
}

export type SweepstakeItem =
  | { kind: "group"; sweepstake: GroupListSweepstake; factor: number }
  | { kind: "cup"; sweepstake: CupSweepstake; factor: number };

export class PoolSweepstake {
  id: string;
  name: string;
  private subtitle: string;
  description: string;
  subSweepstakeList: SweepstakeItem[];

  constructor(
    id: string,
    name: string,
    subtitle: string,
    description: string,
    subSweepstakeList: SweepstakeItem[],
  ) {
    this.id = id;
    this.name = name;
    this.subtitle = subtitle;
    this.description = description;
    this.subSweepstakeList = subSweepstakeList;
  }

  getSubtitle(): string {
    return this.subtitle;
  }

  getGroupListSweepstakeById(id: string): GroupListSweepstake | null {
    return (
      this.subSweepstakeList
        .flatMap((sub) => (sub.kind === "group" ? [sub.sweepstake] : []))
        .find((sub) => sub.id === id) ?? null
    );
  }

  getCupSweepstakeById(id: string): CupSweepstake | null {
    return (
      this.subSweepstakeList
        .flatMap((sub) => (sub.kind === "cup" ? [sub.sweepstake] : []))
        .find((sub) => sub.id === id) ?? null
    );
  }
}
