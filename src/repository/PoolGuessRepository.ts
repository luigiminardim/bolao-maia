import {
  PoolGuess,
  PoolGuessItem,
  GroupListGuess,
  CupGuess,
  GroupGuess,
} from "../entity/Guess";
import { Team } from "../entity/Team";
import { BinaryTree } from "../utils/BinaryTree";
import { JsonFileStorage } from "../infra/JsonFileStorage";
import { TeamRepository } from "./TeamRepository";
import path from "path";

export interface GroupGuessDao {
  classification: string[]; // Team IDs
}

export interface GroupListGuessDao {
  userId: string;
  sweepstakeId: string;
  groupGuesses: GroupGuessDao[];
  extraQualifiedListGuess: string[]; // Team IDs
}

export interface CupGuessDao {
  userId: string;
  sweepstakeId: string;
  root: BinaryTree<string>; // BinaryTree of Team IDs
  thirdPlace: string | null; // Team ID or null
}

export type PoolGuessItemDao =
  | { kind: "group"; groupGuess: GroupListGuessDao }
  | { kind: "cup"; cupGuess: CupGuessDao };

export interface PoolGuessDao {
  userId: string;
  sweepstakeId: string;
  subGuesses: PoolGuessItemDao[];
}

function serializeGroupGuess(groupGuess: GroupGuess): GroupGuessDao {
  return {
    classification: groupGuess.classification.map((team) => team.id),
  };
}

function serializeGroupListGuess(
  groupListGuess: GroupListGuess,
): GroupListGuessDao {
  return {
    userId: groupListGuess.userId,
    sweepstakeId: groupListGuess.sweepstakeId,
    groupGuesses: groupListGuess.groupGuesses.map(serializeGroupGuess),
    extraQualifiedListGuess: groupListGuess.extraQualifiedListGuess.map(
      (team) => team.id,
    ),
  };
}

function serializeCupGuessTree(tree: BinaryTree<Team>): BinaryTree<string> {
  const left = tree.children[0]
    ? serializeCupGuessTree(tree.children[0])
    : null;
  const right = tree.children[1]
    ? serializeCupGuessTree(tree.children[1])
    : null;
  return new BinaryTree<string>(tree.elem.id, [left, right]);
}

function serializeCupGuess(cupGuess: CupGuess): CupGuessDao {
  return {
    userId: cupGuess.userId,
    sweepstakeId: cupGuess.sweepstakeId,
    root: serializeCupGuessTree(cupGuess.root),
    thirdPlace: cupGuess.thirdPlace ? cupGuess.thirdPlace.id : null,
  };
}

async function deserializeGroupGuess(
  dao: GroupGuessDao,
  teamRepository: TeamRepository,
): Promise<GroupGuess> {
  const classification: Team[] = [];
  for (const teamId of dao.classification) {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new Error(`Team not found: ${teamId}`);
    }
    classification.push(team);
  }
  return new GroupGuess(classification);
}

async function deserializeGroupListGuess(
  dao: GroupListGuessDao,
  teamRepository: TeamRepository,
): Promise<GroupListGuess> {
  const groupGuesses: GroupGuess[] = [];
  for (const groupGuessDao of dao.groupGuesses) {
    groupGuesses.push(
      await deserializeGroupGuess(groupGuessDao, teamRepository),
    );
  }
  const extraQualifiedListGuess: Team[] = [];
  for (const teamId of dao.extraQualifiedListGuess) {
    const team = await teamRepository.findById(teamId);
    if (!team) {
      throw new Error(`Team not found: ${teamId}`);
    }
    extraQualifiedListGuess.push(team);
  }
  return new GroupListGuess(
    dao.userId,
    dao.sweepstakeId,
    groupGuesses,
    extraQualifiedListGuess,
  );
}

async function deserializeCupGuessTree(
  tree: BinaryTree<string>,
  teamRepository: TeamRepository,
): Promise<BinaryTree<Team>> {
  const team = await teamRepository.findById(tree.elem);
  if (!team) {
    throw new Error(`Team not found: ${tree.elem}`);
  }
  const left = tree.children[0]
    ? await deserializeCupGuessTree(tree.children[0], teamRepository)
    : null;
  const right = tree.children[1]
    ? await deserializeCupGuessTree(tree.children[1], teamRepository)
    : null;
  return new BinaryTree<Team>(team, [left, right]);
}

async function deserializeCupGuess(
  dao: CupGuessDao,
  teamRepository: TeamRepository,
): Promise<CupGuess> {
  const root = await deserializeCupGuessTree(dao.root, teamRepository);
  const thirdPlace = dao.thirdPlace
    ? await teamRepository.findById(dao.thirdPlace)
    : null;
  if (dao.thirdPlace && !thirdPlace) {
    throw new Error(`Third place team not found: ${dao.thirdPlace}`);
  }
  return new CupGuess(dao.userId, dao.sweepstakeId, root, thirdPlace);
}

export class PoolGuessRepository {
  private readonly storage: JsonFileStorage;
  private readonly teamRepository: TeamRepository;

  constructor(storage?: JsonFileStorage, teamRepository?: TeamRepository) {
    this.storage =
      storage || new JsonFileStorage(path.join(process.cwd(), ".filestorage"));
    this.teamRepository = teamRepository || new TeamRepository();
  }

  private getStorageId(userId: string, sweepstakeId: string): string {
    const encodedUser = encodeURIComponent(userId);
    const encodedSweepstake = encodeURIComponent(sweepstakeId);
    return `/sweepstake/PoolGuess/user=${encodedUser}&sweepstake=${encodedSweepstake}`;
  }

  async save(poolGuess: PoolGuess): Promise<void> {
    const subGuessesDao: PoolGuessItemDao[] = [];

    for (const subGuess of poolGuess.subGuesses) {
      if (subGuess.kind === "group") {
        subGuessesDao.push({
          kind: "group",
          groupGuess: serializeGroupListGuess(subGuess.groupGuess),
        });
      } else if (subGuess.kind === "cup") {
        subGuessesDao.push({
          kind: "cup",
          cupGuess: serializeCupGuess(subGuess.cupGuess),
        });
      }
    }

    const dao: PoolGuessDao = {
      userId: poolGuess.userId,
      sweepstakeId: poolGuess.sweepstakeId,
      subGuesses: subGuessesDao,
    };

    const id = this.getStorageId(poolGuess.userId, poolGuess.sweepstakeId);
    await this.storage.save<PoolGuessDao>(id, dao);
  }

  async findByUserAndSweepstake(
    userId: string,
    sweepstakeId: string,
  ): Promise<PoolGuess | null> {
    const id = this.getStorageId(userId, sweepstakeId);
    const dao = await this.storage.load<PoolGuessDao>(id);
    if (!dao) {
      return null;
    }
    return this.mapToEntity(dao);
  }

  async findByUser(userId: string): Promise<PoolGuess[]> {
    const encodedUser = encodeURIComponent(userId);
    const prefix = `user=${encodedUser}&`;
    const ids = await this.storage.listIds(
      "/sweepstake/PoolGuess",
      (filename) => filename.startsWith(prefix),
    );

    const guesses: PoolGuess[] = [];
    for (const id of ids) {
      const dao = await this.storage.load<PoolGuessDao>(id);
      if (dao) {
        guesses.push(await this.mapToEntity(dao));
      }
    }
    return guesses;
  }

  async findBySweepstake(sweepstakeId: string): Promise<PoolGuess[]> {
    const encodedSweepstake = encodeURIComponent(sweepstakeId);
    const suffix = `&sweepstake=${encodedSweepstake}.json`;
    const ids = await this.storage.listIds(
      "/sweepstake/PoolGuess",
      (filename) => filename.endsWith(suffix),
    );

    const guesses: PoolGuess[] = [];
    for (const id of ids) {
      const dao = await this.storage.load<PoolGuessDao>(id);
      if (dao) {
        guesses.push(await this.mapToEntity(dao));
      }
    }
    return guesses;
  }

  private async mapToEntity(dao: PoolGuessDao): Promise<PoolGuess> {
    const subGuesses: PoolGuessItem[] = [];

    for (const subGuessDao of dao.subGuesses) {
      if (subGuessDao.kind === "group") {
        subGuesses.push({
          kind: "group",
          groupGuess: await deserializeGroupListGuess(
            subGuessDao.groupGuess,
            this.teamRepository,
          ),
        });
      } else if (subGuessDao.kind === "cup") {
        subGuesses.push({
          kind: "cup",
          cupGuess: await deserializeCupGuess(
            subGuessDao.cupGuess,
            this.teamRepository,
          ),
        });
      }
    }

    return new PoolGuess(dao.userId, dao.sweepstakeId, subGuesses);
  }
}
