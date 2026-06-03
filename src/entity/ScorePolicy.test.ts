import { describe, it } from "node:test";
import assert from "node:assert";
import {
  ScorePolicyBuilder,
  InverseProbabilityPositionScorePolicy,
  InverseProbabilityQualifiedPositionGroupListScorePolicy,
  WithLogarithm2GroupScorePolicy,
  WithLogarithm2CupScorePolicy,
} from "./ScorePolicy.ts";

describe("ScorePolicyBuilder", () => {
  describe("buildGroupListScorePolicyFromId", () => {
    it("should build an InverseProbabilityPositionScorePolicy for 'inverse-probability-position'", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "inverse-probability-position",
      );
      assert.ok(policy instanceof InverseProbabilityPositionScorePolicy);
    });

    it("should build an InverseProbabilityQualifiedPositionGroupListScorePolicy for 'inverse-probability-qualified-position'", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "inverse-probability-qualified-position",
      );
      assert.ok(
        policy instanceof
          InverseProbabilityQualifiedPositionGroupListScorePolicy,
      );
    });

    it("should build a WithLogarithm2GroupScorePolicy wrapping InverseProbabilityPositionScorePolicy for 'log2(inverse-probability-position)'", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "log2(inverse-probability-position)",
      );
      assert.ok(policy instanceof WithLogarithm2GroupScorePolicy);
      assert.ok(
        policy.scorePolicy instanceof InverseProbabilityPositionScorePolicy,
      );
    });

    it("should build a WithLogarithm2GroupScorePolicy wrapping InverseProbabilityQualifiedPositionGroupListScorePolicy for 'log2(inverse-probability-qualified-position'", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "log2(inverse-probability-qualified-position",
      );
      assert.ok(policy instanceof WithLogarithm2GroupScorePolicy);
      assert.ok(
        policy.scorePolicy instanceof
          InverseProbabilityQualifiedPositionGroupListScorePolicy,
      );
    });

    it("should recursively build nested log2 policies", () => {
      const policy = ScorePolicyBuilder.buildGroupListScorePolicyFromId(
        "log2(log2(inverse-probability-position))",
      );
      assert.ok(policy instanceof WithLogarithm2GroupScorePolicy);
      const wrapped = policy.scorePolicy;
      assert.ok(wrapped instanceof WithLogarithm2GroupScorePolicy);
      assert.ok(
        wrapped.scorePolicy instanceof InverseProbabilityPositionScorePolicy,
      );
    });

    it("should throw an error for unknown GroupListScorePolicy IDs", () => {
      assert.throws(() => {
        ScorePolicyBuilder.buildGroupListScorePolicyFromId("invalid-policy");
      }, /Unknown GroupListScorePolicy ID/);
    });
  });

  describe("buildCupScorePolicyFromId", () => {
    it("should build an InverseProbabilityPositionScorePolicy for 'inverse-probability-position'", () => {
      const policy = ScorePolicyBuilder.buildCupScorePolicyFromId(
        "inverse-probability-position",
      );
      assert.ok(policy instanceof InverseProbabilityPositionScorePolicy);
    });

    it("should build a WithLogarithm2CupScorePolicy wrapping InverseProbabilityPositionScorePolicy for 'log2(inverse-probability-position)'", () => {
      const policy = ScorePolicyBuilder.buildCupScorePolicyFromId(
        "log2(inverse-probability-position)",
      );
      assert.ok(policy instanceof WithLogarithm2CupScorePolicy);
      assert.ok(
        policy.scorePolicy instanceof InverseProbabilityPositionScorePolicy,
      );
    });

    it("should throw an error for 'inverse-probability-qualified-position' as it is group-list only", () => {
      assert.throws(() => {
        ScorePolicyBuilder.buildCupScorePolicyFromId(
          "inverse-probability-qualified-position",
        );
      }, /Unknown CupScorePolicy ID/);
    });

    it("should throw an error for unknown CupScorePolicy IDs", () => {
      assert.throws(() => {
        ScorePolicyBuilder.buildCupScorePolicyFromId("invalid-policy");
      }, /Unknown CupScorePolicy ID/);
    });
  });
});
