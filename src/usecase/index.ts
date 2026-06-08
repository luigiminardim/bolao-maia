import path from "path";
import { JsonStorage, JsonFileStorage, JsonAwsS3Storage } from "../infra/JsonStorage";
import { UserRepository } from "../repository/UserRepository";
import { PoolSweepstakeRepository, FilePoolSweepstakeRepository, MockPoolSweepstakeRepository } from "../repository/PoolSweepstakeRepository";
import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { TeamRepository } from "../repository/TeamRepository";
import { GroupListChampionshipRepository, FileGroupListChampionshipRepository, MockGroupListChampionshipRepository } from "../repository/GroupListChampionshipRepository";
import { CupChampionshipRepository, FileCupChampionshipRepository, MockCupChampionshipRepository } from "../repository/CupChampionshipRepository";
import { GetUserUsecase } from "./GetUserUsecase";
import { GetPoolSweepstakeUsecase } from "./GetPoolSweepstakeUsecase";
import { GetGroupListResultListFromPoolUsecase } from "./GetGroupListResultListFromPoolUsecase";
import { GuessGroupListFromPoolSweepstake } from "./GuessGroupListFromPoolSweepstake";
import { GetGroupListGuessFromPoolSweepstakeUsecase } from "./GetGroupListGuessFromPoolSweepstakeUsecase";
import { GetSweepstakeListUsecase } from "./GetSweepstakeListUsecase";

// Shared storage instance
const storageType = process.env.JSON_STORAGE;

export const storage: JsonStorage =
  storageType === "AwsS3"
    ? new JsonAwsS3Storage()
    : new JsonFileStorage(path.join(process.cwd(), process.env.FILE_STORAGE_PATH || ".filestorage"));

export const teamRepository = new TeamRepository();
export const userRepository = new UserRepository(storage);

export const cupChampionshipRepository: CupChampionshipRepository =
  storageType === "MOCK"
    ? new MockCupChampionshipRepository(teamRepository)
    : new FileCupChampionshipRepository(storage, teamRepository);

export const groupListChampionshipRepository: GroupListChampionshipRepository =
  storageType === "MOCK"
    ? new MockGroupListChampionshipRepository(teamRepository)
    : new FileGroupListChampionshipRepository(storage, teamRepository);

export const poolSweepstakeRepository: PoolSweepstakeRepository =
  storageType === "MOCK"
    ? new MockPoolSweepstakeRepository(groupListChampionshipRepository, cupChampionshipRepository)
    : new FilePoolSweepstakeRepository(storage, groupListChampionshipRepository, cupChampionshipRepository);

export const poolGuessRepository = new PoolGuessRepository(
  storage,
  teamRepository,
);

export const getUserUsecase = new GetUserUsecase(userRepository);
export const getPoolSweepstakeUsecase = new GetPoolSweepstakeUsecase(
  poolSweepstakeRepository,
);
export const getSweepstakeListUsecase = new GetSweepstakeListUsecase(
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

