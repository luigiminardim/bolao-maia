import { PoolGuessRepository } from "./PoolGuessRepository";
import {
  PoolGuess,
  GroupListGuess,
  GroupGuess,
  CupGuess,
} from "../entity/Guess";
import { Team } from "../entity/Team";
import { BinaryTree } from "../utils/BinaryTree";
import { JsonStorage } from "../infra/JsonStorage";
import { TeamRepository } from "./TeamRepository";

describe("PoolGuessRepository", () => {
  let mockStorage: jest.Mocked<JsonStorage>;
  let mockTeamRepository: jest.Mocked<TeamRepository>;
  let repository: PoolGuessRepository;

  const teamBrazil = new Team("brazil", "Brazil");
  const teamArgentina = new Team("argentina", "Argentina");

  beforeEach(() => {
    mockStorage = {
      save: jest.fn(),
      load: jest.fn(),
      listIds: jest.fn(),
    } as unknown as jest.Mocked<JsonStorage>;

    mockTeamRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<TeamRepository>;

    mockTeamRepository.findById.mockImplementation(async (id: string) => {
      if (id === "brazil") return teamBrazil;
      if (id === "argentina") return teamArgentina;
      return null;
    });

    repository = new PoolGuessRepository(mockStorage, mockTeamRepository);
  });

  const groupGuess = new GroupGuess([teamBrazil, teamArgentina]);
  const groupListGuess = new GroupListGuess(
    "user@test.com",
    "group-sweep",
    [groupGuess],
    [teamBrazil],
  );
  const cupGuess = new CupGuess(
    "user@test.com",
    "cup-sweep",
    new BinaryTree<Team>(teamBrazil, [null, null]),
    teamArgentina,
  );
  const poolGuess = new PoolGuess("user@test.com", "pool-sweep", [
    { kind: "group", groupGuess: groupListGuess },
    { kind: "cup", cupGuess: cupGuess },
  ]);

  describe("save", () => {
    it("should correctly serialize and save PoolGuess", async () => {
      await repository.save(poolGuess);

      expect(mockStorage.save).toHaveBeenCalledTimes(1);
      const expectedId =
        "/sweepstake/PoolGuess/user=user%40test.com&sweepstake=pool-sweep";
      expect(mockStorage.save).toHaveBeenCalledWith(expectedId, {
        userId: "user@test.com",
        sweepstakeId: "pool-sweep",
        subGuesses: [
          {
            kind: "group",
            groupGuess: {
              userId: "user@test.com",
              sweepstakeId: "group-sweep",
              groupGuesses: [
                {
                  classification: ["brazil", "argentina"],
                },
              ],
              extraQualifiedListGuess: ["brazil"],
            },
          },
          {
            kind: "cup",
            cupGuess: {
              userId: "user@test.com",
              sweepstakeId: "cup-sweep",
              root: {
                elem: "brazil",
                children: [null, null],
              },
              thirdPlace: "argentina",
            },
          },
        ],
      });
    });
  });

  describe("findByUserAndSweepstake", () => {
    it("should load and correctly deserialize PoolGuess", async () => {
      const dao = {
        userId: "user@test.com",
        sweepstakeId: "pool-sweep",
        subGuesses: [
          {
            kind: "group" as const,
            groupGuess: {
              userId: "user@test.com",
              sweepstakeId: "group-sweep",
              groupGuesses: [
                {
                  classification: ["brazil", "argentina"],
                },
              ],
              extraQualifiedListGuess: ["brazil"],
            },
          },
          {
            kind: "cup" as const,
            cupGuess: {
              userId: "user@test.com",
              sweepstakeId: "cup-sweep",
              root: {
                elem: "brazil",
                children: [null, null] as [null, null],
              },
              thirdPlace: "argentina",
            },
          },
        ],
      };

      mockStorage.load.mockResolvedValueOnce(dao);

      const result = await repository.findByUserAndSweepstake(
        "user@test.com",
        "pool-sweep",
      );

      expect(result).not.toBeNull();
      expect(result!.userId).toBe("user@test.com");
      expect(result!.sweepstakeId).toBe("pool-sweep");
      expect(result!.subGuesses).toHaveLength(2);

      const sub1 = result!.subGuesses[0]!;
      expect(sub1.kind).toBe("group");
      if (sub1.kind === "group") {
        expect(sub1.groupGuess.userId).toBe("user@test.com");
        expect(sub1.groupGuess.sweepstakeId).toBe("group-sweep");
        expect(sub1.groupGuess.groupGuesses).toHaveLength(1);
        expect(sub1.groupGuess.groupGuesses[0]!.classification).toEqual([
          teamBrazil,
          teamArgentina,
        ]);
        expect(sub1.groupGuess.extraQualifiedListGuess).toEqual([teamBrazil]);
      }

      const sub2 = result!.subGuesses[1]!;
      expect(sub2.kind).toBe("cup");
      if (sub2.kind === "cup") {
        expect(sub2.cupGuess.userId).toBe("user@test.com");
        expect(sub2.cupGuess.sweepstakeId).toBe("cup-sweep");
        expect(sub2.cupGuess.root.elem).toBe(teamBrazil);
        expect(sub2.cupGuess.thirdPlace).toBe(teamArgentina);
      }
    });

    it("should return null if file not found", async () => {
      mockStorage.load.mockResolvedValueOnce(null);
      const result = await repository.findByUserAndSweepstake(
        "user@test.com",
        "pool-sweep",
      );
      expect(result).toBeNull();
    });
  });

  describe("findByUser", () => {
    it("should use listIds and filter by user prefix to return user guesses", async () => {
      mockStorage.listIds.mockResolvedValueOnce([
        "/sweepstake/PoolGuess/user=user%40test.com&sweepstake=sweep-1",
        "/sweepstake/PoolGuess/user=user%40test.com&sweepstake=sweep-2",
      ]);

      const dao1 = {
        userId: "user@test.com",
        sweepstakeId: "sweep-1",
        subGuesses: [],
      };
      const dao2 = {
        userId: "user@test.com",
        sweepstakeId: "sweep-2",
        subGuesses: [],
      };

      mockStorage.load.mockResolvedValueOnce(dao1);
      mockStorage.load.mockResolvedValueOnce(dao2);

      const results = await repository.findByUser("user@test.com");

      expect(results).toHaveLength(2);
      expect(results[0]!.sweepstakeId).toBe("sweep-1");
      expect(results[1]!.sweepstakeId).toBe("sweep-2");
      expect(mockStorage.listIds).toHaveBeenCalledTimes(1);
      expect(mockStorage.listIds).toHaveBeenCalledWith(
        "/sweepstake/PoolGuess",
        expect.any(Function),
      );

      // Verify the filter logic works
      const filterFn = mockStorage.listIds.mock.calls[0]![1] as (
        filename: string,
      ) => boolean;
      expect(filterFn("user=user%40test.com&sweepstake=sweep-1.json")).toBe(
        true,
      );
      expect(filterFn("user=other%40test.com&sweepstake=sweep-1.json")).toBe(
        false,
      );
    });
  });

  describe("findBySweepstake", () => {
    it("should use listIds and filter by sweepstake suffix to return sweepstake guesses", async () => {
      mockStorage.listIds.mockResolvedValueOnce([
        "/sweepstake/PoolGuess/user=user1%40test.com&sweepstake=sweep-1",
        "/sweepstake/PoolGuess/user=user2%40test.com&sweepstake=sweep-1",
      ]);

      const dao1 = {
        userId: "user1@test.com",
        sweepstakeId: "sweep-1",
        subGuesses: [],
      };
      const dao2 = {
        userId: "user2@test.com",
        sweepstakeId: "sweep-1",
        subGuesses: [],
      };

      mockStorage.load.mockResolvedValueOnce(dao1);
      mockStorage.load.mockResolvedValueOnce(dao2);

      const results = await repository.findBySweepstake("sweep-1");

      expect(results).toHaveLength(2);
      expect(results[0]!.userId).toBe("user1@test.com");
      expect(results[1]!.userId).toBe("user2@test.com");
      expect(mockStorage.listIds).toHaveBeenCalledTimes(1);
      expect(mockStorage.listIds).toHaveBeenCalledWith(
        "/sweepstake/PoolGuess",
        expect.any(Function),
      );

      // Verify the filter logic works
      const filterFn = mockStorage.listIds.mock.calls[0]![1] as (
        filename: string,
      ) => boolean;
      expect(filterFn("user=user1%40test.com&sweepstake=sweep-1.json")).toBe(
        true,
      );
      expect(filterFn("user=user1%40test.com&sweepstake=sweep-2.json")).toBe(
        false,
      );
    });
  });
});
