import { PoolSweepstakeRepository } from "./PoolSweepstakeRepository";
import { PoolSweepstake, GroupListSweepstake } from "../entity/Sweepstake";
import { GroupListChampionship } from "../entity/Championship";
import { GroupListChampionshipRepository } from "./GroupListChampionshipRepository";
import { InverseProbabilityQualifiedPositionGroupListScorePolicy } from "../entity/ScorePolicy";
import { JsonFileStorage } from "../infra/JsonFileStorage";

describe("PoolSweepstakeRepository", () => {
  let mockStorage: jest.Mocked<JsonFileStorage>;
  let mockGroupListChampionshipRepository: jest.Mocked<GroupListChampionshipRepository>;
  let poolSweepstakeRepository: PoolSweepstakeRepository;

  beforeEach(() => {
    mockStorage = {
      save: jest.fn(),
      load: jest.fn(),
    } as unknown as jest.Mocked<JsonFileStorage>;

    mockGroupListChampionshipRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<GroupListChampionshipRepository>;

    poolSweepstakeRepository = new PoolSweepstakeRepository(
      mockStorage,
      mockGroupListChampionshipRepository,
    );
  });

  describe("save", () => {
    it("should map PoolSweepstake to PoolSweepstakeDao and call save on storage", async () => {
      const groupChampionship = new GroupListChampionship("2026-world-cup", [], [], 2);
      const groupScorePolicy = new InverseProbabilityQualifiedPositionGroupListScorePolicy();
      const groupSweepstake = new GroupListSweepstake(
        "2026-world-cup",
        groupChampionship,
        groupScorePolicy,
        new Date("2026-06-11T12:00:00.000Z"),
      );

      const subSweepstakeList = [
        { kind: "group" as const, sweepstake: groupSweepstake, factor: 1 },
      ];

      const poolSweepstake = new PoolSweepstake("2026-world-cup", subSweepstakeList);

      await poolSweepstakeRepository.save(poolSweepstake);

      expect(mockStorage.save).toHaveBeenCalledTimes(1);
      expect(mockStorage.save).toHaveBeenCalledWith(
        "/sweepstake/PoolSweepstake/2026-world-cup",
        {
          id: "2026-world-cup",
          subSweepstakeList: [
            {
              kind: "group",
              sweepstake: {
                id: "2026-world-cup",
                championship: "2026-world-cup",
                scorePolicy: "inverse-probability-qualified-position",
                startTime: "2026-06-11T12:00:00.000Z",
              },
              factor: 1,
            },
          ],
        },
      );
    });
  });

  describe("findById", () => {
    it("should return null if the id is not 2026-world-cup", async () => {
      const result = await poolSweepstakeRepository.findById("some-other-id");
      expect(result).toBeNull();
      expect(mockGroupListChampionshipRepository.findById).not.toHaveBeenCalled();
    });

    it("should return the default 2026-world-cup pool sweepstake if the id matches", async () => {
      const groupChampionship = new GroupListChampionship("2026-world-cup", [], [], 2);
      mockGroupListChampionshipRepository.findById.mockResolvedValueOnce(groupChampionship);

      const result = await poolSweepstakeRepository.findById("2026-world-cup");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("2026-world-cup");
      expect(result!.subSweepstakeList).toHaveLength(1);

      const item = result!.subSweepstakeList[0];
      expect(item.kind).toBe("group");
      expect(item.factor).toBe(1);
      expect(item.sweepstake).toBeInstanceOf(GroupListSweepstake);

      const groupSweep = item.sweepstake;
      expect(groupSweep.id).toBe("2026-world-cup");
      expect(groupSweep.championship).toBe(groupChampionship);
      expect(groupSweep.scorePolicy).toBeInstanceOf(InverseProbabilityQualifiedPositionGroupListScorePolicy);
      expect(groupSweep.startTime).toEqual(new Date("2026-06-11T12:00:00.000Z"));

      expect(mockGroupListChampionshipRepository.findById).toHaveBeenCalledWith("2026-world-cup");
    });
  });
});
