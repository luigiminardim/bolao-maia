import { UserRepository } from "../repository/UserRepository";
import { UserDto, toUserDto } from "./dto/UserDto";

export class GetUserUsecase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: string): Promise<UserDto | null> {
    const user = await this.userRepository.findById(id);
    return user ? toUserDto(user) : null;
  }
}
