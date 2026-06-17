import { CupGuessResult, GroupListGuessResult } from "./GuessResult";

export class GuessRankingItem {
  constructor(
    public readonly userId: string,
    public readonly score: number | null,
    public readonly position: number,
  ) {}
}

export class GuessRankingList {
  public readonly items: GuessRankingItem[];

  private constructor(items: GuessRankingItem[]) {
    this.items = items;
  }

  private static calculateRankings(
    results: { userId: string; score: number | null }[],
  ): GuessRankingList {
    const sorted = [...results].sort((a, b) => {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return b.score - a.score;
    });

    const items: GuessRankingItem[] = [];
    let currentPosition = 1;
    let rankOffset = 0;
    let previousScore: number | null | undefined = undefined;

    for (const result of sorted) {
      if (previousScore === undefined) {
        items.push(
          new GuessRankingItem(result.userId, result.score, currentPosition),
        );
        previousScore = result.score;
      } else {
        if (result.score === previousScore) {
          rankOffset++;
          items.push(
            new GuessRankingItem(result.userId, result.score, currentPosition),
          );
        } else {
          currentPosition += rankOffset + 1;
          rankOffset = 0;
          items.push(
            new GuessRankingItem(result.userId, result.score, currentPosition),
          );
          previousScore = result.score;
        }
      }
    }

    return new GuessRankingList(items);
  }

  public static fromGroupListGuessResultList(
    results: GroupListGuessResult[],
  ): GuessRankingList {
    return this.calculateRankings(results);
  }

  public static fromCupGuessResultList(
    results: CupGuessResult[],
  ): GuessRankingList {
    return this.calculateRankings(results);
  }
}
