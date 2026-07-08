import {
  ConstScorePolicy,
  PositionInverseProbabilityScorePolicy,
  QualifiedInverseProbabilityScorePolicy,
  MaxScorePolicy,
  WithLogarithm2ScorePolicy,
  MultScorePolicy,
  FloorScorePolicy,
  FilterQualifiedScorePolicy,
  ScorePolicyBuilder,
} from "./ScorePolicy";

describe("ConstScorePolicy", () => {
  describe("getId", () => {
    it("returns the correct ID format", () => {
      const policy = new ConstScorePolicy(42);
      expect(policy.getId()).toBe("const(42)");
    });
  });

  describe("groupListTeamScore", () => {
    it("returns the constant score regardless of params", () => {
      const policy = new ConstScorePolicy(42);
      expect(
        policy.groupListTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          teamQualified: true,
          guessQualified: true,
          groupNumTeams: 4,
          groupNumQualified: 2,
          championshipNumQualified: 16,
          championshipNumTeams: 32,
        }),
      ).toBe(42);
    });
  });

  describe("cupTeamScore", () => {
    it("returns the constant score regardless of params", () => {
      const policy = new ConstScorePolicy(42);
      expect(
        policy.cupTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          championshipNumTeams: 32,
        }),
      ).toBe(42);
    });
  });
});

describe("PositionInverseProbabilityScorePolicy", () => {
  describe("getId", () => {
    it("returns the correct ID format", () => {
      const policy = new PositionInverseProbabilityScorePolicy();
      expect(policy.getId()).toBe("position-inverse-probability");
    });
  });

  describe("groupListTeamScore", () => {
    it("returns min score (1) if worst position is max teams", () => {
      const policy = new PositionInverseProbabilityScorePolicy();
      expect(
        policy.groupListTeamScore({
          teamPosition: 4,
          guessPosition: 4,
          teamQualified: false,
          guessQualified: false,
          groupNumTeams: 4,
          groupNumQualified: 2,
          championshipNumQualified: 16,
          championshipNumTeams: 32,
        }),
      ).toBe(1); // 4/4 = 1
    });

    it("returns correct N/worstPosition", () => {
      const policy = new PositionInverseProbabilityScorePolicy();
      expect(
        policy.groupListTeamScore({
          teamPosition: 1,
          guessPosition: 2, // worst is 2
          teamQualified: true,
          guessQualified: true,
          groupNumTeams: 4,
          groupNumQualified: 2,
          championshipNumQualified: 16,
          championshipNumTeams: 32,
        }),
      ).toBe(2); // 4/2 = 2
    });
  });

  describe("cupTeamScore", () => {
    it("returns min score (1) if worst position is max teams", () => {
      const policy = new PositionInverseProbabilityScorePolicy();
      expect(
        policy.cupTeamScore({
          teamPosition: 32,
          guessPosition: 32,
          championshipNumTeams: 32,
        }),
      ).toBe(1); // 32/32 = 1
    });

    it("returns correct N/worstPosition", () => {
      const policy = new PositionInverseProbabilityScorePolicy();
      expect(
        policy.cupTeamScore({
          teamPosition: 4, // worst is 4
          guessPosition: 2,
          championshipNumTeams: 32,
        }),
      ).toBe(8); // 32/4 = 8
    });
  });
});

describe("QualifiedInverseProbabilityScorePolicy", () => {
  describe("getId", () => {
    it("returns the correct ID format", () => {
      const policy = new QualifiedInverseProbabilityScorePolicy();
      expect(policy.getId()).toBe("qualified-inverse-probability");
    });
  });

  describe("groupListTeamScore", () => {
    it("returns min threshold when both are qualified", () => {
      const policy = new QualifiedInverseProbabilityScorePolicy();
      // min threshold is 32 / 16 = 2
      expect(
        policy.groupListTeamScore({
          teamPosition: 3,
          guessPosition: 3,
          teamQualified: true,
          guessQualified: true,
          groupNumTeams: 4,
          groupNumQualified: 2,
          championshipNumQualified: 16,
          championshipNumTeams: 32,
        }),
      ).toBe(2);
    });

    it("returns 1 when team is not qualified", () => {
      const policy = new QualifiedInverseProbabilityScorePolicy();
      expect(
        policy.groupListTeamScore({
          teamPosition: 3,
          guessPosition: 3,
          teamQualified: false, // not qualified
          guessQualified: true,
          groupNumTeams: 4,
          groupNumQualified: 2,
          championshipNumQualified: 16,
          championshipNumTeams: 32,
        }),
      ).toBe(1);
    });
  });

  describe("cupTeamScore", () => {
    it("returns 1", () => {
      const policy = new QualifiedInverseProbabilityScorePolicy();
      expect(
        policy.cupTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          championshipNumTeams: 32,
        }),
      ).toBe(1);
    });
  });
});

describe("FilterQualifiedScorePolicy", () => {
  describe("getId", () => {
    it("returns the correct ID format", () => {
      const policy = new FilterQualifiedScorePolicy(new ConstScorePolicy(10));
      expect(policy.getId()).toBe("filter-qualified(const(10))");
    });
  });

  describe("groupListTeamScore", () => {
    it("returns sub-policy score if both qualified", () => {
      const policy = new FilterQualifiedScorePolicy(new ConstScorePolicy(10));
      expect(
        policy.groupListTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          teamQualified: true,
          guessQualified: true,
          groupNumTeams: 4,
          groupNumQualified: 2,
          championshipNumQualified: 16,
          championshipNumTeams: 32,
        }),
      ).toBe(10);
    });

    it("returns 0 if either not qualified", () => {
      const policy = new FilterQualifiedScorePolicy(new ConstScorePolicy(10));
      expect(
        policy.groupListTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          teamQualified: false,
          guessQualified: true,
          groupNumTeams: 4,
          groupNumQualified: 2,
          championshipNumQualified: 16,
          championshipNumTeams: 32,
        }),
      ).toBe(0);
    });
  });
});

describe("MaxScorePolicy", () => {
  describe("getId", () => {
    it("returns the correct ID format including sub-policy IDs", () => {
      const policy = new MaxScorePolicy(
        new ConstScorePolicy(1),
        new ConstScorePolicy(5),
      );
      expect(policy.getId()).toBe("max(const(1), const(5))");
    });
  });

  describe("groupListTeamScore", () => {
    it("returns the max score among the two policies", () => {
      const policy = new MaxScorePolicy(
        new ConstScorePolicy(10),
        new ConstScorePolicy(5),
      );
      expect(
        policy.groupListTeamScore({
          teamPosition: 3,
          guessPosition: 3,
          teamQualified: true,
          guessQualified: true,
          groupNumTeams: 4,
          groupNumQualified: 2,
          championshipNumQualified: 16,
          championshipNumTeams: 32,
        }),
      ).toBe(10);
    });
  });

  describe("cupTeamScore", () => {
    it("returns the max score among the two policies", () => {
      const policy = new MaxScorePolicy(
        new ConstScorePolicy(42),
        new ConstScorePolicy(100),
      );
      expect(
        policy.cupTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          championshipNumTeams: 32,
        }),
      ).toBe(100);
    });
  });
});

describe("WithLogarithm2ScorePolicy", () => {
  describe("getId", () => {
    it("returns the correct ID format including sub-policy ID", () => {
      const policy = new WithLogarithm2ScorePolicy(new ConstScorePolicy(8));
      expect(policy.getId()).toBe("log2(const(8))");
    });
  });

  describe("groupListTeamScore", () => {
    it("returns log2 of the sub-policy score", () => {
      const policy = new WithLogarithm2ScorePolicy(new ConstScorePolicy(8));
      expect(
        policy.groupListTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          teamQualified: true,
          guessQualified: true,
          groupNumTeams: 4,
          groupNumQualified: 2,
          championshipNumQualified: 16,
          championshipNumTeams: 32,
        }),
      ).toBe(3); // log2(8) = 3
    });
  });

  describe("cupTeamScore", () => {
    it("returns log2 of the sub-policy score", () => {
      const policy = new WithLogarithm2ScorePolicy(new ConstScorePolicy(16));
      expect(
        policy.cupTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          championshipNumTeams: 32,
        }),
      ).toBe(4); // log2(16) = 4
    });
  });
});

describe("MultScorePolicy", () => {
  describe("getId", () => {
    it("returns the correct ID format including factor and sub-policy ID", () => {
      const policy = new MultScorePolicy(10, new ConstScorePolicy(5));
      expect(policy.getId()).toBe("mult(10, const(5))");
    });
  });

  describe("groupListTeamScore", () => {
    it("multiplies the sub-policy score by the factor", () => {
      const policy = new MultScorePolicy(10, new ConstScorePolicy(5));
      expect(
        policy.groupListTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          teamQualified: true,
          guessQualified: true,
          groupNumTeams: 4,
          groupNumQualified: 2,
          championshipNumQualified: 16,
          championshipNumTeams: 32,
        }),
      ).toBe(50); // 10 * 5 = 50
    });
  });

  describe("cupTeamScore", () => {
    it("multiplies the sub-policy score by the factor", () => {
      const policy = new MultScorePolicy(3, new ConstScorePolicy(7));
      expect(
        policy.cupTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          championshipNumTeams: 32,
        }),
      ).toBe(21); // 3 * 7 = 21
    });
  });
});

describe("FloorScorePolicy", () => {
  describe("getId", () => {
    it("returns the correct ID format including sub-policy ID", () => {
      const policy = new FloorScorePolicy(new ConstScorePolicy(5.7));
      expect(policy.getId()).toBe("floor(const(5.7))");
    });
  });

  describe("groupListTeamScore", () => {
    it("floors the sub-policy score", () => {
      const policy = new FloorScorePolicy(new ConstScorePolicy(5.7));
      expect(
        policy.groupListTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          teamQualified: true,
          guessQualified: true,
          groupNumTeams: 4,
          groupNumQualified: 2,
          championshipNumQualified: 16,
          championshipNumTeams: 32,
        }),
      ).toBe(5); // Math.floor(5.7) = 5
    });
  });

  describe("cupTeamScore", () => {
    it("floors the sub-policy score", () => {
      const policy = new FloorScorePolicy(new ConstScorePolicy(3.1));
      expect(
        policy.cupTeamScore({
          teamPosition: 1,
          guessPosition: 1,
          championshipNumTeams: 32,
        }),
      ).toBe(3); // Math.floor(3.1) = 3
    });
  });
});

describe("ScorePolicyBuilder", () => {
  describe("build", () => {
    it("builds ConstScorePolicy correctly", () => {
      const policy = ScorePolicyBuilder.build("const(10)");
      expect(policy).toBeInstanceOf(ConstScorePolicy);
      expect(policy.getId()).toBe("const(10)");
    });

    it("builds PositionInverseProbabilityScorePolicy correctly", () => {
      const policy = ScorePolicyBuilder.build("position-inverse-probability");
      expect(policy).toBeInstanceOf(PositionInverseProbabilityScorePolicy);
      expect(policy.getId()).toBe("position-inverse-probability");
    });

    it("builds QualifiedInverseProbabilityScorePolicy correctly", () => {
      const policy = ScorePolicyBuilder.build("qualified-inverse-probability");
      expect(policy).toBeInstanceOf(QualifiedInverseProbabilityScorePolicy);
      expect(policy.getId()).toBe("qualified-inverse-probability");
    });

    it("builds MaxScorePolicy correctly", () => {
      const policy = ScorePolicyBuilder.build("max(const(10), const(20))");
      expect(policy).toBeInstanceOf(MaxScorePolicy);
      expect(policy.getId()).toBe("max(const(10), const(20))");
      const maxPolicy = policy as MaxScorePolicy;
      expect(maxPolicy.param0).toBeInstanceOf(ConstScorePolicy);
      expect(maxPolicy.param1).toBeInstanceOf(ConstScorePolicy);
    });

    it("builds FilterQualifiedScorePolicy correctly", () => {
      const policy = ScorePolicyBuilder.build("filter-qualified(const(10))");
      expect(policy).toBeInstanceOf(FilterQualifiedScorePolicy);
      expect(policy.getId()).toBe("filter-qualified(const(10))");
      expect((policy as FilterQualifiedScorePolicy).subPolicy).toBeInstanceOf(
        ConstScorePolicy,
      );
    });

    it("builds WithLogarithm2ScorePolicy correctly", () => {
      const policy = ScorePolicyBuilder.build("log2(const(10))");
      expect(policy).toBeInstanceOf(WithLogarithm2ScorePolicy);
      expect(policy.getId()).toBe("log2(const(10))");
    });

    it("builds MultScorePolicy correctly", () => {
      const policy = ScorePolicyBuilder.build("mult(10, const(1))");
      expect(policy).toBeInstanceOf(MultScorePolicy);
      expect(policy.getId()).toBe("mult(10, const(1))");
    });

    it("builds FloorScorePolicy correctly", () => {
      const policy = ScorePolicyBuilder.build("floor(const(1))");
      expect(policy).toBeInstanceOf(FloorScorePolicy);
      expect(policy.getId()).toBe("floor(const(1))");
    });

    it("throws error for unknown policy ID", () => {
      expect(() => ScorePolicyBuilder.build("unknown-policy")).toThrow(
        "Unknown ScorePolicy ID: unknown-policy",
      );
    });
  });
});
