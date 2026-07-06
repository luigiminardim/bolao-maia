import { GetPoolGuessListUsecase } from "./GetPoolGuessListUsecase";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { UserRepository } from "../repository/UserRepository";
import { PoolSweepstake } from "../entity/Sweepstake";
import { PoolGuess } from "../entity/Guess";
import { User } from "../entity/User";

describe("GetPoolGuessListUsecase", () => {
  let poolSweepstakeRepository: jest.Mocked<PoolSweepstakeRepository>;
  let poolGuessRepository: jest.Mocked<PoolGuessRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let usecase: GetPoolGuessListUsecase;

  beforeEach(() => {
    poolSweepstakeRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<PoolSweepstakeRepository>;
    poolGuessRepository = {
      findBySweepstake: jest.fn(),
    } as unknown as jest.Mocked<PoolGuessRepository>;
    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    usecase = new GetPoolGuessListUsecase(
      poolSweepstakeRepository,
      poolGuessRepository,
      userRepository,
    );
  });

  it("should return null if the pool sweepstake does not exist", async () => {
    poolSweepstakeRepository.findById.mockResolvedValue(null);

    const result = await usecase.execute("pool-id");

    expect(result).toBeNull();
    expect(poolGuessRepository.findBySweepstake).not.toHaveBeenCalled();
  });

  it("should return an empty array if there are no guesses", async () => {
    poolSweepstakeRepository.findById.mockResolvedValue({
      id: "pool-id",
    } as PoolSweepstake);
    poolGuessRepository.findBySweepstake.mockResolvedValue([]);

    const result = await usecase.execute("pool-id");

    expect(result).toEqual([]);
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it("should return a list of PoolGuessDto when guesses exist", async () => {
    const mockSweepstake = {
      id: "pool-id",
      getGroupListSweepstakeById: jest.fn().mockReturnValue(null),
    } as unknown as PoolSweepstake;

    const mockGuess = {
      userId: "user-id",
      sweepstakeId: "pool-id",
      subGuesses: [
        {
          kind: "cup",
          cupGuess: {
            userId: "user-id",
            sweepstakeId: "cup-id",
            root: { elem: { id: "br", name: "Brazil" }, children: [] },
            thirdPlace: null,
            teamPosition: jest.fn(),
          },
        },
      ],
    } as unknown as PoolGuess;

    const mockUser = new User("Alice");

    poolSweepstakeRepository.findById.mockResolvedValue(mockSweepstake);
    poolGuessRepository.findBySweepstake.mockResolvedValue([mockGuess]);
    userRepository.findById.mockResolvedValue(mockUser);

    const result = await usecase.execute("pool-id");

    expect(result).not.toBeNull();
    const firstResult = result?.[0];
    expect(firstResult).toBeDefined();
    if (firstResult) {
      expect(firstResult.sweepstakeId).toBe("pool-id");
      expect(firstResult.user.name).toBe("Alice");
      expect(firstResult.user.id).toBe("Alice");
    }
  });
});
