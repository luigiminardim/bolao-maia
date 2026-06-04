import { User } from "../entity/User";
import { JsonFileStorage } from "../infra/JsonFileStorage";

export interface UserDao {
  name: string;
}

export class UserRepository {
  private readonly storage: JsonFileStorage;

  constructor(storage: JsonFileStorage) {
    this.storage = storage;
  }

  async save(user: User): Promise<void> {
    const id = `/user/user/${user.id()}`;
    const data: UserDao = {
      name: user.name(),
    };
    await this.storage.save<UserDao>(id, data);
  }

  async findById(id: string): Promise<User | null> {
    const storageId = `/user/user/${id}`;
    const data = await this.storage.load<UserDao>(storageId);
    if (!data) {
      return null;
    }
    return new User(data.name);
  }
}
