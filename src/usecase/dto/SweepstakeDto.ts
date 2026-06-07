import { GroupListSweepstake, PoolSweepstake } from "../../entity/Sweepstake";
import { TeamDto, toTeamDto } from "./TeamDto";

export interface GroupListSweepstakeDto {
  id: string;
  startTime: string;
  maxRegularQualifiedPosition: number;
  extraQualifiedLength: number;
  groups: {
    id: string;
    classification: TeamDto[];
  }[];
  extraQualifiedList: (TeamDto | null)[];
}

export function toGroupListSweepstakeDto(
  sweepstake: GroupListSweepstake,
): GroupListSweepstakeDto {
  const championship = sweepstake.championship;
  return {
    id: sweepstake.id,
    startTime: sweepstake.startTime.toISOString(),
    maxRegularQualifiedPosition: championship.maxRegularQualifiedPosition,
    extraQualifiedLength: championship.getExtraQualifiedList().length,
    groups: championship.getGroups().map((g) => ({
      id: g.id,
      classification: g.classification.map(toTeamDto),
    })),
    extraQualifiedList: championship
      .getExtraQualifiedList()
      .map((t) => (t ? toTeamDto(t) : null)),
  };
}

export type PoolSweepstakeItemDto = {
  kind: "group";
  sweepstake: GroupListSweepstakeDto;
  factor: number;
};

export interface PoolSweepstakeDto {
  id: string;
  subSweepstakeList: PoolSweepstakeItemDto[];
}

export function toPoolSweepstakeDto(pool: PoolSweepstake): PoolSweepstakeDto {
  return {
    id: pool.id,
    subSweepstakeList: pool.subSweepstakeList.flatMap((item) => {
      if (item.kind === "group") {
        return [
          {
            kind: "group",
            factor: item.factor,
            sweepstake: toGroupListSweepstakeDto(item.sweepstake),
          },
        ];
      } else {
        return [];
      }
    }),
  };
}
