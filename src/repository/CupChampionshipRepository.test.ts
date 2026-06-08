import { FileCupChampionshipRepository } from "./CupChampionshipRepository";
import { CupChampionship } from "../entity/Championship";
import { Team } from "../entity/Team";
import { TeamRepository } from "./TeamRepository";
import { JsonStorage } from "../infra/JsonStorage";
import { BinaryTree } from "../utils/BinaryTree";

describe("FileCupChampionshipRepository", () => {
  let mockStorage: jest.Mocked<JsonStorage>;
  let mockTeamRepository: jest.Mocked<TeamRepository>;
  let cupRepository: FileCupChampionshipRepository;

  beforeEach(() => {
    mockStorage = {
      save: jest.fn(),
      load: jest.fn(),
    } as unknown as jest.Mocked<JsonStorage>;

    mockTeamRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<TeamRepository>;

    cupRepository = new FileCupChampionshipRepository(
      mockStorage,
      mockTeamRepository,
    );
  });

  describe("save", () => {
    it("should map CupChampionship to CupChampionshipDao and call save on storage", async () => {
      const brazil = new Team("brazil", "Brazil");
      const root = new BinaryTree<Team | null>(brazil, [null, null]);
      const cup = new CupChampionship(
        "2026-world-cup",
        root,
        true,
        null,
        new Date("2026-06-11T12:00:00.000Z"),
      );

      await cupRepository.save(cup);

      expect(mockStorage.save).toHaveBeenCalledTimes(1);
      expect(mockStorage.save).toHaveBeenCalledWith(
        "/sweepstake/CupChampionship/2026-world-cup",
        {
          id: "2026-world-cup",
          root: { elem: "brazil", children: [null, null] },
          hasThirdPlaceMatch: true,
          thirdPlace: null,
          startDate: "2026-06-11T12:00:00.000Z",
        },
      );
    });
  });

  describe("findById", () => {
    it("should return null if the id is not 2026-world-cup", async () => {
      const result = await cupRepository.findById("some-other-id");
      expect(result).toBeNull();
    });

    it("should map dao to entity for the mock 2026-world-cup", async () => {
      // For 2026-world-cup, it bypasses storage and uses the mock DAO
      const result = await cupRepository.findById("2026-world-cup");

      expect(result).not.toBeNull();
      expect(result!.getId()).toBe("2026-world-cup");
      expect(result!.hasThirdPlaceMatch).toBe(true);
      expect(result!.thirdPlace).toBeNull();
      expect(result!.getStartDate()).toEqual(new Date("2026-06-11T12:00:00.000Z"));
      expect(result!.root).toBeInstanceOf(BinaryTree);
      
      // Check that it's an empty tree of height 5 with exactly 32 null leaves
      expect(result!.root.numLeafs()).toBe(32);
      expect(result!.root.listLeaf().every((l) => l === null)).toBe(true);
    });
  });
});
