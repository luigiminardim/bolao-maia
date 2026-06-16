import {
  GuessCupFromPoolSweepstake,
  GuessCupFromPoolSweepstakeParam,
} from "./GuessCupFromPoolSweepstake";
import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { TeamRepository } from "../repository/TeamRepository";
import { Team } from "../entity/Team";
import { PoolGuess, CupGuess } from "../entity/Guess";
import { BinaryTree } from "../utils/BinaryTree";

describe("GuessCupFromPoolSweepstake", () => {
  let poolGuessRepository: jest.Mocked<PoolGuessRepository>;
  let teamRepository: jest.Mocked<TeamRepository>;
  let usecase: GuessCupFromPoolSweepstake;
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

    usecase = new GuessCupFromPoolSweepstake(
      poolGuessRepository,
      teamRepository,
    );
  });

  it("should create a new PoolGuess and add CupGuess when no existing PoolGuess is found", async () => {
    poolGuessRepository.findByUserAndSweepstake.mockResolvedValueOnce(null);

    const teamA = new Team("br", "Brazil");
    const teamB = new Team("ar", "Argentina");
    teamRepository.findById.mockImplementation((id) => {
      if (id === "br") return Promise.resolve(teamA);
      if (id === "ar") return Promise.resolve(teamB);
      return Promise.resolve(null);
    });

    const params: GuessCupFromPoolSweepstakeParam = {
      poolSweepstake: "pool-1",
      cupSweepstake: "cup-1",
      root: {
        elem: "br",
        children: [
          { elem: "br", children: [null, null] },
          { elem: "ar", children: [null, null] },
        ],
      },
      thirdPlace: "ar",
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
    expect(savedPoolGuess.subGuesses[0]!.kind).toBe("cup");

    if (savedPoolGuess.subGuesses[0]!.kind === "cup") {
      const cupGuess = savedPoolGuess.subGuesses[0]!.cupGuess;
      expect(cupGuess.sweepstakeId).toBe("cup-1");
      expect(cupGuess.thirdPlace).toEqual(teamB);
      expect(cupGuess.root.elem).toEqual(teamA);
    }
  });

  it("should add to existing PoolGuess when it exists", async () => {
    const existingPoolGuess = new PoolGuess("luigi mario", "pool-1", []);
    poolGuessRepository.findByUserAndSweepstake.mockResolvedValueOnce(
      existingPoolGuess,
    );

    const teamA = new Team("br", "Brazil");
    teamRepository.findById.mockResolvedValue(teamA);

    const params: GuessCupFromPoolSweepstakeParam = {
      poolSweepstake: "pool-1",
      cupSweepstake: "cup-1",
      root: { elem: "br", children: [null, null] },
      thirdPlace: null,
    };

    await usecase.execute(userId, params);

    expect(poolGuessRepository.save).toHaveBeenCalledWith(existingPoolGuess);
    expect(existingPoolGuess.subGuesses.length).toBe(1);
  });

  it("should throw an error if trying to overwrite an existing cup sweepstake guess", async () => {
    const teamA = new Team("br", "Brazil");
    const existingCupGuess = new CupGuess(
      "luigi mario",
      "cup-1",
      new BinaryTree<Team>(teamA),
      null,
    );
    const existingPoolGuess = new PoolGuess("luigi mario", "pool-1", [
      { kind: "cup", cupGuess: existingCupGuess },
    ]);

    poolGuessRepository.findByUserAndSweepstake.mockResolvedValueOnce(
      existingPoolGuess,
    );

    const params: GuessCupFromPoolSweepstakeParam = {
      poolSweepstake: "pool-1",
      cupSweepstake: "cup-1",
      root: { elem: "br", children: [null, null] },
      thirdPlace: null,
    };

    await expect(usecase.execute(userId, params)).rejects.toThrow(
      "Guess for cup sweepstake cup-1 already exists and cannot be overwritten.",
    );
    expect(poolGuessRepository.save).not.toHaveBeenCalled();
  });
});
