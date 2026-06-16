import {
  ScorePolicyBuilder,
  InverseProbabilityPositionScorePolicy,
  InverseProbabilityQualifiedPositionGroupListScorePolicy,
  WithLogarithm2GroupScorePolicy,
  WithLogarithm2CupScorePolicy,
  ScaledScorePolicy,
} from "./ScorePolicy";
import { Team } from "./Team";
import {
  GroupListGroupChampionship,
  GroupListChampionship,
  CupChampionship,
} from "./Championship";
import { BinaryTree } from "../utils/BinaryTree";

describe("ScorePolicyBuilder", () => {
  describe("buildGroupListScorePolicyFromId", () => {
    test("inverse-probability-position", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "inverse-probability-position",
      );
      expect(policy).toBeInstanceOf(InverseProbabilityPositionScorePolicy);
    });

    test("inverse-probability-qualified-position", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "inverse-probability-qualified-position",
      );
      expect(policy).toBeInstanceOf(
        InverseProbabilityQualifiedPositionGroupListScorePolicy,
      );
    });

    test("log2(inverse-probability-position)", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "log2(inverse-probability-position)",
      ) as WithLogarithm2GroupScorePolicy;
      expect(policy).toBeInstanceOf(WithLogarithm2GroupScorePolicy);
      expect(policy.scorePolicy).toBeInstanceOf(
        InverseProbabilityPositionScorePolicy,
      );
    });

    test("log2(inverse-probability-qualified-position)", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "log2(inverse-probability-qualified-position)",
      ) as WithLogarithm2GroupScorePolicy;
      expect(policy).toBeInstanceOf(WithLogarithm2GroupScorePolicy);
      expect(policy.scorePolicy).toBeInstanceOf(
        InverseProbabilityQualifiedPositionGroupListScorePolicy,
      );
    });

    test("log2(log2(inverse-probability-position))", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "log2(log2(inverse-probability-position))",
      ) as WithLogarithm2GroupScorePolicy;
      expect(policy).toBeInstanceOf(WithLogarithm2GroupScorePolicy);
      const wrapped = policy.scorePolicy as WithLogarithm2GroupScorePolicy;
      expect(wrapped).toBeInstanceOf(WithLogarithm2GroupScorePolicy);
      expect(wrapped.scorePolicy).toBeInstanceOf(
        InverseProbabilityPositionScorePolicy,
      );
    });

    test("throw an error for unknown GroupListScorePolicy IDs", () => {
      expect(() => {
        ScorePolicyBuilder.buildGroupListScorePolicyFromId("invalid-policy");
      }).toThrow(/Unknown GroupListScorePolicy ID/);
    });

    test("scaled(10, log2(inverse-probability-qualified-position))", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "scaled(10, log2(inverse-probability-qualified-position))",
      ) as ScaledScorePolicy;
      expect(policy).toBeInstanceOf(ScaledScorePolicy);
      expect(policy.scale).toBe(10);
      const wrapped = policy.scorePolicy as WithLogarithm2GroupScorePolicy;
      expect(wrapped).toBeInstanceOf(WithLogarithm2GroupScorePolicy);
      expect(wrapped.scorePolicy).toBeInstanceOf(
        InverseProbabilityQualifiedPositionGroupListScorePolicy,
      );
    });
  });

  describe("buildCupScorePolicyFromId", () => {
    test("inverse-probability-position", () => {
      const policy = ScorePolicyBuilder.buildCupScorePolicyFromId(
        "inverse-probability-position",
      );
      expect(policy).toBeInstanceOf(InverseProbabilityPositionScorePolicy);
    });

    test("log2(inverse-probability-position)", () => {
      const policy = ScorePolicyBuilder.buildCupScorePolicyFromId(
        "log2(inverse-probability-position)",
      ) as WithLogarithm2CupScorePolicy;
      expect(policy).toBeInstanceOf(WithLogarithm2CupScorePolicy);
      expect(policy.scorePolicy).toBeInstanceOf(
        InverseProbabilityPositionScorePolicy,
      );
    });

    test("throw an error for unknown CupScorePolicy IDs", () => {
      expect(() => {
        ScorePolicyBuilder.buildCupScorePolicyFromId("invalid-policy");
      }).toThrow(/Unknown CupScorePolicy ID/);
    });

    test("scaled(10, log2(inverse-probability-position))", () => {
      const policy = ScorePolicyBuilder.buildCupScorePolicyFromId(
        "scaled(10, log2(inverse-probability-position))",
      ) as ScaledScorePolicy;
      expect(policy).toBeInstanceOf(ScaledScorePolicy);
      expect(policy.scale).toBe(10);
      const wrapped = policy.scorePolicy as WithLogarithm2CupScorePolicy;
      expect(wrapped).toBeInstanceOf(WithLogarithm2CupScorePolicy);
      expect(wrapped.scorePolicy).toBeInstanceOf(
        InverseProbabilityPositionScorePolicy,
      );
    });
  });
});

describe("ScaledScorePolicy", () => {
  const team1A = new Team("team1A", "Team 1A");
  const team2A = new Team("team2A", "Team 2A");
  const team3A = new Team("team3A", "Team 3A");
  const team4A = new Team("team4A", "Team 4A");

  const team1B = new Team("team1B", "Team 1B");
  const team2B = new Team("team2B", "Team 2B");
  const team3B = new Team("team3B", "Team 3B");
  const team4B = new Team("team4B", "Team 4B");

  describe("GroupList test scenario", () => {
    const groupA = new GroupListGroupChampionship("A", [
      team1A,
      team2A,
      team3A,
      team4A,
    ]);
    const groupB = new GroupListGroupChampionship("B", [
      team1B,
      team2B,
      team3B,
      team4B,
    ]);

    const championship = new GroupListChampionship(
      "id",
      "name",
      [groupA, groupB],
      [team3A], // 1 extra qualified position
      2, // 2 regular positions per group
      new Date(),
    );

    const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
      "scaled(10, log2(inverse-probability-qualified-position))",
    );

    test("evaluates correct matches", () => {
      // team1A is position 1, guessed position 1, qualified.
      // score: numTeams (4) / worstPosition (1) = 4. log2(8) = 2. scaled(10) = 20.
      expect(policy.groupListTeamScore(team1A, championship, 1, [])).toBe(20);

      // team3A is position 3, extra qualified. Guessed 3, extra qualified.
      // worstPosition = 3. 3 is not <= maxRegularQualifiedPosition (2).
      // So useRegularQualifiedScore is false.
      // score: numTeams (8) / numQualifiedTeams (5) = 1.6.
      // log2(1.6) = 0.678. scaled(10) = 6.78 -> floor = 6.
      const scoreTeam3A = policy.groupListTeamScore(team3A, championship, 3, [
        team3A,
      ]);
      expect(scoreTeam3A).toBe(6);
    });

    test("evaluates partial matches and misses", () => {
      // team4A is position 4 (not qualified). Guess 4, not qualified.
      // return MIN_SCORE = 1. log2(1) = 0. scaled(10) = 0
      expect(policy.groupListTeamScore(team4A, championship, 4, [])).toBe(0);

      // Guess team1A at position 2. worst = 2. 4 / 2 = 2. log2(2) = 1. scaled(10) = 10.
      expect(policy.groupListTeamScore(team1A, championship, 2, [])).toBe(10);
    });

    test("evaluates not started championship or null guesses", () => {
      const groupANotStarted = new GroupListGroupChampionship("A", [
        null,
        null,
        null,
        null,
      ]);
      const groupBNotStarted = new GroupListGroupChampionship("B", [
        null,
        null,
        null,
        null,
      ]);
      const notStartedChampionship = new GroupListChampionship(
        "id2",
        "name2",
        [groupANotStarted, groupBNotStarted],
        [null],
        2,
        new Date(),
      );

      // Championship not started, team position is null -> returns MIN_SCORE = 1. log2(1) = 0. scaled(10) = 0.
      expect(
        policy.groupListTeamScore(team1A, notStartedChampionship, 1, []),
      ).toBe(0);
    });
  });

  describe("Cup test scenario", () => {
    // Tree: team1A(team1A(team1A(team1A, team1B), team3A(team3A, team2B)), team2A(team2A(team2A, team3B), team4A(team4A, team4B)))
    const cupRoot = new BinaryTree<Team | null>(team1A, [
      new BinaryTree<Team | null>(team1A, [
        new BinaryTree<Team | null>(team1A, [
          new BinaryTree(team1A),
          new BinaryTree(team1B),
        ]),
        new BinaryTree<Team | null>(team3A, [
          new BinaryTree(team3A),
          new BinaryTree(team2B),
        ]),
      ]),
      new BinaryTree<Team | null>(team2A, [
        new BinaryTree<Team | null>(team2A, [
          new BinaryTree(team2A),
          new BinaryTree(team3B),
        ]),
        new BinaryTree<Team | null>(team4A, [
          new BinaryTree(team4A),
          new BinaryTree(team4B),
        ]),
      ]),
    ]);

    const cupChampionship = new CupChampionship(
      "cup1",
      "Cup 1",
      cupRoot,
      true,
      team3A,
      new Date(),
    );

    const policy = ScorePolicyBuilder.buildCupScorePolicyFromId(
      "scaled(10, log2(inverse-probability-position))",
    );

    test("evaluates exact matches", () => {
      // team1A is position 1. Guess 1.
      // numTeams = 8. worstPosition = 1. 8 / 1 = 8. log2(8) = 3. scaled(10) = 30.
      expect(policy.cupTeamScore(team1A, cupChampionship, 1)).toBe(30);

      // team2A is position 2. Guess 2.
      // worstPosition = 2. 8 / 2 = 4. log2(4) = 2. scaled(10) = 20.
      expect(policy.cupTeamScore(team2A, cupChampionship, 2)).toBe(20);

      // team3A is position 3. Guess 3.
      // worstPosition = 3. 8 / 3 = 2.666... log2(2.666) = 1.415. scaled(10) = 14.
      expect(policy.cupTeamScore(team3A, cupChampionship, 3)).toBe(14);

      // team1B is position 8. Guess 8.
      // worstPosition = 8. 8 / 8 = 1. log2(1) = 0. scaled(10) = 0.
      expect(policy.cupTeamScore(team1B, cupChampionship, 8)).toBe(0);
    });

    test("evaluates partial matches", () => {
      // team1A guessed at 2. worst = 2. 8/2 = 4. log2(4) = 2. scaled = 20.
      expect(policy.cupTeamScore(team1A, cupChampionship, 2)).toBe(20);

      // team2A guessed at 1. worst = 2. 8/2 = 4. log2(4) = 2. scaled = 20.
      expect(policy.cupTeamScore(team2A, cupChampionship, 1)).toBe(20);
    });

    test("evaluates not started cup", () => {
      const notStartedRoot = new BinaryTree<Team | null>(null, [
        new BinaryTree<Team | null>(null, [
          new BinaryTree<Team | null>(null, [
            new BinaryTree(team1A),
            new BinaryTree(team1B),
          ]),
          new BinaryTree<Team | null>(null, [
            new BinaryTree(team3A),
            new BinaryTree(team2B),
          ]),
        ]),
        new BinaryTree<Team | null>(null, [
          new BinaryTree<Team | null>(null, [
            new BinaryTree(team2A),
            new BinaryTree(team3B),
          ]),
          new BinaryTree<Team | null>(null, [
            new BinaryTree(team4A),
            new BinaryTree(team4B),
          ]),
        ]),
      ]);

      const notStartedCup = new CupChampionship(
        "cup2",
        "Cup 2",
        notStartedRoot,
        true,
        null,
        new Date(),
      );

      // In a not started cup, teams are only at the leafs.
      // team1A is at height 3, so its position is 2^3 = 8.
      // numTeams = 8. worstPosition = max(8, 1) = 8. 8 / 8 = 1.
      // log2(1) = 0. scaled(10) = 0.
      const score = policy.cupTeamScore(team1A, notStartedCup, 1);
      expect(score).toBe(0);
    });
  });
});
