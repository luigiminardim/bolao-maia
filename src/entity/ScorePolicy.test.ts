import {
  ScorePolicyBuilder,
  InverseProbabilityPositionScorePolicy,
  InverseProbabilityQualifiedPositionGroupListScorePolicy,
  WithLogarithm2GroupScorePolicy,
  WithLogarithm2CupScorePolicy,
} from "./ScorePolicy";

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

    test("log2(inverse-probability-qualified-position", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "log2(inverse-probability-qualified-position",
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
  });
});
