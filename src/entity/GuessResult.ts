import { BinaryTree } from "../utils/BinaryTree";
import { CupGuess, GroupGuess, GroupListGuess, PoolGuess } from "./Guess";
import {
  CupSweepstake,
  GroupListSweepstake,
  PoolSweepstake,
} from "./Sweepstake";
import { Team } from "./Team";
import { User } from "./User";

type CupGuessNodeInfo = {
  team: null | Team;
  positionGuess: null | number;
  score: null | number;
};

export class CupGuessResult {
  score: number;
  root: BinaryTree<CupGuessNodeInfo>;
  thirdPlace: null | CupGuessNodeInfo;

  constructor(
    root: BinaryTree<CupGuessNodeInfo>,
    thirdPlace: null | CupGuessNodeInfo,
  ) {
    this.root = root;
    this.thirdPlace = thirdPlace;
    const rootScore = root.reduce((acc, node) => acc + (node.score ?? 0), 0);
    this.score = rootScore + (thirdPlace?.score ?? 0);
  }

  static fromCupSweepstake(
    sweepstake: CupSweepstake,
    guess: CupGuess,
  ): CupGuessResult {
    const cup = sweepstake.championship;
    const scorePolicy = sweepstake.scorePolicy;
    let thirdPlace: null | CupGuessNodeInfo = null;
    const scanContext: { seen: Team[] } = { seen: [] };
    if (cup.hasThirdPlaceMatch) {
      if (cup.thirdPlace) {
        const team = cup.thirdPlace;
        const guessPosition = guess.teamPosition(team) ?? (-1 as never);
        const score = scorePolicy.cupTeamScore(team, cup, guessPosition);
        thirdPlace = {
          team,
          positionGuess: guessPosition,
          score,
        };
        scanContext.seen.push(team);
      } else {
        thirdPlace = {
          team: null,
          positionGuess: null,
          score: null,
        };
      }
    }
    const nextContext = (team: null | Team, context: { seen: Team[] }) => {
      if (team !== null) {
        context.seen.push(team);
      }
      return context;
    };
    const root = cup.root.scanmap(
      (team, context) => {
        if (team === null) {
          return { team: null, positionGuess: null, score: null };
        }
        const guessPosition = guess.teamPosition(team) ?? (-1 as never);
        if (context.seen.includes(team)) {
          return { team, positionGuess: guessPosition, score: null };
        }
        const score = scorePolicy.cupTeamScore(team, cup, guessPosition);
        return { team, positionGuess: guessPosition, score };
      },
      scanContext,
      nextContext,
    );

    return new CupGuessResult(root, thirdPlace);
  }
}

type GroupGuessNodeInfo = {
  team: null | Team;
  positionGuess: null | number;
  extraQualifiedGuess: boolean;
  score: null | number;
};

export class GroupGuessResult {
  score: number;
  classification: GroupGuessNodeInfo[];

  constructor(classification: GroupGuessNodeInfo[]) {
    this.classification = classification;
    this.score = classification.reduce(
      (acc, node) => acc + (node.score ?? 0),
      0,
    );
  }

  static fromGroupListSweepstake(
    sweepstake: GroupListSweepstake,
    groupId: string,
    groupGuess: GroupGuess,
    extraQualifiedListGuess: Team[],
  ): GroupGuessResult {
    const { championship, scorePolicy } = sweepstake;
    const group = championship.getGroup(groupId);
    if (!group) return new GroupGuessResult([]) as never;
    const classificationInfo: GroupGuessNodeInfo[] = group.classification.map(
      (team) => {
        const guessPosition = groupGuess.teamPosition(team);
        const extraQualifiedGuess = !!extraQualifiedListGuess.find(
          (t) => t.id === team.id,
        );
        const score = scorePolicy.groupListTeamScore(
          team,
          championship,
          guessPosition,
          extraQualifiedListGuess,
        );
        return {
          team,
          positionGuess: guessPosition,
          extraQualifiedGuess,
          score,
        };
      },
    );
    return new GroupGuessResult(classificationInfo);
  }
}

export class GroupListGuessResult {
  score: number;
  groupResultList: GroupGuessResult[];

  constructor(groupResultList: GroupGuessResult[]) {
    this.groupResultList = groupResultList;
    this.score = groupResultList.reduce((acc, result) => acc + result.score, 0);
  }

  static fromGroupListSweepstake(
    sweepstake: GroupListSweepstake,
    guess: GroupListGuess,
  ): GroupListGuessResult {
    const groupResultList = sweepstake.championship
      .getGroups()
      .map((group, idx) =>
        GroupGuessResult.fromGroupListSweepstake(
          sweepstake,
          group.id,
          guess.groupGuesses[idx],
          guess.extraQualifiedListGuess,
        ),
      );
    return new GroupListGuessResult(groupResultList);
  }
}

export type PoolItemResult =
  | { kind: "group"; groupResult: GroupListGuessResult; factor: number }
  | { kind: "cup"; cupResult: CupGuessResult; factor: number };

export class PoolGuessResult {
  user: User;
  score: number;
  subResultList: PoolItemResult[];

  constructor(user: User, subResultList: PoolItemResult[]) {
    this.user = user;
    this.subResultList = subResultList;
    this.score = subResultList.reduce((acc, result) => {
      if (result.kind === "group") {
        return acc + result.groupResult.score * result.factor;
      } else {
        return acc + result.cupResult.score * result.factor;
      }
    }, 0);
  }

  static fromPoolSweepstake(
    sweepstake: PoolSweepstake,
    guess: PoolGuess,
    user: User,
  ): PoolGuessResult {
    const subResultList: PoolItemResult[] = sweepstake.subSweepstakeList.map(
      (item, idx) => {
        const subGuess = guess.subGuesses[idx];
        if (item.kind === "group" && subGuess.kind === "group") {
          return {
            kind: "group",
            groupResult: GroupListGuessResult.fromGroupListSweepstake(
              item.sweepstake,
              subGuess.groupGuess,
            ),
            factor: item.factor,
          };
        } else if (item.kind === "cup" && subGuess.kind === "cup") {
          return {
            kind: "cup",
            cupResult: CupGuessResult.fromCupSweepstake(
              item.sweepstake,
              subGuess.cupGuess,
            ),
            factor: item.factor,
          };
        }
        throw new Error("Mismatch between sweepstake kind and guess kind");
      },
    );
    return new PoolGuessResult(user, subResultList);
  }
}
