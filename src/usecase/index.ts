import path from "path";
import {
  JsonStorage,
  JsonFileStorage,
  JsonAwsS3Storage,
  WithLoadCacheJsonFileStorage,
} from "../infra/JsonStorage";
import { UserRepository } from "../repository/UserRepository";
import {
  PoolSweepstakeRepository,
  FilePoolSweepstakeRepository,
} from "../repository/PoolSweepstakeRepository";
import { PoolGuessRepository } from "../repository/PoolGuessRepository";
import { TeamRepository } from "../repository/TeamRepository";
import {
  GroupListChampionshipRepository,
  FileGroupListChampionshipRepository,
} from "../repository/GroupListChampionshipRepository";
import {
  CupChampionshipRepository,
  FileCupChampionshipRepository,
} from "../repository/CupChampionshipRepository";
import { GetUserUsecase } from "./GetUserUsecase";
import { GetPoolSweepstakeUsecase } from "./GetPoolSweepstakeUsecase";
import { GetGroupListGuessResultFromPoolUsecase } from "./GetGroupListGuessResultFromPoolUsecase";
import { GuessGroupListFromPoolSweepstake } from "./GuessGroupListFromPoolSweepstake";
import { GetSweepstakeListUsecase } from "./GetSweepstakeListUsecase";
import { GetGroupListSweepstakeFromPoolUsecase } from "./GetGroupListSweepstakeFromPoolUsecase";
import { GetGroupListGuessRankListFromPoolRankListUsecase } from "./GetGroupListGuessRankListFromPoolRankListUsecase";
import { GetGroupListGuessFromPoolUsecase as GetGroupListGuessFromPoolUsecase } from "./GetGroupListGuessFromPoolUsecase";

import { GetCupSweepstakeFromPoolUsecase } from "./GetCupSweepstakeFromPoolUsecase";
import { GetCupGuessFromPoolUsecase } from "./GetCupGuessFromPoolUsecase";
import { GetCupGuessRankListFromPoolRankListUsecase } from "./GetCupGuessRankListFromPoolRankListUsecase";
import { GetCupGuessResultFromPoolUsecase } from "./GetCupGuessResultFromPoolUsecase";
import { GuessCupFromPoolSweepstake } from "./GuessCupFromPoolSweepstake";

// Shared storage instance
const storageType = process.env.JSON_STORAGE;

export const storage: JsonStorage =
  storageType === "AwsS3"
    ? new JsonAwsS3Storage()
    : new JsonFileStorage(
        path.join(
          process.cwd(),
          process.env.FILE_STORAGE_PATH || ".filestorage",
        ),
      );

export const teamRepository = new TeamRepository(
  new WithLoadCacheJsonFileStorage(storage),
);
export const userRepository = new UserRepository(storage);

export const cupChampionshipRepository: CupChampionshipRepository =
  new FileCupChampionshipRepository(storage, teamRepository);

export const groupListChampionshipRepository: GroupListChampionshipRepository =
  new FileGroupListChampionshipRepository(storage, teamRepository);

export const poolSweepstakeRepository: PoolSweepstakeRepository =
  new FilePoolSweepstakeRepository(
    new WithLoadCacheJsonFileStorage(storage),
    groupListChampionshipRepository,
    cupChampionshipRepository,
  );

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
export const getGroupListSweepstakeFromPoolUsecase =
  new GetGroupListSweepstakeFromPoolUsecase(poolSweepstakeRepository);

export const getGroupListGuessFromPoolUsecase =
  new GetGroupListGuessFromPoolUsecase(
    poolSweepstakeRepository,
    poolGuessRepository,
  );

export const getGroupListGuessRankListFromPoolRankListUsecase =
  new GetGroupListGuessRankListFromPoolRankListUsecase(
    poolSweepstakeRepository,
    poolGuessRepository,
    userRepository,
  );
export const getGroupListGuessResultFromPoolUsecase =
  new GetGroupListGuessResultFromPoolUsecase(
    poolSweepstakeRepository,
    poolGuessRepository,
    userRepository,
  );
export const guessGroupListFromPoolSweepstake =
  new GuessGroupListFromPoolSweepstake(poolGuessRepository, teamRepository);

export const getCupSweepstakeFromPoolUsecase =
  new GetCupSweepstakeFromPoolUsecase(poolSweepstakeRepository);

export const getCupGuessFromPoolUsecase = new GetCupGuessFromPoolUsecase(
  poolSweepstakeRepository,
  poolGuessRepository,
);

export const getCupGuessRankListFromPoolRankListUsecase =
  new GetCupGuessRankListFromPoolRankListUsecase(
    poolSweepstakeRepository,
    poolGuessRepository,
    userRepository,
  );

export const getCupGuessResultFromPoolUsecase =
  new GetCupGuessResultFromPoolUsecase(
    poolSweepstakeRepository,
    poolGuessRepository,
    userRepository,
  );

export const guessCupFromPoolSweepstake = new GuessCupFromPoolSweepstake(
  poolGuessRepository,
  teamRepository,
);
