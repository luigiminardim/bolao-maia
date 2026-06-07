import fs from "fs/promises";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command
} from "@aws-sdk/client-s3";

export interface JsonStorage {
  save<T>(id: string, data: T): Promise<void>;
  load<T>(id: string): Promise<T | null>;
  listIds(dir: string, filter?: (filename: string) => boolean): Promise<string[]>;
}

export class JsonFileStorage implements JsonStorage {
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

  async listIds(
    dir: string,
    filter?: (filename: string) => boolean,
  ): Promise<string[]> {
    const cleanDir = dir.replace(/^\/+|\/+$/g, "");
    const dirPath = path.join(this.basePath, cleanDir);
    try {
      const files = await fs.readdir(dirPath);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));
      const filtered = filter ? jsonFiles.filter(filter) : jsonFiles;
      return filtered.map((file) => {
        const nameWithoutExt = path.basename(file, ".json");
        return `/${cleanDir}/${nameWithoutExt}`;
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }
}

export class JsonAwsS3Storage implements JsonStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly prefix: string;

  constructor(bucket?: string, prefix?: string, region?: string) {
    this.bucket = bucket || process.env.AWS_S3_BUCKET || "my-default-bucket";
    this.prefix = prefix || "";
    this.client = new S3Client({ region: region || process.env.AWS_REGION || "us-east-1" });
  }

  private getKey(id: string): string {
    const cleanId = id.replace(/^\/+|\/+$/g, "");
    const fullPath = this.prefix ? `${this.prefix}/${cleanId}.json` : `${cleanId}.json`;
    return fullPath;
  }

  async save<T>(id: string, data: T): Promise<void> {
    const key = this.getKey(id);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
    });
    await this.client.send(command);
  }

  async load<T>(id: string): Promise<T | null> {
    const key = this.getKey(id);
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    try {
      const response = await this.client.send(command);
      if (!response.Body) return null;
      const content = await response.Body.transformToString();
      return JSON.parse(content) as T;
    } catch (err) {
      const error = err as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async listIds(dir: string, filter?: (filename: string) => boolean): Promise<string[]> {
    const cleanDir = dir.replace(/^\/+|\/+$/g, "");
    const directoryPrefix = this.prefix ? `${this.prefix}/${cleanDir}/` : `${cleanDir}/`;
    
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: directoryPrefix,
    });
    
    try {
      const response = await this.client.send(command);
      if (!response.Contents) return [];
      
      const files = response.Contents.map(obj => obj.Key || "").filter(key => key.endsWith(".json"));
      const filtered = filter ? files.filter(filter) : files;
      
      return filtered.map(file => {
        // Remove prefix and directory from the key to just get the filename
        const filename = file.replace(directoryPrefix, "");
        const nameWithoutExt = path.basename(filename, ".json");
        return `/${cleanDir}/${nameWithoutExt}`;
      });
    } catch (err) {
      const error = err as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (error.name === "NoSuchBucket" || error.$metadata?.httpStatusCode === 404) {
        return [];
      }
      throw error;
    }
  }
}
