import { BinaryTree } from "../utils/BinaryTree";
import { GroupListGroupChampionship } from "./Championship";
import { CupGuess, GroupGuess, GroupListGuess, PoolGuess } from "./Guess";
import {
  CupSweepstake,
  GroupListSweepstake,
  PoolSweepstake,
} from "./Sweepstake";
import { Team } from "./Team";
import { User } from "./User";

export type CupGuessTeamResult = {
  team: Team;
  info: null | {
    teamPosition: number;
    guessPosition: number;
    score: null | number;
  };
};

export class CupGuessResult {
  sweepstakeId: string;
  userId: string;
  score: number | null;
  root: BinaryTree<CupGuessTeamResult>;
  thirdPlace: null | CupGuessTeamResult;

  constructor(sweepstake: CupSweepstake, guess: CupGuess, factor: number) {
    this.userId = guess.userId;
    this.sweepstakeId = guess.sweepstakeId;
    const cup = sweepstake.championship;
    const scorePolicy = sweepstake.scorePolicy;
    const isLocked = sweepstake.getStatus() === "locked";
    const scanContext: { seen: Team[] } = { seen: [] };

    if (guess.thirdPlace) {
      const teamPosition = cup.teamPosition(guess.thirdPlace);
      const score = isLocked
        ? factor * scorePolicy.cupTeamScore(guess.thirdPlace, cup, 3)
        : null;
      this.thirdPlace = {
        team: guess.thirdPlace,
        info:
          teamPosition === null
            ? null
            : {
                teamPosition,
                guessPosition: 3,
                score,
              },
      };
      scanContext.seen.push(guess.thirdPlace);
    } else {
      this.thirdPlace = null;
    }

    this.root = guess.root.scanmap(
      (team, context) => {
        if (context.seen.some((t) => t.id === team.id)) {
          return { team, info: null };
        }
        const teamPosition = cup.teamPosition(team);
        const guessPosition = guess.teamPosition(team);
        if (guessPosition == null || teamPosition == null) {
          return { team, info: null };
        }
        const score = isLocked
          ? factor * scorePolicy.cupTeamScore(team, cup, guessPosition)
          : null;
        return { team, info: { teamPosition, guessPosition, score } };
      },
      scanContext,
      function nextContext(team: null | Team, context: { seen: Team[] }) {
        if (team !== null) {
          context.seen.push(team);
        }
        return context;
      },
    );

    if (!isLocked) {
      this.score = null;
    } else {
      const rootScore = this.root.reduce(
        (acc, node) => acc + (node.info?.score ?? 0),
        0,
      );
      this.score = rootScore + (this.thirdPlace?.info?.score ?? 0);
    }
  }

  toList(): (NonNullable<CupGuessTeamResult["info"]> & { team: Team })[] {
    const list = this.root.reduce(
      (acc, node) => {
        if (node.info) {
          acc.push({ team: node.team, ...node.info });
        }
        return acc;
      },
      [] as (NonNullable<CupGuessTeamResult["info"]> & { team: Team })[],
    );

    if (this.thirdPlace?.info) {
      list.push({ team: this.thirdPlace.team, ...this.thirdPlace.info });
    }

    return list.sort((a, b) => a.guessPosition - b.guessPosition);
  }
}

export type GroupListTeamGuessResult = {
  team: Team;
  guessPosition: number;
  guessQualified: boolean;
  guessExtraQualified: boolean;
  teamPosition: null | number;
  teamQualified: boolean;
  teamExtraQualified: boolean;
  score: null | number;
};

export class GroupListGroupGuessResult {
  score: number | null;
  classification: GroupListTeamGuessResult[];

  constructor(
    sweepstake: GroupListSweepstake,
    group: GroupListGroupChampionship,
    groupGuess: GroupGuess,
    extraQualifiedListGuess: Team[],
  ) {
    const { championship, scorePolicy } = sweepstake;
    const isLocked = sweepstake.getStatus() === "locked";

    this.classification = groupGuess.classification.map(
      (team, teamIdx): GroupListTeamGuessResult => {
        const guessPosition = teamIdx + 1;
        const guessExtraQualified = !!extraQualifiedListGuess.find(
          (t) => t.id === team.id,
        );
        const guessQualified =
          sweepstake.championship.positionIsRegularQualified(guessPosition) ||
          guessExtraQualified;
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
          guessPosition,
          guessQualified,
          guessExtraQualified,
          teamPosition: championship.teamPosition(team),
          teamQualified: championship.teamIsQualified(team),
          teamExtraQualified: championship.teamIsExtraQualified(team),
          score,
        };
      },
    );

    this.score = isLocked
      ? this.classification.reduce((acc, node) => acc + (node.score ?? 0), 0)
      : null;
  }
}

export class GroupListGuessResult {
  sweepstakeId: string;
  userId: string;
  score: number | null;
  groupList: GroupListGroupGuessResult[];

  constructor(
    sweepstake: GroupListSweepstake,
    guess: GroupListGuess,
    factor?: number,
  ) {
    this.sweepstakeId = guess.sweepstakeId;
    this.userId = guess.userId;
    const isLocked = sweepstake.getStatus() === "locked";
    this.groupList = sweepstake.championship.getGroups().map((group, idx) => {
      const groupGuess = guess.groupGuesses[idx];
      if (!groupGuess) throw new Error(`Missing group guess at index ${idx}`);
      return new GroupListGroupGuessResult(
        sweepstake,
        group,
        groupGuess,
        guess.extraQualifiedListGuess,
      );
    });
    this.score = isLocked
      ? this.groupList.reduce((acc, result) => acc + (result.score ?? 0), 0) *
        (factor ?? 1)
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
              cupResult: new CupGuessResult(
                item.sweepstake,
                subGuess.cupGuess,
                item.factor,
              ),
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
