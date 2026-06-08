import { GetGroupListResultListFromPoolUsecase } from "./GetGroupListResultListFromPoolUsecase";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { PoolSweepstake } from "../entity/Sweepstake";
import { PoolGuess } from "../entity/Guess";
import { PoolGuessResult } from "../entity/GuessResult";
import { UserRepository } from "../repository/UserRepository";
import { User } from "../entity/User";

jest.mock("../entity/GuessResult");

describe("GetGroupListResultListFromPoolUsecase", () => {
  let poolSweepstakeRepository: jest.Mocked<PoolSweepstakeRepository>;
  let poolGuessRepository: jest.Mocked<PoolGuessRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let usecase: GetGroupListResultListFromPoolUsecase;

  beforeEach(() => {
    poolSweepstakeRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<PoolSweepstakeRepository>;
    
    poolGuessRepository = {
      save: jest.fn(),
      findByUserAndSweepstake: jest.fn(),
      findByUser: jest.fn(),
      findBySweepstake: jest.fn(),
    } as unknown as jest.Mocked<PoolGuessRepository>;

    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    usecase = new GetGroupListResultListFromPoolUsecase(
      poolSweepstakeRepository,
      poolGuessRepository,
      userRepository,
    );
  });

  it("should return null if sweepstake is not found", async () => {
    poolSweepstakeRepository.findById.mockResolvedValueOnce(null);

    const result = await usecase.execute("unknown");

    expect(result).toBeNull();
    expect(poolSweepstakeRepository.findById).toHaveBeenCalledWith("unknown");
    expect(poolGuessRepository.findBySweepstake).not.toHaveBeenCalled();
  });

  it("should calculate and return sorted scores for all user guesses", async () => {
    const mockPool = new PoolSweepstake("2026-world-cup", []);
    poolSweepstakeRepository.findById.mockResolvedValueOnce(mockPool);

    const mockGuess1 = new PoolGuess("user1", "2026-world-cup", []);
    const mockGuess2 = new PoolGuess("user2", "2026-world-cup", []);
    poolGuessRepository.findBySweepstake.mockResolvedValueOnce([mockGuess1, mockGuess2]);

    const mockUser1 = new User("user1");
    const mockUser2 = new User("user2");
    userRepository.findById
      .mockResolvedValueOnce(mockUser1)
      .mockResolvedValueOnce(mockUser2);

    const mockResult1 = { user: mockUser1, score: 10, subResultList: [] } as unknown as PoolGuessResult;
    const mockResult2 = { user: mockUser2, score: 20, subResultList: [] } as unknown as PoolGuessResult;

    (PoolGuessResult.fromPoolSweepstake as jest.Mock)
      .mockReturnValueOnce(mockResult1)
      .mockReturnValueOnce(mockResult2);

    const result = await usecase.execute("2026-world-cup");

    // We can't easily import toPoolGuessResultDto here without circular or missing dependencies, so we check the score and user name.
    expect(result).toHaveLength(2);
    expect(result![0].score).toBe(20);
    expect(result![0].user.name).toBe("user2");
    expect(result![1].score).toBe(10);
    expect(result![1].user.name).toBe("user1");
    expect(poolSweepstakeRepository.findById).toHaveBeenCalledWith("2026-world-cup");
    expect(poolGuessRepository.findBySweepstake).toHaveBeenCalledWith("2026-world-cup");
  });
});
