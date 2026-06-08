import {
  CupSweepstake,
  GroupListSweepstake,
  PoolSweepstake,
} from "../../entity/Sweepstake";
import { TeamDto, toTeamDto } from "./TeamDto";
import { BinaryTreeDao, BinaryTree } from "../../utils/BinaryTree";

export interface GroupListSweepstakeDto {
  id: string;
  status: "draft" | "open" | "locked";
  startDate: string;
  maxRegularQualifiedPosition: number;
  extraQualifiedLength: number;
  groups: {
    id: string;
    classification: (TeamDto | null)[];
  }[];
  extraQualifiedList: (TeamDto | null)[];
}

export function toGroupListSweepstakeDto(
  sweepstake: GroupListSweepstake,
): GroupListSweepstakeDto {
  const championship = sweepstake.championship;
  return {
    id: sweepstake.id,
    status: sweepstake.getStatus(),
    startDate: championship.getStartDate().toISOString(),
    maxRegularQualifiedPosition: championship.maxRegularQualifiedPosition,
    extraQualifiedLength: championship.getExtraQualifiedList().length,
    groups: championship.getGroups().map((g) => ({
      id: g.getId(),
      classification: g.classification.map((t) => (t ? toTeamDto(t) : null)),
    })),
    extraQualifiedList: championship
      .getExtraQualifiedList()
      .map((t) => (t ? toTeamDto(t) : null)),
  };
}

export interface CupChampionshipDto {
  id: string;
  hasThirdPlaceMatch: boolean;
  thirdPlace: TeamDto | null;
  startDate: string;
  root: BinaryTreeDao<TeamDto | null>;
}

export interface CupSweepstakeDto {
  id: string;
  status: "draft" | "open" | "locked";
  startDate: string;
  championship: CupChampionshipDto;
}

export function toCupSweepstakeDto(
  sweepstake: CupSweepstake,
): CupSweepstakeDto {
  const championship = sweepstake.championship;
  return {
    id: sweepstake.id,
    status: sweepstake.getStatus(),
    startDate: championship.getStartDate().toISOString(),
    championship: {
      id: championship.getId(),
      hasThirdPlaceMatch: championship.hasThirdPlaceMatch,
      thirdPlace: championship.thirdPlace
        ? toTeamDto(championship.thirdPlace)
        : null,
      startDate: championship.getStartDate().toISOString(),
      root: BinaryTree.toDto(championship.root, (t) =>
        t ? toTeamDto(t) : null,
      ),
    },
  };
}

export type PoolSweepstakeItemDto =
  | { kind: "group"; sweepstake: GroupListSweepstakeDto; factor: number }
  | { kind: "cup"; sweepstake: CupSweepstakeDto; factor: number };

export interface PoolSweepstakeDto {
  id: string;
  subSweepstakeList: PoolSweepstakeItemDto[];
}

export function toPoolSweepstakeDto(pool: PoolSweepstake): PoolSweepstakeDto {
  return {
    id: pool.id,
    subSweepstakeList: pool.subSweepstakeList.map((item) => {
      if (item.kind === "group") {
        return {
          kind: "group",
          factor: item.factor,
          sweepstake: toGroupListSweepstakeDto(item.sweepstake),
        };
      } else {
        return {
          kind: "cup",
          factor: item.factor,
          sweepstake: toCupSweepstakeDto(item.sweepstake),
        };
      }
    }),
  };
}

export type SweepstakeDto =
  | { kind: "pool"; pool: PoolSweepstakeDto }
  | { kind: "cup"; cup: CupSweepstakeDto }
  | { kind: "groupList"; groupList: GroupListSweepstakeDto };
