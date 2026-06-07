import path from "path";
import { JsonFileStorage } from "../infra/JsonFileStorage";
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

// Shared storage instance pointing to .filestorage
export const storage = new JsonFileStorage(
  path.join(process.cwd(), ".filestorage"),
);

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
