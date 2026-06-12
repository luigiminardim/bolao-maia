import { Team } from "./Team";
import { BinaryTree } from "../utils/BinaryTree";
import {
  CupGuess,
  GroupGuess,
  GroupListGuess,
  PoolGuess,
  PoolGuessItem,
} from "./Guess";

describe("Guess", () => {
  describe("CupGuess", () => {
    it("should instantiate correctly", () => {
      const team1 = new Team("t1", "Team 1");
      const root = new BinaryTree(team1);
      const guess = new CupGuess("user1", "sweep1", root, null);

      expect(guess.userId).toBe("user1");
      expect(guess.sweepstakeId).toBe("sweep1");
      expect(guess.root).toBe(root);
      expect(guess.thirdPlace).toBeNull();
    });

    it("should return team position based on height in binary tree", () => {
      const team1 = new Team("t1", "Team 1");
      const team2 = new Team("t2", "Team 2");
      const root = new BinaryTree(team1, [
        new BinaryTree(team1),
        new BinaryTree(team2),
      ]);

      const guess = new CupGuess("user1", "sweep1", root, null);

      // team1 is at height 0 (root) and height 1 (left child). findHeight returns the first found, height 0.
      // Math.pow(2, 0) = 1
      expect(guess.teamPosition(team1)).toBe(1);

      // team2 is at height 1 (right child)
      // Math.pow(2, 1) = 2
      expect(guess.teamPosition(team2)).toBe(2);
    });

    it("should return 3 if team is third place", () => {
      const team1 = new Team("t1", "Team 1");
      const team3 = new Team("t3", "Team 3");
      const root = new BinaryTree(team1);

      const guess = new CupGuess("user1", "sweep1", root, team3);

      expect(guess.teamPosition(team3)).toBe(3);
    });

    it("should return null if team is not in tree and not third place", () => {
      const team1 = new Team("t1", "Team 1");
      const team2 = new Team("t2", "Team 2");
      const root = new BinaryTree(team1);

      const guess = new CupGuess("user1", "sweep1", root, null);

      expect(guess.teamPosition(team2)).toBeNull();
    });
  });

  describe("GroupGuess", () => {
    it("should instantiate correctly", () => {
      const team1 = new Team("t1", "Team 1");
      const team2 = new Team("t2", "Team 2");

      const guess = new GroupGuess([team1, team2]);

      expect(guess.classification).toEqual([team1, team2]);
    });

    it("should return team position 1-indexed", () => {
      const team1 = new Team("t1", "Team 1");
      const team2 = new Team("t2", "Team 2");
      const guess = new GroupGuess([team1, team2]);

      expect(guess.teamPosition(team1)).toBe(1);
      expect(guess.teamPosition(team2)).toBe(2);
    });

    it("should return null if team is not in classification", () => {
      const team1 = new Team("t1", "Team 1");
      const team3 = new Team("t3", "Team 3");
      const guess = new GroupGuess([team1]);

      expect(guess.teamPosition(team3)).toBeNull();
    });
  });

  describe("GroupListGuess", () => {
    it("should instantiate correctly", () => {
      const team1 = new Team("t1", "Team 1");
      const groupGuess = new GroupGuess([team1]);

      const guess = new GroupListGuess(
        "user1",
        "sweep1",
        [groupGuess],
        [team1],
      );

      expect(guess.userId).toBe("user1");
      expect(guess.sweepstakeId).toBe("sweep1");
      expect(guess.groupGuesses).toEqual([groupGuess]);
      expect(guess.extraQualifiedListGuess).toEqual([team1]);
    });
  });

  describe("PoolGuess", () => {
    it("should instantiate correctly", () => {
      const team1 = new Team("t1", "Team 1");
      const groupGuess = new GroupGuess([team1]);
      const groupListGuess = new GroupListGuess(
        "user1",
        "sweep1",
        [groupGuess],
        [team1],
      );

      const poolGuessItem: PoolGuessItem = {
        kind: "group",
        groupGuess: groupListGuess,
      };

      const guess = new PoolGuess("user1", "sweep1", [poolGuessItem]);

      expect(guess.userId).toBe("user1");
      expect(guess.sweepstakeId).toBe("sweep1");
      expect(guess.subGuesses).toEqual([poolGuessItem]);
    });
  });
});
