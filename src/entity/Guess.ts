import { BinaryTree } from "../utils/BinaryTree";
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
}
