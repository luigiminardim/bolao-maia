import { CupChampionship } from "../../entity/Championship";
import { BinaryTree, BinaryTreeDao } from "../../utils/BinaryTree";
import { TeamRepository } from "../TeamRepository";

export interface CupChampionshipDao {
  id: string;
  name: string;
  root: BinaryTreeDao<null | string>; // tree of team ids
  hasThirdPlaceMatch: boolean;
  thirdPlace: null | string;
  startDate: string; // ISO
}

export class CupChampionshipDaoBuilder {
  toDao(championship: CupChampionship): CupChampionshipDao {
    return {
      id: championship.getId(),
      name: championship.getName(),
      root: BinaryTree.toDto(championship.root, (t) => (t ? t.id : null)),
      hasThirdPlaceMatch: championship.hasThirdPlaceMatch,
      thirdPlace: championship.thirdPlace ? championship.thirdPlace.id : null,
      startDate: championship.getStartDate().toISOString(),
    };
  }

  async toCupChampionship(
    dao: CupChampionshipDao,
    teamRepository: TeamRepository,
  ): Promise<CupChampionship> {
    const root = await BinaryTree.fromDtoAsync(
      dao.root as BinaryTreeDao<null | string>,
      async (teamId) => (teamId ? await teamRepository.findById(teamId) : null),
    );
    const thirdPlace = dao.thirdPlace
      ? await teamRepository.findById(dao.thirdPlace)
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
