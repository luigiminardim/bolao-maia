import { BinaryTree } from "../utils/BinaryTree";
import { GroupListChampionship } from "./Championship";
import {
  CupSweepstake,
  GroupListSweepstake,
  PoolSweepstake,
} from "./Sweepstake";
import { Team } from "./Team";

export class CupGuess {
  userId: string;
  sweepstakeId: CupSweepstake["id"];
  root: BinaryTree<Team>;
  thirdPlace: null | Team;

  constructor(
    userId: string,
    sweepstakeId: CupSweepstake["id"],
    root: BinaryTree<Team>,
    thirdPlace: null | Team,
  ) {
    this.userId = userId;
    this.sweepstakeId = sweepstakeId;
    this.root = root;
    this.thirdPlace = thirdPlace;
  }

  teamPosition(team: Team): number | null {
    if (this.thirdPlace !== null && team.id === this.thirdPlace.id) {
      return 3;
    }
    const height = this.root.findHeight((t) => t.id === team.id);
    if (height === null) return null;
    return Math.pow(2, height);
  }
}

export class GroupGuess {
  classification: Team[];

  constructor(classification: Team[]) {
    this.classification = classification;
  }

  teamPosition(team: Team): number | null {
    const position = this.classification.findIndex((x) => x.id === team.id);
    return position === -1 ? null : position + 1;
  }
}

export class GroupListGuess {
  userId: string;
  sweepstakeId: GroupListSweepstake["id"];
  groupGuesses: GroupGuess[];
  extraQualifiedListGuess: Team[];

  constructor(
    userId: string,
    sweepstakeId: GroupListSweepstake["id"],
    groupGuesses: GroupGuess[],
    extraQualifiedListGuess: Team[],
  ) {
    this.userId = userId;
    this.sweepstakeId = sweepstakeId;
    this.groupGuesses = groupGuesses;
    this.extraQualifiedListGuess = extraQualifiedListGuess;
  }
}

export type PoolGuessItem =
  | { kind: "group"; groupGuess: GroupListGuess }
  | { kind: "cup"; cupGuess: CupGuess };

export class PoolGuess {
  userId: string;
  sweepstakeId: PoolSweepstake["id"];
  subGuesses: PoolGuessItem[];

  constructor(
    userId: string,
    sweepstakeId: PoolSweepstake["id"],
    subGuesses: PoolGuessItem[],
  ) {
    this.userId = userId;
    this.sweepstakeId = sweepstakeId;
    this.subGuesses = subGuesses;
  }

  getGroupListGuess(groupGuessId: string): GroupListGuess | null {
    return (
      this.subGuesses
        .flatMap((sub) => (sub.kind === "group" ? [sub.groupGuess] : []))
        .find((sub) => sub.sweepstakeId === groupGuessId) ?? null
    );
  }

  getCupGuess(cupGuessId: string): CupGuess | null {
    return (
      this.subGuesses
        .flatMap((sub) => (sub.kind === "cup" ? [sub.cupGuess] : []))
        .find((sub) => sub.sweepstakeId === cupGuessId) ?? null
    );
  }

  addGroupListGuess(groupGuess: GroupListGuess): void {
    if (this.getGroupListGuess(groupGuess.sweepstakeId)) {
      throw new Error(
        `Guess for group list sweepstake ${groupGuess.sweepstakeId} already exists and cannot be overwritten.`,
      );
    }
    this.subGuesses.push({ kind: "group", groupGuess });
  }

  addCupGuess(cupGuess: CupGuess): void {
    if (this.getCupGuess(cupGuess.sweepstakeId)) {
      throw new Error(
        `Guess for cup sweepstake ${cupGuess.sweepstakeId} already exists and cannot be overwritten.`,
      );
    }
    this.subGuesses.push({ kind: "cup", cupGuess });
  }
}

export function getIsTeamClassified(
  groupListGuess: GroupListGuess,
  championship: GroupListChampionship,
  team: Team,
): boolean {
  const isExtraQualified = groupListGuess.extraQualifiedListGuess.some(
    (et) => et.id === team.id,
  );
  if (isExtraQualified) return true;

  for (const group of groupListGuess.groupGuesses) {
    const position = group.teamPosition(team);
    if (position !== null) {
      return position <= championship.maxRegularQualifiedPosition;
    }
  }

  return false;
}
