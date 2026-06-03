import { CupChampionship } from "../entity/Championship";
import { TeamRepository } from "./TeamRepository";
import { JsonFileStorage } from "../infra/JsonFileStorage";
import { BinaryTree } from "../utils/BinaryTree";
import { Team } from "../entity/Team";
import path from "path";

export interface CupChampionshipDao {
  id: string;
  root: BinaryTree<null | string>; // tree of team ids
  hasThirdPlaceMatch: boolean;
  thirdPlace: null | string;
}

async function mapTreeToEntity(
  node: BinaryTree<null | string>,
  teamRepository: TeamRepository,
): Promise<BinaryTree<null | Team>> {
  const team = node.elem ? await teamRepository.findById(node.elem) : null;
  const left = node.children[0]
    ? await mapTreeToEntity(node.children[0], teamRepository)
    : null;
  const right = node.children[1]
    ? await mapTreeToEntity(node.children[1], teamRepository)
    : null;
  return new BinaryTree<null | Team>(team, [left, right]);
}

function mapTreeToDao(
  node: BinaryTree<null | Team>,
): BinaryTree<null | string> {
  const teamId = node.elem ? node.elem.id : null;
  const left = node.children[0] ? mapTreeToDao(node.children[0]) : null;
  const right = node.children[1] ? mapTreeToDao(node.children[1]) : null;
  return new BinaryTree<null | string>(teamId, [left, right]);
}

export class CupChampionshipRepository {
  private readonly storage: JsonFileStorage;
  private readonly teamRepository: TeamRepository;

  constructor(storage?: JsonFileStorage, teamRepository?: TeamRepository) {
    this.storage =
      storage || new JsonFileStorage(path.join(process.cwd(), ".filestorage"));
    this.teamRepository = teamRepository || new TeamRepository();
  }

  async save(championship: CupChampionship): Promise<void> {
    const dao: CupChampionshipDao = {
      id: championship.id,
      root: mapTreeToDao(championship.root),
      hasThirdPlaceMatch: championship.hasThirdPlaceMatch,
      thirdPlace: championship.thirdPlace ? championship.thirdPlace.id : null,
    };
    await this.storage.save<CupChampionshipDao>(
      `/sweepstake/CupChampionship/${championship.id}`,
      dao,
    );
  }

  async findById(id: string): Promise<CupChampionship | null> {
    let dao = await this.storage.load<CupChampionshipDao>(
      `/sweepstake/CupChampionship/${id}`,
    );
    if (!dao) {
      if (id === "2026-world-cup") {
        dao = this.getMockedWorldCup2026();
      } else {
        return null;
      }
    }

    const root = await mapTreeToEntity(dao.root, this.teamRepository);
    const thirdPlace = dao.thirdPlace
      ? await this.teamRepository.findById(dao.thirdPlace)
      : null;

    return new CupChampionship(
      dao.id,
      root,
      dao.hasThirdPlaceMatch,
      thirdPlace,
    );
  }

  private getMockedWorldCup2026(): CupChampionshipDao {
    function createEmptyTree(height: number): BinaryTree<null | string> {
      if (height === 0) {
        return new BinaryTree<null | string>(null, [null, null]);
      }
      const left = createEmptyTree(height - 1);
      const right = createEmptyTree(height - 1);
      return new BinaryTree<null | string>(null, [left, right]);
    }

    return {
      id: "2026-world-cup",
      hasThirdPlaceMatch: true,
      thirdPlace: null,
      root: createEmptyTree(5), // Height 5 results in exactly 2^5 = 32 leaf nodes
    };
  }
}
