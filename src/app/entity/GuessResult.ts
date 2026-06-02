import { BinaryTree } from "../utils/BinaryTree";
import { CupGuess, LeagueGuess } from "./Guess";
import { GroupAndCupSweepstake } from "./Sweepstake";
import { Team } from "./Team";

type CupGuessNodeInfo = {
  team: null | Team;
  positionGuess: null | number;
  score: null | number;
};

class CupGuessResult {
  score: number;
  root: BinaryTree<CupGuessNodeInfo>;
  thirdPlace: null | CupGuessNodeInfo;

  private constructor(
    root: BinaryTree<CupGuessNodeInfo>,
    thirdPlace: null | CupGuessNodeInfo,
  ) {
    this.root = root;
    this.thirdPlace = thirdPlace;
    const rootScore = root.reduce((acc, node) => acc + (node.score ?? 0), 0);
    this.score = rootScore + (thirdPlace?.score ?? 0);
  }

  static fromGroupAndCupSweepstake(
    sweepstake: GroupAndCupSweepstake,
    guess: CupGuess,
  ): CupGuessResult {
    const cup = sweepstake.championship.cup;
    const scorePolicy = sweepstake.cupScorePolicy;
    let thirdPlace: null | CupGuessNodeInfo = null;
    const scanContext: { seen: Team[] } = { seen: [] };
    if (cup.hasThirdPlaceMatch) {
      if (cup.thirdPlace) {
        const team = cup.thirdPlace;
        const guessPosition = guess.teamPosition(team) ?? (-1 as never);
        const score = scorePolicy.teamScoreFromCup(cup, team, guessPosition);
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
    const nextContext = (team: Team, context: { seen: Team[] }) => {
      context.seen.push(team);
      return context;
    };
    const root = cup.root.scanmap(
      (team, context) => {
        const guessPosition = guess.teamPosition(team) ?? (-1 as never);
        if (context.seen.includes(team)) {
          return { team, positionGuess: guessPosition, score: null };
        }
        const score = scorePolicy.teamScoreFromCup(cup, team, guessPosition);
        return { team, positionGuess: guessPosition, score };
      },
      scanContext,
      nextContext,
    );

    return new CupGuessResult(root, thirdPlace);
  }
}

type LeagueGuessNodeInfo = {
  team: null | Team;
  positionGuess: null | number;
  extraQualifiedGuess: boolean;
  score: null | number;
};

export class LeagueGuessResult {
  score: number;
  classification: LeagueGuessNodeInfo[];

  constructor(classification: LeagueGuessNodeInfo[]) {
    this.classification = classification;
    this.score = classification.reduce(
      (acc, node) => acc + (node.score ?? 0),
      0,
    );
  }

  static fromGroupAndCupSweepstake(
    sweepstake: GroupAndCupSweepstake,
    groupId: string,
    groupGuess: LeagueGuess,
    extraQualifiedListGuess: Team[],
  ): LeagueGuessResult {
    const { championship, leagueScorePolicy } = sweepstake;
    const group = championship.group(groupId);
    if (!group) return new LeagueGuessResult([]) as never;
    const classificationInfo: LeagueGuessNodeInfo[] = group.classification.map(
      (team) => {
        const guessPosition = groupGuess.teamPosition(team);
        const extraQualifiedGuess = !!extraQualifiedListGuess.find(
          (t) => t.id === team.id,
        );
        const score = leagueScorePolicy.teamScoreFromLeague(
          group,
          championship.extraQualifiedList,
          team,
          guessPosition ?? (-1 as never),
          extraQualifiedGuess,
        );
        return {
          team,
          positionGuess: guessPosition,
          extraQualifiedGuess,
          score,
        };
      },
    );
    return new LeagueGuessResult(classificationInfo);
  }
}

export class GroupAndCupGuessResult {
  score: number;
  cupResult: CupGuessResult;
  groupResults: LeagueGuessResult[];

  constructor(cupResult: CupGuessResult, groupResults: LeagueGuessResult[]) {
    this.cupResult = cupResult;
    this.groupResults = groupResults;
    this.score =
      cupResult.score +
      groupResults.reduce((acc, result) => acc + result.score, 0);
  }

  static fromGroupAndCupSweepstake(
    sweepstake: GroupAndCupSweepstake,
    cupGuess: CupGuess,
    groupGuessList: LeagueGuess[],
    extraQualifiedListGuess: Team[],
  ): GroupAndCupGuessResult {
    const cupResult = CupGuessResult.fromGroupAndCupSweepstake(
      sweepstake,
      cupGuess,
    );
    const groupResults = sweepstake.championship.groups.map((group, idx) =>
      LeagueGuessResult.fromGroupAndCupSweepstake(
        sweepstake,
        group.id,
        groupGuessList[idx],
        extraQualifiedListGuess,
      ),
    );
    return new GroupAndCupGuessResult(cupResult, groupResults);
  }
}
