import { CupChampionship, GroupListChampionship } from "./Championship";
import { ScorePolicy } from "./ScorePolicy";

export class GroupListSweepstake {
  id: string;
  name: string;
  description: string;
  championship: GroupListChampionship;
  scorePolicy: ScorePolicy;

  constructor(
    id: string,
    name: string,
    description: string,
    championship: GroupListChampionship,
    scorePolicy: ScorePolicy,
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
  scorePolicy: ScorePolicy;

  constructor(
    id: string,
    name: string,
    description: string,
    championship: CupChampionship,
    scorePolicy: ScorePolicy,
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

  getGroupListSweepstakeById(
    id: string,
  ): { sweepstake: GroupListSweepstake; factor: number } | null {
    return (
      this.subSweepstakeList
        .flatMap((sub) =>
          sub.kind === "group"
            ? [{ sweepstake: sub.sweepstake, factor: sub.factor }]
            : [],
        )
        .find((sub) => sub.sweepstake.id === id) ?? null
    );
  }

  getCupSweepstakeById(
    id: string,
  ): { sweepstake: CupSweepstake; factor: number } | null {
    return (
      this.subSweepstakeList
        .flatMap((sub) =>
          sub.kind === "cup"
            ? [{ sweepstake: sub.sweepstake, factor: sub.factor }]
            : [],
        )
        .find((sub) => sub.sweepstake.id === id) ?? null
    );
  }
}
