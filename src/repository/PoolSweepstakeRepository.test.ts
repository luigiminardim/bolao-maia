import { FilePoolSweepstakeRepository } from "./PoolSweepstakeRepository";
import { PoolSweepstake, GroupListSweepstake } from "../entity/Sweepstake";
import { GroupListChampionship } from "../entity/Championship";
import { GroupListChampionshipRepository } from "./GroupListChampionshipRepository";
import { CupChampionshipRepository } from "./CupChampionshipRepository";
import {
  InverseProbabilityQualifiedPositionGroupListScorePolicy,
  WithLogarithm2GroupScorePolicy,
} from "../entity/ScorePolicy";
import { JsonStorage } from "../infra/JsonStorage";

describe("FilePoolSweepstakeRepository", () => {
  let mockStorage: jest.Mocked<JsonStorage>;
  let mockGroupListChampionshipRepository: jest.Mocked<GroupListChampionshipRepository>;
  let mockCupChampionshipRepository: jest.Mocked<CupChampionshipRepository>;
  let poolSweepstakeRepository: FilePoolSweepstakeRepository;

  beforeEach(() => {
    mockStorage = {
      save: jest.fn(),
      load: jest.fn(),
    } as unknown as jest.Mocked<JsonStorage>;

    mockGroupListChampionshipRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<GroupListChampionshipRepository>;

    mockCupChampionshipRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<CupChampionshipRepository>;

    poolSweepstakeRepository = new FilePoolSweepstakeRepository(
      mockStorage,
      mockGroupListChampionshipRepository,
      mockCupChampionshipRepository,
    );
  });

  describe("save", () => {
    it("should map PoolSweepstake to PoolSweepstakeDao and call save on storage", async () => {
      const groupChampionship = new GroupListChampionship(
        "2026-world-cup",
        "Test Group List",
        [],
        [],
        2,
        new Date("2026-06-11T12:00:00.000Z"),
      );
      const groupScorePolicy =
        new InverseProbabilityQualifiedPositionGroupListScorePolicy();
      const groupSweepstake = new GroupListSweepstake(
        "2026-world-cup",
        "Test Group Sweepstake",
        "Test Description",
        groupChampionship,
        groupScorePolicy,
      );

      const subSweepstakeList = [
        { kind: "group" as const, sweepstake: groupSweepstake, factor: 1 },
      ];

      const poolSweepstake = new PoolSweepstake(
        "2026-world-cup",
        "Test Pool",
        "Test Subtitle",
        "Test Description",
        subSweepstakeList,
      );

      await poolSweepstakeRepository.save(poolSweepstake);

      expect(mockStorage.save).toHaveBeenCalledTimes(1);
      expect(mockStorage.save).toHaveBeenCalledWith(
        "/sweepstake/PoolSweepstake/2026-world-cup",
        {
          id: "2026-world-cup",
          name: "Test Pool",
          subtitle: "Test Subtitle",
          description: "Test Description",
          subSweepstakeList: [
            {
              kind: "group",
              sweepstake: {
                id: "2026-world-cup",
                name: "Test Group Sweepstake",
                description: "Test Description",
                championship: "2026-world-cup",
                scorePolicy: "inverse-probability-qualified-position",
              },
              factor: 1,
            },
          ],
        },
      );
    });
  });

  describe("findById", () => {
    it("should return null if the storage returns null", async () => {
      mockStorage.load.mockResolvedValueOnce(null);
      const result = await poolSweepstakeRepository.findById("some-id");
      expect(result).toBeNull();
    });

    it("should map dao to entity when loaded from storage", async () => {
      const mockDao = {
        id: "2026-world-cup",
        subSweepstakeList: [
          {
            kind: "group",
            factor: 1,
            sweepstake: {
              id: "2026-world-cup",
              championship: "2026-world-cup",
              scorePolicy:
                "with-logarithm-2:inverse-probability-qualified-position",
            },
          },
        ],
      };
      mockStorage.load.mockResolvedValueOnce(mockDao);

      const groupChampionship = new GroupListChampionship(
        "2026-world-cup",
        "Test Group List",
        [],
        [],
        2,
        new Date("2026-06-11T12:00:00.000Z"),
      );
      mockGroupListChampionshipRepository.findById.mockResolvedValueOnce(
        groupChampionship,
      );

      const result = await poolSweepstakeRepository.findById("2026-world-cup");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("2026-world-cup");
      expect(result!.subSweepstakeList).toHaveLength(1);

      const item = result!.subSweepstakeList[0];
      expect(item.kind).toBe("group");
      expect(item.factor).toBe(1);
      expect(item.sweepstake).toBeInstanceOf(GroupListSweepstake);

      const groupSweep = item.sweepstake as GroupListSweepstake;
      expect(groupSweep.id).toBe("2026-world-cup");
      expect(groupSweep.championship).toBe(groupChampionship);
      expect(groupSweep.scorePolicy).toBeInstanceOf(
        WithLogarithm2GroupScorePolicy,
      );
      expect(
        (groupSweep.scorePolicy as WithLogarithm2GroupScorePolicy).scorePolicy,
      ).toBeInstanceOf(InverseProbabilityQualifiedPositionGroupListScorePolicy);

      expect(mockGroupListChampionshipRepository.findById).toHaveBeenCalledWith(
        "2026-world-cup",
      );
    });
  });
});
