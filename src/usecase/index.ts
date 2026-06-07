import path from "path";
import { JsonStorage, JsonFileStorage, JsonAwsS3Storage } from "../infra/JsonStorage";
import { UserRepository } from "../repository/UserRepository";
import { PoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { TeamRepository } from "../repository/TeamRepository";
import { GroupListChampionshipRepository } from "../repository/GroupListChampionshipRepository";
import { GetUserUsecase } from "./GetUserUsecase";
import { GetPoolSweepstakeUsecase } from "./GetPoolSweepstakeUsecase";
import { GetGroupListResultListFromPoolUsecase } from "./GetGroupListResultListFromPoolUsecase";
import { GuessGroupListFromPoolSweepstake } from "./GuessGroupListFromPoolSweepstake";
import { GetGroupListGuessFromPoolSweepstakeUsecase } from "./GetGroupListGuessFromPoolSweepstakeUsecase";

// Shared storage instance
const storageType = process.env.JSON_STORAGE;

export const storage: JsonStorage =
  storageType === "AwsS3"
    ? new JsonAwsS3Storage()
    : new JsonFileStorage(path.join(process.cwd(), process.env.FILE_STORAGE_PATH || ".filestorage"));

export const teamRepository = new TeamRepository();
export const userRepository = new UserRepository(storage);
export const groupListChampionshipRepository =
  new GroupListChampionshipRepository(storage, teamRepository);

export const poolSweepstakeRepository = new PoolSweepstakeRepository(
  storage,
  groupListChampionshipRepository,
);

export const poolGuessRepository = new PoolGuessRepository(
  storage,
  teamRepository,
);

export const getUserUsecase = new GetUserUsecase(userRepository);
export const getPoolSweepstakeUsecase = new GetPoolSweepstakeUsecase(
  poolSweepstakeRepository,
);
export const getGroupListResultListFromPoolUsecase =
  new GetGroupListResultListFromPoolUsecase(
    poolSweepstakeRepository,
    poolGuessRepository,
    userRepository,
  );
export const guessGroupListFromPoolSweepstake =
  new GuessGroupListFromPoolSweepstake(poolGuessRepository, teamRepository);
export const getGroupListGuessFromPoolUsecase =
  new GetGroupListGuessFromPoolSweepstakeUsecase(poolGuessRepository);
