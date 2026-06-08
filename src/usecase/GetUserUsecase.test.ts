import { GetUserUsecase } from "./GetUserUsecase";
import { UserRepository } from "../repository/UserRepository";
import { User } from "../entity/User";
import { toUserDto } from "./dto/UserDto";

describe("GetUserUsecase", () => {
  let userRepository: jest.Mocked<UserRepository>;
  let usecase: GetUserUsecase;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
    usecase = new GetUserUsecase(userRepository);
  });

  it("should return the user if found", async () => {
    const mockUser = new User("luigi mario");
    userRepository.findById.mockResolvedValueOnce(mockUser);

    const result = await usecase.execute("luigi%20mario");

    expect(result).toEqual(toUserDto(mockUser));
    expect(userRepository.findById).toHaveBeenCalledWith("luigi%20mario");
  });

  it("should return null if user is not found", async () => {
    userRepository.findById.mockResolvedValueOnce(null);

    const result = await usecase.execute("unknown%20user");

    expect(result).toBeNull();
    expect(userRepository.findById).toHaveBeenCalledWith("unknown%20user");
  });
});
