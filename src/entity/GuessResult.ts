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

  constructor(sweepstake: CupSweepstake, guess: CupGuess) {
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

    this.root = cup.root.scanmap(
      (team, context) => {
        if (team === null) {
          return { team: null, positionGuess: null, score: null };
        }
        if (context.seen.includes(team)) {
          return { team, positionGuess: null, score: null };
        }
        const guessPosition = guess.teamPosition(team) ?? (-1 as never);
        const score = scorePolicy.cupTeamScore(team, cup, guessPosition);
        return { team, positionGuess: guessPosition, score };
      },
      scanContext,
      nextContext,
    );

    this.thirdPlace = thirdPlace;
    const rootScore = this.root.reduce(
      (acc, node) => acc + (node.score ?? 0),
      0,
    );
    this.score = rootScore + (this.thirdPlace?.score ?? 0);
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

  constructor(
    sweepstake: GroupListSweepstake,
    groupId: string,
    groupGuess: GroupGuess,
    extraQualifiedListGuess: Team[],
  ) {
    const { championship, scorePolicy } = sweepstake;
    const group = championship.getGroup(groupId);
    if (!group) {
      this.classification = [];
      this.score = 0;
      return;
    }

    this.classification = group.classification.map((team) => {
      if (team === null) {
        return {
          team: null,
          positionGuess: null,
          extraQualifiedGuess: false,
          score: null,
        };
      }
      const guessPosition = groupGuess.teamPosition(team) ?? (-1 as never);
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
    });

    this.score = this.classification.reduce(
      (acc, node) => acc + (node.score ?? 0),
      0,
    );
  }
}

export class GroupListGuessResult {
  score: number;
  groups: GroupGuessResult[];

  constructor(sweepstake: GroupListSweepstake, guess: GroupListGuess) {
    this.groups = sweepstake.championship.getGroups().map((group, idx) => {
      const groupGuess = guess.groupGuesses[idx];
      if (!groupGuess) throw new Error(`Missing group guess at index ${idx}`);
      return new GroupGuessResult(
        sweepstake,
        group.getId(),
        groupGuess,
        guess.extraQualifiedListGuess,
      );
    });
    this.score = this.groups.reduce((acc, result) => acc + result.score, 0);
  }
}

export type PoolItemResult =
  | { kind: "group"; groupResult: GroupListGuessResult; factor: number }
  | { kind: "cup"; cupResult: CupGuessResult; factor: number };

export class PoolGuessResult {
  user: User;
  score: number;
  subResultList: PoolItemResult[];

  constructor(sweepstake: PoolSweepstake, guess: PoolGuess, user: User) {
    this.user = user;
    this.subResultList = sweepstake.subSweepstakeList.flatMap(
      (item): PoolItemResult[] => {
        const subGuess = guess.subGuesses.find(
          (g) =>
            (item.kind === "group" &&
              g.kind === "group" &&
              g.groupGuess.sweepstakeId === item.sweepstake.id) ||
            (item.kind === "cup" &&
              g.kind === "cup" &&
              g.cupGuess.sweepstakeId === item.sweepstake.id),
        );

        if (!subGuess) return [];

        if (item.kind === "group" && subGuess.kind === "group") {
          return [
            {
              kind: "group",
              groupResult: new GroupListGuessResult(
                item.sweepstake,
                subGuess.groupGuess,
              ),
              factor: item.factor,
            },
          ];
        } else if (item.kind === "cup" && subGuess.kind === "cup") {
          return [
            {
              kind: "cup",
              cupResult: new CupGuessResult(item.sweepstake, subGuess.cupGuess),
              factor: item.factor,
            },
          ];
        }
        return [];
      },
    );

    this.score = this.subResultList.reduce((acc, result) => {
      if (result.kind === "group") {
        return acc + result.groupResult.score * result.factor;
      } else {
        return acc + result.cupResult.score * result.factor;
      }
    }, 0);
  }
}
