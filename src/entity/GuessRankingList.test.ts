import { GuessRankingList } from "./GuessRankingList";
import {
  CupGuessResult,
  GroupListGuessResult,
  PoolGuessResult,
} from "./GuessResult";

describe("GuessRankingList", () => {
  it("should sort users based on score with standard competition ranking", () => {
    // Create dummy data
    const dummyResults = [
      { userId: "user-1", score: 10 },
      { userId: "user-2", score: 20 },
      { userId: "user-3", score: 20 },
      { userId: "user-4", score: 5 },
      { userId: "user-5", score: 15 },
    ] as GroupListGuessResult[];

    const rankingList =
      GuessRankingList.fromGroupListGuessResultList(dummyResults);

    expect(rankingList.items.length).toBe(5);

    // Expected order: user-2 (20), user-3 (20), user-5 (15), user-1 (10), user-4 (5)
    expect(rankingList.items[0]!.userId).toBe("user-2");
    expect(rankingList.items[0]!.score).toBe(20);
    expect(rankingList.items[0]!.position).toBe(1);

    expect(rankingList.items[1]!.userId).toBe("user-3");
    expect(rankingList.items[1]!.score).toBe(20);
    expect(rankingList.items[1]!.position).toBe(1);

    expect(rankingList.items[2]!.userId).toBe("user-5");
    expect(rankingList.items[2]!.score).toBe(15);
    expect(rankingList.items[2]!.position).toBe(3); // Standard ranking leaves a gap

    expect(rankingList.items[3]!.userId).toBe("user-1");
    expect(rankingList.items[3]!.score).toBe(10);
    expect(rankingList.items[3]!.position).toBe(4);

    expect(rankingList.items[4]!.userId).toBe("user-4");
    expect(rankingList.items[4]!.score).toBe(5);
    expect(rankingList.items[4]!.position).toBe(5);
  });

  it("should place null scores at the bottom", () => {
    const dummyResults = [
      { userId: "user-1", score: null },
      { userId: "user-2", score: 10 },
      { userId: "user-3", score: null },
      { userId: "user-4", score: 20 },
    ] as CupGuessResult[];

    const rankingList = GuessRankingList.fromCupGuessResultList(dummyResults);

    expect(rankingList.items.length).toBe(4);

    expect(rankingList.items[0]!.userId).toBe("user-4");
    expect(rankingList.items[0]!.score).toBe(20);
    expect(rankingList.items[0]!.position).toBe(1);

    expect(rankingList.items[1]!.userId).toBe("user-2");
    expect(rankingList.items[1]!.score).toBe(10);
    expect(rankingList.items[1]!.position).toBe(2);

    expect(rankingList.items[2]!.score).toBeNull();
    expect(rankingList.items[2]!.position).toBe(3);

    expect(rankingList.items[3]!.score).toBeNull();
    expect(rankingList.items[3]!.position).toBe(3);
  });

  it("should handle all null scores correctly", () => {
    const dummyResults = [
      { userId: "user-1", score: null },
      { userId: "user-2", score: null },
    ] as GroupListGuessResult[];

    const rankingList =
      GuessRankingList.fromGroupListGuessResultList(dummyResults);

    expect(rankingList.items.length).toBe(2);
    expect(rankingList.items[0]!.score).toBeNull();
    expect(rankingList.items[0]!.position).toBe(1);
    expect(rankingList.items[1]!.score).toBeNull();
    expect(rankingList.items[1]!.position).toBe(1);
  });

  it("should handle empty lists", () => {
    const rankingList = GuessRankingList.fromCupGuessResultList([]);
    expect(rankingList.items).toEqual([]);
  });

  describe("fromPoolGuessResultList", () => {
    it("should sort users by total pool score with standard competition ranking", () => {
      const dummyResults = [
        { user: { id: () => "user-1" }, score: 30 },
        { user: { id: () => "user-2" }, score: 50 },
        { user: { id: () => "user-3" }, score: 50 },
        { user: { id: () => "user-4" }, score: 10 },
      ] as unknown as PoolGuessResult[];

      const rankingList =
        GuessRankingList.fromPoolGuessResultList(dummyResults);

      expect(rankingList.items).toHaveLength(4);
      expect(rankingList.items[0]!.userId).toBe("user-2");
      expect(rankingList.items[0]!.score).toBe(50);
      expect(rankingList.items[0]!.position).toBe(1);
      expect(rankingList.items[1]!.userId).toBe("user-3");
      expect(rankingList.items[1]!.score).toBe(50);
      expect(rankingList.items[1]!.position).toBe(1);
      expect(rankingList.items[2]!.userId).toBe("user-1");
      expect(rankingList.items[2]!.score).toBe(30);
      expect(rankingList.items[2]!.position).toBe(3);
      expect(rankingList.items[3]!.userId).toBe("user-4");
      expect(rankingList.items[3]!.score).toBe(10);
      expect(rankingList.items[3]!.position).toBe(4);
    });

    it("should place null scores at the bottom", () => {
      const dummyResults = [
        { user: { id: () => "user-1" }, score: null },
        { user: { id: () => "user-2" }, score: 40 },
        { user: { id: () => "user-3" }, score: null },
      ] as unknown as PoolGuessResult[];

      const rankingList =
        GuessRankingList.fromPoolGuessResultList(dummyResults);

      expect(rankingList.items[0]!.userId).toBe("user-2");
      expect(rankingList.items[0]!.position).toBe(1);
      expect(rankingList.items[1]!.score).toBeNull();
      expect(rankingList.items[1]!.position).toBe(2);
      expect(rankingList.items[2]!.score).toBeNull();
      expect(rankingList.items[2]!.position).toBe(2);
    });

    it("should handle an empty list", () => {
      const rankingList = GuessRankingList.fromPoolGuessResultList([]);
      expect(rankingList.items).toEqual([]);
    });
  });
});
