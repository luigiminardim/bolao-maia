import {
  CupChampionship,
  GroupListGroupChampionship,
  GroupListChampionship,
} from "./Championship";
import { CupGuess, GroupGuess, GroupListGuess, PoolGuess } from "./Guess";
import {
  CupGuessResult,
  GroupListGroupGuessResult,
  GroupListGuessResult,
  PoolGuessResult,
} from "./GuessResult";
import { ScorePolicyBuilder } from "./ScorePolicy";
import {
  CupSweepstake,
  GroupListSweepstake,
  PoolSweepstake,
} from "./Sweepstake";
import { Team } from "./Team";
import { User } from "./User";
import { BinaryTree } from "../utils/BinaryTree";

describe("GuessResult", () => {
  const user = new User("User 1");

  const t1A = new Team("t1A", "Team 1A");
  const t2A_guess3_extraQualified = new Team("t2A", "Team 2A");
  const t3A_guess2 = new Team("t3A", "Team 3A");
  const t4A = new Team("t4A", "Team 4A");

  const t1B_guess4 = new Team("t1B", "Team 1B");
  const t2B_guess3 = new Team("t2B", "Team 2B");
  const t3B_guess2 = new Team("t3B", "Team 3B");
  const t4B_guess1 = new Team("t4B", "Team 4B");

  const c1 = new Team("c1", "Cup 1");
  const c2 = new Team("c2", "Cup 2");
  const c3 = new Team("c3", "Cup 3");
  const c4 = new Team("c4", "Cup 4");
  const c5 = new Team("c5", "Cup 5");
  const c6 = new Team("c6", "Cup 6");
  const c7 = new Team("c7", "Cup 7");
  const c8 = new Team("c8", "Cup 8");

  const groupScorePolicyId =
    "scaled(10, log2(inverse-probability-qualified-position))";
  const cupScorePolicyId = "scaled(10, log2(inverse-probability-position))";

  const groupScorePolicy =
    ScorePolicyBuilder.buildGroupListScorePolicyFromId(groupScorePolicyId);
  const cupScorePolicy =
    ScorePolicyBuilder.buildCupScorePolicyFromId(cupScorePolicyId);

  const justStartedGroupListChampionship = new GroupListChampionship(
    "gl1",
    "Group List 1",
    [
      new GroupListGroupChampionship("gA", [
        t1A,
        t2A_guess3_extraQualified,
        t3A_guess2,
        t4A,
      ]),
      new GroupListGroupChampionship("gB", [
        t1B_guess4,
        t2B_guess3,
        t3B_guess2,
        t4B_guess1,
      ]),
    ],
    [null],
    1,
    new Date(),
  );

  const waitingGroupListChampionship = new GroupListChampionship(
    "gl1",
    "Group List 1",
    [
      new GroupListGroupChampionship("gA", [
        t1A,
        t2A_guess3_extraQualified,
        t3A_guess2,
        t4A,
      ]),
      new GroupListGroupChampionship("gB", [
        t1B_guess4,
        t2B_guess3,
        t3B_guess2,
        t4B_guess1,
      ]),
    ],
    [null],
    1,
    new Date(Date.now() + 1000000000), // FUTURE
  );

  const finishedGroupListChampionship = new GroupListChampionship(
    "gl1",
    "Group List 1",
    [
      new GroupListGroupChampionship("gA", [
        t1A,
        t2A_guess3_extraQualified,
        t3A_guess2,
        t4A,
      ]),
      new GroupListGroupChampionship("gB", [
        t1B_guess4,
        t2B_guess3,
        t3B_guess2,
        t4B_guess1,
      ]),
    ],
    [t3A_guess2], // team 3A extra qualified
    1,
    new Date(),
  );

  const justStartedCupChampionship = new CupChampionship(
    "cup1",
    "Cup 1",
    new BinaryTree<Team | null>(null, [
      new BinaryTree<Team | null>(null, [
        new BinaryTree<Team | null>(null, [
          new BinaryTree<Team | null>(c1),
          new BinaryTree<Team | null>(c5),
        ]),
        new BinaryTree<Team | null>(null, [
          new BinaryTree<Team | null>(c3),
          new BinaryTree<Team | null>(c6),
        ]),
      ]),
      new BinaryTree<Team | null>(null, [
        new BinaryTree<Team | null>(null, [
          new BinaryTree<Team | null>(c2),
          new BinaryTree<Team | null>(c7),
        ]),
        new BinaryTree<Team | null>(null, [
          new BinaryTree<Team | null>(c4),
          new BinaryTree<Team | null>(c8),
        ]),
      ]),
    ]),
    true,
    null,
    new Date(),
  );

  const waitingCupChampionship = new CupChampionship(
    "cup1",
    "Cup 1",
    new BinaryTree<Team | null>(null, [
      new BinaryTree<Team | null>(null, [
        new BinaryTree<Team | null>(null, [
          new BinaryTree<Team | null>(c1),
          new BinaryTree<Team | null>(c5),
        ]),
        new BinaryTree<Team | null>(null, [
          new BinaryTree<Team | null>(c3),
          new BinaryTree<Team | null>(c6),
        ]),
      ]),
      new BinaryTree<Team | null>(null, [
        new BinaryTree<Team | null>(null, [
          new BinaryTree<Team | null>(c2),
          new BinaryTree<Team | null>(c7),
        ]),
        new BinaryTree<Team | null>(null, [
          new BinaryTree<Team | null>(c4),
          new BinaryTree<Team | null>(c8),
        ]),
      ]),
    ]),
    true,
    null,
    new Date(Date.now() + 1000000000), // FUTURE
  );

  const finishedCupChampionship = new CupChampionship(
    "cup1",
    "Cup 1",
    new BinaryTree<Team | null>(c1, [
      new BinaryTree<Team | null>(c1, [
        new BinaryTree<Team | null>(c1, [
          new BinaryTree<Team | null>(c1),
          new BinaryTree<Team | null>(c5),
        ]),
        new BinaryTree<Team | null>(c3, [
          new BinaryTree<Team | null>(c3),
          new BinaryTree<Team | null>(c6),
        ]),
      ]),
      new BinaryTree<Team | null>(c2, [
        new BinaryTree<Team | null>(c2, [
          new BinaryTree<Team | null>(c2),
          new BinaryTree<Team | null>(c7),
        ]),
        new BinaryTree<Team | null>(c4, [
          new BinaryTree<Team | null>(c4),
          new BinaryTree<Team | null>(c8),
        ]),
      ]),
    ]),
    true,
    c3,
    new Date(),
  );

  const groupGuess = new GroupListGuess(
    user.id(),
    "swG",
    [
      new GroupGuess([t1A, t3A_guess2, t2A_guess3_extraQualified, t4A]),
      new GroupGuess([t4B_guess1, t3B_guess2, t2B_guess3, t1B_guess4]),
    ],
    [t2A_guess3_extraQualified],
  );

  const cupGuess = new CupGuess(
    user.id(),
    "swC",
    new BinaryTree<Team>(c4, [
      new BinaryTree<Team>(c1, [
        new BinaryTree<Team>(c1, [
          new BinaryTree<Team>(c1),
          new BinaryTree<Team>(c5),
        ]),
        new BinaryTree<Team>(c3, [
          new BinaryTree<Team>(c3),
          new BinaryTree<Team>(c6),
        ]),
      ]),
      new BinaryTree<Team>(c4, [
        new BinaryTree<Team>(c2, [
          new BinaryTree<Team>(c2),
          new BinaryTree<Team>(c7),
        ]),
        new BinaryTree<Team>(c4, [
          new BinaryTree<Team>(c4),
          new BinaryTree<Team>(c8),
        ]),
      ]),
    ]),
    c3,
  );

  describe("GroupGuessResult", () => {
    it("open sweepstake", () => {
      const groupSweepstake = new GroupListSweepstake(
        "swG",
        "Group Sweepstake",
        "Desc",
        waitingGroupListChampionship,
        groupScorePolicy,
      );
      const res = new GroupListGroupGuessResult(
        groupSweepstake,
        groupSweepstake.championship.getGroup("gA")!,
        groupGuess.groupGuesses[0]!,
        groupGuess.extraQualifiedListGuess,
      );
      expect(res.classification).toHaveLength(4);
      expect(res.score).toBeNull();
      expect(res.classification[0]?.score).toBeNull();
    });

    it("just started championship", () => {
      const groupSweepstake = new GroupListSweepstake(
        "swG",
        "Group Sweepstake",
        "Desc",
        justStartedGroupListChampionship,
        groupScorePolicy,
      );
      const res = new GroupListGroupGuessResult(
        groupSweepstake,
        groupSweepstake.championship.getGroup("gA")!,
        groupGuess.groupGuesses[0]!,
        groupGuess.extraQualifiedListGuess,
      );
      expect(res.classification).toHaveLength(4);
      expect(res.score).toBe(20);
      expect(res.classification[0]?.team).toBe(t1A);
      expect(res.classification[0]?.score).toBe(20); // score(1º) = 10 * log2(4/1)
      expect(res.classification[0]?.guessExtraQualified).toBe(false);
      expect(res.classification[2]?.team).toBe(t2A_guess3_extraQualified);
      expect(res.classification[2]?.guessExtraQualified).toBe(true);
    });

    it("finished championship", () => {
      const groupSweepstake = new GroupListSweepstake(
        "swG",
        "Group Sweepstake",
        "Desc",
        finishedGroupListChampionship,
        groupScorePolicy,
      );
      const res = new GroupListGroupGuessResult(
        groupSweepstake,
        groupSweepstake.championship.getGroup("gA")!,
        groupGuess.groupGuesses[0]!,
        groupGuess.extraQualifiedListGuess,
      );
      expect(res.classification).toHaveLength(4);
      expect(res.score).toBe(20);
      expect(res.classification[0]?.team).toBe(t1A);
      expect(res.classification[0]?.score).toBe(20);
      expect(res.classification[0]?.guessExtraQualified).toBe(false);
      expect(res.classification[1]?.team).toBe(t3A_guess2);
      expect(res.classification[1]?.teamExtraQualified).toBe(true);
    });
  });

  describe("GroupListGuessResult", () => {
    it("open sweepstake", () => {
      const groupSweepstake = new GroupListSweepstake(
        "swG",
        "Group Sweepstake",
        "Desc",
        waitingGroupListChampionship,
        groupScorePolicy,
      );
      const res = new GroupListGuessResult(groupSweepstake, groupGuess);
      expect(res.groupList).toHaveLength(2);
      expect(res.score).toBeNull();
    });

    it("just started championship", () => {
      const groupSweepstake = new GroupListSweepstake(
        "swG",
        "Group Sweepstake",
        "Desc",
        justStartedGroupListChampionship,
        groupScorePolicy,
      );
      const res = new GroupListGuessResult(groupSweepstake, groupGuess);
      expect(res.groupList).toHaveLength(2);
      expect(res.score).toBe(20);
      expect(res.groupList[0]?.classification[0]?.team).toBe(t1A);
      expect(res.groupList[0]?.classification[2]?.team).toBe(t2A_guess3_extraQualified);
      expect(res.groupList[0]?.classification[2]?.guessExtraQualified).toBe(
        true,
      );
    });

    it("finished championship", () => {
      const groupSweepstake = new GroupListSweepstake(
        "swG",
        "Group Sweepstake",
        "Desc",
        finishedGroupListChampionship,
        groupScorePolicy,
      );
      const res = new GroupListGuessResult(groupSweepstake, groupGuess);
      expect(res.groupList).toHaveLength(2);
      expect(res.score).toBe(20);
      expect(res.groupList[0]?.classification[0]?.team).toBe(t1A);
      expect(res.groupList[0]?.classification[0]?.guessExtraQualified).toBe(
        false,
      );
      expect(res.groupList[0]?.classification[1]?.team).toBe(t3A_guess2);
      expect(res.groupList[0]?.classification[1]?.teamExtraQualified).toBe(
        true,
      );
      expect(res.groupList[0]?.classification[0]?.score).toBe(20);
    });
  });

  describe("CupGuessResult", () => {
    it("open sweepstake", () => {
      const cupSweepstake = new CupSweepstake(
        "swC",
        "Cup Sweepstake",
        "Desc",
        waitingCupChampionship,
        cupScorePolicy,
      );
      const res = new CupGuessResult(cupSweepstake, cupGuess);
      expect(res.score).toBeNull();
      expect(res.root.elem.score).toBeNull();
      expect(res.thirdPlace?.score).toBeNull();
    });

    it("just started championship (teams on round of 8)", () => {
      const cupSweepstake = new CupSweepstake(
        "swC",
        "Cup Sweepstake",
        "Desc",
        justStartedCupChampionship,
        cupScorePolicy,
      );
      const res = new CupGuessResult(cupSweepstake, cupGuess);
      expect(res.score).toBe(0);
      expect(res.root.elem.team).toBeNull();
      expect(res.thirdPlace?.team).toBeNull();
    });

    it("finished championship", () => {
      const cupSweepstake = new CupSweepstake(
        "swC",
        "Cup Sweepstake",
        "Desc",
        finishedCupChampionship,
        cupScorePolicy,
      );
      const res = new CupGuessResult(cupSweepstake, cupGuess);
      expect(res.score).toBe(54);
      expect(res.root.elem.team).toBe(c1);
      expect(res.root.elem.score).toBe(20);
      expect(res.root.elem.positionGuess).toBe(2);

      expect(res.root.children[0]?.elem.team).toBe(c1);
      expect(res.root.children[0]?.elem.score).toBeNull();
      expect(res.root.children[0]?.elem.positionGuess).toBeNull();

      expect(res.thirdPlace?.team).toBe(c3);
      expect(res.thirdPlace?.positionGuess).toBe(3);
      expect(res.thirdPlace?.score).toBe(14);
    });
  });

  describe("PoolGuessResult", () => {
    it("open sweepstakes", () => {
      const groupSweepstake = new GroupListSweepstake(
        "swG",
        "Group Sweepstake",
        "Desc",
        waitingGroupListChampionship,
        groupScorePolicy,
      );
      const cupSweepstake = new CupSweepstake(
        "swC",
        "Cup Sweepstake",
        "Desc",
        waitingCupChampionship,
        cupScorePolicy,
      );
      const poolSweepstake = new PoolSweepstake(
        "swP",
        "Pool Sweepstake",
        "Subtitle",
        "Desc",
        [
          { kind: "group", sweepstake: groupSweepstake, factor: 1 },
          { kind: "cup", sweepstake: cupSweepstake, factor: 1 },
        ],
      );

      const poolGuess = new PoolGuess(user.id(), poolSweepstake.id, [
        { kind: "group", groupGuess: groupGuess },
        { kind: "cup", cupGuess: cupGuess },
      ]);

      const result = new PoolGuessResult(poolSweepstake, poolGuess, user);

      expect(result.subResultList).toHaveLength(2);
      expect(result.score).toBeNull();
    });

    it("finished championships", () => {
      const groupSweepstake = new GroupListSweepstake(
        "swG",
        "Group Sweepstake",
        "Desc",
        finishedGroupListChampionship,
        groupScorePolicy,
      );
      const cupSweepstake = new CupSweepstake(
        "swC",
        "Cup Sweepstake",
        "Desc",
        finishedCupChampionship,
        cupScorePolicy,
      );
      const poolSweepstake = new PoolSweepstake(
        "swP",
        "Pool Sweepstake",
        "Subtitle",
        "Desc",
        [
          { kind: "group", sweepstake: groupSweepstake, factor: 1 },
          { kind: "cup", sweepstake: cupSweepstake, factor: 1 },
        ],
      );

      const poolGuess = new PoolGuess(user.id(), poolSweepstake.id, [
        { kind: "group", groupGuess: groupGuess },
        { kind: "cup", cupGuess: cupGuess },
      ]);

      const result = new PoolGuessResult(poolSweepstake, poolGuess, user);

      expect(result.subResultList).toHaveLength(2);
      const groupRes = result.subResultList.find((r) => r.kind === "group");
      const cupRes = result.subResultList.find((r) => r.kind === "cup");

      expect(groupRes).toBeDefined();
      if (groupRes?.kind === "group") {
        expect(groupRes.groupResult.groupList).toHaveLength(2);
        expect(
          groupRes.groupResult.groupList[0]?.classification[0]?.score,
        ).toBe(20);
      }

      expect(cupRes).toBeDefined();
      if (cupRes?.kind === "cup") {
        expect(cupRes.cupResult.root.elem.team).toBe(c1);
        expect(cupRes.cupResult.root.elem.score).toBe(20);
      }
      expect(result.score).toBe(74);
    });
  });
});
