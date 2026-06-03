import fs from "fs/promises";
import path from "path";

export class JsonFileStorage {
  private readonly basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || path.join(process.cwd(), "data");
  }

  private getFilePath(id: string): string {
    // Remove leading and trailing slashes to keep the path relative to basePath
    const cleanId = id.replace(/^\/+|\/+$/g, "");
    return path.join(this.basePath, `${cleanId}.json`);
  }

  async save<T>(id: string, data: T): Promise<void> {
    const filePath = this.getFilePath(id);
    // Ensure the parent directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    // Write formatted JSON to file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async load<T>(id: string): Promise<T | null> {
    const filePath = this.getFilePath(id);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }
}
