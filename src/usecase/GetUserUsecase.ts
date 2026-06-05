import { User } from "../entity/User";
import { UserRepository } from "../repository/UserRepository";

export class GetUserUsecase {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
