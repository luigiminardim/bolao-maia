import { GetPoolSweepstakeUsecase } from "./GetPoolSweepstakeUsecase";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { PoolSweepstake } from "../entity/Sweepstake";
import { toPoolSweepstakeDto } from "./dto/SweepstakeDto";

describe("GetPoolSweepstakeUsecase", () => {
  let poolSweepstakeRepository: jest.Mocked<PoolSweepstakeRepository>;
  let usecase: GetPoolSweepstakeUsecase;

  beforeEach(() => {
    poolSweepstakeRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<PoolSweepstakeRepository>;
    usecase = new GetPoolSweepstakeUsecase(poolSweepstakeRepository);
  });

  it("should return the pool sweepstake if found", async () => {
    const mockPool = new PoolSweepstake("2026-world-cup", []);
    poolSweepstakeRepository.findById.mockResolvedValueOnce(mockPool);

    const result = await usecase.execute("2026-world-cup");

    expect(result).toEqual(toPoolSweepstakeDto(mockPool));
    expect(poolSweepstakeRepository.findById).toHaveBeenCalledWith("2026-world-cup");
  });

  it("should return null if not found", async () => {
    poolSweepstakeRepository.findById.mockResolvedValueOnce(null);

    const result = await usecase.execute("unknown");

    expect(result).toBeNull();
    expect(poolSweepstakeRepository.findById).toHaveBeenCalledWith("unknown");
  });
});
