import { CupChampionship } from "../entity/Championship";
import { TeamRepository } from "./TeamRepository";
import { JsonStorage, JsonFileStorage } from "../infra/JsonStorage";
import { BinaryTree, BinaryTreeDao } from "../utils/BinaryTree";
import path from "path";

export interface CupChampionshipDao {
  id: string;
  name: string;
  root: BinaryTreeDao<null | string>; // tree of team ids
  hasThirdPlaceMatch: boolean;
  thirdPlace: null | string;
  startDate: string; // ISO
}

export interface CupChampionshipRepository {
  save(championship: CupChampionship): Promise<void>;
  findById(id: string): Promise<CupChampionship | null>;
}

export const CUP_CHAMPIONSHIP_MOCK_DAO: CupChampionshipDao = {
  id: "2026-world-cup",
  name: "Copa do Mundo FIFA 2026",
  hasThirdPlaceMatch: true,
  thirdPlace: null,
  root: (function createEmptyTree(
    height: number,
  ): BinaryTreeDao<null | string> {
    if (height === 0) {
      return { elem: null, children: [null, null] };
    }
    const left = createEmptyTree(height - 1);
    const right = createEmptyTree(height - 1);
    return { elem: null, children: [left, right] };
  })(5), // Height 5 results in exactly 2^5 = 32 leaf nodes
  startDate: "2026-06-11T12:00:00.000Z",
};

export class FileCupChampionshipRepository implements CupChampionshipRepository {
  private readonly storage: JsonStorage;
  private readonly teamRepository: TeamRepository;

  constructor(storage?: JsonStorage, teamRepository?: TeamRepository) {
    this.storage =
      storage || new JsonFileStorage(path.join(process.cwd(), ".filestorage"));
    this.teamRepository = teamRepository || new TeamRepository();
  }

  async save(championship: CupChampionship): Promise<void> {
    const dao: CupChampionshipDao = {
      id: championship.getId(),
      name: championship.getName(),
      root: BinaryTree.toDto(championship.root, (t) => (t ? t.id : null)),
      hasThirdPlaceMatch: championship.hasThirdPlaceMatch,
      thirdPlace: championship.thirdPlace ? championship.thirdPlace.id : null,
      startDate: championship.getStartDate().toISOString(),
    };
    await this.storage.save<CupChampionshipDao>(
      `/sweepstake/CupChampionship/${championship.getId()}`,
      dao,
    );
  }

  async findById(id: string): Promise<CupChampionship | null> {
    if (id !== "2026-world-cup") {
      return null;
    }
    const dao = CUP_CHAMPIONSHIP_MOCK_DAO;

    const root = await BinaryTree.fromDtoAsync(dao.root, async (teamId) =>
      teamId ? await this.teamRepository.findById(teamId) : null,
    );
    const thirdPlace = dao.thirdPlace
      ? await this.teamRepository.findById(dao.thirdPlace)
      : null;

    return new CupChampionship(
      dao.id,
      dao.name,
      root,
      dao.hasThirdPlaceMatch,
      thirdPlace,
      new Date(dao.startDate),
    );
  }
}

export class MockCupChampionshipRepository implements CupChampionshipRepository {
  private readonly teamRepository: TeamRepository;

  constructor(teamRepository?: TeamRepository) {
    this.teamRepository = teamRepository || new TeamRepository();
  }

  async save(_championship: CupChampionship): Promise<void> {
    // Mock save does nothing
  }

  async findById(id: string): Promise<CupChampionship | null> {
    const dao = CUP_CHAMPIONSHIP_MOCK_DAO;

    function fillTree(node: BinaryTreeDao<null | string>) {
      if (
        !node.children ||
        (node.children[0] === null && node.children[1] === null)
      ) {
        node.elem = "brazil";
        return;
      }
      if (node.children[0]) fillTree(node.children[0]);
      if (node.children[1]) fillTree(node.children[1]);
    }

    if (id === "test-status-draft") {
      dao.startDate = new Date(Date.now() + 1000000000).toISOString();
      dao.name = "Test Draft Status of Cup";
      // Leaves empty (null) so it returns draft status
    } else if (id === "test-status-waiting") {
      dao.startDate = new Date(Date.now() + 1000000000).toISOString();
      dao.name = "Test Waiting Status of Cup";
      fillTree(dao.root);
    } else if (id === "test-status-running") {
      dao.startDate = new Date(Date.now() - 1000000000).toISOString();
      dao.name = "Test Running Status of Cup";
      fillTree(dao.root);
    } else {
      return null;
    }

    const root = await BinaryTree.fromDtoAsync(
      dao.root as BinaryTreeDao<null | string>,
      async (teamId) =>
        teamId ? await this.teamRepository.findById(teamId) : null,
    );
    const thirdPlace = dao.thirdPlace
      ? await this.teamRepository.findById(dao.thirdPlace)
      : null;

    return new CupChampionship(
      id,
      dao.name,
      root,
      dao.hasThirdPlaceMatch,
      thirdPlace,
      new Date(dao.startDate),
    );
  }
}
