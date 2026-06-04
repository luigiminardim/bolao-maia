import { JsonFileStorage } from "../infra/JsonFileStorage";

export interface PasswordAuthDao {
  email: string;
  saltedHashPassword: string;
}

export class AuthRepository {
  private readonly storage: JsonFileStorage;

  constructor(storage: JsonFileStorage) {
    this.storage = storage;
  }

  async save(email: string, saltedHashPassword: string): Promise<void> {
    const encodedEmail = encodeURIComponent(email);
    const id = `/auth/passwordAuth/${encodedEmail}`;
    await this.storage.save<PasswordAuthDao>(id, { email, saltedHashPassword });
  }

  async findByEmail(email: string): Promise<PasswordAuthDao | null> {
    const encodedEmail = encodeURIComponent(email);
    const id = `/auth/passwordAuth/${encodedEmail}`;
    return this.storage.load<PasswordAuthDao>(id);
  }
}
