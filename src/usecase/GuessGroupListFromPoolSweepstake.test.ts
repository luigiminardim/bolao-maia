import { GuessGroupListFromPoolSweepstake } from "./GuessGroupListFromPoolSweepstake";
import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { TeamRepository } from "../repository/TeamRepository";
import { Team } from "../entity/Team";
import { PoolGuess, GroupListGuess } from "../entity/Guess";

describe("GuessGroupListFromPoolSweepstake", () => {
  let poolGuessRepository: jest.Mocked<PoolGuessRepository>;
  let teamRepository: jest.Mocked<TeamRepository>;
  let usecase: GuessGroupListFromPoolSweepstake;
  const userId = "luigi mario";

  beforeEach(() => {
    poolGuessRepository = {
      save: jest.fn(),
      findByUserAndSweepstake: jest.fn(),
      findByUser: jest.fn(),
      findBySweepstake: jest.fn(),
    } as unknown as jest.Mocked<PoolGuessRepository>;

    teamRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<TeamRepository>;

    usecase = new GuessGroupListFromPoolSweepstake(
      poolGuessRepository,
      teamRepository,
    );
  });

  it("should create a new PoolGuess and add GroupListGuess when no existing PoolGuess is found", async () => {
    poolGuessRepository.findByUserAndSweepstake.mockResolvedValueOnce(null);

    const teamA = new Team("br", "Brazil");
    const teamB = new Team("ar", "Argentina");
    teamRepository.findById.mockImplementation((id) => {
      if (id === "br") return Promise.resolve(teamA);
      if (id === "ar") return Promise.resolve(teamB);
      return Promise.resolve(null);
    });

    const params = {
      poolSweepstake: "pool-1",
      groupListSweepstake: "group-list-1",
      groupGuesses: [{ classification: ["br", "ar"] }],
      extraQualifiedListGuess: ["br"],
    };

    await usecase.execute(userId, params);

    expect(poolGuessRepository.findByUserAndSweepstake).toHaveBeenCalledWith(
      "luigi mario",
      "pool-1",
    );

    expect(poolGuessRepository.save).toHaveBeenCalledTimes(1);
    const savedPoolGuess = poolGuessRepository.save.mock.calls[0]![0]!;

    expect(savedPoolGuess.userId).toBe("luigi mario");
    expect(savedPoolGuess.sweepstakeId).toBe("pool-1");
    expect(savedPoolGuess.subGuesses.length).toBe(1);
    expect(savedPoolGuess.subGuesses[0]!.kind).toBe("group");

    if (savedPoolGuess.subGuesses[0]!.kind === "group") {
      const groupGuess = savedPoolGuess.subGuesses[0]!.groupGuess;
      expect(groupGuess.sweepstakeId).toBe("group-list-1");
      expect(groupGuess.groupGuesses[0]!.classification).toEqual([
        teamA,
        teamB,
      ]);
      expect(groupGuess.extraQualifiedListGuess).toEqual([teamA]);
    }
  });

  it("should add to existing PoolGuess when it exists", async () => {
    const existingPoolGuess = new PoolGuess("luigi%20mario", "pool-1", []);
    poolGuessRepository.findByUserAndSweepstake.mockResolvedValueOnce(
      existingPoolGuess,
    );

    const teamA = new Team("br", "Brazil");
    teamRepository.findById.mockResolvedValue(teamA);

    const params = {
      poolSweepstake: "pool-1",
      groupListSweepstake: "group-list-1",
      groupGuesses: [{ classification: ["br"] }],
      extraQualifiedListGuess: [],
    };

    await usecase.execute(userId, params);

    expect(poolGuessRepository.save).toHaveBeenCalledWith(existingPoolGuess);
    expect(existingPoolGuess.subGuesses.length).toBe(1);
  });

  it("should throw an error if team is not found in classification", async () => {
    poolGuessRepository.findByUserAndSweepstake.mockResolvedValueOnce(null);
    teamRepository.findById.mockResolvedValueOnce(null); // Return null for any team

    const params = {
      poolSweepstake: "pool-1",
      groupListSweepstake: "group-list-1",
      groupGuesses: [{ classification: ["br"] }],
      extraQualifiedListGuess: [],
    };

    await expect(usecase.execute(userId, params)).rejects.toThrow(
      "Team br not found",
    );
    expect(poolGuessRepository.save).not.toHaveBeenCalled();
  });

  it("should throw an error if extra qualified team is not found", async () => {
    poolGuessRepository.findByUserAndSweepstake.mockResolvedValueOnce(null);

    // Team exists for classification, but not for extra qualified
    teamRepository.findById.mockImplementation((id) => {
      if (id === "br") return Promise.resolve(new Team("br", "Brazil"));
      return Promise.resolve(null);
    });

    const params = {
      poolSweepstake: "pool-1",
      groupListSweepstake: "group-list-1",
      groupGuesses: [{ classification: ["br"] }],
      extraQualifiedListGuess: ["ar"],
    };

    await expect(usecase.execute(userId, params)).rejects.toThrow(
      "Team ar not found",
    );
    expect(poolGuessRepository.save).not.toHaveBeenCalled();
  });

  it("should throw an error if trying to overwrite an existing group list guess", async () => {
    const existingGroupListGuess = new GroupListGuess(
      "luigi%20mario",
      "group-list-1",
      [],
      [],
    );
    const existingPoolGuess = new PoolGuess("luigi%20mario", "pool-1", [
      { kind: "group", groupGuess: existingGroupListGuess },
    ]);

    poolGuessRepository.findByUserAndSweepstake.mockResolvedValueOnce(
      existingPoolGuess,
    );

    const params = {
      poolSweepstake: "pool-1",
      groupListSweepstake: "group-list-1",
      groupGuesses: [],
      extraQualifiedListGuess: [],
    };

    await expect(usecase.execute(userId, params)).rejects.toThrow(
      "Guess for group list sweepstake group-list-1 already exists and cannot be overwritten.",
    );
    expect(poolGuessRepository.save).not.toHaveBeenCalled();
  });
});
