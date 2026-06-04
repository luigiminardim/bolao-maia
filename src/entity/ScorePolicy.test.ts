import {
  ScorePolicyBuilder,
  InverseProbabilityPositionScorePolicy,
  InverseProbabilityQualifiedPositionGroupListScorePolicy,
  WithLogarithm2GroupScorePolicy,
  WithLogarithm2CupScorePolicy,
} from "./ScorePolicy";

describe("ScorePolicyBuilder", () => {
  describe("buildGroupListScorePolicyFromId", () => {
    it("should build an InverseProbabilityPositionScorePolicy for 'inverse-probability-position'", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "inverse-probability-position",
      );
      expect(policy).toBeInstanceOf(InverseProbabilityPositionScorePolicy);
    });

    it("should build an InverseProbabilityQualifiedPositionGroupListScorePolicy for 'inverse-probability-qualified-position'", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "inverse-probability-qualified-position",
      );
      expect(policy).toBeInstanceOf(
        InverseProbabilityQualifiedPositionGroupListScorePolicy,
      );
    });

    it("should build a WithLogarithm2GroupScorePolicy wrapping InverseProbabilityPositionScorePolicy for 'log2(inverse-probability-position)'", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "log2(inverse-probability-position)",
      ) as WithLogarithm2GroupScorePolicy;
      expect(policy).toBeInstanceOf(WithLogarithm2GroupScorePolicy);
      expect(policy.scorePolicy).toBeInstanceOf(
        InverseProbabilityPositionScorePolicy,
      );
    });

    it("should build a WithLogarithm2GroupScorePolicy wrapping InverseProbabilityQualifiedPositionGroupListScorePolicy for 'log2(inverse-probability-qualified-position'", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "log2(inverse-probability-qualified-position",
      ) as WithLogarithm2GroupScorePolicy;
      expect(policy).toBeInstanceOf(WithLogarithm2GroupScorePolicy);
      expect(policy.scorePolicy).toBeInstanceOf(
        InverseProbabilityQualifiedPositionGroupListScorePolicy,
      );
    });

    it("should recursively build nested log2 policies", () => {
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

    it("should throw an error for unknown GroupListScorePolicy IDs", () => {
      expect(() => {
        ScorePolicyBuilder.buildGroupListScorePolicyFromId("invalid-policy");
      }).toThrow(/Unknown GroupListScorePolicy ID/);
    });
  });

  describe("buildCupScorePolicyFromId", () => {
    it("should build an InverseProbabilityPositionScorePolicy for 'inverse-probability-position'", () => {
      const policy = ScorePolicyBuilder.buildCupScorePolicyFromId(
        "inverse-probability-position",
      );
      expect(policy).toBeInstanceOf(InverseProbabilityPositionScorePolicy);
    });

    it("should build a WithLogarithm2CupScorePolicy wrapping InverseProbabilityPositionScorePolicy for 'log2(inverse-probability-position)'", () => {
      const policy = ScorePolicyBuilder.buildCupScorePolicyFromId(
        "log2(inverse-probability-position)",
      ) as WithLogarithm2CupScorePolicy;
      expect(policy).toBeInstanceOf(WithLogarithm2CupScorePolicy);
      expect(policy.scorePolicy).toBeInstanceOf(
        InverseProbabilityPositionScorePolicy,
      );
    });

    it("should throw an error for 'inverse-probability-qualified-position' as it is group-list only", () => {
      expect(() => {
        ScorePolicyBuilder.buildCupScorePolicyFromId(
          "inverse-probability-qualified-position",
        );
      }).toThrow(/Unknown CupScorePolicy ID/);
    });

    it("should throw an error for unknown CupScorePolicy IDs", () => {
      expect(() => {
        ScorePolicyBuilder.buildCupScorePolicyFromId("invalid-policy");
      }).toThrow(/Unknown CupScorePolicy ID/);
    });
  });
});
