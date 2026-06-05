import { User } from "../entity/User";
import { UserRepository } from "../repository/UserRepository";

export class LoginUsecase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(name: string): Promise<User | null> {
    const id = encodeURIComponent(name);
    return this.userRepository.findById(id);
  }
}
