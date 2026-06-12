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
  score: number | null;
  root: BinaryTree<CupGuessNodeInfo>;
  thirdPlace: null | CupGuessNodeInfo;

  constructor(sweepstake: CupSweepstake, guess: CupGuess) {
    const cup = sweepstake.championship;
    const scorePolicy = sweepstake.scorePolicy;
    const isLocked = sweepstake.getStatus() === "locked";
    let thirdPlace: null | CupGuessNodeInfo = null;
    const scanContext: { seen: Team[] } = { seen: [] };

    if (cup.hasThirdPlaceMatch) {
      if (cup.thirdPlace) {
        const team = cup.thirdPlace;
        const guessPosition = guess.teamPosition(team) ?? (-1 as never);
        const score = isLocked
          ? scorePolicy.cupTeamScore(team, cup, guessPosition)
          : null;
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
        const score = isLocked
          ? scorePolicy.cupTeamScore(team, cup, guessPosition)
          : null;
        return { team, positionGuess: guessPosition, score };
      },
      scanContext,
      nextContext,
    );

    this.thirdPlace = thirdPlace;
    if (isLocked) {
      const rootScore = this.root.reduce(
        (acc, node) => acc + (node.score ?? 0),
        0,
      );
      this.score = rootScore + (this.thirdPlace?.score ?? 0);
    } else {
      this.score = null;
    }
  }
}

type GroupGuessNodeInfo = {
  team: null | Team;
  positionGuess: null | number;
  extraQualifiedGuess: boolean;
  score: null | number;
};

export class GroupGuessResult {
  score: number | null;
  classification: GroupGuessNodeInfo[];

  constructor(
    sweepstake: GroupListSweepstake,
    groupId: string,
    groupGuess: GroupGuess,
    extraQualifiedListGuess: Team[],
  ) {
    const { championship, scorePolicy } = sweepstake;
    const isLocked = sweepstake.getStatus() === "locked";
    const group = championship.getGroup(groupId);
    if (!group) {
      this.classification = [];
      this.score = isLocked ? 0 : null;
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
      const guessPosition = groupGuess.teamPosition(team) ?? -1;
      console.log({
        group: JSON.stringify(group),
        team: JSON.stringify(team),
        guessPosition,
      });
      const extraQualifiedGuess = !!extraQualifiedListGuess.find(
        (t) => t.id === team.id,
      );
      const score = isLocked
        ? scorePolicy.groupListTeamScore(
            team,
            championship,
            guessPosition,
            extraQualifiedListGuess,
          )
        : null;
      return {
        team,
        positionGuess: guessPosition,
        extraQualifiedGuess,
        score,
      };
    });

    this.score = isLocked
      ? this.classification.reduce((acc, node) => acc + (node.score ?? 0), 0)
      : null;
  }
}

export class GroupListGuessResult {
  score: number | null;
  groups: GroupGuessResult[];

  constructor(sweepstake: GroupListSweepstake, guess: GroupListGuess) {
    const isLocked = sweepstake.getStatus() === "locked";
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
    this.score = isLocked
      ? this.groups.reduce((acc, result) => acc + (result.score ?? 0), 0)
      : null;
  }
}

export type PoolItemResult =
  | { kind: "group"; groupResult: GroupListGuessResult; factor: number }
  | { kind: "cup"; cupResult: CupGuessResult; factor: number };

export class PoolGuessResult {
  user: User;
  score: number | null;
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

    let hasValidScore = false;
    let totalScore = 0;
    for (const result of this.subResultList) {
      const subScore =
        result.kind === "group"
          ? result.groupResult.score
          : result.cupResult.score;
      if (subScore !== null) {
        hasValidScore = true;
        totalScore += subScore * result.factor;
      }
    }
    this.score = hasValidScore ? totalScore : null;
  }
}
