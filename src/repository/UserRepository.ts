import { User } from "../entity/User";
import { JsonFileStorage } from "../infra/JsonFileStorage";
import path from "path";

export interface UserDao {
  email: string;
  name: string;
}

export class UserRepository {
  private readonly storage: JsonFileStorage;

  constructor(storage?: JsonFileStorage) {
    this.storage = storage || new JsonFileStorage(path.join(process.cwd(), ".filestorage"));
  }

  async save(user: User): Promise<void> {
    const encodedEmail = encodeURIComponent(user.email);
    const id = `/user/user/${encodedEmail}`;
    const data: UserDao = {
      email: user.email,
      name: user.name,
    };
    await this.storage.save<UserDao>(id, data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const encodedEmail = encodeURIComponent(email);
    const id = `/user/user/${encodedEmail}`;
    const data = await this.storage.load<UserDao>(id);
    if (!data) {
      return null;
    }
    return new User(data.email, data.name);
  }
}
