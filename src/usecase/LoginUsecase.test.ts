import { LoginUsecase } from "./LoginUsecase";
import { UserRepository } from "../repository/UserRepository";
import { User } from "../entity/User";

describe("LoginUsecase", () => {
  let userRepository: jest.Mocked<UserRepository>;
  let usecase: LoginUsecase;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    usecase = new LoginUsecase(userRepository);
  });

  it("should return the user if found", async () => {
    const mockUser = new User("luigi mario");
    userRepository.findById.mockResolvedValueOnce(mockUser);

    const result = await usecase.execute("luigi mario");

    expect(result).toBe(mockUser);
    expect(userRepository.findById).toHaveBeenCalledWith("luigi%20mario");
  });

  it("should return null if user is not found", async () => {
    userRepository.findById.mockResolvedValueOnce(null);

    const result = await usecase.execute("unknown user");

    expect(result).toBeNull();
    expect(userRepository.findById).toHaveBeenCalledWith("unknown%20user");
  });
});
